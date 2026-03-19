# Trading Desk Mechanics Reference

This document describes the **current implemented game mechanics** in the codebase, with an emphasis on formulas, relationships between systems, progression gates, and notable implementation details.

It is based on the runtime logic in `src/`, not older design notes.

## Canonical Data Model

`mechanics.json` is now the canonical source of truth for numeric balance data, ids, unlock metadata, thresholds, durations, labels, rewards, and progression structure.

The runtime intentionally does **not** use a formula DSL. Instead:

- `mechanics.json` stores parameters and lightweight declarative conditions.
- runtime code in `src/utils/*`, `src/store/*`, and `src/sim/*` owns the actual formulas and procedural behavior.
- typed access flows through `src/types/mechanics.ts` and `src/lib/mechanics.ts`.

### Main mechanics-backed registry layers

- `src/lib/mechanics.ts` loads `mechanics.json`, exposes typed helpers, and evaluates shared condition metadata.
- `src/data/units.ts`, `src/data/automation.ts`, `src/data/capacity.ts`, `src/data/powerInfrastructure.ts`, `src/data/sectors.ts`, `src/data/boosts.ts`, `src/data/marketEvents.ts`, `src/data/lobbyingPolicies.ts`, `src/data/upgrades.ts`, `src/data/repeatableUpgrades.ts`, `src/data/prestigeUpgrades.ts`, `src/data/researchTech.ts`, and `src/data/milestones.ts` all build their registries from `mechanics.json`.
- old fallback registries like `src/data/constants.ts` and `src/data/researchTechFromMechanics.ts` have been removed.

### Shared unlock and condition evaluation

- `evaluateMechanicsCondition()` in `src/lib/mechanics.ts` evaluates reusable metadata such as `all`, `any`, threshold counts, research requirements, lobbying discovery, compliance visibility, and synthetic aggregate counters.
- unlock and visibility helpers like `isUnitDefinitionUnlocked()`, `isAutomationStrategyDefinitionUnlocked()`, `isCapacityInfrastructureDefinitionVisible()`, `isPowerInfrastructureDefinitionVisible()`, and `isSectorDefinitionUnlockedByResearch()` centralize runtime gate checks.
- milestone evaluation now reads `conditionModel` metadata from `mechanics.json`, but the condition-model interpreter still lives in code.

## Scope and Source Files

The main mechanic sources are:

- `src/store/gameStore.ts`
- `src/utils/economy.ts`
- `src/utils/automation.ts`
- `src/utils/compliance.ts`
- `src/utils/lobbying.ts`
- `src/utils/boosts.ts`
- `src/utils/prestige.ts`
- `src/utils/capacity.ts`
- `src/utils/specialization.ts`
- `src/utils/mandates.ts`
- `src/utils/offlineProgress.ts`
- `src/utils/persistence.ts`
- `src/data/units.ts`
- `src/data/researchTech.ts`
- `src/data/upgrades.ts`
- `src/data/repeatableUpgrades.ts`
- `src/data/prestigeUpgrades.ts`
- `src/data/lobbyingPolicies.ts`
- `src/data/boosts.ts`
- `src/data/marketEvents.ts`
- `src/data/capacity.ts`
- `src/data/powerInfrastructure.ts`
- `src/data/milestones.ts`

## 1. Core Game Loop

The game runs a tick every `100ms` from `src/App.tsx`.

### Tick order

Each tick processes systems in this order:

1. Market events
2. Compliance timer
3. Timed boosts
4. Passive cash / research / influence income
5. Automation cycle payouts
6. Milestone evaluation and rewards

### Main active loop

- Manual trades generate instant cash.
- Human and institutional units generate passive cash per second.
- Scientists generate research points per second.
- Senators generate influence per second.
- Automation units generate cash in discrete payout cycles.
- Research unlocks new systems and higher tiers.
- Compliance creates recurring cost and efficiency pressure.
- Prestige resets run-state progression in exchange for reputation and permanent bonuses.

## 2. Core Resources

### Currencies

- `Cash`: main spending currency for units, upgrades, desk capacity, and power infrastructure.
- `Research Points`: used for research nodes and RP repeatables.
- `Influence`: used for lobbying policies and influence repeatables.
- `Reputation`: prestige currency for permanent meta upgrades.

### Important tracked totals

- `lifetimeCashEarned`
- `lifetimeManualTrades`
- `lifetimeResearchPointsEarned`
- `prestigeCount`
- `reputationSpent`
- `totalComplianceReviewsTriggered`
- `totalCompliancePaymentsMade`
- `totalTimedBoostActivations`

## 3. Starting State

The initial state in `src/data/initialState.ts` starts with:

- `cash = 0`
- `researchPoints = 0`
- `influence = 0`
- `reputation = 0`
- `baseDeskSlots = 10`
- `serverRackCount = 1`
- finance sector unlocked
- `complianceReviewRemainingSeconds = 60`
- `nextMarketEventCooldownSeconds = 300`

## 4. Core Formulas

## 4.1 Manual trading

Manual trade income is calculated in `getManualIncome()`.

```text
manualIncome = manualBase
             * manualExecutionRefinementMultiplier
             * globalProfitMultiplier
             * timedProfitMultiplier
             * prestigeGlobalRecognitionMultiplier
```

### Manual base construction

Start with `1`.

- `betterTerminal`: sets value to `2`
- `premiumDataFeed`: `* 1.25`
- `tradeShortcuts`: `+ 1`
- `premiumDataFeed` is applied **again**: `* 1.25`

So the implemented upgrade order is:

```text
value = 1
if betterTerminal -> 2
if premiumDataFeed -> *1.25
if tradeShortcuts -> +1
if premiumDataFeed -> *1.25 again
```

### Important note

`premiumDataFeed` is applied twice in code for manual income, so its real click effect is stronger than its description suggests.

## 4.2 Unit cost scaling

Standard unit cost formula:

```text
nextCost = floor(baseCost * scaling^owned)
```

This is used for:

- human units
- institution units
- scientist units
- politicians
- automation units
- desk capacity infrastructure
- power infrastructure

### Human-side discount layer

Human, institution, scientist, and politician costs are multiplied by:

```text
humanCostMultiplier = max(0.2, 1 - 0.05 * betterHiringPipelineRank)
```

Final cost is then floored and clamped to at least `1`.

### Purchasable unit cost formulas

For normal purchasable units, the implemented purchase price is:

```text
unitPurchaseCost(unit, owned) = max(1, floor(baseCost * scaling^owned * discountMultiplier))
```

Where `discountMultiplier` is usually:

- `1` for automation and power infrastructure
- `humanCostMultiplier` for human staff, institutions, scientists, and senators

### Bulk purchase formula

For `x5` and `x10`, total unit cost is:

```text
bulkCost = sum from i=0 to quantity-1 of unitPurchaseCost(unit, owned + i)
```

For `max`, the game keeps buying until one of these stops the loop:

- not enough cash
- no remaining desk slots for desk-limited units
- next purchase would exceed current power capacity

### Desk-limited purchasable units

These units require free desk slots:

- Intern
- Junior Trader
- Senior Trader
- Intern Scientist
- Junior Scientist
- Senior Scientist

### Power-limited purchasable units

The game prevents purchases that would push total live power use above live power capacity.

### Exact purchasable unit cost formulas

