import type { UnitDefinition, UnitId } from '../types/game'

export const UNITS: Record<UnitId, UnitDefinition> = {
  juniorTrader: {
    id: 'juniorTrader',
    name: 'Junior Trader',
    baseCost: 75,
    costScaling: 1.18,
    baseIncomePerSecond: 1,
    description: 'Entry-level staff who generate early passive income.',
    tab: 'operations',
    unlockUpgradeId: 'juniorHiringProgram',
  },
  seniorTrader: {
    id: 'seniorTrader',
    name: 'Senior Trader',
    baseCost: 3000,
    costScaling: 1.16,
    baseIncomePerSecond: 12,
    description: 'Higher-tier staff with stronger long-term output.',
    tab: 'operations',
    unlockUpgradeId: 'seniorRecruitment',
  },
  tradingBot: {
    id: 'tradingBot',
    name: 'Trading Bot',
    baseCost: 40_000,
    costScaling: 1.2,
    baseIncomePerSecond: 40,
    description: 'Late-run algorithmic infrastructure that becomes dominant once heavily upgraded.',
    tab: 'operations',
    unlockUpgradeId: 'algorithmicTrading',
  },
}
