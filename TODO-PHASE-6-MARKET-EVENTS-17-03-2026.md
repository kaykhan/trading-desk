# TODO — Phase 6 Market Events and Event UI — 17-03-2026

This TODO adapts `stock_incremental_phase_6_market_events_design_and_implementation.md` to the current `Trading Desk` codebase.

Status legend:

- [ ] not started
- [~] partial / needs follow-up
- [x] done

## Phase Goal

Deliver a readable market-event system where:

- one temporary market event is active at a time
- sector and systemic conditions make the economy feel dynamic rather than permanently solved
- human desks, specialists, mandates, automation, and power all react to the current event
- the current event is obvious from a top-level news notification/banner
- a dedicated `Events` tab shows the active event, remaining time, effects, and a log of past events

## Current Repo Reality

- [x] sectors, specialization, mandates, automation, and power already exist as separate but connected systems
- [x] automation already has market targeting and cycle-based payouts from Phase 5
- [x] the main tick loop in `src/store/gameStore.ts` already processes time-based systems every tick
- [x] there is currently no event system in state, selectors, or helpers
- [x] there is currently no event banner / news strip in the dashboard UI
- [x] there is currently no `Events` desk tab in `DeskTab`
- [x] there is currently no event history / event log surface anywhere in the repo

## Recommended Design Lock For This Repo

- [ ] Keep Phase 6 first pass to one active market event at a time
- [ ] Preserve the design split between `sector` and `systemic` events
- [ ] Keep first-pass event effects simple and readable:
  - sector output multiplier
  - automation output multiplier
  - global output multiplier
  - machine-efficiency multiplier
- [ ] Apply event modifiers through centralized helper functions/selectors, not scattered per formula
- [ ] Add a top-of-screen news/status notification whenever an event is active
- [ ] Add a dedicated `Events` tab to the desk view instead of hiding event details inside Stats only
- [ ] Keep a rolling event log in the `Events` tab even though the Phase 6 source doc marked it as optional
- [ ] Make the event UI read like live market news, not a generic debug/status panel

## Open Architecture Decisions To Lock Early

- [ ] Decide whether event history should store only ids or richer snapshots:
  - `id`
  - start timestamp
  - end timestamp
  - duration
  - summary/effect text snapshot
- [ ] Decide whether events chain immediately or whether a short no-event downtime exists between events
- [ ] Decide whether event selection should only avoid immediate repeats or also weight variety across recent history
- [ ] Decide where the news-notification/banner component should live so it is visible across desk views without cluttering tabs
- [ ] Decide whether the `Events` tab belongs in `DeskTab` navigation or broader dashboard navigation if Phase 7+ adds more live systems

## 1. Types and State

- [x] Add event-specific types in `src/types/game.ts` or a new events type module:
  - `MarketEventId`
  - `MarketEventCategory`
  - `MarketEventDefinition`
  - `MarketEventHistoryEntry`
- [x] Extend `DeskViewId` with `events`
- [x] Add state fields to `GameState`:
  - `activeMarketEvent`
  - `activeMarketEventRemainingSeconds`
  - `marketEventHistory`
- [ ] Decide and enforce a bounded history length so the log does not grow forever in saves
- [ ] Keep the final state straightforward to serialize and migrate

## 2. Event Definition Data

- [x] Add event definition data, likely `src/data/marketEvents.ts`
- [x] Implement the initial event set from the Phase 6 spec:
  - `techRally`
  - `energyBoom`
  - `financialTightening`
  - `volatilitySpike`
  - `liquidityCrunch`
  - `gridStressWarning`
- [ ] Ensure every event definition includes:
  - id
  - name
  - category
  - description
  - duration seconds
  - effect metadata
- [x] Add concise UI summary text for banner and event-log rendering
- [ ] Add display metadata if needed for category styling, accent color, or iconography

## 3. Persistence and Migration

- [x] Add Phase 6 defaults to `src/data/initialState.ts`
- [x] Update `src/utils/persistence.ts` to normalize:
  - `activeMarketEvent`
  - `activeMarketEventRemainingSeconds`
  - `marketEventHistory`
- [x] Default old saves to:
  - `activeMarketEvent = null`
  - `activeMarketEventRemainingSeconds = 0`
  - `marketEventHistory = []`
- [x] Clamp or sanitize malformed event ids and invalid timer values during load
- [x] Clamp history length during migration/load if a cap is used

## 4. Helper Layer and Selectors

- [x] Add an event helper module, likely `src/utils/marketEvents.ts`
- [x] Add helpers such as:
  - `getActiveMarketEvent(state)`
  - `isMarketEventActive(state)`
  - `getMarketEventRemainingSeconds(state)`
  - `getSectorEventMultiplier(state, sectorId)`
  - `getGlobalEventMultiplier(state)`
  - `getAutomationEventMultiplier(state)`
  - `getMachineEfficiencyEventModifier(state)`
  - `getMarketEventHeadline(state)`
  - `getMarketEventEffectSummary(state)`
- [x] Add selectors for current event, timer, category, summary text, and event history entries in `src/store/selectors.ts`
- [ ] Keep selectors usable by both gameplay formulas and UI surfaces

