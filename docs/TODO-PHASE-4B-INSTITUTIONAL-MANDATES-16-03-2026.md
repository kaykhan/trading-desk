# TODO — Phase 4B Institutional Mandates — 16-03-2026

This TODO adapts `docs/stock_incremental_phase_4_b_institutional_mandates.md` to the current `Trading Desk` codebase.

Status legend:

- [ ] not started
- [~] partial / needs follow-up
- [x] done

## Phase Goal

Deliver an institutional-mandate layer where:

- Prop Desks, Institutional Desks, Hedge Funds, and Investment Firms can receive sector-aligned mandates
- mandate frameworks unlock through research
- applying a mandate spends cash and converts generic institution counts into mandate pools
- mandated assignments are tracked separately from generic institution assignments
- matching-sector assignment grants a mandate bonus and mismatch has no penalty

## Current Repo Reality

- [x] institution tiers already exist: `propDesk`, `institutionalDesk`, `hedgeFund`, `investmentFirm`
- [x] these unit tiers currently have no sector assignment model at all
- [x] only human people tiers currently assign into sectors
- [x] higher institution units currently contribute only to general income, not sector-specific breakdowns
- [x] the current branch structure already includes `regulation` as a likely home for mandate framework research

## Recommended Design Lock

- [ ] Add 3 mandate types:
  - `finance`
  - `technology`
  - `energy`
- [ ] Add 3 research unlocks:
  - `financeMandateFramework`
  - `techGrowthMandateFramework`
  - `energyExposureFramework`
- [ ] Place mandate frameworks in `regulation` by default
- [ ] Use `regulatoryAffairs` as the base prerequisite unless we choose a later institution-tier prerequisite
- [ ] Keep first-pass cash application costs as:
  - Prop Desk mandate: `$5,000`
  - Institutional Desk mandate: `$12,000`
  - Hedge Fund mandate: `$30,000`
  - Investment Firm mandate: `$75,000`
- [ ] Keep first-pass matching bonuses as:
  - Prop Desk: `+15%`
  - Institutional Desk: `+20%`
  - Hedge Fund: `+25%`
  - Investment Firm: `+30%`
  - mismatch: `0%`

## 1. Types and State

- [ ] Add `InstitutionalMandateId` to `src/types/game.ts`
- [ ] Decide whether to add a reusable sector-focus type shared with Phase 4A, or keep separate ids for clarity
- [ ] Add institution mandate state to `GameState`:
  - `institutionMandates.propDesk`
  - `institutionMandates.institutionalDesk`
  - `institutionMandates.hedgeFund`
  - `institutionMandates.investmentFirm`
- [ ] Extend `sectorAssignments` for institutional generic assignments:
  - `propDesk`
  - `institutionalDesk`
  - `hedgeFund`
  - `investmentFirm`
- [ ] Extend `sectorAssignments` for mandated assignment buckets:
  - `propDeskMandates`
  - `institutionalDeskMandates`
  - `hedgeFundMandates`
  - `investmentFirmMandates`

## 2. Research Tree Integration

- [ ] Extend `ResearchTechId` with:
  - `financeMandateFramework`
  - `techGrowthMandateFramework`
  - `energyExposureFramework`
- [ ] Add these framework nodes to `src/data/researchTech.ts`
- [ ] Place them in `regulation` unless a repo-level design change is made
- [ ] Add graph layout positions that keep the Regulation branch readable
- [ ] Decide whether each framework needs only `regulatoryAffairs`, or also a sector-specific prerequisite such as `technologyMarkets` / `energyMarkets`

## 3. Persistence and Migration

- [ ] Add default empty mandate state to `src/data/initialState.ts`
- [ ] Add default empty institutional assignment state to `src/data/initialState.ts`
- [ ] Update `src/utils/persistence.ts` to normalize `institutionMandates`
- [ ] Update `src/utils/persistence.ts` to normalize institutional sector assignment structures
- [ ] Preserve old saves by defaulting all new mandate state to zero

## 4. Derived Counts and Helpers

- [ ] Create mandate helpers, likely in `src/utils/mandates.ts`
- [ ] Add:
  - `getTotalMandatedPropDesks(state)`
  - `getTotalMandatedInstitutionalDesks(state)`
  - `getTotalMandatedHedgeFunds(state)`
  - `getTotalMandatedInvestmentFirms(state)`
  - `getGenericInstitutionCount(state, unitType)`
  - `getMandateCount(state, unitType, mandateId)`
  - `getMandateSectorBonus(unitType, mandateId, sectorId)`
