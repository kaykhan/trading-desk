import { initialState } from '../src/data/initialState'
import { LOBBYING_POLICIES, getLobbyingPolicyDefinition } from '../src/data/lobbyingPolicies'
import { POWER_INFRASTRUCTURE } from '../src/data/powerInfrastructure'
import { PRESTIGE_UPGRADES } from '../src/data/prestigeUpgrades'
import { REPEATABLE_UPGRADES, getRepeatableUpgradeCost, getRepeatableUpgradeDefinition } from '../src/data/repeatableUpgrades'
import { RESEARCH_TECH, getResearchTechDefinition } from '../src/data/researchTech'
import { UPGRADES, getUpgradeDefinition } from '../src/data/upgrades'
import type { GameState, LobbyingPolicyId, PowerInfrastructureId, PrestigeUpgradeId, RepeatableUpgradeId, ResearchTechId, UnitId, UpgradeId } from '../src/types/game'
import { getBulkPowerInfrastructureCost, getBulkUnitCost, getCashPerSecond, getInfluencePerSecond, getManualIncome, getPowerCapacity, getPowerUsage, getResearchPointsPerSecond, isPowerInfrastructureUnlocked, isUnitUnlocked } from '../src/utils/economy'
import { createPrestigeResetState, getPrestigeGain } from '../src/utils/prestige'

type SimulationConfig = {
  upgradePriority: UpgradeId[]
  researchPriority: ResearchTechId[]
  repeatablePriority: RepeatableUpgradeId[]
  unitPriority: UnitId[]
  policyPriority: LobbyingPolicyId[]
}

type PrestigeRunResult = {
  secondsToFirstSenior: number
  secondsToFirstPropDesk: number
  secondsToFirstInstitutionalDesk: number
  secondsToFirstRuleBasedBot: number
  secondsToFirstSenator: number
  secondsToPrestigeReady: number
  finalState: GameState
}

const POWER_IDS: PowerInfrastructureId[] = ['serverRack', 'serverRoom', 'dataCenter', 'cloudCompute']
const POLICY_PRIORITY: LobbyingPolicyId[] = ['capitalGainsRelief', 'hiringIncentives', 'industrialPowerSubsidies', 'deskExpansionCredits', 'executiveCompensationReform', 'automationTaxCredit', 'fastTrackServerPermits', 'priorityGridAccess', 'dataCenterEnergyCredits', 'extendedTradingWindow', 'marketDeregulation', 'aiInfrastructureIncentives']
const UPGRADE_PRIORITY: UpgradeId[] = ['betterTerminal', 'hotkeyMacros', 'premiumDataFeed', 'juniorHiringProgram', 'juniorTraderProgram', 'deskUpgrade', 'marketScanner', 'trainingProgram', 'internCohort', 'juniorAnalystProgram', 'labAutomation', 'seniorRecruitment', 'researchGrants', 'propDeskMandates', 'policyAnalysisDesk', 'donorRoundtables', 'executiveTraining', 'firmwideDeskStandards', 'systematicExecution', 'botTelemetry', 'lowLatencyServers', 'institutionalRelationships', 'executionCluster', 'modelOpsPipeline', 'fundOfFundsNetwork', 'aiRiskStack', 'globalDistribution', 'rackStacking', 'roomScaleout', 'dataCenterFabric', 'cloudBurstContracts', 'coolingSystems', 'powerDistribution']
const RESEARCH_PRIORITY: ResearchTechId[] = ['juniorScientists', 'seniorScientists', 'propDeskOperations', 'algorithmicTrading', 'powerSystemsEngineering', 'regulatoryAffairs', 'institutionalDesks', 'hedgeFundStrategies', 'investmentFirms', 'dataCenterSystems', 'aiTradingSystems']
const REPEATABLE_PRIORITY: RepeatableUpgradeId[] = ['politicalNetworking', 'constituencyResearch', 'talentHeadhunters', 'researchEndowments', 'patronageMachine', 'automationSubsidies', 'infrastructureGrants', 'juniorTraderTraining', 'behavioralModeling', 'juniorLabProtocols', 'juniorLabOptimization', 'seniorDeskPerformance', 'decisionSystems', 'propDeskScaling', 'propDeskResearch', 'internDeskTraining', 'internPlaybooks', 'internLabTraining', 'internResearchNotes', 'institutionalDeskCoordination', 'institutionalAnalytics', 'hedgeFundExecution', 'hedgeFundResearch', 'investmentFirmOperations', 'firmWideSystems', 'seniorLabMethods', 'seniorLabOptimization', 'ruleBasedExecution', 'signalRefinement', 'energyOptimization', 'rackDensity', 'serverRoomExpansion', 'dataCenterOverbuild', 'cloudFailover', 'mlModelDeployment', 'mlFeaturePipelines', 'aiClusterOrchestration', 'aiTrainingSystems', 'serverEfficiency']
const UNIT_PRIORITY: UnitId[] = ['intern', 'juniorTrader', 'internResearchScientist', 'juniorResearchScientist', 'seniorResearchScientist', 'seniorTrader', 'juniorPolitician', 'propDesk', 'institutionalDesk', 'hedgeFund', 'investmentFirm', 'ruleBasedBot', 'mlTradingBot', 'aiTradingBot']
const DEFAULT_CONFIG: SimulationConfig = { upgradePriority: UPGRADE_PRIORITY, researchPriority: RESEARCH_PRIORITY, repeatablePriority: REPEATABLE_PRIORITY, unitPriority: UNIT_PRIORITY, policyPriority: POLICY_PRIORITY }
const PRESTIGE_SPEND_PRIORITY: PrestigeUpgradeId[] = ['brandRecognition', 'seedCapital', 'betterHiringPipeline', 'institutionalKnowledge', 'gridOrchestration', 'tradeMultiplier']
const TICK_SECONDS = 1
const MAX_SECONDS = 6 * 60 * 60

