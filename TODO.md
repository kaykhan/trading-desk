# Stock Incremental Game TODO

This checklist is derived from `GAME_DESIGN_DOC.md` and reflects the implemented Zustand-based game architecture.

Workflow:
- Complete one top-level todo before moving to the next.
- Mark a todo `[x]` only when its acceptance notes are satisfied.
- Keep later todos blocked until the current one is done.

## Current Order

### 1. Foundation and project structure
- [x] Replace the starter app with the stock incremental game shell.
- [x] Add the core type model for game state, units, upgrades, prestige upgrades, and UI tabs.
- [x] Add structured data files for units, upgrades, prestige upgrades, and milestone text.
- [x] Create the centralized Zustand game store scaffold and initial state.
- [x] Lay out the base component structure for the dashboard, shop, panels, and modals.

Definition of done:
- The app no longer shows the Vite starter screen.
- Core data and state structures exist and match the MVP design scope.
- The codebase is ready for economy logic without major restructuring.

### 2. Core economy loop
- [x] Implement `makeTrade()` for manual cash generation.
- [x] Implement derived economy helpers for manual income, passive income, global multiplier, prestige multiplier, and scaled costs.
- [x] Implement the main tick loop for passive income updates.
- [x] Track `cash`, `lifetimeCashEarned`, `cashPerClick`, and `cashPerSecond` correctly.
- [x] Add number formatting helpers for early full numbers and short format at 1,000,000+.

Definition of done:
- Clicking earns cash.
- Passive income can be calculated every tick.
- Displayed economy stats stay in sync with the underlying state.

### 3. Staff progression layer
- [x] Implement Junior Trader purchasing with scaling cost.
- [x] Implement MVP staff upgrades: `Desk Upgrade`, `Training Program`, `Promotion Program`, and `Executive Training`.
- [x] Implement promotion rules that convert 1 Junior Trader into 1 Senior Trader for cash.
- [x] Ensure promotion is locked until `Promotion Program` is purchased.
- [x] Show staff counts and income contribution clearly in the UI.

Definition of done:
- The player can progress from manual trading into Junior Traders and Senior Traders.
- Upgrade effects change production as defined in the design doc.
- Human staff forms the main mid-game engine.

### 4. Automation layer
- [x] Implement `Algorithmic Trading` unlock logic.
- [x] Implement Trading Bot purchasing with scaling cost.
- [x] Implement MVP bot upgrade `Low-Latency Servers`.
- [x] Keep bot content visible but gated before unlock.
- [x] Add bot contribution to passive income breakdown.

Definition of done:
- Trading Bots unlock late and function as advanced automation.
- Bot income integrates cleanly with the rest of the economy.

### 5. Prestige system
- [x] Implement the MVP prestige gain formula based on lifetime cash earned.
- [x] Show next prestige reward preview in the UI.
- [x] Implement prestige reset behavior that wipes run progress but preserves permanent meta progress.
- [x] Implement MVP prestige upgrades: `Brand Recognition`, `Seed Capital`, and `Better Hiring Pipeline`.
- [x] Reapply permanent prestige effects correctly after reset.

Definition of done:
- The player can reach a meaningful prestige point.
- Reputation gain, permanent bonuses, and reset rules all work correctly.

### 6. Persistence and offline progress
- [x] Implement local save/load using a stable save key.
- [x] Implement autosave cadence and save on important transitions.
- [x] Implement export and import flow for save data.
- [x] Implement offline progress calculation capped at 8 hours.
- [x] Show an offline earnings summary when returning to the game.

Definition of done:
- Closing and reopening the game preserves progress reliably.
- Offline earnings are applied correctly and never exceed the cap.

### 7. MVP interface and UX
- [x] Build the terminal-style top bar with Cash, Cash/sec, Cash/click, Reputation, and prestige preview.
- [x] Build the main trade panel with the `Make Trade` button and milestone guidance.
- [x] Build stats and income breakdown panels.
- [x] Build the tabbed shop for `Manual`, `Staff`, `Automation`, `Global`, and `Prestige`.
- [x] Build modal flows for save/import, prestige confirmation, and offline earnings.
- [x] Apply the Bloomberg-terminal-inspired visual direction consistently across desktop and mobile layouts.

Definition of done:
- The UI is readable, intentional, and clearly explains what generates income.
- Locked content, affordability, and milestone progression are easy to understand.

