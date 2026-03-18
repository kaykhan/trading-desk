# Stock Incremental Game — Phase 5 Design Document and Implementation Specification

## Scope
This document covers **Phase 5 — Automation Units, Strategies, and Cycle-Based Execution**.

It combines:
1. **Design document**
2. **Implementation/specification sheet**
3. **Code-ready structural examples**

Phase 5 introduces the machine-side strategic identity layer.

This phase defines:
- the automation unit ladder
- how automation is unlocked through Research
- shared strategy unlocks through Research
- market target selection for automation units
- cycle-based execution instead of pure passive continuous output
- visible progress bars and payout ticks in the UI

This phase should be treated as the machine-side mirror of the earlier human-side strategy systems, but with a distinct mechanic and visual identity.

---

# PART I — DESIGN DOCUMENT

## 1. Phase 5 Goal
The goal of Phase 5 is to make automation feel fundamentally different from human traders.

Human units already operate through:
- continuous production
- sector assignment
- specializations
- institutional mandates

Automation should **not** be a copy of that system.

Instead, automation should feel like:
- machine execution systems
- model-driven trading loops
- timed execution cycles
- visible process bars
- burst-like payouts on cycle completion

### Core design philosophy
Humans produce like a staffed desk.
Automation executes like running trading systems.

This is the core distinction for Phase 5.

---

## 2. Automation Branch Progression
Automation should be unlocked through the **Automation** branch of Research.

### Approved automation unit ladder
- **Quant Trader**
- **Rule-Based Bot**
- **ML Bot**
- **AI Bot**

### Important design note
Quant Trader should now be treated as part of the automation/systematic trading lane for gameplay purposes.

It is the player’s first unlocked systematic execution unit and acts as the bridge into the machine-side progression.

---

## 3. Shared Strategy Family
All automation units use the same strategy family.

### Approved shared strategies
- **Mean Reversion**
- **Momentum**
- **Arbitrage**
- **Market Making**
- **Scalping**

### Important approved rule
Automation units do **not** need to be inherently “the bot for one strategy.”

Instead:
- the unit tier determines cycle speed, payout size, and infrastructure needs
- the strategy changes how the automation unit performs relative to market target and current conditions

This is the cleanest design.

---

## 4. Market Targeting
Automation units should not be assigned to sectors through the same row-based Sectors UI used by human units.

Instead, automation units should use a simpler targeting model.

### Approved model
Each automation unit type or automation card has:
- a **market target** dropdown
- a **strategy** dropdown

### Example
- Rule-Based Bot → Target: Finance → Strategy: Mean Reversion
- ML Bot → Target: Technology → Strategy: Momentum

This gives enough strategic depth without overloading the Sectors tab.

---

## 5. Why Automation Should Not Use the Same Sectors UI
The Sectors tab already needs to support:
- generic humans
- human specialists
- institutional units
- mandated institutional units

If automation also uses the same detailed row-based assignment model, the screen becomes too dense.

### Approved separation
- **Humans and institutions** use sector deployment via the Sectors tab
- **Automation** uses self-contained cards with market target and strategy selectors

This is now the intended machine-side UX model.

---

## 6. Cycle-Based Execution Mechanic
Automation output should be delivered in **timed cycles** rather than as purely smooth passive per-second output.

### Approved rule
When an automation unit completes a cycle:
- it pays out a visible lump of money
- a visible progress bar resets and begins again

This is the key mechanical identity of automation.

### Why this is better
It makes automation feel:
- more alive
- more technical
- more satisfying to monitor
- more visually distinct from human desk output

---

## 7. Pacing Identity by Unit Tier
Automation tiers should differ by cycle duration and payout style.

### Approved direction
Higher machine tiers should generally have:
- **longer cycles**
- **larger payouts**
- **heavier infrastructure / compute identity**

### Intended feel
#### Quant Trader
Fast, small, early systematic execution.

#### Rule-Based Bot
Moderate, reliable execution.

