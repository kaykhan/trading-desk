# TODO - Phase 12 Optimisations Redesign - 17-03-2026

This TODO adapts `phase12.md` to the current `Trading Desk` codebase after the prestige redesign, boosts tab, compliance/lobbying systems, and the Phase 11 upgrade replacement.

Status legend:

- [ ] not started
- [~] partial / needs follow-up
- [x] done

## Phase Goal

Replace the current repeatable-upgrade system with a cleaner post-Prestige refinement layer where:

- Optimisations unlock after `Prestige 1`
- each optimisation has up to `100` ranks
- optimisations are broad system refinements, not per-unit clutter
- optimisations use `Cash`, `Research Points`, or `Influence`
- the redesign clearly separates Optimisations from Research, Upgrades, and Prestige

## Current Repo Reality

- [x] The current system still uses `repeatableUpgradeRanks` and `REPEATABLE_UPGRADES`
- [x] Current repeatables are much more granular than the new design wants
- [x] Current repeatables are already deeply integrated across:
  - `src/utils/economy.ts`
  - `src/utils/automation.ts`
  - `src/utils/compliance.ts`
- [x] UI currently lives in `src/components/dashboard/OptimizationsTab.tsx`
- [x] Current Optimizations tab still presents older sections:
  - operations
  - research
  - influence
- [x] Phase 12 wants a cleaner 4-category structure:
  - desk
  - research
  - automation
  - governance

## Design Lock For This Repo

- [ ] Replace the old repeatable-upgrade list with the new 15-optimisation framework
- [ ] Keep the underlying state field as `repeatableUpgradeRanks` for first pass if that reduces migration friction
- [ ] Rename/repurpose the displayed system as `Optimisations`, but keep store-level migration pragmatic
- [ ] Add an explicit global unlock helper based on `prestigeCount >= 1`
- [ ] Keep `100` as the max rank for every optimisation in this phase
- [ ] Use the broad optimisation ids from the doc as the new source of truth

## Approved Optimisation Categories

- [ ] `desk`
- [ ] `research`
- [ ] `automation`
- [ ] `governance`

## Approved Optimisation Ids

- [ ] `manualExecutionRefinement`
- [ ] `humanDeskTuning`
- [ ] `institutionalProcessRefinement`
- [ ] `sectorAllocationEfficiency`
- [ ] `researchThroughput`
- [ ] `trainingMethodology`
- [ ] `analyticalModeling`
- [ ] `executionStackTuning`
- [ ] `modelEfficiency`
- [ ] `computeOptimization`
- [ ] `signalQualityControl`
- [ ] `complianceSystems`
- [ ] `filingEfficiency`
- [ ] `policyReach`
- [ ] `institutionalAccess`

## 1. Type Redesign

- [ ] Replace current `RepeatableUpgradeId` union in `src/types/game.ts` with the new 15 optimisation ids
- [ ] Replace old repeatable families with the new category model
- [ ] Update repeatable/optimisation definition typing to match Phase 12 fields more closely:
  - `category`
  - `currency`
  - `maxRank`
  - `perRankDescription`
  - `baseCost`
  - `scalingFactor`
  - `unlockConditionDescription`
- [ ] Decide whether to rename type aliases from `RepeatableUpgrade*` to `Optimisation*` now or in a later cleanup pass
- [ ] Recommended default: keep internal type names stable only if renaming would create excessive churn, but align data and UI language to Optimisations

## 2. Full Data Replacement

- [ ] Replace `src/data/repeatableUpgrades.ts` with the new 15 optimisations
- [ ] Add exact category/currency/cost/rank definitions for all 15
- [ ] Keep all max ranks at `100`
- [ ] Set unlock condition descriptions to the new source-of-truth copy

## 3. Global Unlock Rule

- [ ] Add helper for global optimisations unlock:
  - unlocked once `prestigeCount >= 1`