### 8. Balance pass and first playable validation
- [x] Verify the first Junior Trader arrives at a satisfying pace.
- [x] Verify the Junior/Senior phase lasts long enough before bots dominate.
- [x] Verify Trading Bots unlock late but not too late.
- [x] Verify first prestige lands around the 60 to 90 minute target.
- [x] Verify Reputation feels worthwhile after reset.
- [x] Verify the MVP full loop works from manual trading through prestige.

Definition of done:
- The first playable supports the full intended arc: manual trading -> Juniors -> Seniors -> Bots -> Prestige.
- The build is stable enough for iterative tuning rather than foundational fixes.

## Status Rules

- Active todo: start at section 1 and only advance after its definition of done is met.
- Completion format: change `- [ ]` to `- [x]` for finished items.
- When a section is fully complete, move to the next section in order.

## Additional UI Refactor Todo

### 9. Single-screen shadcn/tailwind UI refactor
- [x] Install and configure Tailwind CSS for the renderer.
- [x] Add shadcn/ui foundations and adopt reusable components where they fit the game shell.
- [x] Refactor the layout so the entire core experience fits on a single screen without stacked long-scroll panels.
- [x] Replace the current panel structure with top-level tabs for `Trading`, `Operations`, `Research`, and `Prestige`.
- [x] Keep the most important economy stats visible while switching tabs.

Definition of done:
- The interface feels like one cohesive dashboard instead of several stacked sections.
- The primary gameplay surface fits on one screen on a normal desktop viewport.

### 10. Tab and category remap
- [x] Re-map current categories and rendering logic to the new tab model.
- [x] Keep `Algorithmic Trading` in `Research` as the unlock for bot capability.
- [x] Keep `Promotion Program` in `Operations` as a staffing workflow unlock.
- [x] Ensure `Trading Bot` purchase lives in `Operations` while bot-system unlock logic remains in `Research`.
- [x] Update data structures and selectors so the new tab taxonomy is the source of truth.

Definition of done:
- The player-facing mental model is clean: `Trading` = actions, `Operations` = deployment, `Research` = firm intelligence, `Prestige` = long-term meta progression.

### 11. Trading tab redesign
- [x] Reduce the `Trading` tab to the essential MVP interaction: `Make Trade`, cash-per-click, and recent gain feedback.
- [x] Add a lightweight recent trade feedback treatment such as `+$4` near the button.
- [x] Keep the interaction fast and readable with strong visual focus on the button.

Definition of done:
- The `Trading` tab is minimal, responsive, and immediately understandable.

### 12. Operations, Research, and Prestige tab redesign
- [x] Move staff and deployment actions into `Operations`.
- [x] Move manual/global intelligence unlocks into `Research`.
- [x] Keep meta progression actions and permanent upgrades in `Prestige`.
- [x] Rework tab content so each tab has a clean, dense, readable action list using shadcn/tailwind primitives.
- [x] Reduce dependence on modal flows where inline UI works better.

Definition of done:
- Each tab has a clear role and no tab feels like a miscellaneous dump of actions.

### 13. Final UI polish and verification
- [x] Verify the new layout works on desktop without vertical sprawl.
- [x] Verify mobile remains usable even if it becomes a stacked version of the same tabbed layout.
- [x] Verify all interactions still work after the category refactor.
- [x] Remove or simplify any old CSS/component structure made obsolete by the refactor.

Definition of done:
- The UI direction matches the new requested structure and feels intentionally designed rather than retrofitted.

## Revision 1 Delta Todo

### 14. Replace promotion-based Senior progression with independent unit tiers
- [x] Remove the old Senior Trader promotion model from state, logic, UI, and upgrade flow.
- [x] Make Senior Traders a directly buyable unit tier instead of a conversion result.
- [x] Ensure Junior Traders, Senior Traders, and Trading Bots are all independent repeatable units.
- [x] Update progression text and system messaging to describe tier unlocks rather than promotions.

Definition of done:
- Senior Traders are no longer created by consuming Junior Traders.
- The unit model is fully tier-based: Juniors, Seniors, Bots.

### 15. Add explicit research unlock upgrades for each unit tier
- [x] Add `Junior Hiring Program` as the Research unlock for Junior Traders.
- [x] Add `Senior Recruitment` as the Research unlock for Senior Traders.
- [x] Keep `Algorithmic Trading` as the Research unlock for Trading Bots.
- [x] Update unlock visibility and gating rules to follow the revised progression rhythm.

