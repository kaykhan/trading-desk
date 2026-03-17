import { initialState } from '../data/initialState'
import { LOBBYING_POLICIES } from '../data/lobbyingPolicies'
import { MILESTONES } from '../data/milestones'
import { PRESTIGE_UPGRADES } from '../data/prestigeUpgrades'
import type { GameState, LobbyingPolicyId, MilestoneId, PrestigeUpgradeId, ResearchTechId, TimedBoostId, UnitId, UpgradeId } from '../types/game'

export type SimPolicyId = 'unlockChasing' | 'roi' | 'prestigeAware'

export type UnlockRecord = {
  milestoneId: MilestoneId
  name: string
  elapsedSeconds: number
  run: number
}

export type SimMetrics = {
  unlockRecords: UnlockRecord[]
  seenMilestoneIds: Set<MilestoneId>
  stallReason: string | null
  anomalyMessages: string[]
}

export type SimState = {
  game: GameState
  timeSeconds: number
  runIndex: number
  policyId: SimPolicyId
  lastMeaningfulProgressTimeSeconds: number
  bestObservedCash: number
  bestObservedResearchPoints: number
  bestObservedInfluence: number
  bestObservedLifetimeCashEarned: number
  bestObservedLifetimeResearchPointsEarned: number
}

export type SimConfig = {
  policyId: SimPolicyId
  researchPriority: ResearchTechId[]
  unitPriority: UnitId[]
  upgradePriority: UpgradeId[]
  policyPriority: LobbyingPolicyId[]
  prestigePriority: PrestigeUpgradeId[]
  timedBoostPriority: TimedBoostId[]
  maxSeconds: number
  maxRuns: number
  tickSeconds: number
  manualTradesPerTick: number
  maxActionsPerTick: number
  stallWindowSeconds: number
  prestigeMinReputationGain: number
  prestigeRequiresRuleBot: boolean
}

export type SimResult = {
  state: SimState
  metrics: SimMetrics
  remainingMilestones: MilestoneId[]
  completedAllMilestones: boolean
  stalled: boolean
}

export const RESEARCH_PRIORITY: ResearchTechId[] = [
  'foundationsOfFinanceTraining',
  'juniorTraderProgram',
  'juniorScientists',
  'technologyMarkets',
  'seniorRecruitment',
  'financeSpecialistTraining',
  'propDeskOperations',
  'algorithmicTrading',
  'meanReversionModels',
  'powerSystemsEngineering',
  'momentumModels',
  'regulatoryAffairs',
  'aggressiveTradingWindowProtocols',
  'researchSprintProtocols',
  'ruleBasedAutomation',
  'arbitrageEngine',
  'energyMarkets',
  'technologySpecialistTraining',
  'institutionalDesks',
  'marketMakingEngine',
  'financeMandateFramework',
  'seniorScientists',
  'serverRoomSystems',
  'hedgeFundStrategies',
  'deployReserveCapitalProtocols',
  'scalpingFramework',
  'energySpecialistTraining',
  'techGrowthMandateFramework',
  'complianceFreezeProtocols',
  'energyExposureFramework',
  'dataCenterSystems',
  'machineLearningTrading',
  'investmentFirms',
  'overclockServersProtocols',
  'aiTradingSystems',
  'boostAutomationProtocols',
  'cloudInfrastructure',
]

export const RESEARCH_RUSH_PRIORITY: ResearchTechId[] = [
  'foundationsOfFinanceTraining',
  'juniorScientists',
  'researchSprintProtocols',
  'juniorTraderProgram',
  'technologyMarkets',
  'seniorRecruitment',
  'propDeskOperations',
  'algorithmicTrading',
  'meanReversionModels',
  'powerSystemsEngineering',
  'momentumModels',
  'regulatoryAffairs',
  'ruleBasedAutomation',
  'arbitrageEngine',
  'energyMarkets',
  'institutionalDesks',
  'marketMakingEngine',
  'financeMandateFramework',
  'seniorScientists',
  'serverRoomSystems',
  'hedgeFundStrategies',
  'deployReserveCapitalProtocols',
  'scalpingFramework',
  'techGrowthMandateFramework',
  'complianceFreezeProtocols',
  'energyExposureFramework',
  'dataCenterSystems',
  'machineLearningTrading',
  'investmentFirms',
  'overclockServersProtocols',
  'aiTradingSystems',
  'boostAutomationProtocols',
  'cloudInfrastructure',
]

export const UNIT_PRIORITY: UnitId[] = [
  'intern',
  'internResearchScientist',
  'juniorTrader',
  'juniorResearchScientist',
  'seniorTrader',
  'propDesk',
  'quantTrader',
  'juniorPolitician',
  'institutionalDesk',
  'ruleBasedBot',
  'seniorResearchScientist',
  'hedgeFund',
  'mlTradingBot',
  'aiTradingBot',
  'investmentFirm',
]

