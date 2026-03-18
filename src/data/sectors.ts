import type { SectorDefinition, SectorId } from '../types/game'
import { mechanics } from '../lib/mechanics'

export const SECTORS: Record<SectorId, SectorDefinition> = {
  finance: {
    id: 'finance',
    name: mechanics.sectors.finance.name,
    baseProfitMultiplier: mechanics.sectors.finance.baseProfitMultiplier,
    description: mechanics.sectors.finance.description,
  },
  technology: {
    id: 'technology',
    name: mechanics.sectors.technology.name,
    baseProfitMultiplier: mechanics.sectors.technology.baseProfitMultiplier,
    description: mechanics.sectors.technology.description,
  },
  energy: {
    id: 'energy',
    name: mechanics.sectors.energy.name,
    baseProfitMultiplier: mechanics.sectors.energy.baseProfitMultiplier,
    description: mechanics.sectors.energy.description,
  },
}

export const SECTOR_IDS = Object.keys(SECTORS) as SectorId[]

export const DEFAULT_UNLOCKED_SECTORS: Record<SectorId, boolean> = {
  ...mechanics.startingState.unlockedSectors,
}

export function getSectorDefinition(sectorId: SectorId): SectorDefinition {
  return SECTORS[sectorId]
}