Let `n` be the number already owned before the next purchase.

#### Human, institution, research, and influence units

These all use the prestige hiring discount:

```text
humanStaffCostMultiplier = max(0.2, 1 - 0.05 * betterHiringPipelineRank)
```

Exact formulas:

```text
internCost(n) = max(1, floor(15 * 1.15^n * humanStaffCostMultiplier))
juniorTraderCost(n) = max(1, floor(120 * 1.17^n * humanStaffCostMultiplier))
seniorTraderCost(n) = max(1, floor(3500 * 1.19^n * humanStaffCostMultiplier))

propDeskCost(n) = max(1, floor(18000 * 1.20^n * humanStaffCostMultiplier))
institutionalDeskCost(n) = max(1, floor(150000 * 1.21^n * humanStaffCostMultiplier))
hedgeFundCost(n) = max(1, floor(1100000 * 1.22^n * humanStaffCostMultiplier))
investmentFirmCost(n) = max(1, floor(8500000 * 1.23^n * humanStaffCostMultiplier))

internScientistCost(n) = max(1, floor(600 * 1.19^n * humanStaffCostMultiplier))
juniorScientistCost(n) = max(1, floor(2400 * 1.21^n * humanStaffCostMultiplier))
seniorScientistCost(n) = max(1, floor(9500 * 1.22^n * humanStaffCostMultiplier))

senatorCost(n) = max(1, floor(14000 * 1.23^n * humanStaffCostMultiplier))
```

#### Automation units

Automation purchase costs currently have no extra discount layer:

```text
quantTraderCost(n) = max(1, floor(2500 * 1.22^n))
ruleBasedBotCost(n) = max(1, floor(12000 * 1.24^n))
mlBotCost(n) = max(1, floor(80000 * 1.26^n))
aiBotCost(n) = max(1, floor(400000 * 1.28^n))
```

#### Unit bulk formulas

For any purchasable unit, `x5` and `x10` use:

```text
bulkUnitCost(unit, owned, quantity) = sum from i=0 to quantity-1 of unitCost(owned + i)
```

For `max`, the game keeps buying until the next purchase would violate one of:

- not enough cash
- no free desk slots for desk-limited units
- not enough live power headroom for power-using units

The stop condition is evaluated sequentially, one simulated purchase at a time.

### Exact capacity infrastructure cost formulas

Let `n` be currently owned.

```text
deskSpaceCost(n) = floor(180 * 1.08^n)
floorSpaceCost(n) = floor(8500 * 1.24^n)
officeCost(n) = floor(42000 * 1.38^n)
```

Bulk formula:

```text
bulkCapacityCost(item, owned, quantity) = sum from i=0 to quantity-1 of capacityCost(owned + i)
```

`max` buying stops when the next purchase would exceed available cash or available live power headroom.

### Exact power infrastructure cost formulas

Power infrastructure can receive a lobbying subsidy:

```text
powerInfrastructureSubsidyMultiplier = 0.9 if industrialPowerSubsidies else 1
```

Exact formulas:

```text
serverRackCost(n) = max(1, floor(1800 * 1.14^n * powerInfrastructureSubsidyMultiplier))
serverRoomCost(n) = max(1, floor(100000 * 1.15^n * powerInfrastructureSubsidyMultiplier))
dataCenterCost(n) = max(1, floor(1000000 * 1.21^n * powerInfrastructureSubsidyMultiplier))
cloudInfrastructureCost(n) = max(1, floor(6500000 * 1.24^n * powerInfrastructureSubsidyMultiplier))
```

Bulk formula:

```text
bulkPowerInfrastructureCost(item, owned, quantity) = sum from i=0 to quantity-1 of powerInfrastructureCost(owned + i)
```

`max` buying stops only on cash shortage.

### Non-scaled purchasables

These are purchasable but do **not** use exponential scaling:

- one-time upgrades: fixed cash cost
- research tech: fixed cash or RP cost
- lobbying policies: fixed influence cost
- trader specialist training: fixed `2000 cash` each
- institution mandate applications: fixed cash cost by unit tier
- prestige upgrades: banded rank costs, not exponential scaling

## 4.3 Passive cash per second

Passive cash is calculated by `getCashPerSecond()`.

```text
cashPerSecond = basePassiveIncome
              * globalProfitMultiplier
              * globalEventMultiplier
              * prestigeGlobalRecognitionMultiplier
```

Where `basePassiveIncome` is the sum of:

- unassigned general-desk human income
- sector-assigned human income
- unassigned institution income
- sector-assigned institution income

### Internal relationship

Human and institution production are both affected by:

- machine efficiency
- compliance efficiency
- category-specific compliance penalties
- timed boosts
- sector assignment optimization
- sector base multipliers
- sector event multipliers
- prestige multipliers

This means the game's infrastructure and compliance systems influence much more than just bots.

### Displayed cash per second vs tick cash per second

The runtime uses two related but different values:

```text
tickCashPerSecond = passiveCashPerSecondOnly
```

This is what `tick()` uses for continuous passive cash.

The UI headline `cashPerSecond` selector is:

```text
displayedCashPerSecond = passiveCashPerSecond
                      + quantTraderAverageIncomePerSecond
                      + ruleBasedBotAverageIncomePerSecond
                      + mlBotAverageIncomePerSecond
                      + aiBotAverageIncomePerSecond
```

So the number shown to the player includes automation averages, even though automation income is actually paid in cycle bursts.

## 4.3.1 Purchasable unit output formulas

### Human desk units

```text
internIncome = 0.3
             * premiumDataFeed?
             * deskAnalytics?
             * crossDeskCoordination?
             * structuredOnboarding?
             * humanDeskTuningMultiplier
             * deskEfficiencyPrestigeMultiplier
```

Implemented human multipliers:

- `premiumDataFeed`: `*1.1`
- `deskAnalytics`: `*1.12`
- `crossDeskCoordination`: `*1.15`
- `structuredOnboarding`: `*1.2` for interns and juniors only
- prestige `deskEfficiency`: `* (1 + 0.04 * rank)`
- repeatable `humanDeskTuning`: `1 + 0.005 * rank`

```text
juniorTraderIncome = 3.2
                   * premiumDataFeed?
                   * deskAnalytics?
                   * crossDeskCoordination?
                   * structuredOnboarding?
                   * humanDeskTuningMultiplier
                   * deskEfficiencyPrestigeMultiplier
```

```text
seniorTraderIncome = 16
                   * executiveCompensationReform?
                   * premiumDataFeed?
                   * deskAnalytics?
                   * crossDeskCoordination?
                   * humanDeskTuningMultiplier
                   * deskEfficiencyPrestigeMultiplier
```

With:

- `executiveCompensationReform`: `*1.15`

### Institution units

```text
propDeskIncome = 120
               * propDeskOperatingModel?
               * institutionalOperatingStandards?
               * institutionalProcessRefinementMultiplier
```

```text
institutionalDeskIncome = 540
                        * institutionalClientBook?
                        * institutionalOperatingStandards?
                        * institutionalProcessRefinementMultiplier
```

```text
hedgeFundIncome = 3200
                * fundStrategyCommittee?
                * institutionalOperatingStandards?
                * institutionalProcessRefinementMultiplier
```

