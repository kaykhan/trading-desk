import { initialState } from '../src/data/initialState'
import { getLobbyingPolicyDefinition, LOBBYING_POLICIES } from '../src/data/lobbyingPolicies'
import { POWER_INFRASTRUCTURE } from '../src/data/powerInfrastructure'
import { RESEARCH_TECH } from '../src/data/researchTech'
import { getRepeatableUpgradeCost, getRepeatableUpgradeDefinition, REPEATABLE_UPGRADES } from '../src/data/repeatableUpgrades'
import { getResearchTechDefinition } from '../src/data/researchTech'
import { UPGRADES } from '../src/data/upgrades'
import { getUpgradeDefinition } from '../src/data/upgrades'
import { getBulkPowerInfrastructureCost, getBulkUnitCost, getCashPerSecond, getInfluencePerSecond, getManualIncome, getPowerCapacity, getPowerUsage, getResearchPointsPerSecond, isPowerInfrastructureUnlocked, isUnitUnlocked } from '../src/utils/economy'
import { getPrestigeGain } from '../src/utils/prestige'
import type { GameState, LobbyingPolicyId, PowerInfrastructureId, RepeatableUpgradeId, ResearchTechId, UnitId, UpgradeId } from '../src/types/game'

type SimulationResult = {
  secondsToJuniorUnlock: number
  secondsToFirstIntern: number
  secondsToJuniorTraderProgram: number
  secondsToFirstJunior: number
  secondsToSeniorUnlock: number
  secondsToFirstSenior: number
  secondsToPropDeskUnlock: number
  secondsToFirstPropDesk: number
  secondsToInstitutionalDeskUnlock: number
  secondsToFirstInstitutionalDesk: number
  secondsToHedgeFundUnlock: number
  secondsToFirstHedgeFund: number
  secondsToInvestmentFirmUnlock: number
  secondsToFirstInvestmentFirm: number
  secondsToJuniorScientists: number
  secondsToFirstInternScientist: number
  secondsToFirstJuniorScientist: number
  secondsToFirstSeniorScientist: number
  secondsToFirstPolitician: number
  secondsToAlgorithmicUnlock: number
  secondsToDataCenterTech: number
  secondsToAiTradingSystems: number
  secondsToFirstRuleBasedBot: number
  secondsToFirstMlTradingBot: number
  secondsToFirstAiTradingBot: number
  secondsToPowerUnlock: number
  secondsToFirstPowerInfrastructure: number
  secondsToFirstDataCenter: number
  secondsToFullPowerRecovery: number
  secondsToLobbyingUnlock: number
  secondsToFirstInfluence: number
  secondsToFirstPolicy: number
  secondsToFirstOptimization: number
  secondsToPrestigeReady: number
  finalState: GameState
}

type SimulationConfig = {
  name: string
  upgradePriority: UpgradeId[]
  researchPriority: ResearchTechId[]
  repeatablePriority: RepeatableUpgradeId[]
  unitPriority: UnitId[]
  policyPriority: LobbyingPolicyId[]
}

const POWER_IDS: PowerInfrastructureId[] = ['serverRack', 'serverRoom', 'dataCenter', 'cloudCompute']
const POLICY_PRIORITY: LobbyingPolicyId[] = [
  'capitalGainsRelief',
  'hiringIncentives',
  'industrialPowerSubsidies',
  'deskExpansionCredits',
  'executiveCompensationReform',
  'automationTaxCredit',
  'fastTrackServerPermits',
  'priorityGridAccess',
  'dataCenterEnergyCredits',
  'extendedTradingWindow',
  'marketDeregulation',
  'aiInfrastructureIncentives',
]

const UPGRADE_PRIORITY: UpgradeId[] = [
  'betterTerminal',
  'hotkeyMacros',
  'premiumDataFeed',
  'juniorHiringProgram',
  'juniorTraderProgram',
  'deskUpgrade',
  'marketScanner',
  'trainingProgram',
  'internCohort',
  'juniorAnalystProgram',
  'labAutomation',
  'seniorRecruitment',
  'researchGrants',
  'propDeskMandates',
  'policyAnalysisDesk',
  'donorRoundtables',
  'executiveTraining',
  'firmwideDeskStandards',
  'systematicExecution',
  'botTelemetry',
  'lowLatencyServers',
  'institutionalRelationships',
  'executionCluster',
  'modelOpsPipeline',
  'fundOfFundsNetwork',
  'aiRiskStack',
  'globalDistribution',
  'rackStacking',
  'roomScaleout',
  'dataCenterFabric',
  'cloudBurstContracts',
  'coolingSystems',
  'powerDistribution',
]

