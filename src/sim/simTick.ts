import { processAutomationCycles } from '../utils/automation'
import { processTimedBoosts } from '../utils/boosts'
import { processComplianceTimer } from '../utils/compliance'
import { getCashPerSecond, getInfluencePerSecond, getManualIncome, getResearchPointsPerSecond } from '../utils/economy'
import type { SimState } from './simState'

export function performManualTrades(state: SimState, tradeCount: number): void {
  for (let index = 0; index < tradeCount; index += 1) {
    const gain = getManualIncome(state.game)
    state.game.cash += gain
    state.game.lifetimeCashEarned += gain
    state.game.lifetimeManualTrades += 1
  }
}

export function tickSimState(state: SimState, deltaSeconds: number): void {
  const complianceResult = processComplianceTimer(state.game, deltaSeconds)
  const reviewTriggered = complianceResult.complianceReviewRemainingSeconds > state.game.complianceReviewRemainingSeconds
  state.game.cash = complianceResult.cash
  state.game.complianceVisible = complianceResult.complianceVisible
  state.game.complianceReviewRemainingSeconds = complianceResult.complianceReviewRemainingSeconds
  state.game.compliancePayments = complianceResult.compliancePayments
  state.game.lastCompliancePayment = complianceResult.lastCompliancePayment

  if (reviewTriggered) {
    state.game.totalComplianceReviewsTriggered += 1
  }

  state.game.timedBoosts = processTimedBoosts(state.game, deltaSeconds)
  const passiveCash = getCashPerSecond(state.game) * deltaSeconds
  const passiveResearch = getResearchPointsPerSecond(state.game) * deltaSeconds
  const passiveInfluence = getInfluencePerSecond(state.game) * deltaSeconds
  const automationResult = processAutomationCycles(state.game, deltaSeconds, state.game.lastSaveTimestamp + deltaSeconds * 1000)
  const automationGain = automationResult.cash - state.game.cash

  state.game.cash += passiveCash + automationGain
  state.game.researchPoints += passiveResearch
  state.game.influence += passiveInfluence
  state.game.lifetimeCashEarned += passiveCash + automationGain
  state.game.lifetimeResearchPointsEarned += passiveResearch
  state.game.automationCycleState = automationResult.automationCycleState
  state.game.lastSaveTimestamp += deltaSeconds * 1000
  state.timeSeconds += deltaSeconds
}
