import type { UnitDefinition, UnitId } from '../types/game'

export const UNITS: Record<UnitId, UnitDefinition> = {
  juniorTrader: {
    id: 'juniorTrader',
    name: 'Junior Trader',
    baseCost: 75,
    costScaling: 1.18,
    baseIncomePerSecond: 1,
    description: 'Entry-level staff who place simple trades and establish your first passive desk.',
  },
  seniorTrader: {
    id: 'seniorTrader',
    name: 'Senior Trader',
    baseCost: 0,
    costScaling: 1,
    baseIncomePerSecond: 8,
    description: 'Promoted staff who turn junior experience into a stronger mid-game human engine.',
  },
  tradingBot: {
    id: 'tradingBot',
    name: 'Trading Bot',
    baseCost: 40_000,
    costScaling: 1.2,
    baseIncomePerSecond: 40,
    description: 'Late-run algorithmic infrastructure that becomes dominant once heavily upgraded.',
  },
}