const RESEARCH_PRIORITY: ResearchTechId[] = [
  'juniorScientists',
  'seniorScientists',
  'propDeskOperations',
  'algorithmicTrading',
  'powerSystemsEngineering',
  'regulatoryAffairs',
  'institutionalDesks',
  'hedgeFundStrategies',
  'investmentFirms',
  'dataCenterSystems',
  'aiTradingSystems',
]

const REPEATABLE_PRIORITY: RepeatableUpgradeId[] = [
  'politicalNetworking',
  'constituencyResearch',
  'talentHeadhunters',
  'researchEndowments',
  'patronageMachine',
  'automationSubsidies',
  'infrastructureGrants',
  'internDeskTraining',
  'internPlaybooks',
  'internLabTraining',
  'internResearchNotes',
  'juniorTraderTraining',
  'behavioralModeling',
  'juniorLabProtocols',
  'juniorLabOptimization',
  'seniorDeskPerformance',
  'decisionSystems',
  'propDeskScaling',
  'propDeskResearch',
  'institutionalDeskCoordination',
  'institutionalAnalytics',
  'hedgeFundExecution',
  'hedgeFundResearch',
  'investmentFirmOperations',
  'firmWideSystems',
  'seniorLabMethods',
  'seniorLabOptimization',
  'ruleBasedExecution',
  'signalRefinement',
  'energyOptimization',
  'rackDensity',
  'serverRoomExpansion',
  'dataCenterOverbuild',
  'cloudFailover',
  'mlModelDeployment',
  'mlFeaturePipelines',
  'aiClusterOrchestration',
  'aiTrainingSystems',
  'serverEfficiency',
]

const UNIT_PRIORITY: UnitId[] = [
  'intern',
  'internResearchScientist',
  'juniorTrader',
  'juniorResearchScientist',
  'seniorResearchScientist',
  'seniorTrader',
  'juniorPolitician',
  'propDesk',
  'institutionalDesk',
  'hedgeFund',
  'investmentFirm',
  'ruleBasedBot',
  'mlTradingBot',
  'aiTradingBot',
]

const TICK_SECONDS = 1
const MAX_SECONDS = 6 * 60 * 60

function cloneState(state: GameState): GameState {
  return {
    ...state,
    purchasedUpgrades: { ...state.purchasedUpgrades },
    purchasedResearchTech: { ...state.purchasedResearchTech },
    purchasedPolicies: { ...state.purchasedPolicies },
    purchasedPrestigeUpgrades: { ...state.purchasedPrestigeUpgrades },
    discoveredLobbying: state.discoveredLobbying,
    repeatableUpgradeRanks: { ...state.repeatableUpgradeRanks },
    settings: { ...state.settings },
    ui: {
      ...state.ui,
      unitBuyModes: { ...state.ui.unitBuyModes },
      powerBuyModes: { ...state.ui.powerBuyModes },
      repeatableUpgradeBuyModes: { ...state.ui.repeatableUpgradeBuyModes },
    },
  }
}

function buyRepeatableUpgrade(state: GameState, upgradeId: RepeatableUpgradeId): boolean {
  const upgrade = getRepeatableUpgradeDefinition(upgradeId)

  if (!upgrade) {
    return false
  }

  if (upgrade.visibleWhen && !upgrade.visibleWhen(state)) {
    return false
  }

  if (upgrade.unlockWhen && !upgrade.unlockWhen(state)) {
    return false
  }

  const currentRank = state.repeatableUpgradeRanks[upgradeId] ?? 0
  const nextCost = getRepeatableUpgradeCost(upgrade.baseCost, upgrade.costScaling, currentRank)

  if (upgrade.currency === 'cash') {
    if (state.cash < nextCost) {
      return false
    }

    state.cash -= nextCost
  } else if (upgrade.currency === 'researchPoints') {
    if (state.researchPoints < nextCost) {
      return false
    }

    state.researchPoints -= nextCost
  } else {
    if (state.influence < nextCost) {
      return false
    }

    state.influence -= nextCost
  }

  state.repeatableUpgradeRanks[upgradeId] = currentRank + 1
  return true
}

function tick(state: GameState, deltaSeconds: number): void {
  const gain = getCashPerSecond(state) * deltaSeconds
  const researchGain = getResearchPointsPerSecond(state) * deltaSeconds
  const influenceGain = getInfluencePerSecond(state) * deltaSeconds
  state.cash += gain
  state.researchPoints += researchGain
  state.influence += influenceGain
  state.lifetimeCashEarned += gain
}

function makeTrade(state: GameState): void {
  const gain = getManualIncome(state)
  state.cash += gain
  state.lifetimeCashEarned += gain
}

function buyUpgrade(state: GameState, upgradeId: UpgradeId): boolean {
  const upgrade = getUpgradeDefinition(upgradeId)

  if (!upgrade || state.purchasedUpgrades[upgradeId]) {
    return false
  }

  if (upgrade.visibleWhen && !upgrade.visibleWhen(state)) {
    return false
  }

  if (state.cash < upgrade.cost) {
    return false
  }

  state.cash -= upgrade.cost
  state.purchasedUpgrades[upgradeId] = true
  return true
}

