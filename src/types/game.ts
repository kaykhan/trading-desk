import type { AppInfo } from '../../shared/game'

export type UpgradeCategory = 'manual' | 'staff' | 'automation' | 'global' | 'prestige'

export type ShopTabId = 'manual' | 'staff' | 'automation' | 'global' | 'prestige'

export type UnitId = 'juniorTrader' | 'seniorTrader' | 'tradingBot'

export type UpgradeId =
  | 'betterTerminal'
  | 'hotkeyMacros'
  | 'premiumDataFeed'
  | 'deskUpgrade'
  | 'trainingProgram'
  | 'promotionProgram'
  | 'executiveTraining'
  | 'algorithmicTrading'
  | 'lowLatencyServers'
  | 'tradeMultiplier'
  | 'bullMarket'

export type PrestigeUpgradeId = 'brandRecognition' | 'seedCapital' | 'betterHiringPipeline'

export type ModalId = 'saveImport' | 'prestigeConfirm' | 'offlineEarnings'

export type GameSettings = {
  autosaveEnabled: boolean
  shortNumberThreshold: number
}

export type GameState = {
  cash: number
  lifetimeCashEarned: number
  reputation: number
  reputationSpent: number
  prestigeCount: number
  juniorTraderCount: number
  seniorTraderCount: number
  tradingBotCount: number
  purchasedUpgrades: Partial<Record<UpgradeId, boolean>>
  purchasedPrestigeUpgrades: Partial<Record<PrestigeUpgradeId, number>>
  lastSaveTimestamp: number
  totalOfflineSecondsApplied: number
  settings: GameSettings
}

export type UnitDefinition = {
  id: UnitId
  name: string
  baseCost: number
  costScaling: number
  baseIncomePerSecond: number
  description: string
}

export type UpgradeDefinition = {
  id: UpgradeId
  name: string
  category: Exclude<UpgradeCategory, 'prestige'>
  cost: number
  description: string
  visibleWhen?: (_state: GameState) => boolean
  unlockWhen?: (_state: GameState) => boolean
}

export type PrestigeUpgradeDefinition = {
  id: PrestigeUpgradeId
  name: string
  category: 'prestige'
  baseCost: number
  maxRank: number
  description: string
}

export type MilestoneDefinition = {
  id: string
  label: string
  rangeLabel: string
  objective: string
}

export type OfflineSummary = {
  secondsAway: number
  appliedSeconds: number
  cashEarned: number
}

export type GameStore = GameState & {
  appInfo: AppInfo | null
  activeShopTab: ShopTabId
  activeModal: ModalId | null
  offlineSummary: OfflineSummary | null
  makeTrade: () => void
  tick: (_deltaSeconds: number) => void
  buyJuniorTrader: () => void
  buyTradingBot: () => void
  buyUpgrade: (_upgradeId: UpgradeId) => void
  buyPrestigeUpgrade: (_upgradeId: PrestigeUpgradeId) => void
  promoteJuniorToSenior: () => void
  prestigeReset: () => void
  applyOfflineProgress: (_secondsAway: number) => void
  saveGame: () => void
  loadGame: () => void
  exportSave: () => string
  importSave: (_encodedSave: string) => boolean
  setAppInfo: (_appInfo: AppInfo | null) => void
  setActiveShopTab: (_tab: ShopTabId) => void
  openModal: (_modal: ModalId) => void
  closeModal: () => void
  setOfflineSummary: (_summary: OfflineSummary | null) => void
  resetFoundation: () => void
}
