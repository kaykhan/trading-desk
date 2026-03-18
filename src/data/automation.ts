import type { AutomationStrategyId, AutomationUnitId, SectorId } from '../types/game'
import { mechanics } from '../lib/mechanics'

export type AutomationUnitDefinition = {
  id: AutomationUnitId
  name: string
  legacyUnitId: AutomationUnitId | 'quantTrader'
  cycleDurationSeconds: number
  basePayout: number
  powerUse: number
  description: string
}

export type AutomationStrategyDefinition = {
  id: AutomationStrategyId
  name: string
  description: string
}

export const AUTOMATION_UNIT_IDS: AutomationUnitId[] = ['quantTrader', 'ruleBasedBot', 'mlTradingBot', 'aiTradingBot']

export const AUTOMATION_STRATEGY_IDS: AutomationStrategyId[] = ['meanReversion', 'momentum', 'arbitrage', 'marketMaking', 'scalping']

export const AUTOMATION_UNITS: Record<AutomationUnitId, AutomationUnitDefinition> = {
  quantTrader: {
    id: 'quantTrader',
    legacyUnitId: 'quantTrader',
    name: String(mechanics.units.quantTrader.name),
    cycleDurationSeconds: Number(mechanics.units.quantTrader.cycleDurationSeconds),
    basePayout: Number(mechanics.units.quantTrader.cyclePayout),
    powerUse: Number(mechanics.units.quantTrader.livePowerUse),
    description: String(mechanics.units.quantTrader.description),
  },
  ruleBasedBot: {
    id: 'ruleBasedBot',
    legacyUnitId: 'ruleBasedBot',
    name: String(mechanics.units.ruleBasedBot.name),
    cycleDurationSeconds: Number(mechanics.units.ruleBasedBot.cycleDurationSeconds),
    basePayout: Number(mechanics.units.ruleBasedBot.cyclePayout),
    powerUse: Number(mechanics.units.ruleBasedBot.livePowerUse),
    description: String(mechanics.units.ruleBasedBot.description),
  },
  mlTradingBot: {
    id: 'mlTradingBot',
    legacyUnitId: 'mlTradingBot',
    name: String(mechanics.units.mlTradingBot.name),
    cycleDurationSeconds: Number(mechanics.units.mlTradingBot.cycleDurationSeconds),
    basePayout: Number(mechanics.units.mlTradingBot.cyclePayout),
    powerUse: Number(mechanics.units.mlTradingBot.livePowerUse),
    description: String(mechanics.units.mlTradingBot.description),
  },
  aiTradingBot: {
    id: 'aiTradingBot',
    legacyUnitId: 'aiTradingBot',
    name: String(mechanics.units.aiTradingBot.name),
    cycleDurationSeconds: Number(mechanics.units.aiTradingBot.cycleDurationSeconds),
    basePayout: Number(mechanics.units.aiTradingBot.cyclePayout),
    powerUse: Number(mechanics.units.aiTradingBot.livePowerUse),
    description: String(mechanics.units.aiTradingBot.description),
  },
}

export const AUTOMATION_STRATEGIES: Record<AutomationStrategyId, AutomationStrategyDefinition> = {
  meanReversion: {
    id: 'meanReversion',
    name: String(mechanics.automationStrategies.meanReversion.name),
    description: String(mechanics.automationStrategies.meanReversion.description),
  },
  momentum: {
    id: 'momentum',
    name: String(mechanics.automationStrategies.momentum.name),
    description: String(mechanics.automationStrategies.momentum.description),
  },
  arbitrage: {
    id: 'arbitrage',
    name: String(mechanics.automationStrategies.arbitrage.name),
    description: String(mechanics.automationStrategies.arbitrage.description),
  },
  marketMaking: {
    id: 'marketMaking',
    name: String(mechanics.automationStrategies.marketMaking.name),
    description: String(mechanics.automationStrategies.marketMaking.description),
  },
  scalping: {
    id: 'scalping',
    name: String(mechanics.automationStrategies.scalping.name),
    description: String(mechanics.automationStrategies.scalping.description),
  },
}

export const DEFAULT_AUTOMATION_CONFIG: Record<AutomationUnitId, { strategy: AutomationStrategyId | null; marketTarget: SectorId | null }> = {
  quantTrader: { strategy: mechanics.startingState.automationConfig.quantTrader.strategy, marketTarget: mechanics.startingState.automationConfig.quantTrader.marketTarget },
  ruleBasedBot: { strategy: mechanics.startingState.automationConfig.ruleBasedBot.strategy, marketTarget: mechanics.startingState.automationConfig.ruleBasedBot.marketTarget },
  mlTradingBot: { strategy: mechanics.startingState.automationConfig.mlTradingBot.strategy, marketTarget: mechanics.startingState.automationConfig.mlTradingBot.marketTarget },
  aiTradingBot: { strategy: mechanics.startingState.automationConfig.aiTradingBot.strategy, marketTarget: mechanics.startingState.automationConfig.aiTradingBot.marketTarget },
}

export const DEFAULT_AUTOMATION_CYCLE_STATE: Record<AutomationUnitId, { progressSeconds: number; lastPayout: number; lastCompletedAt: number | null }> = {
  quantTrader: { ...mechanics.startingState.automationCycleState.quantTrader },
  ruleBasedBot: { ...mechanics.startingState.automationCycleState.ruleBasedBot },
  mlTradingBot: { ...mechanics.startingState.automationCycleState.mlTradingBot },
  aiTradingBot: { ...mechanics.startingState.automationCycleState.aiTradingBot },
}
