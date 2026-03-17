import { getRepeatableUpgradeMultiplier } from '../data/repeatableUpgrades'
import type { GameState, InstitutionalMandateId, InstitutionalMandateUnitId, SectorId } from '../types/game'

const MANDATE_IDS: InstitutionalMandateId[] = ['finance', 'technology', 'energy']

export function getInstitutionMandateCount(state: GameState, unitId: InstitutionalMandateUnitId, mandateId: InstitutionalMandateId): number {
  return state.institutionMandates[unitId][mandateId] ?? 0
}

export function getTotalInstitutionMandates(state: GameState, unitId: InstitutionalMandateUnitId): number {
  return MANDATE_IDS.reduce((total, mandateId) => total + getInstitutionMandateCount(state, unitId, mandateId), 0)
}

export function getGenericInstitutionCount(state: GameState, unitId: InstitutionalMandateUnitId): number {
  const owned = unitId === 'propDesk'
    ? state.propDeskCount
    : unitId === 'institutionalDesk'
      ? state.institutionalDeskCount
      : unitId === 'hedgeFund'
        ? state.hedgeFundCount
        : state.investmentFirmCount

  return Math.max(0, owned - getTotalInstitutionMandates(state, unitId))
}

export function getAssignedInstitutionMandatesForSector(state: GameState, unitId: InstitutionalMandateUnitId, mandateId: InstitutionalMandateId, sectorId: SectorId): number {
  if (mandateId !== sectorId || state.unlockedSectors[sectorId] !== true) {
    return 0
  }

  const assignedToSector = state.sectorAssignments[unitId]?.[sectorId] ?? 0
  return Math.min(assignedToSector, getInstitutionMandateCount(state, unitId, mandateId))
}

export function getInstitutionMandateBonus(state: GameState, unitId: InstitutionalMandateUnitId, mandateId: InstitutionalMandateId, sectorId: SectorId): number {
  if (mandateId !== sectorId) {
    return 1
  }

  const base = unitId === 'propDesk' ? 1.05 : unitId === 'institutionalDesk' ? 1.075 : unitId === 'hedgeFund' ? 1.1 : 1.125
  return base * getRepeatableUpgradeMultiplier(state, 'trainingMethodology')
}

export function getInstitutionMandateResearchUnlockId(mandateId: InstitutionalMandateId): 'financeMandateFramework' | 'techGrowthMandateFramework' | 'energyExposureFramework' {
  if (mandateId === 'finance') return 'financeMandateFramework'
  if (mandateId === 'technology') return 'techGrowthMandateFramework'
  return 'energyExposureFramework'
}

export function getInstitutionMandateApplicationCost(unitId: InstitutionalMandateUnitId): number {
  if (unitId === 'propDesk') return 5_000
  if (unitId === 'institutionalDesk') return 12_000
  if (unitId === 'hedgeFund') return 30_000
  return 75_000
}
