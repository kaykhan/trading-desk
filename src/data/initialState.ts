import type { GameState } from '../types/game'
import { GAME_CONSTANTS } from './constants'

export const initialState: GameState = {
  cash: 0,
  lifetimeCashEarned: 0,
  reputation: 0,
  reputationSpent: 0,
  prestigeCount: 0,
  juniorTraderCount: 0,
  seniorTraderCount: 0,
  tradingBotCount: 0,
  purchasedUpgrades: {},
  purchasedPrestigeUpgrades: {},
  lastSaveTimestamp: Date.now(),
  totalOfflineSecondsApplied: 0,
  settings: {
    autosaveEnabled: true,
    shortNumberThreshold: GAME_CONSTANTS.shortNumberThreshold,
  },
  ui: {
    unitBuyModes: {
      juniorTrader: 1,
      seniorTrader: 1,
      tradingBot: 1,
    },
  },
}
