import { GAME_CONSTANTS } from '../data/constants'
import { initialState } from '../data/initialState'
import { PRESTIGE_REPUTATION_GAIN_CURVE, PRESTIGE_TIERS, PRESTIGE_TIER_LABELS, getPrestigeUpgradeDefinition } from '../data/prestigeUpgrades'
import type { GameState, PrestigeTierId, PrestigeUpgradeId } from '../types/game'

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
  if (_lifetimeCashEarned < GAME_CONSTANTS.prestigeUnlockLifetimeCash) {
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
  const rank = state.purchasedPrestigeUpgrades.globalRecognition ?? 0
  return 1 + rank * 0.05
}

export function getResearchPrestigeMultiplier(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.institutionalKnowledge ?? 0
  return 1 + rank * 0.1
}

export function getSeedCapitalBonus(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.seedCapital ?? 0
  return rank * 250
}

export function getHumanStaffCostMultiplier(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.betterHiringPipeline ?? 0
  return Math.max(0.2, 1 - rank * 0.05)
}

export function getMachineOutputPrestigeMultiplier(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.gridOrchestration ?? 0
  return 1 + rank * 0.05
}

export function getPowerCapacityPrestigeMultiplier(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.gridOrchestration ?? 0
  return 1 + rank * 0.05
}

export function getComplianceFrameworksRelief(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.complianceFrameworks ?? 0
  return rank * 0.05
}

export function getPolicyCapitalMultiplier(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.policyCapital ?? 0
  return 1 + rank * 0.05
}

export function getMarketReputationMultiplier(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.marketReputation ?? 0
  return 1 + rank * 0.03
}

export function getDeskEfficiencyMultiplier(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.deskEfficiency ?? 0
  return 1 + rank * 0.04
}

export function getStrategicReservesCooldownMultiplier(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.strategicReserves ?? 0
  return Math.max(0.5, 1 - rank * 0.03)
}

export function canPrestige(state: GameState): boolean {
  return state.prestigeCount < 10 && getReputationGainForNextPrestige(state) > 0 && (state.quantTraderCount > 0 || state.ruleBasedBotCount > 0)
}

export function createPrestigeResetState(state: GameState, plannedPurchases?: Partial<Record<PrestigeUpgradeId, number>>): GameState {
  const gainedReputation = getReputationGainForNextPrestige(state)

  if (gainedReputation <= 0 || state.prestigeCount >= 10) {
    return state
  }

  const nextReputation = state.reputation + gainedReputation
  const seedCapitalBonus = getSeedCapitalBonus(state)

  const nextState: GameState = {
    ...initialState,
    cash: seedCapitalBonus,
    discoveredLobbying: state.discoveredLobbying,
    reputation: nextReputation,
    reputationSpent: state.reputationSpent,
    prestigeCount: Math.min(10, state.prestigeCount + 1),
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
