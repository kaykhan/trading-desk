import { AUTOMATION_STRATEGIES, AUTOMATION_STRATEGY_IDS, AUTOMATION_UNIT_IDS, AUTOMATION_UNITS } from '../data/automation'
import { getSectorDefinition } from '../data/sectors'
import { isAutomationStrategyDefinitionUnlocked, isUnitDefinitionUnlocked, mechanics } from '../lib/mechanics'
import { getTimedAutomationBoostMultiplier } from './boosts'
import { getAutomationCompliancePenaltyMultiplier, getComplianceEfficiencyMultiplier } from './compliance'
import { getScaledCost, getGlobalMultiplier, getMachineEfficiencyMultiplier, getPowerCapacity, getPowerUsage, getPrestigeMultiplier, getRuleBasedBotOptimizationMultiplier, getMlTradingBotOptimizationMultiplier, getAiTradingBotOptimizationMultiplier } from './economy'
import { getAutomationEventMultiplier, getSectorEventMultiplier } from './marketEvents'
import { getRepeatableUpgradeMultiplier } from '../data/repeatableUpgrades'
import { getMachineOutputPrestigeMultiplier } from './prestige'
import type { AutomationStrategyId, AutomationUnitId, GameState, SectorId } from '../types/game'

const UPGRADE_MULTIPLIERS = mechanics.multipliers.upgrades

function getAutomationUnitMechanics(unitId: AutomationUnitId) {
  return mechanics.units[unitId]
}

function getAutomationCostScaling(unitId: AutomationUnitId): number {
  return Number(getAutomationUnitMechanics(unitId).costScaling)
}

function getAutomationBaseCost(unitId: AutomationUnitId): number {
  return Number(getAutomationUnitMechanics(unitId).baseCost)
}

function getAutomationCycleDurationMultiplier(state: GameState, unitId: AutomationUnitId): number {
  if (unitId === 'ruleBasedBot' && state.purchasedUpgrades.executionRoutingStack) {
    return Number(UPGRADE_MULTIPLIERS.executionRoutingStackDuration)
  }

  if (unitId === 'mlTradingBot' && state.purchasedUpgrades.inferenceBatching) {
    return Number(UPGRADE_MULTIPLIERS.inferenceBatchingDuration)
  }

  return 1
}

function getAutomationStrategyCycleDurationMultiplier(strategyId: AutomationStrategyId | null): number {
  if (!strategyId) {
    return 1
  }

  return AUTOMATION_STRATEGIES[strategyId].cycleDurationMultiplier
}

function getAutomationCycleDurationWithModifiers(state: GameState, unitId: AutomationUnitId): number {
  return getAutomationCycleDuration(unitId)
    * getAutomationCycleDurationMultiplier(state, unitId)
    * getAutomationStrategyCycleDurationMultiplier(state.automationConfig[unitId].strategy)
    * getRepeatableUpgradeMultiplier(state, 'modelEfficiency')
}

export function getAutomationDisplayedCycleDuration(state: GameState, unitId: AutomationUnitId): number {
  return getAutomationCycleDurationWithModifiers(state, unitId)
}

export function getAutomationOwnedCount(state: GameState, unitId: AutomationUnitId): number {
  if (unitId === 'quantTrader') return state.quantTraderCount
  if (unitId === 'ruleBasedBot') return state.ruleBasedBotCount
  if (unitId === 'mlTradingBot') return state.mlTradingBotCount
  return state.aiTradingBotCount
}

export function isAutomationUnitUnlocked(state: GameState, unitId: AutomationUnitId): boolean {
  return isUnitDefinitionUnlocked(state, unitId)
}

export function isAutomationStrategyUnlocked(state: GameState, strategyId: AutomationStrategyId): boolean {
  return isAutomationStrategyDefinitionUnlocked(state, strategyId)
}

export function getAutomationCycleDuration(unitId: AutomationUnitId): number {
  return AUTOMATION_UNITS[unitId].cycleDurationSeconds
}

export function getAutomationBasePayout(unitId: AutomationUnitId): number {
  return AUTOMATION_UNITS[unitId].basePayout
}

export function getAutomationNextCost(state: GameState, unitId: AutomationUnitId): number {
  const owned = getAutomationOwnedCount(state, unitId)
  const machineReduction = getAutomationCostReduction(state)
  return Math.max(1, Math.floor(getScaledCost(getAutomationBaseCost(unitId), getAutomationCostScaling(unitId), owned) * (1 - machineReduction)))
}

