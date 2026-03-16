# Stock Incremental Game — Phase 1 Revised Design Document

## Scope
This document replaces the earlier Phase 1 framing with a revised, more onboarding-friendly version.

It covers:
- **Market Sectors**
- **Assignment / Allocation**
- **General Desk baseline production**
- **Revised UI structure for buying staff and assigning staff**

This revised version is intended to reduce early complexity while still introducing the strategic sector system.

---

## 1. Phase 1 Goal
The goal of Phase 1 is to introduce sectors as a strategic layer **without making assignment mandatory for basic progression**.

The player should be able to:
- buy staff normally
- continue earning money even if they do not immediately understand sectors
- later assign staff into sectors for better returns via multipliers

### Core philosophy
Sectors should feel like an **upgrade path**, not a punishment.

That means staff should still be useful when unassigned.

---

## 2. Core Rule Change
### Previous harsher model
Only assigned units produce.

### Revised approved model
**Interns, Junior Traders, and Senior Traders produce by default on the General Desk even when unassigned.**

When assigned to a sector:
- their production is removed from the General Desk pool
- their production is moved into that sector
- the sector applies its multiplier and later bonuses

This is now the preferred Phase 1 model.

---

## 3. Why This Revision Is Better
This revised structure improves onboarding because:
- the player does not lose income just because they have not learned sectors yet
- sectors feel like an optional strategic upgrade
- the player can engage with assignment when ready
- the game avoids a sudden complexity wall

### Intended player feeling
- “My staff still work by default.”
- “Assigning them to sectors gives me a better return.”

That is much more intuitive and forgiving.

---

# PART I — MARKET SECTORS

## 4. Market Sectors System Role
Market Sectors add a strategic allocation layer to the game.

Instead of all staff remaining forever in one generic money source, the player can move staff into specific sectors to benefit from sector multipliers and later synergies.

### Suggested initial sectors
- **Finance**
- **Technology**
- **Energy**

These are enough for the first implementation.

---

## 5. Sector Design Requirements
Each sector should have:
- an id
- a name
- a base production multiplier
- a description
- an unlock condition

### Suggested initial data shape
```ts
export type SectorId = 'finance' | 'technology' | 'energy';

type SectorDefinition = {
  id: SectorId;
  name: string;
  baseProfitMultiplier: number;
  description: string;
};
```

### Example starting values
```ts
finance: {
  id: 'finance',
  name: 'Finance',
  baseProfitMultiplier: 1.0,
  description: 'Stable core financial market activity.',
}
technology: {
  id: 'technology',
  name: 'Technology',
  baseProfitMultiplier: 1.1,
  description: 'Higher growth and strong future automation synergy.',
}
energy: {
  id: 'energy',
  name: 'Energy',
  baseProfitMultiplier: 0.95,
  description: 'Steady output and future power-related synergy.',
}
```

These are balance placeholders only.

---

## 6. Sector Unlock Rules
For the first pass:
- **Finance** unlocked by default
- **Technology** unlocked by simple research/milestone flag
- **Energy** unlocked by simple research/milestone flag

This keeps Phase 1 light while preserving future research integration.

---

# PART II — GENERAL DESK MODEL

## 7. General Desk Role
The **General Desk** is the default destination for unassigned human staff.

### Rule
If a human staff unit is unassigned, it works on the General Desk and still produces money.

### Human units in Phase 1
- **Interns**
- **Junior Traders**
- **Senior Traders**

This is the baseline production pool.

---

## 8. General Desk Production
Unassigned human staff generate income through the General Desk with no sector multiplier.

### Formula concept
```text
generalDeskCashPerSecond =
  unassignedInterns * internOutput
  + unassignedJuniors * juniorOutput
  + unassignedSeniors * seniorOutput
```

This means the player never feels punished for not using sectors immediately.

---

## 9. Sector Assignment Effect
When a human unit is assigned to a sector:
- it stops contributing to General Desk production
- it starts contributing to that sector’s production instead
- that sector’s multiplier applies