function cloneState(state: GameState): GameState {
  return {
    ...state,
    purchasedUpgrades: { ...state.purchasedUpgrades },
    purchasedResearchTech: { ...state.purchasedResearchTech },
    purchasedPolicies: { ...state.purchasedPolicies },
    purchasedPrestigeUpgrades: { ...state.purchasedPrestigeUpgrades },
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
  if (!upgrade) return false
  if (upgrade.visibleWhen && !upgrade.visibleWhen(state)) return false
  if (upgrade.unlockWhen && !upgrade.unlockWhen(state)) return false

  const currentRank = state.repeatableUpgradeRanks[upgradeId] ?? 0
  const nextCost = getRepeatableUpgradeCost(upgrade.baseCost, upgrade.costScaling, currentRank)

  if (upgrade.currency === 'cash') {
    if (state.cash < nextCost) return false
    state.cash -= nextCost
  } else if (upgrade.currency === 'researchPoints') {
    if (state.researchPoints < nextCost) return false
    state.researchPoints -= nextCost
  } else {
    if (state.influence < nextCost) return false
    state.influence -= nextCost
  }

  state.repeatableUpgradeRanks[upgradeId] = currentRank + 1
  return true
}

function buyUpgrade(state: GameState, upgradeId: UpgradeId): boolean {
  const upgrade = getUpgradeDefinition(upgradeId)
  if (!upgrade || state.purchasedUpgrades[upgradeId]) return false
  if (upgrade.visibleWhen && !upgrade.visibleWhen(state)) return false
  if (state.cash < upgrade.cost) return false
  state.cash -= upgrade.cost
  state.purchasedUpgrades[upgradeId] = true
  return true
}

function buyUnit(state: GameState, unitId: UnitId): boolean {
  if (!isUnitUnlocked(state, unitId)) return false
  const result = getBulkUnitCost(state, unitId, 1)
  if (result.quantity <= 0 || state.cash < result.totalCost) return false
  state.cash -= result.totalCost

  if (unitId === 'intern') state.internCount += 1
  if (unitId === 'juniorTrader') state.juniorTraderCount += 1
  if (unitId === 'internResearchScientist') state.internResearchScientistCount += 1
  if (unitId === 'seniorTrader') state.seniorTraderCount += 1
  if (unitId === 'propDesk') state.propDeskCount += 1
  if (unitId === 'institutionalDesk') state.institutionalDeskCount += 1
  if (unitId === 'hedgeFund') state.hedgeFundCount += 1
  if (unitId === 'investmentFirm') state.investmentFirmCount += 1
  if (unitId === 'ruleBasedBot') state.ruleBasedBotCount += 1
  if (unitId === 'mlTradingBot') state.mlTradingBotCount += 1
  if (unitId === 'aiTradingBot') state.aiTradingBotCount += 1
  if (unitId === 'juniorResearchScientist') state.juniorResearchScientistCount += 1
  if (unitId === 'seniorResearchScientist') state.seniorResearchScientistCount += 1
  if (unitId === 'juniorPolitician') state.juniorPoliticianCount += 1
  return true
}

function buyResearchTech(state: GameState, techId: ResearchTechId): boolean {
  const tech = getResearchTechDefinition(techId)
  if (!tech || state.purchasedResearchTech[techId]) return false
  if (tech.visibleWhen && !tech.visibleWhen(state)) return false
  if (state.researchPoints < tech.researchCost) return false
  state.researchPoints -= tech.researchCost
  state.purchasedResearchTech[techId] = true
  state.discoveredLobbying ||= techId === 'regulatoryAffairs'
  return true
}

function buyPowerInfrastructure(state: GameState, infrastructureId: PowerInfrastructureId): boolean {
  if (!isPowerInfrastructureUnlocked(state)) return false
  const result = getBulkPowerInfrastructureCost(state, infrastructureId, 1)
  if (result.quantity <= 0 || state.cash < result.totalCost) return false
  state.cash -= result.totalCost
  if (infrastructureId === 'serverRack') state.serverRackCount += 1
  if (infrastructureId === 'serverRoom') state.serverRoomCount += 1
  if (infrastructureId === 'dataCenter') state.dataCenterCount += 1
  if (infrastructureId === 'cloudCompute') state.cloudComputeCount += 1
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
      if (result.quantity <= 0 || state.cash < result.totalCost) return null
      return { id, score: result.totalCost / POWER_INFRASTRUCTURE[id].powerCapacity }
    })
    .filter((candidate) => candidate !== null)
    .sort((left, right) => left.score - right.score)[0]

  return bestCandidate ? buyPowerInfrastructure(state, bestCandidate.id) : false
}

