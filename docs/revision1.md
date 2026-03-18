Stock Incremental Game — Extension Document
Purpose of This Document
This document is an extension to the original design and implementation plan.
The original design has already been implemented at a high level. This extension exists to clearly define what is changing based on the latest design decisions.
This is not a full replacement document. It is a revision document that should be read as:
what systems are being replaced
what systems are being renamed or restructured
what new logic should now be implemented going forward
---
Summary of Major Changes
The new direction changes the game structure in four important ways:
Senior Traders are no longer created by promoting Junior Traders.
Junior Traders, Senior Traders, and Trading Bots are now all separate buyable units.
Research now serves as the unlock layer for capabilities and unit tiers.
Operations now serves as the deployment and scaling layer, including bulk buying.
This means the previous promotion-based staff progression model is being removed and replaced with a unit tier unlock model.
---
System Change 1 — Remove Promotion-Based Senior Traders
Previous Design
Previously, the design used this structure:
Junior Traders were buyable units
Senior Traders were created by promoting Junior Traders
the player had to unlock promotion and convert Juniors one by one
New Design
This model is now removed.
Senior Traders are no longer produced by transforming Junior Traders.
They are now their own separate unit tier.
Result
The following concepts should be removed from current and future implementation:
Promotion Program as the method of creating Senior Traders
Promote to Senior Trader action
promotion batching logic
any state logic that subtracts Juniors and adds Seniors through conversion
Replacement
Senior Traders are now unlocked via Research and purchased directly in Operations.
---
System Change 2 — Unit Tier Model
The game should now use a cleaner three-tier unit structure:
Unit Tier 1 — Junior Traders
first human staff unit
lower cost
lower output
early-game passive income source
Unit Tier 2 — Senior Traders
second human staff unit
unlocked later
significantly stronger than Juniors
more expensive
should gradually outpace Juniors over time
Unit Tier 3 — Trading Bots
late-game automation unit
unlocked later than Seniors
expensive and prestigious
eventually strongest with later upgrades
---
Balance Intention for Junior vs Senior Traders
Junior Traders and Senior Traders should not be identical tiers with different numbers.
They should have a clear economic relationship.
Intended Relationship
A Senior Trader should feel like a higher-tier purchase that eventually replaces Junior Traders as the main human income source.
Current Design Direction
The intended rough ratio is:
1 Senior Trader ≈ 10 Junior Traders over time
This does not have to be true immediately at first unlock, but it should be the balancing target once the Senior layer is established.
Design Meaning
Juniors are the quantity unit
Seniors are the quality unit
Juniors dominate early expansion because they are cheap
Seniors become the better long-term human investment
This allows Juniors to matter in the early and early-mid game while ensuring Seniors become the more advanced staff layer.
---
System Change 3 — Research and Operations Split
The game should now be organized around a clearer gameplay structure:
Research
Research is the unlock and strategy layer.
Research should handle:
unlocking new unit tiers
unlocking new capabilities
global or systemic upgrades
intelligence, analytics, and market tools
Operations
Operations is the purchase and scaling layer.
Operations should handle:
buying unlocked units
buying direct operational upgrades
scaling the firm through bulk purchasing
This replaces the less clear previous structure where unlocks, unit growth, and upgrades were more blended together.
---
New Rule — Research Unlocks, Operations Buys
The new guiding rule should be:
Research unlocks access
Examples:
unlock Junior Traders
unlock Senior Traders
unlock Trading Bots
Operations buys and scales the unlocked content
Examples:
buy Junior Traders in bulk
buy Senior Traders in bulk
buy Trading Bots in bulk
This is now the intended system pattern for all major progression layers.
---
Revised Tab / Panel Structure
Trading Panel
Trading should no longer be treated as a mostly empty standalone tab.
It should instead be the always-visible main action panel.
Trading should contain:
Make Trade button
current Cash
Cash per Click
Cash per Second
manual trading upgrades
active trade feedback
Operations Tab
Operations should contain:
Junior Trader purchase card
Senior Trader purchase card
Trading Bot purchase card
direct operational upgrades
bulk purchase controls
Research Tab
Research should contain:
unit unlocks
market intelligence upgrades
global multipliers
strategic systems and advanced capability unlocks
Prestige Tab
Prestige remains its own tab and continues to manage:
Reputation
prestige gain preview
prestige upgrades
reset flow
---
Exact Contents — Operations Tab
Operations should now contain the following categories:
Buyable Units
Junior Traders
Senior Traders
Trading Bots
Direct Operational Upgrades
These are upgrades that improve workforce performance or execution infrastructure.
Examples:
Desk Upgrade
Training Program
Executive Training
Corner Office
Low-Latency Servers
Co-Located Servers
Institutional Execution Stack
Bulk Purchase Controls
Operations should also contain purchase mode controls for repeatable actions.
Recommended modes:
x1
x5
x10
Max
These controls should apply to:
Junior Traders
Senior Traders
Trading Bots
Because Senior Traders are now directly buyable, there is no longer any need for promotion batching.
---
Exact Contents — Research Tab
Research should now contain the following categories:
Unit Unlocks
These unlock access to future Operations purchases.
Recommended structure:
Junior Hiring Program → unlock Junior Traders
Senior Recruitment → unlock Senior Traders
Algorithmic Trading → unlock Trading Bots
Trading Intelligence Upgrades
These improve direct trading or analytical sophistication.
Examples:
Better Terminal
Hotkey Macros
Premium Data Feed
Execution Suite
AI Pattern Scanner
Global / Systemic Upgrades
These improve the overall economy or grant firm-wide advantages.
Examples:
Trade Multiplier
Bull Market
Institutional Capital
Global Liquidity
---
System Change 4 — Manual Upgrades Move Out of the Old Shop Structure
Manual trading upgrades should no longer live in a vague generic shop structure.
They should now be presented as part of the player’s direct trading layer.
Depending on final UI implementation, they can appear either:
inside the always-visible Trading panel
or inside the Research tab as trading intelligence upgrades
Current Recommendation
For clarity and to make the Trading panel feel more substantial, manual upgrades should be surfaced in or near the Trading panel.
Recommended manual upgrades:
Better Terminal
Hotkey Macros
Premium Data Feed
Execution Suite
---
Unit Unlock Flow — Revised Progression
The intended revised progression is now:
Early Game
Research: unlock Junior Traders
Operations: buy Junior Traders
Mid Game
Research: unlock Senior Traders
Operations: buy Senior Traders
Late Game
Research: unlock Trading Bots
Operations: buy Trading Bots
This creates a consistent progression rhythm:
research a new capability → deploy it in operations → scale it with bulk buying
This is now the preferred progression pattern for the game.
---
Implementation Impact — State and Logic Changes
Because the original design included promotions, the implementation plan needs the following revisions.
State Changes
Remove or deprecate any state fields related to promotion-only logic if they exist.
No special conversion state is needed between Juniors and Seniors.
The core repeatable unit counts should now simply be:
juniorTraderCount
seniorTraderCount
tradingBotCount
Action Changes
Remove or deprecate actions like:
promoteJuniorToSenior()
batchPromoteToSenior()
Replace with direct purchase actions such as:
buyJuniorTrader(quantity)
buySeniorTrader(quantity)
buyTradingBot(quantity)
Unlock Logic Changes
Add or revise unlock flags for:
juniorTraderUnlocked
seniorTraderUnlocked
tradingBotUnlocked
These can be represented via purchased Research upgrades or derived unlock conditions.
---
Implementation Impact — Data Model Changes
The original unit and upgrade data should be revised as follows.
Senior Trader
Senior Trader should now be a normal unit definition with:
base cost
cost scaling
base income per second
unlock condition
Senior Trader should no longer be treated as a promotion-only derived unit.
Research Unlock Definitions
The system should now include explicit unlock upgrades for:
Junior Hiring Program
Senior Recruitment
Algorithmic Trading
These upgrades should appear in Research and toggle access to Operations unit purchases.
---
Implementation Impact — UI Changes
The UI should be revised as follows.
Remove
promotion action card
promotion-specific batch controls
promotion-only explanation text
Add
Senior Trader unit card in Operations
batch purchase support for Senior Traders
Research unlock card for Senior Recruitment
Reframe
Trading becomes the central active panel instead of a mostly empty tab
Operations becomes the main scaling tab for repeatable unit purchases
Research becomes the strategic unlock layer
---
Recommended Starter Balance Direction After This Revision
These numbers are still tuning targets, but the hierarchy should now follow this structure:
Junior Traders
lower cost
weaker individual output
faster early scaling
Senior Traders
significantly higher cost
much stronger output
better long-term human investment
Trading Bots
late unlock
high cost
strongest eventual scaling with upgrades
Target Relationship
Approximate intended feeling:
early game = Juniors dominate
mid game = Seniors overtake as the best human unit
late game = Bots become the strongest unit class after research and later upgrades
---
What Stays the Same
The following major design pillars remain unchanged:
Cash remains the main currency
Reputation remains the prestige currency
the first prestige should still occur only after the bot phase and slowdown
bots should still arrive late in the first run
the overall tone remains clean, semi-serious, and finance-terminal inspired
Operations and Research remain the preferred tab structure
batch buying remains part of the Operations design
This extension revises the unit progression model, not the core identity of the game.
---
Final Extension Summary
This extension replaces the original promotion-based Senior Trader model with a cleaner tiered unit system.
The game should now be structured around three separate buyable unit classes:
Junior Traders
Senior Traders
Trading Bots
Research should unlock these capabilities.
Operations should deploy and scale them.
The new intended progression rhythm is:
research a new tier → buy the unit in operations → scale it with x1, x5, x10, and Max controls
Senior Traders should no longer be created by converting Juniors. They are now their own unlocked and directly purchasable unit tier.
This revision should be treated as the current intended design direction for all future implementation work.



