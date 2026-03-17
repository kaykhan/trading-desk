
Yes — here is a fresh **Phase 12 design + implementation doc** in full so you can copy it directly.

# Phase 12 — Optimisations Redesign

## Purpose

Redesign Optimisations into a proper late-game refinement system that matches the final game structure.

Optimisations are:

* repeatable
* capped at 100 ranks each
* small per-rank gains
* expensive over time
* unlocked after **Prestige 1**
* bought with **Cash**, **Research Points**, or **Influence**

Optimisations are **not**:

* research unlocks
* one-time upgrades
* prestige replacements

They are the long-tail refinement layer for runs after the first prestige.

---

## Core rules

### Unlock timing

Optimisations unlock after **Prestige 1**.

### Rank cap

Each optimisation has **100 ranks max**.

### Per-rank strength

Most optimisations should give:

* **+0.5%**
* **+0.75%**
* **+1.0%**

per rank, depending on scope.

### Currency identity

* **Cash** = business / desk / deployment refinement
* **Research Points** = science / automation / modeling refinement
* **Influence** = compliance / lobbying / governance refinement

### Broad, not per-unit

Do not create one optimisation for every single unit.
Use broader tracks like:

* human desk output
* institution output
* automation payout
* compliance burden

---

# Optimisation categories

Use 4 categories:

1. **Desk Optimisations**
2. **Research Optimisations**
3. **Automation Optimisations**
4. **Governance Optimisations**

Total recommended optimisations: **15**

---

# 1. Desk Optimisations

## Identity

Operational refinement for manual trading, humans, institutions, and sector deployment.

### 1. Manual Execution Refinement

* **Currency:** Cash
* **Ranks:** 100
* **Effect per rank:** Manual trade value **+0.5%**
* **Unlock:** Prestige 1 complete
* **Purpose:** Long-tail manual trade improvement

### 2. Human Desk Tuning

* **Currency:** Cash
* **Ranks:** 100
* **Effect per rank:** Intern, Junior Trader, and Senior Trader output **+0.5%**
* **Unlock:** Prestige 1 complete and at least 1 human unit in current run
* **Purpose:** Broad human output scaling

### 3. Institutional Process Refinement

* **Currency:** Cash
* **Ranks:** 100
* **Effect per rank:** Prop Desk, Institutional Desk, Hedge Fund, and Investment Firm output **+0.75%**
* **Unlock:** Prestige 1 complete and institution systems active
* **Purpose:** Broad institution output scaling

### 4. Sector Allocation Efficiency

* **Currency:** Cash
* **Ranks:** 100
* **Effect per rank:** Sector-assigned human and institution output **+0.5%**
* **Unlock:** Prestige 1 complete and sectors active
* **Purpose:** Rewards sector-based deployment

---

# 2. Research Optimisations

## Identity

Research production, training quality, and analytical refinement.

### 5. Research Throughput

* **Currency:** Research Points
* **Ranks:** 100
* **Effect per rank:** Total Research Point generation **+0.75%**
* **Unlock:** Prestige 1 complete and research active
* **Purpose:** Broad RP scaling

### 6. Training Methodology

* **Currency:** Research Points
* **Ranks:** 100
* **Effect per rank:** Specialist and mandate effectiveness **+0.5%**
* **Unlock:** Prestige 1 complete and either specializations or mandates active
* **Purpose:** Supports people and institution strategy systems

### 7. Analytical Modeling

* **Currency:** Research Points
* **Ranks:** 100
* **Effect per rank:** Market target and strategy effectiveness **+0.5%**
* **Unlock:** Prestige 1 complete and automation strategy systems active
* **Purpose:** Improves machine-side strategic fit

---

# 3. Automation Optimisations

## Identity

Automation payout, cycle speed, machine efficiency, and signal quality.

### 8. Execution Stack Tuning

* **Currency:** Cash
* **Ranks:** 100
* **Effect per rank:** Automation cycle payout **+0.75%**
* **Unlock:** Prestige 1 complete and automation active
* **Purpose:** Broad machine-side scaling

### 9. Model Efficiency

* **Currency:** Research Points
* **Ranks:** 100
* **Effect per rank:** Automation cycle duration **-0.3%**
* **Unlock:** Prestige 1 complete and automation active
* **Purpose:** Smooth cycle-speed improvement

### 10. Compute Optimization

* **Currency:** Research Points
* **Ranks:** 100
* **Effect per rank:** Machine power usage **-0.4%**
* **Unlock:** Prestige 1 complete and machine systems active
* **Purpose:** Improves automation sustainability

