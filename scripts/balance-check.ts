import { initialState } from '../src/data/initialState'
import { getLobbyingPolicyDefinition, LOBBYING_POLICIES } from '../src/data/lobbyingPolicies'
import { POWER_INFRASTRUCTURE } from '../src/data/powerInfrastructure'
import { getResearchTechDefinition } from '../src/data/researchTech'
import { getUpgradeDefinition } from '../src/data/upgrades'
import { getBulkPowerInfrastructureCost, getBulkUnitCost, getCashPerSecond, getInfluencePerSecond, getManualIncome, getPowerCapacity, getPowerUsage, getResearchPointsPerSecond, isPowerInfrastructureUnlocked, isUnitUnlocked } from '../src/utils/economy'
import { getPrestigeGain } from '../src/utils/prestige'
import type { GameState, LobbyingPolicyId, PowerInfrastructureId, ResearchTechId, UnitId, UpgradeId } from '../src/types/game'

type SimulationResult = {
  secondsToJuniorUnlock: number
  secondsToFirstJunior: number
  secondsToSeniorUnlock: number
  secondsToFirstSenior: number
  secondsToFirstJuniorScientist: number
  secondsToFirstSeniorScientist: number
  secondsToBotUnlock: number
  secondsToFirstTradingServer: number
  secondsToFirstBot: number
  secondsToPowerUnlock: number
  secondsToFirstPowerInfrastructure: number
  secondsToFullPowerRecovery: number
  secondsToLobbyingUnlock: number
  secondsToFirstInfluence: number
  secondsToFirstPolicy: number
  secondsToPrestigeReady: number
  finalState: GameState
}

const POWER_IDS: PowerInfrastructureId[] = ['serverRoom', 'dataCenter']
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

const TICK_SECONDS = 1
const MAX_SECONDS = 6 * 60 * 60