function buyLobbyingPolicy(state: GameState, policyId: LobbyingPolicyId): boolean {
  const policy = getLobbyingPolicyDefinition(policyId)
  if (!policy || state.purchasedPolicies[policyId] || state.purchasedResearchTech.regulatoryAffairs !== true) return false
  if (state.influence < policy.influenceCost) return false
  state.influence -= policy.influenceCost
  state.purchasedPolicies[policyId] = true
  return true
}

function tick(state: GameState): void {
  const gain = getCashPerSecond(state)
  state.cash += gain
  state.researchPoints += getResearchPointsPerSecond(state)
  state.influence += getInfluencePerSecond(state)
  state.lifetimeCashEarned += gain
}

function makeTrade(state: GameState): void {
  const gain = getManualIncome(state)
  state.cash += gain
  state.lifetimeCashEarned += gain
}

function performPurchases(state: GameState, config: SimulationConfig): void {
  while (true) {
    let changed = false

    for (const upgradeId of config.upgradePriority) changed = buyUpgrade(state, upgradeId) || changed
    for (const unitId of config.unitPriority) while (buyUnit(state, unitId)) changed = true
    for (const techId of config.researchPriority) changed = buyResearchTech(state, techId) || changed
    for (const repeatableId of config.repeatablePriority) changed = buyRepeatableUpgrade(state, repeatableId) || changed
    while (getPowerUsage(state) > getPowerCapacity(state) && buyBestPowerInfrastructure(state)) changed = true
    for (const policyId of config.policyPriority) changed = buyLobbyingPolicy(state, policyId) || changed

    if (!changed) break
  }
}

function simulateRun(startState: GameState, config: SimulationConfig): PrestigeRunResult {
  const state = cloneState(startState)
  let secondsToFirstSenior = -1
  let secondsToFirstPropDesk = -1
  let secondsToFirstInstitutionalDesk = -1
  let secondsToFirstRuleBasedBot = -1
  let secondsToFirstSenator = -1
  let secondsToPrestigeReady = -1

  for (let elapsedSeconds = 1; elapsedSeconds <= MAX_SECONDS; elapsedSeconds += TICK_SECONDS) {
    makeTrade(state)
    tick(state)
    performPurchases(state, config)

    if (secondsToFirstSenior < 0 && state.seniorTraderCount > 0) secondsToFirstSenior = elapsedSeconds
    if (secondsToFirstPropDesk < 0 && state.propDeskCount > 0) secondsToFirstPropDesk = elapsedSeconds
    if (secondsToFirstInstitutionalDesk < 0 && state.institutionalDeskCount > 0) secondsToFirstInstitutionalDesk = elapsedSeconds
    if (secondsToFirstRuleBasedBot < 0 && state.ruleBasedBotCount > 0) secondsToFirstRuleBasedBot = elapsedSeconds
    if (secondsToFirstSenator < 0 && state.juniorPoliticianCount > 0) secondsToFirstSenator = elapsedSeconds

    if (secondsToPrestigeReady < 0 && getPrestigeGain(state.lifetimeCashEarned) > 0 && state.ruleBasedBotCount > 0) {
      secondsToPrestigeReady = elapsedSeconds
      break
    }
  }

  return {
    secondsToFirstSenior,
    secondsToFirstPropDesk,
    secondsToFirstInstitutionalDesk,
    secondsToFirstRuleBasedBot,
    secondsToFirstSenator,
    secondsToPrestigeReady,
    finalState: state,
  }
}

