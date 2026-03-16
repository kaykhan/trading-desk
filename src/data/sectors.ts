import type { SectorDefinition, SectorId } from '../types/game'

export const SECTORS: Record<SectorId, SectorDefinition> = {
  finance: {
    id: 'finance',
    name: 'Finance',
    baseProfitMultiplier: 1,
    description: 'Stable baseline market activity for desk-aligned capital.',
  },
  technology: {
    id: 'technology',
    name: 'Technology',
    baseProfitMultiplier: 1.2,
    description: 'Higher-growth deployment lane with the strongest immediate profit premium.',
  },
  energy: {
    id: 'energy',
    name: 'Energy',
    baseProfitMultiplier: 1.08,
    description: 'Steady infrastructure-adjacent market with moderate upside and future power synergy.',
  },
}

export const SECTOR_IDS = Object.keys(SECTORS) as SectorId[]

export const DEFAULT_UNLOCKED_SECTORS: Record<SectorId, boolean> = {
  finance: true,
  technology: false,
  energy: false,
}

export function getSectorDefinition(sectorId: SectorId): SectorDefinition {
  return SECTORS[sectorId]
}