```text
investmentFirmIncome = 18000
                     * globalDistributionNetwork?
                     * institutionalOperatingStandards?
                     * institutionalProcessRefinementMultiplier
```

Institution multipliers:

- individual tier upgrade: usually `*1.2`
- `institutionalOperatingStandards`: `*1.12`
- repeatable `institutionalProcessRefinement`: `1 + 0.0075 * rank`

### Scientist units

```text
internScientistRP = 0.35 * sharedResearchLibrary?
juniorScientistRP = 1.1 * labAutomation? * sharedResearchLibrary?
seniorScientistRP = 3.4 * researchGrants? * sharedResearchLibrary?
```

Then total RP is multiplied by:

- `institutionalResearchNetwork`: `*1.2`
- `backtestingSuite`: `*1.15`
- `crossDisciplinaryModels`: `*1.1`
- `researchThroughput`: `1 + 0.0075 * rank`
- prestige `institutionalKnowledge`: `1 + 0.1 * rank`
- machine efficiency
- compliance efficiency
- human compliance penalty
- `researchSprint`: `*1.5` while active

### Senator output

```text
influencePerSenator = 0.01
                    * policyAnalysisDesk?
                    * donorNetwork?
                    * governmentRelationsOffice?
                    * policyReachMultiplier
                    * machineEfficiency
                    * globalInfluenceBoost
                    * prestigePolicyCapitalMultiplier
```

## 4.3.2 Sector-deployed unit formulas

When a human or institution unit is assigned into a sector, the assignment-side formula becomes:

```text
assignedOutput = assignedCount
               * unitBaseIncome
               * unitUpgradeMultipliers
               * localDeskOrInstitutionEfficiency
               * sectorAllocationEfficiencyMultiplier
               * specialistOrMandateBonusIfApplicable
               * sectorBaseMultiplier
               * sectorEventMultiplier
               * prestigeMarketReputationMultiplier
```

Where:

- `sectorAllocationEfficiencyMultiplier = 1 + 0.005 * rank`
- `marketReputationMultiplier = 1 + 0.03 * rank`
- matching specialist bonus = `1.2 * trainingMethodologyMultiplier`
- matching mandate bonus = base mandate bonus `* trainingMethodologyMultiplier`

### Important scope note

This sector-assigned formula applies to:

- interns
- junior traders
- senior traders
- prop desks
- institutional desks
- hedge funds
- investment firms

Automation units do **not** use this formula. They use their own target/strategy payout formula instead.

## 4.4 Research points per second

Research generation is calculated by `getResearchPointsPerSecond()`.

```text
RP/s = (internRP + juniorRP + seniorRP)
     * scientistUpgradeMultipliers
     * researchThroughputMultiplier
     * institutionalKnowledgeMultiplier
     * machineEfficiencyMultiplier
     * complianceEfficiencyMultiplier
     * humanCompliancePenaltyMultiplier
     * timedResearchBoostMultiplier
```

### Scientist upgrade layers

- `labAutomation`: junior scientists `* 1.2`
- `researchGrants`: senior scientists `* 1.25`
- `sharedResearchLibrary`: all scientists `* 1.12`
- `institutionalResearchNetwork`: total scientist output `* 1.2`
- `backtestingSuite`: total RP `* 1.15`
- `crossDisciplinaryModels`: total RP `* 1.1`

## 4.5 Influence per second

Influence generation is calculated by `getInfluencePerSecond()`.

```text
influencePerSecond = senatorBaseOutput
                   * policyReachMultiplier
                   * influenceUpgrades
                   * machineEfficiencyMultiplier
                   * globalInfluenceBoostMultiplier
                   * prestigePolicyCapitalMultiplier
```

### Important relationship

Influence uses `machineEfficiencyMultiplier()` too, so power/compliance problems can reduce political output.

## 4.6 Repeatable upgrade multipliers

Most repeatables use:

```text
multiplier = 1 + rank * effectPerRank
```

Reduction repeatables use:

```text
multiplier = max(floorValue, 1 - rank * effectPerRank)
```

Reduction floors:

- default floor: `0.5`
- `filingEfficiency`: floor `0.25`

Reduction repeatables are:

- `modelEfficiency`
- `computeOptimization`
- `complianceSystems`
- `filingEfficiency`
- `institutionalAccess`

## 4.6.1 Repeatable optimization purchase formulas

Each optimization rank uses:

```text
optimizationCost(rank) = floor(baseCost * costScaling^rank)
```

Bulk buy total cost:

```text
bulkOptimizationCost = sum from i=0 to quantity-1 of floor(baseCost * costScaling^(rank + i))
```

`max` buy continues until:

- available currency runs out, or
- the rank cap of `100` is reached

## 4.6.2 Explicit optimization formulas

### Desk family

```text
manualExecutionRefinementMultiplier = 1 + 0.005 * rank
humanDeskTuningMultiplier = 1 + 0.005 * rank
institutionalProcessRefinementMultiplier = 1 + 0.0075 * rank
sectorAllocationEfficiencyMultiplier = 1 + 0.005 * rank
```

### Research family

```text
researchThroughputMultiplier = 1 + 0.0075 * rank
trainingMethodologyMultiplier = 1 + 0.005 * rank
analyticalModelingMultiplier = 1 + 0.005 * rank
```

### Automation family

```text
executionStackTuningMultiplier = 1 + 0.0075 * rank
modelEfficiencyMultiplier = max(0.5, 1 - 0.003 * rank)
computeOptimizationMultiplier = max(0.5, 1 - 0.004 * rank)
signalQualityControlMultiplier = 1 + 0.005 * rank
```

### Governance family

```text
complianceSystemsMultiplier = max(0.5, 1 - 0.005 * rank)
filingEfficiencyMultiplier = max(0.25, 1 - 0.0075 * rank)
policyReachMultiplier = 1 + 0.005 * rank
institutionalAccessMultiplier = max(0.5, 1 - 0.005 * rank)
```

### Where these formulas feed into the game

- `manualExecutionRefinement` -> manual trade value
- `humanDeskTuning` -> intern/junior/senior base output
- `institutionalProcessRefinement` -> institution base output
- `sectorAllocationEfficiency` -> assigned sector output only
- `researchThroughput` -> total RP generation
- `trainingMethodology` -> specialist and mandate bonus strength
- `analyticalModeling` -> currently not wired into any live runtime formula
- `executionStackTuning` -> automation payout strength
- `modelEfficiency` -> automation cycle duration
- `computeOptimization` -> machine power usage
- `signalQualityControl` -> automation strategy effectiveness
- `complianceSystems` -> effective compliance burden
- `filingEfficiency` -> compliance review costs
- `policyReach` -> influence output
- `institutionalAccess` -> institutional compliance costs; its overdue-penalty interaction currently has no practical effect because the formula is clamped back to `1`

### Important optimization notes

- `analyticalModeling` exists in data and UI, but no current gameplay formula reads it.
- `institutionalAccess` does reduce institutional compliance costs.
- `institutionalAccess` appears intended to soften institutional overdue penalties too, but the implemented formula clamps the extra factor to `1`, so it does not currently change that penalty.

## 4.7 Machine efficiency and power

Power capacity is calculated by `getPowerCapacity()`.

```text
powerCapacity = (baseUtility
               + rackCapacity
               + roomCapacity
               + dataCenterCapacity
               + cloudCapacity)
               * policyMultipliers
               * prestigeMultipliers
               * globalEnergySupplyBoost
```