# Stock Incremental Game — Delta Implementation Sheet

## Purpose

This document describes the **implementation changes** required to move from the old model:

* Junior Traders as buyable units
* Senior Traders created via promotion
* Trading Bots unlocked later

to the new model:

* Junior Traders as their own unit
* Senior Traders as their own unit
* Trading Bots as their own unit
* **Research unlocks tiers**
* **Operations buys units**
* bulk purchase applies to all repeatable unit purchases

---

# 1. High-Level System Delta

## Old model

* `Junior Trader` = buyable unit
* `Senior Trader` = created by converting Juniors
* `Promotion Program` = unlocks Senior conversion
* `promoteJuniorToSenior()` = core action

## New model

* `Junior Trader` = buyable unit
* `Senior Trader` = directly buyable unit
* `Trading Bot` = directly buyable unit
* `Junior Hiring Program` = unlocks Juniors
* `Senior Recruitment` = unlocks Seniors
* `Algorithmic Trading` = unlocks Bots
* `buyUnit(unitId, quantity)` = core repeatable purchase flow

---

# 2. State Model Changes

## Remove

* promotion-specific logic
* conversion-driven Senior creation

### Remove deprecated fields/actions if they exist

* `promotionUnlocked`
* `promoteJuniorToSenior`
* `batchPromoteToSenior`

