/// <reference types="vite/client" />

import type { GameApi } from '../shared/game'

declare global {
  interface Window {
    game?: GameApi
  }
}

export {}