function buyUnit(state: GameState, unitId: UnitId): boolean {
  if (!isUnitUnlocked(state, unitId)) {
    return false
  }

  const result = getBulkUnitCost(state, unitId, 1)

  if (result.quantity <= 0 || state.cash < result.totalCost) {
    return false
  }

  state.cash -= result.totalCost

  if (unitId === 'intern') {
    state.internCount += 1
  }

  if (unitId === 'internResearchScientist') {
    state.internResearchScientistCount += 1
  }

  if (unitId === 'juniorTrader') {
    state.juniorTraderCount += 1
  }

  if (unitId === 'seniorTrader') {
    state.seniorTraderCount += 1
  }

  if (unitId === 'propDesk') {
    state.propDeskCount += 1
  }

  if (unitId === 'institutionalDesk') {
    state.institutionalDeskCount += 1
  }

  if (unitId === 'hedgeFund') {
    state.hedgeFundCount += 1
  }

  if (unitId === 'investmentFirm') {
    state.investmentFirmCount += 1
  }

  if (unitId === 'ruleBasedBot') {
    state.ruleBasedBotCount += 1
  }

  if (unitId === 'mlTradingBot') {
    state.mlTradingBotCount += 1
  }

  if (unitId === 'aiTradingBot') {
    state.aiTradingBotCount += 1
  }

  if (unitId === 'juniorResearchScientist') {
    state.juniorResearchScientistCount += 1
  }

  if (unitId === 'seniorResearchScientist') {
    state.seniorResearchScientistCount += 1
  }

  if (unitId === 'juniorPolitician') {
    state.juniorPoliticianCount += 1
  }

  return true
}

function buyResearchTech(state: GameState, techId: ResearchTechId): boolean {
  const tech = getResearchTechDefinition(techId)

  if (!tech || state.purchasedResearchTech[techId]) {
    return false
  }

  if (tech.visibleWhen && !tech.visibleWhen(state)) {
    return false
  }

  if (state.researchPoints < tech.researchCost) {
    return false
  }

  state.researchPoints -= tech.researchCost
  state.purchasedResearchTech[techId] = true
  state.discoveredLobbying ||= techId === 'regulatoryAffairs'
  return true
}

function buyPowerInfrastructure(state: GameState, infrastructureId: PowerInfrastructureId): boolean {
  if (!isPowerInfrastructureUnlocked(state)) {
    return false
  }

  const result = getBulkPowerInfrastructureCost(state, infrastructureId, 1)

  if (result.quantity <= 0 || state.cash < result.totalCost) {
    return false
  }

  state.cash -= result.totalCost

  if (infrastructureId === 'serverRack') {
    state.serverRackCount += 1
  }

  if (infrastructureId === 'serverRoom') {
    state.serverRoomCount += 1
  }

  if (infrastructureId === 'dataCenter') {
    state.dataCenterCount += 1
  }

  if (infrastructureId === 'cloudCompute') {
    state.cloudComputeCount += 1
  }

  return true
}

function buyBestPowerInfrastructure(state: GameState): boolean {
  if (state.purchasedResearchTech.propDeskOperations && state.serverRoomCount < 1) {
    return buyPowerInfrastructure(state, 'serverRoom')
  }

  if (state.purchasedResearchTech.dataCenterSystems && state.dataCenterCount < 1) {
    return buyPowerInfrastructure(state, 'dataCenter')
  }

  if (state.purchasedResearchTech.aiTradingSystems && state.cloudComputeCount < 1) {
    return buyPowerInfrastructure(state, 'cloudCompute')
  }

  const bestCandidate = POWER_IDS
    .map((id) => {
      const result = getBulkPowerInfrastructureCost(state, id, 1)

      if (result.quantity <= 0 || state.cash < result.totalCost) {
        return null
      }

      return {
        id,
        totalCost: result.totalCost,
        score: result.totalCost / POWER_INFRASTRUCTURE[id].powerCapacity,
      }
    })
    .filter((candidate) => candidate !== null)
    .sort((left, right) => left.score - right.score)[0]

  return bestCandidate ? buyPowerInfrastructure(state, bestCandidate.id) : false
}

function buyLobbyingPolicy(state: GameState, policyId: LobbyingPolicyId): boolean {
  const policy = getLobbyingPolicyDefinition(policyId)

  if (!policy || state.purchasedPolicies[policyId] || state.purchasedResearchTech.regulatoryAffairs !== true) {
    return false
  }

  if (state.influence < policy.influenceCost) {
    return false
  }

  state.influence -= policy.influenceCost
  state.purchasedPolicies[policyId] = true
  return true
}

