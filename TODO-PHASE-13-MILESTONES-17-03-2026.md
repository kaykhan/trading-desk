# TODO - Phase 13 Milestones Overhaul - 17-03-2026

This TODO adapts both milestone source-of-truth docs to the current `Trading Desk` repo:

- `stock_incremental_phase_13_milestones_design_and_implementation.md`
- `stock_incremental_phase_13_milestones_full_spec_sheet.md`

Status legend:

- [ ] not started
- [~] partial / needs follow-up
- [x] done

## Phase Goal

Replace the current lightweight phase-summary milestone layer with a full milestone system where:

- milestones are collectible progression objects
- milestones teach the intended order of play
- the main UI has a clickable Milestones card
- a dedicated modal shows milestone cards in a `4x4` grid
- milestone completion is saved and restored
- milestone rewards are granted once on unlock
- milestone definitions are stable enough for future achievement mapping

## Current Repo Reality

- [x] There is already a small milestone/progression layer, but it is not the Phase 13 system
- [x] Existing lightweight milestone data lives in `src/data/milestones.ts`
- [x] Existing progression copy is derived from `src/utils/progression.ts`
- [x] The main header currently shows a non-clickable milestone/progression card in `src/components/dashboard/HeaderStats.tsx`
- [x] The current modal system already supports important overlays via `src/components/ModalLayer.tsx`
- [x] `ModalId` currently does not include a milestones modal id
- [x] There is no saved `unlockedMilestones` state yet
- [x] There are no milestone notifications/toasts yet
- [x] Many milestone conditions can be derived from current game state, but several lifetime or one-shot milestone triggers do not exist yet and will need new state fields

## Design Lock For This Repo

- [ ] Treat the spec sheet as source of truth for milestone ids, names, order, descriptions, and rewards
- [ ] Replace the current phase-summary milestone model instead of layering a second milestone concept beside it
- [ ] Keep milestone ordering curated by spec order, not alphabetical or heuristic order
- [ ] Keep most milestones visible by default so the board teaches the progression path
- [ ] Build the first implementation around all `87` milestones in the spec sheet
- [ ] Include rewards in first pass because the full spec sheet defines them as part of the system
- [ ] Keep the implementation achievement-ready with stable ids and optional `achievementKey`
- [ ] Use repo-consistent naming where current game fields differ from the spec terminology

## Approved Category Order

- [ ] `gettingStarted`
- [ ] `tradingDesk`
- [ ] `research`
- [ ] `marketsSectors`
- [ ] `specialization`
- [ ] `institutions`
- [ ] `automation`
- [ ] `infrastructure`
- [ ] `complianceLobbying`
- [ ] `boosts`
- [ ] `prestige`
- [ ] `optimisations`

## Milestone Count / Coverage

- [ ] Implement all milestone definitions from the full spec sheet
- [ ] Ensure category totals match the spec:
  - `10` Getting Started
  - `5` Trading Desk
  - `8` Research
  - `9` Markets & Sectors
  - `7` Specialization
  - `6` Institutions
  - `11` Automation
  - `6` Infrastructure
  - `8` Compliance & Lobbying
  - `4` Boosts
  - `8` Prestige
  - `5` Optimisations
- [ ] Ensure final total is `87`

## 1. Replace the Existing Milestone / Progression Layer

- [ ] Audit all current milestone/progression usage in:
  - `src/data/milestones.ts`
  - `src/utils/progression.ts`
  - `src/components/dashboard/HeaderStats.tsx`
  - `src/components/dashboard/TradingPanel.tsx`
  - `src/store/selectors.ts`
- [ ] Decide which existing progression helper copy survives as a fallback vs what should now come from milestone logic
- [ ] Replace the old milestone data model in `src/data/milestones.ts`
- [ ] Decide whether `src/utils/progression.ts` is removed, simplified, or repurposed into milestone recommendation helpers
- [ ] Remove or rework any old UI wording that implies milestones are just phase tips

## 2. Type System Overhaul

- [ ] Add `MilestoneCategoryId` to `src/types/game.ts` with all `12` categories from the spec sheet
- [ ] Add `MilestoneId` as a stable union or string type strategy
- [ ] Add `MilestoneReward` type:
  - `cash?`
  - `researchPoints?`
  - `influence?`
  - `reputation?`
  - `note?`
- [ ] Replace the old `MilestoneDefinition` shape with the Phase 13 object shape:
  - `id`
  - `category`
  - `displayOrder`
  - `name`
  - `description`
  - `visibleByDefault`
  - `reward`
  - `achievementKey?`
