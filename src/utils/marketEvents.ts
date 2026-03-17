import { MARKET_EVENT_COOLDOWN_MAX_SECONDS, MARKET_EVENT_COOLDOWN_MIN_SECONDS, MARKET_EVENTS, MARKET_EVENT_HISTORY_LIMIT, MARKET_EVENT_IDS } from '../data/marketEvents'
import { formatNumber } from './formatting'
import type { GameState, MarketEventDefinition, MarketEventHistoryEntry, MarketEventId, SectorId } from '../types/game'

export function getActiveMarketEvent(state: GameState): MarketEventDefinition | null {
  if (!state.activeMarketEvent) {
    return null
  }

  return MARKET_EVENTS[state.activeMarketEvent] ?? null
}

export function isMarketEventActive(state: GameState): boolean {
  return getActiveMarketEvent(state) !== null && state.activeMarketEventRemainingSeconds > 0
}

export function getMarketEventRemainingSeconds(state: GameState): number {
  return Math.max(0, state.activeMarketEventRemainingSeconds)
}

export function getSectorEventMultiplier(state: GameState, sectorId: SectorId): number {
  const activeEvent = getActiveMarketEvent(state)

  if (!activeEvent || activeEvent.category !== 'sector' || activeEvent.affectedSector !== sectorId) {
    return 1
  }

  return activeEvent.sectorOutputMultiplier ?? 1
}

export function getGlobalEventMultiplier(state: GameState): number {
  return getActiveMarketEvent(state)?.globalOutputMultiplier ?? 1
}

export function getAutomationEventMultiplier(state: GameState): number {
  return getActiveMarketEvent(state)?.automationOutputMultiplier ?? 1
}

export function getMachineEfficiencyEventModifier(state: GameState): number {
  return getActiveMarketEvent(state)?.machineEfficiencyMultiplier ?? 1
}

