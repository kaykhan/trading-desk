import type { AppInfo } from '../../shared/game'

export type UpgradeCategory = 'trading' | 'operations' | 'research' | 'prestige'
export type UpgradeGroup = 'tradingDesk' | 'scientists' | 'algorithmic' | 'infrastructure'

export type GameTabId = 'desk' | 'upgrades' | 'research' | 'lobbying' | 'prestige' | 'stats' | 'settings'

export type DeskViewId = 'trading' | 'materials' | 'crypto'

export type ResearchTechId = 'algorithmicTrading' | 'powerSystemsEngineering' | 'seniorScientists' | 'dataCenterSystems' | 'tradingServers' | 'regulatoryAffairs'

export type PowerInfrastructureId = 'serverRoom' | 'dataCenter'

export type LobbyingTrack = 'labor' | 'energy' | 'market' | 'technology'

export type LobbyingPolicyId =
  | 'hiringIncentives'
  | 'deskExpansionCredits'
  | 'executiveCompensationReform'
  | 'industrialPowerSubsidies'
  | 'priorityGridAccess'
  | 'dataCenterEnergyCredits'
  | 'capitalGainsRelief'
  | 'extendedTradingWindow'
  | 'marketDeregulation'
  | 'automationTaxCredit'
  | 'fastTrackServerPermits'
  | 'aiInfrastructureIncentives'

export type UnitId = 'juniorTrader' | 'seniorTrader' | 'tradingServer' | 'tradingBot' | 'juniorResearchScientist' | 'seniorResearchScientist'

export type UpgradeId =
  | 'betterTerminal'
  | 'hotkeyMacros'
  | 'premiumDataFeed'
  | 'marketScanner'
  | 'juniorHiringProgram'
  | 'seniorRecruitment'
  | 'deskUpgrade'
  | 'trainingProgram'
  | 'executiveTraining'
  | 'algorithmicTrading'
  | 'labAutomation'
  | 'researchGrants'
  | 'policyAnalysisDesk'
  | 'botTelemetry'
  | 'lowLatencyServers'
  | 'executionCluster'
  | 'coolingSystems'
  | 'powerDistribution'
  | 'tradeMultiplier'
  | 'bullMarket'

export type ResearchUnlockId = 'juniorHiringProgram' | 'seniorRecruitment' | 'algorithmicTrading'

export type UnitUnlockId = ResearchUnlockId | 'researchProduction'

export type PrestigeUpgradeId = 'brandRecognition' | 'seedCapital' | 'betterHiringPipeline' | 'institutionalKnowledge' | 'gridOrchestration'

export type ModalId = 'saveImport' | 'prestigeConfirm' | 'offlineEarnings' | 'researchMap'

export type BuyMode = 1 | 5 | 10 | 'max'

export type GameSettings = {
  autosaveEnabled: boolean
  shortNumberThreshold: number
}

export type GameUiState = {
  unitBuyModes: Record<UnitId, BuyMode>
  powerBuyModes: Record<PowerInfrastructureId, BuyMode>
  activeDeskView: DeskViewId
}

export type GameState = {
  cash: number
  researchPoints: number
  influence: number
  lifetimeCashEarned: number
  reputation: number
  reputationSpent: number
  prestigeCount: number
  juniorTraderCount: number
  seniorTraderCount: number
  tradingServerCount: number
  tradingBotCount: number
  juniorResearchScientistCount: number
  seniorResearchScientistCount: number
  serverRoomCount: number
  dataCenterCount: number
  purchasedUpgrades: Partial<Record<UpgradeId, boolean>>
  purchasedResearchTech: Partial<Record<ResearchTechId, boolean>>
  purchasedPolicies: Partial<Record<LobbyingPolicyId, boolean>>
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
  baseResearchPointsPerSecond?: number
  baseInfluencePerSecond?: number
  description: string
  tab: Extract<UpgradeCategory, 'operations'>
  unlockUpgradeId: UnitUnlockId
}

export type UpgradeDefinition = {
  id: UpgradeId
  name: string
  category: Exclude<UpgradeCategory, 'prestige'>
  group?: UpgradeGroup
  cost: number
  description: string
  visibleWhen?: (_state: GameState) => boolean
  unlockWhen?: (_state: GameState) => boolean
}

export type ResearchTechDefinition = {
  id: ResearchTechId
  name: string
  researchCost: number
  description: string
  visibleWhen?: (_state: GameState) => boolean
}

export type PowerInfrastructureDefinition = {
  id: PowerInfrastructureId
  name: string
  baseCost: number
  costScaling: number
  powerCapacity: number
  description: string
}

export type LobbyingPolicyDefinition = {
  id: LobbyingPolicyId
  name: string
  track: LobbyingTrack
  influenceCost: number
  description: string
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
  researchEarned: number
  influenceEarned: number
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
  buyPowerInfrastructure: (_infrastructureId: PowerInfrastructureId, _quantity: BuyMode) => void
  buyUpgrade: (_upgradeId: UpgradeId) => void
  buyResearchTech: (_techId: ResearchTechId) => void
  buyLobbyingPolicy: (_policyId: LobbyingPolicyId) => void
  buyPrestigeUpgrade: (_upgradeId: PrestigeUpgradeId) => void
  prestigeReset: () => void
  applyOfflineProgress: (_secondsAway: number) => void
  saveGame: () => void
  loadGame: () => void
  exportSave: () => string
  importSave: (_encodedSave: string) => boolean
  setAppInfo: (_appInfo: AppInfo | null) => void
  setActiveTab: (_tab: GameTabId) => void
  setActiveDeskView: (_view: DeskViewId) => void
  setUnitBuyMode: (_unitId: UnitId, _mode: BuyMode) => void
  setPowerBuyMode: (_infrastructureId: PowerInfrastructureId, _mode: BuyMode) => void
  openModal: (_modal: ModalId) => void
  closeModal: () => void
  setOfflineSummary: (_summary: OfflineSummary | null) => void
  clearTradeFeedback: () => void
  resetFoundation: () => void
}
