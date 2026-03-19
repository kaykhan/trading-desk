import { initialState } from '../data/initialState'
import { PRESTIGE_REPUTATION_GAIN_CURVE, PRESTIGE_TIERS, PRESTIGE_TIER_LABELS, getPrestigeUpgradeDefinition } from '../data/prestigeUpgrades'
import { mechanics } from '../lib/mechanics'
import type { GameState, PrestigeTierId, PrestigeUpgradeId } from '../types/game'

const PRESTIGE_CONSTANTS = mechanics.constants
const PRESTIGE_UNLOCK_REQUIREMENTS = mechanics.prestige.unlockRequirements

function getPrestigeUpgradeRank(state: GameState, upgradeId: PrestigeUpgradeId): number {
  return state.purchasedPrestigeUpgrades[upgradeId] ?? 0
}

export function getPrestigeTierId(prestigeCount: number): PrestigeTierId | null {
  if (prestigeCount <= 0) {
    return null
  }

  return PRESTIGE_TIERS[Math.min(prestigeCount, PRESTIGE_TIERS.length) - 1] ?? null
}

export function getPrestigeTierLabel(prestigeCount: number): string {
  const tierId = getPrestigeTierId(prestigeCount)
  return tierId ? PRESTIGE_TIER_LABELS[tierId] : 'Unranked'
}

export function getNextPrestigeTierLabel(prestigeCount: number): string | null {
  if (prestigeCount >= PRESTIGE_TIERS.length) {
    return null
  }

  return PRESTIGE_TIER_LABELS[PRESTIGE_TIERS[prestigeCount]]
}

export function getPrestigeGain(_lifetimeCashEarned: number, _multiplier = 1, prestigeCount = 0): number {
  if (_lifetimeCashEarned < Number(PRESTIGE_UNLOCK_REQUIREMENTS.lifetimeCashAtLeast ?? PRESTIGE_CONSTANTS.prestigeUnlockLifetimeCash ?? 0)) {
    return 0
  }

  if (prestigeCount >= PRESTIGE_REPUTATION_GAIN_CURVE.length) {
    return 0
  }

  return Math.floor(PRESTIGE_REPUTATION_GAIN_CURVE[prestigeCount] * _multiplier)
}

export function getReputationGainForNextPrestige(state: GameState): number {
  return getPrestigeGain(state.lifetimeCashEarned, state.globalBoostsOwned.globalReputationBoost ? 1.05 : 1, state.prestigeCount)
}

export function getPrestigeGoalNextRankCost(_goalId: PrestigeUpgradeId, currentRank: number): number {
  if (currentRank <= 2) return 1
  if (currentRank <= 5) return 2
  if (currentRank <= 7) return 3
  return 4
}

export function getLifetimeReputation(state: GameState): number {
  return state.reputation + state.reputationSpent
}

export function getGlobalRecognitionMultiplier(state: GameState): number {
  const rank = getPrestigeUpgradeRank(state, 'globalRecognition')
  return 1 + rank * Number(PRESTIGE_CONSTANTS.globalRecognitionProfitBonusPerRank ?? 0)
}

export function getResearchPrestigeMultiplier(state: GameState): number {
  const rank = getPrestigeUpgradeRank(state, 'institutionalKnowledge')
  return 1 + rank * Number(PRESTIGE_CONSTANTS.institutionalKnowledgeResearchBonusPerRank ?? 0)
}

export function getSeedCapitalBonus(state: GameState): number {
  const rank = getPrestigeUpgradeRank(state, 'seedCapital')
  return rank * Number(PRESTIGE_CONSTANTS.seedCapitalPerRank ?? 0)
}

export function getHumanStaffCostMultiplier(state: GameState): number {
  const rank = getPrestigeUpgradeRank(state, 'betterHiringPipeline')
  return Math.max(Number(PRESTIGE_CONSTANTS.betterHiringPipelineDiscountFloor ?? 0.2), 1 - rank * Number(PRESTIGE_CONSTANTS.betterHiringPipelineDiscountPerRank ?? 0))
}

export function getMachineOutputPrestigeMultiplier(state: GameState): number {
  const rank = getPrestigeUpgradeRank(state, 'gridOrchestration')
  return 1 + rank * Number(PRESTIGE_CONSTANTS.gridOrchestrationMachineBonusPerRank ?? 0)
}

export function getPowerCapacityPrestigeMultiplier(state: GameState): number {
  const rank = getPrestigeUpgradeRank(state, 'gridOrchestration')
  return 1 + rank * Number(PRESTIGE_CONSTANTS.gridOrchestrationPowerBonusPerRank ?? 0)
}

