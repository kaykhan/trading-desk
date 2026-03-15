import { GAME_CONSTANTS } from '../data/constants'
import { UNITS } from '../data/units'
import type { BuyMode, GameState, UnitId } from '../types/game'
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
    return 30
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

export function isUnitUnlocked(state: GameState, unitId: UnitId): boolean {
  return state.purchasedUpgrades[UNITS[unitId].unlockUpgradeId] === true
}

export function getUnitCount(state: GameState, unitId: UnitId): number {
  switch (unitId) {
    case 'juniorTrader':
      return state.juniorTraderCount
    case 'seniorTrader':
      return state.seniorTraderCount
    case 'tradingBot':
      return state.tradingBotCount
  }
}

export function getNextUnitCost(state: GameState, unitId: UnitId): number {
  const unit = UNITS[unitId]

  if (unitId === 'juniorTrader') {
    return getJuniorTraderCost(state)
  }

  return getScaledCost(unit.baseCost, unit.costScaling, getUnitCount(state, unitId))
}

export function getBulkUnitCost(state: GameState, unitId: UnitId, quantity: BuyMode): { quantity: number; totalCost: number } {
  if (!isUnitUnlocked(state, unitId)) {
    return { quantity: 0, totalCost: 0 }
  }

  const unit = UNITS[unitId]
  const owned = getUnitCount(state, unitId)

  if (quantity === 'max') {
    let totalCost = 0
    let bought = 0
    let simulatedOwned = owned

    while (true) {
      const nextCost = unitId === 'juniorTrader'
        ? Math.max(
            1,
            Math.floor(
              getScaledCost(unit.baseCost, unit.costScaling, simulatedOwned) *
                (1 - (state.purchasedPrestigeUpgrades.betterHiringPipeline ?? 0) * GAME_CONSTANTS.betterHiringPipelineDiscountPerRank),
            ),
          )
        : getScaledCost(unit.baseCost, unit.costScaling, simulatedOwned)

      if (totalCost + nextCost > state.cash) {
        break
      }

      totalCost += nextCost
      simulatedOwned += 1
      bought += 1
    }

    return { quantity: bought, totalCost }
  }

  let totalCost = 0

  for (let i = 0; i < quantity; i += 1) {
    totalCost += unitId === 'juniorTrader'
      ? Math.max(
          1,
          Math.floor(
            getScaledCost(unit.baseCost, unit.costScaling, owned + i) *
              (1 - (state.purchasedPrestigeUpgrades.betterHiringPipeline ?? 0) * GAME_CONSTANTS.betterHiringPipelineDiscountPerRank),
          ),
        )
      : getScaledCost(unit.baseCost, unit.costScaling, owned + i)
  }

  return { quantity, totalCost }
}

export function getTradingBotCost(state: GameState): number {
  return getNextUnitCost(state, 'tradingBot')
}

export function getSeniorTraderCost(state: GameState): number {
  return getNextUnitCost(state, 'seniorTrader')
}

export function canAfford(state: GameState, amount: number): boolean {
  return state.cash >= amount
}