function applyPrestigePurchases(state: GameState): string[] {
  const purchases: string[] = []

  for (const upgradeId of PRESTIGE_SPEND_PRIORITY) {
    const definition = PRESTIGE_UPGRADES.find((upgrade) => upgrade.id === upgradeId)
    if (!definition) continue

    while (state.reputation >= definition.baseCost && (state.purchasedPrestigeUpgrades[upgradeId] ?? 0) < definition.maxRank) {
      state.reputation -= definition.baseCost
      state.reputationSpent += definition.baseCost
      state.purchasedPrestigeUpgrades[upgradeId] = (state.purchasedPrestigeUpgrades[upgradeId] ?? 0) + 1
      purchases.push(`${definition.name} r${state.purchasedPrestigeUpgrades[upgradeId]}`)
    }
  }

  return purchases
}

function formatMinutes(seconds: number): string {
  return seconds < 0 ? 'not reached' : `${(seconds / 60).toFixed(1)}m`
}

function formatDelta(first: number, second: number): string {
  if (first < 0 || second < 0) return 'n/a'
  return `${((first - second) / 60).toFixed(1)}m faster`
}

const firstRun = simulateRun(initialState, DEFAULT_CONFIG)
const gainedReputation = getPrestigeGain(firstRun.finalState.lifetimeCashEarned)
const postPrestigeState = createPrestigeResetState(firstRun.finalState)
const prestigePurchases = applyPrestigePurchases(postPrestigeState)
const secondRun = simulateRun(postPrestigeState, DEFAULT_CONFIG)

console.log('Prestige effect check')
console.log(`- First-run prestige ready: ${formatMinutes(firstRun.secondsToPrestigeReady)}`)
console.log(`- Reputation gained on reset: ${gainedReputation}`)
console.log(`- Prestige upgrades bought: ${prestigePurchases.length > 0 ? prestigePurchases.join(', ') : 'none'}`)
console.log(`- Seed cash after reset: ${postPrestigeState.cash.toFixed(2)}`)
console.log(`- Second-run first Senior Trader: ${formatMinutes(secondRun.secondsToFirstSenior)} (${formatDelta(firstRun.secondsToFirstSenior, secondRun.secondsToFirstSenior)})`)
console.log(`- Second-run first Prop Desk: ${formatMinutes(secondRun.secondsToFirstPropDesk)} (${formatDelta(firstRun.secondsToFirstPropDesk, secondRun.secondsToFirstPropDesk)})`)
console.log(`- Second-run first Institutional Desk: ${formatMinutes(secondRun.secondsToFirstInstitutionalDesk)} (${formatDelta(firstRun.secondsToFirstInstitutionalDesk, secondRun.secondsToFirstInstitutionalDesk)})`)
console.log(`- Second-run first Rule-Based Bot: ${formatMinutes(secondRun.secondsToFirstRuleBasedBot)} (${formatDelta(firstRun.secondsToFirstRuleBasedBot, secondRun.secondsToFirstRuleBasedBot)})`)
console.log(`- Second-run first Senator: ${formatMinutes(secondRun.secondsToFirstSenator)} (${formatDelta(firstRun.secondsToFirstSenator, secondRun.secondsToFirstSenator)})`)
console.log(`- Second-run prestige ready: ${formatMinutes(secondRun.secondsToPrestigeReady)} (${formatDelta(firstRun.secondsToPrestigeReady, secondRun.secondsToPrestigeReady)})`)
console.log(`- Second-run ending cash/sec: ${getCashPerSecond(secondRun.finalState).toFixed(2)}`)
console.log(`- Second-run ending RP/sec: ${getResearchPointsPerSecond(secondRun.finalState).toFixed(2)}`)
console.log(`- Second-run ending influence/sec: ${getInfluencePerSecond(secondRun.finalState).toFixed(2)}`)
