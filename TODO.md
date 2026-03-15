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
- [ ] Install and configure Tailwind CSS for the renderer.
- [ ] Add shadcn/ui foundations and adopt reusable components where they fit the game shell.
- [ ] Refactor the layout so the entire core experience fits on a single screen without stacked long-scroll panels.
- [ ] Replace the current panel structure with top-level tabs for `Trading`, `Operations`, `Research`, and `Prestige`.
- [ ] Keep the most important economy stats visible while switching tabs.

Definition of done:
- The interface feels like one cohesive dashboard instead of several stacked sections.
- The primary gameplay surface fits on one screen on a normal desktop viewport.

### 10. Tab and category remap
- [ ] Re-map current categories and rendering logic to the new tab model.
- [ ] Keep `Algorithmic Trading` in `Research` as the unlock for bot capability.
- [ ] Keep `Promotion Program` in `Operations` as a staffing workflow unlock.
- [ ] Ensure `Trading Bot` purchase lives in `Operations` while bot-system unlock logic remains in `Research`.
- [ ] Update data structures and selectors so the new tab taxonomy is the source of truth.

Definition of done:
- The player-facing mental model is clean: `Trading` = actions, `Operations` = deployment, `Research` = firm intelligence, `Prestige` = long-term meta progression.

### 11. Trading tab redesign
- [ ] Reduce the `Trading` tab to the essential MVP interaction: `Make Trade`, cash-per-click, and recent gain feedback.
- [ ] Add a lightweight recent trade feedback treatment such as `+$4` near the button.
- [ ] Keep the interaction fast and readable with strong visual focus on the button.

Definition of done:
- The `Trading` tab is minimal, responsive, and immediately understandable.

### 12. Operations, Research, and Prestige tab redesign
- [ ] Move staff and deployment actions into `Operations`.
- [ ] Move manual/global intelligence unlocks into `Research`.
- [ ] Keep meta progression actions and permanent upgrades in `Prestige`.
- [ ] Rework tab content so each tab has a clean, dense, readable action list using shadcn/tailwind primitives.
- [ ] Reduce dependence on modal flows where inline UI works better.

Definition of done:
- Each tab has a clear role and no tab feels like a miscellaneous dump of actions.

### 13. Final UI polish and verification
- [ ] Verify the new layout works on desktop without vertical sprawl.
- [ ] Verify mobile remains usable even if it becomes a stacked version of the same tabbed layout.
- [ ] Verify all interactions still work after the category refactor.
- [ ] Remove or simplify any old CSS/component structure made obsolete by the refactor.

Definition of done:
- The UI direction matches the new requested structure and feels intentionally designed rather than retrofitted.
