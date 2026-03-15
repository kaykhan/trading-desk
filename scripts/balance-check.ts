import { initialState } from '../src/data/initialState'
import { getUpgradeDefinition } from '../src/data/upgrades'
import { getCashPerSecond, getJuniorTraderCost, getManualIncome, getPromotionCost, getTradingBotCost } from '../src/utils/economy'
import { getPrestigeGain } from '../src/utils/prestige'
import type { GameState, UpgradeId } from '../src/types/game'

type Strategy = {
  name: string
  maxSeniorBeforeSavingForBots: number
}

type SimulationResult = {
  strategy: string
  secondsToFirstJunior: number
  secondsToPromotionProgram: number
  secondsToFirstSenior: number
  secondsToAlgorithmicTrading: number
  secondsToFirstBot: number
  secondsToPrestigeReady: number
  finalState: GameState
}

const TICK_SECONDS = 1
const MAX_SECONDS = 6 * 60 * 60

const STRATEGIES: Strategy[] = [
  {
    name: 'Auto-promote everything',
    maxSeniorBeforeSavingForBots: Number.POSITIVE_INFINITY,
  },
  {
    name: 'Save for bots after 5 seniors',
    maxSeniorBeforeSavingForBots: 5,
  },
]

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

function buyJuniorTrader(state: GameState): boolean {
  const cost = getJuniorTraderCost(state)

  if (state.cash < cost) {
    return false
  }

  state.cash -= cost
  state.juniorTraderCount += 1
  return true
}

function promoteJuniorToSenior(state: GameState): boolean {
  const cost = getPromotionCost()

  if (!state.purchasedUpgrades.promotionProgram || state.juniorTraderCount <= 0 || state.cash < cost) {
    return false
  }

  state.cash -= cost
  state.juniorTraderCount -= 1
  state.seniorTraderCount += 1
  return true
}

function buyTradingBot(state: GameState): boolean {
  const cost = getTradingBotCost(state)

  if (!state.purchasedUpgrades.algorithmicTrading || state.cash < cost) {
    return false
  }

  state.cash -= cost
  state.tradingBotCount += 1
  return true
}

function performPurchases(state: GameState, strategy: Strategy): void {
  while (true) {
    let changed = false

    changed = buyUpgrade(state, 'betterTerminal') || changed
    changed = buyUpgrade(state, 'hotkeyMacros') || changed
    changed = buyUpgrade(state, 'premiumDataFeed') || changed

    while (buyJuniorTrader(state)) {
      changed = true
    }

    changed = buyUpgrade(state, 'deskUpgrade') || changed
    changed = buyUpgrade(state, 'tradeMultiplier') || changed
    changed = buyUpgrade(state, 'trainingProgram') || changed
    changed = buyUpgrade(state, 'bullMarket') || changed
    changed = buyUpgrade(state, 'promotionProgram') || changed

    const savingForAlgorithmicTrading = !state.purchasedUpgrades.algorithmicTrading && state.seniorTraderCount >= strategy.maxSeniorBeforeSavingForBots
    const savingForFirstBot = state.purchasedUpgrades.algorithmicTrading && state.tradingBotCount === 0

    if (!savingForAlgorithmicTrading && !savingForFirstBot) {
      while (promoteJuniorToSenior(state)) {
        changed = true
      }
    }

    changed = buyUpgrade(state, 'executiveTraining') || changed
    changed = buyUpgrade(state, 'algorithmicTrading') || changed

    while (buyTradingBot(state)) {
      changed = true
    }

    if (state.tradingBotCount > 0) {
      while (promoteJuniorToSenior(state)) {
        changed = true
      }
    }

    changed = buyUpgrade(state, 'lowLatencyServers') || changed

    if (!changed) {
      break
    }
  }
}

function simulateRun(strategy: Strategy): SimulationResult {
  const state = cloneState(initialState)
  let secondsToFirstJunior = -1
  let secondsToPromotionProgram = -1
  let secondsToFirstSenior = -1
  let secondsToAlgorithmicTrading = -1
  let secondsToFirstBot = -1
  let secondsToPrestigeReady = -1

  for (let elapsedSeconds = 1; elapsedSeconds <= MAX_SECONDS; elapsedSeconds += TICK_SECONDS) {
    makeTrade(state)
    tick(state, TICK_SECONDS)
    performPurchases(state, strategy)

    if (secondsToFirstJunior < 0 && state.juniorTraderCount > 0) {
      secondsToFirstJunior = elapsedSeconds
    }

    if (secondsToPromotionProgram < 0 && state.purchasedUpgrades.promotionProgram) {
      secondsToPromotionProgram = elapsedSeconds
    }

    if (secondsToFirstSenior < 0 && state.seniorTraderCount > 0) {
      secondsToFirstSenior = elapsedSeconds
    }

    if (secondsToAlgorithmicTrading < 0 && state.purchasedUpgrades.algorithmicTrading) {
      secondsToAlgorithmicTrading = elapsedSeconds
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
    strategy: strategy.name,
    secondsToFirstJunior,
    secondsToPromotionProgram,
    secondsToFirstSenior,
    secondsToAlgorithmicTrading,
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

for (const strategy of STRATEGIES) {
  const result = simulateRun(strategy)

  console.log(`Strategy: ${result.strategy}`)
  console.log(`- First Junior Trader: ${formatMinutes(result.secondsToFirstJunior)}`)
  console.log(`- Promotion Program: ${formatMinutes(result.secondsToPromotionProgram)}`)
  console.log(`- First Senior Trader: ${formatMinutes(result.secondsToFirstSenior)}`)
  console.log(`- Algorithmic Trading: ${formatMinutes(result.secondsToAlgorithmicTrading)}`)
  console.log(`- First Trading Bot: ${formatMinutes(result.secondsToFirstBot)}`)
  console.log(`- Prestige Ready: ${formatMinutes(result.secondsToPrestigeReady)}`)
  console.log(`- Ending cash/sec: ${getCashPerSecond(result.finalState).toFixed(2)}`)
  console.log(`- Ending lifetime cash: ${result.finalState.lifetimeCashEarned.toFixed(2)}`)
  console.log('')
}
