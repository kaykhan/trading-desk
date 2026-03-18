# TODO — Phase 2 Capacity / Infrastructure — 16-03-2026

This checklist turns `docs/stock_incremental_phase_2_capacity_infrastructure_design_and_code.md` into an implementation plan for the current codebase.

The goal is to add the first human-side physical scaling constraint through Desk Slots, office expansion, and floor expansion while preserving the existing Phase 1 staff + sectors flow.

Important clarification for Phase 2:

- human traders should no longer consume direct machine-style power/energy individually
- the human-side power/energy requirement is represented through desk allocation / office capacity infrastructure instead
- machine power remains a separate system for bots and machine infrastructure

Status legend:

- [ ] not started
- [~] in progress / partial
- [x] done

## Implementation Goal

Add a Phase 2 capacity system where:

- Interns, Junior Traders, and Senior Traders consume Desk Slots
- human desk growth is constrained through desk allocation / office infrastructure rather than per-trader direct power usage
- players start with a modest amount of free desk capacity
- human purchases are blocked when no Desk Slots remain
- Desk Space, Floor Space, and Office increase total Desk Slots
- capacity information is visible in both Trading and Sectors
- the system is fully integrated into state, selectors, economy helpers, save/load, and UI

## Recommended Implementation Order

## 1. Design Lock

- [x] Confirm Phase 2 applies only to `Intern`, `Junior Trader`, and `Senior Trader`
- [x] Confirm `Prop Desk+` do not consume Desk Slots in the first implementation
- [x] Confirm Research staff remain excluded in Phase 2
- [x] Confirm machine systems remain excluded in Phase 2
- [x] Confirm human traders no longer consume direct machine-style power individually
- [x] Confirm desk allocation / office capacity is now the human-side energy / infrastructure abstraction
- [x] Confirm starting Desk Slots value is `10`
- [x] Confirm Desk Space grants `+1` Desk Slot
- [x] Confirm Floor Space grants `+25` Desk Slots
- [x] Confirm Office grants `+100` Desk Slots
- [x] Confirm Desk Space / Floor Space / Office use cash only
- [x] Confirm bulk-buy is not required for capacity infrastructure in the first pass
- [x] Confirm full-capacity human purchases should be blocked, not queued

## 2. Type System and Data Model

- [x] Add a `CapacityInfrastructureId` type to `src/types/game.ts`
- [x] Add a `CapacityInfrastructureDefinition` type to `src/types/game.ts`
- [x] Add `baseDeskSlots` to `GameState`
- [x] Add `officeExpansionCount` to `GameState`
- [x] Add `floorExpansionCount` to `GameState`
- [x] Add store action typings for:
  - `buyDeskSpace`
  - `buyFloorSpace`
  - `buyOffice`
- [x] Decide whether capacity buy mode state is needed now or intentionally deferred

## 3. Capacity Constants and Data

- [x] Create `src/data/capacity.ts`
- [x] Add constants for:
  - `BASE_DESK_SLOTS`
  - `DESK_SPACE_SLOTS`
  - `FLOOR_SPACE_SLOTS`
  - `OFFICE_SLOTS`
  - `DESK_SPACE_BASE_COST`
  - `DESK_SPACE_COST_SCALING`
  - `FLOOR_SPACE_BASE_COST`
  - `FLOOR_SPACE_COST_SCALING`
  - `OFFICE_BASE_COST`
  - `OFFICE_COST_SCALING`
- [x] Add capacity infrastructure definitions for:
  - `deskSpace`
  - `floorSpace`
  - `office`
- [x] Add helper accessors such as `CAPACITY_INFRASTRUCTURE` and `getCapacityInfrastructureDefinition`
- [x] Keep the data format extensible for later capacity infrastructure types

## 4. Initial State

- [x] Add `baseDeskSlots` to `src/data/initialState.ts`
- [x] Initialize `baseDeskSlots` from `CAPACITY_CONSTANTS.BASE_DESK_SLOTS`
- [x] Add `deskSpaceCount: 0`
- [x] Add `floorSpaceCount: 0`
- [x] Add `officeCount: 0`
- [x] Confirm new fields are included in reset/default state cleanly

## 5. Capacity Utility / Selector Layer

- [x] Create `src/utils/capacity.ts`
- [x] Add generic `getScaledCost(baseCost, scaling, owned)` helper if a shared helper does not already exist in the right place
- [x] Add `getDeskSpaceCost(state)`
- [x] Add `getFloorSpaceCost(state)`
- [x] Add `getOfficeCost(state)`
- [x] Add `getTotalDeskSlots(state)`
- [x] Add `getUsedDeskSlots(state)`
- [x] Add `getAvailableDeskSlots(state)`
- [x] Add `isAtDeskCapacity(state)`
- [x] Add `canBuyHumanUnit(state)` helper for slot-limited humans
- [x] Make sure used slots count only:
  - Interns
  - Junior Traders
  - Senior Traders