- [ ] Ensure all optimisation visibility/unlock logic respects that gate first
- [ ] Add visible locked messaging in the UI before Prestige 1

## 4. Per-Optimisation Unlock Rules

- [ ] Rebuild unlock logic around broad current-run system checks only

### Desk
- [ ] `manualExecutionRefinement` -> Prestige 1 only
- [ ] `humanDeskTuning` -> at least 1 human unit active
- [ ] `institutionalProcessRefinement` -> institution systems active
- [ ] `sectorAllocationEfficiency` -> sectors active

### Research
- [ ] `researchThroughput` -> research active
- [ ] `trainingMethodology` -> specializations or mandates active
- [ ] `analyticalModeling` -> automation strategy systems active

### Automation
- [ ] `executionStackTuning` -> automation active
- [ ] `modelEfficiency` -> automation active
- [ ] `computeOptimization` -> machine systems active
- [ ] `signalQualityControl` -> at least 1 automation strategy unlocked

### Governance
- [ ] `complianceSystems` -> compliance visible
- [ ] `filingEfficiency` -> compliance visible
- [ ] `policyReach` -> lobbying active
- [ ] `institutionalAccess` -> institution systems active

## 5. Migration Strategy

- [ ] Update save normalization in `src/utils/persistence.ts`
- [ ] Map old granular repeatables into the new broader optimisations where reasonable
- [ ] Recommended migration examples:
  - `manualTradeRefinement` -> `manualExecutionRefinement`
  - `internDeskTraining` + `juniorTraderTraining` + `seniorDeskPerformance` -> `humanDeskTuning`
  - `propDeskScaling` + `institutionalDeskCoordination` + `hedgeFundExecution` + `investmentFirmOperations` -> `institutionalProcessRefinement`
  - `researchEndowments` / scientist throughput lines -> `researchThroughput`
  - `ruleBasedExecution` + `mlModelDeployment` + `aiClusterOrchestration` -> `executionStackTuning`
  - `energyOptimization` + `serverEfficiency` -> `computeOptimization`
  - `politicalNetworking` + `constituencyResearch` -> `policyReach`
- [ ] Decide merge behavior where multiple old ranks feed one new optimisation
- [ ] Recommended default: use a conservative max-or-average mapping, not raw summation, to avoid inflating migrated saves too much

## 6. Cost and Rank Helpers

- [ ] Replace old repeatable cost helper assumptions with the new broad optimisation definitions
- [ ] Keep cost formula:
  - `floor(baseCost * scalingFactor ** currentRank)`
- [ ] Enforce `100` max rank in purchase logic
- [ ] Update any bulk/max-buy logic if still retained
- [ ] Decide whether `x5/x10/max` buying remains appropriate under the new model
- [ ] Recommended default: keep it if it still feels good, but verify it does not trivialize early optimisation pacing

## 7. Purchase Action Refactor

- [ ] Update repeatable/optimisation purchase logic in `src/store/gameStore.ts`
- [ ] Ensure purchase action:
  - checks global unlock
  - checks per-optimisation unlock
  - checks rank cap
  - spends the correct currency
  - increments the rank

## 8. Effect Helper Refactor

- [ ] Replace the current scattered granular repeatable helpers with broad optimisation helpers
- [ ] Add helpers in `src/utils/economy.ts`, `src/utils/automation.ts`, and `src/utils/compliance.ts` or a dedicated `src/utils/optimisations.ts`

### Desk helpers
- [ ] `getManualExecutionOptimisationMultiplier`
- [ ] `getHumanDeskOptimisationMultiplier`
- [ ] `getInstitutionOptimisationMultiplier`
- [ ] `getSectorAllocationOptimisationMultiplier`

### Research helpers
- [ ] `getResearchOptimisationMultiplier`
- [ ] `getTrainingMethodologyMultiplier`
- [ ] `getAnalyticalModelingMultiplier`