## Add / keep

* explicit unlock state for each unit tier
* direct counts for each unit

```ts
// types/game.ts

export type UnitId = 'juniorTrader' | 'seniorTrader' | 'tradingBot';

export type ResearchUnlockId =
  | 'juniorHiringProgram'
  | 'seniorRecruitment'
  | 'algorithmicTrading';

export type GameState = {
  cash: number;
  lifetimeCashEarned: number;

  reputation: number;
  reputationSpent: number;
  prestigeCount: number;

  juniorTraderCount: number;
  seniorTraderCount: number;
  tradingBotCount: number;

  purchasedUpgrades: Record<string, boolean>;
  purchasedPrestigeUpgrades: Record<string, number>;

  lastSaveTimestamp: number;
  totalOfflineSecondsApplied: number;

  settings: {
    autosaveEnabled: boolean;
    shortNumberThreshold: number;
  };

  ui: {
    operationsBuyMode: 1 | 5 | 10 | 'max';
    activeManagementTab: 'operations' | 'research' | 'prestige';
  };
};
```

---

# 3. Unit Definition Delta

## Old model issue

`Senior Trader` existed as a derived unit without a normal purchase loop.

## New model

All three units are normal unit definitions.

```ts
// data/units.ts

import type { UnitId } from '../types/game';

export type UnitDefinition = {
  id: UnitId;
  name: string;
  baseCost: number;
  costScaling: number;
  baseIncomePerSecond: number;
  description: string;
  unlockUpgradeId: string;
};

export const UNITS: Record<UnitId, UnitDefinition> = {
  juniorTrader: {
    id: 'juniorTrader',
    name: 'Junior Trader',
    baseCost: 75,
    costScaling: 1.18,
    baseIncomePerSecond: 1,
    description: 'Entry-level staff who generate early passive income.',
    unlockUpgradeId: 'juniorHiringProgram',
  },

  seniorTrader: {
    id: 'seniorTrader',
    name: 'Senior Trader',
    baseCost: 2500,
    costScaling: 1.2,
    baseIncomePerSecond: 10,
    description: 'Higher-tier staff with stronger long-term output.',
    unlockUpgradeId: 'seniorRecruitment',
  },

  tradingBot: {
    id: 'tradingBot',
    name: 'Trading Bot',
    baseCost: 40000,
    costScaling: 1.2,
    baseIncomePerSecond: 40,
    description: 'Late-game algorithmic automation.',
    unlockUpgradeId: 'algorithmicTrading',
  },
};
```

