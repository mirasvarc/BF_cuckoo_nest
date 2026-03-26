const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendUpdate:    (data)     => ipcRenderer.send('update-display', data),
  getVersion:    ()         => ipcRenderer.invoke('get-version'),
  onSyncRequest: (callback) => ipcRenderer.on('sync-request', () => callback()),
});
