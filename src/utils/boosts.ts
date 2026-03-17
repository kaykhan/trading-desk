import { DEFAULT_TIMED_BOOSTS, GLOBAL_BOOSTS, TIMED_BOOSTS } from '../data/boosts'
import type { GameState, GlobalBoostId, TimedBoostId, TimedBoostRuntime } from '../types/game'

function getStrategicReservesCooldownMultiplier(state: GameState): number {
  const rank = state.purchasedPrestigeUpgrades.strategicReserves ?? 0
  return Math.max(0.5, 1 - rank * 0.03)
}

function clampTimer(value: number): number {
  return Math.max(0, value)
}

export function formatBoostTimer(seconds: number): string {
  const clamped = Math.max(0, Math.ceil(seconds))
  const minutes = Math.floor(clamped / 60)
  const remainingSeconds = clamped % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export function isTimedBoostActive(state: GameState, boostId: TimedBoostId): boolean {
  return state.timedBoosts[boostId].isActive
}

export function isTimedBoostUnlocked(state: GameState, boostId: TimedBoostId): boolean {
  return state.purchasedResearchTech[TIMED_BOOSTS[boostId].unlockResearchTechId] === true
}

export function canActivateTimedBoost(state: GameState, boostId: TimedBoostId): boolean {
  if (!isTimedBoostUnlocked(state, boostId)) {
    return false
  }

  const runtime = state.timedBoosts[boostId]
  return !runtime.isActive && runtime.remainingCooldownSeconds <= 0
}

export function getTimedBoostCooldownRemaining(state: GameState, boostId: TimedBoostId): number {
  return clampTimer(state.timedBoosts[boostId].remainingCooldownSeconds)
}

export function getTimedBoostDurationRemaining(state: GameState, boostId: TimedBoostId): number {
  return clampTimer(state.timedBoosts[boostId].remainingActiveSeconds)
}

export function isTimedBoostAutoUnlocked(state: GameState): boolean {
  return state.purchasedResearchTech.boostAutomationProtocols === true
}

export function activateTimedBoostRuntime(state: GameState, boostId: TimedBoostId): Record<TimedBoostId, TimedBoostRuntime> {
  if (!canActivateTimedBoost(state, boostId)) {
    return state.timedBoosts
  }

  return {
    ...state.timedBoosts,
    [boostId]: {
      ...state.timedBoosts[boostId],
      isActive: true,
      remainingActiveSeconds: TIMED_BOOSTS[boostId].durationSeconds,
      remainingCooldownSeconds: 0,
    },
  }
}

export function processTimedBoosts(state: GameState, deltaSeconds: number): Record<TimedBoostId, TimedBoostRuntime> {
  if (deltaSeconds <= 0) {
    return state.timedBoosts
  }

  const nextTimedBoosts: Record<TimedBoostId, TimedBoostRuntime> = { ...state.timedBoosts }

  for (const boostId of Object.keys(TIMED_BOOSTS) as TimedBoostId[]) {
    const definition = TIMED_BOOSTS[boostId]
    const runtime = nextTimedBoosts[boostId]

    if (runtime.isActive) {
      const nextActive = runtime.remainingActiveSeconds - deltaSeconds

      if (nextActive > 0) {
        nextTimedBoosts[boostId] = {
          ...runtime,
          remainingActiveSeconds: nextActive,
        }
      } else {
        nextTimedBoosts[boostId] = {
          ...runtime,
          isActive: false,
          remainingActiveSeconds: 0,
          remainingCooldownSeconds: definition.cooldownSeconds * getStrategicReservesCooldownMultiplier(state),
        }
      }

      continue
    }

    const nextCooldown = Math.max(0, runtime.remainingCooldownSeconds - deltaSeconds)
    let nextRuntime: TimedBoostRuntime = {
      ...runtime,
      remainingCooldownSeconds: nextCooldown,
    }

    if (runtime.autoEnabled && isTimedBoostUnlocked(state, boostId) && isTimedBoostAutoUnlocked(state) && nextCooldown <= 0) {
      nextRuntime = {
        ...nextRuntime,
        isActive: true,
        remainingActiveSeconds: definition.durationSeconds,
        remainingCooldownSeconds: 0,
      }
    }

    nextTimedBoosts[boostId] = nextRuntime
  }

  return nextTimedBoosts
}

export function getTimedHumanOutputBoostMultiplier(state: GameState): number {
  return isTimedBoostActive(state, 'aggressiveTradingWindow') ? 1.3 : 1
}

export function getTimedSectorOutputBoostMultiplier(state: GameState): number {
  return isTimedBoostActive(state, 'aggressiveTradingWindow') ? 1.2 : 1
}

export function getTimedProfitBoostMultiplier(state: GameState): number {
  return isTimedBoostActive(state, 'deployReserveCapital') ? 1.25 : 1
}

export function getTimedAutomationBoostMultiplier(state: GameState): number {
  return isTimedBoostActive(state, 'overclockServers') ? 1.3 : 1
}

export function getTimedResearchBoostMultiplier(state: GameState): number {
  return isTimedBoostActive(state, 'researchSprint') ? 1.5 : 1
}

export function getTimedComplianceReliefMultiplier(state: GameState): number {
  return isTimedBoostActive(state, 'complianceFreeze') ? 1.1 : 1
}

export function isGlobalBoostOwned(state: GameState, boostId: GlobalBoostId): boolean {
  return state.globalBoostsOwned[boostId] === true
}

export function getGlobalProfitBoostMultiplier(state: GameState): number {
  return isGlobalBoostOwned(state, 'globalProfitBoost') ? GLOBAL_BOOSTS.globalProfitBoost.multiplier : 1
}

export function getGlobalEnergySupplyBoostMultiplier(state: GameState): number {
  return isGlobalBoostOwned(state, 'globalEnergySupplyBoost') ? GLOBAL_BOOSTS.globalEnergySupplyBoost.multiplier : 1
}

export function getGlobalInfluenceBoostMultiplier(state: GameState): number {
  return isGlobalBoostOwned(state, 'globalInfluenceBoost') ? GLOBAL_BOOSTS.globalInfluenceBoost.multiplier : 1
}

export function getGlobalReputationBoostMultiplier(state: GameState): number {
  return isGlobalBoostOwned(state, 'globalReputationBoost') ? GLOBAL_BOOSTS.globalReputationBoost.multiplier : 1
}

export function getActiveTimedBoostCount(state: GameState): number {
  return (Object.keys(TIMED_BOOSTS) as TimedBoostId[]).filter((boostId) => state.timedBoosts[boostId].isActive).length
}

export function getOwnedGlobalBoostCount(state: GameState): number {
  return (Object.keys(GLOBAL_BOOSTS) as GlobalBoostId[]).filter((boostId) => state.globalBoostsOwned[boostId] === true).length
}

export function getTimedBoostStatusLabel(state: GameState, boostId: TimedBoostId): string {
  if (state.timedBoosts[boostId].isActive) {
    return 'Active'
  }

  if (state.timedBoosts[boostId].remainingCooldownSeconds > 0) {
    return 'Cooling'
  }

  return 'Ready'
}

export function getDefaultTimedBoosts(): Record<TimedBoostId, TimedBoostRuntime> {
  return { ...DEFAULT_TIMED_BOOSTS }
}
