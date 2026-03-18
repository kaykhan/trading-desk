# Stock Incremental Game — Extension Document: Electricity and Lobbying

## Purpose of This Document

This document is an **extension** to the existing game design.

It only covers the newly added systems:

* **Electricity / Power**
* **Lobbying**

This is not a replacement for the main design document. It should be read as an additive design layer that expands the game’s economy, late-game progression, and prestige-era meta systems.

---

## Summary of New Additions

This extension introduces two new systems:

1. **Electricity**, displayed as **Power**, which supports the machine side of the firm.
2. **Lobbying**, a prestige-unlocked strategic tab that allows the player to influence policies and reshape the game’s economic rules.

These systems are intended to extend the progression fantasy from:

**making trades → running a desk → automating the desk → influencing the system itself**

---

## New System 1 — Electricity / Power

### Design Role

Electricity is a new secondary operational resource for the late game.

It exists to support:

* Trading Bots
* server infrastructure
* machine-heavy automation systems

The purpose of this system is to make automation feel like real infrastructure rather than a free infinite upgrade path.

---

## Core Concept

Electricity should be represented to the player as **Power**.

### Display Model

Use a simple capacity model:

**Power Usage / Power Capacity**

Examples:

* **Power: 60 / 100**
* **Power: 180 / 250**

This is easier to read and more thematic than treating electricity like a per-second fuel bar.

---

## Design Rule — Power Is Capacity, Not Consumable Fuel

Power should **not** be constantly spent and drained away like a fuel meter.

Instead:

* the player buys or upgrades infrastructure that increases **Power Capacity**
* bots and server systems increase **Power Usage**
* the player must maintain enough capacity to support the machine side of the firm

This makes Power a constraint and scaling layer rather than a tedious upkeep resource.

---

## Unlock Timing

Power should not exist in the early human-centered phases.

### Recommended Unlock Timing

Power should appear when advanced automation becomes relevant, specifically around:

* **Trading Bot unlock**, or
* the first major server / automation infrastructure milestone

This ensures that:

* human staff remains simpler and easier to understand
* Power only appears when the machine economy becomes important

---

## What Uses Power

Power should be consumed by machine-oriented assets and upgrades.

### Initial Power Consumers

* Trading Bots
* Low-Latency Servers
* Co-Located Servers
* future advanced automation infrastructure

### What Does Not Use Power

* manual trading
* Junior Traders
* Senior Traders
* basic human desk upgrades

This keeps the distinction clean:

* humans run on payroll and training
* machines run on power and infrastructure

---

## Power Infrastructure

The player should increase Power Capacity by purchasing infrastructure.

These should be separate from the human desk units and positioned as operational support for the automation layer.

### Suggested Early Power Infrastructure

#### Power Contract

* increases Power Capacity
* simple and readable first power upgrade

#### Backup Generator

* adds a small flat Power Capacity increase
* useful as an early support unit

#### Grid Expansion

* larger Power Capacity boost
* represents scaling the firm’s infrastructure

These are starting examples and can be tuned later, but the important point is that Power should be expanded through buyable infrastructure, not passive free growth.

---

## Recommended MVP Display for Power

Once the system unlocks, the main UI should show a compact Power stat in the top area or machine-related section:

* **Power: 60 / 100**

And in the automation / infrastructure area, each machine unit should clearly indicate:

* Power Use per unit
* how close the player is to capacity

This gives players immediate feedback when scaling bots.

---

## Over-Capacity Behavior

Power should not hard-stop the player in a frustrating way.

### Recommended Rule

If Power Usage exceeds Power Capacity, machine systems should become **less efficient** rather than shutting off completely.

### Example

* Power Capacity = 100
* Power Usage = 120
* machine output runs at reduced efficiency

### Recommended Effect

Bot and server efficiency should scale down proportionally when over capacity.

This creates a meaningful penalty while avoiding a harsh all-or-nothing failure state.

---

## Strategic Purpose of Power

Power adds a new late-game tension:

* bots are powerful
* bots require infrastructure
* infrastructure has its own scaling cost

This means the machine economy becomes:

**unlock bots → buy bots → support bots with power → scale servers and infrastructure**

That gives the late game more texture and prevents the automation layer from becoming too flat.

---

## New System 2 — Lobbying

### Design Role

Lobbying is a new prestige-era strategic system.

It represents the player moving beyond simply making money and into influencing the systems, institutions, and policies around the market.

This is intended to be a major thematic step in the game’s progression fantasy.

---

## Core Concept

Lobbying should be a separate tab unlocked through prestige progression.

It should not be part of the normal early or mid-game gameplay loop.

### Purpose of Lobbying

Lobbying exists to let the player:

* influence policy
* reshape economic rules
* modify cost structures
* improve labor, energy, and technology systems
* create deeper long-term strategic variation

---

## Lobbying Unlock

Lobbying should be unlocked via a prestige-layer upgrade.

### Recommended Unlock Upgrade

**Political Access**

This prestige upgrade permanently unlocks the **Lobbying** tab.

### Why This Works

It makes Lobbying feel:

* prestigious
* earned
* system-changing
* appropriately late in the progression

---

## Lobbying Currency

Lobbying should feel distinct from normal prestige upgrades.

### Recommendation

Use a separate Lobbying currency:

**Influence**

### Currency Relationship

* **Reputation** unlocks the Lobbying system and continues to power prestige upgrades
* **Influence** is earned and spent specifically within Lobbying

This creates cleaner system identity and prevents Lobbying from feeling like just another prestige store.

---

## What Influence Represents

Influence represents:

* political capital
* regulatory leverage
* government relationships
* institutional pull

This fits the theme of a larger, richer firm beginning to shape the environment around it rather than only reacting to it.

---

## How Influence Should Be Earned

For now, the system should define Influence as a prestige-era meta resource, but keep the exact earning formula open for tuning.

### Recommended Starting Direction

Influence can be earned through:

* reaching prestige milestones
* late-run economic scale
* specialized prestige upgrades
* future lobbying or political milestone actions

For MVP+ planning, the exact earning method can remain flexible, but the design intent is clear:

**Influence should be slower, rarer, and more strategic than Cash.**

---

## Lobbying Tab Structure

Lobbying should be a dedicated tab with major policy categories.

### Recommended Policy Tracks

#### Labor Policy

Affects human staff systems.

#### Energy Policy

Affects Power infrastructure and machine efficiency.

#### Market Policy

Affects general profitability and economic conditions.

#### Technology Policy

Affects automation, bots, and infrastructure scaling.

These tracks give Lobbying a strong thematic structure and help organize future upgrades clearly.

---

## Labor Policy

This track affects:

* Junior Traders
* Senior Traders
* hiring cost
* human workforce output

### Example policy ideas

#### Hiring Incentives

Junior Traders cost less.

#### Executive Compensation Reform

Senior Traders gain additional output.

#### Desk Expansion Credits

Human staff-related upgrades become cheaper.

The labor track reinforces the human side of the firm.

---

## Energy Policy

This track affects:

* Power infrastructure
* machine energy efficiency
* electricity expansion costs

### Example policy ideas

#### Industrial Power Subsidies

Power infrastructure costs less.

#### Priority Grid Access

Bots use less Power.

#### Data Center Energy Credits

Server upgrades become more efficient or cheaper.

This track ties directly into the new Power system and gives the player a policy-based way to shape late-game automation support.

---

## Market Policy

This track affects:

* general profits
* macro-level economic rules
* passive and active trade conditions

### Example policy ideas

#### Capital Gains Relief

Increase overall profits.

#### Extended Trading Window

Increase offline progress cap or improve passive earnings conditions.

#### Market Deregulation

Increase high-end scaling or profit potential.

This track should feel like the player is changing the environment of the market itself.

---

## Technology Policy

This track affects:

* Trading Bots
* server infrastructure
* advanced automation unlocks
* machine-side scaling

### Example policy ideas

#### Automation Tax Credit

Trading Bots cost less.

#### Fast-Track Server Permits

Server upgrades become cheaper or unlock earlier.

#### AI Infrastructure Incentives

Improves machine-side scaling.

This track should be the strongest natural bridge between Lobbying and the automation economy.

---

## Design Rule — Lobbying Policies Should Be Large, Not Tiny

Lobbying should not feel like another long list of tiny +2% upgrades.

It should instead provide:

* fewer policy choices
* bigger systemic effects
* more meaningful long-term decisions

This makes it feel different from ordinary upgrades and more like institutional influence.

---

## Relationship Between Reputation and Lobbying

The relationship should be:

### Reputation

* prestige currency
* used for prestige upgrades
* unlocks the Lobbying system

### Influence

* lobbying currency
* used for policy actions inside Lobbying

This keeps the systems separate but connected.

The player first earns enough Reputation to gain access to political systems, then begins accumulating Influence to shape them.

---

## UI Placement

### Power

Power should appear inside the main play surface once machine systems unlock.

Recommended placements:

* a compact stat in the top metrics row
* a machine section in the main progression lane
* visible power usage indicators on bot/server cards

### Lobbying

Lobbying should appear as its own tab once unlocked.

It should remain hidden or visibly locked before the player acquires **Political Access**.

---

## Revised Progression Arc With These Systems

The broader game arc now becomes:

### Early Game

* manual trading
* Junior Traders

### Mid Game

* Senior Traders
* stronger desk operations

### Late First Run / Automation Phase

* Trading Bots
* Power infrastructure
* machine scaling constraints

### Prestige Era

* Reputation upgrades
* unlock Political Access
* Lobbying tab appears

### Meta Progression Era

* gain Influence
* shape labor, energy, market, and technology policy
* push the firm beyond ordinary market participation

This creates a much richer and more distinctive progression fantasy.

---

## What Stays the Same

This extension does not replace the core structure already established.

The following remain unchanged:

* Cash remains the main operating currency
* Reputation remains the prestige currency
* Trading, Junior Traders, Senior Traders, and Trading Bots remain the main progression ladder
* the first prestige should still occur after the bot phase and slowdown
* the overall UI and tone remain clean, terminal-inspired, and semi-serious

