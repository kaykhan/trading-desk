# TODO - Phase 8 Lobbying Integration Refinement - 17-03-2026

This TODO adapts `stock_incremental_phase_8_lobbying_integration_refinement.md` to the current `Trading Desk` codebase after Phase 7 and Phase 7.1 compliance work.

Status legend:

- [ ] not started
- [~] partial / needs follow-up
- [x] done

## Phase Goal

Turn Lobbying into the player’s primary mitigation layer for compliance pressure by making purchased policies visibly reduce:

- compliance burden growth
- compliance penalty strength
- recurring compliance payment categories
- sector and system-specific regulatory friction

The core relationship should become:

- `Compliance` tab = the problem, pressure, and before/after outcomes
- `Lobbying` tab = the mitigation tools, active relief, and savings source

## Current Repo Reality

- [x] Lobbying already exists as a top-level tab in `src/components/dashboard/LobbyingTab.tsx`
- [x] Influence generation and policy purchasing already exist in `src/store/gameStore.ts`
- [x] Existing lobbying policies are still mostly old-style buffs in `src/data/lobbyingPolicies.ts`
- [x] Compliance now has:
  - burden
  - efficiency drag
  - per-category recurring payments
  - per-category overdue penalties
  - a dedicated Compliance tab
- [x] Compliance formulas currently live primarily in `src/utils/compliance.ts`
- [x] Economy and automation multipliers already route through helpers in:
  - `src/utils/economy.ts`
  - `src/utils/automation.ts`
- [x] Save state for lobbying is already sufficient; Phase 8 is mainly derived-calculation and UI work

## Design Lock For This Repo

- [ ] Keep lobbying state persistence unchanged for first pass
- [ ] Implement lobbying effects as derived relief, not new stored numeric state
- [ ] Split compliance calculations into:
  - base burden / base cost
  - lobbying relief
  - effective burden / effective cost
- [ ] Use percentage reductions for category cost relief in first pass
- [ ] Allow lobbying to mitigate both:
  - burden itself
  - the efficiency penalty strength applied after burden
- [ ] Keep market-sector relief broad in first pass, with clear room for later Finance-specific refinement
- [ ] Keep timed advocacy / campaign mechanics out of this phase

## Key Architecture Decisions

- [ ] Define a derived lobbying relief layer in one place, likely `src/utils/lobbying.ts` or inside a dedicated section in `src/utils/compliance.ts`
- [ ] Decide whether existing policy ids should be remapped to new meanings or replaced with new Phase 8 ids
- [ ] Recommended default: preserve existing ids where practical, but rewrite descriptions/effects to fit mitigation roles
- [ ] Decide whether old generic profit buffs like `capitalGainsRelief` and `marketDeregulation` should keep any upside component in addition to mitigation
- [ ] Recommended default: keep small upside only if it does not overshadow mitigation identity

## 1. Policy Data Refactor

- [ ] Review all existing policy ids in `src/types/game.ts`
- [ ] Refine `src/data/lobbyingPolicies.ts` so policies read like mitigation tools rather than generic buffs
- [ ] Update policy descriptions to explicitly state compliance relief roles
- [ ] Map track identities clearly:
  - `labor` -> staff burden/cost relief
  - `energy` -> energy burden/cost relief
  - `market` -> institutional + sector pressure relief
  - `technology` -> automation burden/cost relief
- [ ] Recommended first-pass policy remap:
  - `hiringIncentives` -> payroll / workforce filing relief
  - `deskExpansionCredits` -> staff process relief or labor filing simplification
  - `industrialPowerSubsidies` -> industrial energy relief
  - `priorityGridAccess` -> grid stabilization / infrastructure burden relief
  - `capitalGainsRelief` -> institutional reporting relief or market access streamlining
  - `marketDeregulation` -> broad market compliance relief
  - `automationTaxCredit` -> algorithmic exemptions
  - `aiInfrastructureIncentives` -> AI oversight streamlining

## 2. Relief Effect Model

- [ ] Introduce derived relief effect categories, conceptually similar to:
  - `complianceBurdenReduction`
  - `compliancePenaltyReduction`
  - `staffComplianceCostReduction`
  - `energyComplianceCostReduction`
  - `automationComplianceCostReduction`
  - `institutionalComplianceCostReduction`
  - `sectorComplianceRelief`
  - `automationOversightRelief`
  - `institutionalReportingRelief`
- [ ] Implement helper functions that aggregate relief from purchased policies
- [ ] Keep the effect system extensible for later policy additions

## 3. Base vs Effective Compliance Refactor

- [ ] Refactor compliance helpers in `src/utils/compliance.ts` to expose base values explicitly
- [ ] Add selectors/helpers for:
  - `getBaseComplianceBurden(state)`
  - `getComplianceBurdenRelief(state)`
  - `getEffectiveComplianceBurden(state)`
  - `getBaseComplianceEfficiencyMultiplier(state)`
  - `getCompliancePenaltyRelief(state)`
  - `getFinalComplianceEfficiencyMultiplier(state)`
- [ ] Ensure current game systems use effective/final values, not raw base ones
- [ ] Preserve compliance burden as the root pressure metric even after relief is applied

## 4. Base vs Effective Category Cost Refactor

