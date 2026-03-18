# TODO — Phase 5 Automation Strategies and Cycle Execution — 16-03-2026

This TODO adapts `docs/stock_incremental_phase_5_automation_strategies_design_and_implementation.md` to the current `Trading Desk` codebase.

Status legend:

- [ ] not started
- [~] partial / needs follow-up
- [x] done

## Phase Goal

Deliver a machine-side trading layer where:

- automation units feel distinct from human and institutional desks
- automation uses class-level market target and strategy selection instead of Sectors tab row assignment
- automation pays out in visible timed cycles rather than smooth passive cash/sec
- automation unlocks through research and remains tied to power / infrastructure constraints
- the UI shows progress bars, next payout, last payout, and buy controls on dedicated automation cards

## Current Repo Reality

- [x] automation currently consists of `ruleBasedBot`, `mlTradingBot`, and `aiTradingBot`
- [x] all three are stored as plain owned-count fields directly on `GameState`
- [x] automation units currently buy through the shared `buyUnit` flow in `src/store/gameStore.ts`
- [x] automation unit costs come from `UNITS` in `src/data/units.ts`
- [x] automation output is currently continuous passive income through `getIncomeBreakdown()` and `getCashPerSecond()` in `src/utils/economy.ts`
- [x] the main tick loop in `src/store/gameStore.ts` currently just adds passive cash / RP / influence over `deltaSeconds`
- [x] there is no automation runtime state yet for progress, last payout, target, or strategy
- [x] automation currently appears in `src/components/dashboard/DeskTab.tsx` as standard `UnitPanel` cards under `Algorithmic Trading`
- [x] automation currently does not target sectors or markets directly
- [x] automation currently does not use strategy selection
- [x] automation currently does not show progress bars or payout ticks
- [x] automation power pressure already exists through `getMachineEfficiencyMultiplier()` and per-unit power usage
- [x] automation progression is currently split across research and infrastructure:
  - `algorithmicTrading` unlocks Rule-Based Bots
  - `dataCenterSystems` unlocks ML Trading Bots
  - `aiTradingSystems` unlocks AI Trading Bots
  - power infrastructure lives in the Infrastructure lane

## Recommended Design Lock For This Repo

- [ ] Treat Phase 5 as a refactor of the existing algorithmic section, not a bolt-on beside it
- [ ] Add `Quant Trader` as the first automation/systematic bridge unit
- [ ] Keep one automation configuration per unit class, not per owned machine
- [ ] Keep one cycle progress bar per unit class, not per owned machine
- [ ] Move automation decision-making out of the Sectors tab entirely
- [ ] Build automation cards as a dedicated machine-side panel in `DeskTab` rather than reusing plain `UnitPanel` forever
- [ ] Keep Power / infrastructure as a parallel requirement and payout modifier, even if unit unlock research moves into the Automation branch
- [ ] Replace continuous bot cash/sec with cycle-based payouts for automation units
- [ ] Keep humans and institutions on continuous production
- [ ] First pass strategy logic should stay simple and visible; avoid hidden complexity

## Open Architecture Decisions To Lock Early

- [ ] Decide whether to fully replace `ruleBasedBotCount` / `mlTradingBotCount` / `aiTradingBotCount` with a new `automationUnits` record, or keep legacy count fields and add a compatibility layer
- [ ] Decide whether to rename current ids to Phase 5 ids:
  - `mlTradingBot` -> `mlBot`
  - `aiTradingBot` -> `aiBot`
  or preserve current repo naming for migration simplicity
- [ ] Decide whether `algorithmicTrading` is migrated into `quantTradingSystems`, or retained as an umbrella prerequisite before the new unit unlock chain
- [ ] Decide whether `dataCenterSystems` and `aiTradingSystems` remain in `infrastructure` or move to `automation` while infrastructure stays as a purchase/capacity gate
- [ ] Decide where payout-tick feedback lives in store state so the UI can animate without becoming brittle

## 1. Types and State

- [ ] Add automation-specific types, likely in `src/types/game.ts` or a new `src/types/automation.ts`:
  - `AutomationUnitType`
  - `AutomationStrategyId`
  - `AutomationConfig`
  - `AutomationCycleRuntime`
- [ ] Add `quantTrader` to the automation ladder
- [ ] Add shared strategy ids:
  - `meanReversion`
  - `momentum`
  - `arbitrage`
  - `marketMaking`
  - `scalping`
- [ ] Add state for owned automation units
- [ ] Add state for per-class automation config:
  - selected market target
  - selected strategy
