# TODO - Phase 9 Boosts Tab / Temporary Abilities - 17-03-2026

This TODO adapts `docs/stock_incremental_phase_9_boosts_tab_design_and_implementation.md` to the current `Trading Desk` codebase after market events, compliance, and lobbying integration.

Status legend:

- [ ] not started
- [~] partial / needs follow-up
- [x] done

## Phase Goal

Add a dedicated `Boosts` tab that cleanly combines:

- timed activatable boosts with duration and cooldown
- persistent global boosts that are always-on when owned

The tab should feel like a command center for tactical windows and long-term enhancement without confusing those two systems.

## Current Repo Reality

- [x] There is currently no Boosts tab in `src/components/GameShell.tsx`
- [x] Temporary pressure/timing systems already exist via:
  - market events in `src/utils/marketEvents.ts`
  - automation cycles in `src/utils/automation.ts`
  - compliance reviews in `src/utils/compliance.ts`
- [x] Global cross-system multipliers already route through centralized helpers in:
  - `src/utils/economy.ts`
  - `src/utils/automation.ts`
  - `src/utils/prestige.ts`
  - `src/utils/compliance.ts`
- [x] Research tree exists in `src/data/researchTech.ts` and currently has no boost automation node
- [x] The right-side tab strip is already crowded and will need one more slot if Boosts becomes top-level
- [x] Reputation exists as a persistent meta currency, but there is no current reputation-per-second gain system

## Recommended Design Lock For This Repo

- [ ] Add `Boosts` as a new top-level management tab
- [ ] Split the Boosts page into two sections:
  - `Timed Boosts`
  - `Global Boosts`
- [ ] Implement the five suggested timed boosts first:
  - `aggressiveTradingWindow`
  - `deployReserveCapital`
  - `overclockServers`
  - `researchSprint`
  - `complianceFreeze`
- [ ] Implement the four suggested global boosts first:
  - `globalProfitBoost`
  - `globalEnergySupplyBoost`
  - `globalInfluenceBoost`
  - `globalReputationBoost`
- [ ] Keep timed boost duration at `300s`
- [ ] Keep timed boost cooldowns at `1800s` or `3600s` depending on power level
- [ ] Keep global boosts as entitlement-style booleans in state for first pass
- [ ] Add the late-game research hook for auto-activation in this phase, even if it appears far down the tree
- [ ] Do not build boost queues, presets, or external countdown UI in first pass

## Open Architecture Decisions To Lock Early

- [ ] Decide where the new `Boosts` tab sits in the tab order
- [ ] Recommended default: place it between `research` and `compliance`
- [ ] Decide whether global boosts will be manually toggleable once owned or always-on only
- [ ] Recommended default: always-on only when owned
- [ ] Decide how to seed global boost ownership for first pass
- [ ] Recommended default: all false by default, with a simple debug/store action path available for future entitlement wiring

## 1. Types and State

- [ ] Extend `GameTabId` with `boosts`
- [ ] Add new boost types in `src/types/game.ts`:
  - `TimedBoostId`
  - `TimedBoostDefinition`
  - `GlobalBoostId`
  - `GlobalBoostDefinition`
- [ ] Add timed boost runtime state shape:
  - `isActive`
  - `remainingActiveSeconds`
  - `remainingCooldownSeconds`
  - `autoEnabled`
- [ ] Add `timedBoosts` to `GameState`
- [ ] Add `globalBoostsOwned` to `GameState`
- [ ] Add new store actions:
  - `activateTimedBoost(boostId)`
  - `toggleTimedBoostAutoMode(boostId, enabled)`
  - `setGlobalBoostOwned(globalBoostId, owned)`

## 2. Data Definitions

- [ ] Add `src/data/boosts.ts`
- [ ] Define the five timed boosts with names, descriptions, duration, and cooldown
- [ ] Define the four global boosts with names, descriptions, and multipliers
- [ ] Keep descriptions short and mechanically clear

## 3. Defaults, Persistence, and Migration

- [ ] Add default timed boost state in `src/data/initialState.ts`
- [ ] Add default global boost ownership state in `src/data/initialState.ts`
- [ ] Update `src/utils/persistence.ts` to normalize:
  - `timedBoosts`
  - `globalBoostsOwned`
- [ ] Migration defaults:
  - all timed boosts inactive
  - no active duration
  - no cooldown
  - `autoEnabled = false`
  - all global boosts false

## 4. Timed Boost Helper Layer

- [ ] Add a helper module, likely `src/utils/boosts.ts`
- [ ] Implement runtime helpers:
  - `isTimedBoostActive(state, boostId)`
  - `canActivateTimedBoost(state, boostId)`
  - `getTimedBoostCooldownRemaining(state, boostId)`
  - `getTimedBoostDurationRemaining(state, boostId)`
  - `formatBoostTimer(seconds)`
- [ ] Implement effect helpers:
  - `getTimedHumanOutputBoostMultiplier(state)`
  - `getTimedSectorOutputBoostMultiplier(state)`
  - `getTimedProfitBoostMultiplier(state)`
  - `getTimedAutomationBoostMultiplier(state)`
  - `getTimedAutomationCycleSpeedMultiplier(state)` if speed is used
  - `getTimedResearchBoostMultiplier(state)`
  - `getTimedComplianceReliefMultiplier(state)`
- [ ] Implement global helpers:
  - `isGlobalBoostOwned(state, boostId)`
  - `getGlobalProfitBoostMultiplier(state)`
  - `getGlobalEnergySupplyBoostMultiplier(state)`
  - `getGlobalInfluenceBoostMultiplier(state)`
  - `getGlobalReputationBoostMultiplier(state)`

