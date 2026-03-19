import mechanicsData from '../../mechanics.json'
import type { AutomationStrategyId, CapacityInfrastructureId, GameState, PowerInfrastructureId, ResearchTechId, SectorId, UnitId } from '../types/game'
import type { MechanicsJson } from '../types/mechanics'

export const mechanics = mechanicsData as MechanicsJson

export type Mechanics = MechanicsJson

function countValues(record: Record<string, number>): number {
  return Object.values(record).reduce((sum, value) => sum + value, 0)
}

function getPowerInfrastructureCount(state: GameState, infrastructureId: PowerInfrastructureId): number {
  if (infrastructureId === 'serverRack') return state.serverRackCount
  if (infrastructureId === 'serverRoom') return state.serverRoomCount
  if (infrastructureId === 'dataCenter') return state.dataCenterCount
  return state.cloudComputeCount
}

function getCapacityInfrastructureCount(state: GameState, infrastructureId: CapacityInfrastructureId): number {
  if (infrastructureId === 'deskSpace') return state.deskSpaceCount
  if (infrastructureId === 'floorSpace') return state.floorSpaceCount
  return state.officeCount
}

export function isResearchGateMet(state: GameState, techId: ResearchTechId | null | undefined): boolean {
  return techId == null || state.purchasedResearchTech[techId] === true
}

export function buildMechanicsPredicate(condition: unknown): ((_state: GameState) => boolean) | undefined {
  if (condition == null) {
    return undefined
  }

  return (state: GameState) => isMechanicsConditionMet(condition, state)
}

export function buildMechanicsStateSnapshot(state: GameState): Record<string, unknown> {
  const automationStrategiesUnlockedCount = (Object.keys(mechanics.automationStrategies) as AutomationStrategyId[])
    .filter((strategyId) => isResearchGateMet(state, mechanics.automationStrategies[strategyId].unlockResearchTechId))
    .length

  const totalMandatesCount =
    countValues(state.institutionMandates.propDesk)
    + countValues(state.institutionMandates.institutionalDesk)
    + countValues(state.institutionMandates.hedgeFund)
    + countValues(state.institutionMandates.investmentFirm)

  const specialistsOrMandatesCount = countValues(state.traderSpecialists.seniorTrader) + totalMandatesCount

  return {
    ...state,
    __purchasedPoliciesCount: Object.values(state.purchasedPolicies).filter(Boolean).length,
    __scientistCount: state.internResearchScientistCount + state.juniorResearchScientistCount + state.seniorResearchScientistCount,
    __humanCount: state.internCount + state.juniorTraderCount + state.seniorTraderCount,
    __institutionCount: state.propDeskCount + state.institutionalDeskCount + state.hedgeFundCount + state.investmentFirmCount,
    __automationCount: state.quantTraderCount + state.ruleBasedBotCount + state.mlTradingBotCount + state.aiTradingBotCount,
    __automationPowerUsersCount: state.ruleBasedBotCount + state.mlTradingBotCount + state.aiTradingBotCount,
    __automationStrategiesUnlockedCount: automationStrategiesUnlockedCount,
    __powerInfrastructureCount: state.serverRackCount + state.serverRoomCount + state.dataCenterCount + state.cloudComputeCount,
    __activeTraderSeats: state.internCount + state.juniorTraderCount + state.seniorTraderCount,
    __specialistsOrMandatesCount: specialistsOrMandatesCount,
    __totalMandatesCount: totalMandatesCount,
    __unlockedSectorCount: Object.values(state.unlockedSectors).filter(Boolean).length,
  }
}

export function isMechanicsConditionMet(condition: unknown, state: GameState): boolean {
  return evaluateMechanicsCondition(condition, buildMechanicsStateSnapshot(state))
}

export function isUnitDefinitionUnlocked(state: GameState, unitId: UnitId): boolean {
  const unit = mechanics.units[unitId]

  return isResearchGateMet(state, unit.unlockResearchTechId as ResearchTechId | null | undefined)
    && isMechanicsConditionMet(unit.additionalPurchaseRequirement, state)
}

export function isAutomationStrategyDefinitionUnlocked(state: GameState, strategyId: AutomationStrategyId): boolean {
  return isResearchGateMet(state, mechanics.automationStrategies[strategyId].unlockResearchTechId)
}

export function isPowerInfrastructureDefinitionVisible(state: GameState, infrastructureId: PowerInfrastructureId): boolean {
  return getPowerInfrastructureCount(state, infrastructureId) > 0
    || isResearchGateMet(state, mechanics.powerInfrastructure[infrastructureId].unlockResearchTechId)
}

export function isCapacityInfrastructureDefinitionVisible(state: GameState, infrastructureId: CapacityInfrastructureId): boolean {
  return getCapacityInfrastructureCount(state, infrastructureId) > 0
    || isResearchGateMet(state, mechanics.capacityInfrastructure[infrastructureId].unlockResearchTechId)
}

export function isSectorDefinitionUnlockedByResearch(state: GameState, sectorId: SectorId): boolean {
  return isResearchGateMet(state, mechanics.sectors[sectorId].unlockResearchTechId)
}