#### ML Bot
Longer cycle, chunkier payout, more analytical.

#### AI Bot
Longest cycle, biggest payout, most advanced and infrastructure-heavy.

This is preferred over making every higher tier simply faster.

---

## 8. UI Identity of Automation
The UI should make automation look like systems executing processes.

### Each automation card should visibly show
- owned count
- selected market target
- selected strategy
- cycle progress bar
- time remaining or cycle duration
- next payout estimate
- last payout tick
- estimated average income/sec
- Power use

### Important approved visual requirement
The player should **visually see a progress bar** and also see a clear **money tick** when a cycle completes.

This is a non-negotiable part of the automation feel.

---

## 9. Research Role in Phase 5
Research in the Automation branch should now unlock two things separately:

### Automation unit unlocks
- Quant Trader
- Rule-Based Bot
- ML Bot
- AI Bot

### Strategy unlocks
- Mean Reversion
- Momentum
- Arbitrage
- Market Making
- Scalping

This is the cleanest structure because it separates:
- what machine exists
from
- what trading logic it is capable of running

---

## 10. Strategy Effect Philosophy
For the first implementation, strategies should not create huge hidden complexity.

### Preferred first-pass rule
The strategy selected for an automation unit affects payout by applying bonuses or penalties based on:
- selected market target
- current event conditions later
- possibly future strategy research or optimizations

### Important note
Do **not** make one automation unit inherently “best” at only one strategy as a hard-coded identity.

That would overcomplicate the progression and make strategy selection feel too rigid.

---

## 11. Power and Automation
Automation remains tied to the Power system.

### Approved interaction
Automation unit performance should still be affected by machine efficiency / power constraints.

So cycle payouts should be influenced by:
- base cycle payout
- automation upgrades and optimisations
- chosen market target
- chosen strategy
- machine efficiency from Power

This preserves the existing Power system relevance.

---

## 12. Final Design Summary for Phase 5
### Final approved Phase 5 rule
**Automation units are unlocked through the Research Automation branch, use shared research-unlocked strategy families, target markets through simple dropdown selection, and generate money through visible timed execution cycles with progress bars and payout ticks.**

This is the official machine-side design identity.

---

# PART II — IMPLEMENTATION / SPECIFICATION SHEET

## 13. New Automation Unit Types
Suggested type:

```ts
export type AutomationUnitType =
  | 'quantTrader'
  | 'ruleBasedBot'
  | 'mlBot'
  | 'aiBot';
```

---

## 14. New Strategy Types
Suggested type:

```ts
export type AutomationStrategyId =
  | 'meanReversion'
  | 'momentum'
  | 'arbitrage'
  | 'marketMaking'
  | 'scalping';
```

---

## 15. Market Target Type
Automation units should target existing sectors via a simple sector selector.

```ts
export type AutomationMarketTarget = SectorId;
```

---

## 16. GameState Additions
The automation system needs both ownership state and runtime execution state.

Suggested additions:

```ts
automationUnits: {
  quantTrader: number;
  ruleBasedBot: number;
  mlBot: number;
  aiBot: number;
};

automationConfig: {
  quantTrader: {
    strategy: AutomationStrategyId | null;
    marketTarget: SectorId | null;
  };
  ruleBasedBot: {
    strategy: AutomationStrategyId | null;
    marketTarget: SectorId | null;
  };
  mlBot: {
    strategy: AutomationStrategyId | null;
    marketTarget: SectorId | null;
  };
  aiBot: {
    strategy: AutomationStrategyId | null;
    marketTarget: SectorId | null;
  };
};

automationCycleState: {
  quantTrader: {
    progressSeconds: number;
    lastPayout: number;
  };
  ruleBasedBot: {
    progressSeconds: number;
    lastPayout: number;
  };
  mlBot: {
    progressSeconds: number;
    lastPayout: number;
  };
  aiBot: {
    progressSeconds: number;
    lastPayout: number;
  };
};
```