- [ ] Add a milestone completion/evaluation type shape, such as:
  - `check(state) => boolean`
  - optional progress helpers
- [ ] Add milestone card/modal support types if useful:
  - progress display shape
  - recommended milestone summary shape

## 3. GameState Additions

- [ ] Add `unlockedMilestones: Partial<Record<MilestoneId, boolean>>` to `GameState`
- [ ] Add milestone-related lifetime/counter state needed for conditions that cannot be safely inferred from current snapshot state
- [ ] Recommended new tracked fields to evaluate exactly before coding:
  - [ ] `lifetimeManualTrades` or equivalent manual trade counter
  - [ ] `lifetimeResearchPointsEarned`
  - [ ] `totalComplianceReviewsTriggered`
  - [ ] `totalCompliancePaymentsMade`
  - [ ] `complianceTabOpened`
  - [ ] `totalTimedBoostActivations`
  - [ ] `milestoneNotificationQueue` or `lastUnlockedMilestoneIds` if needed for toasts
- [ ] Decide whether some milestone progress values should be fully derived rather than stored
- [ ] Keep save compatibility safe by defaulting all new milestone fields conservatively

## 4. Modal and UI State Additions

- [ ] Add `milestones` to `ModalId` in `src/types/game.ts`
- [ ] Ensure modal open/close store actions can open the milestone modal without special casing
- [ ] Decide whether any milestone modal page/filter state belongs in store UI state or local component state
- [ ] Recommended default: do not persist milestone modal UI state in saves for first pass

## 5. Full Milestone Registry

- [ ] Rebuild `src/data/milestones.ts` as the canonical registry for all `87` milestones
- [ ] Preserve exact milestone ids from the spec sheet
- [ ] Preserve category assignment and exact display ordering from the spec sheet
- [ ] Preserve reward metadata from the spec sheet
- [ ] Add optional `achievementKey` placeholders only where helpful; do not block implementation on them
- [ ] Add internal category metadata for UI labels/order if useful
- [ ] Add a category order helper for sorting cards and next-goal recommendation

## 6. Condition Mapping Pass

- [ ] Create a condition-mapping worksheet between spec names and repo names before implementation
- [ ] Map spec terms to current repo terms, including:
  - `juniorScientistCount` -> `juniorResearchScientistCount`
  - `seniorScientistCount` -> `seniorResearchScientistCount`
  - `mlBotCount` -> `mlTradingBotCount`
  - `aiBotCount` -> `aiTradingBotCount`
  - `dataCentreCount` -> `dataCenterCount`
  - `cloudInfrastructureCount` -> `cloudComputeCount`
  - `optimisationsUnlocked` -> `prestigeCount >= 1`
- [ ] Identify every milestone condition that can already be derived from current state
- [ ] Identify every milestone condition that needs new tracked state
- [ ] Identify every milestone condition that needs a new selector/helper because the current codebase has the data but not the aggregation

## 7. Derived Milestone Helper Layer

- [ ] Create dedicated milestone evaluation utilities, likely in a new file such as:
  - `src/utils/milestones.ts`
- [ ] Implement helpers for milestone totals and derived progression values

### Recommended helper groups

- [ ] **Global milestone helpers**
  - total unlocked milestones
  - total visible milestones
  - next recommended milestone
  - recently unlocked milestone payloads

- [ ] **Upgrade/research totals**
  - total purchased upgrades
  - total purchased research nodes
  - total purchased policies
  - total prestige ranks purchased

- [ ] **Upgrade group/category totals**
  - total purchased research upgrades
  - total purchased institution upgrades
  - total purchased automation upgrades
  - total purchased infrastructure upgrades
  - total purchased governance upgrades

- [ ] **Optimisation totals**
  - total optimisation ranks
  - total desk optimisation ranks
  - total research optimisation ranks
  - total automation optimisation ranks
  - total governance optimisation ranks

- [ ] **Sector and assignment totals**
  - unlocked sector count
  - total assigned units to sectors
  - active assigned sector count
  - per-sector output values for finance / technology / energy

- [ ] **Specialization and mandate totals**
  - total specialists
  - total correct specialist assignments
  - total mandate framework research unlocked
  - total mandated institutions
  - total correct mandate assignments

- [ ] **Automation totals**
  - total unlocked automation strategies
  - total configured automation classes
  - total automation units

- [ ] **Compliance and lobbying totals**
  - total compliance reviews
  - total compliance payments
  - lobbying unlocked helper

- [ ] **Boost totals**
  - boosts unlocked helper
  - total timed boost activations
  - total owned global boosts
  - boost automation unlocked helper