### Example
If a Junior Trader is moved from the General Desk to Technology:
- it no longer contributes base output in the General Desk pool
- it now contributes base output × Technology multiplier in the Technology sector pool

This is the core strategic tradeoff.

---

# PART III — ASSIGNMENT / ALLOCATION SYSTEM

## 10. Why Allocation Exists
Once sectors exist, the player needs a way to choose where staff work.

However, because of the General Desk model, allocation is now an **optimization layer** rather than a required maintenance chore.

That is the intended design outcome.

---

## 11. Allocatable Human Units in Phase 1
Phase 1 should support allocation for:
- **Interns**
- **Junior Traders**
- **Senior Traders**

This reflects the latest UI and gameplay direction.

Bots may be added to sector allocation later, but the revised human-first version should be the focus of the first implementation pass unless bot assignment already exists cleanly in the build.

---

## 12. Assignment Integrity Rules
The system must enforce:
- assigned units cannot exceed owned units
- assigned units cannot go below zero
- locked sectors cannot receive assignments

### Required invariant
For each human unit type:

```ts
sum(assignmentsBySector) <= ownedCount
```

### Available count
For each unit type:

```ts
available = owned - assigned
```

This value is critical to the UI.

---

## 13. Example
The player owns:
- 6 Interns
- 4 Junior Traders
- 2 Senior Traders

Assignments:
- Finance: 2 Interns, 1 Junior
- Technology: 1 Junior, 1 Senior
- Energy: 1 Intern

Then the General Desk has remaining:
- Interns available on General Desk: 3
- Juniors available on General Desk: 2
- Seniors available on General Desk: 1

Those remaining units still generate General Desk income.

---

# PART IV — PRODUCTION MODEL

## 14. General Desk Formula
```text
generalDeskCashPerSecond =
  unassignedInterns * internOutput
  + unassignedJuniors * juniorOutput
  + unassignedSeniors * seniorOutput
```

## 15. Sector Formula
For each unlocked sector:

```text
sectorCashPerSecond =
  (
    assignedInterns * internOutput
    + assignedJuniors * juniorOutput
    + assignedSeniors * seniorOutput
  )
  * sectorBaseMultiplier
  * globalMultipliers
  * prestigeMultipliers
```

### Note
The General Desk should also receive global and prestige multipliers if those normally apply to all income.

So final implementation should conceptually be:

```text
totalCashPerSecond =
  (generalDeskCashPerSecond * globalMultipliers * prestigeMultipliers)
  + sum(all sectorCashPerSecond)
```

---

## 16. Why This Model Works
This creates a very readable strategy loop:
- keep units unassigned for safe baseline production
- move units into sectors when sector multipliers make it worthwhile

So sectors become a layer of strategic optimization rather than a hard dependency.

---

# PART V — UI STRUCTURE

## 17. Approved UI Structure for Phase 1
The UI should now be split more clearly into:

### Staff / Trading Tab
Where the player **buys** human staff.

### Sectors Tab
Where the player **assigns** owned human staff into sectors.

This is the approved direction.

---

## 18. Staff / Trading Tab Role
This tab is responsible for acquisition.

It should allow the player to buy:
- **Interns**
- **Junior Traders**
- **Senior Traders**

### What it should show
For each unit type:
- owned count
- assigned count
- available count
- purchase controls
- next cost

This keeps the player aware of both ownership and deployment status without leaving the tab.

---

## 19. Sectors Tab Role
This tab is responsible for deployment.

It should show:
- unlocked sectors
- sector multipliers
- current production per sector
- available Interns to assign
- available Junior Traders to assign
- available Senior Traders to assign
- current assignments by sector

This is where the player actively decides where people work.

---

## 20. Sectors Tab Top Summary
The top of the Sectors tab should show a global availability summary.

Example:
- Interns: **10 owned / 4 assigned / 6 available**
- Junior Traders: **8 owned / 5 assigned / 3 available**
- Senior Traders: **3 owned / 2 assigned / 1 available**

This is important because the player should not have to do subtraction mentally.

---

## 21. Sector Card Layout
Each unlocked sector card should show:
- sector name
- sector multiplier
- current cash/sec from that sector
- assignment controls for each human unit type