function getAutomationCostReduction(state: GameState): number {
  return 0
}

export function getAutomationBulkCost(state: GameState, unitId: AutomationUnitId, quantity: 1 | 5 | 10 | 'max'): { quantity: number; totalCost: number } {
  if (!isAutomationUnitUnlocked(state, unitId)) {
    return { quantity: 0, totalCost: 0 }
  }

  const currentPowerUsage = getPowerUsage(state)
  const powerPerUnit = getAutomationPowerUse(state, unitId)
  const powerCapacity = getPowerCapacity(state)
  const owned = getAutomationOwnedCount(state, unitId)

  if (quantity === 'max') {
    let totalCost = 0
    let bought = 0
    let simulatedOwned = owned
    while (true) {
      const nextCost = Math.max(1, Math.floor(getScaledCost(getAutomationBaseCost(unitId), getAutomationCostScaling(unitId), simulatedOwned) * (1 - getAutomationCostReduction(state))))
      if (totalCost + nextCost > state.cash) break
      if (currentPowerUsage + powerPerUnit * (bought + 1) > powerCapacity) break
      totalCost += nextCost
      simulatedOwned += 1
      bought += 1
    }
    return { quantity: bought, totalCost }
  }

  let totalCost = 0
  for (let i = 0; i < quantity; i += 1) {
    if (currentPowerUsage + powerPerUnit * (i + 1) > powerCapacity) {
      return { quantity: 0, totalCost: 0 }
    }
    totalCost += Math.max(1, Math.floor(getScaledCost(getAutomationBaseCost(unitId), getAutomationCostScaling(unitId), owned + i) * (1 - getAutomationCostReduction(state))))
  }

  return { quantity, totalCost }
}

export function getAutomationPowerUse(state: GameState, unitId: AutomationUnitId): number {
  if (unitId === 'quantTrader') {
    return 0
  }

  let powerUse = AUTOMATION_UNITS[unitId].powerUse
  if (unitId === 'ruleBasedBot' || unitId === 'mlTradingBot') {
    if (state.purchasedPolicies.dataCenterEnergyCredits) powerUse *= Number(mechanics.multipliers.policies.dataCenterEnergyCreditsBotPowerUsage)
    if (state.purchasedUpgrades.coolingSystems) powerUse *= Number(UPGRADE_MULTIPLIERS.coolingSystemsPowerUsage)
    powerUse *= getRepeatableUpgradeMultiplier(state, 'computeOptimization')
  }
  if (unitId === 'aiTradingBot') {
    if (state.purchasedUpgrades.coolingSystems) powerUse *= Number(UPGRADE_MULTIPLIERS.coolingSystemsPowerUsage)
    powerUse *= getRepeatableUpgradeMultiplier(state, 'computeOptimization')
  }
  return powerUse
}

export function getAutomationOptimizationMultiplier(state: GameState, unitId: AutomationUnitId): number {
  if (unitId === 'quantTrader') {
    const systematic = state.purchasedUpgrades.systematicExecution ? Number(UPGRADE_MULTIPLIERS.systematicExecution) : 1
    return systematic * getRepeatableUpgradeMultiplier(state, 'executionStackTuning') * getMachineOutputPrestigeMultiplier(state)
  }
  if (unitId === 'ruleBasedBot') {
    let multiplier = getRuleBasedBotOptimizationMultiplier(state) * getRepeatableUpgradeMultiplier(state, 'signalQualityControl')
    if (state.purchasedUpgrades.systematicExecution) multiplier *= Number(UPGRADE_MULTIPLIERS.systematicExecution)
    if (state.purchasedUpgrades.botTelemetry) multiplier *= Number(UPGRADE_MULTIPLIERS.botTelemetry)
    return multiplier * getMachineOutputPrestigeMultiplier(state)
  }
  if (unitId === 'mlTradingBot') {
    let multiplier = getMlTradingBotOptimizationMultiplier(state) * getRepeatableUpgradeMultiplier(state, 'signalQualityControl')
    if (state.purchasedUpgrades.modelServingCluster) multiplier *= Number(UPGRADE_MULTIPLIERS.modelServingCluster)
    return multiplier * getMachineOutputPrestigeMultiplier(state)
  }
  let multiplier = getAiTradingBotOptimizationMultiplier(state) * getRepeatableUpgradeMultiplier(state, 'signalQualityControl')
  if (state.purchasedUpgrades.aiRiskStack) multiplier *= Number(UPGRADE_MULTIPLIERS.aiRiskStack)
  return multiplier * getMachineOutputPrestigeMultiplier(state)
}

