# TODO — Phase 4A People Specialization — 16-03-2026

This TODO adapts `stock_incremental_phase_4_a_people_specialization.md` to the current `Trading Desk` codebase.

Status legend:

- [ ] not started
- [~] partial / needs follow-up
- [x] done

## Phase Goal

Deliver a people-specialization layer where:

- Junior Traders and Senior Traders can be trained into sector specialists
- specialization unlocks through Human Capital research
- training spends cash and converts generic owned traders into specialist pools
- specialist assignments are tracked separately from generic assignments
- specialists gain a matching-sector output bonus and no mismatch penalty
- Interns remain generic in the first pass

## Current Repo Reality

- [x] Sector assignment currently exists only for generic `intern`, `juniorTrader`, and `seniorTrader`
- [x] `sectorAssignments` currently stores only generic human assignments
- [x] sector output currently assumes all assigned human traders are generic
- [x] the Human Capital research branch already exists and is the correct home for specialization unlocks
- [x] the Sectors tab currently shows only generic human assignment controls
- [x] the Desk tab currently has no training/specialization surface

## Recommended Design Lock

- [ ] Keep Interns generic in Phase 4A
- [ ] Add 3 specialization types:
  - `finance`
  - `technology`
  - `energy`
- [ ] Add 3 Human Capital research techs:
  - `financeSpecialistTraining`
  - `technologySpecialistTraining`
  - `energySpecialistTraining`
- [ ] Use `foundationsOfFinanceTraining` as the base prerequisite for all 3 specialization research nodes
- [ ] Keep first-pass training costs as:
  - Junior specialist training: `$500`
  - Senior specialist training: `$2,000`
- [ ] Keep first-pass matching bonuses as:
  - Junior specialist match: `+10%`
  - Senior specialist match: `+20%`
  - mismatch: `0%`

## 1. Types and State

- [ ] Add `TraderSpecializationId` to `src/types/game.ts`
- [ ] Add trader specialization state to `GameState`:
  - `traderSpecialists.juniorTrader`
  - `traderSpecialists.seniorTrader`
- [ ] Extend `sectorAssignments` to support specialist assignment buckets:
  - `juniorTraderSpecialists`
  - `seniorTraderSpecialists`
- [ ] Ensure state shape remains easy to serialize and migrate
- [ ] Add any needed UI state for training buy amount if bulk training is desired in first pass

## 2. Research Tree Integration

- [ ] Extend `ResearchTechId` with:
  - `financeSpecialistTraining`
  - `technologySpecialistTraining`
  - `energySpecialistTraining`
- [ ] Add the 3 specialization training nodes to `src/data/researchTech.ts`
- [ ] Place them in the `humanCapital` branch
- [ ] Decide final prerequisite chain shape, likely:
  - `foundationsOfFinanceTraining` -> `financeSpecialistTraining`
  - `foundationsOfFinanceTraining` -> `technologySpecialistTraining`
  - `foundationsOfFinanceTraining` -> `energySpecialistTraining`
- [ ] Add graph layout positions for the new nodes so the Human Capital branch still reads clearly
- [ ] Confirm whether these research nodes should appear before or after `juniorTraderProgram` in the branch graph

## 3. Persistence and Migration

- [ ] Add default empty `traderSpecialists` state to `src/data/initialState.ts`
- [ ] Add default empty specialist assignment state to `src/data/initialState.ts`
- [ ] Update `src/utils/persistence.ts` to normalize `traderSpecialists`
- [ ] Update `src/utils/persistence.ts` to normalize specialist assignment structures
- [ ] Preserve old saves by defaulting all new specialization state to zero

## 4. Derived Counts and Helpers

- [ ] Create specialization helpers, likely in `src/utils/specialization.ts`
- [ ] Add:
  - `getTotalJuniorSpecialists(state)`
  - `getTotalSeniorSpecialists(state)`
  - `getGenericJuniorCount(state)`
  - `getGenericSeniorCount(state)`
  - `getJuniorSpecialistCount(state, specializationId)`
  - `getSeniorSpecialistCount(state, specializationId)`
- [ ] Add assignment helpers for specialist pools:
  - assigned specialist count by sector
  - available unassigned specialist count by specialization
- [ ] Add `getSpecialistSectorBonus(unitType, specializationId, sectorId)`
- [ ] Keep helper naming consistent with existing `economy` and `selectors` patterns

## 5. Training Actions

- [ ] Add `trainJuniorSpecialist(specializationId, amount)` to `GameStore`
- [ ] Add `trainSeniorSpecialist(specializationId, amount)` to `GameStore`
- [ ] Validate training requirements:
  - research unlock purchased
  - enough cash
  - enough generic owned traders remaining to train
