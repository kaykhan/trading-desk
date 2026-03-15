import { contextBridge, ipcRenderer } from 'electron';
const gameApi = {
    getAppInfo: () => ipcRenderer.invoke('game:app-info'),
    toggleFullscreen: () => ipcRenderer.invoke('game:toggle-fullscreen'),
};
contextBridge.exposeInMainWorld('game', gameApi);
//# sourceMappingURL=preload.js.map