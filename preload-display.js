const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  notifyReady: () => ipcRenderer.send('display-ready'),
  onUpdate: (callback) => {
    // Remove any previous listener to prevent stacking if called more than once
    ipcRenderer.removeAllListeners('update-display');
    ipcRenderer.on('update-display', (_event, data) => callback(data));
  },
});
