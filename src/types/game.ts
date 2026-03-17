import type { AppInfo } from '../../shared/game'

export type UpgradeCategory = 'trading' | 'operations' | 'research' | 'prestige'
export type UpgradeGroup = 'tradingDesk' | 'research' | 'institutions' | 'automation' | 'infrastructure' | 'complianceLobbying'

export type GameTabId = 'desk' | 'upgrades' | 'optimizations' | 'research' | 'boosts' | 'compliance' | 'lobbying' | 'prestige' | 'stats' | 'settings'

export type DeskViewId = 'trading' | 'sectors' | 'commodities' | 'scientists' | 'infrastructure' | 'politicians'

export type SectorId = 'finance' | 'technology' | 'energy'

export type AutomationUnitId = 'quantTrader' | 'ruleBasedBot' | 'mlTradingBot' | 'aiTradingBot'

export type AutomationStrategyId = 'meanReversion' | 'momentum' | 'arbitrage' | 'marketMaking' | 'scalping'

export type AutomationConfig = {
  strategy: AutomationStrategyId | null
  marketTarget: SectorId | null
}

export type AutomationCycleRuntime = {
  progressSeconds: number
  lastPayout: number
  lastCompletedAt: number | null
}

export type HumanAssignableUnitId = 'intern' | 'juniorTrader' | 'seniorTrader'

export type GenericSectorAssignableUnitId = HumanAssignableUnitId | InstitutionalMandateUnitId

export type TraderSpecialistUnitId = 'seniorTrader'

export type TraderSpecializationId = 'finance' | 'technology' | 'energy'

export type InstitutionalMandateId = 'finance' | 'technology' | 'energy'

export type InstitutionalMandateUnitId = 'propDesk' | 'institutionalDesk' | 'hedgeFund' | 'investmentFirm'

export type ResearchBranchId = 'humanCapital' | 'markets' | 'infrastructure' | 'automation' | 'boosts' | 'regulation'

export type ResearchTechCurrency = 'cash' | 'researchPoints'

export type ResearchGraphPosition = {
  x: number
  y: number
}

export type MarketEventId =
  | 'techRally'
  | 'energyBoom'
  | 'financialTightening'
  | 'volatilitySpike'
  | 'liquidityCrunch'
  | 'gridStressWarning'

export type MarketEventCategory = 'sector' | 'systemic'

export type MarketEventDefinition = {
  id: MarketEventId
  name: string
  category: MarketEventCategory
  durationSeconds: number
  description: string
  affectedSector?: SectorId
  sectorOutputMultiplier?: number
  automationOutputMultiplier?: number
  machineEfficiencyMultiplier?: number
  globalOutputMultiplier?: number
}

export type MarketEventHistoryEntry = {
  eventId: MarketEventId
  endedAt: number
  durationSeconds: number
}

export type ComplianceCostBreakdown = {
  staff: number
  energy: number
  automation: number
  institutional: number
  total: number
}

export type CompliancePaymentCategoryId = 'staff' | 'energy' | 'automation' | 'institutional'

export type CompliancePaymentStatus = 'current' | 'due' | 'overdue'

export type CompliancePaymentEntry = {
  overdueAmount: number
  paidThisCycle: number
  lastPayment: number
}

export type CompliancePaymentState = Record<CompliancePaymentCategoryId, CompliancePaymentEntry>

export type ComplianceSourceSummary = {
  label: string
  value: number
}

export type TimedBoostId =
  | 'aggressiveTradingWindow'
  | 'deployReserveCapital'
  | 'overclockServers'
  | 'researchSprint'
  | 'complianceFreeze'

export type TimedBoostUnlockId =
  | 'aggressiveTradingWindowProtocols'
  | 'deployReserveCapitalProtocols'
  | 'overclockServersProtocols'
  | 'researchSprintProtocols'
  | 'complianceFreezeProtocols'

export type TimedBoostDefinition = {
  id: TimedBoostId
  name: string
  durationSeconds: number
  cooldownSeconds: number
  description: string
  unlockResearchTechId: TimedBoostUnlockId
}

export type GlobalBoostId =
  | 'globalProfitBoost'
  | 'globalEnergySupplyBoost'
  | 'globalInfluenceBoost'
  | 'globalReputationBoost'

export type GlobalBoostDefinition = {
  id: GlobalBoostId
  name: string
  description: string
  multiplier: number
}

