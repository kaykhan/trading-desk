Stock Incremental Game — Master Extension Document: Research, Power, and Lobbying
Purpose of This Document
This document is the consolidated master extension for the current approved late-game and meta-progression additions to the Stock Incremental Game.
It combines three layers in one place:
Design document
Implementation/specification sheet
Delta integration sheet
This document covers the following systems together as a single coherent progression bundle:
Research staff and Research Points
Power / Electricity infrastructure
Lobbying and Influence
the revised role of Prestige / Reputation
This should be treated as the current additive source of truth for these systems.
---
Executive Summary
The game now expands beyond a simple money loop into a layered progression model.
Approved progression identity
Cash builds the firm directly
Research staff generate Research Points
Research Points unlock advanced systems
Power supports machine-era scaling
Lobbying becomes a late-game researched strategic system
Reputation / Prestige improves the entire machine permanently across runs
Core progression rule
Research unlocks advanced systems, including Lobbying. Prestige scales the whole machine.
This is the key rule that should guide all future implementation.
---
PART I — DESIGN DOCUMENT
1. Revised Progression Philosophy
The game should now be understood as a layered progression system rather than a single-currency economy.
Layer 1 — Operations
The player earns Cash and builds the firm directly.
Layer 2 — Research
The player hires research staff, generates Research Points, and unlocks advanced capabilities.
Layer 3 — Machine Infrastructure
The player supports machine systems through Power capacity and infrastructure.
Layer 4 — Lobbying
The player uses institutional sophistication to influence policy through a late-game strategic tab.
Layer 5 — Prestige
The player resets progress for permanent broad upgrades that improve all systems over time.
This structure gives the game a much stronger identity:
trading → running a desk → funding R&D → automating at scale → influencing the external system
---
2. Resource Model
The master economy now includes five major resources.
Cash
Primary operating currency.
Used for:
Junior Traders
Senior Traders
Trading Bots
Power infrastructure
Research staff
operational upgrades
Research Points
Advanced systems currency.
Used for:
unlocking Trading Bots
unlocking Power Infrastructure
unlocking Lobbying
unlocking systemic technology upgrades
Power
Machine support resource.
Displayed as:
Power Usage / Capacity
Used to:
support Trading Bots
support machine/server infrastructure
Reputation
Prestige currency.
Used for:
permanent broad upgrades
economy-wide efficiency improvements
scaling future runs
Influence
Lobbying currency.
Used for:
policy purchases inside the Lobbying tab
---
3. Resource Responsibilities
The systems should have distinct jobs.
Cash buys practical assets
Examples:
traders
bots
infrastructure
researchers
Research Points buy capability and technological progress
Examples:
Algorithmic Trading
Power Systems Engineering
Regulatory Affairs
Power limits or supports machine scaling
Examples:
bot operation
server operation
Reputation improves the whole machine permanently
Examples:
all profits +X%
research generation +Y%
power efficiency +Z%
Influence changes external policy
Examples:
energy subsidies
labor incentives
market relief
automation credits
---
4. Research System Design
New Unit
Research Computer Scientist
This is a new repeatable unit bought with Cash.
Role
Research Computer Scientists generate Research Points per second.
Core loop
spend Cash on research staff → generate Research Points → spend Research Points to unlock advanced systems
This makes Research a real progression economy rather than a simple menu of upgrades.
---
5. Why Research Matters
Research is now responsible for unlocking major system transitions.
Research unlocks
Trading Bots
Power Infrastructure
Lobbying
future advanced systems
This means advanced capabilities are no longer just bought with Cash or gated by prestige.
They are earned through technological development.
---
6. Recommended Research Unlock Ladder
The first major Research technologies should be:
Algorithmic Trading
Unlocks Trading Bots.
Power Systems Engineering
Unlocks Power Infrastructure.
Regulatory Affairs
Unlocks the Lobbying tab.
This creates a clean late-game research arc.
---
7. Power System Design
Power is a late-game machine support system.
Design role
Power exists to make machine automation feel infrastructural rather than free.
Display model
Power should be displayed as:
Power: Usage / Capacity
Examples:
Power: 60 / 100
Power: 180 / 250
Important design rule
Power is a capacity system, not a draining fuel meter.
This means:
players expand Power Capacity through infrastructure
machine assets increase Power Usage
over-capacity reduces machine efficiency
---
8. What Uses Power
Power should only be used by machine-side systems.
Consumers
Trading Bots
Low-Latency Servers
Co-Located Servers
Institutional Execution Stack
future machine-side upgrades
Non-consumers
manual trades
Junior Traders
Senior Traders
human-side upgrades
This keeps the distinction clean and thematic.
---
9. Power Infrastructure Design
Players should increase Power Capacity by buying infrastructure.
Initial infrastructure examples
Backup Generator
Small flat Power Capacity support.
Power Contract
Main entry-level Power Capacity purchase.
Grid Expansion
Larger machine-era Power scaling.
These should be bought with Cash and positioned as machine support assets.
---
10. Over-Capacity Power Behavior
Power should not hard-stop the player.
Approved behavior
If Power Usage exceeds Power Capacity, machine systems become less efficient.
Formula concept
if usage <= capacity, machine efficiency = 100%
if usage > capacity, machine efficiency = capacity / usage
This penalty applies only to machine-side output.
It should not affect:
manual trading
Junior Traders
Senior Traders
---
11. Lobbying Design
Lobbying is now a late-game researched strategic system.
New unlock rule
Lobbying is unlocked through Research, not through Prestige.
Unlock tech
Regulatory Affairs
Design meaning
The firm first develops enough institutional sophistication to understand and engage with policy.
Only then can it begin lobbying.
This is now the intended thematic model.
---
12. Lobbying Currency
Lobbying uses:
Influence
Role of Influence
Influence is a slower, rarer strategic currency used to purchase policy changes inside the Lobbying tab.
It should feel different from:
Cash
Research Points
Reputation
---
13. Lobbying Policy Tracks
Lobbying should be organized into four policy categories.
Labor Policy
Supports Junior and Senior Traders.
Energy Policy
Supports Power and machine efficiency.
Market Policy
Supports profits and macro conditions.
Technology Policy
Supports bots, servers, and machine-side scaling.
This structure should remain the foundation of the Lobbying tab.
---
14. Prestige / Reputation Role Revision
Prestige is no longer responsible for unlocking Lobbying.
New prestige role
Prestige should provide broad permanent scaling upgrades such as:
increased all-profit multipliers
improved research generation
reduced bot power usage
cheaper infrastructure
longer offline cap
improved machine efficiency
This makes Reputation easier to understand and stronger as a long-term compounding system.
---
15. Progression Fit Summary
The revised overall progression should now feel like this:
Early Game
manual trading
Junior Traders
Mid Game
Senior Traders
human desk scaling
first research staffing becomes relevant
Mid-to-Late Game
Research Computer Scientists generate Research Points
Research unlocks advanced systems
Late Game
Research unlocks:
Trading Bots
Power Infrastructure
Lobbying
Late Strategic Layer
Trading Bots require Power support
Lobbying uses Influence to alter policy
Meta Loop
Prestige improves all of the above permanently across runs
This is the intended progression identity.
---
PART II — IMPLEMENTATION / SPECIFICATION SHEET
16. GameState Additions
The following fields should be added to `GameState`.
```ts
researchPoints: number;
researchComputerScientistCount: number;
purchasedResearchTech: Record<string, boolean>;

powerUnlocked: boolean;
backupGeneratorCount: number;
powerContractCount: number;
gridExpansionCount: number;

influence: number;
purchasedPolicies: Record<string, boolean>;
```
Optional explicit unlock structure
If preferred, the following can also exist instead of deriving from tech purchases:
```ts
researchUnlockedSystems: {
  tradingBots: boolean;
  powerInfrastructure: boolean;
  lobbying: boolean;
};
```
However, deriving unlocks from `purchasedResearchTech` is cleaner.
---
17. Research Unit Specification
Research Computer Scientist
Suggested starting values:
base cost: $5,000
cost scaling: 1.18x
output: 1 Research Point/sec
Suggested data shape:
```ts
researchComputerScientist: {
  id: 'researchComputerScientist',
  name: 'Research Computer Scientist',
  baseCost: 5000,
  costScaling: 1.18,
  baseResearchPerSecond: 1,
  description: 'Generates Research Points for advanced system unlocks.'
}
```
---
18. Research Tech Specification
Suggested file:
`data/researchTech.ts`
Suggested shape:
```ts
type ResearchTech = {
  id: string;
  name: string;
  researchCost: number;
  description: string;
};
```
Initial required techs
Algorithmic Trading
cost: 100 RP
unlocks Trading Bots
Power Systems Engineering
cost: 150 RP
unlocks Power Infrastructure
Regulatory Affairs
cost: 250 RP
unlocks Lobbying
These are starting values and should be tuned later.
---
19. Research Production Functions
Add utility functions such as:
```ts
getResearchComputerScientistCost(state)
getBulkResearchScientistCost(state, quantity)
getResearchPointsPerSecond(state)
```
Suggested formula
```ts
researchPointsPerSecond =
  researchComputerScientistCount * researchScientistOutput * researchMultipliers
```
Where `researchMultipliers` may later include prestige and policy effects.
---
20. Tick Loop Patch
The main tick/update loop must now generate both Cash and Research Points.
New tick behavior
```ts
cash += getCashPerSecond(state) * deltaSeconds
researchPoints += getResearchPointsPerSecond(state) * deltaSeconds
```
This is one of the main required implementation changes.
---
21. New Research Actions
Add store actions:
```ts
buyResearchComputerScientist(quantity)
buyResearchTech(techId)
```
buyResearchComputerScientist(quantity)
spends Cash
increases `researchComputerScientistCount`
buyResearchTech(techId)
spends Research Points
marks the technology as purchased
unlocks the associated system
---
22. Power Constants and Formulas
Suggested constants:
```ts
TRADING_BOT_POWER_USAGE = 5;
LOW_LATENCY_SERVERS_POWER_USAGE = 10;
CO_LOCATED_SERVERS_POWER_USAGE = 20;
INSTITUTIONAL_EXECUTION_STACK_POWER_USAGE = 40;

BACKUP_GENERATOR_POWER_CAPACITY = 10;
POWER_CONTRACT_POWER_CAPACITY = 25;
GRID_EXPANSION_POWER_CAPACITY = 75;
```
Power Capacity formula
```ts
powerCapacity =
  (backupGeneratorCount * 10)
  + (powerContractCount * 25)
  + (gridExpansionCount * 75)
  + flatPowerBonuses
```
Power Usage formula
```ts
powerUsage =
  (tradingBotCount * 5)
  + lowLatencyServerUsage
  + coLocatedServerUsage
  + institutionalExecutionStackUsage
```
Machine efficiency formula
```ts
machineEfficiencyMultiplier =
  powerUsage <= powerCapacity ? 1 : powerCapacity / powerUsage;
```
This multiplier should apply only to machine-side output.
---
23. Power Infrastructure Specification
Suggested infrastructure units:
Backup Generator
base cost: $5,000
scaling: 1.14x
adds 10 Power Capacity
Power Contract
base cost: $15,000
scaling: 1.16x
adds 25 Power Capacity
Grid Expansion
base cost: $60,000
scaling: 1.18x
adds 75 Power Capacity
These should be bought with Cash.
---
24. Influence and Lobbying Specification
Lobbying uses Influence.
Initial earning direction
Influence should remain slower and more strategic than Cash.
A simple initial implementation can award Influence on prestige or milestone logic if needed, but Lobbying unlock itself is now exclusively Research-based.
Important distinction
Research unlocks Lobbying
Influence powers Lobbying purchases
Prestige no longer gates access to Lobbying
---
25. Lobbying Policy Data Specification
Suggested file:
`data/lobbyingPolicies.ts`
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
Initial policy IDs
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
---
26. Suggested Policy Effects
Labor Policy
cheaper Junior Traders
cheaper human upgrades
stronger Senior Traders
Energy Policy
cheaper Power infrastructure
lower bot Power usage
lower server Power load
Market Policy
higher profits
better offline behavior
stronger macro scaling
Technology Policy
cheaper Bots
cheaper machine infrastructure
higher bot output
Policies should remain one-time purchases for initial implementation.
---
27. Research UI Requirements
The Research tab should include:
Research production panel
Research Points total
Research Points/sec
Research Computer Scientist card
buy controls
Research technology panel
Algorithmic Trading
Power Systems Engineering
Regulatory Affairs
future research techs
This should make Research feel like both:
a production economy
an unlock economy
---
28. Main Screen Requirements
The main progression screen should remain focused on operations.
Recommended order:
Trade
Junior Traders
Senior Traders
Trading Bots
Power Infrastructure
Research staff do not need to be forced into the main lane, because the Research tab is now fully justified.
---
29. Top Metrics Row Requirements
Top metrics should conditionally show:
Cash
Cash/sec
Cash/click
Reputation
Power (when unlocked)
Influence (when Lobbying is unlocked / relevant)
optionally Research Points if desired, though RP can also stay inside Research tab
---
30. Prestige Upgrade Role
Prestige upgrades should now be oriented around broad scaling.
Suggested directions:
Brand Recognition → all profits +X%
Research Grants → Research generation +Y%
Energy Optimization → bot Power usage -Z%
Hiring Pipeline → staff costs reduced
Seed Capital → starting Cash increased
Server Efficiency → machine-side efficiency improved
Prestige should not be the unlock source for Lobbying anymore.
---
PART III — DELTA INTEGRATION SHEET
31. What Stays the Same
The following remain structurally intact:
Cash as the main operating currency
Junior / Senior / Bot progression ladder
Operations bulk buy structure
Power as Usage / Capacity
Lobbying policy tracks
save/load framework
offline progress framework
Reputation as the prestige currency
This extension changes how advanced systems are unlocked and how Research participates in progression.
---
32. What Changes
Add
Research Points resource
Research Computer Scientist unit
Research tech data and purchases
Research Point generation in tick/update loop
Research-based unlocks for Bots, Power, and Lobbying
prestige upgrades aimed more clearly at broad scaling
Modify
Research tab content
Lobbying unlock path
system unlock logic for machine-era content
prestige upgrade intent
save/load state shape
selectors for unlock visibility
Remove / Deprecate
any assumption that Lobbying is prestige-gated
any prestige upgrade whose sole role is unlocking Lobbying
---
33. File / System Patch Plan
`types/game.ts`
Add:
`researchPoints`
`researchComputerScientistCount`
`purchasedResearchTech`
Power fields if not already present
Influence / purchasedPolicies if not already present
`data/units.ts`
Add:
`researchComputerScientist`
`data/researchTech.ts`
Create:
research tech definitions
`utils/economy.ts`
Add:
Research scientist cost logic
Research Point generation logic
Research-related multipliers
main tick logic
Patch:
add Research Point generation per tick
system unlock selectors
Patch:
Trading Bots unlocked from `algorithmicTrading`
Power unlocked from `powerSystemsEngineering`
Lobbying unlocked from `regulatoryAffairs`
`data/prestigeUpgrades.ts`
Modify:
remove Lobbying unlock responsibility
add broader scaling upgrades as needed
Research UI
Patch:
add research production section
add research technology cards
Lobbying tab visibility
Patch:
derive visibility from `regulatoryAffairs`
---
34. New Selectors
Add selectors such as:
```ts
researchPoints(state)
researchPointsPerSecond(state)
nextResearchScientistCost(state)
researchTechPurchased(state, techId)
tradingBotsUnlocked(state)
powerInfrastructureUnlocked(state)
lobbyingUnlocked(state)
```
Important rule
`lobbyingUnlocked(state)` should now be derived from:
```ts
state.purchasedResearchTech['regulatoryAffairs'] === true
```
---
35. Save / Load Patch
The save/load system must now include:
```ts
researchPoints
researchComputerScientistCount
purchasedResearchTech
powerUnlocked / power counts if used explicitly
influence
purchasedPolicies
```
Migration defaults for older saves
If missing:
`researchPoints = 0`
`researchComputerScientistCount = 0`
`purchasedResearchTech = {}`
`influence = 0`
`purchasedPolicies = {}`
This avoids save breakage.
---
36. Recommended Implementation Order
Step 1 — Add Research resource layer
add Research Points to state
add Research Computer Scientist unit
add RP generation per tick
Step 2 — Add Research technologies
Algorithmic Trading
Power Systems Engineering
Regulatory Affairs
Step 3 — Patch unlock logic
Bots unlock through Research
Power unlocks through Research
Lobbying unlocks through Research
Step 4 — Patch Research UI
add Research production section
add Research tech cards
Step 5 — Patch prestige upgrade role
remove prestige-based Lobbying unlock assumptions
add broader scaling prestige upgrades
Step 6 — Test progression pacing
when research becomes available
when bots unlock
when power unlocks
when lobbying unlocks
whether prestige still feels rewarding as a scaling system
---
37. Final Master Summary
This master extension combines the currently approved design for Research, Power, and Lobbying into one document.
Final approved progression rule
Research unlocks advanced systems, including Lobbying. Prestige scales the whole machine.
This means:
hire Research Computer Scientists with Cash
generate Research Points
spend Research Points to unlock Trading Bots, Power Infrastructure, and Lobbying
use Power to support machine-era scaling
use Influence inside Lobbying to alter policy
use Prestige to permanently improve all systems over repeated runs
This document should be treated as the current consolidated extension source of truth for these systems.
