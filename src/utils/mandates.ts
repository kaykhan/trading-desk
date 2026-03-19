import { getRepeatableUpgradeMultiplier } from '../data/repeatableUpgrades'
import type { GameState, InstitutionalMandateId, InstitutionalMandateUnitId, SectorId } from '../types/game'
import { mechanics } from '../lib/mechanics'

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

  const base = mechanics.mandates.matchingSectorBaseBonus[unitId]
  return base * getRepeatableUpgradeMultiplier(state, 'trainingMethodology')
}

export function getInstitutionMandateResearchUnlockId(mandateId: InstitutionalMandateId): 'financeMandateFramework' | 'techGrowthMandateFramework' | 'energyExposureFramework' {
  return mechanics.mandates.researchUnlocks[mandateId] as 'financeMandateFramework' | 'techGrowthMandateFramework' | 'energyExposureFramework'
}

export function getInstitutionMandateApplicationCost(unitId: InstitutionalMandateUnitId): number {
  return mechanics.mandates.applicationCostCash[unitId]
}
