import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'path';

let tray = null;

export function setupTray(win) {
  // Use a placeholder icon if none exists, or a simple native image
  const icon = nativeImage.createEmpty(); 
  tray = new Tray(icon);
  tray.setToolTip('Clipboard Manager');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Clipboard', click: () => win.show() },
    { label: 'Clear Unpinned', click: () => win.webContents.send('clear-all') },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);

  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
    }
  });
}