## 5. Timed Boost Runtime Rules

- [ ] Implement activation rules:
  - not active
  - cooldown zero
- [ ] Implement countdown processing:
  - active duration decreases while active
  - cooldown decreases while cooling down
- [ ] Implement expiry behavior:
  - boost deactivates
  - cooldown starts
- [ ] Implement auto-activation rule:
  - only when the future research node is unlocked
  - only when `autoEnabled = true`
  - if cooldown reaches zero, activate automatically

## 6. Tick Loop and Offline Integration

- [ ] Add `processTimedBoosts(deltaSeconds)` logic to `src/store/gameStore.ts`
- [ ] Process boost state during normal tick updates
- [ ] Process boost state during offline progress/load catch-up
- [ ] Ensure active duration and cooldown remain deterministic over long offline windows
- [ ] Keep timed boost processing separate from automation cycle logic for readability

## 7. Formula Integration - Timed Boosts

- [ ] Patch human/sector output formulas in `src/utils/economy.ts` for `Aggressive Trading Window`
- [ ] Patch global profit formulas in `src/utils/economy.ts` for `Deploy Reserve Capital`
- [ ] Patch automation payout and/or cycle speed in `src/utils/automation.ts` for `Overclock Servers`
- [ ] Patch research generation in `src/utils/economy.ts` for `Research Sprint`
- [ ] Patch compliance relief in `src/utils/compliance.ts` for `Compliance Freeze`
- [ ] Ensure timed boosts stack cleanly with:
  - prestige
  - lobbying relief
  - market events
  - specialization/mandate bonuses
  - compliance penalties

## 8. Formula Integration - Global Boosts

- [ ] Apply `globalProfitBoost` in profit/global multiplier flow
- [ ] Apply `globalEnergySupplyBoost` in power capacity flow
- [ ] Apply `globalInfluenceBoost` in influence generation flow
- [ ] Decide where `globalReputationBoost` should hook for first pass
- [ ] Recommended default: apply it to prestige/reputation gain preview and awarded prestige gain, not passive gain since none exists now

## 9. Research Hook

- [ ] Add a late-game research node such as `boostAutomationProtocols` in `src/data/researchTech.ts`
- [ ] Add it to `ResearchTechId` in `src/types/game.ts`
- [ ] Place it in the automation or regulation branch where it fits current graph spacing
- [ ] Use it to unlock timed boost auto-activation toggles

## 10. Selectors

- [ ] Add selectors in `src/store/selectors.ts` for:
  - active timed boost count
  - timed boost state by id
  - timed boost can-activate status
  - timed boost duration label
  - timed boost cooldown label
  - auto-boost automation unlocked
  - owned global boost count
  - timed boost effect summaries
  - global boost ownership summaries

## 11. UI - Game Shell

- [ ] Add `Boosts` tab to `src/components/GameShell.tsx`
- [ ] Adjust the top-level tab grid layout for the extra slot
- [ ] Add `src/components/dashboard/BoostsTab.tsx`

## 12. UI - Boosts Tab Structure

- [ ] Add a top summary row showing:
  - active timed boosts count
  - auto-boost automation unlocked or locked
  - owned global boosts count
- [ ] Add a clear split between:
  - `Timed Boosts`
  - `Global Boosts`
- [ ] Preserve the current terminal/dashboard visual language

## 13. UI - Timed Boost Cards

- [ ] Each timed boost card should show:
  - name
  - short description
  - active/inactive/cooling status
  - remaining active duration
  - remaining cooldown
  - activate button
  - auto-toggle if research unlocked
- [ ] Cards should read cleanly in these states:
  - ready
  - active
  - cooling down
  - auto-enabled

## 14. UI - Global Boost Cards

- [ ] Each global boost card should show:
  - name
  - description
  - owned / not owned
  - always-on status if owned
- [ ] Make these cards visually distinct from timed boosts so cooldown gameplay is never confused with persistent modifiers

## 15. Global Boost Entitlement Handling

- [ ] Add a simple store action for setting global boost ownership
- [ ] Keep UI prepared for external entitlement wiring later
- [ ] For first pass, do not build monetization/paywall plumbing here

## 16. Copy and Clarity

- [ ] Use very clear tactical language for timed boosts
- [ ] Use very clear persistent/global language for global boosts
- [ ] Make cooldown and active duration instantly readable with `MM:SS` labels
- [ ] Avoid vague effect summaries; each boost should clearly state what system it helps

## 17. Balance Pass

- [ ] Tune timed boosts so they feel impactful but not mandatory
- [ ] Check `Overclock Servers` carefully since automation is already timing-heavy
- [ ] Check `Compliance Freeze` carefully so it does not trivialize compliance or lobbying
- [ ] Ensure global boosts feel meaningful but modest at `+5%`

## 18. Validation

- [ ] Verify each timed boost activates only when allowed
- [ ] Verify active duration expires correctly and starts cooldown
- [ ] Verify cooldown reaches zero correctly
- [ ] Verify auto-activation only works once research is unlocked
- [ ] Verify global boosts apply their modifiers correctly
- [ ] Verify the Boosts tab clearly separates timed vs global systems
- [ ] Verify offline progress does not corrupt timed boost state
- [ ] Run final checks:
  - `npm run typecheck`
  - `npm run build`

## Recommended Implementation Order

- [ ] 1. Add types and boost data definitions
- [ ] 2. Add state, defaults, and persistence migration
- [ ] 3. Implement timed boost runtime processing
- [ ] 4. Integrate timed/global multipliers into formulas
- [ ] 5. Add Boosts tab UI and top-level tab entry
- [ ] 6. Add auto-activation research hook
- [ ] 7. Run balancing and validation passes
