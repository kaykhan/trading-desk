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

export function getSeedCapitalBonus(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.seedCapital ?? 0
  return rank * GAME_CONSTANTS.seedCapitalPerRank
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