export type TimedBoostRuntime = {
  isActive: boolean
  remainingActiveSeconds: number
  remainingCooldownSeconds: number
  autoEnabled: boolean
}

export type ResearchTechId =
  | 'foundationsOfFinanceTraining'
  | 'juniorTraderProgram'
  | 'seniorRecruitment'
  | 'financeSpecialistTraining'
  | 'technologySpecialistTraining'
  | 'energySpecialistTraining'
  | 'floorSpacePlanning'
  | 'officeExpansionPlanning'
  | 'financeMandateFramework'
  | 'techGrowthMandateFramework'
  | 'energyExposureFramework'
  | 'technologyMarkets'
  | 'energyMarkets'
  | 'algorithmicTrading'
  | 'ruleBasedAutomation'
  | 'machineLearningTrading'
  | 'meanReversionModels'
  | 'momentumModels'
  | 'arbitrageEngine'
  | 'marketMakingEngine'
  | 'scalpingFramework'
  | 'powerSystemsEngineering'
  | 'serverRoomSystems'
  | 'juniorScientists'
  | 'seniorScientists'
  | 'propDeskOperations'
  | 'institutionalDesks'
  | 'hedgeFundStrategies'
  | 'investmentFirms'
  | 'dataCenterSystems'
  | 'aiTradingSystems'
  | 'cloudInfrastructure'
  | 'regulatoryAffairs'
  | 'aggressiveTradingWindowProtocols'
  | 'deployReserveCapitalProtocols'
  | 'overclockServersProtocols'
  | 'researchSprintProtocols'
  | 'complianceFreezeProtocols'
  | 'boostAutomationProtocols'

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
  | 'quantTrader'
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
  | 'tradeShortcuts'
  | 'premiumDataFeed'
  | 'deskAnalytics'
  | 'crossDeskCoordination'
  | 'structuredOnboarding'
  | 'systematicExecution'
  | 'botTelemetry'
  | 'executionRoutingStack'
  | 'modelServingCluster'
  | 'inferenceBatching'
  | 'aiRiskStack'
  | 'labAutomation'
  | 'researchGrants'
  | 'sharedResearchLibrary'
  | 'backtestingSuite'
  | 'institutionalResearchNetwork'
  | 'crossDisciplinaryModels'
  | 'propDeskOperatingModel'
  | 'institutionalClientBook'
  | 'fundStrategyCommittee'
  | 'globalDistributionNetwork'
  | 'institutionalOperatingStandards'
  | 'mandateAlignmentFramework'
  | 'rackStacking'
  | 'coolingSystems'
  | 'roomScaleout'
  | 'powerDistribution'
  | 'dataCenterFabric'
  | 'cloudBurstContracts'
  | 'policyAnalysisDesk'
  | 'regulatoryCounsel'
  | 'donorNetwork'
  | 'complianceSoftwareSuite'
  | 'governmentRelationsOffice'
  | 'filingAutomation'

export type RepeatableUpgradeId =
  | 'manualExecutionRefinement'
  | 'humanDeskTuning'
  | 'institutionalProcessRefinement'
  | 'sectorAllocationEfficiency'
  | 'researchThroughput'
  | 'trainingMethodology'
  | 'analyticalModeling'
  | 'executionStackTuning'
  | 'modelEfficiency'
  | 'computeOptimization'
  | 'signalQualityControl'
  | 'complianceSystems'
  | 'filingEfficiency'
  | 'policyReach'
  | 'institutionalAccess'

export type RepeatableUpgradeCurrency = 'cash' | 'researchPoints' | 'influence'

export type RepeatableUpgradeFamily = 'desk' | 'research' | 'automation' | 'governance'

export type ResearchUnlockId =
  | 'foundationsOfFinanceTraining'
  | 'juniorTraderProgram'
  | 'financeSpecialistTraining'
  | 'technologySpecialistTraining'
  | 'energySpecialistTraining'
  | 'floorSpacePlanning'
  | 'officeExpansionPlanning'
  | 'financeMandateFramework'
  | 'techGrowthMandateFramework'
  | 'energyExposureFramework'
  | 'juniorScientists'
  | 'seniorScientists'
  | 'seniorRecruitment'
  | 'technologyMarkets'
  | 'energyMarkets'
  | 'propDeskOperations'
  | 'ruleBasedAutomation'
  | 'machineLearningTrading'
  | 'meanReversionModels'
  | 'momentumModels'
  | 'arbitrageEngine'
  | 'marketMakingEngine'
  | 'scalpingFramework'
  | 'serverRoomSystems'
  | 'institutionalDesks'
  | 'hedgeFundStrategies'
  | 'investmentFirms'
  | 'algorithmicTrading'
  | 'dataCenterSystems'
  | 'aiTradingSystems'
  | 'cloudInfrastructure'
  | 'regulatoryAffairs'