### 11. Signal Quality Control

* **Currency:** Research Points
* **Ranks:** 100
* **Effect per rank:** Strategy effectiveness **+0.5%**
* **Unlock:** Prestige 1 complete and at least 1 automation strategy unlocked
* **Purpose:** Refines automation strategy performance

---

# 4. Governance Optimisations

## Identity

Compliance relief, lobbying support, influence gain, and institutional friction reduction.

### 12. Compliance Systems

* **Currency:** Influence
* **Ranks:** 100
* **Effect per rank:** Compliance burden contribution **-0.5%**
* **Unlock:** Prestige 1 complete and compliance visible
* **Purpose:** Broad compliance pressure relief

### 13. Filing Efficiency

* **Currency:** Influence
* **Ranks:** 100
* **Effect per rank:** Recurring compliance review costs **-0.75%**
* **Unlock:** Prestige 1 complete and compliance visible
* **Purpose:** Reduces timed compliance payments

### 14. Policy Reach

* **Currency:** Influence
* **Ranks:** 100
* **Effect per rank:** Influence gain **+0.5%**
* **Unlock:** Prestige 1 complete and lobbying active
* **Purpose:** Improves governance-side progression

### 15. Institutional Access

* **Currency:** Influence
* **Ranks:** 100
* **Effect per rank:** Institutional compliance costs and institutional friction **-0.5%**
* **Unlock:** Prestige 1 complete and institution systems active
* **Purpose:** Supports institution-heavy builds

---

# Cost scaling framework

## Philosophy

Costs should:

* feel accessible at low ranks
* become meaningful by ranks 10–20
* become expensive by ranks 30–50
* become true endgame sinks by ranks 70–100

## Formula

Use:

```ts
cost = floor(baseCost * scalingFactor ** currentRank)
```

## Suggested scaling factors

* **Cash:** `1.10` to `1.13`
* **Research Points:** `1.09` to `1.12`
* **Influence:** `1.10` to `1.14`

## Suggested base costs

### Cash

* Manual Execution Refinement: **5,000**
* Human Desk Tuning: **15,000**
* Institutional Process Refinement: **100,000**
* Sector Allocation Efficiency: **50,000**
* Execution Stack Tuning: **80,000**

### Research Points

* Research Throughput: **250 RP**
* Training Methodology: **400 RP**
* Analytical Modeling: **500 RP**
* Model Efficiency: **600 RP**
* Compute Optimization: **800 RP**
* Signal Quality Control: **700 RP**

### Influence

* Compliance Systems: **8 Influence**
* Filing Efficiency: **10 Influence**
* Policy Reach: **12 Influence**
* Institutional Access: **14 Influence**

These are rough balancing starts, not final values.

---

# Implementation spec

## Types

```ts
export type OptimisationCategoryId =
  | 'desk'
  | 'research'
  | 'automation'
  | 'governance';

export type OptimisationCurrency =
  | 'cash'
  | 'researchPoints'
  | 'influence';

export type OptimisationId =
  | 'manualExecutionRefinement'
  | 'humanDeskTuning'
  | 'institutionalProcessRefinement'
  | 'sectorAllocationEfficiency'
  | 'researchThroughput'
  | 'trainingMethodology'
  | 'analyticalModeling'
  | 'executionStackTuning'
  | 'modelEfficiency'
  | 'computeOptimization'
  | 'signalQualityControl'
  | 'complianceSystems'
  | 'filingEfficiency'
  | 'policyReach'
  | 'institutionalAccess';
```

## Definition shape

```ts
type OptimisationDefinition = {
  id: OptimisationId;
  name: string;
  category: OptimisationCategoryId;
  currency: OptimisationCurrency;
  maxRank: number;
  perRankDescription: string;
  baseCost: number;
  scalingFactor: number;
  unlockConditionDescription: string;
};
```

## Example constants