function performPurchases(state: GameState, config: SimulationConfig): void {
  while (true) {
    let changed = false

    for (const upgradeId of config.upgradePriority) {
      changed = buyUpgrade(state, upgradeId) || changed
    }

    for (const unitId of config.unitPriority) {
      while (buyUnit(state, unitId)) {
        changed = true
      }
    }

    for (const techId of config.researchPriority) {
      changed = buyResearchTech(state, techId) || changed
    }

    for (const repeatableId of config.repeatablePriority) {
      changed = buyRepeatableUpgrade(state, repeatableId) || changed
    }

    while (getPowerUsage(state) > getPowerCapacity(state) && buyBestPowerInfrastructure(state)) {
      changed = true
    }

    for (const policyId of config.policyPriority) {
      changed = buyLobbyingPolicy(state, policyId) || changed
    }

    if (!changed) {
      break
    }
  }
}

function simulateRun(config: SimulationConfig): SimulationResult {
  const state = cloneState(initialState)
  let secondsToJuniorUnlock = -1
  let secondsToFirstIntern = -1
  let secondsToJuniorTraderProgram = -1
  let secondsToFirstJunior = -1
  let secondsToSeniorUnlock = -1
  let secondsToFirstSenior = -1
  let secondsToPropDeskUnlock = -1
  let secondsToFirstPropDesk = -1
  let secondsToInstitutionalDeskUnlock = -1
  let secondsToFirstInstitutionalDesk = -1
  let secondsToHedgeFundUnlock = -1
  let secondsToFirstHedgeFund = -1
  let secondsToInvestmentFirmUnlock = -1
  let secondsToFirstInvestmentFirm = -1
  let secondsToJuniorScientists = -1
  let secondsToFirstInternScientist = -1
  let secondsToFirstJuniorScientist = -1
  let secondsToFirstSeniorScientist = -1
  let secondsToFirstPolitician = -1
  let secondsToAlgorithmicUnlock = -1
  let secondsToDataCenterTech = -1
  let secondsToAiTradingSystems = -1
  let secondsToFirstRuleBasedBot = -1
  let secondsToFirstMlTradingBot = -1
  let secondsToFirstAiTradingBot = -1
  let secondsToPowerUnlock = -1
  let secondsToFirstPowerInfrastructure = -1
  let secondsToFirstDataCenter = -1
  let secondsToFullPowerRecovery = -1
  let secondsToLobbyingUnlock = -1
  let secondsToFirstInfluence = -1
  let secondsToFirstPolicy = -1
  let secondsToFirstOptimization = -1
  let secondsToPrestigeReady = -1

  for (let elapsedSeconds = 1; elapsedSeconds <= MAX_SECONDS; elapsedSeconds += TICK_SECONDS) {
    makeTrade(state)
    tick(state, TICK_SECONDS)
    performPurchases(state, config)

    if (secondsToJuniorUnlock < 0 && state.purchasedUpgrades.juniorHiringProgram) {
      secondsToJuniorUnlock = elapsedSeconds
    }

    if (secondsToFirstIntern < 0 && state.internCount > 0) {
      secondsToFirstIntern = elapsedSeconds
    }

    if (secondsToJuniorTraderProgram < 0 && state.purchasedUpgrades.juniorTraderProgram) {
      secondsToJuniorTraderProgram = elapsedSeconds
    }

    if (secondsToFirstJunior < 0 && state.juniorTraderCount > 0) {
      secondsToFirstJunior = elapsedSeconds
    }

    if (secondsToSeniorUnlock < 0 && state.purchasedUpgrades.seniorRecruitment) {
      secondsToSeniorUnlock = elapsedSeconds
    }

    if (secondsToFirstSenior < 0 && state.seniorTraderCount > 0) {
      secondsToFirstSenior = elapsedSeconds
    }

    if (secondsToPropDeskUnlock < 0 && state.purchasedResearchTech.propDeskOperations) {
      secondsToPropDeskUnlock = elapsedSeconds
    }

    if (secondsToFirstPropDesk < 0 && state.propDeskCount > 0) {
      secondsToFirstPropDesk = elapsedSeconds
    }

    if (secondsToInstitutionalDeskUnlock < 0 && state.purchasedResearchTech.institutionalDesks) {
      secondsToInstitutionalDeskUnlock = elapsedSeconds
    }

    if (secondsToFirstInstitutionalDesk < 0 && state.institutionalDeskCount > 0) {
      secondsToFirstInstitutionalDesk = elapsedSeconds
    }

    if (secondsToHedgeFundUnlock < 0 && state.purchasedResearchTech.hedgeFundStrategies) {
      secondsToHedgeFundUnlock = elapsedSeconds
    }

    if (secondsToFirstHedgeFund < 0 && state.hedgeFundCount > 0) {
      secondsToFirstHedgeFund = elapsedSeconds
    }

    if (secondsToInvestmentFirmUnlock < 0 && state.purchasedResearchTech.investmentFirms) {
      secondsToInvestmentFirmUnlock = elapsedSeconds
    }

    if (secondsToFirstInvestmentFirm < 0 && state.investmentFirmCount > 0) {
      secondsToFirstInvestmentFirm = elapsedSeconds
    }

    if (secondsToJuniorScientists < 0 && state.purchasedResearchTech.juniorScientists) {
      secondsToJuniorScientists = elapsedSeconds
    }

    if (secondsToFirstInternScientist < 0 && state.internResearchScientistCount > 0) {
      secondsToFirstInternScientist = elapsedSeconds
    }

    if (secondsToFirstJuniorScientist < 0 && state.juniorResearchScientistCount > 0) {
      secondsToFirstJuniorScientist = elapsedSeconds
    }

    if (secondsToFirstSeniorScientist < 0 && state.seniorResearchScientistCount > 0) {
      secondsToFirstSeniorScientist = elapsedSeconds
    }

    if (secondsToFirstPolitician < 0 && state.juniorPoliticianCount > 0) {
      secondsToFirstPolitician = elapsedSeconds
    }

    if (secondsToAlgorithmicUnlock < 0 && state.purchasedResearchTech.algorithmicTrading) {
      secondsToAlgorithmicUnlock = elapsedSeconds
    }

    if (secondsToDataCenterTech < 0 && state.purchasedResearchTech.dataCenterSystems) {
      secondsToDataCenterTech = elapsedSeconds
    }

    if (secondsToAiTradingSystems < 0 && state.purchasedResearchTech.aiTradingSystems) {
      secondsToAiTradingSystems = elapsedSeconds
    }

    if (secondsToFirstRuleBasedBot < 0 && state.ruleBasedBotCount > 0) {
      secondsToFirstRuleBasedBot = elapsedSeconds
    }

    if (secondsToFirstMlTradingBot < 0 && state.mlTradingBotCount > 0) {
      secondsToFirstMlTradingBot = elapsedSeconds
    }

    if (secondsToFirstAiTradingBot < 0 && state.aiTradingBotCount > 0) {
      secondsToFirstAiTradingBot = elapsedSeconds
    }

    if (secondsToPowerUnlock < 0 && state.purchasedResearchTech.powerSystemsEngineering) {
      secondsToPowerUnlock = elapsedSeconds
    }

    if (secondsToFirstPowerInfrastructure < 0 && (state.serverRackCount > 0 || state.serverRoomCount > 0 || state.dataCenterCount > 0 || state.cloudComputeCount > 0)) {
      secondsToFirstPowerInfrastructure = elapsedSeconds
    }

    if (secondsToFirstDataCenter < 0 && state.dataCenterCount > 0) {
      secondsToFirstDataCenter = elapsedSeconds
    }

    if (secondsToFullPowerRecovery < 0 && (state.ruleBasedBotCount > 0 || state.mlTradingBotCount > 0 || state.aiTradingBotCount > 0) && getPowerUsage(state) > 0 && getPowerCapacity(state) >= getPowerUsage(state)) {
      secondsToFullPowerRecovery = elapsedSeconds
    }

    if (secondsToLobbyingUnlock < 0 && state.purchasedResearchTech.regulatoryAffairs) {
      secondsToLobbyingUnlock = elapsedSeconds
    }

    if (secondsToFirstInfluence < 0 && state.influence > 0) {
      secondsToFirstInfluence = elapsedSeconds
    }

    if (secondsToFirstPolicy < 0 && Object.keys(state.purchasedPolicies).length > 0) {
      secondsToFirstPolicy = elapsedSeconds
    }

    if (secondsToFirstOptimization < 0 && REPEATABLE_UPGRADES.some((upgrade) => (state.repeatableUpgradeRanks[upgrade.id] ?? 0) > 0)) {
      secondsToFirstOptimization = elapsedSeconds
    }

    if (secondsToPrestigeReady < 0 && getPrestigeGain(state.lifetimeCashEarned) > 0 && state.ruleBasedBotCount > 0) {
      secondsToPrestigeReady = elapsedSeconds
      break
    }
  }

  return {
    secondsToJuniorUnlock,
    secondsToFirstIntern,
    secondsToJuniorTraderProgram,
    secondsToFirstJunior,
    secondsToSeniorUnlock,
    secondsToFirstSenior,
    secondsToPropDeskUnlock,
    secondsToFirstPropDesk,
    secondsToInstitutionalDeskUnlock,
    secondsToFirstInstitutionalDesk,
    secondsToHedgeFundUnlock,
    secondsToFirstHedgeFund,
    secondsToInvestmentFirmUnlock,
    secondsToFirstInvestmentFirm,
    secondsToJuniorScientists,
    secondsToFirstInternScientist,
    secondsToFirstJuniorScientist,
    secondsToFirstSeniorScientist,
    secondsToFirstPolitician,
    secondsToAlgorithmicUnlock,
    secondsToDataCenterTech,
    secondsToAiTradingSystems,
    secondsToFirstRuleBasedBot,
    secondsToFirstMlTradingBot,
    secondsToFirstAiTradingBot,
    secondsToPowerUnlock,
    secondsToFirstPowerInfrastructure,
    secondsToFirstDataCenter,
    secondsToFullPowerRecovery,
    secondsToLobbyingUnlock,
    secondsToFirstInfluence,
    secondsToFirstPolicy,
    secondsToFirstOptimization,
    secondsToPrestigeReady,
    finalState: state,
  }
}