Expanded:

```text
baseUtility = 12

rackCapacity = serverRackCount * 3 * rackStackingBonus
roomCapacity = serverRoomCount * 30 * roomScaleoutBonus
dataCenterCapacity = dataCenterCount * 220 * dataCenterFabricBonus
cloudCapacity = cloudComputeCount * 700 * cloudBurstContractsBonus
```

Upgrade/policy multipliers:

- `rackStacking`: `* 1.25`
- `roomScaleout`: `* 1.25`
- `dataCenterFabric`: `* 1.3`
- `cloudBurstContracts`: `* 1.35`
- `priorityGridAccess`: `* 1.15`
- `powerDistribution`: `* 1.2`
- prestige `gridOrchestration`: `* (1 + 0.05 * rank)`
- `globalEnergySupplyBoost`: `* 1.05`

Power usage is:

```text
powerUsage = capacityInfrastructurePower
           + ruleBotPower
           + mlBotPower
           + aiBotPower
```

Humans, scientists, politicians, institutions, and quant traders currently use `0` live power in the actual runtime formula.

### Machine efficiency formula

```text
if usage <= 0: machineEfficiency = energyCompliancePenalty
if usage <= capacity: machineEfficiency = energyCompliancePenalty
if usage > capacity: machineEfficiency = min(1, capacity / usage) * eventModifier * energyCompliancePenalty
```

If `aiInfrastructureIncentives` is active, the over-cap ratio is multiplied by `1.1` before the `min(1, ...)` clamp.

### Important relationship

Despite the name, `machineEfficiencyMultiplier()` is used by:

- human passive income
- institution passive income
- research generation
- influence generation
- automation payouts

So power and energy compliance act as a broad infrastructure modifier across the entire economy.

## 4.8 Automation payouts

Automation units do not pay through normal passive income. They pay at cycle completion.

Automation payout formula from `getAutomationAdjustedPayout()`:

```text
automationPayout = owned
                 * basePayout
                 * marketTargetMultiplier
                 * sectorEventMultiplierIfTargeted
                 * strategyMultiplier
                 * automationEventMultiplier
                 * automationUpgradeMultiplier
                 * machineOutputPrestigeMultiplier
                 * machineEfficiencyMultiplier
                 * complianceEfficiencyMultiplier
                 * automationCompliancePenaltyMultiplier
                 * timedAutomationBoostMultiplier
                 * globalProfitMultiplier
                 * prestigeGlobalRecognitionMultiplier
```

### Automation target and strategy detail

```text
marketTargetMultiplier = 1 if no target, else sectorBaseMultiplier
sectorEventMultiplierIfTargeted = 1 if no target, else current sector event multiplier
```

Important relationships:

- targeted automation gets the sector base multiplier (`Finance 1.0`, `Technology 1.2`, `Energy 1.08`)
- targeted automation gets matching sector event multipliers
- automation does **not** get `sectorAllocationEfficiency`
- automation does **not** get prestige `marketReputation`
- automation strategy effectiveness is currently affected by `signalQualityControl`, not `analyticalModeling`

Cycle duration formula:

```text
duration = baseDuration
         * ruleOrMlDurationUpgradeMultiplier
         * modelEfficiencyMultiplier
```

Specific duration modifiers:

- `executionRoutingStack`: rule bots `* 0.9 duration`
- `inferenceBatching`: ML bots `* 0.9 duration`
- `modelEfficiency`: `1 - 0.003 * rank`, floored at `0.5`

## 4.9 Compliance burden and efficiency

Compliance burden is calculated in `src/utils/compliance.ts`.

### Base burden

```text
baseBurden = staffBurden
           + institutionBurden
           + automationBurden
           + sectorBurden
           + energyBurden
```

### Effective burden

```text
effectiveBurden = max(0,
  baseBurden
  * (1 - prestigeComplianceFrameworksRelief)
  * (regulatoryCounsel ? 0.92 : 1)
  * complianceSystemsMultiplier
  - flatLobbyingBurdenRelief
)
```

### Compliance efficiency

```text
baseComplianceEfficiency = max(0.75, 1 - effectiveBurden * 0.005 * (1 / timedComplianceReliefMultiplier))

finalComplianceEfficiency = min(1,
  baseComplianceEfficiency
  + lobbyingPenaltyRelief
  + prestigeComplianceFrameworksRelief
)
```

The timed compliance relief multiplier is:

- `1.1` while `Compliance Freeze` is active
- otherwise `1`

### Compliance review due formulas

Projected due by category is:

```text
categoryOutstandingDue = overdueAmount + currentCycleCost
```

Projected full review bill is:

```text
projectedReviewBill = (staffOutstanding + energyOutstanding + automationOutstanding + institutionalOutstanding)
                    / timedComplianceReliefMultiplier
```

### Manual payment formula

When the player presses `Pay Now` on one category:

```text
payment = min(currentCash, categoryOutstandingDue)
remainingDue = categoryOutstandingDue - payment
```

This means manual payment can pay both overdue debt and the current-cycle projected amount, even before the next rollover happens.

### Auto-pay behavior

At each review rollover, overdue amounts are increased by the new cycle cost, then auto-pay checks categories in this order:

1. staff
2. energy
3. automation
4. institutional

Each enabled category uses:

```text
autoPayment = min(availableCash, overdueAmount)
```

Auto-pay only settles overdue amounts after rollover, not the projected current-cycle amount ahead of time.

### Exact overdue penalty formulas

```text
humanCompliancePenaltyMultiplier = min(1, max(0.82, 1 - staffOverdue * 0.0008) + humanPenaltyRelief)
energyCompliancePenaltyMultiplier = max(0.82, 1 - energyOverdue * 0.0008)
automationCompliancePenaltyMultiplier = max(0.78, 1 - automationOverdue * 0.001)
institutionalCompliancePenaltyMultiplier = max(0.78, 1 - institutionalOverdue * 0.001) * min(1, 1 + (1 - institutionalAccessMultiplier))
```

Because `institutionalAccessMultiplier <= 1`, the last factor is always clamped to `1`, so `institutionalAccess` does not currently reduce overdue institutional penalties in practice.

## 4.10 Prestige

Prestige becomes available when:

- `lifetimeCashEarned >= 4,000,000`
- `prestigeCount < 10`
- player owns at least `1 quantTrader` **or** `1 ruleBasedBot`

Reputation gain is not based on a free-form formula after the threshold. It follows a fixed curve by current prestige count:

```text
[4, 6, 9, 13, 17, 21, 26, 31, 37, 66]
```

Then it is multiplied by `1.05` if `globalReputationBoost` is owned.

Prestige reset keeps:

- `reputation`
- `reputationSpent`
- `prestigeCount`
- `purchasedPrestigeUpgrades`
- `globalBoostsOwned`
- `discoveredLobbying`

The run resets to `initialState` otherwise.

### Prestige cost per rank

Each prestige upgrade rank costs:

- ranks `0-2`: `1`
- ranks `3-5`: `2`
- ranks `6-7`: `3`
- ranks `8+`: `4`

### Planned prestige purchase quirk

If the player plans `Seed Capital` purchases inside the prestige flow, those newly purchased ranks do **not** affect the same reset's starting cash. Starting cash is computed before planned purchases are applied.

