import type { GameState } from '../types/game'
import { getPrestigeGain } from './prestige'

export type ProgressionPhaseId =
  | 'solo-trader'
  | 'junior-desk'
  | 'firm-growth'
  | 'bot-era'
  | 'prestige-decision'

export function getProgressionPhase(state: GameState): ProgressionPhaseId {
  if (getPrestigeGain(state.lifetimeCashEarned) > 0 && state.tradingBotCount > 0) {
    return 'prestige-decision'
  }

  if (state.purchasedUpgrades.algorithmicTrading || state.tradingBotCount > 0) {
    return 'bot-era'
  }

  if (state.purchasedUpgrades.promotionProgram || state.seniorTraderCount > 0) {
    return 'firm-growth'
  }

  if (state.juniorTraderCount > 0) {
    return 'junior-desk'
  }

  return 'solo-trader'
}
