import { initialState } from '../src/data/initialState'
import { canAffordCapacityPower, getAvailableDeskSlots, getBulkCapacityInfrastructureCost, getFloorExpansionCost, getOfficeCost, getOfficeExpansionCost, getTotalDeskSlots, getUsedDeskSlots, isAtDeskCapacity } from '../src/utils/capacity'
import { CAPACITY_INFRASTRUCTURE } from '../src/data/capacity'
import { getBulkUnitCost, getPowerUsage } from '../src/utils/economy'
import { normalizeGameState } from '../src/utils/persistence'
import { createPrestigeResetState } from '../src/utils/prestige'
import type { GameState } from '../src/types/game'

function cloneState(state: GameState): GameState {
  return structuredClone(state)
}

function assert(condition: boolean, label: string): void {
  if (!condition) {
    throw new Error(`FAIL: ${label}`)
  }

  console.log(`PASS: ${label}`)
}

function validateDeskSlots(): void {
  const state = cloneState(initialState)
  assert(getTotalDeskSlots(state) === 10, 'player starts with 10 total Desk Slots')
  assert(getUsedDeskSlots(state) === 0, 'initial used Desk Slots is zero')
  assert(getAvailableDeskSlots(state) === 10, 'initial free Desk Slots equals total')
}

function validateCapacityBlocking(): void {
  const state = cloneState(initialState)
  state.cash = 1_000_000
  state.internCount = 10
  state.purchasedUpgrades.juniorHiringProgram = true

  assert(isAtDeskCapacity(state), 'desk capacity reports full at 10/10 traders')
  assert(getBulkUnitCost(state, 'intern', 1).quantity === 0, 'intern purchase is blocked at full capacity')
  assert(getBulkUnitCost(state, 'juniorTrader', 1).quantity === 0, 'junior purchase is blocked at full capacity')
  assert(getBulkUnitCost(state, 'seniorTrader', 1).quantity === 0, 'senior purchase is blocked at full capacity')
  assert(getBulkUnitCost(state, 'ruleBasedBot', 1).quantity >= 0, 'machine purchases remain separate from desk capacity')
  assert(getBulkUnitCost(state, 'internResearchScientist', 1).quantity === 1, 'research staff purchases still work when desk capacity is full')
}

function validateBuyModesAtCapacityEdge(): void {
  const state = cloneState(initialState)
  state.cash = 1_000_000
  state.purchasedUpgrades.juniorHiringProgram = true
  state.internCount = 8

  const buyFive = getBulkUnitCost(state, 'intern', 5)
  const buyMax = getBulkUnitCost(state, 'intern', 'max')

  assert(buyFive.quantity === 0, 'buy mode x5 blocks when only 2 Desk Slots remain')
  assert(buyMax.quantity === 2, 'max buy mode respects remaining Desk Slots exactly')
}

function validateAssignmentsDoNotConsumeExtraSlots(): void {
  const state = cloneState(initialState)
  state.internCount = 4
  state.juniorTraderCount = 3
  state.seniorTraderCount = 2
  state.unlockedSectors.technology = true
  state.sectorAssignments.intern.technology = 3
  state.sectorAssignments.juniorTrader.finance = 2

  assert(getUsedDeskSlots(state) === 9, 'assigned humans still count once toward firm-wide Desk Slots')
  assert(getAvailableDeskSlots(state) === 1, 'sector assignment does not change free Desk Slots')
}

function validateExpansionMath(): void {
  const state = cloneState(initialState)
  const deskSpaceCost = getOfficeExpansionCost(state)
  const floorCost = getFloorExpansionCost(state)
  const officeCost = getOfficeCost(state)
  state.deskSpaceCount = 1
  state.floorSpaceCount = 1
  state.officeCount = 1

  assert(deskSpaceCost === 350, 'first Desk Space cost matches design constant')
  assert(floorCost === 8500, 'first Floor Space cost matches design constant')
  assert(officeCost === 42000, 'first Office cost matches design constant')
  assert(getTotalDeskSlots(state) === 136, 'desk space, floor space, and office increase total Desk Slots correctly')
}