export function formatMarketEventTimer(seconds: number): string {
  const clamped = Math.max(0, Math.ceil(seconds))
  const minutes = Math.floor(clamped / 60)
  const remainingSeconds = clamped % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export function getMarketEventEffectSummaryFromDefinition(event: MarketEventDefinition): string {
  if (event.category === 'sector' && event.affectedSector && event.sectorOutputMultiplier) {
    const sectorLabel = event.affectedSector === 'technology' ? 'Technology' : event.affectedSector === 'energy' ? 'Energy' : 'Finance'
    const delta = Math.round((event.sectorOutputMultiplier - 1) * 100)
    return `${sectorLabel} sector output ${delta >= 0 ? '+' : ''}${delta}%`
  }

  if (event.globalOutputMultiplier) {
    const delta = Math.round((event.globalOutputMultiplier - 1) * 100)
    return `Global output ${delta >= 0 ? '+' : ''}${delta}%`
  }

  if (event.automationOutputMultiplier) {
    const delta = Math.round((event.automationOutputMultiplier - 1) * 100)
    return `Automation output ${delta >= 0 ? '+' : ''}${delta}%`
  }

  if (event.machineEfficiencyMultiplier) {
    const delta = Math.round((event.machineEfficiencyMultiplier - 1) * 100)
    return `Machine efficiency ${delta >= 0 ? '+' : ''}${delta}%`
  }

  return 'Temporary market conditions are shifting output.'
}

export function getMarketEventEffectSummary(state: GameState): string | null {
  const activeEvent = getActiveMarketEvent(state)
  return activeEvent ? getMarketEventEffectSummaryFromDefinition(activeEvent) : null
}

export function getMarketEventHeadline(state: GameState): string | null {
  const activeEvent = getActiveMarketEvent(state)

  if (!activeEvent) {
    return null
  }

  return `${activeEvent.name} - ${activeEvent.description}`
}

export function getNextMarketEventCooldownSeconds(state: GameState): number {
  return Math.max(0, state.nextMarketEventCooldownSeconds)
}

export function getMarketEventHistoryEntrySummary(entry: MarketEventHistoryEntry): string {
  const definition = MARKET_EVENTS[entry.eventId]

  if (!definition) {
    return 'Unknown market event'
  }

  return `${definition.name} - ${getMarketEventEffectSummaryFromDefinition(definition)} - ${formatNumber(entry.durationSeconds)}s`
}

export function getNextMarketEventId(excludedEventId: MarketEventId | null = null): MarketEventId {
  const eligibleIds = MARKET_EVENT_IDS.filter((eventId) => eventId !== excludedEventId)
  const pool = eligibleIds.length > 0 ? eligibleIds : MARKET_EVENT_IDS
  return pool[Math.floor(Math.random() * pool.length)]
}

export function startRandomMarketEvent(state: GameState, excludedEventId: MarketEventId | null = state.activeMarketEvent): Pick<GameState, 'activeMarketEvent' | 'activeMarketEventRemainingSeconds'> {
  const nextEventId = getNextMarketEventId(excludedEventId)
  const definition = MARKET_EVENTS[nextEventId]

  return {
    activeMarketEvent: nextEventId,
    activeMarketEventRemainingSeconds: definition.durationSeconds,
  }
}

export function rollNextMarketEventCooldownSeconds(): number {
  const range = MARKET_EVENT_COOLDOWN_MAX_SECONDS - MARKET_EVENT_COOLDOWN_MIN_SECONDS
  return MARKET_EVENT_COOLDOWN_MIN_SECONDS + Math.floor(Math.random() * (range + 1))
}

export function clearMarketEvent(): Pick<GameState, 'activeMarketEvent' | 'activeMarketEventRemainingSeconds'> {
  return {
    activeMarketEvent: null,
    activeMarketEventRemainingSeconds: 0,
  }
}

export function appendMarketEventHistory(history: MarketEventHistoryEntry[], entry: MarketEventHistoryEntry): MarketEventHistoryEntry[] {
  return [entry, ...history].slice(0, MARKET_EVENT_HISTORY_LIMIT)
}

export function processMarketEventTimer(state: GameState, deltaSeconds: number, now: number = Date.now()): Pick<GameState, 'activeMarketEvent' | 'activeMarketEventRemainingSeconds' | 'nextMarketEventCooldownSeconds' | 'marketEventHistory'> {
  if (deltaSeconds <= 0) {
    return {
      activeMarketEvent: state.activeMarketEvent,
      activeMarketEventRemainingSeconds: state.activeMarketEventRemainingSeconds,
      nextMarketEventCooldownSeconds: state.nextMarketEventCooldownSeconds,
      marketEventHistory: state.marketEventHistory,
    }
  }

  let activeMarketEvent = state.activeMarketEvent
  let remainingSeconds = state.activeMarketEventRemainingSeconds
  let nextMarketEventCooldownSeconds = state.nextMarketEventCooldownSeconds
  let marketEventHistory = state.marketEventHistory
  let carrySeconds = deltaSeconds

  while (carrySeconds > 0) {
    if (!activeMarketEvent || remainingSeconds <= 0) {
      if (nextMarketEventCooldownSeconds > 0) {
        const elapsed = Math.min(carrySeconds, nextMarketEventCooldownSeconds)
        nextMarketEventCooldownSeconds -= elapsed
        carrySeconds -= elapsed

        if (nextMarketEventCooldownSeconds > 0) {
          break
        }
      }

      const nextEvent = startRandomMarketEvent(state, marketEventHistory[0]?.eventId ?? null)
      activeMarketEvent = nextEvent.activeMarketEvent
      remainingSeconds = nextEvent.activeMarketEventRemainingSeconds
      nextMarketEventCooldownSeconds = 0
    }

    if (!activeMarketEvent) {
      break
    }

    if (carrySeconds < remainingSeconds) {
      remainingSeconds -= carrySeconds
      carrySeconds = 0
      break
    }

    carrySeconds -= remainingSeconds
    const endedEvent = MARKET_EVENTS[activeMarketEvent]

    marketEventHistory = appendMarketEventHistory(marketEventHistory, {
      eventId: activeMarketEvent,
      endedAt: now,
      durationSeconds: endedEvent.durationSeconds,
    })

    activeMarketEvent = null
    remainingSeconds = 0
    nextMarketEventCooldownSeconds = rollNextMarketEventCooldownSeconds()
  }

  return {
    activeMarketEvent,
    activeMarketEventRemainingSeconds: remainingSeconds,
    nextMarketEventCooldownSeconds,
    marketEventHistory,
  }
}
