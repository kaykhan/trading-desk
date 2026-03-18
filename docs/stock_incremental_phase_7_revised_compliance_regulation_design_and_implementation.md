# Stock Incremental Game — Phase 7 Revised Design Document and Implementation Planning

## Scope
This document replaces the earlier Phase 7 framing with a revised and expanded compliance model.

It combines:
1. **Design document**
2. **Implementation planning / specification sheet**
3. **System integration notes**

This revised version preserves the original compliance ideas while adding a new recurring compliance cost mechanic.

Phase 7 now defines:
- compliance burden as a scaling pressure system
- ongoing efficiency loss caused by compliance burden
- recurring compliance costs paid on a countdown timer
- cost categories for staff, energy, automation, and institutions
- how compliance becomes visible over time
- how compliance should appear in a dedicated Compliance tab
- how lobbying will later reduce both efficiency loss and compliance costs

This is now the intended compliance model going forward.

---

# PART I — DESIGN DOCUMENT

## 1. Phase 7 Goal
The goal of Phase 7 is to make scale come with visible external costs and friction.

Before this phase, the player’s growth is mostly constrained by:
- cost scaling
- desk slots
- research gating
- power constraints
- temporary market conditions

After this phase, growth should also create:
- regulatory friction
- recurring compliance costs
- efficiency drag from becoming larger, more institutional, more automated, and more exposed to regulated sectors

### Core design philosophy
Compliance should create meaningful management pressure, not hard punishment.

It should feel like:
- the cost of becoming a larger operation
- overhead from complexity and regulation
- something the player can manage, reduce, or optimize around

---

## 2. Revised Compliance Model
Phase 7 now has **two layers**.

### Layer 1 — Compliance Burden
A scaling pressure metric that represents how much regulatory and operational scrutiny the firm is under.

This burden creates an **ongoing efficiency loss**.

### Layer 2 — Recurring Compliance Costs
A timed compliance review/payment cycle that deducts money from the player on a recurring timer.

These compliance costs scale with the player’s operation.

### Approved summary
Compliance is now both:
- an ongoing efficiency drag
- a recurring cost center

This is the approved combined model.

---

## 3. Why This Is Better
This revised structure is stronger because it gives compliance two kinds of weight:

### Efficiency loss
Makes scale feel harder to optimize.

### Recurring cost timer
Makes compliance visible and tangible.

Together, these create a more satisfying system than either one alone.

They also give lobbying two clear future jobs:
- reduce efficiency loss
- reduce compliance cost categories

---

## 4. How Compliance Should Appear Over Time
Compliance should exist in the background from early game, but it should not be a major visible concern immediately.

### Approved staged visibility model
#### Stage 1 — early invisible / trivial
Compliance exists in the formula, but burden and costs are negligible.
The player does not need to care about it yet.

#### Stage 2 — milestone reveal
Once the player reaches a meaningful scale threshold, compliance becomes visible and starts mattering.

#### Stage 3 — scaling pressure
As the firm becomes larger, more automated, more institutional, and more exposed to regulated sectors, compliance scales harder and becomes a meaningful management layer.

This is the intended onboarding-friendly model.

---

## 5. When Compliance Becomes Visible
The first visible compliance reveal should happen once the player reaches a meaningful milestone.

### Example eligible milestones
- first **Prop Desk**
- first **Rule-Based Bot**
- first significant **Finance sector** presence
- a total **Compliance Burden threshold**

### Recommendation
Use a burden threshold for implementation simplicity, such as:
- reveal compliance UI once burden reaches a low threshold like **5**

This creates a smoother introduction.

---

## 6. Main Sources of Compliance Pressure
Compliance burden should come from the kinds of behavior that make the firm more visible, more complex, or more regulated.

### Approved primary sources
- institution count and tier
- automation count and tier
- sector exposure
- energy footprint / infrastructure scale
- staff growth

This aligns with the intended new tax/cost categories as well.

---

## 7. Compliance Cost Categories
Recurring compliance costs should be broken into visible categories.

### Approved categories
#### Staff Compliance
Represents payroll reporting, administrative overhead, workforce compliance, and related obligations.

#### Energy Compliance
Represents energy taxes, infrastructure reporting, and large-scale facility/usage overhead.

#### Automation Compliance
Represents model oversight, algorithm registration, technical review, and machine-side reporting burden.

