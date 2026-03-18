import { initialState } from '../src/data/initialState'
import { normalizeGameState } from '../src/utils/persistence'
import { createPrestigeResetState } from '../src/utils/prestige'
import { getAssignedCount, getAvailableAssignableUnitCount, getCashPerSecond, getGeneralDeskCashPerSecond, getSectorCashPerSecond } from '../src/utils/economy'
import type { GameState, HumanAssignableUnitId, SectorId } from '../src/types/game'

function cloneState(state: GameState): GameState {
  return {
    ...state,
    unlockedSectors: { ...state.unlockedSectors },
    sectorAssignments: {
      intern: { ...state.sectorAssignments.intern },
      juniorTrader: { ...state.sectorAssignments.juniorTrader },
      seniorTrader: { ...state.sectorAssignments.seniorTrader },
      propDesk: { ...state.sectorAssignments.propDesk },
      institutionalDesk: { ...state.sectorAssignments.institutionalDesk },
      hedgeFund: { ...state.sectorAssignments.hedgeFund },
      investmentFirm: { ...state.sectorAssignments.investmentFirm },
    },
    purchasedUpgrades: { ...state.purchasedUpgrades },
    purchasedResearchTech: { ...state.purchasedResearchTech },
    purchasedPolicies: { ...state.purchasedPolicies },
    purchasedPrestigeUpgrades: { ...state.purchasedPrestigeUpgrades },
    repeatableUpgradeRanks: { ...state.repeatableUpgradeRanks },
    settings: { ...state.settings },
    ui: {
      ...state.ui,
      dismissedSectorUnlocks: { ...state.ui.dismissedSectorUnlocks },
      unitBuyModes: { ...state.ui.unitBuyModes },
      powerBuyModes: { ...state.ui.powerBuyModes },
      repeatableUpgradeBuyModes: { ...state.ui.repeatableUpgradeBuyModes },
      prestigePurchasePlan: { ...state.ui.prestigePurchasePlan },
    },
  }
}

function pass(label: string): void {
  console.log(`PASS: ${label}`)
}

function fail(label: string): never {
  throw new Error(`FAIL: ${label}`)
}

function assert(condition: boolean, label: string): void {
  if (!condition) {
    fail(label)
  }

  pass(label)
}

function totalAssigned(state: GameState, unitId: HumanAssignableUnitId): number {
  return getAssignedCount(state, unitId)
}

function validateAssignmentInvariants(): void {
  const state = cloneState(initialState)
  state.internCount = 10
  state.juniorTraderCount = 8
  state.seniorTraderCount = 6
  state.unlockedSectors.technology = true
  state.unlockedSectors.energy = true
  state.sectorAssignments.intern.finance = 3
  state.sectorAssignments.intern.technology = 2
  state.sectorAssignments.juniorTrader.energy = 5
  state.sectorAssignments.seniorTrader.finance = 1
  state.sectorAssignments.seniorTrader.technology = 2

  assert(totalAssigned(state, 'intern') === 5, 'intern total assigned counts across sectors')
  assert(getAvailableAssignableUnitCount(state, 'intern') === 5, 'intern available count is owned minus assigned')
  assert(totalAssigned(state, 'juniorTrader') === 5, 'junior total assigned counts across sectors')
  assert(getAvailableAssignableUnitCount(state, 'juniorTrader') === 3, 'junior available count is owned minus assigned')
  assert(totalAssigned(state, 'seniorTrader') === 3, 'senior total assigned counts across sectors')
  assert(getAvailableAssignableUnitCount(state, 'seniorTrader') === 3, 'senior available count is owned minus assigned')
}

function validateLockedSectorBehavior(): void {
  const state = cloneState(initialState)
  state.internCount = 5
  state.sectorAssignments.intern.technology = 4

  assert(getSectorCashPerSecond(state, 'technology') === 0, 'locked technology sector contributes zero income')
  assert(getAssignedCount(state, 'intern') === 0, 'locked sector assignments do not count as active assignments')
  assert(getAvailableAssignableUnitCount(state, 'intern') === 5, 'locked sector assignments do not reduce availability')
}