export function getAutomationMarketMultiplier(target: SectorId | null): number {
  if (!target) return 1
  return getSectorDefinition(target).baseProfitMultiplier
}

export function getAutomationStrategyMultiplier(strategyId: AutomationStrategyId | null, target: SectorId | null): number {
  if (!strategyId) return 1
  return mechanics.automationStrategies[strategyId].targetMultipliers[target ?? 'none']
}

export function getAutomationAdjustedPayout(state: GameState, unitId: AutomationUnitId): number {
  const owned = getAutomationOwnedCount(state, unitId)
  if (owned <= 0) return 0
  const config = state.automationConfig[unitId]
  const basePayout = getAutomationBasePayout(unitId)
  const multiplier = getAutomationMarketMultiplier(config.marketTarget)
    * (config.marketTarget ? getSectorEventMultiplier(state, config.marketTarget) : 1)
    * getAutomationStrategyMultiplier(config.strategy, config.marketTarget)
    * getAutomationEventMultiplier(state)
    * getAutomationOptimizationMultiplier(state, unitId)
    * getMachineEfficiencyMultiplier(state)
    * getComplianceEfficiencyMultiplier(state)
    * getAutomationCompliancePenaltyMultiplier(state)
    * getTimedAutomationBoostMultiplier(state)
    * getGlobalMultiplier(state)
    * getPrestigeMultiplier(state)
  return owned * basePayout * multiplier
}

export function getAutomationAverageIncomePerSecond(state: GameState, unitId: AutomationUnitId): number {
  const duration = getAutomationCycleDurationWithModifiers(state, unitId)
  if (duration <= 0) return 0
  return getAutomationAdjustedPayout(state, unitId) / duration
}

export function getAutomationProgressPercent(state: GameState, unitId: AutomationUnitId): number {
  const duration = getAutomationCycleDurationWithModifiers(state, unitId)
  if (duration <= 0) return 0
  return Math.min(1, Math.max(0, state.automationCycleState[unitId].progressSeconds / duration))
}

export function getAutomationTimeRemaining(state: GameState, unitId: AutomationUnitId): number {
  const duration = getAutomationCycleDurationWithModifiers(state, unitId)
  return Math.max(0, duration - state.automationCycleState[unitId].progressSeconds)
}

export function processAutomationCycles(state: GameState, deltaSeconds: number, now: number = Date.now()): Pick<GameState, 'cash' | 'lifetimeCashEarned' | 'automationCycleState'> {
  let cashGain = 0
  const nextCycleState = { ...state.automationCycleState }

  for (const unitId of AUTOMATION_UNIT_IDS) {
    const owned = getAutomationOwnedCount(state, unitId)
    const current = state.automationCycleState[unitId]
    if (owned <= 0 || !isAutomationUnitUnlocked(state, unitId)) {
      nextCycleState[unitId] = { ...current, progressSeconds: 0, lastPayout: 0 }
      continue
    }

    const duration = getAutomationCycleDurationWithModifiers(state, unitId)
    let progress = current.progressSeconds + deltaSeconds
    let payout = 0

    while (progress >= duration) {
      progress -= duration
      payout += getAutomationAdjustedPayout(state, unitId)
    }

    cashGain += payout
    nextCycleState[unitId] = {
      progressSeconds: progress,
      lastPayout: payout > 0 ? payout : current.lastPayout,
      lastCompletedAt: payout > 0 ? now : current.lastCompletedAt,
    }
  }

  return {
    cash: state.cash + cashGain,
    lifetimeCashEarned: state.lifetimeCashEarned + cashGain,
    automationCycleState: nextCycleState,
  }
}

export function getUnlockedAutomationStrategies(state: GameState): AutomationStrategyId[] {
  return AUTOMATION_STRATEGY_IDS.filter((strategyId) => isAutomationStrategyUnlocked(state, strategyId))
}

export function getAutomationStrategyLabel(strategyId: AutomationStrategyId): string {
  return AUTOMATION_STRATEGIES[strategyId].name
}

export function getAutomationUnitLabel(unitId: AutomationUnitId): string {
  return AUTOMATION_UNITS[unitId].name
}
