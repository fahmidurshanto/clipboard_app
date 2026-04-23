import { BrowserWindow, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Hard state tracker
let isAppVisible = false;

export function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    backgroundColor: '#0f0f1a',
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  win.on('blur', () => {
    win.hide();
    isAppVisible = false;
  });

  return win;
}

export function toggleWindow(win) {
  if (isAppVisible) {
    win.hide();
    isAppVisible = false;
  } else {
    // 🚀 NEW: Tell the window to refresh its data every time it opens
    if (win && win.webContents) {
      win.webContents.send('window-shown');
    }

    const { x, y } = screen.getCursorScreenPoint();
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    let windowX = x;
    let windowY = y;

    if (x + 400 > width) windowX = width - 410;
    if (y + 600 > height) windowY = height - 610;

    win.setPosition(windowX, windowY);
    win.show();
    win.focus();
    win.setAlwaysOnTop(true, 'screen-saver');
    
    isAppVisible = true;
  }
}
