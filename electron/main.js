import { app, BrowserWindow, globalShortcut, clipboard } from 'electron';
import express from 'express';
import cors from 'cors';
import { createWindow, toggleWindow } from './window.js';
import { setupTray } from './tray.js';
import { startWatcher } from './clipboardWatcher.js';
import { storage } from './storage.js';

// --- EXPRESS BACKEND ---
const server = express();
const PORT = 3001;

server.use(cors());
server.use(express.json({ limit: '50mb' }));

// Endpoints
server.get('/history', (req, res) => {
  res.json(storage.getHistory());
});

server.post('/copy', (req, res) => {
  const { content } = req.body;
  if (content) {
    clipboard.writeText(content);
    if (mainWindow) mainWindow.hide();
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'No content provided' });
  }
});

server.post('/delete', (req, res) => {
  const { id } = req.body;
  storage.deleteItem(id);
  res.json({ success: true });
});

server.post('/pin', (req, res) => {
  const { id } = req.body;
  storage.togglePin(id);
  res.json({ success: true });
});

server.post('/clear', (req, res) => {
  storage.clearAll();
  res.json({ success: true });
});

server.listen(PORT, () => {
  console.log(`📡 [BACKEND] Express server running on http://localhost:${PORT}`);
});
// -----------------------

// Disable GPU and Sandbox
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('no-sandbox');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = createWindow();
  setupTray(mainWindow);
  startWatcher();

  const shortcuts = ['Shift+Meta+V', 'Meta+Shift+V', 'Super+Shift+V', 'Alt+V'];
  let registeredShortcut = null;

  for (const s of shortcuts) {
    if (globalShortcut.register(s, () => {
      console.log(`Shortcut ${s} triggered!`);
      toggleWindow(mainWindow);
      // Notify UI via IPC for backward compatibility or use the fetch in UI
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('window-shown');
      }
    })) {
      registeredShortcut = s;
      console.log(`✅ Success! Registered shortcut: ${s}`);
      break;
    }
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
