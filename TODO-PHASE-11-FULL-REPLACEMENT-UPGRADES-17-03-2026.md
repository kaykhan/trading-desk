# TODO - Phase 11 Full Replacement Upgrade Sheet - 17-03-2026

This TODO adapts `stock_incremental_phase_11_full_replacement_upgrade_sheet.md` to the current `Trading Desk` codebase after prestige redesign, boosts, compliance, and lobbying integration.

Status legend:

- [ ] not started
- [~] partial / needs follow-up
- [x] done

## Phase Goal

Replace the current one-time upgrade list with a cleaner 36-upgrade framework where:

- upgrades never unlock systems directly
- research remains the unlock layer
- upgrades are one-time efficiency/functionality improvements only
- upgrades are grouped into 6 clear categories with 6 upgrades each
- upgrade effects stay mostly in the 10-25% band and reinforce active systems

## Current Repo Reality

- [x] Current one-time upgrades live in `src/data/upgrades.ts`
- [x] Current upgrade UI lives in `src/components/dashboard/UpgradesTab.tsx`
- [x] Current upgrade categories/groups are still older repo-specific groupings:
  - `tradingDesk`
  - `scientists`
  - `politics`
  - `algorithmic`
  - `infrastructure`
- [x] Current upgrade list has drifted from the new sheet:
  - too many old trading-desk upgrades
  - some upgrades still feel like system unlock bridges
  - naming and power levels do not cleanly match the replacement design
- [x] Many upgrade effects are already wired into formulas across:
  - `src/utils/economy.ts`
  - `src/utils/automation.ts`
  - `src/utils/compliance.ts`
- [x] Some current upgrade ids are deeply integrated and will need careful replacement or migration

## Design Lock For This Repo

- [ ] Fully replace the current standard upgrade sheet with the 36 approved upgrades
- [ ] Keep upgrades as one-time purchases only
- [ ] Keep research as the only system unlock layer
- [ ] Keep upgrade unlock checks based on already-existing units/systems only
- [ ] Preserve existing UI shell, but reorganize it around the 6 approved categories
- [ ] Use clear replacement ids and migrate old purchased upgrades where possible

## Approved Upgrade Categories

- [ ] `tradingDesk`
- [ ] `research`
- [ ] `institutions`
- [ ] `automation`
- [ ] `infrastructure`
- [ ] `complianceLobbying`

## 1. Type and Category Update

- [ ] Update upgrade group/category typing in `src/types/game.ts`
- [ ] Add the new group/category ids needed for the replacement sheet
- [ ] Ensure the new categories can drive clean section rendering in `UpgradesTab`

## 2. Full Upgrade Data Replacement

- [ ] Replace `src/data/upgrades.ts` with the approved 36-upgrade sheet
- [ ] Add all 6 upgrades for each category:

### Trading Desk
- [ ] `betterTerminal`
- [ ] `tradeShortcuts`
- [ ] `premiumDataFeed`
- [ ] `deskAnalytics`
- [ ] `crossDeskCoordination`
- [ ] `structuredOnboarding`

### Research
- [ ] `labAutomation`
- [ ] `researchGrants`
- [ ] `sharedResearchLibrary`
- [ ] `backtestingSuite`
- [ ] `institutionalResearchNetwork`
- [ ] `crossDisciplinaryModels`

### Institutions
- [ ] `propDeskOperatingModel`
- [ ] `institutionalClientBook`
- [ ] `fundStrategyCommittee`
- [ ] `globalDistributionNetwork`
- [ ] `institutionalOperatingStandards`
- [ ] `mandateAlignmentFramework`

### Automation
- [ ] `systematicExecution`
- [ ] `botTelemetry`
- [ ] `executionRoutingStack`
- [ ] `modelServingCluster`
- [ ] `inferenceBatching`
- [ ] `aiRiskStack`

### Infrastructure
- [ ] `rackStacking`
- [ ] `coolingSystems`
- [ ] `roomScaleout`
- [ ] `powerDistribution`
- [ ] `dataCenterFabric`
- [ ] `cloudBurstContracts`

### Compliance & Lobbying
- [ ] `policyAnalysisDesk`
- [ ] `regulatoryCounsel`
- [ ] `donorNetwork`
- [ ] `complianceSoftwareSuite`
- [ ] `governmentRelationsOffice`
- [ ] `filingAutomation`

## 3. Migration Strategy

- [ ] Update save normalization in `src/utils/persistence.ts`
- [ ] Map old purchased upgrade ids to their nearest replacements where reasonable
- [ ] Recommended migration examples:
  - `hotkeyMacros` -> `tradeShortcuts`
  - `marketScanner` -> `deskAnalytics`
  - `firmwideDeskStandards` -> `crossDeskCoordination`
  - `propDeskMandates` -> `propDeskOperatingModel`
  - `institutionalRelationships` -> `institutionalClientBook`
  - `fundOfFundsNetwork` -> `fundStrategyCommittee`
  - `globalDistribution` -> `globalDistributionNetwork`
  - `executionCluster` -> `modelServingCluster`
  - `donorRoundtables` -> `donorNetwork`