Definition of done:
- Research unlocks access and Operations only buys unlocked unit tiers.

### 16. Add generic bulk-buy unit purchasing
- [x] Add Operations buy mode state for `x1`, `x5`, `x10`, and `Max`.
- [x] Replace per-unit purchase actions with a generic `buyUnit(unitId, quantity)` flow.
- [x] Implement shared bulk-cost calculation for direct unit purchases.
- [x] Apply bulk buying to Junior Traders, Senior Traders, and Trading Bots.

Definition of done:
- All repeatable unit purchases use one consistent bulk-buy system.

### 17. Revise unit definitions and balance targets
- [x] Add explicit unlock upgrade ids to unit definitions.
- [x] Give Senior Traders a real direct-buy cost curve and direct income curve.
- [x] Rebalance Senior Traders toward the intended higher-tier role, roughly targeting `1 Senior ~= 10 Juniors` over time.
- [x] Rework selectors and cost helpers to support direct Senior purchases and tier unlock checks.

Definition of done:
- Senior Traders feel like a meaningful quality-tier replacement for Juniors rather than a renamed promotion outcome.

### 18. Remove promotion-specific legacy implementation
- [x] Remove `Promotion Program` as a Senior creation mechanic.
- [x] Remove `promoteJuniorToSenior()` and any related conversion logic.
- [x] Remove promotion-related UI cards, copy, and batching assumptions.
- [x] Replace old promotion references with the new `Senior Recruitment` unlock structure.

Definition of done:
- No promotion-based Senior creation logic remains in the implementation.

### 19. Rework Trading and management layout for the revised structure
- [x] Make Trading the always-visible main action panel rather than a mostly isolated tab surface.
- [x] Surface manual upgrades in or near the Trading panel.
- [x] Ensure Operations focuses on buyable units, direct operational upgrades, and bulk controls.
- [x] Ensure Research focuses on unlocks, market intelligence upgrades, and global/systemic upgrades.

Definition of done:
- The UI and game structure both reflect the new rhythm: research a tier -> buy it in operations -> scale it with bulk purchasing.

## Additional Dashboard Follow-up

### 20. Fix management tab state and expand panel structure
- [x] Fix the empty management panel bug caused by invalid active tab state.
- [x] Replace the old three-tab management area with `Operations`, `Research`, `Prestige`, `Stats`, and `Settings`.
- [x] Move firm snapshot and income breakdown into `Stats`.
- [x] Move save/import access into `Settings`.

Definition of done:
- Switching management tabs never produces an empty panel.
- Stats and settings are separated cleanly from progression tabs.

### 21. Premium terminal visual polish
- [x] Reduce the trade button size so it no longer dominates the screen.
- [x] Make the top stats row more compact and dense.
- [x] Tighten spacing, card sizing, and badge sizing for a denser interface.
- [x] Apply the revised yellow-on-black terminal theme consistently.

Definition of done:
- The UI feels denser, more premium, and closer to a finance-terminal desk.

### 22. Split dashboard into smaller components
- [x] Split `src/components/GameShell.tsx` into smaller dashboard-focused components.
- [x] Extract shared dashboard primitives for stat tiles and action rows.
- [x] Keep the overall layout readable and easier to maintain after the split.

Definition of done:
- The dashboard no longer lives as one oversized component and is easier to iterate on safely.

## UI Follow-up Pass 2

### 23. Progression clarity and density cleanup
- [x] Rework dashboard labels so top stats and progression cues are explicit instead of shorthand.
- [x] Tighten the management panels further so actions, statuses, and costs fit more densely.
- [x] Improve tab and row states so unlocked, locked, affordable, and completed actions read at a glance.
- [x] Add clearer next-step guidance inside Trading, Operations, and Research.

Definition of done:
- The dashboard reads like a progression-driven trading terminal rather than a loose set of cards.

## UI Follow-up Pass 3

### 24. Layout hierarchy and structural cleanup
- [x] Rebuild the screen hierarchy so the player can immediately identify the main action, current economy, and next recommended purchase.
- [x] Give the center area a real job by making it the primary management surface instead of dead visual space.
- [x] Rebalance the overall layout so it feels intentionally organized rather than left-heavy, center-empty, and right-cramped.

