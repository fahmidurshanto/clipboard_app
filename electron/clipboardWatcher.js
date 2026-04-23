import { clipboard, Notification, BrowserWindow } from 'electron';
import { storage } from './storage.js';
import { execSync } from 'child_process';

function getLinuxClipboard(type = 'text') {
  try {
    const isWayland = process.env.XDG_SESSION_TYPE === 'wayland' || process.env.WAYLAND_DISPLAY;
    if (type === 'image') {
      const cmd = isWayland ? 'wl-paste -t image/png' : 'xclip -selection clipboard -t image/png -o';
      return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'], timeout: 500 }).toString('base64');
    }
    const cmd = isWayland ? 'wl-paste -n' : 'xclip -o -selection clipboard';
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'], timeout: 500 }).toString().trim();
  } catch (e) {
    return null;
  }
}

export function startWatcher() {
  let lastText = '';
  let lastImageHash = '';

  console.log('🚀 Clipboard Watcher Started (Interval: 400ms)');

  setInterval(() => {
    try {
      // 1. CHECK TEXT
      let currentText = clipboard.readText();
      if (!currentText) currentText = getLinuxClipboard('text');

      if (currentText && currentText !== lastText) {
        console.log('📋 [WATCHER] New Text Detected:', currentText.substring(0, 30) + '...');
        lastText = currentText;
        const newItem = storage.addItem({ type: 'text', content: currentText });
        
        // BROADCAST to all windows
        BrowserWindow.getAllWindows().forEach(win => {
          if (!win.isDestroyed()) {
            win.webContents.send('clipboard-update', newItem);
          }
        });
        
        notify('Text Copied', currentText);
        return; 
      }

      // 2. CHECK IMAGE
      const image = clipboard.readImage();
      if (!image.isEmpty()) {
        const imageData = image.toDataURL();
        const imageHash = imageData.substring(0, 100); 
        if (imageHash !== lastImageHash) {
          console.log('🖼️ [WATCHER] New Image Detected!');
          lastImageHash = imageHash;
          const newItem = storage.addItem({ type: 'image', content: imageData });
          
          BrowserWindow.getAllWindows().forEach(win => {
            if (!win.isDestroyed()) {
              win.webContents.send('clipboard-update', newItem);
            }
          });
          
          notify('Image Copied', 'New image added to history');
        }
      } else {
        const linuxImage = getLinuxClipboard('image');
        if (linuxImage && linuxImage !== lastImageHash) {
          console.log('🖼️ [WATCHER] New Linux Image Detected!');
          lastImageHash = linuxImage;
          const dataUrl = `data:image/png;base64,${linuxImage}`;
          const newItem = storage.addItem({ type: 'image', content: dataUrl });
          
          BrowserWindow.getAllWindows().forEach(win => {
            if (!win.isDestroyed()) {
              win.webContents.send('clipboard-update', newItem);
            }
          });
          
          notify('Image Copied', 'New image added to history');
        }
      }
    } catch (err) {
      console.error('❌ Watcher Error:', err.message);
    }
  }, 400); 
}

function notify(title, body) {
  try {
    if (Notification.isSupported()) {
      new Notification({ 
        title, 
        body: body.substring(0, 50) + (body.length > 50 ? '...' : ''),
        silent: true 
      }).show();
    }
  } catch (e) {}
}