export function evaluateMechanicsCondition(condition: unknown, state: Record<string, unknown>): boolean {
  if (!condition || typeof condition !== 'object') {
    return true
  }

  const value = condition as Record<string, unknown>
  let matchedCondition = false
  let passed = true

  if (Array.isArray(value.all)) {
    matchedCondition = true
    passed = passed && (value.all as unknown[]).every((item) => evaluateMechanicsCondition(item, state))
  }

  if (Array.isArray(value.any)) {
    matchedCondition = true
    passed = passed && (value.any as unknown[]).some((item) => evaluateMechanicsCondition(item, state))
  }

  const countChecks: Array<[string, string]> = [
    ['prestigeCountAtLeast', 'prestigeCount'],
    ['purchasedPoliciesAtLeast', '__purchasedPoliciesCount'],
    ['scientistsCountAtLeast', '__scientistCount'],
    ['scientistCountAtLeast', '__scientistCount'],
    ['humanCountAtLeast', '__humanCount'],
    ['institutionCountAtLeast', '__institutionCount'],
    ['automationCountAtLeast', '__automationCount'],
    ['automationPowerUsersAtLeast', '__automationPowerUsersCount'],
    ['automationStrategiesUnlockedAtLeast', '__automationStrategiesUnlockedCount'],
    ['anyPowerInfrastructureAtLeast', '__powerInfrastructureCount'],
    ['activeTraderSeatsAtLeast', '__activeTraderSeats'],
    ['specialistsOrMandatesAtLeast', '__specialistsOrMandatesCount'],
    ['totalMandatesAtLeast', '__totalMandatesCount'],
    ['researchPointsAtLeast', 'researchPoints'],
    ['internCountAtLeast', 'internCount'],
    ['juniorTraderCountAtLeast', 'juniorTraderCount'],
    ['seniorTraderCountAtLeast', 'seniorTraderCount'],
    ['quantTraderCountAtLeast', 'quantTraderCount'],
    ['propDeskCountAtLeast', 'propDeskCount'],
    ['institutionalDeskCountAtLeast', 'institutionalDeskCount'],
    ['hedgeFundCountAtLeast', 'hedgeFundCount'],
    ['investmentFirmCountAtLeast', 'investmentFirmCount'],
    ['ruleBasedBotCountAtLeast', 'ruleBasedBotCount'],
    ['mlTradingBotCountAtLeast', 'mlTradingBotCount'],
    ['aiTradingBotCountAtLeast', 'aiTradingBotCount'],
    ['internResearchScientistCountAtLeast', 'internResearchScientistCount'],
    ['juniorResearchScientistCountAtLeast', 'juniorResearchScientistCount'],
    ['seniorResearchScientistCountAtLeast', 'seniorResearchScientistCount'],
    ['juniorPoliticianCountAtLeast', 'juniorPoliticianCount'],
    ['serverRackCountAtLeast', 'serverRackCount'],
    ['serverRoomCountAtLeast', 'serverRoomCount'],
    ['dataCenterCountAtLeast', 'dataCenterCount'],
    ['cloudComputeCountAtLeast', 'cloudComputeCount'],
  ]

  for (const [conditionKey, stateKey] of countChecks) {
    if (typeof value[conditionKey] === 'number') {
      matchedCondition = true
      passed = passed && Number(state[stateKey] ?? 0) >= Number(value[conditionKey])
    }
  }

  if (typeof value.discoveredLobbying === 'boolean') {
    matchedCondition = true
    passed = passed && Boolean(state.discoveredLobbying) === value.discoveredLobbying
  }

  if (typeof value.complianceVisible === 'boolean') {
    matchedCondition = true
    passed = passed && Boolean(state.complianceVisible) === value.complianceVisible
  }

  if (typeof value.anySectorUnlocked === 'boolean') {
    matchedCondition = true
    passed = passed && value.anySectorUnlocked === (Boolean(state.__unlockedSectorCount) && Number(state.__unlockedSectorCount) > 0)
  }

  if (Array.isArray(value.researchTechPurchased)) {
    const purchasedResearchTech = state.purchasedResearchTech as Record<string, boolean> | undefined
    matchedCondition = true
    passed = passed && (value.researchTechPurchased as string[]).every((id) => purchasedResearchTech?.[id] === true)
  }

  if (Array.isArray(value.automationKindsAny)) {
    matchedCondition = true
    passed = passed && (value.automationKindsAny as string[]).some((id) => Number(state[`${id}Count`] ?? 0) > 0)
  }

  return matchedCondition ? passed : true
}

export function getUnitDefinition(unitId: keyof Mechanics['units']) {
  return mechanics.units[unitId]
}

export function getRepeatableDefinition(upgradeId: keyof Mechanics['repeatableUpgrades']) {
  return mechanics.repeatableUpgrades[upgradeId]
}

export function getUpgradeDefinition(upgradeId: keyof Mechanics['upgrades']) {
  return mechanics.upgrades.items[upgradeId as keyof Mechanics['upgrades']['items']]
}

export function getResearchTechDefinition(techId: keyof Mechanics['research']['tech']) {
  return mechanics.research.tech[techId]
}

export function getPowerInfrastructureDefinition(infrastructureId: keyof Mechanics['powerInfrastructure']) {
  return mechanics.powerInfrastructure[infrastructureId]
}

export function getCapacityInfrastructureDefinition(infrastructureId: keyof Mechanics['capacityInfrastructure']) {
  return mechanics.capacityInfrastructure[infrastructureId]
}