Definition of done:
- The screen has a clear focal order and no visually dominant area feels empty or unfinished.

### 25. Header and top-row repurpose
- [x] Shrink or repurpose the oversized top-left header into a compact brand plus phase summary, current objective, or next unlock area.
- [x] Remove redundant system-name hero copy that duplicates visible navigation.
- [x] Reconnect top economy stats to the gameplay loop so cash, click income, passive income, reputation, and reset yield feel close to the main action.

Definition of done:
- The header earns its space with useful progression context and the top row supports the play loop instead of floating above it.

### 26. Trading panel prioritization
- [x] Simplify the Trading panel so it has one dominant action, a few key supporting numbers, and one strong next-goal module.
- [x] Reduce the number of competing mini-cards and status boxes inside Trading.
- [x] Keep manual upgrades visible, but group them in a way that supports the action flow instead of interrupting it.

Definition of done:
- Trading feels like the clear gameplay anchor rather than a stack of equally weighted micro-panels.

### 27. Management surface and navigation overhaul
- [x] Promote management navigation into a clear tab/header system with strong emphasis and placement.
- [x] Make Operations wide enough to comfortably compare units, costs, bulk-buy controls, and upgrades.
- [x] Give Research a first-class visible home within the management area instead of leaving it weakly surfaced.

Definition of done:
- Operations, Research, Prestige, Stats, and Settings feel like deliberate primary views rather than hidden or cramped side content.

### 28. Progression and state communication pass
- [x] Strengthen progression messaging so current tier, next tier, future locked path, bot milestone, and prestige timing are visually obvious.
- [x] Improve locked content so it explains value, unlock source, and distance from availability instead of only saying it is locked.
- [x] Standardize action-state styling for primary, secondary, disabled, locked, and unaffordable interactions.
- [x] Reduce decorative density where cards and borders do not add real information.

Definition of done:
- The UI clearly communicates progression and action states with dense-but-useful presentation rather than decorative clutter.

## UI Follow-up Pass 4

### 29. Unified desk screen refactor
- [ ] Replace the split Trading + Operations layout with one primary Desk screen that reads top-to-bottom as a single progression lane.
- [ ] Remove the oversized hero/progress header and reduce it to a compact strip only if it materially helps progression readability.
- [ ] Remove the fake center management workspace and stop splitting the main loop across multiple screen regions.
- [ ] Merge Trading and Operations as one primary destination instead of two competing workspaces.

Definition of done:
- The main screen reflects the actual gameplay loop as one continuous flow instead of separated panels.

### 30. Desk progression lane
- [ ] Build the primary Desk screen in this order: Trading, Junior Desk, Senior Desk, Bot Desk.
- [ ] Keep the top strip focused on core economy stats: Cash, Per Click, Per Sec, Reputation, Reset Yield.
- [ ] Make each desk section readable on its own with unlock state, buy controls, main unit action, and relevant upgrades.
- [ ] Ensure the player can read progression top-to-bottom without cross-referencing multiple UI regions.

Definition of done:
- The player can understand the current tier, next tier, and buy sequence by scanning one main column.

### 31. Research and secondary navigation rethink
- [ ] Reduce top-level navigation so the main Desk screen is primary and Research, Prestige, Stats, and Settings are secondary views.
- [ ] Decide whether Research should remain a full secondary tab or be partially integrated inline between unit tiers.
- [ ] Keep Prestige, Stats, and Settings accessible without competing with the primary play surface.

Definition of done:
- Secondary systems remain available, but the main screen is clearly the center of play.

### 32. Framing UI reduction
- [ ] Remove excess labels, chips, subtitles, and wrappers that narrate the loop instead of supporting it.
- [ ] Preserve the terminal identity while prioritizing action clarity over decorative structure.
- [ ] Rework unlock messaging so each desk section clearly tells the player what is locked, what unlocks it, and what to do next.

Definition of done:
- The interface feels useful first and thematic second, while still keeping the terminal tone.

## Balance Follow-up

### 33. Unit cost scaling and progression balance
- [x] Audit unit pricing logic for Junior Traders, Senior Traders, and Trading Bots.
- [x] Confirm repeatable units use escalating owned-count cost scaling rather than flat costs.
- [x] Confirm x1, x5, x10, and Max purchases sum real rising per-copy costs.
- [x] Rebalance base cost, scaling, and income values so Juniors feel early, Seniors feel mid-tier, and Bots feel late-game.
- [x] Verify one-time upgrades and research unlocks remain flat-cost.
- [x] Run a balance simulation pass for Trading -> Juniors -> Seniors -> Bots -> Prestige readiness.
- [x] Tune values after simulation and rerun verification.

