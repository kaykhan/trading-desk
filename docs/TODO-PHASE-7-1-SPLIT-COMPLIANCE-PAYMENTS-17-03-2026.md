# TODO - Phase 7.1 Split Compliance Payments - 17-03-2026

This follow-up adapts the current Phase 7 implementation into a two-layer compliance system:

- ongoing `Compliance Burden` remains the background efficiency drag
- timed category payments become the interactive management mechanic

Status legend:

- [ ] not started
- [~] partial / needs follow-up
- [x] done

## Goal

Refactor Compliance so the player manages four separate recurring payment categories while firm scale still creates a separate always-on burden penalty.

The two layers should remain distinct:

- `Burden` = ongoing structural regulatory pressure that reduces effective output
- `Payments` = category-specific dues that the player can pay, delay, automate later, and strategically manage

## Design Lock

- [ ] Keep `Compliance Burden` as a global always-on metric
- [ ] Keep burden-derived efficiency loss global and separate from payment status
- [ ] Replace the single review due amount with four category dues:
  - `staff`
  - `energy`
  - `automation`
  - `institutional`
- [ ] Give each category its own due amount, status, and `Pay Now` action
- [ ] Keep one shared review timer for the first pass, rather than separate timers per category
- [ ] When the review triggers, unpaid category dues remain outstanding instead of being collapsed into one invisible payment result
- [ ] Unpaid category dues should create category-specific penalties rather than replacing the burden system
- [ ] Keep auto-pay simple for first pass:
  - either global auto-pay remains temporary
  - or remove auto-pay until per-category auto-pay exists
- [ ] Build the UI so per-category auto-pay can be added later without redesigning the tab

## Player Experience Target

- [ ] The player can immediately understand:
  - what burden is doing
  - what each category currently owes
  - what happens if a category is left unpaid
- [ ] The tab should feel operational, not abstract
- [ ] The player should be able to make meaningful tradeoffs:
  - pay Staff first
  - delay Energy
  - prioritize Automation
  - let Institutional costs slide temporarily

## Core System Split

### 1. Burden Layer

- [ ] Keep burden sources broadly as they are now:
  - staff scale
  - institutions
  - automation
  - market exposure
  - energy footprint
- [ ] Keep one derived `complianceBurden`
- [ ] Keep one derived global efficiency multiplier from burden
- [ ] Ensure paying category dues does not directly erase burden
- [ ] Prepare future hooks for lobbying relief:
  - base burden
  - burden relief
  - effective burden

### 2. Payment Layer

- [ ] Introduce per-category due state
- [ ] Track whether each category is:
  - current
  - due
  - overdue
  - paid for this cycle
- [ ] Keep category dues visible at all times in the Compliance tab
- [ ] Make category payment actions immediate and clear

## State Model Changes

- [ ] Remove or phase out single `complianceReviewDueAmount`
- [ ] Add category payment state in `src/types/game.ts`, for example:
  - `compliancePayments.staff.dueAmount`
  - `compliancePayments.energy.dueAmount`
  - `compliancePayments.automation.dueAmount`
  - `compliancePayments.institutional.dueAmount`
  - `compliancePayments.<category>.status`
  - `compliancePayments.<category>.lastPayment`
- [ ] Decide whether category status is stored as enum-like string values:
  - `current`
  - `due`
  - `overdue`
- [ ] Keep one shared `complianceReviewRemainingSeconds`
- [ ] Keep `lastCompliancePayment` only if a global summary is still useful; otherwise replace with per-category last payment data
- [ ] Decide whether global auto-pay survives this pass or is removed pending per-category automation

## Persistence and Migration

- [ ] Add default category payment state in `src/data/initialState.ts`
- [ ] Migrate older saves from:
  - single `complianceReviewDueAmount`
  - no category statuses
  into the new per-category shape in `src/utils/persistence.ts`
- [ ] If needed, map the old global due amount into fresh per-category dues based on current formulas
- [ ] Preserve backward compatibility for current Phase 7 saves

## Compliance Helper Refactor

- [ ] Extend `src/utils/compliance.ts` with category-payment helpers
- [ ] Keep existing burden helpers intact where possible
- [ ] Add category due helpers:
  - `getStaffComplianceDue(state)`
  - `getEnergyComplianceDue(state)`
  - `getAutomationComplianceDue(state)`
  - `getInstitutionalComplianceDue(state)`
- [ ] Add category status helpers:
  - `getComplianceCategoryStatus(state, category)`
  - `isComplianceCategoryOverdue(state, category)`
- [ ] Add payment action helpers:
  - `payComplianceCategoryNow(state, category)`
  - `refreshComplianceCycleDues(state)`