Note:
That **Senior Trader = 10/sec** against **Junior Trader = 1/sec** matches the design direction that Seniors should roughly feel like **10 Juniors over time**.

---

# 4. Upgrade Category Delta

## Old model

Categories were:

* manual
* staff
* automation
* global
* prestige

## New model

Use:

* trading
* operations
* research
* prestige

```ts
// types/game.ts

export type UpgradeCategory =
  | 'trading'
  | 'operations'
  | 'research'
  | 'prestige';
```

---

# 5. Upgrade Definition Delta

## Old model

* `Promotion Program` existed
* Senior logic lived in staff upgrades

## New model

* remove promotion unlocks
* add explicit research unlocks for unit tiers

```ts
// data/upgrades.ts

import type { GameState, UpgradeCategory } from '../types/game';

export type UpgradeId =
  | 'betterTerminal'
  | 'hotkeyMacros'
  | 'premiumDataFeed'
  | 'deskUpgrade'
  | 'trainingProgram'
  | 'executiveTraining'
  | 'lowLatencyServers'
  | 'tradeMultiplier'
  | 'bullMarket'
  | 'juniorHiringProgram'
  | 'seniorRecruitment'
  | 'algorithmicTrading';

export type UpgradeDefinition = {
  id: UpgradeId;
  name: string;
  category: UpgradeCategory;
  cost: number;
  description: string;
  visibleWhen?: (state: GameState) => boolean;
};

export const UPGRADES: UpgradeDefinition[] = [
  // Trading
  {
    id: 'betterTerminal',
    name: 'Better Terminal',
    category: 'trading',
    cost: 20,
    description: 'Manual trades go from $1 to $2 per click.',
  },
  {
    id: 'hotkeyMacros',
    name: 'Hotkey Macros',
    category: 'trading',
    cost: 80,
    description: 'Gain +2 cash per click.',
    visibleWhen: (state) => state.purchasedUpgrades['betterTerminal'] === true,
  },
  {
    id: 'premiumDataFeed',
    name: 'Premium Data Feed',
    category: 'trading',
    cost: 300,
    description: 'Manual income gains +50%.',
    visibleWhen: (state) => state.purchasedUpgrades['hotkeyMacros'] === true,
  },

  // Research unlocks
  {
    id: 'juniorHiringProgram',
    name: 'Junior Hiring Program',
    category: 'research',
    cost: 50,
    description: 'Unlock Junior Traders in Operations.',
  },
  {
    id: 'seniorRecruitment',
    name: 'Senior Recruitment',
    category: 'research',
    cost: 10000,
    description: 'Unlock Senior Traders in Operations.',
    visibleWhen: (state) => state.juniorTraderCount >= 5,
  },
  {
    id: 'algorithmicTrading',
    name: 'Algorithmic Trading',
    category: 'research',
    cost: 100000,
    description: 'Unlock Trading Bots in Operations.',
    visibleWhen: (state) => state.seniorTraderCount >= 3,
  },

  // Research systemic upgrades
  {
    id: 'tradeMultiplier',
    name: 'Trade Multiplier',
    category: 'research',
    cost: 1000,
    description: 'All profits gain +25%.',
  },
  {
    id: 'bullMarket',
    name: 'Bull Market',
    category: 'research',
    cost: 8000,
    description: 'All profits gain +50%.',
    visibleWhen: (state) => state.purchasedUpgrades['tradeMultiplier'] === true,
  },

  // Operations upgrades
  {
    id: 'deskUpgrade',
    name: 'Desk Upgrade',
    category: 'operations',
    cost: 250,
    description: 'Junior Traders go from $1/sec to $2/sec.',
    visibleWhen: (state) => state.juniorTraderCount > 0,
  },
  {
    id: 'trainingProgram',
    name: 'Training Program',
    category: 'operations',
    cost: 2000,
    description: 'Junior Traders gain +1 cash/sec.',
    visibleWhen: (state) => state.juniorTraderCount > 0,
  },
  {
    id: 'executiveTraining',
    name: 'Executive Training',
    category: 'operations',
    cost: 25000,
    description: 'Senior Traders go from $10/sec to $15/sec.',
    visibleWhen: (state) => state.seniorTraderCount > 0,
  },
  {
    id: 'lowLatencyServers',
    name: 'Low-Latency Servers',
    category: 'operations',
    cost: 175000,
    description: 'Trading Bots go from $40/sec to $65/sec.',
    visibleWhen: (state) => state.tradingBotCount > 0,
  },
];
```