### Important first-pass simplification
Cycle progress is tracked per unit class, not per individual owned bot. This keeps implementation manageable.

---

## 17. Research Tech Additions
The Automation branch should gain new unit unlock nodes and strategy unlock nodes.

### Unit unlock techs
- `quantTradingSystems`
- `ruleBasedAutomation`
- `machineLearningTrading`
- `aiTradingSystems`

### Strategy unlock techs
- `meanReversionModels`
- `momentumModels`
- `arbitrageEngine`
- `marketMakingEngine`
- `scalpingFramework`

These can be added under the existing `automation` branch.

---

## 18. Initial Unit Unlock Responsibilities
### Quant Trader
Unlocked by `quantTradingSystems`

### Rule-Based Bot
Unlocked by `ruleBasedAutomation`

### ML Bot
Unlocked by `machineLearningTrading`

### AI Bot
Unlocked by `aiTradingSystems`

---

## 19. Initial Strategy Unlock Responsibilities
### Mean Reversion
Unlocked by `meanReversionModels`

### Momentum
Unlocked by `momentumModels`

### Arbitrage
Unlocked by `arbitrageEngine`

### Market Making
Unlocked by `marketMakingEngine`

### Scalping
Unlocked by `scalpingFramework`

---

## 20. Suggested Initial Tech Costs
These are placeholders for first implementation.

### Unit unlock techs
- Quant Trading Systems: **80 RP**
- Rule-Based Automation: **120 RP**
- Machine Learning Trading: **220 RP**
- AI Trading Systems: **400 RP**

### Strategy unlock techs
- Mean Reversion Models: **60 RP**
- Momentum Models: **80 RP**
- Arbitrage Engine: **140 RP**
- Market Making Engine: **120 RP**
- Scalping Framework: **180 RP**

These should be tuned later.

---

## 21. Initial Unit Purchase Costs
These are example Cash-side purchase values and should be tuned.

- Quant Trader: **$2,500**
- Rule-Based Bot: **$12,000**
- ML Bot: **$80,000**
- AI Bot: **$400,000**

Unit costs should scale by owned count like the rest of the game.

---

## 22. Initial Cycle and Payout Values
Suggested first-pass identity:

### Quant Trader
- cycle duration: **4s**
- base payout: **$20**

### Rule-Based Bot
- cycle duration: **6s**
- base payout: **$70**

### ML Bot
- cycle duration: **12s**
- base payout: **$220**

### AI Bot
- cycle duration: **20s**
- base payout: **$650**

These values are placeholders and should be tuned, but they reflect the approved design:
- higher tiers → longer cycles → larger payouts

---

## 23. Cycle Execution Rule
Each automation unit class accumulates cycle progress over time.

When progress reaches the class’s cycle duration:
- payout is granted
- progress resets or loops
- last payout value is updated for UI display

### First-pass rule
Treat all owned units of the same class as contributing to one combined cycle payout.

So payout on completion is effectively:

```ts
combinedPayout = ownedCount * adjustedPayoutPerUnit
```

This keeps the UI manageable and avoids rendering many separate progress bars.

---

## 24. Market Target and Strategy Configuration Rule
Each automation unit class has one selected:
- market target
- strategy

So the player configures the class as a whole.

### Example
- ML Bot → market target: Technology
- ML Bot → strategy: Momentum

This should remain per-class rather than per-individual unit in the first implementation.

---

## 25. Payout Formula
Suggested first-pass payout formula:

```ts
cyclePayout =
  ownedCount
  * basePayout
  * marketTargetMultiplier
  * strategyMultiplier
  * machineEfficiencyMultiplier
  * automationUpgradeMultiplier
```

### Notes
- `marketTargetMultiplier` can be 1.0 in first implementation if sector-strategy tuning is not ready yet
- `strategyMultiplier` can also begin simple
- the important part for first implementation is the cycle mechanic itself

---

## 26. Power Interaction Rule
Automation payout must respect machine efficiency.

