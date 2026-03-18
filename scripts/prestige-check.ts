import { initialState } from '../src/data/initialState'
import type { GameState, PrestigeUpgradeId } from '../src/types/game'
import { createPrestigeResetState, getHumanStaffCostMultiplier, getReputationGainForNextPrestige, getResearchPrestigeMultiplier, getSeedCapitalBonus } from '../src/utils/prestige'

function cloneState(state: GameState): GameState {
  return structuredClone(state)
}

function spendPlannedPrestige(state: GameState, purchases: Partial<Record<PrestigeUpgradeId, number>>): GameState {
  return createPrestigeResetState(state, purchases)
}

const prestigeReady = cloneState(initialState)
prestigeReady.lifetimeCashEarned = 4_500_000
prestigeReady.quantTraderCount = 1
prestigeReady.reputation = 0
prestigeReady.reputationSpent = 0

const baseGain = getReputationGainForNextPrestige(prestigeReady)
const baseReset = createPrestigeResetState(prestigeReady)
const plannedReset = spendPlannedPrestige(prestigeReady, {
  seedCapital: 1,
  betterHiringPipeline: 1,
  institutionalKnowledge: 1,
})

console.log('Prestige smoke check')
console.log(`- Reputation gain at thresholded state: ${baseGain}`)
console.log(`- Base prestige count after reset: ${baseReset.prestigeCount}`)
console.log(`- Base reset starting cash: ${baseReset.cash}`)
console.log(`- Planned reset starting cash: ${plannedReset.cash}`)
console.log(`- Seed capital bonus after planned purchases applies next run only: ${getSeedCapitalBonus(plannedReset)}`)
console.log(`- Better Hiring Pipeline multiplier after planned purchases: ${getHumanStaffCostMultiplier(plannedReset).toFixed(2)}`)
console.log(`- Institutional Knowledge multiplier after planned purchases: ${getResearchPrestigeMultiplier(plannedReset).toFixed(2)}`)