## 5. Event Scheduling and Tick Processing

- [x] Add event scheduling/timer helpers such as:
  - `startRandomMarketEvent(state)`
  - `clearMarketEvent(state)`
  - `processMarketEventTimer(state, deltaSeconds)`
- [x] Implement one-active-event scheduling in the main tick flow in `src/store/gameStore.ts`
- [x] If no event is active, start one
- [x] Reduce remaining seconds each tick
- [x] When an event expires:
  - archive it into history
  - clear active state
  - start the next event according to the chosen scheduling rule
- [x] Avoid immediate repeats in first-pass event selection
- [x] Ensure large tick intervals / offline progress handle expiry and rollover cleanly

## 6. Sector Integration

- [x] Patch sector output helpers so sector production includes event multipliers
- [x] Ensure sector events affect the intended sector only
- [x] Ensure specialist and mandate value shifts happen automatically through existing sector-output math
- [ ] Keep the integration centralized so future sector events are easy to add

## 7. Automation and Power Integration

- [x] Patch automation payout helpers so machine-side output includes event modifiers
- [x] Ensure sector-targeted automation benefits from matching sector events
- [x] Ensure `volatilitySpike` and similar systemic events can influence automation output cleanly
- [x] Ensure `gridStressWarning` applies through machine-efficiency-style modifiers rather than ad hoc power hacks
- [ ] Confirm Phase 5 cycle-based automation UI still reports sensible payout estimates during events

## 8. UI — Top News Notification

- [x] Add a top-level event/news notification component that appears whenever an event is active
- [x] Place it high enough in the dashboard that the player cannot miss the current event state
- [x] The banner/notification should show:
  - event name
  - short descriptive phrase
  - effect summary
  - remaining time
- [x] Make the notification feel like live market news rather than a generic warning strip
- [ ] Add distinct visual treatment for `sector` vs `systemic` events if useful
- [ ] Ensure the banner works across desktop and mobile widths

## 9. UI — New Events Tab

- [x] Add a new `Events` tab to desk navigation in `src/components/dashboard/DeskTab.tsx`
- [x] Create a dedicated `EventsTab` component, likely `src/components/dashboard/EventsTab.tsx`
- [x] The active-event section should show a presentation like:
  - `Tech Rally`
  - `Growth optimism pushes technology names higher.`
  - `Technology sector output +20%`
  - `01:14 remaining`
- [ ] Show category / affected system metadata where useful
- [x] Show a timer that updates cleanly and is easy to scan
- [x] Show the current effect summary in plain language, not only internal multiplier values
- [x] If no event is active, show a calm empty state such as waiting for the next market condition

## 10. UI — Event Log

- [x] Add an event log inside the `Events` tab
- [x] Keep a rolling list of completed/past events
- [x] Each log item should show:
  - event name
  - short description
  - effect summary
  - how long it lasted or when it occurred
- [x] Show newest events first
- [x] Keep the log readable even with repeated events over time
- [x] Decide and implement a maximum stored log length for both UI and save sanity

## 11. Copy and Formatting

- [ ] Add compact event copy for headlines, descriptions, and effect summaries
- [ ] Format timers consistently, ideally `MM:SS remaining`
- [ ] Ensure effect summaries read like player-facing market commentary, for example:
  - `Technology sector output +20%`
  - `Global output -8%`
  - `Machine efficiency -10%`
- [ ] Avoid verbose debug phrasing like raw field names or internal ids in the UI

## 12. Balance Pass

- [ ] Tune event durations in the `60–120s` first-pass target range
- [ ] Tune sector event bonuses/penalties so they matter but do not invalidate whole builds
- [ ] Tune systemic event strength so they feel noticeable without becoming random punishment
- [ ] Check whether event frequency creates enough adaptation pressure without constant churn
- [ ] Check whether immediate chaining vs downtime feels better in play

## 13. Validation

- [ ] Verify events start, tick down, expire, and rotate correctly
- [ ] Verify the scheduler avoids immediate repeats if that rule is chosen
- [ ] Verify old saves load cleanly with null/empty event state
- [ ] Verify sector events affect the intended sector and not the others
- [ ] Verify systemic event modifiers affect automation/global/machine-side systems as intended
- [ ] Verify automation payout estimates and actual payouts remain aligned during events
- [ ] Verify offline progress handles event timers and rollover safely
- [ ] Verify the top news notification is obvious but not intrusive
- [ ] Verify the `Events` tab remains readable on smaller laptop and mobile widths
- [ ] Verify the event log records completed events in the right order and format

## Recommended Implementation Order

- [ ] 1. Add event types, state fields, and save/load defaults
- [ ] 2. Add market event definition data and event helper/selectors
- [ ] 3. Integrate event modifiers into sector, global, automation, and machine-efficiency formulas
- [ ] 4. Implement event scheduling and timer processing in the main tick loop
- [ ] 5. Add the top-level event/news notification banner
- [ ] 6. Add the new `Events` tab and active-event panel
- [ ] 7. Add the rolling event log
- [ ] 8. Run tuning and validation passes