This extension only adds additional late-game and prestige-era systems.

---

## Implementation Direction Notes

This extension is intentionally conceptual and additive.

It defines:

* the purpose of Power
* the purpose of Lobbying
* where they fit in progression
* how they should conceptually behave

It does not yet lock in:

* exact Power formulas
* exact Power infrastructure costs
* exact Influence earning formula
* exact policy tree values

Those should be defined in a later implementation or balance extension once the core loop is further stabilized.

---

## Final Extension Summary

This extension adds two new systems to the existing design.

### Power

Power is a late-game operational capacity system that supports bots and machine infrastructure. It should be displayed as **Power Usage / Capacity** and expanded through dedicated infrastructure.

### Lobbying

Lobbying is a prestige-unlocked strategic tab that uses **Influence** to change policy and reshape the economic systems around the player. It should focus on labor, energy, market, and technology policy.

Together, these additions evolve the game from a simple money-making loop into a broader fantasy of:

**trading → building a desk → scaling automation → shaping the rules of the economy itself**

This document should be treated as the current intended additive design direction for all future work involving Electricity / Power and Lobbying.


# Stock Incremental Game — Power and Lobbying Implementation Sheets

## Purpose of This Document

This document is a follow-up implementation extension to the previously approved **Electricity / Power** and **Lobbying** systems.

It exists to define those systems at a more practical level for future implementation.

This document covers:

* Power system structure
* Power formulas and behaviors
* Power infrastructure content
* Lobbying system structure
* Influence flow
* Lobbying policy tracks
* initial policy set
* UI and data implications

This is still an additive extension. It does not replace the main design document.

---

# PART I — POWER IMPLEMENTATION SHEET

## 1. Power System Role

Power is a late-game operational support system for machine infrastructure.

It exists to support:

* Trading Bots
* server infrastructure
* future machine-side content

Power should make the automation economy feel infrastructural rather than free.

---

## 2. Core Model

Power is implemented as:

### Power Capacity

How much electrical capacity the firm currently has available.

### Power Usage

How much electrical demand current machine systems are consuming.

### Player-Facing Display

**Power: Usage / Capacity**

Example:

* Power: 60 / 100
* Power: 180 / 250

This should be shown only after the Power system unlocks.

---

## 3. Unlock Timing

Power should unlock when machine automation becomes real gameplay.

### Recommended Unlock Condition

Power unlocks when the player purchases:

* **Algorithmic Trading**, or
* the first **Trading Bot**

### Recommendation

Use **Algorithmic Trading** as the clean unlock trigger.

This gives the player fair warning that machine systems now require infrastructure.

---

## 4. What Consumes Power

Only machine-side content consumes Power.

### Initial Power Consumers

#### Trading Bots

* each Trading Bot consumes Power

#### Low-Latency Servers

* increases Power Usage

#### Co-Located Servers

* increases Power Usage

#### Institutional Execution Stack

* increases Power Usage significantly

### Non-Consumers

The following do not consume Power:

* manual trades
* Junior Traders
* Senior Traders
* human-side desk upgrades

---

## 5. Recommended Starting Numbers

These are starting implementation values, not final balance.

### Trading Bot

* base output: **40/sec**
* Power usage per bot: **5**

### Low-Latency Servers

* upgrade effect: bot output improves
* additional Power usage: **+10 total**

### Co-Located Servers

* additional Power usage: **+20 total**

### Institutional Execution Stack

* additional Power usage: **+40 total**

These values are intended to make Power matter meaningfully without instantly blocking early bot use.

---

## 6. How Power Capacity Is Increased

Power Capacity is increased through infrastructure purchases.

These should be added as new buyable support units or upgrades tied to machine scaling.

## 7. Initial Power Infrastructure Content

### Power Contract

#### Role

Entry-level machine support purchase.

#### Type

Repeatable infrastructure unit.

#### Suggested effect

* **+25 Power Capacity**

#### Suggested base cost

* **$15,000**

#### Suggested cost scaling

* **1.16x**

---

### Backup Generator

#### Role

Secondary support layer for modest Power expansion.

#### Type

Repeatable infrastructure unit.

#### Suggested effect

* **+10 Power Capacity**

#### Suggested base cost

* **$5,000**

#### Suggested cost scaling

* **1.14x**

---

### Grid Expansion

#### Role

Larger machine-era infrastructure scaling.

#### Type

Research-unlocked infrastructure upgrade or repeatable support unit.

#### Suggested effect

* **+75 Power Capacity**

#### Suggested base cost

* **$60,000**

#### Suggested cost scaling

* **1.18x**

---

## 8. Recommended Initial Capacity Formula

### Total Power Capacity

```ts
powerCapacity =
  (backupGeneratorCount * 10)
  + (powerContractCount * 25)
  + (gridExpansionCount * 75)
  + flatPowerBonusesFromPoliciesAndUpgrades
```

This keeps the system highly readable and easy to tune.

---

## 9. Recommended Usage Formula

### Total Power Usage