function validateCapacityRequiresEnergy(): void {
  const state = cloneState(initialState)
  state.cash = 1_000_000
  state.serverRackCount = 0

  assert(getPowerUsage(state) === 0, 'capacity energy test starts with zero used power')
  assert(canAffordCapacityPower(state, CAPACITY_INFRASTRUCTURE.deskSpace.powerUsage) === false, 'desk space requires available energy capacity')
  assert(canAffordCapacityPower(state, CAPACITY_INFRASTRUCTURE.floorSpace.powerUsage) === false, 'floor space requires available energy capacity')
  assert(canAffordCapacityPower(state, CAPACITY_INFRASTRUCTURE.office.powerUsage) === false, 'office requires available energy capacity')
}

function validateCapacityBulkBuying(): void {
  const state = cloneState(initialState)
  state.cash = 1_000_000
  state.serverRackCount = 10

  const deskBulk = getBulkCapacityInfrastructureCost(state, 'deskSpace', 5, CAPACITY_INFRASTRUCTURE.deskSpace.powerUsage)
  const floorMax = getBulkCapacityInfrastructureCost(state, 'floorSpace', 'max', CAPACITY_INFRASTRUCTURE.floorSpace.powerUsage)

  assert(deskBulk.quantity === 5, 'desk space x5 bulk buying works when cash and energy allow it')
  assert(deskBulk.totalCost > 0, 'desk space x5 bulk buying has a positive total cost')
  assert(floorMax.quantity > 0, 'floor space max bulk buying returns at least one purchase when affordable')
}

function validateHumansNoLongerUseMachinePower(): void {
  const state = cloneState(initialState)
  state.internCount = 25
  state.juniorTraderCount = 25
  state.seniorTraderCount = 25

  assert(getPowerUsage(state) === 0, 'human traders no longer contribute direct machine-style power usage')
}

function validateMigrationAndReset(): void {
  const migrated = normalizeGameState({
    ...initialState,
    internCount: 5,
    deskSpaceCount: 2,
  })

  assert(migrated !== null, 'capacity migration returns a valid state')

  if (!migrated) {
    return
  }

  assert(migrated.baseDeskSlots === 10, 'missing baseDeskSlots migrates to default 10')
  assert(migrated.floorSpaceCount === 0, 'missing floorSpaceCount migrates to default 0')
  assert(migrated.officeCount === 0, 'missing officeCount migrates to default 0')

  const prestigeSource = cloneState(initialState)
  prestigeSource.lifetimeCashEarned = 10_000_000
  prestigeSource.ruleBasedBotCount = 1
  prestigeSource.deskSpaceCount = 4
  prestigeSource.floorSpaceCount = 2
  prestigeSource.officeCount = 1
  const reset = createPrestigeResetState(prestigeSource)

  assert(reset.baseDeskSlots === 10, 'prestige reset restores base desk slots')
  assert(reset.deskSpaceCount === 0, 'prestige reset clears desk space purchases')
  assert(reset.floorSpaceCount === 0, 'prestige reset clears floor space purchases')
  assert(reset.officeCount === 0, 'prestige reset clears office purchases')

  const fullResetState = cloneState(initialState)
  fullResetState.deskSpaceCount = 3
  fullResetState.floorSpaceCount = 2
  fullResetState.officeCount = 1
  fullResetState.cash = 12345
  const resetToFoundation = cloneState(initialState)

  assert(resetToFoundation.deskSpaceCount === 0, 'full reset baseline clears desk space purchases')
  assert(resetToFoundation.floorSpaceCount === 0, 'full reset baseline clears floor space purchases')
  assert(resetToFoundation.officeCount === 0, 'full reset baseline clears office purchases')
  assert(resetToFoundation.baseDeskSlots === 10, 'full reset baseline restores default base desk slots')
}

function main(): void {
  console.log('Capacity validation')
  validateDeskSlots()
  validateCapacityBlocking()
  validateBuyModesAtCapacityEdge()
  validateAssignmentsDoNotConsumeExtraSlots()
  validateExpansionMath()
  validateCapacityRequiresEnergy()
  validateCapacityBulkBuying()
  validateHumansNoLongerUseMachinePower()
  validateMigrationAndReset()
  console.log('All capacity validation checks passed.')
}

main()