## 4.11 Offline progress

Offline progress is capped at `8 hours`:

```text
appliedOfflineSeconds = min(elapsedSeconds, 28800)
```

Offline application simulates:

- market events
- compliance timer
- timed boosts
- passive cash
- passive RP
- passive influence
- automation cycles

The same offline simulation path is used when:

- loading a saved game
- importing a save
- manually applying offline progress through store logic

## 5. Units

## 5.1 Human and institution cash units

| Unit | Base Cost | Scaling | Base Output | Notes |
| --- | ---: | ---: | ---: | --- |
| Intern | 15 | 1.15 | 0.3 cash/s | First staff tier |
| Junior Trader | 120 | 1.17 | 3.2 cash/s | Early core trader |
| Senior Trader | 3,500 | 1.19 | 16 cash/s | Can be specialized |
| Prop Desk | 18,000 | 1.20 | 120 cash/s | First institution tier |
| Institutional Desk | 150,000 | 1.21 | 540 cash/s | Requires server room to buy |
| Hedge Fund | 1,100,000 | 1.22 | 3,200 cash/s | Requires data centre to buy |
| Investment Firm | 8,500,000 | 1.23 | 18,000 cash/s | Requires cloud compute to buy |

## 5.2 Research units

| Unit | Base Cost | Scaling | Base Output |
| --- | ---: | ---: | ---: |
| Intern Scientist | 600 | 1.19 | 0.35 RP/s |
| Junior Scientist | 2,400 | 1.21 | 1.1 RP/s |
| Senior Scientist | 9,500 | 1.22 | 3.4 RP/s |

## 5.3 Influence unit

| Unit | Base Cost | Scaling | Base Output |
| --- | ---: | ---: | ---: |
| Senator | 14,000 | 1.23 | 0.01 influence/s |

## 5.4 Automation units

| Unit | Base Cost | Scaling | Base Cycle | Base Payout | Avg Base Value |
| --- | ---: | ---: | ---: | ---: | ---: |
| Quant Trader | 2,500 | 1.22 | 4s | 20 | 5/s |
| Rule-Based Bot | 12,000 | 1.24 | 6s | 70 | 11.67/s |
| ML Bot | 80,000 | 1.26 | 12s | 220 | 18.33/s |
| AI Bot | 400,000 | 1.28 | 20s | 650 | 32.5/s |

### Important note

`quantTrader` has `baseIncomePerSecond` in the unit data, but live cash comes from automation cycles. `getQuantTraderIncome()` returns `0`.

## 6. Unit Unlock Gates

| Unit | Unlock Rule |
| --- | --- |
| Intern | `foundationsOfFinanceTraining` |
| Junior Trader | `juniorTraderProgram` |
| Senior Trader | `seniorRecruitment` |
| Quant Trader | `algorithmicTrading` |
| Intern Scientist | `foundationsOfFinanceTraining` |
| Junior Scientist | `juniorScientists` |
| Senior Scientist | `seniorScientists` |
| Senator | lobbying unlocked via `regulatoryAffairs` |
| Prop Desk | `propDeskOperations` |
| Institutional Desk | `institutionalDesks` and `serverRoomCount > 0` |
| Hedge Fund | `hedgeFundStrategies` and `dataCenterCount > 0` |
| Investment Firm | `investmentFirms` and `cloudComputeCount > 0` |
| Rule-Based Bot | `ruleBasedAutomation` |
| ML Bot | `machineLearningTrading` and `dataCenterCount > 0` |
| AI Bot | `aiTradingSystems` and `cloudComputeCount > 0` |

## 7. Desk Capacity System

Desk capacity is separate from power capacity.

### Desk slot formula

```text
totalDeskSlots = baseDeskSlots
               + deskSpaceCount * 1
               + floorSpaceCount * 25
               + officeCount * 100
```

Used desk slots:

```text
usedDeskSlots = interns
              + juniorTraders
              + seniorTraders
              + internScientists
              + juniorScientists
              + seniorScientists
```

### What does not use desk slots

- senators
- institutions
- automation units

### Capacity infrastructure

| Infrastructure | Base Cost | Scaling | Slots | Power Use |
| --- | ---: | ---: | ---: | ---: |
| Desk Space | 180 | 1.08 | 1 | 0.5 |
| Floor Space | 8,500 | 1.24 | 25 | 8 |
| Office | 42,000 | 1.38 | 100 | 30 |

### Capacity research gates

- `Desk Space`: available from the start
- `Floor Space`: requires `floorSpacePlanning`
- `Office`: requires `officeExpansionPlanning`

## 8. Power Infrastructure

| Infrastructure | Base Cost | Scaling | Base Capacity |
| --- | ---: | ---: | ---: |
| Server Rack | 1,800 | 1.14 | 3 |
| Server Room | 100,000 | 1.15 | 30 |
| Data Centre | 1,000,000 | 1.21 | 220 |
| Cloud Infrastructure | 6,500,000 | 1.24 | 700 |

### Visibility gates

- `Server Rack`: visible by default, but new purchases still require `serverRackSystems`
- `Server Room`: requires `serverRoomSystems`
- `Data Centre`: requires `dataCenterSystems`
- `Cloud Infrastructure`: requires `cloudInfrastructure`

### Purchase unlock gate

All power infrastructure purchases are blocked until `serverRackSystems` is researched, even though the player starts the game with `1` server rack already.

## 9. Sectors, Assignment, Specialization, and Mandates

## 9.1 Sector base multipliers

| Sector | Base Multiplier |
| --- | ---: |
| Finance | 1.00 |
| Technology | 1.20 |
| Energy | 1.08 |

Only finance is unlocked by default.

## 9.2 Assignable units

Sector assignments exist for:

- `intern`
- `juniorTrader`
- `seniorTrader`
- `propDesk`
- `institutionalDesk`
- `hedgeFund`
- `investmentFirm`

Sector-assigned output gains:

- sector assignment multiplier from `sectorAllocationEfficiency`
- sector base multiplier
- sector event multiplier
- prestige `marketReputation`
- then later global and prestige global multipliers

## 9.3 Trader specialization

Only `seniorTrader` is actually implemented as a specialist unit.

### Specialist training

- finance specialization unlock: `financeSpecialistTraining`
- technology specialization unlock: `technologySpecialistTraining`
- energy specialization unlock: `energySpecialistTraining`
- training cost: `2,000 cash` each

### Specialist bonus

For a specialist assigned to its matching sector:

```text
specialistBonus = 1.2 * trainingMethodologyMultiplier
```

This specialist income is added on top of generic sector-assigned senior income.

## 9.4 Institution mandates

Mandates apply to:

- `propDesk`
- `institutionalDesk`
- `hedgeFund`
- `investmentFirm`

### Mandate research unlocks

- finance mandate: `financeMandateFramework`
- technology mandate: `techGrowthMandateFramework`
- energy mandate: `energyExposureFramework`

### Application cost

| Unit | Mandate Cost |
| --- | ---: |
| Prop Desk | 5,000 |
| Institutional Desk | 12,000 |
| Hedge Fund | 30,000 |
| Investment Firm | 75,000 |

### Matching-sector mandate bonus

