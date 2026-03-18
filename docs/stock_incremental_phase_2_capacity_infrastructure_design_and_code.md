# Stock Incremental Game — Phase 2 Design Document and Implementation Code

## Scope
This document covers **Phase 2 — Capacity and Infrastructure Constraints**.

It combines:
1. **Design document**
2. **Implementation/spec sheet**
3. **Code-ready examples**

Phase 2 introduces the first major physical constraint on the human side of the firm:
- **Desk Slots**
- **Office Capacity**
- **Office Expansion**
- **Floor Expansion**
- slot consumption rules for staff

This phase is intended to build directly on top of the revised Phase 1 model where:
- staff are purchased in the Staff / Trading tab
- unassigned staff work on the General Desk
- sector assignment is optional but beneficial

---

# PART I — DESIGN DOCUMENT

## 1. Phase 2 Goal
The goal of Phase 2 is to make human growth feel physically grounded.

Without capacity constraints, the player can buy human staff indefinitely with no physical or organizational limit.

Phase 2 adds a new strategic question:

**Do I buy more staff, or do I expand the firm so I can support more staff?**

That is the central purpose of this phase.

---

## 2. Core Design Philosophy
Desk capacity should act as a **growth constraint**, not as an annoying punishment.

This means:
- players should start with some free capacity
- early purchases should not feel blocked too harshly
- expansion should be understandable and worth buying
- humans should feel distinct from machine systems

### Intended feeling
- “I need more room for my growing team.”
- “Upgrading the office lets me scale my human desk further.”

---

## 3. What Capacity Applies To
Phase 2 should apply capacity only to **human staff**.

### Human units affected
- **Interns**
- **Junior Traders**
- **Senior Traders**
- future human desk units later

### Not affected in Phase 2
- Research Computer Scientists
- Trading Bots
- Power Infrastructure
- machine-side systems

### Why
This keeps the system focused and avoids stacking too many constraints at once.

Research and machine systems already have their own later identities.

---

## 4. Desk Slot Model
Each human staff unit consumes desk space.

### Recommended first rule
- **Intern** = 1 Desk Slot
- **Junior Trader** = 1 Desk Slot
- **Senior Trader** = 1 Desk Slot

This is the cleanest first implementation.

Later, higher-tier human institutions like Prop Desk or Institutional Desk can consume more than one slot, but that should not be part of the first pass.

---

## 5. Starting Capacity
The player should begin with a modest amount of free desk capacity.

### Recommended starting value
- **10 Desk Slots**

This gives enough room for early onboarding while making expansion relevant once the desk begins to grow.

---

## 6. Capacity Expansion Sources
The player should expand human capacity through firm infrastructure purchases.

### Recommended initial capacity purchases
#### Office Expansion
A standard office expansion purchase that increases Desk Slots.

#### Floor Expansion
A larger later upgrade that increases Desk Slots more significantly.

Optional later additions can include more thematic variants like:
- Desk Reconfiguration
- Tower Lease
- Campus Expansion

But the initial implementation should stay simple.

---

## 7. Why Capacity Improves the Game
Capacity adds:
- a new spending sink for Cash
- a strategic tradeoff between hiring and infrastructure
- a grounded feeling for human growth
- more long-term planning around the desk

It also helps distinguish humans from bots:
- humans need office space
- bots need Power / machine infrastructure

This is a strong thematic separation.

---

## 8. Approved UI Direction for Phase 2
The game should continue to use the split introduced in revised Phase 1:

### Staff / Trading tab
This remains the place where the player purchases human units.

### Sectors tab
This remains the place where the player assigns human units to sectors.

### New capacity visibility requirement
Both tabs should now show human capacity information clearly.

The player should always be able to answer:
- how many Desk Slots do I have?
- how many are used?
- how many are free?

---

## 9. Buying Rule With Capacity
If the player is at full capacity, they should not be able to buy additional human staff that require desk slots.

### Approved behavior
Trying to buy more human staff at full capacity should:
- block the purchase
- explain that more Desk Slots are needed

### Why
Buying staff with nowhere to place them would be confusing and would undermine the meaning of capacity.

---

## 10. Capacity and Sectors Relationship
Desk capacity limits total human staff, not sector placement directly.

### Meaning
If the player owns 10 humans and has 10 desk slots:
- those humans can be left on the General Desk
- or assigned across sectors
- but total human headcount still cannot exceed 10

