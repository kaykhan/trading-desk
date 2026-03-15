import { initialState } from '../src/data/initialState'
import { getUpgradeDefinition } from '../src/data/upgrades'
import { getBulkUnitCost, getCashPerSecond, getManualIncome, isUnitUnlocked } from '../src/utils/economy'
import { getPrestigeGain } from '../src/utils/prestige'
import type { GameState, UnitId, UpgradeId } from '../src/types/game'

type SimulationResult = {
  secondsToJuniorUnlock: number
  secondsToFirstJunior: number
  secondsToSeniorUnlock: number
  secondsToFirstSenior: number
  secondsToBotUnlock: number
  secondsToFirstBot: number
  secondsToPrestigeReady: number
  finalState: GameState
}

const TICK_SECONDS = 1
const MAX_SECONDS = 6 * 60 * 60

function cloneState(state: GameState): GameState {
  return {
    ...state,
    purchasedUpgrades: { ...state.purchasedUpgrades },
    purchasedPrestigeUpgrades: { ...state.purchasedPrestigeUpgrades },
    settings: { ...state.settings },
  }
}

function tick(state: GameState, deltaSeconds: number): void {
  const gain = getCashPerSecond(state) * deltaSeconds
  state.cash += gain
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
    changed = buyUpgrade(state, 'tradeMultiplier') || changed
    changed = buyUpgrade(state, 'trainingProgram') || changed
    changed = buyUpgrade(state, 'bullMarket') || changed
    changed = buyUpgrade(state, 'seniorRecruitment') || changed

    while (buyUnit(state, 'seniorTrader')) {
      changed = true
    }

    changed = buyUpgrade(state, 'executiveTraining') || changed
    changed = buyUpgrade(state, 'algorithmicTrading') || changed

    while (buyUnit(state, 'tradingBot')) {
      changed = true
    }

    changed = buyUpgrade(state, 'lowLatencyServers') || changed

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
  let secondsToBotUnlock = -1
  let secondsToFirstBot = -1
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

    if (secondsToBotUnlock < 0 && state.purchasedUpgrades.algorithmicTrading) {
      secondsToBotUnlock = elapsedSeconds
    }

    if (secondsToFirstBot < 0 && state.tradingBotCount > 0) {
      secondsToFirstBot = elapsedSeconds
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
    secondsToBotUnlock,
    secondsToFirstBot,
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

console.log('Revision 1 balance check results')
console.log(`- Junior Hiring Program: ${formatMinutes(result.secondsToJuniorUnlock)}`)
console.log(`- First Junior Trader: ${formatMinutes(result.secondsToFirstJunior)}`)
console.log(`- Senior Recruitment: ${formatMinutes(result.secondsToSeniorUnlock)}`)
console.log(`- First Senior Trader: ${formatMinutes(result.secondsToFirstSenior)}`)
console.log(`- Algorithmic Trading: ${formatMinutes(result.secondsToBotUnlock)}`)
console.log(`- First Trading Bot: ${formatMinutes(result.secondsToFirstBot)}`)
console.log(`- Prestige Ready: ${formatMinutes(result.secondsToPrestigeReady)}`)
console.log(`- Ending cash/sec: ${getCashPerSecond(result.finalState).toFixed(2)}`)
console.log(`- Ending lifetime cash: ${result.finalState.lifetimeCashEarned.toFixed(2)}`)
