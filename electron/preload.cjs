const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    'electronAPI', {
    downloadPDF: (html) => ipcRenderer.send('download-pdf', html),
}
);