- [ ] Split category cost functions into base and effective versions:
  - `getBaseStaffComplianceCost(state)`
  - `getEffectiveStaffComplianceCost(state)`
  - `getBaseEnergyComplianceCost(state)`
  - `getEffectiveEnergyComplianceCost(state)`
  - `getBaseAutomationComplianceCost(state)`
  - `getEffectiveAutomationComplianceCost(state)`
  - `getBaseInstitutionalComplianceCost(state)`
  - `getEffectiveInstitutionalComplianceCost(state)`
- [ ] Add total helpers:
  - `getTotalBaseComplianceCost(state)`
  - `getTotalEffectiveComplianceCost(state)`
  - `getTotalComplianceSavingsFromLobbying(state)`
- [ ] Ensure category dues and future cycles use effective costs, not base costs

## 5. Lobbying Relief Selectors

- [ ] Add selectors in `src/store/selectors.ts` for:
  - base burden
  - burden relief
  - effective burden
  - base efficiency
  - final efficiency
  - penalty relief
  - base/effective total projected bill
  - total lobbying savings
  - category-specific cost relief amounts
  - active relief policy summaries

## 6. Sector / System-Specific Relief Hooks

- [ ] Add broad first-pass sector compliance relief hooks, especially for market-facing exposure
- [ ] Add automation oversight relief hooks for:
  - rule-based bots
  - ML bots
  - AI bots
- [ ] Add institutional reporting relief hooks for:
  - prop desks
  - institutional desks
  - hedge funds
  - investment firms
- [ ] Keep first-pass implementation broad and stable; do not overfit per-unit exceptions yet

## 7. Compliance Formula Integration

- [ ] Patch burden formulas to subtract lobbying burden relief before efficiency loss is derived
- [ ] Patch efficiency formulas so lobbying can soften penalty strength even when burden remains
- [ ] Patch category payment cost formulas to use lobbying-adjusted effective costs
- [ ] Ensure overdue penalties remain a separate system from lobbying mitigation
- [ ] Verify lobbying does not erase compliance entirely too early

## 8. Lobbying Tab UI Refactor

- [ ] Upgrade `src/components/dashboard/LobbyingTab.tsx` top summary to show:
  - current Influence
  - base Compliance Burden
  - effective Compliance Burden
  - burden reduction from lobbying
  - base projected compliance bill
  - effective projected compliance bill
  - total savings from lobbying
- [ ] Add a stronger readout panel that explains the current biggest relief source
- [ ] Keep the tab focused on mitigation and relief, not generic buffs

## 9. Policy Card UI Requirements

- [ ] Update each Lobbying policy card to show:
  - policy name
  - track
  - influence cost
  - mitigation effect summary
  - current status
  - active savings / relief if purchased
- [ ] Add current-help messaging like:
  - `Active Savings: $18 / review`
  - `Burden Relief: -1.6`
  - `Penalty Relief: +3.0% effective efficiency`
- [ ] Keep the layout compact and readable inside the existing dashboard style

## 10. Compliance Tab UI Update

- [ ] Update `src/components/dashboard/ComplianceTab.tsx` so it shows before/after mitigation values clearly
- [ ] Add comparisons like:
  - base burden
  - lobbying relief
  - effective burden
  - base review cost
  - lobbying savings
  - effective review cost
- [ ] Add category-level savings where useful:
  - base staff cost vs effective staff cost
  - base energy cost vs effective energy cost
  - base automation cost vs effective automation cost
  - base institutional cost vs effective institutional cost
- [ ] Keep the tab legible; do not overload every card with too many rows at once

## 11. Active Relief Readability

- [ ] Make the relationship between tabs obvious:
  - Compliance shows the pain and the mitigated result
  - Lobbying shows which policies are causing the mitigation
- [ ] Add visible “without lobbying / with lobbying” comparisons
- [ ] Make savings feel immediate when a policy is purchased

## 12. Balance Pass

- [ ] Ensure Labor policies feel strongest against staff pressure
- [ ] Ensure Energy policies feel strongest against power / machine overhead
- [ ] Ensure Market policies feel strongest against institutional + sector pressure
- [ ] Ensure Technology policies feel strongest against automation burden and automation costs
- [ ] Make lobbying valuable but not mandatory too early
- [ ] Ensure automation-heavy and institution-heavy builds become more sustainable, not trivialized

## 13. Validation

- [ ] Verify purchased policies visibly reduce burden and/or category costs in real time
- [ ] Verify effective burden is always `<=` base burden
- [ ] Verify effective projected bill is always `<=` base projected bill
- [ ] Verify policy descriptions match actual implemented relief
- [ ] Verify Lobbying and Compliance tabs tell the same story from different angles
- [ ] Verify old saves load without migration issues
- [ ] Run final checks:
  - `npm run typecheck`
  - `npm run build`

## Recommended Implementation Order

- [ ] 1. Refactor policy definitions and decide policy-to-relief mapping
- [ ] 2. Add derived lobbying relief helpers and selectors
- [ ] 3. Patch compliance formulas to use base/effective flows
- [ ] 4. Upgrade Lobbying tab summaries and policy cards
- [ ] 5. Upgrade Compliance tab to show before/after mitigation
- [ ] 6. Run balancing and validation passes
