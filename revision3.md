# Stock Incremental Game — Extension Document: Repeatable Unit Upgrades

## Purpose of This Document

This document is an additive extension covering the newly approved feature of **repeatable scaling upgrades** for core unit classes.

It combines three layers in one place:

1. **Design document**
2. **Implementation planning / specification sheet**
3. **Delta integration sheet**

This extension covers repeatable upgrades for:

* **Junior Traders**
* **Senior Traders**
* **Trading Bots**
* supporting **Research-based optimization upgrades**

This document should be treated as the current additive source of truth for this feature.

---

## Executive Summary

The game should support repeatable upgrades that can be purchased many times and whose costs scale upward each rank.

### Core purpose

These upgrades create a long-term optimization layer so the player can always slightly improve:

* Junior Trader performance
* Senior Trader performance
* Trading Bot performance
* machine efficiency
* human system efficiency

### Core design rule

**Repeatable upgrades are unbounded or soft-infinite upgrades with escalating cost and modest per-rank gains.**

This creates the classic incremental-game feeling that there is always another small improvement to buy.

---

# PART I — DESIGN DOCUMENT

## 1. Why This Feature Exists

The current unit ladder already supports:

* buying more Juniors
* buying more Seniors
* buying more Bots

But without repeatable unit-enhancement upgrades, the units can feel too static over time.

### Repeatable upgrades solve this by adding:

* a long-term resource sink
* more optimization choices
* more specialization paths
* better late-run pacing
* better use of excess Cash and Research Points

This is a common and effective system in incremental games because it lets the player keep improving established unit classes even after major unlocks are complete.

---

## 2. Core Design Philosophy

Repeatable upgrades should not replace:

* buying new units
* unlocking new systems
* reaching new tiers

Instead, they should act as a parallel optimization layer.

### Intended feeling

* new unit tiers still matter
* repeatables reward deeper investment
* repeatables help prevent older units from feeling dead
* players always have something useful to spend resources on

---

## 3. Two Upgrade Families

The strongest version of this system is to split repeatable upgrades into two families.

### Operations repeatables

Bought with **Cash**.
Focused on:

* direct practical output improvements
* direct unit performance scaling

### Research repeatables

Bought with **Research Points**.
Focused on:

* optimization
* efficiency
* deeper systemic improvements
* machine and human modeling

This gives both Operations and Research stronger long-term roles.

---

## 4. Operations Repeatables

These should live in the practical economy layer and be paid for with Cash.

### Junior Trader Operations repeatable

#### Junior Trader Training

Each rank increases Junior Trader output.

### Senior Trader Operations repeatable

#### Senior Desk Performance

Each rank increases Senior Trader output.

### Trading Bot Operations repeatable

#### Bot Deployment Tuning

Each rank increases Trading Bot output.

These upgrades are easy to understand because they directly improve the associated unit class.

---

## 5. Research Repeatables

These should live in the Research tab and be paid for with Research Points.

### Human Systems Analysis

Improves human trader performance, such as Junior and Senior output.

### Behavioral Modeling

Improves Junior Trader output specifically.

### Decision Systems

Improves Senior Trader output specifically.

### Algorithm Refinement

Improves Trading Bot output.

### Energy Optimization

Reduces Bot Power usage.

These upgrades fit the Research fantasy well because they represent better models, better systems, and more refined firm intelligence.

---

## 6. Core Design Rule for Effects

Repeatable upgrades should provide:

* small effects per rank
* meaningful cumulative gains over time
* costs that rise enough to prevent infinite trivial scaling

### Example acceptable effects

* +5% unit output per rank
* +3% unit output per rank
* -1% bot Power usage per rank
* +2% human efficiency per rank

### What to avoid

* overly large per-rank bonuses that trivialize new tiers
* effects that completely replace the need to buy more units

Repeatables should be optimization, not a substitute for progression.

---

## 7. Soft-Infinite Structure

These upgrades should be effectively unbounded or soft-infinite.

### Meaning

The player can continue buying ranks as long as they can afford them, but cost scaling makes later ranks increasingly expensive.

This produces the intended feel of:

* “I can always improve this a little more”
* “I need to choose where my next efficiency push goes”