function formatMinutes(seconds: number): string {
  if (seconds < 0) {
    return 'not reached'
  }

  return `${(seconds / 60).toFixed(1)}m`
}

function formatPassFail(condition: boolean): string {
  return condition ? 'PASS' : 'FAIL'
}

function printMilestoneChecks(result: SimulationResult): void {
  const checks = [
    {
      label: 'Junior Trader Program unlocks before first Junior Trader',
      condition: result.secondsToJuniorTraderProgram >= 0 && result.secondsToJuniorTraderProgram <= result.secondsToFirstJunior,
    },
    {
      label: 'Seniors unlock before first Senior Trader',
      condition: result.secondsToSeniorUnlock >= 0 && result.secondsToSeniorUnlock <= result.secondsToFirstSenior,
    },
    {
      label: 'Prop Desk research before first Prop Desk',
      condition: result.secondsToPropDeskUnlock >= 0 && result.secondsToPropDeskUnlock <= result.secondsToFirstPropDesk,
    },
    {
      label: 'Algorithmic research before first Rule-Based Bot',
      condition: result.secondsToAlgorithmicUnlock >= 0 && result.secondsToAlgorithmicUnlock <= result.secondsToFirstRuleBasedBot,
    },
    {
      label: 'Power support online before first Rule-Based Bot',
      condition: result.secondsToFirstPowerInfrastructure >= 0 && result.secondsToFirstPowerInfrastructure <= result.secondsToFirstRuleBasedBot,
    },
    {
      label: 'Prestige arrives after first Rule-Based Bot',
      condition: result.secondsToPrestigeReady >= 0 && result.secondsToFirstRuleBasedBot >= 0 && result.secondsToPrestigeReady >= result.secondsToFirstRuleBasedBot,
    },
  ]

  console.log('** Milestone Checks')
  for (const check of checks) {
    console.log(`- ${formatPassFail(check.condition)}: ${check.label}`)
  }
}

