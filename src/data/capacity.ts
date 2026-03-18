import type { CapacityInfrastructureDefinition, CapacityInfrastructureId } from '../types/game'
import { mechanics } from '../lib/mechanics'

export const CAPACITY_CONSTANTS = {
  BASE_DESK_SLOTS: mechanics.capacityInfrastructure.baseDeskSlots,
  DESK_SPACE_SLOTS: mechanics.capacityInfrastructure.deskSpace.slotsGranted,
  FLOOR_SPACE_SLOTS: mechanics.capacityInfrastructure.floorSpace.slotsGranted,
  OFFICE_SLOTS: mechanics.capacityInfrastructure.office.slotsGranted,
  DESK_SPACE_BASE_COST: mechanics.capacityInfrastructure.deskSpace.baseCost,
  DESK_SPACE_COST_SCALING: mechanics.capacityInfrastructure.deskSpace.costScaling,
  DESK_SPACE_POWER_USAGE: mechanics.capacityInfrastructure.deskSpace.powerUsage,
  FLOOR_SPACE_BASE_COST: mechanics.capacityInfrastructure.floorSpace.baseCost,
  FLOOR_SPACE_COST_SCALING: mechanics.capacityInfrastructure.floorSpace.costScaling,
  FLOOR_SPACE_POWER_USAGE: mechanics.capacityInfrastructure.floorSpace.powerUsage,
  OFFICE_BASE_COST: mechanics.capacityInfrastructure.office.baseCost,
  OFFICE_COST_SCALING: mechanics.capacityInfrastructure.office.costScaling,
  OFFICE_POWER_USAGE: mechanics.capacityInfrastructure.office.powerUsage,
} as const

export const CAPACITY_INFRASTRUCTURE: Record<CapacityInfrastructureId, CapacityInfrastructureDefinition> = {
  deskSpace: {
    id: 'deskSpace',
    name: 'Desk Space',
    baseCost: CAPACITY_CONSTANTS.DESK_SPACE_BASE_COST,
    costScaling: CAPACITY_CONSTANTS.DESK_SPACE_COST_SCALING,
    slotsGranted: CAPACITY_CONSTANTS.DESK_SPACE_SLOTS,
    powerUsage: CAPACITY_CONSTANTS.DESK_SPACE_POWER_USAGE,
    description: mechanics.capacityInfrastructure.deskSpace.description,
  },
  floorSpace: {
    id: 'floorSpace',
    name: 'Floor Space',
    baseCost: CAPACITY_CONSTANTS.FLOOR_SPACE_BASE_COST,
    costScaling: CAPACITY_CONSTANTS.FLOOR_SPACE_COST_SCALING,
    slotsGranted: CAPACITY_CONSTANTS.FLOOR_SPACE_SLOTS,
    powerUsage: CAPACITY_CONSTANTS.FLOOR_SPACE_POWER_USAGE,
    description: mechanics.capacityInfrastructure.floorSpace.description,
  },
  office: {
    id: 'office',
    name: 'Office',
    baseCost: CAPACITY_CONSTANTS.OFFICE_BASE_COST,
    costScaling: CAPACITY_CONSTANTS.OFFICE_COST_SCALING,
    slotsGranted: CAPACITY_CONSTANTS.OFFICE_SLOTS,
    powerUsage: CAPACITY_CONSTANTS.OFFICE_POWER_USAGE,
    description: mechanics.capacityInfrastructure.office.description,
  },
}

export function getCapacityInfrastructureDefinition(infrastructureId: CapacityInfrastructureId): CapacityInfrastructureDefinition {
  return CAPACITY_INFRASTRUCTURE[infrastructureId]
}
