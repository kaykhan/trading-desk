# Stock Incremental Game — Phase 4B: Institutional Mandates

## Purpose
This document isolates the **organization-tier** portion of Phase 4 so it can stand alone cleanly.

Phase 4B applies only to:
- **Prop Desk**
- **Institutional Desk**
- **Hedge Fund**
- **Investment Firm**

These are treated as organizational entities rather than individuals.

They do not go through personal training. Instead, they receive **institutional mandates** that define their strategic market focus.

---

## Core Design Rule
**Institution tiers use Research-unlocked sector-aligned mandates, and matching sector assignment grants a bonus.**

---

## Included Systems
- mandate framework unlocks through Research
- sector-aligned mandate types
- Cash-based mandate application actions
- grouped mandate counts
- mandate assignment to sectors
- matching-sector output bonuses

---

## Initial Mandate Types
- **Finance Mandate**
- **Tech Growth Mandate**
- **Energy Exposure**

These mirror the current initial sector set.

---

## Unit Eligibility
- **Prop Desk**
- **Institutional Desk**
- **Hedge Fund**
- **Investment Firm**

These are the approved institution tiers for the first implementation.

---

## Research Unlocks
Mandate frameworks should be unlocked through Research.

Suggested unlock nodes:
- `financeMandateFramework`
- `techGrowthMandateFramework`
- `energyExposureFramework`

Suggested branch placement:
- **Regulation / Institutions** preferred
- **Markets** acceptable as fallback

---

## Mandate Application Rule
Mandates are applied to already owned generic institution counts.

### Suggested first-pass application costs
- Prop Desk mandate: **$5,000** per unit
- Institutional Desk mandate: **$12,000** per unit
- Hedge Fund mandate: **$30,000** per unit
- Investment Firm mandate: **$75,000** per unit

This represents strategic structuring rather than personal training.

---

## Bonus Rules
- Prop Desk matching sector bonus: **+15%**
- Institutional Desk matching sector bonus: **+20%**
- Hedge Fund matching sector bonus: **+25%**
- Investment Firm matching sector bonus: **+30%**
- mismatch: **no bonus, no penalty**

---

## State Model
```ts
institutionMandates: {
  propDesk: Record<InstitutionalMandateId, number>;
  institutionalDesk: Record<InstitutionalMandateId, number>;
  hedgeFund: Record<InstitutionalMandateId, number>;
  investmentFirm: Record<InstitutionalMandateId, number>;
};
```

### Derived counts
```ts
genericPropDeskCount = propDeskCount - totalPropDeskMandates
genericInstitutionalDeskCount = institutionalDeskCount - totalInstitutionalDeskMandates
genericHedgeFundCount = hedgeFundCount - totalHedgeFundMandates
genericInvestmentFirmCount = investmentFirmCount - totalInvestmentFirmMandates
```

---

## Assignment Model Extension
Mandated institution assignments should be tracked separately from generic institution assignments.

```ts
sectorAssignments: {
  propDesk: Record<SectorId, number>;
  institutionalDesk: Record<SectorId, number>;
  hedgeFund: Record<SectorId, number>;
  investmentFirm: Record<SectorId, number>;

  propDeskMandates: Record<SectorId, Record<InstitutionalMandateId, number>>;
  institutionalDeskMandates: Record<SectorId, Record<InstitutionalMandateId, number>>;
  hedgeFundMandates: Record<SectorId, Record<InstitutionalMandateId, number>>;
  investmentFirmMandates: Record<SectorId, Record<InstitutionalMandateId, number>>;
};
```

---

## Actions
```ts
assignPropDeskMandate(mandateId, amount)
assignInstitutionalDeskMandate(mandateId, amount)
assignHedgeFundMandate(mandateId, amount)
assignInvestmentFirmMandate(mandateId, amount)
```

---

## Selectors
```ts
getTotalMandatedPropDesks(state)
getTotalMandatedInstitutionalDesks(state)
getTotalMandatedHedgeFunds(state)
getTotalMandatedInvestmentFirms(state)
getGenericInstitutionCount(state, unitType)
getMandateSectorBonus(unitType, mandateId, sectorId)
```

---

## UI Requirements
### Staff / Trading tab
Add an **Institutional Mandates** section that shows:
- mandate unlock state
- mandate counts by institution type
- mandate application controls

### Sectors tab
Each sector card should show:
- generic institutional assignments
- mandated institutional assignments by mandate type

---

## What This Phase Should Prove
- institution tiers feel distinct from people tiers
- organizations are strategically directed rather than personally trained
- higher-tier human progression remains relevant and thematic
- sector assignment becomes more meaningful for large units too

---

## Final Summary
Phase 4B is the institutional-mandate layer.

It should be treated as the implementation source of truth for sector-aligned mandates applied to Prop Desk, Institutional Desk, Hedge Fund, and Investment Firm.

