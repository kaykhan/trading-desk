import type { GameState, GameTabId } from '../types/game'
import { getPrestigeGain } from './prestige'

export type ProgressionPhaseId =
  | 'solo-trader'
  | 'junior-desk'
  | 'firm-growth'
  | 'bot-era'
  | 'prestige-decision'

export type ProgressionSummary = {
  phaseId: ProgressionPhaseId
  phaseLabel: string
  headline: string
  objective: string
  nextTarget: string
  focusArea: GameTabId
}

const PHASE_LABELS: Record<ProgressionPhaseId, string> = {
  'solo-trader': 'Solo Trader',
  'junior-desk': 'Junior Desk',
  'firm-growth': 'Firm Growth',
  'bot-era': 'Bot Era',
  'prestige-decision': 'Prestige Decision',
}

export function getProgressionPhase(state: GameState): ProgressionPhaseId {
  if (getPrestigeGain(state.lifetimeCashEarned) > 0 && state.tradingBotCount > 0) {
    return 'prestige-decision'
  }

  if (state.purchasedUpgrades.algorithmicTrading || state.tradingBotCount > 0) {
    return 'bot-era'
  }

  if (state.purchasedUpgrades.seniorRecruitment || state.seniorTraderCount > 0) {
    return 'firm-growth'
  }

  if (state.purchasedUpgrades.juniorHiringProgram || state.juniorTraderCount > 0) {
    return 'junior-desk'
  }

  return 'solo-trader'
}

export function getProgressionSummary(state: GameState): ProgressionSummary {
  const phaseId = getProgressionPhase(state)

  if (phaseId === 'solo-trader') {
    return {
      phaseId,
      phaseLabel: PHASE_LABELS[phaseId],
      headline: 'Open your first staffed desk.',
      objective: 'Manual trades fund the first real unlock. Research Junior Hiring Program, then move into Operations.',
      nextTarget: 'Junior Hiring Program in Research for $50.',
      focusArea: 'research',
    }
  }

  if (phaseId === 'junior-desk') {
    if (state.juniorTraderCount < 5) {
      return {
        phaseId,
        phaseLabel: PHASE_LABELS[phaseId],
        headline: 'Build the junior desk into a real income floor.',
        objective: 'Scale Juniors until Senior Recruitment appears. This is the bridge from manual trading to firm growth.',
        nextTarget: `Reach 5 Junior Traders (${state.juniorTraderCount}/5) to reveal Senior Recruitment.`,
        focusArea: 'desk',
      }
    }

    return {
      phaseId,
      phaseLabel: PHASE_LABELS[phaseId],
      headline: 'Unlock your senior hiring lane.',
      objective: 'The junior desk is established. Research Senior Recruitment to open the next tier in Operations.',
      nextTarget: 'Senior Recruitment in Research for $10,000.',
      focusArea: 'research',
    }
  }

  if (phaseId === 'firm-growth') {
    if (state.seniorTraderCount < 5 && !state.purchasedUpgrades.algorithmicTrading) {
      return {
        phaseId,
        phaseLabel: PHASE_LABELS[phaseId],
        headline: 'Turn seniors into the core growth engine.',
        objective: 'Seniors accelerate the desk and prepare the automation phase.',
        nextTarget: `Reach 5 Senior Traders (${state.seniorTraderCount}/5) to reveal Algorithmic Trading.`,
        focusArea: 'desk',
      }
    }

    return {
      phaseId,
      phaseLabel: PHASE_LABELS[phaseId],
      headline: 'Open the automation era.',
      objective: 'Your human desk is strong enough. Research Algorithmic Trading to unlock Trading Bots.',
      nextTarget: 'Algorithmic Trading in Research for $100,000.',
      focusArea: 'research',
    }
  }

  if (phaseId === 'bot-era') {
    const prestigeGain = getPrestigeGain(state.lifetimeCashEarned)

    return {
      phaseId,
      phaseLabel: PHASE_LABELS[phaseId],
      headline: 'Scale automation until reset value appears.',
      objective: 'Bots are online. Use upgrades and bulk buying to push lifetime cash into a worthwhile prestige.',
      nextTarget: prestigeGain > 0 ? `You can already claim ${prestigeGain} Reputation after adding at least one bot.` : 'Keep pushing bot income until Reputation becomes available.',
      focusArea: prestigeGain > 0 ? 'prestige' : 'desk',
    }
  }

  return {
    phaseId,
    phaseLabel: PHASE_LABELS[phaseId],
    headline: 'Choose the best moment to reset.',
    objective: 'Prestige is live. Decide whether more bot scaling or an immediate reset gives the better next run.',
    nextTarget: `Reset now for ${getPrestigeGain(state.lifetimeCashEarned)} Reputation.`,
    focusArea: 'prestige',
  }
}
