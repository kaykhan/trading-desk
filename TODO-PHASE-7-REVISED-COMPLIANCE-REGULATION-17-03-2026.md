# TODO - Phase 7 Revised Compliance and Regulation - 17-03-2026

This TODO adapts `stock_incremental_phase_7_revised_compliance_regulation_design_and_implementation.md` to the current `Trading Desk` codebase.

Status legend:

- [ ] not started
- [~] partial / needs follow-up
- [x] done

## Phase Goal

Deliver a compliance system where:

- scaling the firm creates visible regulatory pressure
- compliance burden is derived from staff, institutions, automation, sector exposure, and energy footprint
- compliance burden applies a global efficiency penalty across human, institutional, and automation output
- recurring Compliance Reviews deduct a visible compliance bill on a repeating timer
- the bill is broken into staff, energy, automation, and institutional categories
- compliance stays effectively invisible early, then becomes a real management layer later
- a dedicated `Compliance` tab explains the burden, penalty, timer, projected bill, cost breakdown, and top burden sources
- the system is structured so Phase 8 lobbying can later reduce both burden and bill categories cleanly

## Current Repo Reality

- [x] there is currently no compliance system in state, selectors, helpers, or UI
- [x] market events already add temporary cross-system pressure through centralized helpers in `src/utils/marketEvents.ts`
- [x] economy output is already centralized in `src/utils/economy.ts`
- [x] automation cycle payout is already centralized in `src/utils/automation.ts`
- [x] lobbying already exists as a separate unlocked management tab in `src/components/dashboard/LobbyingTab.tsx`
- [x] power, institutions, staff, automation, and sector assignments already exist and are good burden inputs
- [x] save migration patterns already exist in `src/utils/persistence.ts`
- [x] the current top-right management tabs are crowded: `Upgrades`, `Optimizations`, `Research`, `Lobbying`, `Prestige`, `Stats`, `Settings`

## Recommended Design Lock For This Repo

- [ ] Keep `complianceBurden` derived rather than persisted
- [ ] Persist only visibility and review-timer state for first pass:
  - `complianceVisible`
  - `complianceReviewRemainingSeconds`
  - `lastCompliancePayment`
- [ ] Keep first-pass review cadence at `60s`
- [ ] Use burden reveal threshold `>= 5` unless balance proves it too early or too late
- [ ] Apply one global compliance efficiency multiplier to all human, institutional, and automation output paths
- [ ] Do not add unpaid-review extra penalties yet; first pass should only drain cash to zero if needed
- [ ] Keep cost category math centralized in a compliance helper layer, not scattered inside UI or unrelated formulas
- [ ] Make the Compliance tab diagnostic first, not decorative: burden, penalty, timer, projected bill, sources, and last payment
- [ ] Structure lobbying integration so later policy relief can hook into burden and category-cost helpers without rework

## Open Architecture Decisions To Lock Early

- [x] Keep `Compliance` as a new top-level management tab visible from the start
- [x] Put the compact compliance summary in `HeaderStats.tsx` first
- [ ] Decide how to represent sector exposure burden in first pass:
  - unlocked sector presence only
  - assigned headcount by sector
  - cash output share by sector
- [ ] Decide whether energy burden/cost should key from `powerCapacity`, `powerUsage`, or a blend of both
- [ ] Decide whether top burden sources should show exact weighted values or ranked human-readable labels only
- [x] Compliance review should run from the start even when values are still trivial

## 1. Types and State

- [ ] Extend `GameTabId` with `compliance` if Compliance becomes a top-level tab
- [ ] Add compliance state fields in `src/types/game.ts` and `GameState`:
  - `complianceVisible`
  - `complianceReviewRemainingSeconds`
  - `lastCompliancePayment`
- [ ] Add any supporting typed structures needed for UI and selector output, for example:
  - burden source summary rows
  - compliance cost breakdown
- [ ] Keep `complianceBurden` and derived category totals out of persisted state in first pass

## 2. Defaults, Persistence, and Migration

- [ ] Add Phase 7 defaults to `src/data/initialState.ts`
- [ ] Update `src/utils/persistence.ts` to normalize:
  - `complianceVisible`
  - `complianceReviewRemainingSeconds`
  - `lastCompliancePayment`