- [ ] Add summary helper:
  - `getTotalOutstandingComplianceDue(state)`

## Timer and Review Cycle Rules

- [ ] Keep one review timer for first pass
- [ ] When timer reaches zero:
  - mark any unpaid categories as `due` or `overdue`
  - refresh next-cycle category amounts if needed
  - reset timer only according to the chosen due-cycle rules
- [ ] Decide exact cycle behavior before coding:
  - Option A: review fires, unpaid categories become overdue, timer resets immediately for next cycle
  - Option B: review fires, timer pauses until all current dues are settled
- [ ] Recommended default: Option A, because it keeps pressure continuous and incremental-friendly
- [ ] Ensure long offline windows can process multiple cycles without corrupting category dues

## Category-Specific Penalties

- [ ] Add targeted unpaid penalties that stack with burden-derived efficiency loss

### Staff Compliance
- [ ] Unpaid staff compliance should affect human systems only
- [ ] Candidate penalties:
  - reduce human trading output
  - reduce research staff efficiency
  - slightly worsen staffing/training effectiveness later

### Energy Compliance
- [ ] Unpaid energy compliance should affect power/machine systems
- [ ] Candidate penalties:
  - worsen machine efficiency
  - amplify power-related drag
  - reduce effective infrastructure utilization

### Automation Compliance
- [ ] Unpaid automation compliance should affect bot systems only
- [ ] Candidate penalties:
  - reduce automation payouts
  - slow automation cycle effectiveness
  - hit higher-tier bots harder later if desired

### Institutional Compliance
- [ ] Unpaid institutional compliance should affect desks/funds/firms only
- [ ] Candidate penalties:
  - reduce institutional output
  - reduce mandate effectiveness later if needed

## Economy Integration

- [ ] Keep burden efficiency integrated in:
  - `src/utils/economy.ts`
  - `src/utils/automation.ts`
- [ ] Add category-specific unpaid penalties to the correct output paths
- [ ] Ensure penalties are scoped, not global, for example:
  - Staff unpaid does not crush automation directly
  - Energy unpaid does not directly reduce interns unless routed through machine efficiency intentionally

## Selector Layer

- [ ] Replace the current single projected bill selector model with category-aware selectors
- [ ] Add selectors for:
  - each category due amount
  - each category status
  - each category last payment
  - total outstanding due
  - whether any category is overdue
  - review timer label
  - burden / effective efficiency / drag

## UI Refactor - Compliance Tab

- [ ] Keep the top summary row but revise it to:
  - `Compliance Burden`
  - `Effective Efficiency`
  - `Total Due`
  - `Next Review`
- [ ] Replace the current passive category breakdown with interactive category cards or rows

### Each category card should show
- [ ] category name
- [ ] due amount
- [ ] status
- [ ] penalty hint if unpaid
- [ ] `Pay Now` button
- [ ] future slot for per-category auto-pay

### Keep below the action layer
- [ ] top burden sources
- [ ] actionable compliance readout
- [ ] future lobbying relief block

## UI Copy

- [ ] Distinguish clearly between:
  - burden
  - efficiency drag
  - outstanding dues
  - next review
- [ ] Make category rows feel like operational oversight, not taxes pasted onto the UI
- [ ] Good naming target:
  - `Staff Compliance`
  - `Energy Compliance`
  - `Automation Compliance`
  - `Institutional Compliance`

## Rollout Recommendation

- [ ] Phase 7.1A:
  - implement full four-category system in code and UI
  - keep penalties modest and readable
- [ ] Phase 7.1B balance pass:
  - make Staff matter first
  - Energy matter next
  - Automation matter mid-game
  - Institutional matter late and heavily
- [ ] Phase 7.1C future:
  - add per-category auto-pay
  - add lobbying relief comparison block
  - add base vs relief vs effective burden display

## Validation

- [ ] Verify burden still applies even when all category dues are fully paid
- [ ] Verify each category `Pay Now` action only settles that category
- [ ] Verify category-specific unpaid penalties hit the correct systems
- [ ] Verify total outstanding due updates correctly after partial payments
- [ ] Verify timer/review behavior is understandable when some categories remain unpaid
- [ ] Verify offline processing does not lose category debt state
- [ ] Verify old saves migrate safely
- [ ] Run final checks:
  - `npm run typecheck`
  - `npm run build`

## Recommended Implementation Order

- [ ] 1. Lock cycle behavior and whether global auto-pay remains temporarily
- [ ] 2. Add new state shape and persistence migration
- [ ] 3. Refactor compliance helpers for per-category dues and statuses
- [ ] 4. Add category-specific unpaid penalties to economy/automation helpers
- [ ] 5. Refactor Compliance tab into interactive category cards
- [ ] 6. Run balance and validation passes