- [ ] **Prestige totals**
  - spent reputation
  - total prestige goal ranks purchased

## 8. Reward Granting Model

- [ ] Define how milestone rewards are granted exactly once on unlock
- [ ] Implement one-time reward application for:
  - cash
  - research points
  - influence
  - reputation
- [ ] Ensure reward grants cannot duplicate on load/import/offline progress reprocessing
- [ ] Decide whether rewards are applied immediately when milestone unlocks during a state change
- [ ] Recommended default: grant rewards immediately at unlock and persist unlocked status in the same update
- [ ] Decide whether reward notes are purely descriptive or shown in the UI

## 9. Milestone Evaluation Engine

- [ ] Create milestone completion rules for all `87` milestones
- [ ] Keep definition metadata and completion rules cleanly separated or tightly colocated in one registry
- [ ] Implement a function to evaluate incomplete milestones against current state
- [ ] Return newly completed milestone ids from the evaluation pass
- [ ] Apply rewards and unlock state in a single deterministic path
- [ ] Ensure evaluation is idempotent when run multiple times without new progress

## 10. Store Integration

- [ ] Integrate milestone evaluation into `src/store/gameStore.ts`
- [ ] Decide the safest evaluation hooks for milestone checking
- [ ] Recommended evaluation points:
  - after `makeTrade`
  - after `tick`
  - after purchase actions
  - after assignment/configuration actions
  - after prestige reset completion
  - after offline progress application
  - after import/load normalization if needed
- [ ] Add helper action if useful, e.g. `evaluateMilestones()`
- [ ] Ensure actions that can satisfy milestone conditions trigger evaluation after state mutation, not before
- [ ] Ensure milestone rewards do not interfere with existing purchase logic or offline processing

## 11. Persistence / Migration

- [ ] Add milestone state normalization in `src/utils/persistence.ts`
- [ ] Normalize `unlockedMilestones`
- [ ] Normalize any new lifetime counters added for milestone conditions
- [ ] Keep backward compatibility for older saves that have no milestone fields
- [ ] Default old saves to empty milestone unlock state
- [ ] Decide whether to retroactively unlock milestones on load based on current save state
- [ ] Recommended default: yes, evaluate milestones after load/import/offline application so existing progressed saves receive appropriate milestone unlocks
- [ ] Ensure milestone rewards are not double-granted during retroactive unlock migration

## 12. Initial State Updates

- [ ] Add milestone defaults to `src/data/initialState.ts`
- [ ] Add zero/default values for all new milestone counters/flags

## 13. Main Milestones Card Rebuild

- [ ] Replace the current header milestone/progression card in `src/components/dashboard/HeaderStats.tsx`
- [ ] Make the Milestones card clickable
- [ ] Show:
  - unlocked milestone count
  - total milestone count
  - next recommended milestone name and/or description
- [ ] Ensure the card feels as important as Market News, per spec
- [ ] Keep it readable without becoming visually noisy
- [ ] Decide whether `TradingPanel` should also use milestone recommendation data or keep its own progression helper copy

## 14. Milestones Modal

- [ ] Create a dedicated milestones modal component, likely `src/components/MilestonesModal.tsx`
- [ ] Register it in `src/components/ModalLayer.tsx`
- [ ] Build the main board as a `4x4` grid
- [ ] Decide pagination vs scroll behavior
- [ ] Recommended default: paginated 16-card pages or a clearly sectioned scroll container, but keep the visible board experience aligned with `4x4`
- [ ] Each milestone card should show:
  - name
  - description
  - unlocked / locked state
  - category marker if helpful
  - reward summary
  - optional progress text if relevant
- [ ] Unlocked cards should feel collectible and celebratory
- [ ] Locked-but-visible cards should remain readable and useful as roadmap items
- [ ] Hidden milestones, if any exist later, should be exceptional not default

## 15. Progress Display Rules

- [ ] Decide which milestones get explicit progress display instead of binary locked/unlocked only
- [ ] Recommended first-pass progress candidates:
  - trade counts
  - unit counts
  - total research nodes
  - sector assignment counts
  - prestige rank totals
  - optimisation rank totals
- [ ] Keep progress copy concise and readable inside cards

## 16. Notification / Celebration Layer

- [ ] Add a lightweight milestone unlock notification system
- [ ] Decide whether to use an existing toast library or a simple custom banner
- [ ] Recommended first-pass message format:
  - `Milestone Unlocked: First Junior Trader`
- [ ] Ensure multiple unlocks in one tick/action are handled cleanly
- [ ] Ensure rewards are visible enough when unlocked

## 17. Compliance / Tab-Visit / Interaction Milestones