- [ ] Add assignment helpers for mandated vs generic institutional pools

## 5. Mandate Application Actions

- [ ] Add store actions for applying mandates, likely:
  - `applyPropDeskMandate(mandateId, amount)`
  - `applyInstitutionalDeskMandate(mandateId, amount)`
  - `applyHedgeFundMandate(mandateId, amount)`
  - `applyInvestmentFirmMandate(mandateId, amount)`
- [ ] Validate mandate application requirements:
  - framework research unlocked
  - enough cash
  - enough generic institution counts remaining
- [ ] Ensure mandates convert generic owned institutions, not already-mandated ones
- [ ] Decide whether first pass supports only `1` at a time or bulk application

## 6. Institutional Assignment Actions

- [ ] Add generic institutional sector assignment actions to `GameStore`
- [ ] Add mandated institutional sector assignment actions to `GameStore`
- [ ] Mirror the ergonomic controls already used for people-sector assignment where possible
- [ ] Prevent assignment to locked sectors
- [ ] Prevent generic and mandated assignment pools from exceeding owned totals

## 7. Economy Integration

- [ ] Extend sector output in `src/utils/economy.ts` to include institution tiers
- [ ] Decide whether generic institutional assignments contribute at baseline unit output with no bonus
- [ ] Add mandated institutional assignments as sector contributors
- [ ] Apply matching bonus only when mandate matches assigned sector
- [ ] Keep mismatch with no penalty
- [ ] Ensure unassigned institutions continue contributing to general income unless explicitly assigned away
- [ ] Confirm institutional upgrade multipliers still apply before mandate bonus

## 8. Selector Refactor

- [ ] Add selectors for mandate framework unlocks
- [ ] Add selectors for generic vs mandated institution counts
- [ ] Add selectors for available institution mandate capacity
- [ ] Add selectors for assigned institutional sector totals by type and mandate
- [ ] Add selectors for institution sector output contribution if useful for the UI

## 9. Desk / Mandates UI

- [ ] Add an `Institutional Mandates` section to the Trading / Desk surface
- [ ] Show mandate framework unlock state
- [ ] Show counts by institution type and mandate type
- [ ] Add application controls for each institution tier
- [ ] Keep explanations concise and rely on info hover / confirmation details instead of bulky help cards

## 10. Sectors UI

- [ ] Extend `src/components/dashboard/SectorsTab.tsx` to support institution-sector assignment
- [ ] For each sector, show:
  - generic Prop Desk assignments
  - generic Institutional Desk assignments
  - generic Hedge Fund assignments
  - generic Investment Firm assignments
  - mandated assignments by mandate type for each institution tier
- [ ] Make matched mandate bonuses legible without overwhelming the tab
- [ ] Keep the tab streamlined and avoid reintroducing large instruction panels

## 11. Research UI Copy

- [ ] Add short branch-graph descriptions for mandate frameworks
- [ ] Add detailed "what this unlocks" descriptions in the research confirmation modal for mandate frameworks

## 12. Balance Pass

- [ ] Check whether mandate frameworks arrive at a sensible point after institutions become relevant
- [ ] Check whether application costs scale meaningfully across institution tiers
- [ ] Check whether the proposed bonuses make institution-sector specialization feel worth the extra complexity
- [ ] Check whether institutional assignments compete sensibly with keeping institutions on general income duty

## 13. Validation

- [ ] Verify old saves load with zero mandate state cleanly
- [ ] Verify mandate application cannot exceed generic owned institution count
- [ ] Verify mandated assignment cannot exceed available mandate pools
- [ ] Verify generic institutional assignment cannot exceed generic institution pools
- [ ] Verify matched mandate bonuses apply only to the correct sector
- [ ] Verify mismatched mandated assignments still function with no bonus
- [ ] Verify sector output and general income update correctly when institutions move between generic and mandated assignment pools
- [ ] Verify Sectors tab remains understandable once institution controls are added

## Recommended Implementation Order

- [ ] 1. Add mandate ids, state, and persistence defaults
- [ ] 2. Add mandate framework research nodes to the tree
- [ ] 3. Create mandate helper module and selectors
- [ ] 4. Implement mandate application actions in the store
- [ ] 5. Extend sector assignment model for institutional generic + mandated pools
- [ ] 6. Update economy calculations for institutional sector output and mandate bonuses
- [ ] 7. Add Institutional Mandates UI to Desk/Trading
- [ ] 8. Add institution assignment UI to Sectors
- [ ] 9. Run gameplay validation and tune costs/bonuses