function validateIncomeSplits(): void {
  const baseline = cloneState(initialState)
  baseline.internCount = 10
  baseline.juniorTraderCount = 5
  baseline.seniorTraderCount = 2
  baseline.unlockedSectors.technology = true

  const assigned = cloneState(baseline)
  assigned.sectorAssignments.intern.technology = 5

  const baselineCash = getCashPerSecond(baseline)
  const assignedCash = getCashPerSecond(assigned)
  const generalDeskCash = getGeneralDeskCashPerSecond(assigned)
  const techCash = getSectorCashPerSecond(assigned, 'technology')

  assert(generalDeskCash > 0, 'general desk retains income after partial assignment')
  assert(techCash > 0, 'unlocked sector generates income when staffed')
  assert(assignedCash > baselineCash, 'technology multiplier increases total income over baseline finance desk allocation')
}

function validateSaveNormalization(): void {
  const oldSave = {
    ...initialState,
    internCount: 4,
    juniorTraderCount: 3,
    purchasedResearchTech: { algorithmicTrading: true, powerSystemsEngineering: true },
    sectorAssignments: {
      intern: { finance: 2, technology: 10, energy: 5 },
      juniorTrader: { finance: 2, technology: 2, energy: 2 },
      seniorTrader: { finance: 1, technology: 1, energy: 1 },
    },
  }

  const normalized = normalizeGameState(oldSave)
  assert(normalized !== null, 'sector save normalization returns a valid state')

  if (!normalized) {
    return
  }

  assert(normalized.unlockedSectors.technology === false, 'technology remains locked unless technology market research is present during migration')
  assert(normalized.unlockedSectors.energy === false, 'energy remains locked unless energy market research is present during migration')
  assert(totalAssigned(normalized, 'intern') <= normalized.internCount, 'normalized intern assignments clamp to owned count')
  assert(totalAssigned(normalized, 'juniorTrader') <= normalized.juniorTraderCount, 'normalized junior assignments clamp to owned count')
  assert(totalAssigned(normalized, 'seniorTrader') <= normalized.seniorTraderCount, 'normalized senior assignments clamp to owned count')
}

function validatePrestigeReset(): void {
  const state = cloneState(initialState)
  state.cash = 5_000
  state.lifetimeCashEarned = 10_000_000
  state.ruleBasedBotCount = 1
  state.internCount = 12
  state.juniorTraderCount = 7
  state.seniorTraderCount = 4
  state.unlockedSectors.technology = true
  state.unlockedSectors.energy = true
  state.sectorAssignments.intern.technology = 6
  state.sectorAssignments.juniorTrader.energy = 3
  state.ui.dismissedSectorUnlocks.technology = true
  state.ui.dismissedSectorUnlocks.energy = true

  const resetState = createPrestigeResetState(state)

  assert(resetState.internCount === 0 && resetState.juniorTraderCount === 0 && resetState.seniorTraderCount === 0, 'prestige reset clears owned assignable humans')
  assert(totalAssigned(resetState, 'intern') === 0 && totalAssigned(resetState, 'juniorTrader') === 0 && totalAssigned(resetState, 'seniorTrader') === 0, 'prestige reset clears sector assignments')
  assert(resetState.unlockedSectors.finance === true && resetState.unlockedSectors.technology === false && resetState.unlockedSectors.energy === false, 'prestige reset restores default sector unlocks')
}

function main(): void {
  console.log('Sector validation')
  validateAssignmentInvariants()
  validateLockedSectorBehavior()
  validateIncomeSplits()
  validateSaveNormalization()
  validatePrestigeReset()
  console.log('All sector validation checks passed.')
}

main()