#### Institutional Compliance
Represents fund reporting, legal overhead, reporting obligations, and institutional regulatory burden.

These should be shown individually in the Compliance tab.

---

## 8. Compliance Review Timer
Compliance costs should be deducted on a recurring countdown timer.

### Approved mechanic
A **Compliance Review** occurs on a fixed repeating cycle.

When the timer completes:
- calculate current compliance cost categories
- deduct total compliance cost from available Cash
- restart the timer

### Recommended first-pass timer
- every **60 seconds**

This gives the mechanic weight without feeling too spammy.

---

## 9. Why a Recurring Timer Works
A timed compliance payment cycle works well because it:
- is easy to understand
- is visible and tangible
- fits your growing “systems are running” aesthetic
- gives the player a real sense of overhead
- creates anticipation and planning pressure

This is a much stronger UX than hidden overhead alone.

---

## 10. Ongoing Efficiency Loss
The earlier compliance concept of efficiency loss should remain.

### Approved rule
Compliance burden should continue to apply a **global efficiency loss**.

This creates a persistent pressure layer that can later be reduced by lobbying.

### Why keep it
Because it gives lobbying a second important future role:
- reduce compliance burden / efficiency loss
- reduce recurring compliance costs

This makes lobbying much more strategic later.

---

## 11. What the Efficiency Loss Affects
The first implementation should keep this simple.

### Recommended first-pass scope
Apply compliance efficiency loss to:
- human output
- institutional output
- automation output

This makes it clearly relevant across the whole business.

---

## 12. What Happens If the Player Can’t Afford Compliance Costs
The first implementation should remain readable and not too punishing.

### Recommended first-pass behavior
If a compliance review occurs and the player cannot fully afford the cost:
- deduct as much as possible up to current Cash
- set Cash to 0 if needed
- still keep the ongoing efficiency loss system active

### Optional future extension
Unpaid compliance can later add extra temporary penalties, but that should be deferred for now.

The first version should keep the recurring payment mechanic clean and simple.

---

## 13. Compliance Tab
Compliance now needs its own dedicated tab or detailed panel.

### The Compliance tab is the diagnostic/problem view
It should show:
- current Compliance Burden
- current efficiency multiplier
- next Compliance Review timer
- next projected compliance bill
- cost breakdown by category
- main burden sources

This is now a required part of the system.

---

## 14. Lobbying Relationship
The Lobbying tab is the mitigation/solution view.

### Future approved role of lobbying
Lobbying should later reduce:
- compliance efficiency penalty
- compliance burden growth
- specific cost categories such as:
  - staff compliance cost
  - energy compliance cost
  - automation compliance cost
  - institutional compliance cost

This relationship should be visible in both tabs later.

---

## 15. Visibility Across Compliance and Lobbying Tabs
### Compliance tab
Shows:
- the problem
- current burden
- current penalty
- current costs
- source breakdown

### Lobbying tab
Shows:
- what relief policies are providing
- how much burden/cost reduction is active
- before/after mitigation comparisons later

This split is the intended UI relationship.

---

## 16. Final Design Summary for Revised Phase 7
### Final approved Phase 7 rule
**As the firm grows, compliance burden rises and applies ongoing efficiency loss, while recurring compliance reviews deduct visible scaling costs for staff, energy, automation, and institutional overhead.**

This is now the intended compliance model.

---

# PART II — IMPLEMENTATION PLANNING / SPECIFICATION SHEET

## 17. Derived Compliance Burden
The first implementation should use a derived value:

```ts
complianceBurden
```

This should be calculated from the player’s current state and does not need to be stored directly.

---

## 18. New Compliance Review State
Unlike burden, the recurring timer state does need to be persisted.

Suggested additions:

```ts
complianceVisible: boolean;
complianceReviewRemainingSeconds: number;
lastCompliancePayment: number;
```

### Recommended initial values
```ts
complianceVisible: false,
complianceReviewRemainingSeconds: 60,
lastCompliancePayment: 0,
```

These are enough for first implementation.

---

## 19. Suggested Burden Sources
### Institution burden contributions
- Prop Desk
- Institutional Desk
- Hedge Fund
- Investment Firm

### Automation burden contributions
- Quant Trader
- Rule-Based Bot
- ML Bot
- AI Bot

### Sector burden contributions
- higher-scrutiny sector exposure such as Finance

### Staff burden contributions
- Interns
- Junior Traders
- Senior Traders