```ts
powerUsage =
  (tradingBotCount * 5)
  + lowLatencyServerPowerUsage
  + coLocatedServerPowerUsage
  + institutionalExecutionStackPowerUsage
```

Suggested initial static server usages:

* Low-Latency Servers: **10**
* Co-Located Servers: **20**
* Institutional Execution Stack: **40**

---

## 10. Over-Capacity Behavior

Power over-capacity should reduce machine performance instead of causing a hard failure.

### Recommended Rule

If Power Usage is less than or equal to Capacity:

* machine efficiency = **100%**

If Power Usage exceeds Capacity:

* machine efficiency = **Capacity / Usage**

### Example

* Capacity = 100
* Usage = 120
* machine efficiency = **100 / 120 = 0.8333**

Result:

* bots and machine-side upgrades run at **83.33% efficiency**

---

## 11. Machine Efficiency Formula

```ts
machineEfficiencyMultiplier =
  powerUsage <= powerCapacity
    ? 1
    : powerCapacity / powerUsage;
```

This multiplier should apply only to:

* Trading Bot output
* machine/server-side effects if appropriate

It should not reduce:

* manual trade output
* Junior Trader output
* Senior Trader output

---

## 12. Power UI Requirements

Once Power is unlocked, show:

### Top Metric

* Power: **Usage / Capacity**

### Machine Section

* bot cards should show Power use
* server upgrades should indicate added Power demand
* infrastructure cards should clearly show added Capacity

### Warning State

If Usage exceeds Capacity, show:

* amber or red warning styling
* current efficiency penalty

Example:

* **Power Over Capacity — Machine Output 83%**

---

## 13. Power State Model Additions

Suggested state fields:

```ts
powerUnlocked: boolean;
backupGeneratorCount: number;
powerContractCount: number;
gridExpansionCount: number;
```

Derived values:

```ts
powerCapacity: number;
powerUsage: number;
machineEfficiencyMultiplier: number;
```

---

## 14. Power Actions

Suggested store actions:

```ts
buyBackupGenerator(quantity)
buyPowerContract(quantity)
buyGridExpansion(quantity)
```

Optional later:

```ts
getPowerCapacity(state)
getPowerUsage(state)
getMachineEfficiencyMultiplier(state)
```

---

## 15. Power Category Placement

Power support content should live in the main unified progression screen after machine unlocks.

Recommended progression order:

1. Trade
2. Junior Traders
3. Senior Traders
4. Trading Bots
5. Power Infrastructure

This makes the machine support relationship visually obvious.

---

# PART II — LOBBYING IMPLEMENTATION SHEET

## 16. Lobbying System Role

Lobbying is a prestige-era strategic system.

It represents the player using political and institutional influence to reshape the environment around the firm.

Lobbying should feel different from:

* normal upgrades
* repeatable unit purchases
* basic prestige upgrades

It should be a slower, more strategic layer.

---

## 17. Lobbying Unlock

Lobbying should unlock via a prestige-layer meta upgrade.

### Recommended Unlock Upgrade

**Political Access**

### Suggested Reputation Cost

* **5 Reputation**

### Effect

* permanently unlock the **Lobbying** tab
* enables generation and spending of **Influence**

---

## 18. Lobbying Currency

### Currency Name

**Influence**

### Role

Influence is the spend currency used inside the Lobbying system.

### Important Design Rule

Influence should be:

* slower than Cash
* rarer than Reputation
* tied to prestige-era progression
* used for larger policy decisions

---

## 19. Recommended Influence Earning Model

Influence should be earned primarily through prestige progress, not constant micro-actions.

### Recommended Starting Formula

Gain Influence when prestiging.

```ts
influenceGain = Math.max(0, Math.floor(prestigeGain / 2));
```

Where:

* `prestigeGain` is the Reputation gained on reset

### Why this works

* keeps Lobbying tied to prestige loops
* prevents Influence from flooding too early
* ensures policy decisions remain slower and more meaningful

---

## 20. Optional Alternative Influence Sources

These are not required immediately, but may be used later:

* milestone prestige count rewards
* lobbying-related prestige upgrades
* end-of-run scale bonuses
* special market event rewards

For initial implementation, the prestige-derived formula is enough.

---

## 21. Lobbying Tab Structure

Lobbying should be organized into four policy tracks:

1. **Labor Policy**
2. **Energy Policy**
3. **Market Policy**
4. **Technology Policy**

Each track should contain a small number of larger, more important policies rather than many tiny upgrades.

---

## 22. Labor Policy Track

### Purpose

Supports human-side scaling.

### Initial Policies

#### Hiring Incentives

* cost: **1 Influence**
* effect: Junior Traders cost **10% less**

#### Desk Expansion Credits

* cost: **2 Influence**
* effect: human-side operational upgrades cost **15% less**

#### Executive Compensation Reform

* cost: **3 Influence**
* effect: Senior Traders gain **+20% output**

---

## 23. Energy Policy Track

### Purpose

Supports Power and machine infrastructure.

### Initial Policies

#### Industrial Power Subsidies

* cost: **1 Influence**
* effect: Power infrastructure costs **15% less**

#### Priority Grid Access

