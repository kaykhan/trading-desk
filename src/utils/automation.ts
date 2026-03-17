import { AUTOMATION_STRATEGIES, AUTOMATION_STRATEGY_IDS, AUTOMATION_UNIT_IDS, AUTOMATION_UNITS } from '../data/automation'
import { getSectorDefinition } from '../data/sectors'
import { getTimedAutomationBoostMultiplier } from './boosts'
import { getAutomationCompliancePenaltyMultiplier, getComplianceEfficiencyMultiplier } from './compliance'
import { getScaledCost, getGlobalMultiplier, getMachineEfficiencyMultiplier, getPowerCapacity, getPowerUsage, getPrestigeMultiplier, getRuleBasedBotOptimizationMultiplier, getMlTradingBotOptimizationMultiplier, getAiTradingBotOptimizationMultiplier } from './economy'
import { getAutomationEventMultiplier, getSectorEventMultiplier } from './marketEvents'
import { getRepeatableUpgradeMultiplier } from '../data/repeatableUpgrades'
import { getMachineOutputPrestigeMultiplier } from './prestige'
import type { AutomationStrategyId, AutomationUnitId, GameState, SectorId } from '../types/game'

export function getAutomationOwnedCount(state: GameState, unitId: AutomationUnitId): number {
  if (unitId === 'quantTrader') return state.quantTraderCount
  if (unitId === 'ruleBasedBot') return state.ruleBasedBotCount
  if (unitId === 'mlTradingBot') return state.mlTradingBotCount
  return state.aiTradingBotCount
}

export function isAutomationUnitUnlocked(state: GameState, unitId: AutomationUnitId): boolean {
  if (unitId === 'quantTrader') return state.purchasedResearchTech.algorithmicTrading === true
  if (unitId === 'ruleBasedBot') return state.purchasedResearchTech.ruleBasedAutomation === true
  if (unitId === 'mlTradingBot') return state.purchasedResearchTech.machineLearningTrading === true && state.dataCenterCount > 0
  return state.purchasedResearchTech.aiTradingSystems === true && state.cloudComputeCount > 0
}

export function isAutomationStrategyUnlocked(state: GameState, strategyId: AutomationStrategyId): boolean {
  if (strategyId === 'meanReversion') return state.purchasedResearchTech.meanReversionModels === true
  if (strategyId === 'momentum') return state.purchasedResearchTech.momentumModels === true
  if (strategyId === 'arbitrage') return state.purchasedResearchTech.arbitrageEngine === true
  if (strategyId === 'marketMaking') return state.purchasedResearchTech.marketMakingEngine === true
  return state.purchasedResearchTech.scalpingFramework === true
}

export function getAutomationCycleDuration(unitId: AutomationUnitId): number {
  return AUTOMATION_UNITS[unitId].cycleDurationSeconds
}

export function getAutomationBasePayout(unitId: AutomationUnitId): number {
  return AUTOMATION_UNITS[unitId].basePayout
}

export function getAutomationNextCost(state: GameState, unitId: AutomationUnitId): number {
  const owned = getAutomationOwnedCount(state, unitId)
  const definition = AUTOMATION_UNITS[unitId]
  const machineReduction = getAutomationCostReduction(state)
  return Math.max(1, Math.floor(getScaledCost(getAutomationBaseCost(unitId), getAutomationCostScaling(unitId), owned) * (1 - machineReduction)))
}

export function getAutomationCostScaling(unitId: AutomationUnitId): number {
  if (unitId === 'quantTrader') return 1.22
  return AUTOMATION_UNITS[unitId].id === unitId ? (unitId === 'ruleBasedBot' ? 1.24 : unitId === 'mlTradingBot' ? 1.26 : 1.28) : 1.22
}

export function getAutomationBaseCost(unitId: AutomationUnitId): number {
  if (unitId === 'quantTrader') return 2500
  if (unitId === 'ruleBasedBot') return 12000
  if (unitId === 'mlTradingBot') return 80000
  return 400000
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
    if (state.purchasedPolicies.dataCenterEnergyCredits) powerUse *= 0.8
    if (state.purchasedUpgrades.coolingSystems) powerUse *= 0.9
    powerUse *= getRepeatableUpgradeMultiplier(state, 'computeOptimization')
  }
  if (unitId === 'aiTradingBot') {
    if (state.purchasedUpgrades.coolingSystems) powerUse *= 0.9
    powerUse *= getRepeatableUpgradeMultiplier(state, 'computeOptimization')
  }
  return powerUse
}