```ts
export const OPTIMISATIONS: Record<OptimisationId, OptimisationDefinition> = {
  manualExecutionRefinement: {
    id: 'manualExecutionRefinement',
    name: 'Manual Execution Refinement',
    category: 'desk',
    currency: 'cash',
    maxRank: 100,
    perRankDescription: 'Manual trade value +0.5% per rank',
    baseCost: 5000,
    scalingFactor: 1.11,
    unlockConditionDescription: 'Unlocked after Prestige 1',
  },
  humanDeskTuning: {
    id: 'humanDeskTuning',
    name: 'Human Desk Tuning',
    category: 'desk',
    currency: 'cash',
    maxRank: 100,
    perRankDescription: 'Human trader output +0.5% per rank',
    baseCost: 15000,
    scalingFactor: 1.11,
    unlockConditionDescription: 'Requires human desk units active',
  },
  institutionalProcessRefinement: {
    id: 'institutionalProcessRefinement',
    name: 'Institutional Process Refinement',
    category: 'desk',
    currency: 'cash',
    maxRank: 100,
    perRankDescription: 'Institution output +0.75% per rank',
    baseCost: 100000,
    scalingFactor: 1.12,
    unlockConditionDescription: 'Requires institution systems active',
  },
  sectorAllocationEfficiency: {
    id: 'sectorAllocationEfficiency',
    name: 'Sector Allocation Efficiency',
    category: 'desk',
    currency: 'cash',
    maxRank: 100,
    perRankDescription: 'Sector-assigned output +0.5% per rank',
    baseCost: 50000,
    scalingFactor: 1.11,
    unlockConditionDescription: 'Requires sectors active',
  },
  researchThroughput: {
    id: 'researchThroughput',
    name: 'Research Throughput',
    category: 'research',
    currency: 'researchPoints',
    maxRank: 100,
    perRankDescription: 'Research Point generation +0.75% per rank',
    baseCost: 250,
    scalingFactor: 1.10,
    unlockConditionDescription: 'Requires research active',
  },
  trainingMethodology: {
    id: 'trainingMethodology',
    name: 'Training Methodology',
    category: 'research',
    currency: 'researchPoints',
    maxRank: 100,
    perRankDescription: 'Specialist and mandate effectiveness +0.5% per rank',
    baseCost: 400,
    scalingFactor: 1.10,
    unlockConditionDescription: 'Requires specializations or mandates active',
  },
  analyticalModeling: {
    id: 'analyticalModeling',
    name: 'Analytical Modeling',
    category: 'research',
    currency: 'researchPoints',
    maxRank: 100,
    perRankDescription: 'Market target and strategy effectiveness +0.5% per rank',
    baseCost: 500,
    scalingFactor: 1.10,
    unlockConditionDescription: 'Requires automation strategy systems active',
  },
  executionStackTuning: {
    id: 'executionStackTuning',
    name: 'Execution Stack Tuning',
    category: 'automation',
    currency: 'cash',
    maxRank: 100,
    perRankDescription: 'Automation cycle payout +0.75% per rank',
    baseCost: 80000,
    scalingFactor: 1.12,
    unlockConditionDescription: 'Requires automation active',
  },
  modelEfficiency: {
    id: 'modelEfficiency',
    name: 'Model Efficiency',
    category: 'automation',
    currency: 'researchPoints',
    maxRank: 100,
    perRankDescription: 'Automation cycle duration -0.3% per rank',
    baseCost: 600,
    scalingFactor: 1.11,
    unlockConditionDescription: 'Requires automation active',
  },
  computeOptimization: {
    id: 'computeOptimization',
    name: 'Compute Optimization',
    category: 'automation',
    currency: 'researchPoints',
    maxRank: 100,
    perRankDescription: 'Machine power usage -0.4% per rank',
    baseCost: 800,
    scalingFactor: 1.11,
    unlockConditionDescription: 'Requires machine systems active',
  },
  signalQualityControl: {
    id: 'signalQualityControl',
    name: 'Signal Quality Control',
    category: 'automation',
    currency: 'researchPoints',
    maxRank: 100,
    perRankDescription: 'Strategy effectiveness +0.5% per rank',
    baseCost: 700,
    scalingFactor: 1.10,
    unlockConditionDescription: 'Requires automation strategies unlocked',
  },
  complianceSystems: {
    id: 'complianceSystems',
    name: 'Compliance Systems',
    category: 'governance',
    currency: 'influence',
    maxRank: 100,
    perRankDescription: 'Compliance burden contribution -0.5% per rank',
    baseCost: 8,
    scalingFactor: 1.12,
    unlockConditionDescription: 'Requires compliance visible',
  },
  filingEfficiency: {
    id: 'filingEfficiency',
    name: 'Filing Efficiency',
    category: 'governance',
    currency: 'influence',
    maxRank: 100,
    perRankDescription: 'Compliance review costs -0.75% per rank',
    baseCost: 10,
    scalingFactor: 1.12,
    unlockConditionDescription: 'Requires compliance visible',
  },
  policyReach: {
    id: 'policyReach',
    name: 'Policy Reach',
    category: 'governance',
    currency: 'influence',
    maxRank: 100,
    perRankDescription: 'Influence gain +0.5% per rank',
    baseCost: 12,
    scalingFactor: 1.13,
    unlockConditionDescription: 'Requires lobbying active',
  },
  institutionalAccess: {
    id: 'institutionalAccess',
    name: 'Institutional Access',
    category: 'governance',
    currency: 'influence',
    maxRank: 100,
    perRankDescription: 'Institutional compliance costs and friction -0.5% per rank',
    baseCost: 14,
    scalingFactor: 1.13,
    unlockConditionDescription: 'Requires institution systems active',
  },
};
```