### Energy burden contributions
- Power capacity and/or usage

This aligns burden and cost categories conceptually.

---

## 20. Suggested First-Pass Burden Values
These are placeholders and should be tuned.

### Staff burden
- Intern: **+0.1** burden each
- Junior Trader: **+0.2** burden each
- Senior Trader: **+0.4** burden each

### Institution burden
- Prop Desk: **+2** burden each
- Institutional Desk: **+4** burden each
- Hedge Fund: **+7** burden each
- Investment Firm: **+12** burden each

### Automation burden
- Quant Trader: **+0.5** burden each
- Rule-Based Bot: **+1** burden each
- ML Bot: **+2** burden each
- AI Bot: **+4** burden each

### Energy burden direction
- based on Power Capacity and/or Power Usage

These values are intentionally rough.

---

## 21. Suggested Burden Formula
A simple first-pass burden formula:

```ts
complianceBurden =
  staffBurden
  + institutionBurden
  + automationBurden
  + sectorBurden
  + energyBurden
```

This is straightforward and expandable.

---

## 22. Efficiency Penalty Formula
The original efficiency idea remains in force.

### Recommended first-pass formula
```ts
complianceEfficiencyMultiplier = Math.max(0.75, 1 - (complianceBurden * 0.005))
```

### Meaning
- each burden point reduces effective output by 0.5%
- the multiplier floors at 75% in the first implementation

This should be tuned later.

---

## 23. Compliance Cost Category Formulas
The recurring compliance bill should be broken into visible categories.

### Staff Compliance Cost
Example conceptual formula:

```ts
staffComplianceCost =
  internCount * 1
  + juniorTraderCount * 2
  + seniorTraderCount * 4
```

### Energy Compliance Cost
Example conceptual formula:

```ts
energyComplianceCost =
  powerCapacity * 0.2
  + powerUsage * 0.3
```

### Automation Compliance Cost
Example conceptual formula:

```ts
automationComplianceCost =
  quantTraderCount * 1
  + ruleBasedBotCount * 3
  + mlBotCount * 6
  + aiBotCount * 12
```

### Institutional Compliance Cost
Example conceptual formula:

```ts
institutionalComplianceCost =
  propDeskCount * 5
  + institutionalDeskCount * 10
  + hedgeFundCount * 20
  + investmentFirmCount * 40
```

### Total Compliance Cost
```ts
totalComplianceCost =
  staffComplianceCost
  + energyComplianceCost
  + automationComplianceCost
  + institutionalComplianceCost
```

All values are placeholders.

---

## 24. Review Timer Rule
The review timer should count down in the main tick loop.

### Approved flow
When `complianceReviewRemainingSeconds <= 0`:
1. calculate all compliance cost categories
2. sum total compliance cost
3. deduct from Cash
4. store `lastCompliancePayment`
5. reset timer to 60 seconds

This is the core review mechanic.

---

## 25. Visibility Trigger Rule
The system should begin hidden or negligible, then become visible.

### Recommended first-pass reveal rule
If `complianceBurden >= 5`:
- set `complianceVisible = true`
- expose Compliance tab / UI

This keeps onboarding cleaner.

---

## 26. New Helper Functions
Suggested helper functions:

```ts
getStaffComplianceBurden(state)
getInstitutionComplianceBurden(state)
getAutomationComplianceBurden(state)
getSectorComplianceBurden(state)
getEnergyComplianceBurden(state)
getComplianceBurden(state)
getComplianceEfficiencyMultiplier(state)

getStaffComplianceCost(state)
getEnergyComplianceCost(state)
getAutomationComplianceCost(state)
getInstitutionalComplianceCost(state)
getTotalComplianceCost(state)
```

These should be the core compliance selector layer.

---

## 27. Economy Integration Rules
### Human / institution sector production
```ts
sectorCashPerSecond =
  baseSectorProduction
  * sectorMultipliers
  * eventMultipliers
  * prestigeMultipliers
  * complianceEfficiencyMultiplier
```

### Automation cycle payout
```ts
cyclePayout =
  baseAutomationPayout
  * strategyAndMarketModifiers
  * machineEfficiencyMultiplier
  * eventModifiers
  * complianceEfficiencyMultiplier
```

This preserves the original cross-system friction idea.

---

## 28. New Selectors
Suggested selectors:

```ts
getComplianceBurden(state)
getComplianceEfficiencyMultiplier(state)
getTotalComplianceCost(state)
getComplianceReviewRemainingSeconds(state)
isComplianceVisible(state)
getTopComplianceSources(state)
```

Optional later:

```ts
getLobbyingComplianceRelief(state)
```

This can be added in Phase 8.

---

## 29. UI Requirements
### Top-level summary
A compact status can show:
- Compliance Efficiency
- Next Review timer

### Compliance tab
Must show:
- Compliance Burden
- Current Efficiency
- Next Compliance Review timer
- Next projected compliance bill
- Staff Compliance cost
- Energy Compliance cost
- Automation Compliance cost
- Institutional Compliance cost
- Last compliance payment
- top burden sources

This is now the required first implementation UI.

---

## 30. Lobbying Tab Notes
The Lobbying tab should later show:
- burden reduction from lobbying
- cost reductions by compliance category
- before/after comparisons

This does not need to be fully implemented in Phase 7, but the compliance system should be structured to support it.

---

## 31. Save / Load Requirements
The save model should now include:

```ts
complianceVisible
complianceReviewRemainingSeconds
lastCompliancePayment
```

### Migration defaults for older saves
```ts
complianceVisible = false
complianceReviewRemainingSeconds = 60
lastCompliancePayment = 0
```

This ensures compatibility.

---

# PART III — SYSTEM INTEGRATION NOTES

## 32. Interaction With Sectors
Compliance makes sectors more strategically distinct.

For example:
- Finance becomes more profitable but more regulated
- Energy can be tied more strongly to energy cost pressure
- Technology can be event-sensitive and automation-heavy

This improves sector identity.

---

## 33. Interaction With Human Specialization
Human specialists become more strategically interesting because the player must now weigh:
- specialist output gains
- sector attractiveness
- sector compliance burden

This makes specialist placement more meaningful.

---

## 34. Interaction With Institutional Mandates
Institution-heavy builds should be stronger but more burdened.

This creates a very good tension where:
- institutions are high-output
- institutions create higher compliance burden and institutional compliance costs

That is a desirable tradeoff.

---

## 35. Interaction With Automation
Automation-heavy builds should be efficient and powerful but should create both:
- automation compliance costs
- higher automation burden

This is especially important for ML and AI-heavy builds.

---

## 36. Interaction With Power
Power and compliance remain distinct.

### Approved split
- Power = technical/infrastructure constraint
- Compliance = regulatory/organizational constraint

Energy compliance cost bridges them conceptually without collapsing them into one system.

---

## 37. Phase 8 Hook
Phase 8 will likely add lobbying tools that reduce:
- compliance burden
- compliance efficiency loss
- staff compliance cost
- energy compliance cost
- automation compliance cost
- institutional compliance cost

This revised Phase 7 model now gives lobbying multiple clear mitigation roles.

---

## 38. Future Expansion Hooks
The following are intentionally parked for later:
- unpaid compliance extra penalties
- compliance sweep events
- audit queues
- reporting progress bars
- licensing restrictions
- sector bans / freeze orders

The first implementation should remain simpler.

---

# PART IV — IMPLEMENTATION ORDER AND TESTING

## 39. Recommended Implementation Order
### Step 1
Add compliance review timer state and save defaults.

### Step 2
Add burden and cost helper functions.

### Step 3
Add compliance visibility trigger logic.

### Step 4
Patch production formulas to include compliance efficiency multiplier.

### Step 5
Patch tick loop to process compliance review timer and recurring cost deduction.

### Step 6
Add Compliance tab UI and top-level summary.

### Step 7
Balance test burden values, recurring costs, and pacing.

---

## 40. Testing Checklist
Phase 7 should be considered successful if:
- compliance stays unobtrusive early
- compliance becomes visible at an understandable milestone
- recurring compliance costs deduct correctly on a timer
- the efficiency penalty is noticeable but not oppressive
- the Compliance tab clearly explains burden, costs, and sources
- players understand that lobbying will later help reduce both burden and cost

---

## 41. Final Summary
Phase 7 now combines two forms of external pressure.

### Final approved revised Phase 7 rule
**As the firm grows, compliance burden rises and applies ongoing efficiency loss, while recurring compliance reviews deduct visible scaling costs for staff, energy, automation, and institutions.**

This document should be treated as the new design and implementation planning source of truth for Phase 7.