import type { AppInfo } from '../../shared/game'

export type UpgradeCategory = 'trading' | 'operations' | 'research' | 'prestige'

export type GameTabId = 'desk' | 'research' | 'prestige' | 'stats' | 'settings'

export type UnitId = 'juniorTrader' | 'seniorTrader' | 'tradingBot'

export type UpgradeId =
  | 'betterTerminal'
  | 'hotkeyMacros'
  | 'premiumDataFeed'
  | 'juniorHiringProgram'
  | 'seniorRecruitment'
  | 'deskUpgrade'
  | 'trainingProgram'
  | 'executiveTraining'
  | 'algorithmicTrading'
  | 'lowLatencyServers'
  | 'tradeMultiplier'
  | 'bullMarket'

export type ResearchUnlockId = 'juniorHiringProgram' | 'seniorRecruitment' | 'algorithmicTrading'

export type PrestigeUpgradeId = 'brandRecognition' | 'seedCapital' | 'betterHiringPipeline'

export type ModalId = 'saveImport' | 'prestigeConfirm' | 'offlineEarnings'

export type BuyMode = 1 | 5 | 10 | 'max'

export type GameSettings = {
  autosaveEnabled: boolean
  shortNumberThreshold: number
}

export type GameUiState = {
  unitBuyModes: Record<UnitId, BuyMode>
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
  ui: GameUiState
}

export type UnitDefinition = {
  id: UnitId
  name: string
  baseCost: number
  costScaling: number
  baseIncomePerSecond: number
  description: string
  tab: Extract<UpgradeCategory, 'operations'>
  unlockUpgradeId: ResearchUnlockId
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

export type TradeFeedback = {
  amount: number
  timestamp: number
}

export type GameStore = GameState & {
  appInfo: AppInfo | null
  activeTab: GameTabId
  activeModal: ModalId | null
  offlineSummary: OfflineSummary | null
  latestTradeFeedback: TradeFeedback | null
  makeTrade: () => void
  tick: (_deltaSeconds: number) => void
  buyUnit: (_unitId: UnitId, _quantity: BuyMode) => void
  buyUpgrade: (_upgradeId: UpgradeId) => void
  buyPrestigeUpgrade: (_upgradeId: PrestigeUpgradeId) => void
  prestigeReset: () => void
  applyOfflineProgress: (_secondsAway: number) => void
  saveGame: () => void
  loadGame: () => void
  exportSave: () => string
  importSave: (_encodedSave: string) => boolean
  setAppInfo: (_appInfo: AppInfo | null) => void
  setActiveTab: (_tab: GameTabId) => void
  setUnitBuyMode: (_unitId: UnitId, _mode: BuyMode) => void
  openModal: (_modal: ModalId) => void
  closeModal: () => void
  setOfflineSummary: (_summary: OfflineSummary | null) => void
  clearTradeFeedback: () => void
  resetFoundation: () => void
}