### Approved rule
If machine efficiency is reduced due to insufficient Power, automation cycle payout should be reduced proportionally.

This preserves the Power system’s gameplay relevance.

---

## 27. Suggested Helper Functions
Add helper functions such as:

```ts
isAutomationUnitUnlocked(state, unitType)
isAutomationStrategyUnlocked(state, strategyId)
getAutomationUnitCost(state, unitType)
getAutomationCycleDuration(state, unitType)
getAutomationBasePayout(state, unitType)
getAutomationAdjustedPayout(state, unitType)
getAutomationProgressPercent(state, unitType)
```

These should be shared between gameplay logic and UI.

---

## 28. Tick Loop Integration
The game loop must now update automation cycle progress.

### Conceptual rule
On each tick:
- increase cycle progress for each automation class by `deltaSeconds`
- if progress exceeds cycle duration, pay out the class and wrap the progress

### Important note
This is separate from continuous human passive income.

Humans still produce continuously.
Automation produces in cycle bursts.

---

## 29. New Actions
Suggested actions:

```ts
buyAutomationUnit(unitType, quantity)
setAutomationMarketTarget(unitType, sectorId)
setAutomationStrategy(unitType, strategyId)
processAutomationCycles(deltaSeconds)
```

These may be implemented through the main store/tick architecture instead of standalone public actions, depending on your state setup.

---

## 30. UI Requirements
Automation should have its own dedicated panel or tab, not live in the Sectors page.

### Each automation card should show
- unit name
- owned count
- market target dropdown
- strategy dropdown
- progress bar
- next payout
- last payout
- cycle duration
- estimated average income/sec
- power use
- buy buttons (`x1 / x5 / x10 / Max`)

This is the approved UI model.

---

## 31. Payout Tick Requirement
When a cycle completes, the UI should visibly show the money gained.

### Approved visual behavior
A visible money tick or flash should appear, for example:
- `+$220`
- `+$650`

This is a required part of the feedback loop and should not be omitted.

---

## 32. Save / Load Requirements
The save system must include:

```ts
automationUnits
automationConfig
automationCycleState
```

### Migration defaults
All owned counts should default to 0.
All selected targets/strategies should default to `null`.
All cycle progress values should default to 0.
All last payout values should default to 0.

---

# PART III — CODE-READY STRUCTURAL EXAMPLES

## 33. Type Definitions
```ts
// types/automation.ts

import type { SectorId } from './sector';

export type AutomationUnitType =
  | 'quantTrader'
  | 'ruleBasedBot'
  | 'mlBot'
  | 'aiBot';

export type AutomationStrategyId =
  | 'meanReversion'
  | 'momentum'
  | 'arbitrage'
  | 'marketMaking'
  | 'scalping';

export type AutomationConfig = {
  strategy: AutomationStrategyId | null;
  marketTarget: SectorId | null;
};

export type AutomationCycleRuntime = {
  progressSeconds: number;
  lastPayout: number;
};
```

---

## 34. Unit Definition Data Example
```ts
// data/automationUnits.ts

import type { AutomationUnitType } from '../types/automation';

type AutomationUnitDefinition = {
  id: AutomationUnitType;
  name: string;
  baseCost: number;
  costScaling: number;
  cycleDurationSeconds: number;
  basePayout: number;
  powerUse: number;
};

export const AUTOMATION_UNITS: Record<AutomationUnitType, AutomationUnitDefinition> = {
  quantTrader: {
    id: 'quantTrader',
    name: 'Quant Trader',
    baseCost: 2500,
    costScaling: 1.22,
    cycleDurationSeconds: 4,
    basePayout: 20,
    powerUse: 0,
  },
  ruleBasedBot: {
    id: 'ruleBasedBot',
    name: 'Rule-Based Bot',
    baseCost: 12000,
    costScaling: 1.24,
    cycleDurationSeconds: 6,
    basePayout: 70,
    powerUse: 2,
  },
  mlBot: {
    id: 'mlBot',
    name: 'ML Bot',
    baseCost: 80000,
    costScaling: 1.26,
    cycleDurationSeconds: 12,
    basePayout: 220,
    powerUse: 6,
  },
  aiBot: {
    id: 'aiBot',
    name: 'AI Bot',
    baseCost: 400000,
    costScaling: 1.28,
    cycleDurationSeconds: 20,
    basePayout: 650,
    powerUse: 15,
  },
};
```