---

# 6. Remove Promotion Logic

## Delete or deprecate

```ts
// REMOVE
promoteJuniorToSenior()

// REMOVE
batchPromoteToSenior()

// REMOVE
promotionProgram
```

## Replace with

* `seniorRecruitment` research unlock
* direct `buyUnit('seniorTrader', quantity)`

---

# 7. New Shared Purchase Flow

Instead of separate purchase functions per unit, use one generic one.

```ts
// utils/economy.ts

import type { GameState, UnitId } from '../types/game';
import { UNITS } from '../data/units';

export function getScaledCost(
  baseCost: number,
  scaling: number,
  owned: number
): number {
  return Math.floor(baseCost * Math.pow(scaling, owned));
}

export function isUnitUnlocked(state: GameState, unitId: UnitId): boolean {
  const unlockUpgradeId = UNITS[unitId].unlockUpgradeId;
  return state.purchasedUpgrades[unlockUpgradeId] === true;
}

export function getUnitCount(state: GameState, unitId: UnitId): number {
  switch (unitId) {
    case 'juniorTrader':
      return state.juniorTraderCount;
    case 'seniorTrader':
      return state.seniorTraderCount;
    case 'tradingBot':
      return state.tradingBotCount;
  }
}

export function getNextUnitCost(state: GameState, unitId: UnitId): number {
  const unit = UNITS[unitId];
  const owned = getUnitCount(state, unitId);
  return getScaledCost(unit.baseCost, unit.costScaling, owned);
}

export function getBulkUnitCost(
  state: GameState,
  unitId: UnitId,
  quantity: number | 'max'
): { quantity: number; totalCost: number } {
  if (!isUnitUnlocked(state, unitId)) {
    return { quantity: 0, totalCost: 0 };
  }

  const unit = UNITS[unitId];
  const owned = getUnitCount(state, unitId);

  if (quantity === 'max') {
    let totalCost = 0;
    let bought = 0;
    let simulatedOwned = owned;

    while (true) {
      const nextCost = getScaledCost(
        unit.baseCost,
        unit.costScaling,
        simulatedOwned
      );

      if (totalCost + nextCost > state.cash) break;

      totalCost += nextCost;
      simulatedOwned += 1;
      bought += 1;
    }

    return { quantity: bought, totalCost };
  }

  let totalCost = 0;

  for (let i = 0; i < quantity; i += 1) {
    totalCost += getScaledCost(
      unit.baseCost,
      unit.costScaling,
      owned + i
    );
  }

  return { quantity, totalCost };
}
```

---

# 8. New Generic Buy Action

```ts
// store/gameActions.ts

import type { GameState, UnitId } from '../types/game';
import { getBulkUnitCost, isUnitUnlocked } from '../utils/economy';

export function buyUnit(
  state: GameState,
  unitId: UnitId,
  quantity: 1 | 5 | 10 | 'max'
): GameState {
  if (!isUnitUnlocked(state, unitId)) return state;

  const result = getBulkUnitCost(state, unitId, quantity);
  if (result.quantity <= 0 || state.cash < result.totalCost) return state;

  const nextState = {
    ...state,
    cash: state.cash - result.totalCost,
  };

  switch (unitId) {
    case 'juniorTrader':
      return {
        ...nextState,
        juniorTraderCount: state.juniorTraderCount + result.quantity,
      };

    case 'seniorTrader':
      return {
        ...nextState,
        seniorTraderCount: state.seniorTraderCount + result.quantity,
      };

    case 'tradingBot':
      return {
        ...nextState,
        tradingBotCount: state.tradingBotCount + result.quantity,
      };
  }
}
```

