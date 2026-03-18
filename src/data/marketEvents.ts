import type { MarketEventDefinition, MarketEventId } from '../types/game'
import { mechanics } from '../lib/mechanics'

export const MARKET_EVENT_HISTORY_LIMIT = mechanics.runtime.marketEvents.historyLimit
export const MARKET_EVENT_COOLDOWN_MIN_SECONDS = mechanics.runtime.marketEvents.cooldownMinSeconds
export const MARKET_EVENT_COOLDOWN_MAX_SECONDS = mechanics.runtime.marketEvents.cooldownMaxSeconds

export const MARKET_EVENTS: Record<MarketEventId, MarketEventDefinition> = {
  techRally: {
    id: 'techRally',
    name: mechanics.multipliers.marketEvents.techRally.name,
    category: mechanics.multipliers.marketEvents.techRally.category,
    durationSeconds: Number(mechanics.multipliers.marketEvents.techRally.durationSeconds),
    description: mechanics.multipliers.marketEvents.techRally.description,
    affectedSector: mechanics.multipliers.marketEvents.techRally.affectedSector,
    sectorOutputMultiplier: Number(mechanics.multipliers.marketEvents.techRally.sectorOutputMultiplier),
  },
  energyBoom: {
    id: 'energyBoom',
    name: mechanics.multipliers.marketEvents.energyBoom.name,
    category: mechanics.multipliers.marketEvents.energyBoom.category,
    durationSeconds: Number(mechanics.multipliers.marketEvents.energyBoom.durationSeconds),
    description: mechanics.multipliers.marketEvents.energyBoom.description,
    affectedSector: mechanics.multipliers.marketEvents.energyBoom.affectedSector,
    sectorOutputMultiplier: Number(mechanics.multipliers.marketEvents.energyBoom.sectorOutputMultiplier),
  },
  financialTightening: {
    id: 'financialTightening',
    name: mechanics.multipliers.marketEvents.financialTightening.name,
    category: mechanics.multipliers.marketEvents.financialTightening.category,
    durationSeconds: Number(mechanics.multipliers.marketEvents.financialTightening.durationSeconds),
    description: mechanics.multipliers.marketEvents.financialTightening.description,
    affectedSector: mechanics.multipliers.marketEvents.financialTightening.affectedSector,
    sectorOutputMultiplier: Number(mechanics.multipliers.marketEvents.financialTightening.sectorOutputMultiplier),
  },
  volatilitySpike: {
    id: 'volatilitySpike',
    name: mechanics.multipliers.marketEvents.volatilitySpike.name,
    category: mechanics.multipliers.marketEvents.volatilitySpike.category,
    durationSeconds: Number(mechanics.multipliers.marketEvents.volatilitySpike.durationSeconds),
    description: mechanics.multipliers.marketEvents.volatilitySpike.description,
    automationOutputMultiplier: Number(mechanics.multipliers.marketEvents.volatilitySpike.automationOutputMultiplier),
  },
  liquidityCrunch: {
    id: 'liquidityCrunch',
    name: mechanics.multipliers.marketEvents.liquidityCrunch.name,
    category: mechanics.multipliers.marketEvents.liquidityCrunch.category,
    durationSeconds: Number(mechanics.multipliers.marketEvents.liquidityCrunch.durationSeconds),
    description: mechanics.multipliers.marketEvents.liquidityCrunch.description,
    globalOutputMultiplier: Number(mechanics.multipliers.marketEvents.liquidityCrunch.globalOutputMultiplier),
  },
  gridStressWarning: {
    id: 'gridStressWarning',
    name: mechanics.multipliers.marketEvents.gridStressWarning.name,
    category: mechanics.multipliers.marketEvents.gridStressWarning.category,
    durationSeconds: Number(mechanics.multipliers.marketEvents.gridStressWarning.durationSeconds),
    description: mechanics.multipliers.marketEvents.gridStressWarning.description,
    machineEfficiencyMultiplier: Number(mechanics.multipliers.marketEvents.gridStressWarning.machineEfficiencyMultiplier),
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
