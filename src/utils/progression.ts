import type { GameState } from '../types/game'
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
}

const PHASE_LABELS: Record<ProgressionPhaseId, string> = {
  'solo-trader': 'Solo Trader',
  'junior-desk': 'Junior Desk',
  'firm-growth': 'Firm Growth',
  'bot-era': 'Bot Era',
  'prestige-decision': 'Prestige Decision',
}

export function getProgressionPhase(state: GameState): ProgressionPhaseId {
  if (getPrestigeGain(state.lifetimeCashEarned) > 0 && state.ruleBasedBotCount > 0) {
    return 'prestige-decision'
  }

  if (state.purchasedResearchTech.algorithmicTrading || state.ruleBasedBotCount > 0) {
    return 'bot-era'
  }

  if (state.purchasedUpgrades.seniorRecruitment || state.seniorTraderCount > 0) {
    return 'firm-growth'
  }

  if (state.purchasedUpgrades.juniorHiringProgram || state.internCount > 0 || state.juniorTraderCount > 0) {
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
      objective: 'Manual trades fund the first real unlock. Research Recruiter, then move into Operations through interns.',
      nextTarget: 'Recruiter in Research for $50.',
    }
  }

  if (phaseId === 'junior-desk') {
    if (state.internCount < 5 && !state.purchasedUpgrades.juniorTraderProgram) {
      return {
        phaseId,
        phaseLabel: PHASE_LABELS[phaseId],
        headline: 'Build the intern desk into a real income floor.',
        objective: 'Scale Interns until Junior Trader Program appears. This is the bridge from manual trading to the first real desk tier.',
        nextTarget: `Reach 5 Interns (${state.internCount}/5) to reveal Junior Trader Program.`,
      }
    }

    if (!state.purchasedUpgrades.juniorTraderProgram) {
      return {
        phaseId,
        phaseLabel: PHASE_LABELS[phaseId],
        headline: 'Promote the desk into junior trading.',
        objective: 'The intern lane is established. Research Junior Trader Program to open the next tier in Operations.',
        nextTarget: 'Junior Trader Program in Research for $400.',
      }
    }

    if (state.juniorTraderCount < 5) {
      return {
        phaseId,
        phaseLabel: PHASE_LABELS[phaseId],
        headline: 'Build the junior desk into a real income floor.',
        objective: 'Scale Juniors until Senior Recruitment appears. This is the bridge from the training desk to firm growth.',
        nextTarget: `Reach 5 Junior Traders (${state.juniorTraderCount}/5) to reveal Senior Recruitment.`,
      }
    }

    return {
      phaseId,
      phaseLabel: PHASE_LABELS[phaseId],
      headline: 'Unlock your senior hiring lane.',
      objective: 'The junior desk is established. Research Senior Recruitment to open the next tier in Operations.',
      nextTarget: 'Senior Recruitment in Research for $5,000.',
    }
  }

  if (phaseId === 'firm-growth') {
    if (state.seniorTraderCount < 5 && !state.purchasedResearchTech.algorithmicTrading) {
      return {
        phaseId,
        phaseLabel: PHASE_LABELS[phaseId],
        headline: 'Turn seniors into the core growth engine.',
        objective: 'Seniors accelerate the desk and prepare the automation phase.',
        nextTarget: `Reach 5 Senior Traders (${state.seniorTraderCount}/5) to reveal Algorithmic Trading.`,
      }
    }

    return {
      phaseId,
      phaseLabel: PHASE_LABELS[phaseId],
      headline: 'Open the automation era.',
      objective: 'Your human desk is strong enough. Research Algorithmic Trading with Research Points to unlock Rule-Based Bots.',
      nextTarget: 'Algorithmic Trading in Research for 100 RP.',
    }
  }

  if (phaseId === 'bot-era') {
    const prestigeGain = getPrestigeGain(state.lifetimeCashEarned)

    return {
      phaseId,
      phaseLabel: PHASE_LABELS[phaseId],
      headline: 'Scale automation until reset value appears.',
      objective: 'Automation is online. Build infrastructure support, push into ML and AI bot tiers, and convert machine scale into a worthwhile prestige.',
      nextTarget: prestigeGain > 0 ? `You can already claim ${prestigeGain} Reputation after adding at least one bot.` : 'Keep pushing bot income until Reputation becomes available.',
    }
  }

  return {
    phaseId,
    phaseLabel: PHASE_LABELS[phaseId],
    headline: 'Choose the best moment to reset.',
    objective: 'Prestige is live. Decide whether more machine scaling or an immediate reset gives the better next run.',
    nextTarget: `Reset now for ${getPrestigeGain(state.lifetimeCashEarned)} Reputation.`,
  }
}