### Automation helpers
- [ ] `getAutomationPayoutOptimisationMultiplier`
- [ ] `getAutomationCycleDurationModifier`
- [ ] `getMachinePowerUsageModifier`
- [ ] `getSignalQualityMultiplier`

### Governance helpers
- [ ] `getComplianceBurdenModifier`
- [ ] `getComplianceCostModifier`
- [ ] `getInfluenceOptimisationMultiplier`
- [ ] `getInstitutionalComplianceModifier`

## 9. Formula Integration Pass

- [ ] Patch manual trading formulas in `src/utils/economy.ts`
- [ ] Patch human output formulas in `src/utils/economy.ts`
- [ ] Patch institution output formulas in `src/utils/economy.ts`
- [ ] Patch sector-assigned output formulas in `src/utils/economy.ts`
- [ ] Patch research production formulas in `src/utils/economy.ts`
- [ ] Patch specialist and mandate effectiveness flows
- [ ] Patch automation payout formulas in `src/utils/automation.ts`
- [ ] Patch automation cycle duration logic
- [ ] Patch machine power usage logic
- [ ] Patch strategy effectiveness logic
- [ ] Patch compliance burden/cost logic in `src/utils/compliance.ts`
- [ ] Patch influence generation logic
- [ ] Patch institutional friction/compliance logic

## 10. UI Refactor - Optimisations Tab

- [ ] Rebuild `src/components/dashboard/OptimizationsTab.tsx` around the 4 approved categories
- [ ] Update top summary to show:
  - Optimisations unlocked yes/no
  - total optimisation ranks purchased
  - current Cash
  - current Research Points
  - current Influence
- [ ] Replace old section headers with:
  - Desk Optimisations
  - Research Optimisations
  - Automation Optimisations
  - Governance Optimisations

## 11. Card Content Requirements

- [ ] Each optimisation card should show:
  - name
  - category
  - currency
  - rank `X / 100`
  - effect per rank
  - current total effect
  - next rank cost
  - unlock condition if locked
  - buy button
- [ ] Keep cards scannable and avoid the older overly granular/unit-specific language

## 12. Locked-State UX

- [ ] Add clear global locked messaging before Prestige 1
- [ ] Add exact locked reasons for each optimisation based on current-run system presence
- [ ] Make sure locked text never implies the optimisation itself unlocks the system

## 13. Selectors Update

- [ ] Update selectors in `src/store/selectors.ts` for the new optimisation ids
- [ ] Add/selectors for:
  - global unlocked state
  - total optimisation ranks purchased
  - optimisation rank by id
  - optimisation cost by id
  - optimisation unlock state by id
  - affordability by id
  - currency shortfall by id

## 14. Balance Pass

- [ ] Verify early ranks feel accessible after Prestige 1
- [ ] Verify rank 10-20 feels meaningful but not trivial
- [ ] Verify rank 30-50 feels expensive but still usable
- [ ] Verify rank 70-100 acts like a true endgame sink
- [ ] Check broad optimisations do not eclipse upgrades, prestige, or lobbying

## 15. Validation

- [ ] Verify optimisations remain locked before Prestige 1
- [ ] Verify exactly 15 optimisations exist after replacement
- [ ] Verify all optimisations cap at rank 100
- [ ] Verify all three currencies have meaningful sinks
- [ ] Verify migrated saves do not get wildly inflated ranks
- [ ] Verify old granular repeatable ids are no longer used in active gameplay logic
- [ ] Run final checks:
  - `npm run typecheck`
  - `npm run build`

## Recommended Implementation Order

- [ ] 1. Replace repeatable id/type/data structure with the 15 new optimisations
- [ ] 2. Add global unlock rule and per-optimisation unlock logic
- [ ] 3. Patch migration from old granular repeatables to new broad ones
- [ ] 4. Refactor effect helpers and hook them into economy/automation/compliance/influence flows
- [ ] 5. Rebuild the Optimisations tab UI and locked-state messaging
- [ ] 6. Run balancing and validation passes