---

## 8. Recommended Initial Repeatable Set

### Operations / Cash-based

#### Junior Trader Training

* target: Junior Traders
* effect: +5% Junior output per rank

#### Senior Desk Performance

* target: Senior Traders
* effect: +5% Senior output per rank

#### Bot Deployment Tuning

* target: Trading Bots
* effect: +5% Bot output per rank

### Research / RP-based

#### Behavioral Modeling

* target: Junior Traders
* effect: +2% Junior output per rank

#### Decision Systems

* target: Senior Traders
* effect: +2% Senior output per rank

#### Algorithm Refinement

* target: Trading Bots
* effect: +3% Bot output per rank

#### Energy Optimization

* target: Trading Bots / machine layer
* effect: -1% Bot Power usage per rank

This is a strong initial set because it covers all core unit classes and gives Research an ongoing optimization role.

---

## 9. Progression Fit

This feature fits naturally into the revised progression.

### Early Game

* Junior Traders are bought
* early Junior repeatables give the player a reason to keep investing in the unit class

### Mid Game

* Senior Traders become the stronger human layer
* Senior repeatables help define them as a more advanced workforce unit

### Late Game

* Trading Bots and Power become relevant
* Bot optimization and Energy Optimization become important resource sinks

### Long-Term Loops

* Research Points have meaningful use beyond one-time unlocks
* Cash remains useful even after large parts of the firm are built

This is exactly the kind of system that improves late-run texture and long-term replay feel.

---

## 10. Role of Repeatables in the Economy

Repeatables should not fully replace:

* unit purchases
* tech unlocks
* prestige upgrades

Instead, they should sit between them.

### Practical hierarchy

* buy units to grow the economy
* buy repeatables to optimize the economy
* buy research unlocks to expand the economy
* prestige to permanently improve the economy

That is the intended relationship.

---

# PART II — IMPLEMENTATION / SPECIFICATION SHEET

## 11. Suggested Data Model

Repeatable upgrades should be represented as rank-based definitions.

Suggested shape:

```ts
type RepeatableUpgradeCurrency = 'cash' | 'researchPoints';

type RepeatableUpgradeTarget =
  | 'juniorTrader'
  | 'seniorTrader'
  | 'tradingBot'
  | 'humanSystems'
  | 'machineSystems';

type RepeatableUpgradeDefinition = {
  id: string;
  name: string;
  currency: RepeatableUpgradeCurrency;
  target: RepeatableUpgradeTarget;
  baseCost: number;
  costScaling: number;
  effectPerRank: number;
  description: string;
};
```

---

## 12. New GameState Additions

Add rank tracking for repeatable upgrades.

Suggested state shape:

```ts
repeatableUpgradeRanks: Record<string, number>;
```

This is the simplest and most scalable first implementation.

Example stored ranks:

* `juniorTraderTraining: 4`
* `seniorDeskPerformance: 2`
* `botDeploymentTuning: 1`
* `behavioralModeling: 3`

---

## 13. Initial Repeatable Definitions

Suggested first implementation data:

```ts
juniorTraderTraining: {
  id: 'juniorTraderTraining',
  name: 'Junior Trader Training',
  currency: 'cash',
  target: 'juniorTrader',
  baseCost: 2500,
  costScaling: 1.25,
  effectPerRank: 0.05,
  description: '+5% Junior Trader output per rank.'
}

seniorDeskPerformance: {
  id: 'seniorDeskPerformance',
  name: 'Senior Desk Performance',
  currency: 'cash',
  target: 'seniorTrader',
  baseCost: 20000,
  costScaling: 1.27,
  effectPerRank: 0.05,
  description: '+5% Senior Trader output per rank.'
}

botDeploymentTuning: {
  id: 'botDeploymentTuning',
  name: 'Bot Deployment Tuning',
  currency: 'cash',
  target: 'tradingBot',
  baseCost: 100000,
  costScaling: 1.30,
  effectPerRank: 0.05,
  description: '+5% Trading Bot output per rank.'
}

behavioralModeling: {
  id: 'behavioralModeling',
  name: 'Behavioral Modeling',
  currency: 'researchPoints',
  target: 'juniorTrader',
  baseCost: 25,
  costScaling: 1.18,
  effectPerRank: 0.02,
  description: '+2% Junior Trader output per rank.'
}

decisionSystems: {
  id: 'decisionSystems',
  name: 'Decision Systems',
  currency: 'researchPoints',
  target: 'seniorTrader',
  baseCost: 50,
  costScaling: 1.20,
  effectPerRank: 0.02,
  description: '+2% Senior Trader output per rank.'
}

algorithmRefinement: {
  id: 'algorithmRefinement',
  name: 'Algorithm Refinement',
  currency: 'researchPoints',
  target: 'tradingBot',
  baseCost: 75,
  costScaling: 1.22,
  effectPerRank: 0.03,
  description: '+3% Trading Bot output per rank.'
}

energyOptimization: {
  id: 'energyOptimization',
  name: 'Energy Optimization',
  currency: 'researchPoints',
  target: 'machineSystems',
  baseCost: 100,
  costScaling: 1.24,
  effectPerRank: 0.01,
  description: '-1% Trading Bot Power usage per rank.'
}
```

