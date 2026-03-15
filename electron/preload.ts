import { contextBridge, ipcRenderer } from 'electron'
import type { GameApi } from '../shared/game.js'

const gameApi: GameApi = {
  getAppInfo: () => ipcRenderer.invoke('game:app-info'),
  toggleFullscreen: () => ipcRenderer.invoke('game:toggle-fullscreen'),
}

contextBridge.exposeInMainWorld('game', gameApi)
