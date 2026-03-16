import type { GameState, SectorId, TraderSpecialistUnitId, TraderSpecializationId } from '../types/game'

const SPECIALIZATION_IDS: TraderSpecializationId[] = ['finance', 'technology', 'energy']

export function getTotalTraderSpecialists(state: GameState, unitId: TraderSpecialistUnitId): number {
  return SPECIALIZATION_IDS.reduce((total, specializationId) => total + (state.traderSpecialists[unitId][specializationId] ?? 0), 0)
}

export function getGenericTraderCount(state: GameState, unitId: TraderSpecialistUnitId): number {
  const owned = state.seniorTraderCount
  return Math.max(0, owned - getTotalTraderSpecialists(state, unitId))
}

export function getTraderSpecialistCount(state: GameState, unitId: TraderSpecialistUnitId, specializationId: TraderSpecializationId): number {
  return state.traderSpecialists[unitId][specializationId] ?? 0
}

export function getTotalAssignedTraderSpecialists(state: GameState, unitId: TraderSpecialistUnitId, specializationId: TraderSpecializationId): number {
  return getTraderSpecialistCount(state, unitId, specializationId)
}

export function getAssignedTraderSpecialistsForSector(state: GameState, unitId: TraderSpecialistUnitId, specializationId: TraderSpecializationId, sectorId: SectorId): number {
  if (specializationId !== sectorId || state.unlockedSectors[sectorId] !== true) {
    return 0
  }

  return getTraderSpecialistCount(state, unitId, specializationId)
}

export function getTraderSpecialistSectorBonus(unitId: TraderSpecialistUnitId, specializationId: TraderSpecializationId, sectorId: SectorId): number {
  if (specializationId !== sectorId) {
    return 1
  }

  return 1.2
}

export function getSpecializationResearchUnlockId(specializationId: TraderSpecializationId): 'financeSpecialistTraining' | 'technologySpecialistTraining' | 'energySpecialistTraining' {
  if (specializationId === 'finance') return 'financeSpecialistTraining'
  if (specializationId === 'technology') return 'technologySpecialistTraining'
  return 'energySpecialistTraining'
}

export function getTraderSpecialistTrainingCost(unitId: TraderSpecialistUnitId): number {
  return 2_000
}
