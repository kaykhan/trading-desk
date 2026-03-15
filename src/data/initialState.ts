import type { GameState } from '../types/game'
import { GAME_CONSTANTS } from './constants'

export const initialState: GameState = {
  cash: 0,
  researchPoints: 0,
  influence: 0,
  lifetimeCashEarned: 0,
  reputation: 0,
  reputationSpent: 0,
  prestigeCount: 0,
  juniorTraderCount: 0,
  seniorTraderCount: 0,
  tradingServerCount: 0,
  tradingBotCount: 0,
  juniorResearchScientistCount: 0,
  seniorResearchScientistCount: 0,
  serverRoomCount: 0,
  dataCenterCount: 0,
  purchasedUpgrades: {},
  purchasedResearchTech: {},
  purchasedPolicies: {},
  purchasedPrestigeUpgrades: {},
  lastSaveTimestamp: Date.now(),
  totalOfflineSecondsApplied: 0,
  settings: {
    autosaveEnabled: true,
    shortNumberThreshold: GAME_CONSTANTS.shortNumberThreshold,
  },
  ui: {
    activeDeskView: 'trading',
    powerBuyModes: {
      serverRoom: 1,
      dataCenter: 1,
    },
    unitBuyModes: {
      juniorTrader: 1,
      seniorTrader: 1,
      tradingServer: 1,
      tradingBot: 1,
      juniorResearchScientist: 1,
      seniorResearchScientist: 1,
    },
  },
}
