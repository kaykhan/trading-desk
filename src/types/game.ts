import type { AppInfo } from '../../shared/game'

export type UpgradeCategory = 'trading' | 'operations' | 'research' | 'prestige'
export type UpgradeGroup = 'tradingDesk' | 'scientists' | 'politics' | 'algorithmic' | 'infrastructure'

export type GameTabId = 'desk' | 'upgrades' | 'optimizations' | 'research' | 'lobbying' | 'prestige' | 'stats' | 'settings'

export type DeskViewId = 'trading' | 'sectors' | 'commodities' | 'scientists' | 'infrastructure' | 'politicians'

export type SectorId = 'finance' | 'technology' | 'energy'

export type HumanAssignableUnitId = 'intern' | 'juniorTrader' | 'seniorTrader'

export type ResearchTechId =
  | 'algorithmicTrading'
  | 'powerSystemsEngineering'
  | 'juniorScientists'
  | 'seniorScientists'
  | 'propDeskOperations'
  | 'institutionalDesks'
  | 'hedgeFundStrategies'
  | 'investmentFirms'
  | 'dataCenterSystems'
  | 'aiTradingSystems'
  | 'regulatoryAffairs'

export type PowerInfrastructureId = 'serverRack' | 'serverRoom' | 'dataCenter' | 'cloudCompute'

export type CapacityInfrastructureId = 'deskSpace' | 'floorSpace' | 'office'

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

export type UnitId =
  | 'intern'
  | 'juniorTrader'
  | 'seniorTrader'
  | 'propDesk'
  | 'institutionalDesk'
  | 'hedgeFund'
  | 'investmentFirm'
  | 'ruleBasedBot'
  | 'mlTradingBot'
  | 'aiTradingBot'
  | 'internResearchScientist'
  | 'juniorResearchScientist'
  | 'seniorResearchScientist'
  | 'juniorPolitician'

export type UpgradeId =
  | 'betterTerminal'
  | 'hotkeyMacros'
  | 'premiumDataFeed'
  | 'marketScanner'
  | 'juniorHiringProgram'
  | 'juniorTraderProgram'
  | 'seniorRecruitment'
  | 'deskUpgrade'
  | 'trainingProgram'
  | 'internCohort'
  | 'juniorAnalystProgram'
  | 'executiveTraining'
  | 'firmwideDeskStandards'
  | 'systematicExecution'
  | 'labAutomation'
  | 'researchGrants'
  | 'policyAnalysisDesk'
  | 'donorRoundtables'
  | 'propDeskMandates'
  | 'institutionalRelationships'
  | 'fundOfFundsNetwork'
  | 'globalDistribution'
  | 'botTelemetry'
  | 'lowLatencyServers'
  | 'executionCluster'
  | 'modelOpsPipeline'
  | 'aiRiskStack'
  | 'rackStacking'
  | 'roomScaleout'
  | 'dataCenterFabric'
  | 'cloudBurstContracts'
  | 'coolingSystems'
  | 'powerDistribution'

export type RepeatableUpgradeId =
  | 'manualTradeRefinement'
  | 'politicalNetworking'
  | 'constituencyResearch'
  | 'talentHeadhunters'
  | 'researchEndowments'
  | 'patronageMachine'
  | 'automationSubsidies'
  | 'infrastructureGrants'
  | 'internDeskTraining'
  | 'internPlaybooks'
  | 'internLabTraining'
  | 'internResearchNotes'
  | 'juniorTraderTraining'
  | 'seniorDeskPerformance'
  | 'propDeskScaling'
  | 'institutionalDeskCoordination'
  | 'hedgeFundExecution'
  | 'investmentFirmOperations'
  | 'ruleBasedExecution'
  | 'mlModelDeployment'
  | 'aiClusterOrchestration'
  | 'juniorLabProtocols'
  | 'seniorLabMethods'
  | 'rackDensity'
  | 'serverRoomExpansion'
  | 'dataCenterOverbuild'
  | 'cloudFailover'
  | 'behavioralModeling'
  | 'decisionSystems'
  | 'propDeskResearch'
  | 'institutionalAnalytics'
  | 'hedgeFundResearch'
  | 'firmWideSystems'
  | 'signalRefinement'
  | 'mlFeaturePipelines'
  | 'aiTrainingSystems'
  | 'juniorLabOptimization'
  | 'seniorLabOptimization'
  | 'energyOptimization'
  | 'serverEfficiency'

export type RepeatableUpgradeCurrency = 'cash' | 'researchPoints' | 'influence'

export type RepeatableUpgradeFamily = 'operations' | 'research' | 'influence'

export type RepeatableUpgradeTarget =
  | 'manualTrade'
  | 'juniorPolitician'
  | 'humanTrading'
  | 'researchStaff'
  | 'politicalStaff'
  | 'machineProcurement'
  | 'infrastructureProcurement'
  | 'intern'
  | 'internResearchScientist'
  | 'juniorTrader'
  | 'seniorTrader'
  | 'propDesk'
  | 'institutionalDesk'
  | 'hedgeFund'
  | 'investmentFirm'
  | 'ruleBasedBot'
  | 'mlTradingBot'
  | 'aiTradingBot'
  | 'juniorResearchScientist'
  | 'seniorResearchScientist'
  | 'serverRack'
  | 'serverRoom'
  | 'dataCenter'
  | 'cloudCompute'
  | 'machineSystems'

export type RepeatableUpgradeEffectType = 'output' | 'powerCapacity' | 'powerUsageReduction' | 'costReduction'