So capacity is a **firm-wide human limit**, not a per-sector limit.

This is the intended Phase 2 model.

---

# PART II — IMPLEMENTATION / SPEC SHEET

## 11. New GameState Additions
The state model should gain capacity fields.

Suggested additions:

```ts
baseDeskSlots: number;
officeExpansionCount: number;
floorExpansionCount: number;
```

### Recommended initial values
```ts
baseDeskSlots: 10,
officeExpansionCount: 0,
floorExpansionCount: 0,
```

These are enough to derive total capacity.

---

## 12. Derived Capacity Values
These values should be calculated through selectors rather than stored directly.

Suggested derived values:

```ts
totalDeskSlots
usedDeskSlots
availableDeskSlots
```

### Formula concept
```ts
totalDeskSlots =
  baseDeskSlots
  + (officeExpansionCount * OFFICE_EXPANSION_SLOTS)
  + (floorExpansionCount * FLOOR_EXPANSION_SLOTS)
```

```ts
usedDeskSlots =
  internCount
  + juniorTraderCount
  + seniorTraderCount
```

```ts
availableDeskSlots = totalDeskSlots - usedDeskSlots
```

---

## 13. Initial Capacity Constants
Suggested starting constants:

```ts
export const CAPACITY_CONSTANTS = {
  BASE_DESK_SLOTS: 10,
  OFFICE_EXPANSION_SLOTS: 5,
  FLOOR_EXPANSION_SLOTS: 15,

  OFFICE_EXPANSION_BASE_COST: 2500,
  OFFICE_EXPANSION_COST_SCALING: 1.25,

  FLOOR_EXPANSION_BASE_COST: 15000,
  FLOOR_EXPANSION_COST_SCALING: 1.35,
} as const;
```

These are tuning placeholders and can be adjusted later.

---

## 14. Infrastructure Purchase Data Model
Suggested definition type:

```ts
type CapacityInfrastructureDefinition = {
  id: 'officeExpansion' | 'floorExpansion';
  name: string;
  baseCost: number;
  costScaling: number;
  slotsGranted: number;
  description: string;
};
```

Suggested data:

```ts
export const CAPACITY_INFRASTRUCTURE = {
  officeExpansion: {
    id: 'officeExpansion',
    name: 'Office Expansion',
    baseCost: 2500,
    costScaling: 1.25,
    slotsGranted: 5,
    description: 'Adds 5 Desk Slots for human staff.',
  },
  floorExpansion: {
    id: 'floorExpansion',
    name: 'Floor Expansion',
    baseCost: 15000,
    costScaling: 1.35,
    slotsGranted: 15,
    description: 'Adds 15 Desk Slots for human staff.',
  },
} as const;
```

---

## 15. Helper Functions
Suggested utility functions:

```ts
getScaledCost(baseCost, scaling, owned)
getOfficeExpansionCost(state)
getFloorExpansionCost(state)
getTotalDeskSlots(state)
getUsedDeskSlots(state)
getAvailableDeskSlots(state)
canBuyHumanUnit(state)
```

### Human purchase rule
`canBuyHumanUnit(state)` should return true only if:

```ts
getAvailableDeskSlots(state) > 0
```

for any human unit consuming one slot.

---

## 16. Purchase Blocking Logic
The existing human unit purchase actions need to be patched.

### Affected actions
- `buyIntern(...)`
- `buyJuniorTrader(...)`
- `buySeniorTrader(...)`

### New rule
If no Desk Slots are available:
- do not allow purchase
- return unchanged state
- surface a clear UI message or disabled state

This is the key gameplay integration point for Phase 2.

---

## 17. Suggested Selectors
Add selectors such as:

```ts
getTotalDeskSlots(state)
getUsedDeskSlots(state)
getAvailableDeskSlots(state)
getOfficeExpansionCost(state)
getFloorExpansionCost(state)
isAtDeskCapacity(state)
```

These selectors should drive both purchase validation and UI display.

---

## 18. Store Actions
Add new infrastructure purchase actions:

```ts
buyOfficeExpansion(quantity)
buyFloorExpansion(quantity)
```

For first implementation, quantity can simply be 1.

Optional later:
- `x5`
- `Max`

But Phase 2 does not need bulk-buy infrastructure yet unless the UI already supports it cleanly.

---

## 19. Save / Load Requirements
The save model must include the new capacity fields:

```ts
baseDeskSlots
officeExpansionCount
floorExpansionCount
```

### Migration defaults for older saves
If fields are missing:

```ts
baseDeskSlots = 10
officeExpansionCount = 0
floorExpansionCount = 0
```

This keeps older saves compatible.

---

# PART III — UI REQUIREMENTS

## 20. Top-Level Capacity Display
Desk capacity should be visible in the main interface once this phase is added.

### Recommended format
- **Desk Slots: 7 / 10 used**
or
- **Desk Capacity: 3 free / 10 total**

### Preferred version
**Desk Slots: 7 / 10 used**

This is the clearest.

---

## 21. Staff / Trading Tab Changes
This tab should now show, for each human unit type:
- owned count
- assigned count
- available count
- whether enough desk space exists to buy more

### Additional required section
A capacity/infrastructure section should be visible in this tab with:
- current Desk Slots used/total
- Office Expansion card
- Floor Expansion card

This makes the human-side growth constraint visible right where human units are purchased.

---

## 22. Sectors Tab Changes
The Sectors tab should continue to show:
- owned
- assigned
- available

But now it should also show global desk capacity somewhere in the tab header or summary area.

### Why
The player should understand that assignments do not create more room — capacity is still a firm-wide limit.

---

## 23. Purchase UX for Full Capacity
If the player has no free desk slots, purchase buttons for human units should be:
- disabled, or
- clearly blocked with explanation text

Recommended label/state example:
- **Need more Desk Slots**

This is better than letting the player click and silently fail.

---

# PART IV — CODE-READY EXAMPLES

## 24. Type Additions
```ts
// types/game.ts

export type GameState = {
  cash: number;
  lifetimeCashEarned: number;

  internCount: number;
  juniorTraderCount: number;
  seniorTraderCount: number;

  baseDeskSlots: number;
  officeExpansionCount: number;
  floorExpansionCount: number;

  // ...other state fields
};
```

---

## 25. Capacity Constants
```ts
// data/capacity.ts

export const CAPACITY_CONSTANTS = {
  BASE_DESK_SLOTS: 10,

  OFFICE_EXPANSION_SLOTS: 5,
  OFFICE_EXPANSION_BASE_COST: 2500,
  OFFICE_EXPANSION_COST_SCALING: 1.25,

  FLOOR_EXPANSION_SLOTS: 15,
  FLOOR_EXPANSION_BASE_COST: 15000,
  FLOOR_EXPANSION_COST_SCALING: 1.35,
} as const;
```

---

## 26. Capacity Selectors
```ts
// utils/capacity.ts

import type { GameState } from '../types/game';
import { CAPACITY_CONSTANTS } from '../data/capacity';

export function getScaledCost(
  baseCost: number,
  scaling: number,
  owned: number
): number {
  return Math.floor(baseCost * Math.pow(scaling, owned));
}

export function getOfficeExpansionCost(state: GameState): number {
  return getScaledCost(
    CAPACITY_CONSTANTS.OFFICE_EXPANSION_BASE_COST,
    CAPACITY_CONSTANTS.OFFICE_EXPANSION_COST_SCALING,
    state.officeExpansionCount
  );
}

export function getFloorExpansionCost(state: GameState): number {
  return getScaledCost(
    CAPACITY_CONSTANTS.FLOOR_EXPANSION_BASE_COST,
    CAPACITY_CONSTANTS.FLOOR_EXPANSION_COST_SCALING,
    state.floorExpansionCount
  );
}

export function getTotalDeskSlots(state: GameState): number {
  return (
    state.baseDeskSlots
    + state.officeExpansionCount * CAPACITY_CONSTANTS.OFFICE_EXPANSION_SLOTS
    + state.floorExpansionCount * CAPACITY_CONSTANTS.FLOOR_EXPANSION_SLOTS
  );
}

export function getUsedDeskSlots(state: GameState): number {
  return state.internCount + state.juniorTraderCount + state.seniorTraderCount;
}

export function getAvailableDeskSlots(state: GameState): number {
  return getTotalDeskSlots(state) - getUsedDeskSlots(state);
}

export function isAtDeskCapacity(state: GameState): boolean {
  return getAvailableDeskSlots(state) <= 0;
}
```

---

