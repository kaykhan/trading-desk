import type { MarketEventDefinition, MarketEventId } from '../types/game'

export const MARKET_EVENT_HISTORY_LIMIT = 12
export const MARKET_EVENT_COOLDOWN_MIN_SECONDS = 10 * 60
export const MARKET_EVENT_COOLDOWN_MAX_SECONDS = 20 * 60

export const MARKET_EVENTS: Record<MarketEventId, MarketEventDefinition> = {
  techRally: {
    id: 'techRally',
    name: 'Tech Rally',
    category: 'sector',
    durationSeconds: 90,
    description: 'Growth optimism pushes technology names higher.',
    affectedSector: 'technology',
    sectorOutputMultiplier: 1.2,
  },
  energyBoom: {
    id: 'energyBoom',
    name: 'Energy Boom',
    category: 'sector',
    durationSeconds: 90,
    description: 'Energy markets are catching a strong bid.',
    affectedSector: 'energy',
    sectorOutputMultiplier: 1.2,
  },
  financialTightening: {
    id: 'financialTightening',
    name: 'Financial Tightening',
    category: 'sector',
    durationSeconds: 90,
    description: 'Risk appetite fades across finance-heavy names.',
    affectedSector: 'finance',
    sectorOutputMultiplier: 0.85,
  },
  volatilitySpike: {
    id: 'volatilitySpike',
    name: 'Volatility Spike',
    category: 'systemic',
    durationSeconds: 75,
    description: 'Fast-moving markets reward machine execution.',
    automationOutputMultiplier: 1.1,
  },
  liquidityCrunch: {
    id: 'liquidityCrunch',
    name: 'Liquidity Crunch',
    category: 'systemic',
    durationSeconds: 75,
    description: 'Capital is harder to move and broad output softens.',
    globalOutputMultiplier: 0.92,
  },
  gridStressWarning: {
    id: 'gridStressWarning',
    name: 'Grid Stress Warning',
    category: 'systemic',
    durationSeconds: 60,
    description: 'Machine infrastructure is running under extra strain.',
    machineEfficiencyMultiplier: 0.9,
  },
}

export const MARKET_EVENT_IDS = Object.keys(MARKET_EVENTS) as MarketEventId[]

export function getMarketEventAccentClasses(category: MarketEventDefinition['category']): {
  border: string
  badge: string
  icon: string
  ticker: string
  panel: string
} {
  if (category === 'sector') {
    return {
      border: 'border-sky-400/40',
      badge: 'border-sky-400/40 bg-sky-500/10 text-sky-200',
      icon: 'text-sky-300',
      ticker: 'border-sky-400/30 bg-[linear-gradient(90deg,rgba(14,165,233,0.12),rgba(15,23,42,0.18))] text-sky-100',
      panel: 'bg-[linear-gradient(135deg,rgba(56,189,248,0.14),rgba(15,23,42,0.94))]',
    }
  }

  return {
    border: 'border-amber-400/40',
    badge: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
    icon: 'text-amber-300',
    ticker: 'border-amber-400/30 bg-[linear-gradient(90deg,rgba(245,158,11,0.12),rgba(15,23,42,0.18))] text-amber-100',
    panel: 'bg-[linear-gradient(135deg,rgba(250,204,21,0.16),rgba(120,53,15,0.10),rgba(12,14,18,0.96))]',
  }
}