* cost: **2 Influence**
* effect: Trading Bots use **10% less Power**

#### Data Center Energy Credits

* cost: **3 Influence**
* effect: server upgrades add **25% less Power usage**

---

## 24. Market Policy Track

### Purpose

Supports firm-wide economic conditions.

### Initial Policies

#### Capital Gains Relief

* cost: **2 Influence**
* effect: all profits **+10%**

#### Extended Trading Window

* cost: **2 Influence**
* effect: offline progress cap **+2 hours**

#### Market Deregulation

* cost: **4 Influence**
* effect: bot output **+15%** and senior output **+10%**

---

## 25. Technology Policy Track

### Purpose

Supports advanced automation and systems growth.

### Initial Policies

#### Automation Tax Credit

* cost: **2 Influence**
* effect: Trading Bots cost **15% less**

#### Fast-Track Server Permits

* cost: **3 Influence**
* effect: machine infrastructure upgrades cost **20% less**

#### AI Infrastructure Incentives

* cost: **4 Influence**
* effect: Trading Bots gain **+20% output**

---

## 26. Policy Design Rules

Policies should follow these implementation rules:

### Rule 1

Policies should be one-time purchases for initial implementation.

### Rule 2

Policies should have larger effects than ordinary upgrades.

### Rule 3

Policy count should remain small and readable.

### Rule 4

Each policy should clearly map to one of the four tracks.

This keeps Lobbying strategic rather than bloated.

---

## 27. Suggested Initial Lobbying Data Model

Suggested state additions:

```ts
lobbyingUnlocked: boolean;
influence: number;
purchasedPolicies: Record<string, boolean>;
```

Policy definition shape:

```ts
type LobbyingPolicy = {
  id: string;
  name: string;
  track: 'labor' | 'energy' | 'market' | 'technology';
  influenceCost: number;
  description: string;
};
```

---

## 28. Suggested Initial Policy IDs

```ts
hiringIncentives
deskExpansionCredits
executiveCompensationReform
industrialPowerSubsidies
priorityGridAccess
dataCenterEnergyCredits
capitalGainsRelief
extendedTradingWindow
marketDeregulation
automationTaxCredit
fastTrackServerPermits
aiInfrastructureIncentives
```

---

## 29. Suggested Lobbying Store Actions

```ts
unlockLobbying()
calculateInfluenceGainFromPrestige(prestigeGain)
buyPolicy(policyId)
```

On prestige reset, if lobbying is unlocked:

* calculate Influence gain
* add to stored Influence

---

## 30. Recommended Influence Integration on Prestige

### Prestige reset flow update

When a prestige occurs:

1. calculate Reputation gain
2. if Lobbying is unlocked, calculate Influence gain
3. add both to stored meta resources
4. apply reset

This makes Lobbying feel naturally attached to the prestige loop.

---

## 31. Lobbying UI Requirements

The Lobbying tab should show:

* total Influence
* policy tracks
* purchased vs unpurchased policies
* clear policy costs and effects

### Recommended Layout

Use four grouped sections:

* Labor
* Energy
* Market
* Technology

Each section contains a small number of large policy cards.

---

## 32. Relationship Between Power and Lobbying

These systems should connect naturally.

### Energy Policy directly affects Power

Examples:

* cheaper Power infrastructure
* reduced Power usage for bots
* reduced Power load from server upgrades

This makes Lobbying meaningfully relevant to the late-game automation economy.

---

## 33. Suggested First Implementation Scope

For a first implementation pass, include:

### Power

* Power unlock with Algorithmic Trading
* Power Usage / Capacity stat
* Trading Bots consume Power
* Power infrastructure units:

  * Backup Generator
  * Power Contract
  * Grid Expansion
* over-capacity efficiency penalty

### Lobbying

* Political Access prestige upgrade
* Influence currency
* Influence gain from prestige
* four policy tracks
* first 8–12 one-time policies

This is enough to establish both systems cleanly.

---

## 34. What Can Be Deferred

These are good future additions, but not required immediately:

* repeatable lobbying policies
* dynamic political events
* random blackouts / grid instability
* multiple power source types
* policy prerequisites and branching trees
* influence generation from non-prestige sources

The initial implementation should stay readable and controlled.

---

## 35. Final Implementation Summary

### Power

Power is a late-game machine support system implemented as **Usage / Capacity**. It is expanded through infrastructure and constrains bot/server scaling without acting like a draining fuel meter.

### Lobbying

Lobbying is a prestige-era strategic system unlocked through **Political Access**. It uses **Influence** to purchase large, meaningful policy changes across Labor, Energy, Market, and Technology tracks.

These systems should be treated as additive next-stage progression layers that deepen the automation and prestige experience without replacing the core desk-building loop.


# Stock Incremental Game — Delta Implementation Sheet: Power and Lobbying

## Purpose of This Document

This document describes the **integration changes** required to add the new **Power** and **Lobbying** systems to the current implementation.

Unlike the broader design and implementation documents, this sheet is intentionally surgical.

It focuses on:

* what existing systems stay the same
* what existing files or logic need to be modified
* what new state, selectors, actions, and UI pieces must be added
* the safest order to implement the new systems

This document should be read as a **patch plan** for the current game architecture.

---

## 1. High-Level Delta Summary

Two new systems are being integrated into the current game:

1. **Power**

   * a late-game machine support system
   * displayed as **Power Usage / Capacity**
   * affects Trading Bot and server-side efficiency

2. **Lobbying**

   * a prestige-era strategic system
   * unlocked through a new prestige upgrade: **Political Access**
   * uses **Influence** as a new meta currency
   * lives in its own **Lobbying** tab

---

## 2. What Stays the Same

The following systems do **not** need structural replacement:

* Cash as the main currency
* Reputation as the prestige currency
* Junior / Senior / Trading Bot unit ladder
* Research unlocking unit tiers
* Operations buying units in bulk
* manual trading loop
* save/load framework
* offline progress framework
* prestige reset as the main meta reset flow

This is important: Power and Lobbying are **additive layers**, not replacements for the existing core economy.

---

## 3. What Needs to Be Added

At a high level, the codebase now needs to gain:

### Power additions

* Power unlock state
* Power infrastructure counts
* derived Power Capacity and Power Usage
* machine efficiency multiplier
* Power-aware bot/server economy math
* Power metric UI
* Power infrastructure purchasing UI/actions

### Lobbying additions

* lobbying unlock state
* Influence currency
* lobbying policy definitions
* purchased policy state
* Influence gain on prestige
* Lobbying tab UI
* policy purchasing actions and effects

---

## 4. What Needs to Be Modified

The following existing systems need to be patched:

### Economy logic

* bot income must become Power-aware

### Prestige logic

* prestige flow must support Political Access unlock and Influence gain

### Top metrics UI

* Power and Influence need conditional display

### Navigation / tabs

* Lobbying needs to become a new selectable destination once unlocked

### Upgrade / prestige data

* add Political Access
* add policy definitions
* add Power infrastructure definitions

---

# PART I — STATE MODEL DELTA

## 5. Additions to GameState

The existing `GameState` should be extended with the following fields.

```ts
powerUnlocked: boolean;
backupGeneratorCount: number;
powerContractCount: number;
gridExpansionCount: number;

lobbyingUnlocked: boolean;
influence: number;
purchasedPolicies: Record<string, boolean>;
```

### Notes

* `powerUnlocked` should become true when the player purchases **Algorithmic Trading** or otherwise reaches the machine era trigger.
* `lobbyingUnlocked` should become true when the player purchases the prestige upgrade **Political Access**.
* `purchasedPolicies` can be a simple boolean dictionary for first implementation because policies are one-time purchases.

---

## 6. Derived State (Selectors, Not Stored)

These values should be computed, not permanently stored.

```ts
powerCapacity
powerUsage
machineEfficiencyMultiplier
availableInfluenceGainOnPrestige   // optional preview if desired later
```

These belong in selectors / utility functions rather than persistent save state.

---

## 7. initialState Changes

The current `initialState` should gain the new fields with defaults:

```ts
powerUnlocked: false,
backupGeneratorCount: 0,
powerContractCount: 0,
gridExpansionCount: 0,

lobbyingUnlocked: false,
influence: 0,
purchasedPolicies: {},
```

No other base reset behavior needs to change at initialization time.

---

# PART II — CONSTANTS AND DATA DELTA

## 8. New Power Constants

A new constants block should be added for Power values.

Suggested initial constants:

```ts
TRADING_BOT_POWER_USAGE = 5;
LOW_LATENCY_SERVERS_POWER_USAGE = 10;
CO_LOCATED_SERVERS_POWER_USAGE = 20;
INSTITUTIONAL_EXECUTION_STACK_POWER_USAGE = 40;

BACKUP_GENERATOR_POWER_CAPACITY = 10;
POWER_CONTRACT_POWER_CAPACITY = 25;
GRID_EXPANSION_POWER_CAPACITY = 75;
```

These should live either in:

* `data/constants.ts`
* or a new `data/power.ts`

---

## 9. New Power Infrastructure Data

Add definitions for the new buyable support units.

Suggested first implementation:

```ts
backupGenerator
powerContract
gridExpansion
```

Each should have:

* id
* name
* baseCost
* costScaling
* capacityContribution
* description

These can live in:

* `data/powerInfrastructure.ts`
* or inside a broader infrastructure constants file

---

## 10. New Prestige Upgrade Data

Add a new prestige upgrade definition:

```ts
politicalAccess
```

Suggested fields:

* id: `politicalAccess`
* name: `Political Access`
* baseCost: 5
* maxRank: 1
* description: `Unlock the Lobbying tab and enable Influence gain.`

This should be added to the existing `PRESTIGE_UPGRADES` data.

---

## 11. New Lobbying Policy Data

Add a new policy definition set.

Suggested file:

* `data/lobbyingPolicies.ts`

Suggested shape:

```ts
type LobbyingTrack = 'labor' | 'energy' | 'market' | 'technology';

type LobbyingPolicy = {
  id: string;
  name: string;
  track: LobbyingTrack;
  influenceCost: number;
  description: string;
};
```