- [ ] Decide what to do with current upgrades that have no clean replacement
- [ ] Recommended default: drop unmatched old upgrades during migration rather than preserving awkward legacy effects

## 4. Formula Mapping Pass

- [ ] Audit every current `state.purchasedUpgrades.*` usage in the codebase
- [ ] Replace old upgrade effect hooks with the new approved upgrades

### Economy hooks likely needed
- [ ] manual trade value / flat click income
- [ ] human output bonuses
- [ ] scientist output bonuses
- [ ] institution output bonuses
- [ ] influence gain bonuses
- [ ] compliance burden/cost reductions

### Automation hooks likely needed
- [ ] cycle payout bonuses
- [ ] cycle duration reductions
- [ ] ML / AI performance bonuses

### Infrastructure hooks likely needed
- [ ] capacity bonuses
- [ ] machine power usage reduction

## 5. Remove Old Overlapping Effects

- [ ] Remove old upgrade effects that no longer exist in the replacement sheet
- [ ] Ensure no leftover upgrade ids remain referenced in:
  - `src/utils/economy.ts`
  - `src/utils/automation.ts`
  - `src/utils/compliance.ts`
  - `src/components/dashboard/UpgradesTab.tsx`
  - selectors or locked-reason helpers

## 6. Upgrades Tab UI Refactor

- [ ] Rebuild `src/components/dashboard/UpgradesTab.tsx` around the 6 approved categories
- [ ] Update section names and descriptions to match the replacement sheet:
  - Trading Desk Upgrades
  - Research Upgrades
  - Institution Upgrades
  - Automation Upgrades
  - Infrastructure Upgrades
  - Compliance & Lobbying Upgrades
- [ ] Remove old Scientist / Politics / Algorithmic wording where it no longer matches the new source of truth

## 7. Unlock Visibility Rules

- [ ] Ensure each upgrade uses only existing-system visibility checks
- [ ] No upgrade should unlock a new system by itself
- [ ] Use clear locked reasons in `UpgradesTab` matching the new unlock conditions
- [ ] Rebuild `getUpgradeLockedReason(...)` in `src/components/dashboard/UpgradesTab.tsx` to match the new sheet exactly

## 8. Balance Mapping by Category

### Trading Desk
- [ ] Keep early manual upgrades readable and strong for onboarding
- [ ] Make late desk upgrades reinforce human builds without invalidating prestige or lobbying effects

### Research
- [ ] Keep scientist-specific and global RP bonuses distinct
- [ ] Ensure late research upgrades support scientist-heavy builds, not just flat RP inflation

### Institutions
- [ ] Keep unit-specific institution bonuses distinct from broad institution bonuses
- [ ] Ensure mandate bonus upgrade only matters once mandates are actually active

### Automation
- [ ] Differentiate payout boosts from duration-reduction boosts clearly
- [ ] Keep AI capstone strong but not absurd when combined with boosts and prestige

### Infrastructure
- [ ] Keep capacity upgrades distinct from power-usage reduction
- [ ] Ensure infrastructure bonuses still matter after prestige and global boosts are applied

### Compliance & Lobbying
- [ ] Keep influence-side upgrades distinct from compliance-side upgrades
- [ ] Ensure these upgrades complement, but do not replace, lobbying relief and compliance systems

## 9. Selectors and Visibility Sanity Pass

- [ ] Verify `isUpgradeVisible`, `canAffordUpgrade`, and `upgradeCashShortfall` still work cleanly with the new data
- [ ] Add or adjust any helper selectors if category-specific summaries become useful

## 10. Validation

- [ ] Verify exactly 36 upgrades exist after replacement
- [ ] Verify all upgrades are one-time purchase only
- [ ] Verify no upgrade unlocks a system by itself
- [ ] Verify each upgrade appears only when the relevant system/unit already exists
- [ ] Verify all renamed/replaced upgrade effect hooks work in-game
- [ ] Verify old saves migrate safely enough for purchased upgrades
- [ ] Run final checks:
  - `npm run typecheck`
  - `npm run build`

## Recommended Implementation Order

- [ ] 1. Update upgrade categories/types and replace upgrade data
- [ ] 2. Patch migration for old purchased upgrades
- [ ] 3. Replace all old upgrade effect hooks in economy/automation/compliance logic
- [ ] 4. Rebuild Upgrades tab sections and locked reasons
- [ ] 5. Run balance and validation passes