export type ResearchUnlockId =
  | 'juniorHiringProgram'
  | 'juniorScientists'
  | 'seniorRecruitment'
  | 'propDeskOperations'
  | 'institutionalDesks'
  | 'hedgeFundStrategies'
  | 'investmentFirms'
  | 'algorithmicTrading'
  | 'dataCenterSystems'
  | 'aiTradingSystems'
  | 'regulatoryAffairs'

export type UnitUnlockId = ResearchUnlockId | UpgradeId | 'researchProduction'

export type PrestigeUpgradeId = 'brandRecognition' | 'seedCapital' | 'betterHiringPipeline' | 'institutionalKnowledge' | 'gridOrchestration' | 'tradeMultiplier'

export type ModalId = 'saveImport' | 'prestigeConfirm' | 'resetConfirm' | 'offlineEarnings' | 'researchMap'

export type BuyMode = 1 | 5 | 10 | 'max'

export type GameSettings = {
  autosaveEnabled: boolean
  shortNumberThreshold: number
}

export type GameUiState = {
  unitBuyModes: Record<UnitId, BuyMode>
  powerBuyModes: Record<PowerInfrastructureId, BuyMode>
  capacityBuyModes: Record<CapacityInfrastructureId, BuyMode>
  repeatableUpgradeBuyModes: Record<RepeatableUpgradeId, BuyMode>
  prestigePurchasePlan: Partial<Record<PrestigeUpgradeId, number>>
  dismissedSectorUnlocks: Record<SectorId, boolean>
  dismissedCapacityFull: boolean
  activeDeskView: DeskViewId
}

export type GameState = {
  cash: number
  researchPoints: number
  influence: number
  discoveredLobbying: boolean
  lifetimeCashEarned: number
  reputation: number
  reputationSpent: number
  prestigeCount: number
  internCount: number
  juniorTraderCount: number
  seniorTraderCount: number
  baseDeskSlots: number
  deskSpaceCount: number
  floorSpaceCount: number
  officeCount: number
  propDeskCount: number
  institutionalDeskCount: number
  hedgeFundCount: number
  investmentFirmCount: number
  ruleBasedBotCount: number
  mlTradingBotCount: number
  aiTradingBotCount: number
  internResearchScientistCount: number
  juniorResearchScientistCount: number
  seniorResearchScientistCount: number
  juniorPoliticianCount: number
  serverRackCount: number
  serverRoomCount: number
  dataCenterCount: number
  cloudComputeCount: number
  unlockedSectors: Record<SectorId, boolean>
  sectorAssignments: Record<HumanAssignableUnitId, Record<SectorId, number>>
  purchasedUpgrades: Partial<Record<UpgradeId, boolean>>
  purchasedResearchTech: Partial<Record<ResearchTechId, boolean>>
  purchasedPolicies: Partial<Record<LobbyingPolicyId, boolean>>
  purchasedPrestigeUpgrades: Partial<Record<PrestigeUpgradeId, number>>
  repeatableUpgradeRanks: Partial<Record<RepeatableUpgradeId, number>>
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

export type CapacityInfrastructureDefinition = {
  id: CapacityInfrastructureId
  name: string
  baseCost: number
  costScaling: number
  slotsGranted: number
  powerUsage: number
  description: string
}

export type SectorDefinition = {
  id: SectorId
  name: string
  baseProfitMultiplier: number
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

export type RepeatableUpgradeDefinition = {
  id: RepeatableUpgradeId
  name: string
  family: RepeatableUpgradeFamily
  currency: RepeatableUpgradeCurrency
  target: RepeatableUpgradeTarget
  effectType: RepeatableUpgradeEffectType
  baseCost: number
  costScaling: number
  effectPerRank: number
  description: string
  visibleWhen?: (_state: GameState) => boolean
  unlockWhen?: (_state: GameState) => boolean
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
  buyDeskSpace: (_quantity?: BuyMode) => void
  buyFloorSpace: (_quantity?: BuyMode) => void
  buyOffice: (_quantity?: BuyMode) => void
  buyUpgrade: (_upgradeId: UpgradeId) => void
  buyRepeatableUpgrade: (_upgradeId: RepeatableUpgradeId) => void
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
  setCapacityBuyMode: (_infrastructureId: CapacityInfrastructureId, _mode: BuyMode) => void
  setRepeatableUpgradeBuyMode: (_upgradeId: RepeatableUpgradeId, _mode: BuyMode) => void
  unlockSector: (_sectorId: SectorId) => void
  acknowledgeSectorUnlock: (_sectorId: SectorId) => void
  acknowledgeCapacityFull: () => void
  assignUnitToSector: (_unitId: HumanAssignableUnitId, _sectorId: SectorId, _amount?: number) => void
  unassignUnitFromSector: (_unitId: HumanAssignableUnitId, _sectorId: SectorId, _amount?: number) => void
  clearSectorAssignments: (_unitId: HumanAssignableUnitId, _sectorId: SectorId) => void
  assignMaxToSector: (_unitId: HumanAssignableUnitId, _sectorId: SectorId) => void
  adjustPrestigePurchasePlan: (_upgradeId: PrestigeUpgradeId, _delta: 1 | -1) => void
  clearPrestigePurchasePlan: () => void
  openModal: (_modal: ModalId) => void
  closeModal: () => void
  setOfflineSummary: (_summary: OfflineSummary | null) => void
  clearTradeFeedback: () => void
  resetFoundation: () => void
}
