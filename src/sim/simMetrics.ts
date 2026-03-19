import { MILESTONES } from '../data/milestones'
import type { MilestoneId } from '../types/game'
import { applyMilestoneRewards, evaluateMilestones } from '../utils/milestones'
import type { SimMetrics, SimState } from './simState'
import { getMilestoneDefinition } from './simState'

export function applyMilestonesAndRecord(state: SimState, metrics: SimMetrics): MilestoneId[] {
  const evaluation = evaluateMilestones(state.game)

  if (evaluation.newlyUnlockedIds.length <= 0) {
    return []
  }

  state.game.unlockedMilestones = evaluation.unlockedMilestones
  state.game.unlockedMetaMilestones = evaluation.unlockedMetaMilestones
  const baseDeskSlotsBeforeRewards = state.game.baseDeskSlots
  const rewards = applyMilestoneRewards(state.game, evaluation.rewards)
  state.game.cash = rewards.cash
  state.game.researchPoints = rewards.researchPoints
  state.game.influence = rewards.influence
  state.game.reputation = rewards.reputation
  if (state.game.baseDeskSlots !== baseDeskSlotsBeforeRewards) {
    state.lastMeaningfulProgressTimeSeconds = state.timeSeconds
  }

  for (const milestoneId of evaluation.newlyUnlockedIds) {
    if (metrics.seenMilestoneIds.has(milestoneId)) {
      continue
    }

    metrics.seenMilestoneIds.add(milestoneId)
    const milestone = getMilestoneDefinition(milestoneId)
    metrics.unlockRecords.push({
      milestoneId,
      name: milestone?.name ?? milestoneId,
      scope: milestone?.scope ?? 'run',
      elapsedSeconds: state.timeSeconds,
      run: state.runIndex,
      cash: state.game.cash,
      researchPoints: state.game.researchPoints,
      influence: state.game.influence,
      lifetimeCash: state.game.lifetimeCashEarned,
      internCount: state.game.internCount,
      juniorTraderCount: state.game.juniorTraderCount,
      seniorTraderCount: state.game.seniorTraderCount,
      internResearchScientistCount: state.game.internResearchScientistCount,
      juniorResearchScientistCount: state.game.juniorResearchScientistCount,
      seniorResearchScientistCount: state.game.seniorResearchScientistCount,
      propDeskCount: state.game.propDeskCount,
      quantTraderCount: state.game.quantTraderCount,
    })
    state.lastMeaningfulProgressTimeSeconds = state.timeSeconds
  }

  return evaluation.newlyUnlockedIds
}

export function getRemainingMilestones(metrics: SimMetrics): MilestoneId[] {
  return MILESTONES
    .filter((milestone) => milestone.scope === 'run' && !metrics.seenMilestoneIds.has(milestone.id))
    .map((milestone) => milestone.id)
}

export function getFinalUnlockedCount(state: SimState): number {
  return MILESTONES.filter((milestone) => state.game.unlockedMilestones[milestone.id] === true).length
}

export function hasCompletedAllMilestones(metrics: SimMetrics): boolean {
  return MILESTONES.filter((milestone) => milestone.scope === 'run').every((milestone) => metrics.seenMilestoneIds.has(milestone.id))
}
