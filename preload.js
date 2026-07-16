const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    savePDF: (data) => ipcRenderer.invoke('save-pdf', data),
    saveFile: (filePath, data) =>
        ipcRenderer.invoke('save-file', filePath, data),

    saveAllKP: (kpList) =>
        ipcRenderer.invoke('save-all-kp', kpList),

    loadAllKP: () =>
        ipcRenderer.invoke('load-all-kp'),
});