export type UnitUnlockId = ResearchUnlockId | UpgradeId | 'researchProduction'

export type PrestigeTierId = 'iron' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'titanium' | 'sapphire' | 'ruby' | 'diamond' | 'onyx'

export type PrestigeUpgradeId =
  | 'globalRecognition'
  | 'seedCapital'
  | 'betterHiringPipeline'
  | 'institutionalKnowledge'
  | 'gridOrchestration'
  | 'complianceFrameworks'
  | 'policyCapital'
  | 'marketReputation'
  | 'deskEfficiency'
  | 'strategicReserves'

export type ModalId = 'saveImport' | 'prestigeConfirm' | 'resetConfirm' | 'offlineEarnings' | 'researchMap' | 'marketEvents' | 'milestones'

export type BuyMode = 1 | 5 | 10 | 'max'

export type GameSettings = {
  autosaveEnabled: boolean
  complianceAutoPayEnabled: Record<CompliancePaymentCategoryId, boolean>
  shortNumberThreshold: number
}

export type GameUiState = {
  unitBuyModes: Record<UnitId, BuyMode>
  powerBuyModes: Record<PowerInfrastructureId, BuyMode>
  capacityBuyModes: Record<CapacityInfrastructureId, BuyMode>
  repeatableUpgradeBuyModes: Record<RepeatableUpgradeId, BuyMode>
  researchBranchExpanded: Record<ResearchBranchId, boolean>
  prestigePurchasePlan: Partial<Record<PrestigeUpgradeId, number>>
  dismissedSectorUnlocks: Record<SectorId, boolean>
  dismissedCapacityFull: boolean
  activeDeskView: DeskViewId
}

export type SectorAssignmentCounts = Record<SectorId, number>

export type TraderSpecialistCounts = Record<TraderSpecializationId, number>

export type TraderSpecialistPool = Record<TraderSpecialistUnitId, TraderSpecialistCounts>

export type InstitutionalMandateCounts = Record<InstitutionalMandateId, number>

export type InstitutionalMandatePool = Record<InstitutionalMandateUnitId, InstitutionalMandateCounts>

export type SectorAssignments = {
  intern: SectorAssignmentCounts
  juniorTrader: SectorAssignmentCounts
  seniorTrader: SectorAssignmentCounts
  propDesk: SectorAssignmentCounts
  institutionalDesk: SectorAssignmentCounts
  hedgeFund: SectorAssignmentCounts
  investmentFirm: SectorAssignmentCounts
}

export type GameState = {
  cash: number
  researchPoints: number
  influence: number
  unlockedMilestones: Partial<Record<MilestoneId, boolean>>
  lifetimeManualTrades: number
  lifetimeResearchPointsEarned: number
  totalComplianceReviewsTriggered: number
  totalCompliancePaymentsMade: number
  complianceTabOpened: boolean
  totalTimedBoostActivations: number
  discoveredLobbying: boolean
  complianceVisible: boolean
  complianceReviewRemainingSeconds: number
  compliancePayments: CompliancePaymentState
  lastCompliancePayment: number
  timedBoosts: Record<TimedBoostId, TimedBoostRuntime>
  globalBoostsOwned: Record<GlobalBoostId, boolean>
  lifetimeCashEarned: number
  reputation: number
  reputationSpent: number
  prestigeCount: number
  internCount: number
  juniorTraderCount: number
  seniorTraderCount: number
  quantTraderCount: number
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
  activeMarketEvent: MarketEventId | null
  activeMarketEventRemainingSeconds: number
  nextMarketEventCooldownSeconds: number
  marketEventHistory: MarketEventHistoryEntry[]
  unlockedSectors: Record<SectorId, boolean>
  automationConfig: Record<AutomationUnitId, AutomationConfig>
  automationCycleState: Record<AutomationUnitId, AutomationCycleRuntime>
  sectorAssignments: SectorAssignments
  traderSpecialists: TraderSpecialistPool
  institutionMandates: InstitutionalMandatePool
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
  branch: ResearchBranchId
  currency: ResearchTechCurrency
  researchCost: number
  description: string
  prerequisites?: ResearchTechId[]
  graphPosition?: ResearchGraphPosition
  lockedReason?: (_state: GameState) => string
  visibleWhen?: (_state: GameState) => boolean
  unlockWhen?: (_state: GameState) => boolean
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
  maxRank: number
  description: string
}