- [ ] Default older saves to:
  - `complianceVisible = false`
  - `complianceReviewRemainingSeconds = 60`
  - `lastCompliancePayment = 0`
- [ ] Clamp invalid timer values during load
- [ ] Ensure export/import continues to validate correctly with the new shape

## 3. Compliance Helper Layer

- [ ] Add a new helper module, likely `src/utils/compliance.ts`
- [ ] Implement burden helpers:
  - `getStaffComplianceBurden(state)`
  - `getInstitutionComplianceBurden(state)`
  - `getAutomationComplianceBurden(state)`
  - `getSectorComplianceBurden(state)`
  - `getEnergyComplianceBurden(state)`
  - `getComplianceBurden(state)`
- [ ] Implement penalty helpers:
  - `getComplianceEfficiencyMultiplier(state)`
- [ ] Implement recurring-cost helpers:
  - `getStaffComplianceCost(state)`
  - `getEnergyComplianceCost(state)`
  - `getAutomationComplianceCost(state)`
  - `getInstitutionalComplianceCost(state)`
  - `getTotalComplianceCost(state)`
- [ ] Implement UI-facing helpers:
  - `isComplianceVisible(state)`
  - `getTopComplianceSources(state)`
  - `getComplianceCostBreakdown(state)`
  - `formatComplianceReviewTimer(seconds)`
- [ ] Keep formulas readable and tuneable with named constants rather than magic numbers inlined everywhere

## 4. Burden Formula Implementation

- [ ] Implement first-pass staff burden using current unit counts:
  - intern
  - junior trader
  - senior trader
- [ ] Implement first-pass institution burden using:
  - prop desk
  - institutional desk
  - hedge fund
  - investment firm
- [ ] Implement first-pass automation burden using:
  - quant trader
  - rule-based bot
  - ML bot
  - AI bot
- [ ] Implement first-pass sector burden with special attention to Finance exposure
- [ ] Implement first-pass energy burden from power infrastructure scale and/or usage
- [ ] Sum all sources into total burden
- [ ] Use the first-pass multiplier formula:
  - `Math.max(0.75, 1 - complianceBurden * 0.005)`
- [ ] Keep constants easy to rebalance after manual testing

## 5. Cost Category Implementation

- [ ] Implement first-pass staff compliance cost from staff counts
- [ ] Implement first-pass energy compliance cost from power capacity and/or usage
- [ ] Implement first-pass automation compliance cost from automation counts and tiers
- [ ] Implement first-pass institutional compliance cost from institution counts and tiers
- [ ] Expose a projected next bill total and per-category breakdown through selectors/helpers
- [ ] Keep costs visible even before the next timer tick so the player can plan around them

## 6. Visibility Trigger and Timer Rules

- [ ] Add logic so compliance becomes visible once burden reaches the chosen threshold
- [ ] Decide whether reveal is one-way persistent for the run and implement it clearly
- [ ] Count down `complianceReviewRemainingSeconds` in the main tick loop in `src/store/gameStore.ts`
- [ ] When the timer expires:
  - calculate category costs
  - deduct total from cash up to available cash
  - write `lastCompliancePayment`
  - reset timer to 60 seconds
- [ ] Ensure large tick intervals and offline progress can process multiple reviews correctly if needed
- [ ] Keep the flow deterministic and safe for save/load boundaries

## 7. Economy Integration

- [ ] Patch human and institutional output formulas in `src/utils/economy.ts` to include compliance efficiency
- [ ] Ensure sector output helpers apply the compliance multiplier centrally rather than per component card
- [ ] Patch automation payout formulas in `src/utils/automation.ts` to include compliance efficiency
- [ ] Verify manual trading remains unaffected unless the design intentionally changes later
- [ ] Keep compliance integration compatible with existing global, prestige, market event, specialization, and mandate multipliers

## 8. Selectors

- [ ] Add selectors in `src/store/selectors.ts` for:
  - `complianceVisible`
  - `complianceBurden`
  - `complianceEfficiencyMultiplier`
  - `complianceReviewRemainingSeconds`
  - `complianceReviewRemainingLabel`
  - `projectedComplianceCost`
  - `lastCompliancePayment`
  - `staffComplianceCost`
  - `energyComplianceCost`
  - `automationComplianceCost`
  - `institutionalComplianceCost`
  - `topComplianceSources`