```text
propDesk = 1.05 * trainingMethodologyMultiplier
institutionalDesk = 1.075 * trainingMethodologyMultiplier
hedgeFund = 1.10 * trainingMethodologyMultiplier
investmentFirm = 1.125 * trainingMethodologyMultiplier
```

Like specialists, this is additive on top of generic assigned institution output.

## 10. Research Tree

Research nodes use fixed costs and prerequisites. Some are cash-funded early, but most later nodes use RP.

## 10.1 Markets / sectors branch

| Tech | Cost | Currency | Prerequisites | Gate |
| --- | ---: | --- | --- | --- |
| Technology Markets | 220 | RP | Foundations | 2 Intern Scientists or 40 RP banked |
| Energy Markets | 380 | RP | Technology Markets | none |

## 10.2 Human capital branch

| Tech | Cost | Currency | Prerequisites | Gate |
| --- | ---: | --- | --- | --- |
| Foundations of Finance Training | 50 | Cash | none | none |
| Junior Trader Program | 400 | Cash | Foundations | 5 Interns |
| Senior Recruitment | 3,000 | Cash | Junior Trader Program | 5 Junior Traders |
| Junior Scientists | 100 | RP | Foundations | 5 Intern Scientists or 40 RP banked |
| Senior Scientists | 1,000 | RP | Junior Scientists | 5 Junior Scientists or 160 RP banked |
| Prop Desk Operations | 100 | RP | Senior Recruitment | 5 Senior Traders |
| Institutional Desks | 1,500 | RP | Prop Desk Operations | 3 Prop Desks |
| Hedge Fund Strategies | 7,500 | RP | Institutional Desks | 2 Institutional Desks |
| Investment Firms | 20,000 | RP | Hedge Fund Strategies | 1 Hedge Fund |
| Finance Specialist Training | 180 | RP | Senior Recruitment | visible after Senior Recruitment |
| Technology Specialist Training | 260 | RP | Senior Recruitment, Technology Markets | visible after prereqs |
| Energy Specialist Training | 340 | RP | Senior Recruitment, Energy Markets | visible after prereqs |

## 10.3 Infrastructure branch

| Tech | Cost | Currency | Prerequisites | Gate |
| --- | ---: | --- | --- | --- |
| Floor Space Planning | 140 | RP | none | 8 active trader seats to unlock, visible earlier |
| Office Expansion Planning | 480 | RP | Floor Space Planning | 25 active trader seats |
| Server Rack | 100 | RP | none | none |
| Server Room Systems | 500 | RP | Server Rack | none |
| Data Centre Systems | 9,000 | RP | Server Room Systems | 5 Rule-Based Bots |
| Cloud Infrastructure | 22,000 | RP | Data Centre Systems, AI Trading Systems | none |

## 10.4 Automation branch

| Tech | Cost | Currency | Prerequisites | Gate |
| --- | ---: | --- | --- | --- |
| Algorithmic Foundations | 150 | RP | Senior Recruitment | 5 Senior Traders |
| Mean Reversion Models | 60 | RP | Algorithmic Foundations | none |
| Momentum Models | 80 | RP | Mean Reversion Models | none |
| Arbitrage Engine | 140 | RP | Momentum Models | none |
| Market Making Engine | 120 | RP | Arbitrage Engine | none |
| Scalping Framework | 180 | RP | Market Making Engine | none |
| Rule-Based Automation | 700 | RP | Algorithmic Foundations | none |
| Machine Learning Trading | 1,000 | RP | Rule-Based Automation, Data Centre Systems | 5 Rule-Based Bots |
| AI Trading Systems | 1,500 | RP | Machine Learning Trading, Data Centre Systems | 3 ML Bots |

## 10.5 Boosts branch

| Tech | Cost | Currency | Prerequisites |
| --- | ---: | --- | --- |
| Aggressive Trading Window Protocols | 2,000 | RP | Senior Recruitment |
| Reserve Capital Deployment | 4,000 | RP | Regulatory Affairs |
| Overclock Server Protocols | 6,500 | RP | Machine Learning Trading |
| Research Sprint Protocols | 1,500 | RP | Junior Scientists |
| Compliance Freeze Protocols | 9,000 | RP | Regulatory Affairs |
| Boost Automation Protocols | 18,000 | RP | AI Trading Systems, Regulatory Affairs |

## 10.6 Regulation / institutions branch

| Tech | Cost | Currency | Prerequisites | Gate |
| --- | ---: | --- | --- | --- |
| Regulatory Affairs | 6,000 | RP | Server Rack | none |
| Finance Mandate Framework | 1,400 | RP | Regulatory Affairs, Prop Desk Operations | 1 Prop Desk |
| Tech Growth Mandate Framework | 2,100 | RP | Finance Mandate Framework, Technology Markets | 1 Prop Desk |
| Energy Exposure Framework | 2,800 | RP | Tech Growth Mandate Framework, Energy Markets | 1 Prop Desk |

## 11. One-Time Upgrades

## 11.1 Trading desk upgrades

| Upgrade | Cost | Effect |
| --- | ---: | --- |
| Better Terminal | 20 | Manual trade set to `$2` |
| Trade Shortcuts | 60 | Manual trade `+1` |
| Premium Data Feed | 350 | Manual `+25%` in description, but applied twice in code; interns/juniors/seniors `+10%` |
| Desk Analytics | 900 | interns/juniors/seniors `+12%` |
| Structured Onboarding | 6,000 | interns/juniors `+20%` |
| Cross-Desk Coordination | 18,000 | interns/juniors/seniors `+15%` |

## 11.2 Research upgrades

| Upgrade | Cost | Effect |
| --- | ---: | --- |
| Lab Automation | 12,000 | Junior Scientist RP `+20%` |
| Research Grants | 40,000 | Senior Scientist RP `+25%` |
| Shared Research Library | 110,000 | All scientist RP `+12%` |
| Backtesting Suite | 250,000 | Total RP `+15%` |
| Institutional Research Network | 900,000 | All scientist output `+20%` |
| Cross-Disciplinary Models | 2,000,000 | Total RP `+10%`; extra described training effect is not implemented |

## 11.3 Institution upgrades

| Upgrade | Cost | Effect |
| --- | ---: | --- |
| Prop Desk Operating Model | 140,000 | Prop Desk `+20%` |
| Institutional Client Book | 650,000 | Institutional Desk `+20%` |
| Fund Strategy Committee | 3,500,000 | Hedge Fund `+20%` |
| Global Distribution Network | 18,000,000 | Investment Firm `+20%` |
| Institutional Operating Standards | 8,000,000 | All institution tiers `+12%` |
| Mandate Alignment Framework | 12,000,000 | Described bonus exists, but no runtime effect is wired |

## 11.4 Automation upgrades

| Upgrade | Cost | Effect |
| --- | ---: | --- |
| Systematic Execution | 100,000 | Quant Trader and Rule-Based Bot payout `+15%` |
| Bot Telemetry | 130,000 | Rule-Based Bot payout `+15%` |
| Execution Routing Stack | 220,000 | Rule-Based Bot cycle duration `-10%` |
| Model Serving Cluster | 700,000 | ML Bot payout `+20%` |
| Inference Batching | 1,200,000 | ML Bot cycle duration `-10%` |
| AI Risk Stack | 4,500,000 | AI Bot payout `+20%` |

## 11.5 Infrastructure upgrades