export const RESEARCH_RUSH_UNIT_PRIORITY: UnitId[] = [
  'internResearchScientist',
  'intern',
  'juniorResearchScientist',
  'juniorTrader',
  'seniorResearchScientist',
  'seniorTrader',
  'quantTrader',
  'propDesk',
  'juniorPolitician',
  'institutionalDesk',
  'ruleBasedBot',
  'hedgeFund',
  'mlTradingBot',
  'aiTradingBot',
  'investmentFirm',
]

export const POLICY_PRIORITY: LobbyingPolicyId[] = LOBBYING_POLICIES.map((policy) => policy.id)
export const PRESTIGE_PRIORITY: PrestigeUpgradeId[] = PRESTIGE_UPGRADES.map((upgrade) => upgrade.id)
export const TIMED_BOOST_PRIORITY: TimedBoostId[] = ['researchSprint', 'aggressiveTradingWindow', 'deployReserveCapital', 'overclockServers', 'complianceFreeze']
export const UPGRADE_PRIORITY: UpgradeId[] = [
  'betterTerminal',
  'tradeShortcuts',
  'premiumDataFeed',
  'deskAnalytics',
  'structuredOnboarding',
  'crossDeskCoordination',
  'labAutomation',
  'researchGrants',
  'sharedResearchLibrary',
  'backtestingSuite',
  'institutionalResearchNetwork',
  'crossDisciplinaryModels',
  'propDeskOperatingModel',
  'institutionalClientBook',
  'fundStrategyCommittee',
  'globalDistributionNetwork',
  'institutionalOperatingStandards',
  'mandateAlignmentFramework',
  'systematicExecution',
  'botTelemetry',
  'executionRoutingStack',
  'modelServingCluster',
  'inferenceBatching',
  'aiRiskStack',
  'rackStacking',
  'roomScaleout',
  'coolingSystems',
  'powerDistribution',
  'dataCenterFabric',
  'cloudBurstContracts',
  'policyAnalysisDesk',
  'regulatoryCounsel',
  'donorNetwork',
  'complianceSoftwareSuite',
  'governmentRelationsOffice',
  'filingAutomation',
]

export const DEFAULT_SIM_CONFIG: SimConfig = {
  policyId: 'unlockChasing',
  researchPriority: RESEARCH_PRIORITY,
  unitPriority: UNIT_PRIORITY,
  upgradePriority: UPGRADE_PRIORITY,
  policyPriority: POLICY_PRIORITY,
  prestigePriority: PRESTIGE_PRIORITY,
  timedBoostPriority: TIMED_BOOST_PRIORITY,
  maxSeconds: 60 * 60 * 3,
  maxRuns: 12,
  tickSeconds: 1,
  manualTradesPerTick: 1,
  maxActionsPerTick: 200,
  stallWindowSeconds: 60 * 15,
  prestigeMinReputationGain: 2,
  prestigeRequiresRuleBot: false,
}

export const ROI_SIM_CONFIG: SimConfig = {
  ...DEFAULT_SIM_CONFIG,
  policyId: 'roi',
  prestigeMinReputationGain: 3,
}

export const PRESTIGE_AWARE_SIM_CONFIG: SimConfig = {
  ...DEFAULT_SIM_CONFIG,
  policyId: 'prestigeAware',
  researchPriority: [
    'foundationsOfFinanceTraining',
    'juniorTraderProgram',
    'seniorRecruitment',
    'algorithmicTrading',
    'meanReversionModels',
    'powerSystemsEngineering',
    'ruleBasedAutomation',
    'juniorScientists',
    'technologyMarkets',
    'momentumModels',
    'regulatoryAffairs',
    'propDeskOperations',
    'arbitrageEngine',
    'serverRoomSystems',
    'institutionalDesks',
    'researchSprintProtocols',
    'aggressiveTradingWindowProtocols',
    'energyMarkets',
    'marketMakingEngine',
    'seniorScientists',
    'financeMandateFramework',
    'hedgeFundStrategies',
    'deployReserveCapitalProtocols',
    'scalpingFramework',
    'dataCenterSystems',
    'machineLearningTrading',
    'investmentFirms',
    'complianceFreezeProtocols',
    'techGrowthMandateFramework',
    'energyExposureFramework',
    'overclockServersProtocols',
    'aiTradingSystems',
    'boostAutomationProtocols',
    'cloudInfrastructure',
    'financeSpecialistTraining',
    'technologySpecialistTraining',
    'energySpecialistTraining',
  ],
  unitPriority: [
    'intern',
    'juniorTrader',
    'seniorTrader',
    'quantTrader',
    'ruleBasedBot',
    'internResearchScientist',
    'juniorResearchScientist',
    'propDesk',
    'juniorPolitician',
    'seniorResearchScientist',
    'institutionalDesk',
    'hedgeFund',
    'mlTradingBot',
    'aiTradingBot',
    'investmentFirm',
  ],
  prestigeMinReputationGain: 1,
  prestigeRequiresRuleBot: true,
}