---

## 35. GameState Patch Example
```ts
// types/game.ts

import type { AutomationUnitType, AutomationConfig, AutomationCycleRuntime } from './automation';

export type GameState = {
  automationUnits: Record<AutomationUnitType, number>;
  automationConfig: Record<AutomationUnitType, AutomationConfig>;
  automationCycleState: Record<AutomationUnitType, AutomationCycleRuntime>;

  // existing fields...
};
```

---

## 36. Helper Example
```ts
// utils/automation.ts

import type { GameState } from '../types/game';
import type { AutomationUnitType } from '../types/automation';
import { AUTOMATION_UNITS } from '../data/automationUnits';

export function getAutomationCycleDuration(unitType: AutomationUnitType): number {
  return AUTOMATION_UNITS[unitType].cycleDurationSeconds;
}

export function getAutomationBasePayout(unitType: AutomationUnitType): number {
  return AUTOMATION_UNITS[unitType].basePayout;
}

export function getAutomationOwnedCount(state: GameState, unitType: AutomationUnitType): number {
  return state.automationUnits[unitType] || 0;
}

export function getAutomationProgressPercent(state: GameState, unitType: AutomationUnitType): number {
  const duration = getAutomationCycleDuration(unitType);
  const progress = state.automationCycleState[unitType]?.progressSeconds || 0;
  return Math.min(1, progress / duration);
}
```

---

## 37. Tick Processing Example
```ts
// utils/automationTick.ts

import type { GameState } from '../types/game';
import type { AutomationUnitType } from '../types/automation';
import { AUTOMATION_UNITS } from '../data/automationUnits';

const UNIT_TYPES: AutomationUnitType[] = ['quantTrader', 'ruleBasedBot', 'mlBot', 'aiBot'];

export function processAutomationCycles(state: GameState, deltaSeconds: number): GameState {
  let nextState = { ...state, automationCycleState: { ...state.automationCycleState } };

  for (const unitType of UNIT_TYPES) {
    const owned = nextState.automationUnits[unitType] || 0;
    if (owned <= 0) continue;

    const runtime = nextState.automationCycleState[unitType];
    const definition = AUTOMATION_UNITS[unitType];
    const duration = definition.cycleDurationSeconds;

    let nextProgress = runtime.progressSeconds + deltaSeconds;
    let payout = 0;

    while (nextProgress >= duration) {
      nextProgress -= duration;
      payout += owned * definition.basePayout;
    }

    nextState.automationCycleState[unitType] = {
      progressSeconds: nextProgress,
      lastPayout: payout,
    };

    nextState.cash += payout;
    nextState.lifetimeCashEarned += payout;
  }

  return nextState;
}
```

### Note
Real implementation should extend payout by strategy, market target, and power efficiency multipliers.
This sample demonstrates the cycle structure only.

---

