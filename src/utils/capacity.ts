import { CAPACITY_CONSTANTS } from '../data/capacity'
import type { BuyMode, CapacityInfrastructureId, GameState } from '../types/game'
import { getPowerCapacity, getPowerUsage } from './economy'

export function getCapacityScaledCost(baseCost: number, scaling: number, owned: number): number {
  return Math.floor(baseCost * Math.pow(scaling, owned))
}

export function getOfficeExpansionCost(state: GameState): number {
  return getCapacityScaledCost(
    CAPACITY_CONSTANTS.DESK_SPACE_BASE_COST,
    CAPACITY_CONSTANTS.DESK_SPACE_COST_SCALING,
    state.deskSpaceCount,
  )
}

export function getFloorExpansionCost(state: GameState): number {
  return getCapacityScaledCost(
    CAPACITY_CONSTANTS.FLOOR_SPACE_BASE_COST,
    CAPACITY_CONSTANTS.FLOOR_SPACE_COST_SCALING,
    state.floorSpaceCount,
  )
}

export function getOfficeCost(state: GameState): number {
  return getCapacityScaledCost(
    CAPACITY_CONSTANTS.OFFICE_BASE_COST,
    CAPACITY_CONSTANTS.OFFICE_COST_SCALING,
    state.officeCount,
  )
}

export function getTotalDeskSlots(state: GameState): number {
  return state.baseDeskSlots
    + state.deskSpaceCount * CAPACITY_CONSTANTS.DESK_SPACE_SLOTS
    + state.floorSpaceCount * CAPACITY_CONSTANTS.FLOOR_SPACE_SLOTS
    + state.officeCount * CAPACITY_CONSTANTS.OFFICE_SLOTS
}

export function getUsedDeskSlots(state: GameState): number {
  return state.internCount + state.juniorTraderCount + state.seniorTraderCount
}

export function getAvailableDeskSlots(state: GameState): number {
  return Math.max(0, getTotalDeskSlots(state) - getUsedDeskSlots(state))
}

export function isAtDeskCapacity(state: GameState): boolean {
  return getAvailableDeskSlots(state) <= 0
}

export function canBuyHumanUnit(state: GameState): boolean {
  return getAvailableDeskSlots(state) > 0
}

export function getCapacityPowerUsage(state: GameState): number {
  return state.deskSpaceCount * CAPACITY_CONSTANTS.DESK_SPACE_POWER_USAGE
    + state.floorSpaceCount * CAPACITY_CONSTANTS.FLOOR_SPACE_POWER_USAGE
    + state.officeCount * CAPACITY_CONSTANTS.OFFICE_POWER_USAGE
}

export function canAffordCapacityPower(state: GameState, powerRequired: number): boolean {
  return getPowerUsage(state) + powerRequired <= getPowerCapacity(state)
}

export function getCapacityCount(state: GameState, infrastructureId: CapacityInfrastructureId): number {
  if (infrastructureId === 'deskSpace') {
    return state.deskSpaceCount
  }

  if (infrastructureId === 'floorSpace') {
    return state.floorSpaceCount
  }

  return state.officeCount
}

export function getNextCapacityCost(state: GameState, infrastructureId: CapacityInfrastructureId): number {
  if (infrastructureId === 'deskSpace') {
    return getOfficeExpansionCost(state)
  }

  if (infrastructureId === 'floorSpace') {
    return getFloorExpansionCost(state)
  }

  return getOfficeCost(state)
}

export function getBulkCapacityInfrastructureCost(
  state: GameState,
  infrastructureId: CapacityInfrastructureId,
  quantity: BuyMode,
  powerUsagePerPurchase: number,
): { quantity: number; totalCost: number } {
  const owned = getCapacityCount(state, infrastructureId)

  const getCostAtOwned = (ownedCount: number): number => {
    if (infrastructureId === 'deskSpace') {
      return getCapacityScaledCost(CAPACITY_CONSTANTS.DESK_SPACE_BASE_COST, CAPACITY_CONSTANTS.DESK_SPACE_COST_SCALING, ownedCount)
    }

    if (infrastructureId === 'floorSpace') {
      return getCapacityScaledCost(CAPACITY_CONSTANTS.FLOOR_SPACE_BASE_COST, CAPACITY_CONSTANTS.FLOOR_SPACE_COST_SCALING, ownedCount)
    }

    return getCapacityScaledCost(CAPACITY_CONSTANTS.OFFICE_BASE_COST, CAPACITY_CONSTANTS.OFFICE_COST_SCALING, ownedCount)
  }

  if (quantity === 'max') {
    let totalCost = 0
    let bought = 0
    let simulatedOwned = owned

    while (true) {
      const nextCost = getCostAtOwned(simulatedOwned)

      if (totalCost + nextCost > state.cash) {
        break
      }

      if (!canAffordCapacityPower(state, powerUsagePerPurchase * (bought + 1))) {
        break
      }

      totalCost += nextCost
      simulatedOwned += 1
      bought += 1
    }

    return { quantity: bought, totalCost }
  }

  let totalCost = 0

  if (!canAffordCapacityPower(state, powerUsagePerPurchase * quantity)) {
    return { quantity: 0, totalCost: 0 }
  }

  for (let i = 0; i < quantity; i += 1) {
    totalCost += getCostAtOwned(owned + i)
  }

  return { quantity, totalCost }
}