export type RepeatableUpgradeDefinition = {
  id: RepeatableUpgradeId
  name: string
  family: RepeatableUpgradeFamily
  currency: RepeatableUpgradeCurrency
  maxRank: number
  perRankDescription: string
  baseCost: number
  costScaling: number
  effectPerRank: number
  description: string
  unlockConditionDescription: string
  visibleWhen?: (_state: GameState) => boolean
  unlockWhen?: (_state: GameState) => boolean
}

export type MilestoneCategoryId =
  | 'gettingStarted'
  | 'tradingDesk'
  | 'research'
  | 'marketsSectors'
  | 'specialization'
  | 'institutions'
  | 'automation'
  | 'infrastructure'
  | 'complianceLobbying'
  | 'boosts'
  | 'prestige'
  | 'optimisations'

export type MilestoneId = string

export type MilestoneReward = {
  cash?: number
  researchPoints?: number
  influence?: number
  reputation?: number
  deskSlots?: number
  note?: string
}

export type MilestoneDefinition = {
  id: MilestoneId
  category: MilestoneCategoryId
  displayOrder: number
  name: string
  description: string
  visibleByDefault: boolean
  reward: MilestoneReward
  achievementKey?: string
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
  milestoneUnlockQueue: MilestoneId[]
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
  activateTimedBoost: (_boostId: TimedBoostId) => void
  toggleTimedBoostAutoMode: (_boostId: TimedBoostId, _enabled: boolean) => void
  setGlobalBoostOwned: (_boostId: GlobalBoostId, _owned: boolean) => void
  payComplianceCategory: (_category: CompliancePaymentCategoryId) => void
  setComplianceAutoPayEnabled: (_category: CompliancePaymentCategoryId, _enabled: boolean) => void
  setActiveDeskView: (_view: DeskViewId) => void
  setUnitBuyMode: (_unitId: UnitId, _mode: BuyMode) => void
  setPowerBuyMode: (_infrastructureId: PowerInfrastructureId, _mode: BuyMode) => void
  setCapacityBuyMode: (_infrastructureId: CapacityInfrastructureId, _mode: BuyMode) => void
  setRepeatableUpgradeBuyMode: (_upgradeId: RepeatableUpgradeId, _mode: BuyMode) => void
  unlockSector: (_sectorId: SectorId) => void
  acknowledgeSectorUnlock: (_sectorId: SectorId) => void
  acknowledgeCapacityFull: () => void
  assignUnitToSector: (_unitId: GenericSectorAssignableUnitId, _sectorId: SectorId, _amount?: number) => void
  unassignUnitFromSector: (_unitId: GenericSectorAssignableUnitId, _sectorId: SectorId, _amount?: number) => void
  clearSectorAssignments: (_unitId: GenericSectorAssignableUnitId, _sectorId: SectorId) => void
  assignMaxToSector: (_unitId: GenericSectorAssignableUnitId, _sectorId: SectorId) => void
  setAutomationMarketTarget: (_unitId: AutomationUnitId, _sectorId: SectorId | null) => void
  setAutomationStrategy: (_unitId: AutomationUnitId, _strategyId: AutomationStrategyId | null) => void
  trainTraderSpecialist: (_unitId: TraderSpecialistUnitId, _specializationId: TraderSpecializationId, _amount?: number) => void
  applyInstitutionMandate: (_unitId: InstitutionalMandateUnitId, _mandateId: InstitutionalMandateId, _amount?: number) => void
  setResearchBranchExpanded: (_branchId: ResearchBranchId, _expanded: boolean) => void
  adjustPrestigePurchasePlan: (_upgradeId: PrestigeUpgradeId, _delta: 1 | -1) => void
  clearPrestigePurchasePlan: () => void
  openModal: (_modal: ModalId) => void
  closeModal: () => void
  setOfflineSummary: (_summary: OfflineSummary | null) => void
  clearTradeFeedback: () => void
  dismissMilestoneNotification: () => void
  resetFoundation: () => void
}