function printProgressionDiagnostics(result: SimulationResult): void {
  const powerHeadroom = getPowerCapacity(result.finalState) - getPowerUsage(result.finalState)
  const diagnostics = [
    `Prop Desk before prestige: ${result.secondsToFirstPropDesk >= 0 ? 'yes' : 'no'}`,
    `Institutional Desk before prestige: ${result.secondsToFirstInstitutionalDesk >= 0 ? 'yes' : 'no'}`,
    `Lobbying online before prestige: ${result.secondsToLobbyingUnlock >= 0 ? 'yes' : 'no'}`,
    `Ending power headroom: ${powerHeadroom.toFixed(2)}`,
    `Ending machine efficiency: ${(Math.min(1, getPowerCapacity(result.finalState) / Math.max(getPowerUsage(result.finalState), 1)) * 100).toFixed(0)}%`,
  ]

  console.log('** Progression Diagnostics')
  for (const line of diagnostics) {
    console.log(`- ${line}`)
  }
}

const DEFAULT_CONFIG: SimulationConfig = {
  name: 'Default',
  upgradePriority: UPGRADE_PRIORITY,
  researchPriority: RESEARCH_PRIORITY,
  repeatablePriority: REPEATABLE_PRIORITY,
  unitPriority: UNIT_PRIORITY,
  policyPriority: POLICY_PRIORITY,
}

const HUMAN_FOCUS_CONFIG: SimulationConfig = {
  ...DEFAULT_CONFIG,
  name: 'Human Focus',
  unitPriority: [
    'juniorTrader',
    'seniorTrader',
    'propDesk',
    'institutionalDesk',
    'hedgeFund',
    'investmentFirm',
    'juniorResearchScientist',
    'seniorResearchScientist',
    'juniorPolitician',
    'ruleBasedBot',
    'mlTradingBot',
    'aiTradingBot',
  ],
  researchPriority: [
    'seniorScientists',
    'propDeskOperations',
    'institutionalDesks',
    'algorithmicTrading',
    'powerSystemsEngineering',
    'regulatoryAffairs',
    'hedgeFundStrategies',
    'investmentFirms',
    'dataCenterSystems',
    'aiTradingSystems',
  ],
}