export function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    unlockedMilestones: { ...state.unlockedMilestones },
    compliancePayments: {
      staff: { ...state.compliancePayments.staff },
      energy: { ...state.compliancePayments.energy },
      automation: { ...state.compliancePayments.automation },
      institutional: { ...state.compliancePayments.institutional },
    },
    timedBoosts: {
      aggressiveTradingWindow: { ...state.timedBoosts.aggressiveTradingWindow },
      deployReserveCapital: { ...state.timedBoosts.deployReserveCapital },
      overclockServers: { ...state.timedBoosts.overclockServers },
      researchSprint: { ...state.timedBoosts.researchSprint },
      complianceFreeze: { ...state.timedBoosts.complianceFreeze },
    },
    globalBoostsOwned: { ...state.globalBoostsOwned },
    unlockedSectors: { ...state.unlockedSectors },
    automationConfig: {
      quantTrader: { ...state.automationConfig.quantTrader },
      ruleBasedBot: { ...state.automationConfig.ruleBasedBot },
      mlTradingBot: { ...state.automationConfig.mlTradingBot },
      aiTradingBot: { ...state.automationConfig.aiTradingBot },
    },
    automationCycleState: {
      quantTrader: { ...state.automationCycleState.quantTrader },
      ruleBasedBot: { ...state.automationCycleState.ruleBasedBot },
      mlTradingBot: { ...state.automationCycleState.mlTradingBot },
      aiTradingBot: { ...state.automationCycleState.aiTradingBot },
    },
    sectorAssignments: {
      intern: { ...state.sectorAssignments.intern },
      juniorTrader: { ...state.sectorAssignments.juniorTrader },
      seniorTrader: { ...state.sectorAssignments.seniorTrader },
      propDesk: { ...state.sectorAssignments.propDesk },
      institutionalDesk: { ...state.sectorAssignments.institutionalDesk },
      hedgeFund: { ...state.sectorAssignments.hedgeFund },
      investmentFirm: { ...state.sectorAssignments.investmentFirm },
    },
    traderSpecialists: {
      seniorTrader: { ...state.traderSpecialists.seniorTrader },
    },
    institutionMandates: {
      propDesk: { ...state.institutionMandates.propDesk },
      institutionalDesk: { ...state.institutionMandates.institutionalDesk },
      hedgeFund: { ...state.institutionMandates.hedgeFund },
      investmentFirm: { ...state.institutionMandates.investmentFirm },
    },
    purchasedUpgrades: { ...state.purchasedUpgrades },
    purchasedResearchTech: { ...state.purchasedResearchTech },
    purchasedPolicies: { ...state.purchasedPolicies },
    purchasedPrestigeUpgrades: { ...state.purchasedPrestigeUpgrades },
    repeatableUpgradeRanks: { ...state.repeatableUpgradeRanks },
    settings: {
      ...state.settings,
      complianceAutoPayEnabled: { ...state.settings.complianceAutoPayEnabled },
    },
    ui: {
      ...state.ui,
      capacityBuyModes: { ...state.ui.capacityBuyModes },
      powerBuyModes: { ...state.ui.powerBuyModes },
      repeatableUpgradeBuyModes: { ...state.ui.repeatableUpgradeBuyModes },
      researchBranchExpanded: { ...state.ui.researchBranchExpanded },
      prestigePurchasePlan: { ...state.ui.prestigePurchasePlan },
      dismissedSectorUnlocks: { ...state.ui.dismissedSectorUnlocks },
      unitBuyModes: { ...state.ui.unitBuyModes },
    },
  }
}

export function createInitialSimState(policyId: SimPolicyId, gameState: GameState = initialState): SimState {
  const game = cloneGameState(gameState)

  return {
    game,
    timeSeconds: 0,
    runIndex: 1,
    policyId,
    lastMeaningfulProgressTimeSeconds: 0,
    bestObservedCash: game.cash,
    bestObservedResearchPoints: game.researchPoints,
    bestObservedInfluence: game.influence,
    bestObservedLifetimeCashEarned: game.lifetimeCashEarned,
    bestObservedLifetimeResearchPointsEarned: game.lifetimeResearchPointsEarned,
  }
}

export function createInitialSimMetrics(): SimMetrics {
  return {
    unlockRecords: [],
    seenMilestoneIds: new Set<MilestoneId>(),
    stallReason: null,
    anomalyMessages: [],
  }
}

export function getMilestoneDefinition(milestoneId: MilestoneId) {
  return MILESTONES.find((milestone) => milestone.id === milestoneId)
}
