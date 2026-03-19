import { MILESTONES } from '../data/milestones'
import { createPrestigeResetState, getReputationGainForNextPrestige } from '../utils/prestige'
import { getPolicyBottleneckSummary } from './simActions'
import { applyMilestonesAndRecord, getRemainingMilestones, hasCompletedAllMilestones } from './simMetrics'
import { runPolicyStep } from './simPolicies'
import type { SimCheckpointResult, SimCheckpointSnapshot, SimConfig, SimMetrics, SimResult, SimState } from './simState'
import { cloneGameState, createInitialSimMetrics, createInitialSimState } from './simState'
import { performManualTrades, tickSimState } from './simTick'

function recordMeaningfulProgress(state: SimState): boolean {
  let progressed = false

  if (state.game.cash > state.bestObservedCash) {
    state.bestObservedCash = state.game.cash
    progressed = true
  }

  if (state.game.researchPoints > state.bestObservedResearchPoints) {
    state.bestObservedResearchPoints = state.game.researchPoints
    progressed = true
  }

  if (state.game.influence > state.bestObservedInfluence) {
    state.bestObservedInfluence = state.game.influence
    progressed = true
  }

  if (state.game.lifetimeCashEarned > state.bestObservedLifetimeCashEarned) {
    state.bestObservedLifetimeCashEarned = state.game.lifetimeCashEarned
    progressed = true
  }

  if (state.game.lifetimeResearchPointsEarned > state.bestObservedLifetimeResearchPointsEarned) {
    state.bestObservedLifetimeResearchPointsEarned = state.game.lifetimeResearchPointsEarned
    progressed = true
  }

  if (progressed) {
    state.lastMeaningfulProgressTimeSeconds = state.timeSeconds
  }

  return progressed
}

function shouldPrestige(state: SimState): boolean {
  return getReputationGainForNextPrestige(state.game) > 0 && (state.game.quantTraderCount > 0 || state.game.ruleBasedBotCount > 0)
}

function tryPrestige(state: SimState, config: SimConfig, metrics: SimMetrics): boolean {
  const reputationGain = getReputationGainForNextPrestige(state.game)
  const hasMachineGate = config.prestigeRequiresRuleBot ? state.game.ruleBasedBotCount > 0 : (state.game.quantTraderCount > 0 || state.game.ruleBasedBotCount > 0)

  if (!shouldPrestige(state) || state.runIndex >= config.maxRuns || reputationGain < config.prestigeMinReputationGain || !hasMachineGate) {
    return false
  }

  state.game = createPrestigeResetState(state.game)
  state.runIndex += 1
  state.lastMeaningfulProgressTimeSeconds = state.timeSeconds
  state.bestObservedCash = Math.max(state.bestObservedCash, state.game.cash)
  state.bestObservedResearchPoints = Math.max(state.bestObservedResearchPoints, state.game.researchPoints)
  state.bestObservedInfluence = Math.max(state.bestObservedInfluence, state.game.influence)
  state.bestObservedLifetimeCashEarned = Math.max(state.bestObservedLifetimeCashEarned, state.game.lifetimeCashEarned)
  state.bestObservedLifetimeResearchPointsEarned = Math.max(state.bestObservedLifetimeResearchPointsEarned, state.game.lifetimeResearchPointsEarned)
  runPolicyStep(state, config)
  applyMilestonesAndRecord(state, metrics)
  return true
}

function getMilestoneGuidedManualTradesPerTick(state: SimState, config: SimConfig): number {
  if (state.policyId !== 'milestoneGuided' || state.game.seniorTraderCount >= 3) {
    return config.manualTradesPerTick
  }

  const activeClicksPerSecond = 3
  return Math.max(config.manualTradesPerTick, Math.ceil(activeClicksPerSecond * config.tickSeconds))
}