---

# Game state

```ts
type GameState = {
  optimisationsUnlocked: boolean;
  optimisationRanks: Record<OptimisationId, number>;

  cash: number;
  researchPoints: number;
  influence: number;

  prestigeCount: number;

  // ...existing game state
};
```

## Unlock rule

`optimisationsUnlocked = true` once `prestigeCount >= 1`

---

# Unlock conditions

## Global unlock

* Prestige 1 complete

## Per-optimisation unlock

Only check if the related system exists in the current run.

Examples:

* Human Desk Tuning requires human units
* Institutional Process Refinement requires institution systems
* Signal Quality Control requires at least one strategy unlocked
* Compliance Systems requires compliance visible

Important:
**Optimisations do not unlock systems.**

---

# Helper functions

```ts
function isOptimisationsGloballyUnlocked(state: GameState): boolean {
  return state.prestigeCount >= 1;
}

function getOptimisationRank(state: GameState, id: OptimisationId): number {
  return state.optimisationRanks[id] ?? 0;
}

function getOptimisationCost(state: GameState, id: OptimisationId): number {
  const def = OPTIMISATIONS[id];
  const rank = getOptimisationRank(state, id);
  return Math.floor(def.baseCost * Math.pow(def.scalingFactor, rank));
}

function isOptimisationUnlocked(state: GameState, id: OptimisationId): boolean {
  if (!isOptimisationsGloballyUnlocked(state)) return false;

  switch (id) {
    case 'manualExecutionRefinement':
      return true;
    case 'humanDeskTuning':
      return state.internCount + state.juniorTraderCount + state.seniorTraderCount > 0;
    case 'institutionalProcessRefinement':
    case 'institutionalAccess':
      return state.propDeskCount + state.institutionalDeskCount + state.hedgeFundCount + state.investmentFirmCount > 0;
    case 'sectorAllocationEfficiency':
      return state.unlockedSectors && Object.values(state.unlockedSectors).some(Boolean);
    case 'researchThroughput':
      return state.researchPoints !== undefined;
    case 'trainingMethodology':
      return state.specializationsUnlocked || state.mandatesUnlocked;
    case 'analyticalModeling':
    case 'signalQualityControl':
      return state.automationStrategiesUnlocked;
    case 'executionStackTuning':
    case 'modelEfficiency':
      return Object.values(state.automationUnits || {}).some((n) => n > 0);
    case 'computeOptimization':
      return state.machineSystemsActive;
    case 'complianceSystems':
    case 'filingEfficiency':
      return state.complianceVisible;
    case 'policyReach':
      return state.lobbyingUnlocked;
    default:
      return false;
  }
}
```

---

# Purchase action

```ts
function buyOptimisationRank(state: GameState, id: OptimisationId): GameState {
  if (!isOptimisationUnlocked(state, id)) return state;

  const def = OPTIMISATIONS[id];
  const currentRank = getOptimisationRank(state, id);
  if (currentRank >= def.maxRank) return state;

  const cost = getOptimisationCost(state, id);

  if (def.currency === 'cash' && state.cash < cost) return state;
  if (def.currency === 'researchPoints' && state.researchPoints < cost) return state;
  if (def.currency === 'influence' && state.influence < cost) return state;

  return {
    ...state,
    cash: def.currency === 'cash' ? state.cash - cost : state.cash,
    researchPoints: def.currency === 'researchPoints' ? state.researchPoints - cost : state.researchPoints,
    influence: def.currency === 'influence' ? state.influence - cost : state.influence,
    optimisationRanks: {
      ...state.optimisationRanks,
      [id]: currentRank + 1,
    },
  };
}
```

---

# Effect helpers

Use grouped helpers instead of reading ranks everywhere.

```ts
function getOptimisationMultiplier(rank: number, perRankPercent: number): number {
  return 1 + rank * perRankPercent;
}
```

## Examples