Definition of done:
- Repeatable units scale correctly, bulk buying respects scaling, and the run preserves a clear progression ladder through late-game automation.

## Revision 2

### 34. Research economy and research staffing
- [x] Add `researchPoints`, `researchComputerScientistCount`, and `purchasedResearchTech` to game state, persistence, selectors, and migrations.
- [x] Add the `Research Computer Scientist` repeatable unit with cash cost scaling and Research Points/sec production.
- [x] Add research production functions, bulk-buy functions, and store actions for buying research staff.
- [x] Patch the main tick loop so the game generates both Cash and Research Points every tick.
- [x] Update UI/state formatting so Research Points totals and Research/sec are readable where needed.

Definition of done:
- Research is a real production economy powered by repeatable staff rather than only a list of one-off unlocks.

### 35. Research technologies and unlock routing
- [x] Create `data/researchTech.ts` and define the first tech ladder: `algorithmicTrading`, `powerSystemsEngineering`, and `regulatoryAffairs`.
- [x] Add store actions and selectors for purchasing research tech with Research Points.
- [x] Move advanced unlock responsibility to research tech purchases instead of cash-only or prestige-only assumptions.
- [x] Derive system visibility/unlock rules for Trading Bots, Power Infrastructure, and Lobbying from research tech state.
- [x] Update the Research tab so it includes both research production and technology unlock cards.

Definition of done:
- Research technologies clearly gate major late-game systems and replace old unlock assumptions cleanly.

### 36. Power / electricity infrastructure
- [x] Add power-related game state fields for capacity infrastructure and any explicit unlock state if needed.
- [x] Add Power infrastructure purchases such as `Backup Generator`, `Power Contract`, and `Grid Expansion` with cash costs and scaling.
- [x] Add selectors and utility functions for `powerUsage`, `powerCapacity`, and machine efficiency.
- [x] Apply the over-capacity formula so machine systems are penalized by `capacity / usage` when usage exceeds capacity.
- [x] Ensure the power penalty affects machine-side systems only, not manual trading or human traders.
- [x] Add Power visibility to the UI when unlocked and integrate power information into the main progression layout.

Definition of done:
- Power behaves as a capacity system that supports bots and machine infrastructure without becoming a fuel meter.

### 37. Lobbying and influence
- [x] Add `influence` and `purchasedPolicies` to game state, persistence, selectors, and migrations.
- [x] Create `data/lobbyingPolicies.ts` with the four policy tracks: labor, energy, market, and technology.
- [x] Add store actions/selectors for Influence earning and policy purchases.
- [x] Unlock Lobbying exclusively through the `regulatoryAffairs` research tech.
- [x] Build the Lobbying UI with track grouping, influence costs, and purchased state.
- [x] Apply the first round of policy effects across labor, energy, market, and technology systems.

Definition of done:
- Lobbying is a late-game researched strategic layer powered by Influence rather than Prestige unlocks.

### 38. Prestige role revision
- [x] Remove any remaining prestige responsibility for unlocking Lobbying.
- [x] Rework prestige upgrades so they provide broad permanent scaling across profits, research, power efficiency, staff costs, machine efficiency, and starting cash.
- [x] Add any missing prestige upgrade definitions/selectors needed for the revised broad-scaling role.
- [x] Verify prestige still feels rewarding after Research, Power, and Lobbying are added.

Definition of done:
- Prestige clearly acts as a long-term multiplier layer for the full machine instead of a feature gate.

### 39. Main layout and system integration
- [x] Keep the main Desk screen focused on operations order: Trade, Junior Trader, Senior Trader, Trading Bot, and Power infrastructure.
- [x] Decide how much Research Points should appear in the top metrics versus living inside the Research tab.
- [x] Add conditional top metrics for Power and Influence when those systems become relevant.
- [x] Update right-side tabs and visibility rules so Upgrades, Research, Prestige, Stats, Settings, and future Lobbying fit the new system bundle cleanly.
- [x] Ensure disabled/future desk categories like Commodities and Crypto still fit the long-term progression plan.

