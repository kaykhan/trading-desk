import type { AutomationStrategyId, AutomationUnitId, SectorId } from '../types/game'

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
    name: 'Quant Trader',
    cycleDurationSeconds: 4,
    basePayout: 20,
    powerUse: 0,
    description: 'Fast early systematic execution that bridges human desks into machine trading.',
  },
  ruleBasedBot: {
    id: 'ruleBasedBot',
    legacyUnitId: 'ruleBasedBot',
    name: 'Rule-Based Bot',
    cycleDurationSeconds: 6,
    basePayout: 70,
    powerUse: 1.5,
    description: 'Reliable machine execution built around explicit signals and systematic rules.',
  },
  mlTradingBot: {
    id: 'mlTradingBot',
    legacyUnitId: 'mlTradingBot',
    name: 'ML Bot',
    cycleDurationSeconds: 12,
    basePayout: 220,
    powerUse: 8,
    description: 'Heavier model-driven systems with longer analytical cycles and chunkier payouts.',
  },
  aiTradingBot: {
    id: 'aiTradingBot',
    legacyUnitId: 'aiTradingBot',
    name: 'AI Bot',
    cycleDurationSeconds: 20,
    basePayout: 650,
    powerUse: 30,
    description: 'Late autonomous execution with the largest payout bursts and the highest infrastructure load.',
  },
}

export const AUTOMATION_STRATEGIES: Record<AutomationStrategyId, AutomationStrategyDefinition> = {
  meanReversion: {
    id: 'meanReversion',
    name: 'Mean Reversion',
    description: 'Steadier reversion logic that performs best in Finance and remains safe elsewhere.',
  },
  momentum: {
    id: 'momentum',
    name: 'Momentum',
    description: 'Trend-following logic that leans into higher-growth markets, especially Technology.',
  },
  arbitrage: {
    id: 'arbitrage',
    name: 'Arbitrage',
    description: 'Cross-market spread capture with balanced performance and mild upside in Finance.',
  },
  marketMaking: {
    id: 'marketMaking',
    name: 'Market Making',
    description: 'Liquidity-focused execution with stable baseline output and modest Finance synergy.',
  },
  scalping: {
    id: 'scalping',
    name: 'Scalping',
    description: 'Fast opportunistic execution that gains more from shorter-cycle market environments.',
  },
}

export const DEFAULT_AUTOMATION_CONFIG: Record<AutomationUnitId, { strategy: AutomationStrategyId | null; marketTarget: SectorId | null }> = {
  quantTrader: { strategy: null, marketTarget: null },
  ruleBasedBot: { strategy: null, marketTarget: null },
  mlTradingBot: { strategy: null, marketTarget: null },
  aiTradingBot: { strategy: null, marketTarget: null },
}

export const DEFAULT_AUTOMATION_CYCLE_STATE: Record<AutomationUnitId, { progressSeconds: number; lastPayout: number; lastCompletedAt: number | null }> = {
  quantTrader: { progressSeconds: 0, lastPayout: 0, lastCompletedAt: null },
  ruleBasedBot: { progressSeconds: 0, lastPayout: 0, lastCompletedAt: null },
  mlTradingBot: { progressSeconds: 0, lastPayout: 0, lastCompletedAt: null },
  aiTradingBot: { progressSeconds: 0, lastPayout: 0, lastCompletedAt: null },
}
