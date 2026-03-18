# Stock Incremental Game — Phase 4A: People Specialization

## Purpose
This document isolates the **people-tier** portion of Phase 4 so it can stand alone cleanly.

Phase 4A applies only to:
- **Intern**
- **Junior Trader**
- **Senior Trader**

These are treated as individual people who can be trained into sector specialists.

This document exists because the broader combined Phase 4 now also includes organizational mandates, and separating them improves implementation clarity.

---

## Core Design Rule
**People tiers use Research-unlocked training-based specialization, and matching sector assignment grants a bonus.**

---

## Included Systems
- specialist training unlocks through Research
- sector-based specialization types
- Cash-based training actions
- grouped specialist counts
- specialist assignment to sectors
- matching-sector output bonuses

---

## Initial Specialization Types
- **Finance Specialist**
- **Technology Specialist**
- **Energy Specialist**

These map directly to the current initial sector set.

---

## Unit Eligibility
### Included in first implementation
- **Junior Trader**
- **Senior Trader**

### Interns
Interns remain part of the people tier conceptually, but for implementation simplicity they should remain **generic in the first pass** unless explicitly expanded later.

This preserves the original human-tier identity without bloating the first implementation.

---

## Research Unlocks
These should live in the **Human Capital** branch.

- `financeSpecialistTraining`
- `technologySpecialistTraining`
- `energySpecialistTraining`

Suggested prerequisite:
- `foundationsOfFinanceTraining`

---

## Training Rule
Training converts generic owned traders into specialist counts.

### Suggested first-pass training costs
- Junior specialization: **$500** per unit
- Senior specialization: **$2,000** per unit

---

## Bonus Rules
- Junior matching sector bonus: **+10%**
- Senior matching sector bonus: **+20%**
- mismatch: **no bonus, no penalty**

---

## State Model
```ts
traderSpecialists: {
  juniorTrader: Record<TraderSpecializationId, number>;
  seniorTrader: Record<TraderSpecializationId, number>;
};
```

### Derived counts
```ts
genericJuniorCount = juniorTraderCount - totalJuniorSpecialists
genericSeniorCount = seniorTraderCount - totalSeniorSpecialists
```

---

## Assignment Model Extension
Specialist assignments should be tracked separately from generic assignments.

```ts
sectorAssignments: {
  juniorTrader: Record<SectorId, number>;
  seniorTrader: Record<SectorId, number>;

  juniorTraderSpecialists: Record<SectorId, Record<TraderSpecializationId, number>>;
  seniorTraderSpecialists: Record<SectorId, Record<TraderSpecializationId, number>>;
};
```

---

## Actions
```ts
trainJuniorSpecialist(specializationId, amount)
trainSeniorSpecialist(specializationId, amount)
```

---

## Selectors
```ts
getTotalJuniorSpecialists(state)
getTotalSeniorSpecialists(state)
getGenericJuniorCount(state)
getGenericSeniorCount(state)
getSpecialistSectorBonus(unitType, specializationId, sectorId)
```

---

## UI Requirements
### Staff / Trading tab
Add a **Training** section that shows:
- training unlock state
- specialist counts
- Junior / Senior training controls

### Sectors tab
Each sector card should show:
- generic Juniors / Seniors
- specialized Juniors / Seniors by type

---

## What This Phase Should Prove
- human units become more strategically distinct
- research matters more on the human side
- sector assignment becomes more meaningful
- grouped specialist management remains understandable

---

## Final Summary
Phase 4A is the people-specialization layer.

It should be treated as the implementation source of truth for training-based specialization of Junior and Senior Traders, while keeping Interns generic in the first implementation unless expanded later.