```ts
function getManualExecutionOptimisationMultiplier(state: GameState): number {
  return getOptimisationMultiplier(getOptimisationRank(state, 'manualExecutionRefinement'), 0.005);
}

function getHumanDeskOptimisationMultiplier(state: GameState): number {
  return getOptimisationMultiplier(getOptimisationRank(state, 'humanDeskTuning'), 0.005);
}

function getInstitutionOptimisationMultiplier(state: GameState): number {
  return getOptimisationMultiplier(getOptimisationRank(state, 'institutionalProcessRefinement'), 0.0075);
}

function getSectorAllocationOptimisationMultiplier(state: GameState): number {
  return getOptimisationMultiplier(getOptimisationRank(state, 'sectorAllocationEfficiency'), 0.005);
}

function getResearchOptimisationMultiplier(state: GameState): number {
  return getOptimisationMultiplier(getOptimisationRank(state, 'researchThroughput'), 0.0075);
}

function getTrainingMethodologyMultiplier(state: GameState): number {
  return getOptimisationMultiplier(getOptimisationRank(state, 'trainingMethodology'), 0.005);
}

function getAnalyticalModelingMultiplier(state: GameState): number {
  return getOptimisationMultiplier(getOptimisationRank(state, 'analyticalModeling'), 0.005);
}

function getAutomationPayoutOptimisationMultiplier(state: GameState): number {
  return getOptimisationMultiplier(getOptimisationRank(state, 'executionStackTuning'), 0.0075);
}

function getAutomationCycleDurationModifier(state: GameState): number {
  return Math.max(0.5, 1 - getOptimisationRank(state, 'modelEfficiency') * 0.003);
}

function getMachinePowerUsageModifier(state: GameState): number {
  return Math.max(0.5, 1 - getOptimisationRank(state, 'computeOptimization') * 0.004);
}

function getSignalQualityMultiplier(state: GameState): number {
  return getOptimisationMultiplier(getOptimisationRank(state, 'signalQualityControl'), 0.005);
}

function getComplianceBurdenModifier(state: GameState): number {
  return Math.max(0.5, 1 - getOptimisationRank(state, 'complianceSystems') * 0.005);
}

function getComplianceCostModifier(state: GameState): number {
  return Math.max(0.25, 1 - getOptimisationRank(state, 'filingEfficiency') * 0.0075);
}

function getInfluenceOptimisationMultiplier(state: GameState): number {
  return getOptimisationMultiplier(getOptimisationRank(state, 'policyReach'), 0.005);
}

function getInstitutionalComplianceModifier(state: GameState): number {
  return Math.max(0.5, 1 - getOptimisationRank(state, 'institutionalAccess') * 0.005);
}
```

---

# UI spec

## Optimisations tab layout

Top summary:

* Optimisations unlocked: Yes/No
* Total optimisation ranks purchased
* Current currencies:

  * Cash
  * Research Points
  * Influence

Then grouped sections:

* Desk
* Research
* Automation
* Governance

## Each optimisation card should show

* name
* category
* currency
* rank `X / 100`
* effect per rank
* current total effect
* next rank cost
* unlock condition if locked
* buy button

## Example card

**Human Desk Tuning**
Rank: **14 / 100**
Effect: **+0.5% human output per rank**
Current total: **+7.0%**
Next cost: **$64,281**
Button: **Buy Rank**

---

# Save/load defaults

```ts
optimisationsUnlocked = false
optimisationRanks = {
  manualExecutionRefinement: 0,
  humanDeskTuning: 0,
  institutionalProcessRefinement: 0,
  sectorAllocationEfficiency: 0,
  researchThroughput: 0,
  trainingMethodology: 0,
  analyticalModeling: 0,
  executionStackTuning: 0,
  modelEfficiency: 0,
  computeOptimization: 0,
  signalQualityControl: 0,
  complianceSystems: 0,
  filingEfficiency: 0,
  policyReach: 0,
  institutionalAccess: 0,
}
```

---

# Why this redesign is better

Compared to the old list, this version:

* matches the actual final game systems
* avoids clutter from one optimisation per unit
* works much better with 100-rank caps
* gives all three late-game currencies meaningful sinks
* fits the progression after Prestige 1
* keeps Research, Upgrades, Prestige, and Optimisations clearly separate

---

# Final rule

**Optimisations unlock after Prestige 1 and become a broad, 100-rank late-game refinement layer across Desk, Research, Automation, and Governance systems, using Cash, Research Points, and Influence as distinct currencies.**

If you want, I can do the same thing next for **Phase 11 Milestones** in this same full copyable format.