const LOBBYING_FOCUS_CONFIG: SimulationConfig = {
  ...DEFAULT_CONFIG,
  name: 'Lobbying Focus',
  researchPriority: [
    'seniorScientists',
    'propDeskOperations',
    'algorithmicTrading',
    'powerSystemsEngineering',
    'regulatoryAffairs',
    'institutionalDesks',
    'hedgeFundStrategies',
    'investmentFirms',
    'dataCenterSystems',
    'aiTradingSystems',
  ],
  repeatablePriority: [
    'politicalNetworking',
    'constituencyResearch',
    'talentHeadhunters',
    'researchEndowments',
    'patronageMachine',
    'automationSubsidies',
    'infrastructureGrants',
    ...REPEATABLE_PRIORITY.filter((id) => !['politicalNetworking', 'constituencyResearch', 'talentHeadhunters', 'researchEndowments', 'patronageMachine', 'automationSubsidies', 'infrastructureGrants'].includes(id)),
  ],
  policyPriority: POLICY_PRIORITY,
}

const result = simulateRun(DEFAULT_CONFIG)
const humanFocusResult = simulateRun(HUMAN_FOCUS_CONFIG)
const lobbyingFocusResult = simulateRun(LOBBYING_FOCUS_CONFIG)
const aiBotExpectedAfterPrestige = result.secondsToFirstAiTradingBot < 0 && result.secondsToPrestigeReady > 0
const totalCashSpent = initialState.cash + result.finalState.lifetimeCashEarned - result.finalState.cash
const purchasedOptimizationSummaries = REPEATABLE_UPGRADES
  .map((upgrade) => ({
    name: upgrade.name,
    rank: result.finalState.repeatableUpgradeRanks[upgrade.id] ?? 0,
  }))
  .filter((upgrade) => upgrade.rank > 0)

