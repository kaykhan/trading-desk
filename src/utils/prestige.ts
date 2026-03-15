import { GAME_CONSTANTS } from '../data/constants'
import { initialState } from '../data/initialState'
import type { GameState } from '../types/game'

export function getPrestigeGain(lifetimeCashEarned: number): number {
  if (lifetimeCashEarned < GAME_CONSTANTS.prestigeUnlockLifetimeCash) {
    return 0
  }

  return Math.floor(Math.sqrt(lifetimeCashEarned / GAME_CONSTANTS.prestigeUnlockLifetimeCash))
}

export function getLifetimeReputation(state: GameState): number {
  return state.reputation + state.reputationSpent
}

export function getProfitPrestigeMultiplier(state: GameState): number {
  const brandRecognitionRank = state.purchasedPrestigeUpgrades.brandRecognition ?? 0
  const directBonus = 1 + getLifetimeReputation(state) * GAME_CONSTANTS.directReputationBonusPerPoint
  const brandRecognitionBonus = 1 + brandRecognitionRank * GAME_CONSTANTS.brandRecognitionBonusPerRank

  return directBonus * brandRecognitionBonus
}

export function getResearchPrestigeMultiplier(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.institutionalKnowledge ?? 0
  return 1 + rank * GAME_CONSTANTS.institutionalKnowledgeResearchBonusPerRank
}

export function getSeedCapitalBonus(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.seedCapital ?? 0
  return rank * GAME_CONSTANTS.seedCapitalPerRank
}

export function getHumanStaffCostMultiplier(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.betterHiringPipeline ?? 0
  return Math.max(0.2, 1 - rank * GAME_CONSTANTS.betterHiringPipelineDiscountPerRank)
}

export function getMachineOutputPrestigeMultiplier(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.gridOrchestration ?? 0
  return 1 + rank * GAME_CONSTANTS.gridOrchestrationMachineBonusPerRank
}

export function getPowerCapacityPrestigeMultiplier(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.gridOrchestration ?? 0
  return 1 + rank * GAME_CONSTANTS.gridOrchestrationPowerBonusPerRank
}

export function canPrestige(state: GameState): boolean {
  return getPrestigeGain(state.lifetimeCashEarned) > 0 && state.tradingBotCount > 0
}

export function createPrestigeResetState(state: GameState): GameState {
  const gainedReputation = getPrestigeGain(state.lifetimeCashEarned)

  if (gainedReputation <= 0) {
    return state
  }

  const nextReputation = state.reputation + gainedReputation
  const seedCapitalBonus = getSeedCapitalBonus(state)

  return {
    ...initialState,
    cash: seedCapitalBonus,
    reputation: nextReputation,
    reputationSpent: state.reputationSpent,
    prestigeCount: state.prestigeCount + 1,
    purchasedPrestigeUpgrades: { ...state.purchasedPrestigeUpgrades },
    lastSaveTimestamp: Date.now(),
  }
}