Initial policy IDs should include:

* hiringIncentives
* deskExpansionCredits
* executiveCompensationReform
* industrialPowerSubsidies
* priorityGridAccess
* dataCenterEnergyCredits
* capitalGainsRelief
* extendedTradingWindow
* marketDeregulation
* automationTaxCredit
* fastTrackServerPermits
* aiInfrastructureIncentives

---

# PART III — ECONOMY LOGIC DELTA

## 12. Add Power Selector Functions

The following derived functions need to be added.

### getPowerCapacity(state)

Calculates total Power Capacity from infrastructure and policy bonuses.

### getPowerUsage(state)

Calculates current machine-side Power demand.

### getMachineEfficiencyMultiplier(state)

Returns:

* `1` when Power Usage <= Power Capacity
* `capacity / usage` when over capacity

These should live in a new utility file such as:

* `utils/power.ts`

---

## 13. Patch Bot Income Logic

The existing bot-side economy calculation must be changed.

### Current behavior

Trading Bot output is calculated only from bot count, upgrades, global multipliers, and prestige multipliers.

### New behavior

Trading Bot output must also be multiplied by:

```ts
machineEfficiencyMultiplier
```

### Important rule

This multiplier should apply only to machine-side output.

It should **not** affect:

* manual trade output
* Junior Trader output
* Senior Trader output

---

## 14. Patch getCashPerSecond()

The current `getCashPerSecond()` function should be updated so that:

* Junior output remains unchanged
* Senior output remains unchanged
* Bot output is reduced by machine efficiency when over capacity

Recommended conceptual structure:

```ts
juniorIncome = juniorTraderCount * getJuniorTraderIncome(state)
seniorIncome = seniorTraderCount * getSeniorTraderIncome(state)
rawBotIncome = tradingBotCount * getTradingBotIncome(state)
effectiveBotIncome = rawBotIncome * getMachineEfficiencyMultiplier(state)

cashPerSecond = (juniorIncome + seniorIncome + effectiveBotIncome)
  * getGlobalMultiplier(state)
  * getPrestigeMultiplier(state)
```

---

## 15. Add Lobbying Effect Integration Points

Lobbying policies will patch several existing formulas.

### Labor policies may affect

* Junior Trader cost
* Senior Trader output
* staff upgrade cost

### Energy policies may affect

* Power infrastructure cost
* Trading Bot Power usage
* server upgrade Power usage

### Market policies may affect

* all profits
* offline cap
* endgame scaling modifiers

### Technology policies may affect

* Trading Bot cost
* machine infrastructure cost
* Trading Bot output

This means the economy layer will need helper functions that incorporate policy effects where relevant.

---

## 16. Add Offline Progress Patch Point

The offline progress system should remain structurally the same, but once Power exists:

* offline passive earnings should use the same effective bot output logic
* meaning offline earnings must also respect `machineEfficiencyMultiplier`

This is an important integration detail and should not be skipped.

---

# PART IV — ACTIONS / STORE DELTA

## 17. New Power Purchase Actions

Add the following repeatable purchase actions:

```ts
buyBackupGenerator(quantity)
buyPowerContract(quantity)
buyGridExpansion(quantity)
```

These should behave similarly to existing repeatable unit purchases:

* respect scaling costs
* support x1 / x5 / x10 / Max if desired
* subtract Cash
* increment owned count

---

## 18. New Lobbying Actions

Add the following actions:

```ts
buyPolicy(policyId)
calculateInfluenceGainFromPrestige(prestigeGain)
```

Optional helper:

```ts
isPolicyUnlocked(policyId)
```

For first implementation, all policies can simply be one-time purchases with affordability based on Influence.

---

## 19. Patch buyPrestigeUpgrade()

The existing prestige purchase flow must be updated so that buying **Political Access**:

* sets `lobbyingUnlocked = true`
* enables Lobbying tab visibility
* enables Influence gain during future prestige resets

This is one of the most important integration points.

---

## 20. Patch prestigeReset()

The current prestige reset logic must be updated.

### Current behavior

* calculate Reputation gain
* reset run state
* keep prestige upgrades

### New behavior

* calculate Reputation gain
* if lobbying is unlocked, calculate Influence gain
* add Influence to stored state
* perform prestige reset
* preserve lobbying unlock and purchased policies

### Important rule

Lobbying is a prestige-era meta system, so:

* `lobbyingUnlocked` should persist through prestige
* `influence` should persist through prestige
* `purchasedPolicies` should persist through prestige

These should behave like meta-progression, not run-level state.

---

# PART V — SELECTORS DELTA

## 21. Add Power Selectors

Suggested selectors:

```ts
powerUnlocked(state)
powerCapacity(state)
powerUsage(state)
machineEfficiencyMultiplier(state)
isOverPowerCapacity(state)
```

These should be added to the existing selector layer.

---

## 22. Add Lobbying Selectors

Suggested selectors:

```ts
lobbyingUnlocked(state)
currentInfluence(state)
policyPurchased(state, policyId)
```

Optional later selectors:

```ts
influenceGainPreview(state)
energyPolicyModifiers(state)
```

---

# PART VI — UI DELTA

## 23. Top Metrics Row Changes

Patch the top metrics area to support:

### Conditional Power display

Show Power only when `powerUnlocked === true`.

Suggested format:

* **Power: 60 / 100**

### Conditional Influence display

Show Influence only when `lobbyingUnlocked === true`.

Suggested format:

* **Influence: 4**

This keeps early UI cleaner while exposing the new systems when relevant.

---

## 24. Main Screen Changes for Power

The main progression screen should gain a new machine support section once bots unlock.

### New section

**Power Infrastructure**

Suggested order in main progression lane:

1. Trade
2. Junior Traders
3. Senior Traders
4. Trading Bots
5. Power Infrastructure

This is where the new Power support purchases should live.

---

## 25. Power Card Requirements

Trading Bot cards and machine upgrades should show:

* current Power use
* total Power demand if relevant
* whether output is throttled

Power infrastructure cards should show:

* Power Capacity granted
* purchase cost
* owned count

---

## 26. Lobbying Tab Additions

Add a new top-level destination:

```ts
Lobbying
```

Visibility rules:

* hidden or disabled before Political Access
* fully visible after `lobbyingUnlocked === true`

This tab should contain grouped policy cards by track:

* Labor
* Energy
* Market
* Technology

---

## 27. Lobbying Card Requirements

Each policy card should show:

* policy name
* track
* Influence cost
* effect description
* purchased state
* button state

Since policies are one-time purchases, purchased policies should visually change to indicate completion.

---

## 28. Navigation Patch

If the current navigation uses:

* main screen
* prestige
  n
  Then it must now expand to include:
* Lobbying

If the current nav already includes a future-ready tab system, then Lobbying should be added there conditionally.

---

# PART VII — SAVE / LOAD DELTA

## 29. Save Model Changes

The save/load system must now include:

```ts
powerUnlocked
backupGeneratorCount
powerContractCount
gridExpansionCount

lobbyingUnlocked
influence
purchasedPolicies
```

These should serialize like any other persistent game state fields.

---

## 30. Migration Compatibility Note

If old saves exist from before these systems were added:

* missing fields should default safely
* migration should initialize them to empty / false values

Recommended defaults:

* `powerUnlocked = false`
* all Power counts = `0`
* `lobbyingUnlocked = false`
* `influence = 0`
* `purchasedPolicies = {}`

This avoids breaking older save files.

---

# PART VIII — IMPLEMENTATION ORDER

## 31. Recommended Safe Order of Integration

### Step 1 — State and constants

* add new GameState fields
* add initial state defaults
* add Power constants
* add policy data definitions
* add Political Access prestige upgrade

### Step 2 — Power math

* implement `getPowerCapacity()`
* implement `getPowerUsage()`
* implement `getMachineEfficiencyMultiplier()`
* patch bot income logic
* patch offline progress calculations

### Step 3 — Power purchases and UI

* add Power infrastructure purchase actions
* add Power section to main screen
* add top metrics Power stat
* add over-capacity warning

### Step 4 — Lobbying backend

* add Influence state
* add Influence gain on prestige
* patch `buyPrestigeUpgrade()` for Political Access
* patch `prestigeReset()` persistence behavior
* add `buyPolicy()`

### Step 5 — Lobbying UI

* add Lobbying tab
* add track-grouped policy cards
* add Influence display in top metrics row

### Step 6 — Tuning and testing

* validate bot throttling behavior
* validate Power unlock timing
* validate Influence gain pace
* validate policy balance

This order minimizes breakage and keeps each layer testable.

---

# PART IX — KEEP / ADD / MODIFY / REMOVE CHECKLIST

## 32. Keep

* Cash economy
* Reputation prestige system
* Junior/Senior/Bot unit progression
* Research unlock structure
* Operations bulk buy structure
* save/load core
* offline progress core

## 33. Add

* Power state and derived math
* Power infrastructure data and purchases
* machine efficiency multiplier
* Political Access prestige upgrade
* Influence currency
* Lobbying tab
* lobbying policy definitions
* lobbying purchase logic

## 34. Modify

* `GameState`
* `initialState`
* prestige upgrade definitions
* prestige reset logic
* bot income formula
* offline progress formula
* top metric UI
* navigation/tab structure
* main progression screen

## 35. Remove

Nothing major needs to be removed for this integration.

The systems are additive.

Only minor cleanup may be needed if any placeholder automation support logic or placeholder future-tab stubs conflict with the new Power/Lobbying implementation.

---

## 36. Final Delta Summary

This delta sheet defines how the existing game should be patched to support the new Power and Lobbying systems.

### Power integration requires:

* new machine-support state
* new infrastructure purchases
* bot efficiency throttling when over capacity
* Power UI and selectors

### Lobbying integration requires:

* Political Access prestige unlock
* Influence as a new meta currency
* policy definitions and purchases
* prestige flow updates
* a new Lobbying tab

These changes should be treated as the official integration plan for adding the Power and Lobbying systems to the current implementation.