export function getAutomationOptimizationMultiplier(state: GameState, unitId: AutomationUnitId): number {
  if (unitId === 'quantTrader') {
    const systematic = state.purchasedUpgrades.systematicExecution ? 1.15 : 1
    return systematic * getRepeatableUpgradeMultiplier(state, 'executionStackTuning') * getMachineOutputPrestigeMultiplier(state)
  }
  if (unitId === 'ruleBasedBot') {
    let multiplier = getRuleBasedBotOptimizationMultiplier(state) * getRepeatableUpgradeMultiplier(state, 'signalQualityControl')
    if (state.purchasedUpgrades.systematicExecution) multiplier *= 1.15
    if (state.purchasedUpgrades.botTelemetry) multiplier *= 1.15
    return multiplier * getMachineOutputPrestigeMultiplier(state)
  }
  if (unitId === 'mlTradingBot') {
    let multiplier = getMlTradingBotOptimizationMultiplier(state) * getRepeatableUpgradeMultiplier(state, 'signalQualityControl')
    if (state.purchasedUpgrades.modelServingCluster) multiplier *= 1.2
    return multiplier * getMachineOutputPrestigeMultiplier(state)
  }
  let multiplier = getAiTradingBotOptimizationMultiplier(state) * getRepeatableUpgradeMultiplier(state, 'signalQualityControl')
  if (state.purchasedUpgrades.aiRiskStack) multiplier *= 1.2
  return multiplier * getMachineOutputPrestigeMultiplier(state)
}

export function getAutomationMarketMultiplier(target: SectorId | null): number {
  if (!target) return 1
  return getSectorDefinition(target).baseProfitMultiplier
}

export function getAutomationStrategyMultiplier(strategyId: AutomationStrategyId | null, target: SectorId | null): number {
  if (!strategyId) return 1
  if (strategyId === 'meanReversion') return target === 'finance' ? 1.12 : 1.02
  if (strategyId === 'momentum') return target === 'technology' ? 1.16 : target === 'energy' ? 1.05 : 0.98
  if (strategyId === 'arbitrage') return target === 'finance' ? 1.08 : 1.03
  if (strategyId === 'marketMaking') return target === 'finance' ? 1.1 : 1.01
  return target === 'technology' ? 1.1 : target === 'finance' ? 1.04 : 1.06
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
  let duration = getAutomationCycleDuration(unitId)
  if (unitId === 'ruleBasedBot' && state.purchasedUpgrades.executionRoutingStack) duration *= 0.9
  if (unitId === 'mlTradingBot' && state.purchasedUpgrades.inferenceBatching) duration *= 0.9
  duration *= getRepeatableUpgradeMultiplier(state, 'modelEfficiency')
  if (duration <= 0) return 0
  return getAutomationAdjustedPayout(state, unitId) / duration
}

export function getAutomationProgressPercent(state: GameState, unitId: AutomationUnitId): number {
  let duration = getAutomationCycleDuration(unitId)
  if (unitId === 'ruleBasedBot' && state.purchasedUpgrades.executionRoutingStack) duration *= 0.9
  if (unitId === 'mlTradingBot' && state.purchasedUpgrades.inferenceBatching) duration *= 0.9
  duration *= getRepeatableUpgradeMultiplier(state, 'modelEfficiency')
  if (duration <= 0) return 0
  return Math.min(1, Math.max(0, state.automationCycleState[unitId].progressSeconds / duration))
}

export function getAutomationTimeRemaining(state: GameState, unitId: AutomationUnitId): number {
  let duration = getAutomationCycleDuration(unitId)
  if (unitId === 'ruleBasedBot' && state.purchasedUpgrades.executionRoutingStack) duration *= 0.9
  if (unitId === 'mlTradingBot' && state.purchasedUpgrades.inferenceBatching) duration *= 0.9
  duration *= getRepeatableUpgradeMultiplier(state, 'modelEfficiency')
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

    let duration = getAutomationCycleDuration(unitId)
    if (unitId === 'ruleBasedBot' && state.purchasedUpgrades.executionRoutingStack) duration *= 0.9
    if (unitId === 'mlTradingBot' && state.purchasedUpgrades.inferenceBatching) duration *= 0.9
    duration *= getRepeatableUpgradeMultiplier(state, 'modelEfficiency')
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