## 38. UI Example Component
```tsx
// components/AutomationCard.tsx

import type { AutomationStrategyId, AutomationUnitType } from '../types/automation';
import type { SectorId } from '../types/sector';

type AutomationCardProps = {
  title: string;
  owned: number;
  cycleDuration: number;
  progressPercent: number;
  nextPayout: number;
  lastPayout: number;
  estimatedPerSecond: number;
  powerUse: number;
  selectedStrategy: AutomationStrategyId | null;
  selectedMarketTarget: SectorId | null;
  onChangeStrategy: (strategy: AutomationStrategyId) => void;
  onChangeTarget: (sectorId: SectorId) => void;
  onBuy: (quantity: 1 | 5 | 10 | 'max') => void;
};

export function AutomationCard({
  title,
  owned,
  cycleDuration,
  progressPercent,
  nextPayout,
  lastPayout,
  estimatedPerSecond,
  powerUse,
  selectedStrategy,
  selectedMarketTarget,
  onChangeStrategy,
  onChangeTarget,
  onBuy,
}: AutomationCardProps) {
  return (
    <div className="rounded border border-slate-700 bg-slate-900 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        <span className="text-xs text-slate-400">Owned: {owned}</span>
      </div>

      <div className="mb-3 grid gap-2 text-xs text-slate-300">
        <div>Cycle: {cycleDuration.toFixed(1)}s</div>
        <div>Next payout: ${nextPayout.toLocaleString()}</div>
        <div>Last payout: +${lastPayout.toLocaleString()}</div>
        <div>Estimated: ${estimatedPerSecond.toFixed(1)}/sec</div>
        <div>Power use: {powerUse}</div>
      </div>

      <div className="mb-3 h-2 overflow-hidden rounded bg-slate-800">
        <div
          className="h-full bg-cyan-500 transition-all"
          style={{ width: `${progressPercent * 100}%` }}
        />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <select
          value={selectedMarketTarget ?? ''}
          onChange={(e) => onChangeTarget(e.target.value as SectorId)}
          className="rounded bg-slate-950 px-2 py-2 text-sm text-slate-100"
        >
          <option value="">Target Market</option>
          <option value="finance">Finance</option>
          <option value="technology">Technology</option>
          <option value="energy">Energy</option>
        </select>

        <select
          value={selectedStrategy ?? ''}
          onChange={(e) => onChangeStrategy(e.target.value as AutomationStrategyId)}
          className="rounded bg-slate-950 px-2 py-2 text-sm text-slate-100"
        >
          <option value="">Strategy</option>
          <option value="meanReversion">Mean Reversion</option>
          <option value="momentum">Momentum</option>
          <option value="arbitrage">Arbitrage</option>
          <option value="marketMaking">Market Making</option>
          <option value="scalping">Scalping</option>
        </select>
      </div>

      <div className="flex gap-2">
        {[1, 5, 10, 'max'].map((qty) => (
          <button
            key={String(qty)}
            onClick={() => onBuy(qty as 1 | 5 | 10 | 'max')}
            className="rounded bg-cyan-600 px-3 py-1 text-sm text-white hover:bg-cyan-500"
          >
            {qty === 'max' ? 'Max' : `x${qty}`}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

# PART IV — IMPLEMENTATION ORDER AND TESTING

## 39. Recommended Implementation Order
### Step 1
Add automation unit and strategy types.

### Step 2
Add automation unit definitions and state fields.

### Step 3
Add automation unit unlock research nodes and strategy unlock research nodes.

### Step 4
Implement purchase flow for automation units.

### Step 5
Implement cycle runtime state and tick processing.

### Step 6
Add automation cards with progress bars and payout display.

### Step 7
Add market target and strategy dropdowns.

### Step 8
Hook payout calculations into power efficiency and future strategy/market modifiers.

### Step 9
Balance test pacing and visual feel.

---

## 40. Testing Checklist
Phase 5 should be considered successful if:
- automation unlocks correctly through the Automation branch
- strategy unlocks correctly through research
- progress bars fill and reset correctly
- payout ticks are visible and satisfying
- higher automation tiers feel heavier and chunkier rather than simply faster
- automation feels distinct from human production
- the Sectors tab remains clean because automation is managed elsewhere

---

## 41. Final Summary
Phase 5 establishes the machine-side strategic identity of the game.

### Final approved Phase 5 rule
**Automation units are unlocked through the Automation research branch, use shared research-unlocked strategies, target markets through simple dropdowns, and generate money through visible timed execution cycles with progress bars and payout ticks.**

This is now the design and implementation source of truth for Phase 5.