- [ ] Ensure training converts only generic traders, not already-specialized ones
- [ ] Decide whether first pass supports only `1` at a time or existing buy modes / bulk amounts
- [ ] Deduct cash and increment specialist counts atomically

## 6. Specialist Assignment Actions

- [ ] Add specialist assignment actions to `GameStore`, likely:
  - `assignJuniorSpecialistToSector(specializationId, sectorId, amount)`
  - `unassignJuniorSpecialistFromSector(specializationId, sectorId, amount)`
  - `assignSeniorSpecialistToSector(specializationId, sectorId, amount)`
  - `unassignSeniorSpecialistFromSector(specializationId, sectorId, amount)`
- [ ] Add max/clear helpers if needed for usability
- [ ] Ensure generic and specialized assignment pools do not overlap incorrectly
- [ ] Prevent specialist assignment to locked sectors

## 7. Economy Integration

- [ ] Update sector output calculations in `src/utils/economy.ts`
- [ ] Keep generic assigned Juniors/Seniors producing exactly as they do now
- [ ] Add specialist-assigned Juniors/Seniors as separate contributors
- [ ] Apply matching-sector bonus only when specialization matches assigned sector
- [ ] Ensure mismatch gives no penalty and no bonus
- [ ] Confirm General Desk output still uses only unassigned generic traders, not assigned specialists
- [ ] Confirm specialized traders still inherit all normal unit output multipliers before specialist bonus is applied

## 8. Selector Refactor

- [ ] Add selectors for specialization research unlocks
- [ ] Add selectors for specialist counts and generic counts
- [ ] Add selectors for available specialist training capacity
- [ ] Add selectors for assigned specialist totals per sector
- [ ] Add selectors for specialist contribution to sector output if useful for the UI

## 9. Desk / Training UI

- [ ] Add a `Training` section to the Trading or Desk surface
- [ ] Show unlock state for each specialist training type
- [ ] Show current counts for:
  - generic Juniors
  - Finance/Tech/Energy Junior specialists
  - generic Seniors
  - Finance/Tech/Energy Senior specialists
- [ ] Add cash-based training controls for Juniors
- [ ] Add cash-based training controls for Seniors
- [ ] Add hover/help info instead of large explanatory cards where possible
- [ ] Keep the UI compact and consistent with recent cleanup direction

## 10. Sectors UI

- [ ] Extend `src/components/dashboard/SectorsTab.tsx` to display specialist assignment controls
- [ ] For each sector, show:
  - generic Junior assignments
  - generic Senior assignments
  - specialized Junior assignments by specialization type
  - specialized Senior assignments by specialization type
- [ ] Make it visually obvious when a specialist is matched to the same sector and receiving a bonus
- [ ] Avoid large instruction blocks; prefer concise labels and hover info

## 11. Research UI Copy

- [ ] Update research node descriptions for specialization unlocks so they are short in the graph and more detailed in the confirmation modal
- [ ] Add "what this unlocks" copy in the confirmation modal for the specialization research nodes

## 12. Balance Pass

- [ ] Check whether specialization research appears too early or too late in Human Capital
- [ ] Check whether specialist training costs are meaningful but not oppressive
- [ ] Check whether `+10%` / `+20%` match bonuses feel noticeable
- [ ] Check whether Finance specialization feels redundant with baseline Finance sector play and adjust if needed

## 13. Validation

- [ ] Verify old saves load with zero specialist state cleanly
- [ ] Verify specialist training cannot exceed generic owned Junior count
- [ ] Verify specialist training cannot exceed generic owned Senior count
- [ ] Verify specialist assignment cannot exceed available specialist pool
- [ ] Verify matched specialization boosts only the correct sector
- [ ] Verify mismatched specialist assignments still function with no bonus
- [ ] Verify General Desk output updates correctly when generic traders are trained and/or assigned away
- [ ] Verify Sectors tab remains readable on desktop and smaller layouts

## Recommended Implementation Order

- [ ] 1. Add specialization ids, state, and persistence defaults
- [ ] 2. Add specialization research nodes to Human Capital
- [ ] 3. Create specialization helper module and selectors
- [ ] 4. Implement training actions in the store
- [ ] 5. Extend sector assignment model for specialist pools
- [ ] 6. Update economy calculations for specialist sector bonuses
- [ ] 7. Add training UI in Desk/Trading
- [ ] 8. Add specialist assignment UI to Sectors
- [ ] 9. Run gameplay validation and tune costs/bonuses