### Example controls per row
For Interns:
- assigned count
- `-1`
- `+1`
- `Max`
- `Clear`

Repeat for Junior Traders and Senior Traders.

This is a safe, simple first implementation.

---

## 22. General Desk Visibility in UI
The General Desk should be visible in the UI, not hidden.

### Why
If unassigned staff still produce, the player needs to understand where that money is coming from.

### Recommended display
On the Sectors tab or in a summary panel, show:
- **General Desk Cash/sec**
- count of unassigned Interns
- count of unassigned Juniors
- count of unassigned Seniors

This makes the default production pool visible and understandable.

---

## 23. Staff Tab Summary Recommendation
The Staff / Trading tab should also show a compact assignment summary.

For each unit type:
- Owned
- Assigned
- Available

This reduces tab switching friction and helps the player know whether buying more staff is useful.

---

# PART VI — STATE MODEL

## 24. Revised GameState Additions
Suggested state additions:

```ts
unlockedSectors: Record<SectorId, boolean>;

sectorAssignments: {
  intern: Record<SectorId, number>;
  juniorTrader: Record<SectorId, number>;
  seniorTrader: Record<SectorId, number>;
};
```

### Notes
- These assignments track only sector placements.
- Unassigned units are automatically considered part of the General Desk pool.

---

## 25. Derived Values
These should be computed through selectors, not stored directly.

Suggested derived values:

```ts
assignedInterns
assignedJuniors
assignedSeniors

availableInterns
availableJuniors
availableSeniors

generalDeskCashPerSecond
sectorCashPerSecond(sectorId)
totalCashPerSecond
```

---

# PART VII — ACTIONS AND SELECTORS

## 26. Store Actions
Suggested actions:

```ts
unlockSector(sectorId)
assignUnitToSector(unitType, sectorId, amount)
unassignUnitFromSector(unitType, sectorId, amount)
clearSectorAssignments(unitType, sectorId)
assignMaxToSector(unitType, sectorId)
```

### Recommendation
Use step-based controls instead of freeform numeric input for first implementation.

---

## 27. Selectors
Suggested selectors:

```ts
getAssignedCount(state, unitType)
getAssignedCountForSector(state, unitType, sectorId)
getAvailableCount(state, unitType)
getGeneralDeskCashPerSecond(state)
getSectorCashPerSecond(state, sectorId)
getSectorBreakdown(state)
getUnlockedSectors(state)
```

These should drive both calculations and UI.

---

# PART VIII — SAVE / LOAD

## 28. Save / Load Requirements
The save system must include:

```ts
unlockedSectors
sectorAssignments
```

### Migration defaults for older saves
```ts
unlockedSectors = {
  finance: true,
  technology: false,
  energy: false,
}

sectorAssignments = {
  intern: { finance: 0, technology: 0, energy: 0 },
  juniorTrader: { finance: 0, technology: 0, energy: 0 },
  seniorTrader: { finance: 0, technology: 0, energy: 0 },
}
```

This ensures compatibility.

---

# PART IX — TESTING

## 29. Testing Goals
Phase 1 should now prove:
- the player can ignore sectors initially and still progress
- the player understands that sectors improve returns rather than enable basic production
- available vs assigned counts are clear
- General Desk production is visible and understandable
- moving staff into sectors changes output in intuitive ways
- tab structure makes sense for buying vs deploying staff

---

# PART X — FINAL SUMMARY

## 30. Final Approved Phase 1 Model
The revised Phase 1 model is:

- the player buys **Interns**, **Junior Traders**, and **Senior Traders** in the **Staff / Trading** tab
- unassigned human staff work on the **General Desk** and still produce money
- the player uses the **Sectors** tab to move staff into unlocked sectors
- sector-assigned staff stop contributing to the General Desk and instead contribute to the selected sector’s production
- sectors apply multipliers and later become the basis for specialization, events, and deeper strategy

This is the approved onboarding-friendly version of Phase 1 and should replace the earlier harsher interpretation where unassigned units produced nothing.

