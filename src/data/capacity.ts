import type { CapacityInfrastructureDefinition, CapacityInfrastructureId } from '../types/game'

export const CAPACITY_CONSTANTS = {
  BASE_DESK_SLOTS: 10,
  DESK_SPACE_SLOTS: 1,
  FLOOR_SPACE_SLOTS: 25,
  OFFICE_SLOTS: 100,
  DESK_SPACE_BASE_COST: 180,
  DESK_SPACE_COST_SCALING: 1.08,
  DESK_SPACE_POWER_USAGE: 0.5,
  FLOOR_SPACE_BASE_COST: 8500,
  FLOOR_SPACE_COST_SCALING: 1.24,
  FLOOR_SPACE_POWER_USAGE: 8,
  OFFICE_BASE_COST: 42000,
  OFFICE_COST_SCALING: 1.38,
  OFFICE_POWER_USAGE: 30,
} as const

export const CAPACITY_INFRASTRUCTURE: Record<CapacityInfrastructureId, CapacityInfrastructureDefinition> = {
  deskSpace: {
    id: 'deskSpace',
    name: 'Desk Space',
    baseCost: CAPACITY_CONSTANTS.DESK_SPACE_BASE_COST,
    costScaling: CAPACITY_CONSTANTS.DESK_SPACE_COST_SCALING,
    slotsGranted: CAPACITY_CONSTANTS.DESK_SPACE_SLOTS,
    powerUsage: CAPACITY_CONSTANTS.DESK_SPACE_POWER_USAGE,
    description: 'Adds 1 Desk Slot for one additional staff seat and its energy footprint.',
  },
  floorSpace: {
    id: 'floorSpace',
    name: 'Floor Space',
    baseCost: CAPACITY_CONSTANTS.FLOOR_SPACE_BASE_COST,
    costScaling: CAPACITY_CONSTANTS.FLOOR_SPACE_COST_SCALING,
    slotsGranted: CAPACITY_CONSTANTS.FLOOR_SPACE_SLOTS,
    powerUsage: CAPACITY_CONSTANTS.FLOOR_SPACE_POWER_USAGE,
    description: 'Adds 25 Desk Slots through a larger floor allocation and its support load.',
  },
  office: {
    id: 'office',
    name: 'Office',
    baseCost: CAPACITY_CONSTANTS.OFFICE_BASE_COST,
    costScaling: CAPACITY_CONSTANTS.OFFICE_COST_SCALING,
    slotsGranted: CAPACITY_CONSTANTS.OFFICE_SLOTS,
    powerUsage: CAPACITY_CONSTANTS.OFFICE_POWER_USAGE,
    description: 'Adds 100 Desk Slots through a major office acquisition and the required energy load.',
  },
}

export function getCapacityInfrastructureDefinition(infrastructureId: CapacityInfrastructureId): CapacityInfrastructureDefinition {
  return CAPACITY_INFRASTRUCTURE[infrastructureId]
}