---

# 9. Income Formula Delta

## Old model

Senior Traders depended on promotion flow.

## New model

Senior income is direct and independent.

```ts
// utils/economy.ts

import type { GameState } from '../types/game';

export function getGlobalMultiplier(state: GameState): number {
  let multiplier = 1;

  if (state.purchasedUpgrades['tradeMultiplier']) multiplier *= 1.25;
  if (state.purchasedUpgrades['bullMarket']) multiplier *= 1.5;

  return multiplier;
}

export function getPrestigeMultiplier(state: GameState): number {
  const directBonus = 1 + state.reputation * 0.05;
  const brandRecognitionRank =
    state.purchasedPrestigeUpgrades['brandRecognition'] || 0;
  const brandRecognitionBonus = 1 + brandRecognitionRank * 0.1;

  return directBonus * brandRecognitionBonus;
}

export function getManualIncome(state: GameState): number {
  let value = 1;

  if (state.purchasedUpgrades['betterTerminal']) value = 2;
  if (state.purchasedUpgrades['hotkeyMacros']) value += 2;
  if (state.purchasedUpgrades['premiumDataFeed']) value *= 1.5;

  return value * getGlobalMultiplier(state) * getPrestigeMultiplier(state);
}

export function getJuniorTraderIncome(state: GameState): number {
  let value = 1;

  if (state.purchasedUpgrades['deskUpgrade']) value = 2;
  if (state.purchasedUpgrades['trainingProgram']) value += 1;

  return value;
}

export function getSeniorTraderIncome(state: GameState): number {
  let value = 10;

  if (state.purchasedUpgrades['executiveTraining']) value = 15;

  return value;
}

export function getTradingBotIncome(state: GameState): number {
  let value = 40;

  if (state.purchasedUpgrades['lowLatencyServers']) value = 65;

  return value;
}

export function getCashPerSecond(state: GameState): number {
  const juniors = state.juniorTraderCount * getJuniorTraderIncome(state);
  const seniors = state.seniorTraderCount * getSeniorTraderIncome(state);
  const bots = state.tradingBotCount * getTradingBotIncome(state);

  return (juniors + seniors + bots)
    * getGlobalMultiplier(state)
    * getPrestigeMultiplier(state);
}
```

---

# 10. Selectors Delta

```ts
// data/selectors.ts

import type { GameState, UnitId } from '../types/game';
import {
  getCashPerSecond,
  getManualIncome,
  getNextUnitCost,
  isUnitUnlocked,
} from '../utils/economy';
import { getPrestigeGain } from '../utils/prestige';

export const selectors = {
  cashPerClick: (state: GameState) => getManualIncome(state),
  cashPerSecond: (state: GameState) => getCashPerSecond(state),

  isUnitUnlocked: (state: GameState, unitId: UnitId) =>
    isUnitUnlocked(state, unitId),

  nextJuniorTraderCost: (state: GameState) =>
    getNextUnitCost(state, 'juniorTrader'),

  nextSeniorTraderCost: (state: GameState) =>
    getNextUnitCost(state, 'seniorTrader'),

  nextTradingBotCost: (state: GameState) =>
    getNextUnitCost(state, 'tradingBot'),

  prestigeGainPreview: (state: GameState) =>
    getPrestigeGain(state.lifetimeCashEarned),
};
```

---

# 11. UI Delta

## Old UI assumptions

* Trading tab mostly empty
* promotion button/action
* mixed shop categories

## New UI structure

### Trading panel

Always visible main panel.

Contains:

* Cash
* Cash/sec
* Cash/click
* Make Trade button
* manual upgrades

### Operations tab

Contains:

* buy mode toggle: `x1 / x5 / x10 / Max`
* Junior Trader card
* Senior Trader card
* Trading Bot card
* operations upgrades

### Research tab

Contains:

* Junior Hiring Program
* Senior Recruitment
* Algorithmic Trading
* global upgrades
* research/system upgrades

### Prestige tab

No structural change beyond category naming consistency.

---

# 12. Buy Mode UI Model