- [ ] Add runtime cycle state per class:
  - progress seconds
  - last payout
  - optionally last completion timestamp or flash state anchor for UI feedback
- [ ] Ensure the final shape remains straightforward to serialize and migrate

## 2. Automation Data Definitions

- [ ] Create dedicated automation definition data, likely `src/data/automationUnits.ts`
- [ ] Move automation tuning data out of generic `UNITS` if needed:
  - base cost
  - cost scaling
  - cycle duration
  - base payout
  - power use
- [ ] Create strategy definition data, likely `src/data/automationStrategies.ts`
- [ ] Add first-pass market/strategy multiplier metadata in a readable place rather than scattering constants in gameplay logic
- [ ] Decide whether legacy bot entries stay in `src/data/units.ts` during migration or get retired after Phase 5 lands

## 3. Research Tree Integration

- [ ] Extend `ResearchTechId` with Phase 5 automation unlocks:
  - `quantTradingSystems`
  - `ruleBasedAutomation`
  - `machineLearningTrading`
  - `meanReversionModels`
  - `momentumModels`
  - `arbitrageEngine`
  - `marketMakingEngine`
  - `scalpingFramework`
- [ ] Decide final handling of existing nodes:
  - `algorithmicTrading`
  - `dataCenterSystems`
  - `aiTradingSystems`
- [ ] Add or migrate automation unit unlock nodes under the `automation` branch
- [ ] Add shared strategy unlock nodes under the `automation` branch
- [ ] Keep the branch graph readable with subgrouping if unit unlocks and strategy unlocks form separate lanes
- [ ] Update locked reasons and reveal rules so the new lane gives explicit progression guidance
- [ ] Ensure Research confirmation UI explains which unit or strategy each automation tech unlocks

## 4. Persistence and Migration

- [ ] Add Phase 5 defaults to `src/data/initialState.ts`
- [ ] Update `src/utils/persistence.ts` to normalize:
  - automation owned state
  - automation config
  - automation runtime cycle state
- [ ] Migrate old saves with existing `ruleBasedBotCount` / `mlTradingBotCount` / `aiTradingBotCount`
- [ ] Preserve current player progress when migrating from passive bots to cycle-based automation
- [ ] Default all missing strategies and targets to `null`
- [ ] Default all missing progress and last payout values to `0`

## 5. Helper Layer

- [x] Add a new automation helper module, likely `src/utils/automation.ts`
- [x] Add helpers such as:
  - `isAutomationUnitUnlocked(state, unitType)`
  - `isAutomationStrategyUnlocked(state, strategyId)`
  - `getAutomationOwnedCount(state, unitType)`
  - `getAutomationUnitCost(state, unitType)`
  - `getAutomationCycleDuration(state, unitType)`
  - `getAutomationBasePayout(state, unitType)`
  - `getAutomationAdjustedPayout(state, unitType)`
  - `getAutomationAverageIncomePerSecond(state, unitType)`
  - `getAutomationProgressPercent(state, unitType)`
- [x] Add helper(s) for simple market target and strategy multipliers
- [x] Reuse existing machine efficiency / power helpers rather than duplicating them

## 6. Store Actions and Purchase Flow

- [x] Add automation purchase action(s), either by extending `buyUnit` safely or introducing `buyAutomationUnit(unitType, quantity)`
- [x] Add config actions:
  - `setAutomationMarketTarget(unitType, sectorId | null)`
  - `setAutomationStrategy(unitType, strategyId | null)`
- [x] Validate that target and strategy selection respects unlock state
- [x] Ensure buy modes remain available for automation cards (`x1 / x5 / x10 / Max`)
- [~] Decide whether automation should keep using generic `ui.unitBuyModes` or get dedicated automation buy mode state

## 7. Tick Loop and Cycle Processing

- [x] Refactor the main tick path in `src/store/gameStore.ts` so automation is processed separately from human passive income
- [x] Add cycle processing logic that:
  - advances progress by `deltaSeconds`
  - loops when progress crosses cycle duration
  - pays lump sums on completion
  - updates `lastPayout`
- [x] Support multiple completed cycles in one large tick or offline catch-up interval
- [x] Ensure automation payout adds to both `cash` and `lifetimeCashEarned`
- [x] Keep RP and influence flows unchanged
- [x] Decide whether offline progress should simulate automation cycles exactly or approximate them in batches

## 8. Economy Integration