export function getComplianceFrameworksRelief(state: GameState): number {
  const rank = getPrestigeUpgradeRank(state, 'complianceFrameworks')
  return rank * Number(mechanics.prestige.upgrades.complianceFrameworks.effectPerRank)
}

export function getPolicyCapitalMultiplier(state: GameState): number {
  const rank = getPrestigeUpgradeRank(state, 'policyCapital')
  return 1 + rank * Number(PRESTIGE_CONSTANTS.policyCapitalInfluenceBonusPerRank ?? 0)
}

export function getMarketReputationMultiplier(state: GameState): number {
  const rank = getPrestigeUpgradeRank(state, 'marketReputation')
  return 1 + rank * Number(PRESTIGE_CONSTANTS.marketReputationSectorBonusPerRank ?? 0)
}

export function getDeskEfficiencyMultiplier(state: GameState): number {
  const rank = getPrestigeUpgradeRank(state, 'deskEfficiency')
  return 1 + rank * Number(PRESTIGE_CONSTANTS.deskEfficiencyHumanBonusPerRank ?? 0)
}

export function getStrategicReservesCooldownMultiplier(state: GameState): number {
  const rank = getPrestigeUpgradeRank(state, 'strategicReserves')
  return Math.max(Number(PRESTIGE_CONSTANTS.strategicReservesCooldownFloor ?? 0.5), 1 - rank * Number(PRESTIGE_CONSTANTS.strategicReservesCooldownReductionPerRank ?? 0))
}

export function canPrestige(state: GameState): boolean {
  const prestigeCap = Number(PRESTIGE_UNLOCK_REQUIREMENTS.prestigeCountBelow ?? PRESTIGE_TIERS.length)
  const requiredUnits = Array.isArray(PRESTIGE_UNLOCK_REQUIREMENTS.requiresAnyUnits) ? PRESTIGE_UNLOCK_REQUIREMENTS.requiresAnyUnits as Array<'quantTrader' | 'ruleBasedBot'> : ['quantTrader', 'ruleBasedBot']
  const hasRequiredUnit = requiredUnits.some((unitId) => (unitId === 'quantTrader' ? state.quantTraderCount : state.ruleBasedBotCount) > 0)
  return state.prestigeCount < prestigeCap && getReputationGainForNextPrestige(state) > 0 && hasRequiredUnit
}

export function createPrestigeResetState(state: GameState, plannedPurchases?: Partial<Record<PrestigeUpgradeId, number>>): GameState {
  const gainedReputation = getReputationGainForNextPrestige(state)
  const prestigeCap = Number(PRESTIGE_UNLOCK_REQUIREMENTS.prestigeCountBelow ?? PRESTIGE_TIERS.length)

  if (gainedReputation <= 0 || state.prestigeCount >= prestigeCap) {
    return state
  }

  const nextReputation = state.reputation + gainedReputation
  const seedCapitalBonus = getSeedCapitalBonus(state)

  const nextState: GameState = {
    ...initialState,
    cash: seedCapitalBonus,
    discoveredLobbying: state.discoveredLobbying,
    unlockedMetaMilestones: { ...state.unlockedMetaMilestones },
    reputation: nextReputation,
    reputationSpent: state.reputationSpent,
    prestigeCount: Math.min(prestigeCap, state.prestigeCount + 1),
    purchasedPrestigeUpgrades: { ...state.purchasedPrestigeUpgrades },
    globalBoostsOwned: { ...state.globalBoostsOwned },
    lastSaveTimestamp: Date.now(),
  }

  if (!plannedPurchases) {
    return nextState
  }

  for (const upgradeId of Object.keys(plannedPurchases) as PrestigeUpgradeId[]) {
    const plannedRanks = plannedPurchases[upgradeId] ?? 0
    if (plannedRanks <= 0) continue

    const definition = getPrestigeUpgradeDefinition(upgradeId)
    const currentRank = nextState.purchasedPrestigeUpgrades[upgradeId] ?? 0
    if (!definition) continue

    let nextRank = currentRank
    for (let i = 0; i < plannedRanks; i += 1) {
      const nextCost = getPrestigeGoalNextRankCost(upgradeId, nextRank)
      if (nextRank >= definition.maxRank || nextState.reputation < nextCost) {
        break
      }

      nextState.reputation -= nextCost
      nextState.reputationSpent += nextCost
      nextRank += 1
    }

    nextState.purchasedPrestigeUpgrades[upgradeId] = nextRank
  }

  return nextState
}