Definition of done:
- The UI exposes the new systems without breaking the now-clear operations-first desk flow.

### 40. Save migration, balancing, and verification
- [x] Update save/load migration defaults for all new Revision 2 fields so older saves still load safely.
- [x] Add or extend balance-check tooling to cover Research timing, bot unlock timing, power unlock timing, lobbying unlock timing, and prestige pacing.
- [x] Run progression simulations and manual playtesting for Trading -> Research staffing -> Bots -> Power -> Lobbying -> Prestige.
- [x] Tune cash costs, RP costs, power numbers, influence pacing, and prestige bonuses after testing.
- [x] Run final `typecheck`, `lint`, `build`, and any balance scripts after tuning.

Definition of done:
- Revision 2 systems are migrated safely, paced coherently, and verified by both automated checks and balance testing.

## Revision 3

Note:
- `revision3.md` is implemented as a dedicated `Optimizations` system.
- Keep `Upgrades` as one-time purchases only.
- Put repeatable scaling purchases in a separate `Optimizations` tab with cash-based and RP-based groups.

### 41. Repeatable optimization data model and definitions
- [x] Add repeatable optimization types to `src/types/game.ts`, including currency, target, definition, and rank storage.
- [x] Add `repeatableUpgradeRanks` to run-state and any related tab typing needed for `optimizations`.
- [x] Create `src/data/repeatableUpgrades.ts` as the source of truth for initial optimization definitions.
- [x] Encode repeatable optimizations for all purchasable units and infrastructure, including traders, scientists, bots, trading servers, server rooms, and data centres.
- [x] Add shared helpers for rank-based cost and effect formulas so the system stays easy to tune.

Definition of done:
- Repeatable optimizations have a clear typed model, centralized definitions, and shared scaling helpers.

### 42. Optimization purchase flow and selectors
- [x] Add a general `buyRepeatableUpgrade(id)` store action in `src/store/gameStore.ts`.
- [x] Route purchases by currency so cash optimizations spend `cash` and research optimizations spend `researchPoints`.
- [x] Enforce affordability, unlock rules, and rank increments in store logic instead of relying on UI-only checks.
- [x] Add selectors/helpers for current rank, next cost, affordability, and derived optimization multipliers.
- [x] Keep the first implementation single-rank purchase only unless later balancing shows a need for bulk repeatable buys.

Definition of done:
- Repeatable optimizations can be purchased safely through one shared action and queried cleanly from selectors.

### 43. Economy integration for optimization effects
- [x] Patch `src/utils/economy.ts` so Junior Trader income includes both cash and research optimization bonuses.
- [x] Patch `src/utils/economy.ts` so Senior Trader income includes both cash and research optimization bonuses.
- [x] Patch `src/utils/economy.ts` so Trading Bot income includes both cash and research optimization bonuses.
- [x] Patch scientist output, Trading Server output, and infrastructure capacity so every purchasable unit category benefits from the optimization system.
- [x] Patch machine power usage so optimization reductions interact cleanly with the existing power-capacity model.

Definition of done:
- Optimization ranks affect production and bot power usage correctly without replacing unit purchases or new tier unlocks.

### 44. Dedicated Optimizations tab UI
- [x] Add `Optimizations` to the right-side management tabs without repurposing the existing one-time `Upgrades` tab.
- [x] Create `src/components/dashboard/OptimizationsTab.tsx` for the repeatable optimization interface.
- [x] Group the UI into at least cash-based operational optimizations and RP-based research optimizations.
- [x] Show name, current rank, per-rank effect, next cost, currency, affordability, and lock reason for each optimization.
- [x] Keep the presentation dense, terminal-like, and progression-readable, with future optimizations visible but clearly gated.

Definition of done:
- The player can understand and buy repeatable optimizations from one dedicated tab while `Upgrades` remains strictly one-time.

### 45. Persistence, reset behavior, and migration
- [x] Persist `repeatableUpgradeRanks` in the save model.
- [x] Add migration defaults so older saves load with an empty repeatable rank map.
- [x] Verify prestige/reset behavior treats repeatable optimizations as run-based progression unless a permanent rule is added later.
- [x] Update any import/export typing or validation paths that assume the pre-Revision 3 state shape.

Definition of done:
- Older saves remain compatible and repeatable optimization data survives save/load correctly while respecting run reset rules.