These are implementation-ready starting values and should be tuned later.

---

## 14. Cost Formula

Repeatable upgrades should use a standard incremental cost formula.

### Formula

```ts
cost = Math.floor(baseCost * Math.pow(costScaling, currentRank))
```

This should be used for every repeatable upgrade.

---

## 15. Effect Formula

For first implementation, use simple additive-per-rank effects.

### Output multiplier formula

```ts
multiplier = 1 + (rank * effectPerRank)
```

Examples:

* rank 4, effect 0.05 → 1.20 multiplier
* rank 10, effect 0.02 → 1.20 multiplier

This is simple, readable, and easy to tune.

---

## 16. Integration Points in Economy Functions

The economy layer must now account for repeatable upgrade ranks.

### Junior Trader income

Should include:

* base Junior Trader upgrades
* Junior Trader Training ranks
* Behavioral Modeling ranks

### Senior Trader income

Should include:

* base Senior upgrades
* Senior Desk Performance ranks
* Decision Systems ranks

### Trading Bot income

Should include:

* base Bot upgrades
* Bot Deployment Tuning ranks
* Algorithm Refinement ranks
* existing Power efficiency penalty if over capacity

### Bot Power usage

Should include:

* base Power usage
* Energy Optimization ranks reducing usage

---

## 17. Suggested Helper Functions

Add helper functions such as:

```ts
getRepeatableUpgradeRank(state, id)
getRepeatableUpgradeCost(state, id)
getRepeatableOutputMultiplier(state, id)
getEnergyOptimizationReduction(state)
```

This keeps the logic modular and easier to test.

---

## 18. Purchase Actions

Add a general store action for repeatables.

Suggested action:

```ts
buyRepeatableUpgrade(id)
```

Behavior:

* determine upgrade definition
* determine current rank
* compute scaled cost
* subtract correct currency (Cash or Research Points)
* increment rank by 1

For first implementation, buying a single rank at a time is sufficient.

---

## 19. Currency Routing Rule

Repeatables should respect their assigned currency.

### Cash repeatables

Spend:

* `cash`

### Research repeatables

Spend:

* `researchPoints`

This should be enforced by the purchase logic rather than by UI alone.

---

## 20. UI Placement

### Operations tab / main operations area

Should contain Cash-based repeatables:

* Junior Trader Training
* Senior Desk Performance
* Bot Deployment Tuning

### Research tab

Should contain RP-based repeatables:

* Behavioral Modeling
* Decision Systems
* Algorithm Refinement
* Energy Optimization

This keeps the UI aligned with system purpose.

---

## 21. UI Display Requirements

Each repeatable upgrade card should show:

* name
* current rank
* next rank effect
* current cost
* currency type
* purchase button

Example display:

* **Junior Trader Training — Rank 4**
* `+5% Junior Trader output per rank`
* `Next Cost: $6,103`

For Research-based upgrades:

* `Next Cost: 58 RP`

---

## 22. Save / Load Requirements

The save model must include:

```ts
repeatableUpgradeRanks
```

### Migration default

If missing from older saves:

```ts
repeatableUpgradeRanks = {}
```

This is a straightforward migration.

---

# PART III — DELTA INTEGRATION SHEET

## 23. What Stays the Same

The following systems remain structurally unchanged:

* unit purchase scaling
* Research Point generation
* Power capacity / usage model
* Lobbying structure
* Prestige currency and prestige reset flow
* main resource model

This extension only adds a new long-term optimization layer.

---

## 24. What Changes

### Add

* repeatable upgrade definitions
* repeatable upgrade rank state
* repeatable purchase logic
* economy multipliers from repeatable ranks
* repeatable upgrade cards in Operations and Research

### Modify

* unit income formulas
* Bot Power usage formula
* state shape
* save/load migration

### Remove / Deprecate

No major system needs to be removed.
This feature is additive.

---

## 25. Files / Systems That Need Modification

### `types/game.ts`

Add:

* repeatable upgrade definition types
* repeatable rank storage typing if needed

### `GameState`

Add:

* `repeatableUpgradeRanks`

### `data/repeatableUpgrades.ts`

Create:

* repeatable upgrade definitions

### `utils/economy.ts`

Patch:

* Junior Trader income formula
* Senior Trader income formula
* Trading Bot income formula
* Bot Power usage formula

### store / actions

Add:

* `buyRepeatableUpgrade(id)`

### Operations UI

Patch:

* add cash-based repeatable upgrade cards

### Research UI

Patch:

* add RP-based repeatable upgrade cards

### save/load system

Patch:

* persist `repeatableUpgradeRanks`

---

## 26. Selector Additions

Add selectors such as:

```ts
repeatableUpgradeRank(state, id)
repeatableUpgradeCost(state, id)
juniorTraderRepeatableMultiplier(state)
seniorTraderRepeatableMultiplier(state)
tradingBotRepeatableMultiplier(state)
energyOptimizationReduction(state)
```

These should be used by both UI and economy logic.

---

## 27. Formula Patch Summary

### Junior Trader output should now include

* base Junior output
* Operations repeatable bonus
* Research repeatable bonus

### Senior Trader output should now include

* base Senior output
* Operations repeatable bonus
* Research repeatable bonus

### Trading Bot output should now include

* base Bot output
* Operations repeatable bonus
* Research repeatable bonus
* machine efficiency multiplier from Power

### Trading Bot Power usage should now include

* base bot Power usage
* reduction from Energy Optimization

This is the main gameplay integration point.

---

## 28. Recommended Implementation Order

### Step 1 — Add repeatable data and state

* create `repeatableUpgradeRanks`
* create definitions file

### Step 2 — Add purchase action

* implement `buyRepeatableUpgrade(id)`
* route by currency type

### Step 3 — Patch economy formulas

* add repeatable multipliers into Junior/Senior/Bot output
* add Energy Optimization into Bot Power usage

### Step 4 — Patch UI

* add Operations repeatable section
* add Research repeatable section
* display rank + next cost + effect

### Step 5 — Patch save/load

* persist repeatable ranks
* add migration default

### Step 6 — Balance testing

* verify repeatables do not overshadow unit purchases too early
* verify Research repeatables feel useful but not mandatory too soon
* verify Bot optimization interacts well with Power system

---

## 29. Progression Fit Summary

This feature strengthens every phase of the game.

### Early

Junior repeatables keep the first automation layer interesting.

### Mid

Senior repeatables reinforce the stronger human layer.

### Late

Bot repeatables and Energy Optimization deepen machine-era play.

### Long-term

Research Points gain additional meaningful sinks beyond one-time unlocks.
Cash gains a sustained late-run optimization sink.

This is exactly the kind of system that improves replayability and incremental feel.

---

## 30. Final Summary

This extension adds repeatable, scaling upgrades for unit classes and supporting systems.

### Final approved direction

* Operations gets Cash-based repeatable unit upgrades
* Research gets RP-based repeatable optimization upgrades
* ranks scale upward in cost
* effects remain modest per rank but meaningful over time

This gives the game a stronger long-term optimization layer and a more authentic incremental progression feel.

This document should be treated as the current additive source of truth for repeatable unit upgrades.
