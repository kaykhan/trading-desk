import { GAME_CONSTANTS } from '../data/constants'
import { UNITS } from '../data/units'
import type { GameState } from '../types/game'
import { getLifetimeReputation } from './prestige'

export function getScaledCost(baseCost: number, scaling: number, owned: number): number {
  return Math.floor(baseCost * Math.pow(scaling, owned))
}

export function getGlobalMultiplier(state: GameState): number {
  let multiplier = 1

  if (state.purchasedUpgrades.tradeMultiplier) {
    multiplier *= 1.25
  }

  if (state.purchasedUpgrades.bullMarket) {
    multiplier *= 1.5
  }

  return multiplier
}

export function getPrestigeMultiplier(state: GameState): number {
  const brandRecognitionRank = state.purchasedPrestigeUpgrades.brandRecognition ?? 0
  const directBonus = 1 + getLifetimeReputation(state) * GAME_CONSTANTS.directReputationBonusPerPoint
  const brandRecognitionBonus = 1 + brandRecognitionRank * GAME_CONSTANTS.brandRecognitionBonusPerRank

  return directBonus * brandRecognitionBonus
}

export function getManualIncome(state: GameState): number {
  let value: number = GAME_CONSTANTS.baseClickIncome

  if (state.purchasedUpgrades.betterTerminal) {
    value = 2
  }

  if (state.purchasedUpgrades.hotkeyMacros) {
    value += 2
  }

  if (state.purchasedUpgrades.premiumDataFeed) {
    value *= 1.5
  }

  return value * getGlobalMultiplier(state) * getPrestigeMultiplier(state)
}

export function getJuniorTraderIncome(state: GameState): number {
  let value: number = UNITS.juniorTrader.baseIncomePerSecond

  if (state.purchasedUpgrades.deskUpgrade) {
    value = 2
  }

  if (state.purchasedUpgrades.trainingProgram) {
    value += 1
  }

  return value
}

export function getSeniorTraderIncome(state: GameState): number {
  if (state.purchasedUpgrades.executiveTraining) {
    return 12
  }

  return UNITS.seniorTrader.baseIncomePerSecond
}

export function getTradingBotIncome(state: GameState): number {
  if (state.purchasedUpgrades.lowLatencyServers) {
    return 65
  }

  return UNITS.tradingBot.baseIncomePerSecond
}

export function getIncomeBreakdown(state: GameState) {
  return {
    juniorIncome: state.juniorTraderCount * getJuniorTraderIncome(state),
    seniorIncome: state.seniorTraderCount * getSeniorTraderIncome(state),
    botIncome: state.tradingBotCount * getTradingBotIncome(state),
  }
}

export function getCashPerSecond(state: GameState): number {
  const { juniorIncome, seniorIncome, botIncome } = getIncomeBreakdown(state)
  const basePassiveIncome = juniorIncome + seniorIncome + botIncome

  return basePassiveIncome * getGlobalMultiplier(state) * getPrestigeMultiplier(state)
}

export function getJuniorTraderCost(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.betterHiringPipeline ?? 0
  const discount = 1 - rank * GAME_CONSTANTS.betterHiringPipelineDiscountPerRank

  return Math.max(
    1,
    Math.floor(
      getScaledCost(UNITS.juniorTrader.baseCost, UNITS.juniorTrader.costScaling, state.juniorTraderCount) * discount,
    ),
  )
}

export function getTradingBotCost(state: GameState): number {
  return getScaledCost(UNITS.tradingBot.baseCost, UNITS.tradingBot.costScaling, state.tradingBotCount)
}

export function getPromotionCost(): number {
  return GAME_CONSTANTS.promotionCost
}

export function canAfford(state: GameState, amount: number): boolean {
  return state.cash >= amount
}