| Upgrade | Cost | Effect |
| --- | ---: | --- |
| Rack Stacking | 8,000 | Description says `+20%`, code gives server rack capacity `+25%` |
| Cooling Systems | 250,000 | Machine power use `-10%` |
| Room Scaleout | 120,000 | Description says `+20%`, code gives server room capacity `+25%` |
| Power Distribution | 600,000 | Description says `+15%`, code gives total power capacity `+20%` |
| Data Centre Fabric | 2,200,000 | Description says `+25%`, code gives data centre capacity `+30%` |
| Cloud Burst Contracts | 10,000,000 | Description says `+25%`, code gives cloud capacity `+35%` |

## 11.6 Compliance and lobbying upgrades

| Upgrade | Cost | Effect |
| --- | ---: | --- |
| Policy Analysis Desk | 90,000 | Influence `+25%` |
| Regulatory Counsel | 180,000 | Effective compliance burden `-8%` |
| Donor Network | 250,000 | Influence `+20%` |
| Compliance Software Suite | 750,000 | Staff and institutional compliance cost `-10%` |
| Government Relations Office | 2,500,000 | Influence `+15%` |
| Filing Automation | 4,000,000 | Automation and institutional compliance cost `-10%` |

## 12. Repeatable Optimizations

All repeatables unlock globally after the first prestige.

| Upgrade | Currency | Base Cost | Scaling | Effect |
| --- | --- | ---: | ---: | --- |
| Manual Execution Refinement | Cash | 5,000 | 1.11 | Manual trade `+0.5%` per rank |
| Human Desk Tuning | Cash | 15,000 | 1.11 | Human output `+0.5%` per rank |
| Institutional Process Refinement | Cash | 100,000 | 1.12 | Institution output `+0.75%` per rank |
| Sector Allocation Efficiency | Cash | 50,000 | 1.11 | Sector-assigned output `+0.5%` per rank |
| Research Throughput | RP | 250 | 1.10 | RP generation `+0.75%` per rank |
| Training Methodology | RP | 400 | 1.10 | Specialist and mandate effectiveness `+0.5%` per rank |
| Analytical Modeling | RP | 500 | 1.10 | Automation market/strategy effectiveness `+0.5%` per rank |
| Execution Stack Tuning | Cash | 80,000 | 1.12 | Automation payout `+0.75%` per rank |
| Model Efficiency | RP | 600 | 1.11 | Automation cycle duration `-0.3%` per rank |
| Compute Optimization | RP | 800 | 1.11 | Machine power use `-0.4%` per rank |
| Signal Quality Control | RP | 700 | 1.10 | Strategy effectiveness `+0.5%` per rank |
| Compliance Systems | Influence | 8 | 1.12 | Compliance burden `-0.5%` per rank |
| Filing Efficiency | Influence | 10 | 1.12 | Compliance review costs `-0.75%` per rank |
| Policy Reach | Influence | 12 | 1.13 | Influence gain `+0.5%` per rank |
| Institutional Access | Influence | 14 | 1.13 | Institutional compliance costs and friction `-0.5%` per rank |

## 13. Lobbying Policies

Lobbying unlocks with `Regulatory Affairs`.

## 13.1 Labor track

| Policy | Cost | Effect |
| --- | ---: | --- |
| Payroll Reporting Reform | 12 | Staff compliance cost `-12%` |
| Workforce Filing Simplification | 20 | Flat burden relief `1`, staff cost `-8%` |
| Training Accreditation Relief | 32 | Human compliance drag relief `+5%`; also senior trader income `+15%` via economy code |

## 13.2 Energy track

| Policy | Cost | Effect |
| --- | ---: | --- |
| Industrial Energy Relief | 16 | Energy compliance cost `-15%`; also power infrastructure purchase cost `-10%` |
| Grid Stabilization Subsidies | 24 | Burden relief `1.2`; also power capacity `+15%` |
| Data Center Utility Credits | 36 | Energy compliance cost `-10%`, automation oversight relief `0.8`, rule/ML bot power use `-20%` |

## 13.3 Market track

| Policy | Cost | Effect |
| --- | ---: | --- |
| Institutional Reporting Relief | 18 | Institutional compliance cost `-15%`, reporting relief `0.5` |
| Market Access Streamlining | 28 | Sector relief `1` |
| Capital Requirements Easing | 42 | Burden relief `1`, penalty relief `+5%`, reporting relief `1` |

## 13.4 Technology track

| Policy | Cost | Effect |
| --- | ---: | --- |
| Algorithmic Exemptions | 20 | Automation compliance cost `-15%` |
| Model Registration Reform | 32 | Automation oversight relief `1.2` |
| AI Oversight Streamlining | 48 | Penalty relief `+5%`, automation oversight relief `1`; also improves over-cap machine efficiency |

## 14. Compliance System Details

## 14.1 Burden sources

### Staff burden

| Source | Burden |
| --- | ---: |
| Intern | 0.10 |
| Junior Trader | 0.20 |
| Senior Trader | 0.40 |
| Intern Scientist | 0.08 |
| Junior Scientist | 0.15 |
| Senior Scientist | 0.30 |
| Senator | 0.25 |

### Institution burden

| Source | Burden |
| --- | ---: |
| Prop Desk | 2 |
| Institutional Desk | 4 |
| Hedge Fund | 7 |
| Investment Firm | 12 |

### Automation burden

| Source | Burden |
| --- | ---: |
| Quant Trader | 0.5 |
| Rule-Based Bot | 1 |
| ML Bot | 2 |
| AI Bot | 4 |

### Sector burden

- If any finance assignment exists: `+1.5`
- plus `0.05 * total finance-assigned units`
- plus `+0.5` if technology sector unlocked
- plus `+0.5` if energy sector unlocked

### Energy burden

```text
energyBurden = powerCapacity * 0.01 + powerUsage * 0.02
```

## 14.2 Compliance review costs

Reviews occur every `60s`.

### Staff compliance cost per review

| Source | Cost |
| --- | ---: |
| Intern | 1 |
| Junior Trader | 2 |
| Senior Trader | 4 |
| Intern Scientist | 1 |
| Junior Scientist | 2.5 |
| Senior Scientist | 5 |
| Senator | 3 |

### Energy review cost

```text
energyReviewCost = powerCapacity * 0.2 + powerUsage * 0.3
```

### Automation review cost per review

| Source | Cost |
| --- | ---: |
| Quant Trader | 1 |
| Rule-Based Bot | 3 |
| ML Bot | 6 |
| AI Bot | 12 |

### Institutional review cost per review

| Source | Cost |
| --- | ---: |
| Prop Desk | 5 |
| Institutional Desk | 10 |
| Hedge Fund | 20 |
| Investment Firm | 40 |

## 14.3 Overdue penalties

If review categories become overdue, output penalties apply:

- staff overdue: human and research output floor `0.82`
- energy overdue: machine efficiency floor `0.82`
- automation overdue: automation output floor `0.78`
- institutional overdue: institution output floor `0.78`

## 14.4 Compliance quirks

- Compliance uses its own internal power-capacity model.
- That model ignores desk/floor/office power usage.
- It also ignores prestige/global energy supply multipliers when calculating compliance-side energy burden and cost.
- Manual prepayment pays the current cycle amount, but the next review still rolls new charges forward.
- Auto-pay only pays overdue amounts after rollover.