- [x] Confirm assigned/unassigned humans both count toward used slots equally
- [x] Confirm capacity replaces direct power usage as the human-side growth constraint

## 6. Human Purchase Blocking Logic

- [x] Patch human purchase flows in `src/store/gameStore.ts` so `Intern` purchase checks Desk Slot availability
- [x] Patch `Junior Trader` purchase checks Desk Slot availability
- [x] Patch `Senior Trader` purchase checks Desk Slot availability
- [x] Make sure blocked human purchases leave state unchanged
- [x] Make sure machine, research, and political purchases are unaffected
- [x] Remove any remaining direct power/energy gating from human trader purchases if it still exists in the codebase
- [x] Surface a specific blocked reason such as `Need more Desk Slots`
- [x] Ensure buy-mode calculations do not allow purchasing more slot-limited humans than available Desk Slots

## 7. Capacity Infrastructure Purchase Logic

- [x] Implement `buyDeskSpace()` in `src/store/gameStore.ts`
- [x] Implement `buyFloorSpace()` in `src/store/gameStore.ts`
- [x] Implement `buyOffice()` in `src/store/gameStore.ts`
- [x] Add cost calculation using scaling per owned expansion count
- [x] Require available Energy capacity as well as cash for desk-capacity purchases
- [x] Block purchase when cash is insufficient
- [x] Increment the right expansion count on success
- [x] Confirm no slot cap is needed for expansions in this phase

## 8. Selectors

- [x] Add `totalDeskSlots` selector to `src/store/selectors.ts`
- [x] Add `usedDeskSlots` selector to `src/store/selectors.ts`
- [x] Add `availableDeskSlots` selector to `src/store/selectors.ts`
- [x] Add `deskSpaceCost` selector to `src/store/selectors.ts`
- [x] Add `floorSpaceCost` selector to `src/store/selectors.ts`
- [x] Add `officeCost` selector to `src/store/selectors.ts`
- [x] Add capacity energy usage and energy-affordability selectors/helpers
- [x] Add `isAtDeskCapacity` selector to `src/store/selectors.ts`
- [~] Add convenience selectors for UI summaries:
  - `deskSlotsUsedLabel`
  - `deskSlotsFreeLabel`
  - expansion counts

## 9. Save / Load / Migration

- [x] Update `src/utils/persistence.ts` normalization to support `baseDeskSlots`
- [x] Update `src/utils/persistence.ts` normalization to support `deskSpaceCount`
- [x] Update `src/utils/persistence.ts` normalization to support `floorSpaceCount`
- [x] Update `src/utils/persistence.ts` normalization to support `officeCount`
- [x] Add migration defaults for older saves:
  - `baseDeskSlots = 10`
  - `deskSpaceCount = 0`
  - `floorSpaceCount = 0`
  - `officeCount = 0`
- [x] Ensure export/import includes capacity fields automatically
- [~] Ensure full reset clears purchased capacity infrastructure
- [x] Ensure prestige reset restores capacity to default starting values unless intentionally designed otherwise

## 10. Trading Tab UI Changes

- [x] Add a visible Desk Capacity summary to `src/components/dashboard/DeskTab.tsx`
- [x] Show preferred format like `Desk Slots: 7 / 10 used`
- [x] Add a dedicated capacity/infrastructure section in the Trading view
- [x] Add Desk Space purchase card to the Infrastructure view
- [x] Add Floor Space purchase card to the Infrastructure view
- [x] Add Office purchase card to the Infrastructure view
- [x] Group human capacity purchases under an `Office` section in Infrastructure
- [x] Group machine power purchases under an `Energy` section in Infrastructure
- [x] Keep both Office and Energy groups stacked in a single-column layout
- [x] Show current slot gain on each card
- [x] Show next cost on each card
- [x] Show purchase counts on each card or in badges
- [x] Show that Desk Space / Floor Space / Office also require energy
- [x] Update human purchase cards to reflect full-capacity blocking state
- [x] Show `Need more Desk Slots` when human purchases are blocked by capacity
- [x] Preserve current assignment summaries already added in Phase 1
- [x] Keep Trading focused on hiring while Infrastructure owns desk-capacity purchasing

## 11. Sectors Tab UI Changes

- [x] Add Desk Capacity summary to `src/components/dashboard/SectorsTab.tsx`
- [x] Show used / total slots near the existing top summary area
- [x] Add short explanatory copy that sectors do not create more room; they only reassign existing humans
- [x] Ensure the player can see owned / assigned / available alongside global capacity without clutter

## 12. Header / Stats Updates

- [x] Decide whether Desk Slot usage should appear in `src/components/dashboard/HeaderStats.tsx`
- [x] If yes, add a compact Desk Slots badge there
- [x] Update `src/components/dashboard/StatsTab.tsx` to include:
  - total Desk Slots
  - used Desk Slots
  - free Desk Slots
  - Desk Space count
  - Floor Space count
  - Office count
- [x] Make sure capacity info does not crowd out existing power and economy info
- [x] Make sure UI language does not imply that human traders consume machine power directly

