const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('clipboardAPI', {
  getHistory: () => ipcRenderer.invoke('get-history'),
  copyItem: (content) => ipcRenderer.send('copy-item', content),
  deleteItem: (id) => ipcRenderer.send('delete-item', id),
  pinItem: (id) => ipcRenderer.send('pin-item', id),
  clearAll: () => ipcRenderer.send('clear-all'),
  onUpdate: (callback) => ipcRenderer.on('clipboard-update', (_event, value) => callback(value)),
  onShown: (callback) => ipcRenderer.on('window-shown', () => callback()),
});