- [x] Remove automation units from continuous passive cash generation in `getIncomeBreakdown()` / `getCashPerSecond()` once cycle processing is active
- [x] Keep human and institutional income continuous
- [x] Ensure automation payout formula includes:
  - owned count
  - base payout
  - market target multiplier
  - strategy multiplier
  - machine efficiency multiplier
  - automation upgrade multipliers
  - global / prestige multipliers if those should still apply to automation income
- [x] Audit existing repeatable upgrades and permanent upgrades that currently reference `ruleBasedBot`, `mlTradingBot`, and `aiTradingBot`
- [x] Rewire current automation upgrade effects so they still influence Phase 5 payouts meaningfully
- [x] Confirm power shortages reduce automation payout appropriately

## 9. UI and UX

- [x] Replace the current plain `Algorithmic Trading` unit-panel list in `src/components/dashboard/DeskTab.tsx` with dedicated automation cards
- [x] Each automation card should show:
  - unit name
  - owned count
  - target selector
  - strategy selector
  - cycle progress bar
  - time remaining or cycle duration
  - next payout estimate
  - last payout
  - estimated average income/sec
  - power use
  - buy controls
- [x] Make progress bars and payout ticks visually distinct from human desk UI
- [x] Add clear locked states for both unit unlocks and strategy unlocks
- [x] Keep the Sectors tab free of automation assignment controls
- [x] Keep copy concise and use hover/info affordances instead of large explainer blocks
- [~] Ensure the layout still works well on smaller laptop and mobile widths

## 10. Selectors, Stats, and Surface Cleanup

- [x] Add selectors for automation unlocks, config, progress, last payout, and estimated average output
- [x] Update `src/components/dashboard/StatsTab.tsx` to reflect the new automation ladder, including `Quant Trader`
- [x] Update header / summary rates so they do not mislead players once automation becomes burst-based instead of purely passive
- [x] Decide whether summary surfaces should show average automation rate, recent payout, or both
- [x] Update any remaining references that still describe bots as plain passive income units

## 11. Progression and Copy Updates

- [x] Update `src/utils/progression.ts` so the bot era description reflects strategy selection and cycle execution
- [x] Update unit descriptions, research descriptions, and any onboarding text for the new machine-side identity
- [x] Ensure the player is explicitly taught that:
  - humans use continuous production
  - automation uses cycle bursts
  - sectors are for human/institution deployment
  - automation targets markets through dropdowns on its own cards

## 12. Balance Pass

- [ ] Tune first-pass research costs for new unit unlock and strategy unlock nodes
- [ ] Tune first-pass automation purchase costs and scaling
- [ ] Tune first-pass cycle durations so higher tiers feel heavier, not merely better versions of the same timing
- [ ] Tune first-pass base payouts so automation is satisfying without trivializing human and institutional play
- [ ] Check whether `Quant Trader` enters early enough to feel like a bridge and not a redundant extra tier
- [ ] Check whether strategy unlock timing encourages experimentation instead of one static setup forever

## 13. Validation

- [~] Verify old saves migrate cleanly into the Phase 5 automation state
- [x] Verify automation units unlock correctly through research
- [x] Verify strategy unlocks correctly through research
- [~] Verify target and strategy selectors persist through save/load
- [x] Verify progress bars fill, reset, and wrap correctly
- [~] Verify payout ticks fire on every completed cycle and stay legible in the UI
- [x] Verify machine efficiency penalties reduce payout correctly under power shortages
- [x] Verify automation no longer double-counts as passive income once cycle payouts are enabled
- [x] Verify large tick intervals and offline progress handle multiple completed cycles correctly
- [x] Verify the Sectors tab stays cleaner because automation is no longer managed there
- [~] Verify the automation panel remains understandable with all four automation tiers present

## Recommended Implementation Order

- [ ] 1. Lock the naming and migration strategy for automation unit ids and research ids
- [ ] 2. Add automation types, state, defaults, and persistence migration
- [ ] 3. Add automation unit definition data and strategy definition data
- [ ] 4. Add Phase 5 research nodes and branch layout updates
- [x] 5. Build automation helper utilities and selectors
- [x] 6. Implement automation purchase and config actions
- [x] 7. Implement cycle runtime processing in the main tick loop
- [x] 8. Remove passive bot income and wire automation payout formulas into power and upgrades
- [x] 9. Replace the current Algorithmic Trading UI with dedicated automation cards
- [x] 10. Update stats, progression copy, and summary surfaces
- [ ] 11. Run gameplay validation and tuning passes