console.log('Comprehensive balance check results')
console.log(`- Recruiter: ${formatMinutes(result.secondsToJuniorUnlock)}`)
console.log(`- First Intern: ${formatMinutes(result.secondsToFirstIntern)}`)
console.log(`- Junior Trader Program: ${formatMinutes(result.secondsToJuniorTraderProgram)}`)
console.log(`- First Junior Trader: ${formatMinutes(result.secondsToFirstJunior)}`)
console.log(`- Senior Recruitment: ${formatMinutes(result.secondsToSeniorUnlock)}`)
console.log(`- First Senior Trader: ${formatMinutes(result.secondsToFirstSenior)}`)
console.log(`- Prop Desk Operations: ${formatMinutes(result.secondsToPropDeskUnlock)}`)
console.log(`- First Prop Desk: ${formatMinutes(result.secondsToFirstPropDesk)}`)
console.log(`- Institutional Desks: ${formatMinutes(result.secondsToInstitutionalDeskUnlock)}`)
console.log(`- First Institutional Desk: ${formatMinutes(result.secondsToFirstInstitutionalDesk)}`)
console.log(`- Hedge Fund Strategies: ${formatMinutes(result.secondsToHedgeFundUnlock)}`)
console.log(`- First Hedge Fund: ${formatMinutes(result.secondsToFirstHedgeFund)}`)
console.log(`- Investment Firms: ${formatMinutes(result.secondsToInvestmentFirmUnlock)}`)
console.log(`- First Investment Firm: ${formatMinutes(result.secondsToFirstInvestmentFirm)}`)
console.log(`- Junior Scientists: ${formatMinutes(result.secondsToJuniorScientists)}`)
console.log(`- First Intern Scientist: ${formatMinutes(result.secondsToFirstInternScientist)}`)
console.log(`- First Junior Scientist: ${formatMinutes(result.secondsToFirstJuniorScientist)}`)
console.log(`- First Senior Scientist: ${formatMinutes(result.secondsToFirstSeniorScientist)}`)
console.log(`- First Senator: ${formatMinutes(result.secondsToFirstPolitician)}`)
console.log(`- Algorithmic Trading: ${formatMinutes(result.secondsToAlgorithmicUnlock)}`)
console.log(`- First Optimization: ${formatMinutes(result.secondsToFirstOptimization)}`)
console.log(`- Data Centre Systems: ${formatMinutes(result.secondsToDataCenterTech)}`)
console.log(`- AI Trading Systems: ${formatMinutes(result.secondsToAiTradingSystems)}`)
console.log(`- First Rule-Based Bot: ${formatMinutes(result.secondsToFirstRuleBasedBot)}`)
console.log(`- First ML Trading Bot: ${formatMinutes(result.secondsToFirstMlTradingBot)}`)
console.log(`- First AI Trading Bot: ${formatMinutes(result.secondsToFirstAiTradingBot)}`)
console.log(`- Power Systems Engineering: ${formatMinutes(result.secondsToPowerUnlock)}`)
console.log(`- First Power Infrastructure: ${formatMinutes(result.secondsToFirstPowerInfrastructure)}`)
console.log(`- First Data Centre: ${formatMinutes(result.secondsToFirstDataCenter)}`)
console.log(`- Full Bot Power Coverage: ${formatMinutes(result.secondsToFullPowerRecovery)}`)
console.log(`- Regulatory Affairs: ${formatMinutes(result.secondsToLobbyingUnlock)}`)
console.log(`- First Influence: ${formatMinutes(result.secondsToFirstInfluence)}`)
console.log(`- First Policy Passed: ${formatMinutes(result.secondsToFirstPolicy)}`)
console.log(`- Prestige Ready: ${formatMinutes(result.secondsToPrestigeReady)}`)
console.log(`- Current cash: ${result.finalState.cash.toFixed(2)}`)
console.log(`- Current research points: ${result.finalState.researchPoints.toFixed(2)}`)
console.log(`- Current influence: ${result.finalState.influence.toFixed(2)}`)
console.log(`- Lifetime cash: ${result.finalState.lifetimeCashEarned.toFixed(2)}`)
console.log(`- Cash spent: ${totalCashSpent.toFixed(2)}`)
console.log(`- Ending cash/sec: ${getCashPerSecond(result.finalState).toFixed(2)}`)
console.log(`- Ending algorithmic ladder: ${result.finalState.ruleBasedBotCount}/${result.finalState.mlTradingBotCount}/${result.finalState.aiTradingBotCount}`)
console.log(`- Ending traders: ${result.finalState.internCount}/${result.finalState.juniorTraderCount}/${result.finalState.seniorTraderCount}`)
console.log(`- Ending trading orgs: ${result.finalState.propDeskCount}/${result.finalState.institutionalDeskCount}/${result.finalState.hedgeFundCount}/${result.finalState.investmentFirmCount}`)
console.log(`- Ending research scientists: ${result.finalState.internResearchScientistCount}/${result.finalState.juniorResearchScientistCount}/${result.finalState.seniorResearchScientistCount}`)
console.log(`- Ending senators: ${result.finalState.juniorPoliticianCount}`)
console.log(`- Ending machine infrastructure: ${result.finalState.serverRackCount}/${result.finalState.serverRoomCount}/${result.finalState.dataCenterCount}/${result.finalState.cloudComputeCount}`)
console.log(`- Upgrades purchased: ${UPGRADES.filter((upgrade) => result.finalState.purchasedUpgrades[upgrade.id]).length}/${UPGRADES.length}`)
console.log(`- Research techs purchased: ${RESEARCH_TECH.filter((tech) => result.finalState.purchasedResearchTech[tech.id]).length}/${RESEARCH_TECH.length}`)
console.log(`- Optimization ranks purchased: ${REPEATABLE_UPGRADES.filter((upgrade) => (result.finalState.repeatableUpgradeRanks[upgrade.id] ?? 0) > 0).length}/${REPEATABLE_UPGRADES.length}`)
console.log(`- Purchased optimizations: ${purchasedOptimizationSummaries.length > 0 ? purchasedOptimizationSummaries.map((upgrade) => `${upgrade.name} r${upgrade.rank}`).join(', ') : 'none'}`)
console.log(`- Policies passed: ${LOBBYING_POLICIES.filter((policy) => result.finalState.purchasedPolicies[policy.id]).length}/${LOBBYING_POLICIES.length}`)
if (aiBotExpectedAfterPrestige) {
  console.log('- AI Trading Bot timing: not reached before prestige (expected for late-run content)')
}
printMilestoneChecks(result)
printProgressionDiagnostics(result)
console.log('** Scenario Comparison')
console.log(`- Default prestige ready: ${formatMinutes(result.secondsToPrestigeReady)}`)
console.log(`- Human Focus first institutional desk: ${formatMinutes(humanFocusResult.secondsToFirstInstitutionalDesk)}`)
console.log(`- Human Focus prestige ready: ${formatMinutes(humanFocusResult.secondsToPrestigeReady)}`)
console.log(`- Lobbying Focus first senator: ${formatMinutes(lobbyingFocusResult.secondsToFirstPolitician)}`)
console.log(`- Lobbying Focus first policy: ${formatMinutes(lobbyingFocusResult.secondsToFirstPolicy)}`)
console.log(`- Lobbying Focus prestige ready: ${formatMinutes(lobbyingFocusResult.secondsToPrestigeReady)}`)