## 27. Purchase Action Patches
```ts
// store/gameActions.ts

import type { GameState } from '../types/game';
import {
  getAvailableDeskSlots,
  getOfficeExpansionCost,
  getFloorExpansionCost,
} from '../utils/capacity';

export function buyIntern(state: GameState, cost: number): GameState {
  if (state.cash < cost) return state;
  if (getAvailableDeskSlots(state) <= 0) return state;

  return {
    ...state,
    cash: state.cash - cost,
    internCount: state.internCount + 1,
  };
}

export function buyJuniorTrader(state: GameState, cost: number): GameState {
  if (state.cash < cost) return state;
  if (getAvailableDeskSlots(state) <= 0) return state;

  return {
    ...state,
    cash: state.cash - cost,
    juniorTraderCount: state.juniorTraderCount + 1,
  };
}

export function buySeniorTrader(state: GameState, cost: number): GameState {
  if (state.cash < cost) return state;
  if (getAvailableDeskSlots(state) <= 0) return state;

  return {
    ...state,
    cash: state.cash - cost,
    seniorTraderCount: state.seniorTraderCount + 1,
  };
}

export function buyOfficeExpansion(state: GameState): GameState {
  const cost = getOfficeExpansionCost(state);
  if (state.cash < cost) return state;

  return {
    ...state,
    cash: state.cash - cost,
    officeExpansionCount: state.officeExpansionCount + 1,
  };
}

export function buyFloorExpansion(state: GameState): GameState {
  const cost = getFloorExpansionCost(state);
  if (state.cash < cost) return state;

  return {
    ...state,
    cash: state.cash - cost,
    floorExpansionCount: state.floorExpansionCount + 1,
  };
}
```

---

## 28. Initial State Patch
```ts
// data/initialState.ts

import type { GameState } from '../types/game';
import { CAPACITY_CONSTANTS } from './capacity';

export const initialState: GameState = {
  cash: 0,
  lifetimeCashEarned: 0,

  internCount: 0,
  juniorTraderCount: 0,
  seniorTraderCount: 0,

  baseDeskSlots: CAPACITY_CONSTANTS.BASE_DESK_SLOTS,
  officeExpansionCount: 0,
  floorExpansionCount: 0,

  // ...other fields
};
```

---

## 29. Example UI Snippet
```tsx
// components/DeskCapacityPanel.tsx

import { formatNumber } from '../utils/formatting';

type DeskCapacityPanelProps = {
  used: number;
  total: number;
  officeExpansionCost: number;
  floorExpansionCost: number;
  onBuyOfficeExpansion: () => void;
  onBuyFloorExpansion: () => void;
};

export function DeskCapacityPanel({
  used,
  total,
  officeExpansionCost,
  floorExpansionCost,
  onBuyOfficeExpansion,
  onBuyFloorExpansion,
}: DeskCapacityPanelProps) {
  return (
    <div className="rounded border border-slate-700 bg-slate-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">Desk Capacity</h3>
        <span className="text-xs text-slate-400">
          {used} / {total} used
        </span>
      </div>

      <div className="space-y-3">
        <button
          onClick={onBuyOfficeExpansion}
          className="w-full rounded bg-cyan-600 px-3 py-2 text-sm text-white hover:bg-cyan-500"
        >
          Buy Office Expansion — ${formatNumber(officeExpansionCost)}
        </button>

        <button
          onClick={onBuyFloorExpansion}
          className="w-full rounded bg-slate-800 px-3 py-2 text-sm text-slate-100 hover:bg-slate-700"
        >
          Buy Floor Expansion — ${formatNumber(floorExpansionCost)}
        </button>
      </div>
    </div>
  );
}
```

---

# PART V — TESTING AND SUCCESS CRITERIA

## 30. Testing Checklist
Phase 2 should be considered successful if:
- human purchases are correctly blocked at full capacity
- Desk Slot counts update correctly when staff are purchased
- Office and Floor expansions correctly increase capacity
- UI always shows used and total slots clearly
- buying staff vs expanding capacity feels like a meaningful tradeoff
- save/load persists the new capacity fields correctly

---

## 31. Final Summary
Phase 2 introduces the first physical scaling constraint for human units.

### Final approved Phase 2 rule
**Human staff require Desk Slots. The firm must expand office capacity to support more human growth.**

This creates a strong next layer after Phase 1 by making the human desk feel like a real organization with space limits, while preserving the current General Desk and sector assignment model.

This document should be treated as the design and code-facing source of truth for Phase 2: Capacity and Infrastructure Constraints.