```ts
// example UI state helpers

export type BuyMode = 1 | 5 | 10 | 'max';

export const BUY_MODES: BuyMode[] = [1, 5, 10, 'max'];
```

```tsx
// example component snippet

type BuyModeSelectorProps = {
  value: 1 | 5 | 10 | 'max';
  onChange: (value: 1 | 5 | 10 | 'max') => void;
};

export function BuyModeSelector({
  value,
  onChange,
}: BuyModeSelectorProps) {
  const modes: Array<1 | 5 | 10 | 'max'> = [1, 5, 10, 'max'];

  return (
    <div className="flex gap-2">
      {modes.map((mode) => (
        <button
          key={String(mode)}
          onClick={() => onChange(mode)}
          className={`px-3 py-1 rounded ${
            value === mode ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'
          }`}
        >
          {typeof mode === 'number' ? `x${mode}` : 'Max'}
        </button>
      ))}
    </div>
  );
}
```

---

# 13. Unit Card Delta

```tsx
// components/UnitCard.tsx

import type { UnitId } from '../types/game';
import type { BuyMode } from '../types/ui';

type UnitCardProps = {
  title: string;
  unitId: UnitId;
  owned: number;
  nextCost: number;
  unlocked: boolean;
  description: string;
  buyMode: BuyMode;
  onBuy: (unitId: UnitId, quantity: BuyMode) => void;
};

export function UnitCard({
  title,
  unitId,
  owned,
  nextCost,
  unlocked,
  description,
  buyMode,
  onBuy,
}: UnitCardProps) {
  return (
    <div className="rounded border border-slate-700 bg-slate-900 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        <span className="text-xs text-slate-400">Owned: {owned}</span>
      </div>

      <p className="mb-3 text-xs text-slate-400">{description}</p>

      {unlocked ? (
        <button
          onClick={() => onBuy(unitId, buyMode)}
          className="rounded bg-cyan-600 px-3 py-2 text-sm text-white hover:bg-cyan-500"
        >
          Buy {buyMode === 'max' ? 'Max' : `x${buyMode}`} — Next: ${nextCost.toLocaleString()}
        </button>
      ) : (
        <div className="text-xs text-slate-500">Locked via Research</div>
      )}
    </div>
  );
}
```

---

# 14. Initial State Delta

```ts
// data/initialState.ts

import type { GameState } from '../types/game';

export const initialState: GameState = {
  cash: 0,
  lifetimeCashEarned: 0,

  reputation: 0,
  reputationSpent: 0,
  prestigeCount: 0,

  juniorTraderCount: 0,
  seniorTraderCount: 0,
  tradingBotCount: 0,

  purchasedUpgrades: {},
  purchasedPrestigeUpgrades: {},

  lastSaveTimestamp: Date.now(),
  totalOfflineSecondsApplied: 0,

  settings: {
    autosaveEnabled: true,
    shortNumberThreshold: 1_000_000,
  },

  ui: {
    operationsBuyMode: 1,
    activeManagementTab: 'operations',
  },
};
```

---

# 15. Migration Notes

If you already built part of the old model, here’s the clean migration plan.

## Remove

* promotion-based Senior creation
* promotion action buttons
* promotion-specific state
* promotion-specific upgrade definitions

## Rename / reframe

* `Promotion Program` → remove entirely
* add `Senior Recruitment`
* treat `Algorithmic Trading` strictly as a Research unlock
* treat `Senior Trader` as normal Operations unit

## Add

* `juniorHiringProgram`
* `seniorRecruitment`
* generic `buyUnit(unitId, quantity)`
* shared bulk-buy cost calculation
* `operationsBuyMode` in UI state

---

# 16. Final Delta Summary

The implementation should now follow this model:

* **Research unlocks new tiers**
* **Operations buys those tiers in bulk**
* **Senior Traders are no longer promotions**
* **Junior / Senior / Bot are all independent units**
* **Trading is a main panel, not an empty tab**

Core progression is now:

```txt
Research Junior Hiring Program -> Buy Junior Traders
Research Senior Recruitment -> Buy Senior Traders
Research Algorithmic Trading -> Buy Trading Bots
```

And the repeatable purchase model is now:

```txt
Operations buy mode = x1 / x5 / x10 / Max
Applies to Junior Traders / Senior Traders / Trading Bots
```

If you want, I can turn this into a **single downloadable `.md` file** or convert it into a **React-ready starter file set**.