- [ ] Add support for interaction-triggered milestones, not just economic thresholds
- [ ] Track `Compliance` tab opened state for `firstComplianceTabVisit`
- [ ] Review whether any other tab-open or modal-open milestone flags are needed now or later
- [ ] Ensure interaction flags are triggered exactly once and persisted safely

## 18. Boost and Automation Interaction Milestones

- [ ] Track timed boost activation count
- [ ] Track first global boost ownership
- [ ] Track boost auto-activation unlock
- [ ] Track automation class configuration state:
  - market target set
  - strategy set
  - class counted as configured
- [ ] Ensure automation milestones read current repo automation config accurately

## 19. Specialization and Mandate Milestones

- [ ] Build robust helpers for specialist counts from `traderSpecialists`
- [ ] Build robust helpers for correct specialist placement by matching specialization to sector assignment
- [ ] Build mandate totals from `institutionMandates`
- [ ] Build correct mandate assignment logic by matching mandate to sector assignment
- [ ] Ensure these helpers use current repo semantics rather than simplified approximations

## 20. Upgrade Group / Category Milestones

- [ ] Verify all Phase 11 upgrade groups map cleanly to milestone categories:
  - research
  - institutions
  - automation
  - infrastructure
  - complianceLobbying
- [ ] Add helpers for counting purchased upgrades by group
- [ ] Use those helpers for:
  - first research upgrade
  - first institution upgrade
  - first automation upgrade
  - first infrastructure upgrade
  - first governance upgrade

## 21. Prestige and Optimisation Milestones

- [ ] Build helpers for total prestige ranks purchased from `purchasedPrestigeUpgrades`
- [ ] Use current prestige naming/track semantics from the completed Phase 10 redesign
- [ ] Build optimisation total helpers using the new Phase 12 broad optimisation families
- [ ] Ensure `unlockOptimisations` resolves via `prestigeCount >= 1`
- [ ] Ensure family-specific optimisation milestones respect current Phase 12 categories

## 22. Recommendation Logic

- [ ] Build next-recommended milestone logic based on first incomplete visible milestone in designed order
- [ ] Ensure recommendation is deterministic and easy to explain
- [ ] Use this recommendation in the main Milestones card
- [ ] Decide whether the same recommendation should replace or inform `progressionSummary` elsewhere

## 23. UI Polish and Presentation Rules

- [ ] Make milestone cards feel collectible, not like a plain checklist
- [ ] Distinguish unlocked vs locked cards clearly
- [ ] Keep the visual language aligned with the existing dashboard aesthetic
- [ ] Avoid overcrowding the modal despite the large milestone count
- [ ] Keep desktop and mobile behavior usable

## 24. Testing Checklist

- [ ] Typecheck after state/type integration
- [ ] Build after modal/UI integration
- [ ] Verify old saves load without crashing
- [ ] Verify progressed saves retroactively unlock appropriate milestones without duplicate rewards
- [ ] Verify milestone rewards grant exactly once
- [ ] Verify recommendation ordering follows the spec sheet
- [ ] Verify the main Milestones card opens the modal
- [ ] Verify the modal shows milestone cards in the intended `4x4` presentation
- [ ] Verify milestone unlock notifications trigger correctly
- [ ] Verify specialization, mandate, automation configuration, boosts, compliance, prestige, and optimisation milestones all unlock correctly

## 25. Suggested Implementation Order

- [ ] Step 1: replace milestone types and registry model
- [ ] Step 2: add new milestone state fields and persistence defaults
- [ ] Step 3: build milestone helper/evaluation layer and condition mapping
- [ ] Step 4: integrate milestone evaluation into store actions
- [ ] Step 5: add reward granting and duplicate-safety
- [ ] Step 6: rebuild the main Milestones card
- [ ] Step 7: build milestones modal and register it in modal layer
- [ ] Step 8: add notifications
- [ ] Step 9: run type/build verification and do progression sanity checks on fresh and advanced saves

## 26. Open Implementation Notes For This Repo

- [ ] The current `HeaderStats` milestone card is phase-summary-driven and should be replaced, not lightly edited
- [ ] The existing `src/data/milestones.ts` currently represents old phase milestones and should be treated as legacy content
- [ ] The existing `src/utils/progression.ts` may become partially obsolete after the milestone recommendation layer exists
- [ ] Because milestone rewards are now real progression rewards, reward-application safety during load/import/offline progress is one of the highest-risk parts of the phase
- [ ] Because the spec includes `87` milestones, good helper structure and ordering utilities matter more than hardcoding UI assumptions inline