### 46. Balance pass and Revision 3 verification
- [x] Extend `scripts/balance-check.ts` to account for repeatable optimization purchases and their scaling effects.
- [x] Simulate whether cash repeatables support unit investment instead of overshadowing it too early.
- [x] Simulate whether RP repeatables give Research a meaningful sink without crowding out core unlock techs.
- [x] Tune optimization values so the wider unit and infrastructure system remains relevant across late runs.
- [x] Run final verification with `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run balance:check`.

Definition of done:
- Revision 3 optimizations are paced coherently, validated by tooling, and ready for iterative tuning instead of structural rework.

## Revision 4

Note:
- Expand the human trading ladder beyond `Junior Trader` and `Senior Trader`.
- New progression target:
  - `Junior Trader` = entry human unit
  - `Senior Trader` = stronger human unit
  - `Prop Desk` = jump from person to team
  - `Institutional Desk` = larger, more serious trading operation
  - `Hedge Fund` = major institutional capital player
  - `Investment Firm` = broad, powerful top-tier organization
- These new tiers should unlock through research, not one-time upgrades.
- This revision must include a balance-check update and tuning pass.

### 47. Expanded trading ladder data model
- [ ] Add new unit ids and state counts for `Prop Desk`, `Institutional Desk`, `Hedge Fund`, and `Investment Firm` in `src/types/game.ts`.
- [ ] Extend `src/data/initialState.ts` and UI buy-mode defaults for the new human trading tiers.
- [ ] Add the new unit definitions in `src/data/units.ts`, with each tier clearly representing a larger operational scale than the last.
- [ ] Revisit naming and descriptions so the player understands the shift from individual hires to team/organization entities.

Definition of done:
- The game state and unit data support a six-step human trading ladder from `Junior Trader` to `Investment Firm`.

### 48. Research unlock chain for higher-order trading organizations
- [ ] Add new research tech ids and definitions for unlocking the new human trading tiers.
- [ ] Gate `Prop Desk`, `Institutional Desk`, `Hedge Fund`, and `Investment Firm` behind research milestones rather than one-time upgrades.
- [ ] Design a dependency chain that reads cleanly in the Research graph and communicates escalating organizational scale.
- [ ] Update research node labels, descriptions, lock reasons, and map connections in `src/components/dashboard/ResearchTab.tsx`.

Definition of done:
- Each new human trading tier has an intentional research-based unlock path that is readable in both the graph and selected-node details.

### 49. Economy integration for the new human ladder
- [ ] Add income formulas and selectors for `Prop Desk`, `Institutional Desk`, `Hedge Fund`, and `Investment Firm`.
- [ ] Ensure new human tiers participate in global profit multipliers, prestige scaling, and any relevant optimizations.
- [ ] Re-evaluate whether the existing `Senior Recruitment` upgrade should remain specific to `Senior Trader` or be reframed around the early human staffing phase only.
- [ ] Keep the progression meaningful so each higher tier is a noticeable jump rather than a minor stat variant.

Definition of done:
- The expanded human ladder contributes correctly to the core economy and feels like real progression between tiers.

### 50. Desk UI and optimization coverage for new trading tiers
- [ ] Update `src/components/dashboard/DeskTab.tsx` so the Traders section includes all six human progression tiers cleanly.
- [ ] Keep the card presentation dense and readable as the human trading section grows.
- [ ] Add optimization coverage for the new human tiers in `src/data/repeatableUpgrades.ts` and `src/utils/economy.ts`.
- [ ] Decide whether some human-tier optimizations should be shared by stage (desk/team/institution) or remain one optimization line per tier.

Definition of done:
- The UI exposes the full human trading ladder and the optimization system understands the new tiers.

### 51. Balance simulation and pacing pass for Revision 4
- [ ] Update `scripts/balance-check.ts` so it can purchase and report the new human trading tiers and their unlock timings.
- [ ] Add milestone reporting for first `Prop Desk`, first `Institutional Desk`, first `Hedge Fund`, and first `Investment Firm`.
- [ ] Tune the new research costs, unit costs, and income outputs so the player gets more progression opportunities without collapsing the pacing curve.
- [ ] Re-run `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run balance:check` after the ladder is implemented.

Definition of done:
- The expanded human trading ladder is integrated into the simulator and tuned with clear progression milestones instead of guesswork.