## 13. Progression and Messaging

- [x] Update `src/utils/progression.ts` so the player is taught that human growth now depends on desk capacity
- [x] Add copy to explain the tradeoff:
  - hire more humans
  - or expand the firm first
- [x] Add onboarding copy in Trading and/or Sectors to explain that desk capacity is firm-wide, not sector-specific
- [x] Add messaging when the player first reaches full desk capacity

## 14. Validation and Testing

- [x] Verify player starts with `10` total Desk Slots
- [x] Verify `usedDeskSlots` increases correctly when buying Interns
- [x] Verify `usedDeskSlots` increases correctly when buying Junior Traders
- [x] Verify `usedDeskSlots` increases correctly when buying Senior Traders
- [x] Verify assigning humans to sectors does not change used Desk Slots
- [x] Verify human purchases are blocked at full capacity
- [x] Verify human traders are no longer blocked or scaled by the machine power system
- [x] Verify machine purchases still work when desk capacity is full
- [x] Verify research staff purchases still work when desk capacity is full
- [x] Verify Desk Space increases total Desk Slots by `1`
- [x] Verify Floor Space increases total Desk Slots by `25`
- [x] Verify Office increases total Desk Slots by `100`
- [x] Verify expansion costs scale correctly by owned count
- [x] Verify capacity purchases require available Energy capacity
- [x] Verify save/load preserves capacity fields
- [x] Verify prestige reset restores intended capacity defaults
- [x] Verify full reset restores intended capacity defaults
- [x] Verify old saves migrate without crashes
- [x] Verify buy mode still behaves correctly with capacity-limited humans
- [x] Verify small-screen layout remains usable with the added capacity section

## 15. Balance Pass

- [x] Check whether `10` starting Desk Slots feels generous enough for onboarding
- [x] Check whether Desk Space pricing feels reachable but meaningful
- [x] Check whether Floor Space pricing comes online at the right stage
- [x] Check whether Office pricing comes online at the right stage
- [x] Check whether capacity creates an interesting hire-vs-expand tradeoff
- [ ] Check whether capacity blocks progression too harshly in the early game
- [ ] Check whether the player still naturally reaches sectors before feeling over-constrained
- [x] Check whether replacing direct trader power usage with desk-capacity pressure makes human growth feel clearer

## 16. Nice-to-Have Follow-Ups

- [ ] Add theming/icons for Desk Space / Floor Space / Office
- [ ] Add capacity-specific milestone callouts
- [ ] Add bulk-buy support for Desk Space / Floor Space / Office later if needed
- [x] Add bulk-buy support for Desk Space / Floor Space / Office later if needed
- [ ] Expand capacity usage to later human desk tiers in a future phase
- [ ] Explore separate capacity models later for research teams or other departments

## Suggested First 10 Tasks To Implement One By One

- [x] 1. Add capacity fields and types to `src/types/game.ts`
- [x] 2. Create `src/data/capacity.ts`
- [x] 3. Add capacity defaults to `src/data/initialState.ts`
- [x] 4. Create `src/utils/capacity.ts`
- [x] 5. Add desk-slot selectors to `src/store/selectors.ts`
- [x] 6. Patch human purchase blocking in `src/store/gameStore.ts`
- [x] 7. Add `buyDeskSpace()` to `src/store/gameStore.ts`
- [x] 8. Add `buyFloorSpace()` and `buyOffice()` to `src/store/gameStore.ts`
- [x] 9. Update persistence normalization and migration for capacity state
- [x] 10. Add Desk Capacity summary to the Trading tab

## Suggested Second 10 Tasks

- [x] 11. Add capacity purchase cards to the Infrastructure tab
- [x] 12. Add Desk Capacity summary to the Sectors tab
- [x] 13. Add blocked-state messaging for full-capacity human purchases
- [x] 14. Update Stats with Desk Slot and expansion info
- [x] 15. Update progression copy for capacity onboarding
- [x] 16. Add first-capacity-reached messaging
- [x] 17. Add automated validation script for capacity rules
- [x] 18. Run save/load/reset/prestige validation pass
- [x] 19. Do a first balance pass on slot counts and Desk Space / Floor Space / Office costs
- [x] 20. Do a mobile/small-screen layout pass

## Definition of Done for Phase 2 Capacity

- [x] Humans that require desk space cannot be purchased when no Desk Slots remain
- [x] Interns, Juniors, and Seniors all count toward used Desk Slots
- [x] Sector assignment does not change total used Desk Slots
- [x] Human traders no longer rely on direct machine-style power usage
- [x] Desk Space, Floor Space, and Office increase total Desk Slots correctly
- [x] Capacity is clearly visible in Trading
- [x] Capacity is clearly visible in Sectors
- [x] Capacity fields persist through save/load/import/export/reset correctly
- [x] The player can understand why human purchases are blocked
- [x] The system feels like a strategic growth constraint, not a punishment wall