- [ ] Keep selector outputs directly reusable by both the header summary and the main Compliance tab

## 9. UI - Top-Level Summary

- [ ] Add a compact compliance summary surface showing at least:
  - Compliance Efficiency
  - Next Review timer
- [ ] Keep it hidden until compliance is revealed unless a locked teaser is chosen intentionally
- [ ] Place it so it does not destabilize the current `Economy | Market News | Milestones` header layout
- [ ] Reuse existing terminal styling language instead of inventing a disconnected visual treatment

## 10. UI - Compliance Tab

- [ ] Add a dedicated `Compliance` management view component, likely `src/components/dashboard/ComplianceTab.tsx`
- [ ] Wire it into `src/components/GameShell.tsx`
- [ ] If gated, show a clean locked or hidden state before reveal
- [ ] The tab must show:
  - current burden
  - current efficiency multiplier
  - next review timer
  - next projected bill
  - staff compliance cost
  - energy compliance cost
  - automation compliance cost
  - institutional compliance cost
  - last compliance payment
  - top burden sources
- [ ] Make the view read like operational oversight, not an abstract formula dump

## 11. UI - Lobbying Relationship Hooks

- [ ] Update compliance helpers so future lobbying modifiers can reduce:
  - burden growth
  - efficiency penalty
  - individual compliance cost categories
- [ ] Add placeholder or explanatory copy in Compliance and/or Lobbying UI that lobbying will later mitigate compliance pressure
- [ ] Avoid fully implementing Phase 8 mitigation now, but do not hardcode formulas in a way that blocks it

## 12. Tick, Offline Progress, and Payment Safety

- [ ] Ensure compliance review processing works during normal live ticks
- [ ] Ensure offline progress applies review countdown and any due payments safely
- [ ] Verify cash can bottom at zero but never go negative from compliance review
- [ ] Verify repeated reviews during long offline windows do not corrupt timer state
- [ ] Keep `lastCompliancePayment` semantics clear when multiple reviews occur in one processing pass

## 13. Copy and Formatting

- [ ] Write player-facing burden source names and cost labels that feel institutional and readable
- [ ] Format efficiency as a percent multiplier the player can scan instantly
- [ ] Format review timer consistently, ideally `MM:SS`
- [ ] Make projected-bill language clear that it is an estimate based on current state
- [ ] Keep category naming aligned with the Phase 7 source-of-truth document

## 14. Balance Pass

- [ ] Verify compliance is negligible early and does not distract before intended reveal
- [ ] Verify the reveal threshold hits around a meaningful mid-progression milestone
- [ ] Tune burden values so the efficiency penalty is noticeable but not oppressive
- [ ] Tune category costs so the 60-second bill feels real without deleting momentum
- [ ] Check that institution-heavy, automation-heavy, and power-heavy builds feel distinct under compliance pressure
- [ ] Check whether Finance exposure creates the intended extra scrutiny without making the sector a trap

## 15. Validation

- [ ] Verify older saves load with safe compliance defaults
- [ ] Verify compliance reveal happens at the intended burden milestone
- [ ] Verify the efficiency multiplier affects human, institutional, and automation output correctly
- [ ] Verify manual trading output is unchanged in first pass
- [ ] Verify each cost category matches the expected sources
- [ ] Verify review countdown resets correctly after payment
- [ ] Verify insufficient-cash reviews drain cash to zero and do not crash or soft-lock the run
- [ ] Verify offline progress processes review timing safely
- [ ] Verify the Compliance tab remains readable on laptop and mobile widths
- [ ] Run final validation with at least:
  - `npm run typecheck`
  - `npm run build`

## Recommended Implementation Order

- [ ] 1. Add compliance state fields, defaults, and migrations
- [ ] 2. Add compliance helper and selector layer
- [ ] 3. Add visibility trigger and review timer processing
- [ ] 4. Patch economy and automation formulas with compliance efficiency
- [ ] 5. Add top-level compliance summary
- [ ] 6. Add dedicated Compliance tab UI
- [ ] 7. Run balancing and validation passes
