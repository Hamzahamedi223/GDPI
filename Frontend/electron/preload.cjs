const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopAPI', {
  getAllRecords: () => ipcRenderer.invoke('local-db:get-all'),
  addRecord: (payload) => ipcRenderer.invoke('local-db:add', payload),
  removeRecord: (id) => ipcRenderer.invoke('local-db:remove', id),
});