export function runSimulation(config: SimConfig): SimResult {
  const state = createInitialSimState(config.policyId)
  const metrics = createInitialSimMetrics()

  applyMilestonesAndRecord(state, metrics)

  while (state.timeSeconds < config.maxSeconds && state.runIndex <= config.maxRuns) {
    const manualTrades = getMilestoneGuidedManualTradesPerTick(state, config)
    performManualTrades(state, manualTrades)
    tickSimState(state, config.tickSeconds)
    const acted = runPolicyStep(state, config)
    const newlyUnlocked = applyMilestonesAndRecord(state, metrics)
    const gainedEconomyGround = recordMeaningfulProgress(state)

    if (acted || newlyUnlocked.length > 0 || gainedEconomyGround) {
      state.lastMeaningfulProgressTimeSeconds = state.timeSeconds
    }

    if (hasCompletedAllMilestones(metrics)) {
      break
    }

    tryPrestige(state, config, metrics)

    if (state.timeSeconds - state.lastMeaningfulProgressTimeSeconds >= config.stallWindowSeconds) {
      metrics.stallReason = getPolicyBottleneckSummary(state).join('; ') || 'no meaningful progress within stall window'
      return {
        state,
        metrics,
        remainingMilestones: getRemainingMilestones(metrics),
        completedAllMilestones: false,
        stalled: true,
      }
    }
  }

  return {
    state,
    metrics,
    remainingMilestones: getRemainingMilestones(metrics),
    completedAllMilestones: metrics.seenMilestoneIds.size >= MILESTONES.length,
    stalled: false,
  }
}

export function runSimulationWithCheckpoints(config: SimConfig, checkpointSeconds: number[]): SimCheckpointResult {
  const state = createInitialSimState(config.policyId)
  const metrics = createInitialSimMetrics()
  const checkpoints = [...checkpointSeconds].sort((left, right) => left - right)
  const snapshots: SimCheckpointSnapshot[] = []
  let checkpointIndex = 0

  const captureCheckpoint = (requestedSeconds: number, stalled: boolean): void => {
    snapshots.push({
      requestedSeconds,
      capturedAtSeconds: state.timeSeconds,
      run: state.runIndex,
      game: cloneGameState(state.game),
      seenMilestoneIds: [...metrics.seenMilestoneIds],
      stalled,
      stallReason: metrics.stallReason,
    })
  }

  applyMilestonesAndRecord(state, metrics)

  while (state.timeSeconds < config.maxSeconds && state.runIndex <= config.maxRuns) {
    const manualTrades = getMilestoneGuidedManualTradesPerTick(state, config)
    performManualTrades(state, manualTrades)
    tickSimState(state, config.tickSeconds)
    const acted = runPolicyStep(state, config)
    const newlyUnlocked = applyMilestonesAndRecord(state, metrics)
    const gainedEconomyGround = recordMeaningfulProgress(state)

    if (acted || newlyUnlocked.length > 0 || gainedEconomyGround) {
      state.lastMeaningfulProgressTimeSeconds = state.timeSeconds
    }

    while (checkpointIndex < checkpoints.length && state.timeSeconds >= checkpoints[checkpointIndex]) {
      captureCheckpoint(checkpoints[checkpointIndex], false)
      checkpointIndex += 1
    }

    if (hasCompletedAllMilestones(metrics)) {
      break
    }

    tryPrestige(state, config, metrics)

    if (state.timeSeconds - state.lastMeaningfulProgressTimeSeconds >= config.stallWindowSeconds) {
      metrics.stallReason = getPolicyBottleneckSummary(state).join('; ') || 'no meaningful progress within stall window'
      while (checkpointIndex < checkpoints.length) {
        captureCheckpoint(checkpoints[checkpointIndex], true)
        checkpointIndex += 1
      }

      const result: SimResult = {
        state,
        metrics,
        remainingMilestones: getRemainingMilestones(metrics),
        completedAllMilestones: false,
        stalled: true,
      }

      return {
        checkpoints: snapshots,
        result,
      }
    }
  }

  while (checkpointIndex < checkpoints.length) {
    captureCheckpoint(checkpoints[checkpointIndex], false)
    checkpointIndex += 1
  }

  const result: SimResult = {
    state,
    metrics,
    remainingMilestones: getRemainingMilestones(metrics),
    completedAllMilestones: metrics.seenMilestoneIds.size >= MILESTONES.length,
    stalled: false,
  }

  return {
    checkpoints: snapshots,
    result,
  }
}