function cloneState(state: GameState): GameState {
  return {
    ...state,
    purchasedUpgrades: { ...state.purchasedUpgrades },
    purchasedResearchTech: { ...state.purchasedResearchTech },
    purchasedPolicies: { ...state.purchasedPolicies },
    purchasedPrestigeUpgrades: { ...state.purchasedPrestigeUpgrades },
    settings: { ...state.settings },
    ui: {
      ...state.ui,
      unitBuyModes: { ...state.ui.unitBuyModes },
      powerBuyModes: { ...state.ui.powerBuyModes },
    },
  }
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

  if (unitId === 'juniorTrader') {
    state.juniorTraderCount += 1
  }

  if (unitId === 'seniorTrader') {
    state.seniorTraderCount += 1
  }

  if (unitId === 'tradingBot') {
    state.tradingBotCount += 1
  }

  if (unitId === 'tradingServer') {
    state.tradingServerCount += 1
  }

  if (unitId === 'juniorResearchScientist') {
    state.juniorResearchScientistCount += 1
  }

  if (unitId === 'seniorResearchScientist') {
    state.seniorResearchScientistCount += 1
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

  if (infrastructureId === 'serverRoom') {
    state.serverRoomCount += 1
  }

  if (infrastructureId === 'dataCenter') {
    state.dataCenterCount += 1
  }

  return true
}

function buyBestPowerInfrastructure(state: GameState): boolean {
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

function performPurchases(state: GameState): void {
  while (true) {
    let changed = false

    changed = buyUpgrade(state, 'betterTerminal') || changed
    changed = buyUpgrade(state, 'hotkeyMacros') || changed
    changed = buyUpgrade(state, 'premiumDataFeed') || changed
    changed = buyUpgrade(state, 'juniorHiringProgram') || changed

    while (buyUnit(state, 'juniorTrader')) {
      changed = true
    }

    changed = buyUpgrade(state, 'deskUpgrade') || changed
    changed = buyUpgrade(state, 'marketScanner') || changed
    changed = buyUpgrade(state, 'tradeMultiplier') || changed
    changed = buyUpgrade(state, 'trainingProgram') || changed
    changed = buyUpgrade(state, 'bullMarket') || changed
    changed = buyResearchTech(state, 'seniorScientists') || changed
    changed = buyUpgrade(state, 'seniorRecruitment') || changed

    while (buyUnit(state, 'juniorResearchScientist')) {
      changed = true
    }

    changed = buyUpgrade(state, 'labAutomation') || changed

    while (buyUnit(state, 'seniorResearchScientist')) {
      changed = true
    }

    changed = buyUpgrade(state, 'researchGrants') || changed
    changed = buyUpgrade(state, 'policyAnalysisDesk') || changed

    while (buyUnit(state, 'seniorTrader')) {
      changed = true
    }

    changed = buyUpgrade(state, 'executiveTraining') || changed
    changed = buyResearchTech(state, 'algorithmicTrading') || changed
    changed = buyResearchTech(state, 'powerSystemsEngineering') || changed
    changed = buyResearchTech(state, 'dataCenterSystems') || changed
    changed = buyResearchTech(state, 'tradingServers') || changed
    changed = buyResearchTech(state, 'regulatoryAffairs') || changed

    while (buyUnit(state, 'tradingBot')) {
      changed = true
    }

    changed = buyUpgrade(state, 'botTelemetry') || changed

    while (buyUnit(state, 'tradingServer')) {
      changed = true
    }

    changed = buyUpgrade(state, 'lowLatencyServers') || changed
    changed = buyUpgrade(state, 'executionCluster') || changed
    changed = buyUpgrade(state, 'coolingSystems') || changed
    changed = buyUpgrade(state, 'powerDistribution') || changed

    while (getPowerUsage(state) > getPowerCapacity(state) && buyBestPowerInfrastructure(state)) {
      changed = true
    }

    for (const policyId of POLICY_PRIORITY) {
      changed = buyLobbyingPolicy(state, policyId) || changed
    }

    if (!changed) {
      break
    }
  }
}

function simulateRun(): SimulationResult {
  const state = cloneState(initialState)
  let secondsToJuniorUnlock = -1
  let secondsToFirstJunior = -1
  let secondsToSeniorUnlock = -1
  let secondsToFirstSenior = -1
  let secondsToFirstJuniorScientist = -1
  let secondsToFirstSeniorScientist = -1
  let secondsToBotUnlock = -1
  let secondsToFirstTradingServer = -1
  let secondsToFirstBot = -1
  let secondsToPowerUnlock = -1
  let secondsToFirstPowerInfrastructure = -1
  let secondsToFullPowerRecovery = -1
  let secondsToLobbyingUnlock = -1
  let secondsToFirstInfluence = -1
  let secondsToFirstPolicy = -1
  let secondsToPrestigeReady = -1

  for (let elapsedSeconds = 1; elapsedSeconds <= MAX_SECONDS; elapsedSeconds += TICK_SECONDS) {
    makeTrade(state)
    tick(state, TICK_SECONDS)
    performPurchases(state)

    if (secondsToJuniorUnlock < 0 && state.purchasedUpgrades.juniorHiringProgram) {
      secondsToJuniorUnlock = elapsedSeconds
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

    if (secondsToFirstJuniorScientist < 0 && state.juniorResearchScientistCount > 0) {
      secondsToFirstJuniorScientist = elapsedSeconds
    }

    if (secondsToFirstSeniorScientist < 0 && state.seniorResearchScientistCount > 0) {
      secondsToFirstSeniorScientist = elapsedSeconds
    }

    if (secondsToBotUnlock < 0 && state.purchasedResearchTech.algorithmicTrading) {
      secondsToBotUnlock = elapsedSeconds
    }

    if (secondsToFirstTradingServer < 0 && state.tradingServerCount > 0) {
      secondsToFirstTradingServer = elapsedSeconds
    }

    if (secondsToFirstBot < 0 && state.tradingBotCount > 0) {
      secondsToFirstBot = elapsedSeconds
    }

    if (secondsToPowerUnlock < 0 && state.purchasedResearchTech.powerSystemsEngineering) {
      secondsToPowerUnlock = elapsedSeconds
    }

    if (secondsToFirstPowerInfrastructure < 0 && (state.serverRoomCount > 0 || state.dataCenterCount > 0)) {
      secondsToFirstPowerInfrastructure = elapsedSeconds
    }

    if (secondsToFullPowerRecovery < 0 && state.tradingBotCount > 0 && getPowerUsage(state) > 0 && getPowerCapacity(state) >= getPowerUsage(state)) {
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

    if (secondsToPrestigeReady < 0 && getPrestigeGain(state.lifetimeCashEarned) > 0 && state.tradingBotCount > 0) {
      secondsToPrestigeReady = elapsedSeconds
      break
    }
  }

  return {
    secondsToJuniorUnlock,
    secondsToFirstJunior,
    secondsToSeniorUnlock,
    secondsToFirstSenior,
    secondsToFirstJuniorScientist,
    secondsToFirstSeniorScientist,
    secondsToBotUnlock,
    secondsToFirstTradingServer,
    secondsToFirstBot,
    secondsToPowerUnlock,
    secondsToFirstPowerInfrastructure,
    secondsToFullPowerRecovery,
    secondsToLobbyingUnlock,
    secondsToFirstInfluence,
    secondsToFirstPolicy,
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

const result = simulateRun()

console.log('Revision 2 balance check results')
console.log(`- Junior Hiring Program: ${formatMinutes(result.secondsToJuniorUnlock)}`)
console.log(`- First Junior Trader: ${formatMinutes(result.secondsToFirstJunior)}`)
console.log(`- Senior Recruitment: ${formatMinutes(result.secondsToSeniorUnlock)}`)
console.log(`- First Senior Trader: ${formatMinutes(result.secondsToFirstSenior)}`)
console.log(`- First Junior Scientist: ${formatMinutes(result.secondsToFirstJuniorScientist)}`)
console.log(`- First Senior Scientist: ${formatMinutes(result.secondsToFirstSeniorScientist)}`)
console.log(`- Algorithmic Trading: ${formatMinutes(result.secondsToBotUnlock)}`)
console.log(`- First Trading Server: ${formatMinutes(result.secondsToFirstTradingServer)}`)
console.log(`- First Trading Bot: ${formatMinutes(result.secondsToFirstBot)}`)
console.log(`- Power Systems Engineering: ${formatMinutes(result.secondsToPowerUnlock)}`)
console.log(`- First Power Infrastructure: ${formatMinutes(result.secondsToFirstPowerInfrastructure)}`)
console.log(`- Full Bot Power Coverage: ${formatMinutes(result.secondsToFullPowerRecovery)}`)
console.log(`- Regulatory Affairs: ${formatMinutes(result.secondsToLobbyingUnlock)}`)
console.log(`- First Influence: ${formatMinutes(result.secondsToFirstInfluence)}`)
console.log(`- First Policy Passed: ${formatMinutes(result.secondsToFirstPolicy)}`)
console.log(`- Prestige Ready: ${formatMinutes(result.secondsToPrestigeReady)}`)
console.log(`- Ending cash/sec: ${getCashPerSecond(result.finalState).toFixed(2)}`)
console.log(`- Ending lifetime cash: ${result.finalState.lifetimeCashEarned.toFixed(2)}`)
console.log(`- Ending servers / bots: ${result.finalState.tradingServerCount}/${result.finalState.tradingBotCount}`)
console.log(`- Ending research scientists: ${result.finalState.juniorResearchScientistCount}/${result.finalState.seniorResearchScientistCount}`)
console.log(`- Ending machine infrastructure: ${result.finalState.serverRoomCount}/${result.finalState.dataCenterCount}`)
console.log(`- Policies passed: ${LOBBYING_POLICIES.filter((policy) => result.finalState.purchasedPolicies[policy.id]).length}/${LOBBYING_POLICIES.length}`)