## 15. Automation Strategies

| Strategy | Finance | Technology | Energy |
| --- | ---: | ---: | ---: |
| Mean Reversion | 1.12 | 1.02 | 1.02 |
| Momentum | 0.98 | 1.16 | 1.05 |
| Arbitrage | 1.08 | 1.03 | 1.03 |
| Market Making | 1.10 | 1.01 | 1.01 |
| Scalping | 1.04 | 1.10 | 1.06 |

These strategy multipliers are further multiplied by `signalQualityControl`, but not by `analyticalModeling` in the current runtime.

## 16. Timed Boosts and Global Boosts

## 16.1 Timed boosts

| Boost | Duration | Cooldown | Effect |
| --- | ---: | ---: | --- |
| Aggressive Trading Window | 300s | 1800s | Human output `*1.3`, sector/institution side `*1.2` |
| Deploy Reserve Capital | 300s | 1800s | All profit `*1.25` |
| Overclock Servers | 300s | 3600s | Automation output `*1.3` |
| Research Sprint | 300s | 1800s | RP `*1.5` |
| Compliance Freeze | 300s | 3600s | Softens compliance loss via `1.1` relief multiplier |

### Timed boost automation

- Auto mode requires `boostAutomationProtocols`.
- Auto mode activates a boost as soon as cooldown reaches `0`.
- prestige `strategicReserves` reduces cooldown by `3%` per rank, floored at `50%` of base cooldown.

### Timed boost activation quirk

The store increments `totalTimedBoostActivations` whenever `activateTimedBoost()` is called, even if the boost was not actually activatable and runtime state does not change.

## 16.2 Global boosts

| Global Boost | Effect |
| --- | --- |
| Global Profit Boost | overall profits `*1.05` |
| Global Energy Supply Boost | power capacity `*1.05` |
| Global Influence Boost | influence gain `*1.05` |
| Global Reputation Boost | reputation gain `*1.05` |

### Important note

Global boosts exist in runtime state and formulas, but there is no ordinary acquisition mechanic exposed in the core rules covered here.

They can still be toggled through the store via `setGlobalBoostOwned()` and are displayed in the Boosts tab as owned/unavailable states.

## 17. Market Events

| Event | Duration | Effect |
| --- | ---: | --- |
| Tech Rally | 90s | technology output `*1.20` |
| Energy Boom | 90s | energy output `*1.20` |
| Financial Tightening | 90s | finance output `*0.85` |
| Volatility Spike | 75s | automation output `*1.10` |
| Liquidity Crunch | 75s | global output `*0.92` |
| Grid Stress Warning | 60s | machine efficiency `*0.90` |

### Actual scope of each event type

- sector events affect:
  - sector-assigned human/institution output in that sector
  - automation units targeting that sector
- `Volatility Spike` affects automation payouts only
- `Liquidity Crunch` affects passive cash output only through `getGlobalEventMultiplier()`
- `Grid Stress Warning` affects machine efficiency, which then cascades into passive cash, research, influence, and automation

### Important event relationship

`Liquidity Crunch` does not directly reduce:

- research point generation
- influence generation
- automation payout formula

It only applies to passive cash formulas that use `getGlobalEventMultiplier()`.

### Scheduling

- normal cooldown between events: random `600-1200s`
- event history limit: `12`
- immediate repeats are avoided
- initial state starts with a shorter first cooldown of `300s`

## 18. Prestige Upgrades

| Upgrade | Max Rank | Effect |
| --- | ---: | --- |
| Global Recognition | 10 | all profits `+5%` per rank |
| Seed Capital | 10 | start each run with `+250 cash` per rank |
| Better Hiring Pipeline | 10 | human-side costs `-5%` per rank |
| Institutional Knowledge | 10 | RP `+10%` per rank |
| Grid Orchestration | 10 | machine output and power capacity `+5%` per rank |
| Compliance Frameworks | 10 | compliance burden/drag relief `+5%` per rank |
| Policy Capital | 10 | influence `+5%` per rank |
| Market Reputation | 10 | sector output `+3%` per rank |
| Desk Efficiency | 10 | human output `+4%` per rank |
| Strategic Reserves | 10 | timed boost cooldowns `-3%` per rank |

## 19. Milestones

Milestones are evaluated continuously after actions and ticks.

### Reward types

Milestones can grant:

- cash
- research points
- influence
- reputation
- permanent base desk slots

### Categories

- Getting Started
- Trading Desk
- Research
- Markets and Sectors
- Specialization
- Institutions
- Automation
- Infrastructure
- Compliance and Lobbying
- Boosts
- Prestige
- Optimisations

### Notable milestone relationships

- early milestones accelerate the opening with direct cash and RP rewards
- `Small Team` grants `+10` permanent desk slots
- many late milestones grant influence or reputation
- optimization milestones only matter after prestige unlocks the repeatable system
- `First Rack` is checked against `serverRackCount - 1` because the game starts with one rack already

## 20. Save, Import, and Offline Rules

### Save system

- local storage key: `stock-incremental-save-v1`
- autosave interval: `15s`
- save on `beforeunload`
- export/import uses base64-encoded JSON
- state normalization and legacy migration are implemented

### Settings stored in state

- `autosaveEnabled`
- `complianceAutoPayEnabled` by category
- `shortNumberThreshold`

### UI note

The state supports these settings, but the normal settings UI does not expose full toggles for all of them.

### Number formatting note

The number formatting utilities use a hardcoded threshold of `1,000,000` for short-format display.

`settings.shortNumberThreshold` is persisted in save data, but it is not currently used by the shared formatting utilities.

## 21. Notable Implementation Mismatches and Quirks

These are important if this file is used for balancing or documentation work.

### Confirmed runtime quirks

- `premiumDataFeed` applies its manual multiplier twice.
- `mandateAlignmentFramework` has no runtime effect.
- `crossDisciplinaryModels` does not implement its described training-efficiency bonus.
- `analyticalModeling` currently has no live runtime effect.
- only `seniorTrader` specialization is implemented, even though some text implies broader trader specialization.
- prestige requires a `quantTrader` or `ruleBasedBot`, not strictly a rule bot.
- several infrastructure upgrade descriptions understate the actual code multipliers.
- machine efficiency affects almost every passive production stream, not just automation.
- many power usage constants for human and institution units exist in constants but are not used in the live power formula.
- `settings.shortNumberThreshold` is saved but ignored by the current formatting helpers.
- `Liquidity Crunch` sounds global, but it only affects passive cash formulas.

## 22. Practical Progression Summary

The implemented progression path is roughly:

1. Manual trades
2. Foundations -> Interns and Intern Scientists
3. Junior Trader Program -> Junior Traders
4. Senior Recruitment -> Senior Traders
5. Research branches into sectors, scientists, and infrastructure
6. Algorithmic Foundations -> Quant Traders
7. Rule-Based Automation + Server Room / Data Centre expansion
8. Prop Desk -> Institutional Desk -> Hedge Fund -> Investment Firm
9. Regulatory Affairs -> Senators and lobbying
10. ML / AI automation with heavier power and compliance pressure
11. Prestige at 4,000,000 lifetime cash with at least one quant trader or rule bot

This makes the current game a layered incremental management game where manual trading, staffing, research, compliance, power, automation, sectors, lobbying, and prestige all feed back into one another.
