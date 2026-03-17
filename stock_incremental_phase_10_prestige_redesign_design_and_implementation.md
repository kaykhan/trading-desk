# Stock Incremental Game — Phase 10 Design Document and Implementation Planning

## Scope
This document redefines **Phase 10** as the prestige redesign phase.

It combines:
1. **Design document**
2. **Implementation planning / specification sheet**
3. **UI / progression notes**

This phase replaces the earlier idea of Phase 10 being milestone expansion.

Phase 10 now formalizes:
- a **finite prestige system**
- a **maximum of 10 total prestiges**
- named prestige tiers
- Reputation as the prestige currency
- a revised prestige goal tree aligned with the current game
- reputation pacing across the 10 prestiges
- UI representation of prestige progress

Milestones are now deferred to a later Phase 11.

---

# PART I — DESIGN DOCUMENT

## 1. Phase 10 Goal
The goal of Phase 10 is to turn prestige into a clearly structured, finite meta-progression system.

Before this phase, prestige existed as a broad concept with good ideas but no fully finalized shape.

After this phase, prestige should feel:
- intentional
- finite
- highly readable
- meaningful at every reset
- balanced against the full game as it now exists

### Core design philosophy
Prestige is not endless.
Prestige is a **10-step legacy track**.

That is the most important design decision in this phase.

---

## 2. Why Prestige Should Be Finite
A finite prestige system is a better fit for this game because:
- the game now has many layered systems to support long-term depth already
- a fixed prestige count is easier to balance
- it makes each reset feel significant
- it gives the player a real sense of completion and mastery

### Approved rule
The player can prestige a maximum of **10 times**.

This is the intended structure.

---

## 3. Prestige Count and Reputation
The prestige system now has two layers.

### Prestige Count
How many times the player has prestiged.

This is capped at **10**.

### Reputation
The currency awarded from prestiging.

Reputation is spent on prestige goals.

### Approved summary
- prestige count tracks long-term progression milestones
- Reputation is the meta-progression spend currency

This is the intended model.

---

## 4. Prestige Tier Names
Each prestige level should now have a named tier.

### Approved 10 prestige tiers
1. **Iron**
2. **Bronze**
3. **Silver**
4. **Gold**
5. **Platinum**
6. **Titanium**
7. **Sapphire**
8. **Ruby**
9. **Diamond**
10. **Onyx**

These names should be used in the prestige UI.

### Example
- Prestige 1 — Iron
- Prestige 2 — Bronze
- Prestige 3 — Silver

This gives each reset a stronger identity than just a number.

---

## 5. Prestige Progress UI Philosophy
The prestige UI should clearly show two things:
- how many prestiges out of 10 have been completed
- what tier the player is currently on

### Approved visual direction
Show a **Prestige Track** with **10 circular prestige seals / badges**.

Each completed prestige fills one seal.

### Example
`● ● ● ○ ○ ○ ○ ○ ○ ○`

With labels such as:
- **Prestige 3 / 10**
- **Current Tier: Silver**

This is preferred over trophies and more readable than one large ring.

---

## 6. What Prestige Should Reset
Prestige should continue to reset the run-level economy while preserving meta progression.

### Typical reset scope
Prestige resets:
- Cash
- human units
- institutional units
- automation units
- most run-level progression state

### Typical persistence scope
Prestige preserves:
- prestige count
- earned/spent Reputation
- prestige goal ranks
- core meta entitlements / permanent systems as designed

The exact list should remain aligned with the current game architecture, but this is the conceptual model.

---

## 7. Prestige Tree Redesign
The prestige goal tree must now reflect the full game as it actually exists.

The earlier prestige goals were a good start, but the current game includes:
- sectors
- research
- automation
- power
- compliance
- lobbying
- boosts
- human and institution layers

So the prestige tree must be updated accordingly.

---

## 8. Approved Prestige Goals
There should now be **10 prestige goals**, each with **10 ranks**.

### Approved goal list
1. **Global Recognition**
2. **Seed Capital**
3. **Better Hiring Pipeline**
4. **Institutional Knowledge**
5. **Grid Orchestration**
6. **Compliance Frameworks**
7. **Policy Capital**
8. **Market Reputation**
9. **Desk Efficiency**
10. **Strategic Reserves**

This is the approved prestige tree structure.

---

## 9. Prestige Goal Roles
### 1. Global Recognition
Broad all-profit multiplier.

### 2. Seed Capital
Improves early-run cash start.

### 3. Better Hiring Pipeline
Reduces human staff costs.

### 4. Institutional Knowledge
Improves Research Point generation.

### 5. Grid Orchestration
Improves machine output and energy/power scaling.

### 6. Compliance Frameworks
Reduces compliance burden / compliance drag.

### 7. Policy Capital
Improves Influence gain or lobbying efficiency.

### 8. Market Reputation
Improves sector output / market-side performance.

### 9. Desk Efficiency
Improves human output directly.

### 10. Strategic Reserves
Improves boosts, such as cooldown reduction or duration scaling.

This gives the prestige tree alignment with all major systems in the game.

---

## 10. Approved Rank Structure
Each prestige goal should have:
- **10 total ranks**

This gives:
- clean symmetry
- a strong sense of completion
- enough room for gradual investment

### Important note
Not every rank should cost the same amount.
The cost should scale by rank.

---

## 11. Recommended Goal Effects
Suggested first-pass per-rank effects:

### Global Recognition
- **+5% all profits per rank**

### Seed Capital
- **Increase starting cash each run**

### Better Hiring Pipeline
- **-5% all human staff costs per rank**

### Institutional Knowledge
- **+10% Research Point production per rank**

### Grid Orchestration
- **+5% machine output and +5% energy/power capacity per rank**

### Compliance Frameworks
- **-5% compliance burden contribution or improved compliance efficiency handling per rank**

### Policy Capital
- **+5% Influence gain per rank**

### Market Reputation
- **+3% sector output per rank**

### Desk Efficiency
- **+4% human output per rank**

### Strategic Reserves
- **-3% timed boost cooldowns per rank**
or alternatively
- **+3% timed boost duration per rank**

This is the approved direction for first-pass balancing.

---

## 12. Reputation Cost Scaling by Rank
The cost of a prestige goal rank should scale upward across the 10 ranks.

### Recommended cost curve per goal
- ranks 1–3 cost **1** Reputation each
- ranks 4–6 cost **2** Reputation each
- ranks 7–8 cost **3** Reputation each
- ranks 9–10 cost **4** Reputation each

### Total cost per 10-rank goal
- 3 × 1 = 3
- 3 × 2 = 6
- 2 × 3 = 6
- 2 × 4 = 8

Total = **23 Reputation per goal**

### Total cost for all 10 goals
10 × 23 = **230 total Reputation**

This is a good overall target for balancing the full prestige arc.

---

## 13. Reputation Gain Across 10 Prestiges
Because prestige is capped at 10, total Reputation gain should scale upward across the 10 prestiges so the player can meaningfully complete the tree by the end.

### Recommended expected reputation gain curve
- Prestige 1: **4 Reputation**
- Prestige 2: **6 Reputation**
- Prestige 3: **9 Reputation**
- Prestige 4: **13 Reputation**
- Prestige 5: **17 Reputation**
- Prestige 6: **21 Reputation**
- Prestige 7: **26 Reputation**
- Prestige 8: **31 Reputation**
- Prestige 9: **37 Reputation**
- Prestige 10: **66 Reputation**

Total = **230 Reputation**

These values are a balancing target rather than a final hardcoded requirement, but the total target should be around this amount if the player is expected to finish or nearly finish the tree by Prestige 10.

---

## 14. Prestige Timing Philosophy
Prestige timing should feel meaningful and tied to game progression, not arbitrary.

### Prestige 1
Should happen only after the player has:
- reached sectors
- started research
- reached automation
- felt a real slowdown

### Mid prestiges
Should arrive faster as the prestige tree accelerates the player.

### Final prestiges
Should require stronger mastery of:
- institutions
- automation
- compliance
- lobbying
- higher-value system synergies

This creates a good arc.

---

## 15. Recommended Prestige Timing Targets
Suggested timing direction:

### Prestige 1
- around **60–90 minutes**

### Prestige 2
- around **45–70 minutes**

### Prestige 3
- around **45–60 minutes**

### Prestige 4–6
- around **35–55 minutes** depending on optimization

### Prestige 7–10
- increasingly deep mastery runs rather than just quick resets

These are intended pacing targets.

---

## 16. Prestige Plan / Reset Planning UI
The prestige screen should allow the player to see and plan their next reset.

### It should show
- current Prestige count and tier
- expected Reputation gained on next prestige
- available Reputation to spend
- goal ranks and next-rank cost
- optional “planned ranks” preview before confirming a reset if that interaction remains

This is important because prestige is now a more deliberate finite system.

---

## 17. Final Design Summary for Phase 10
### Final approved Phase 10 rule
**Prestige is a finite 10-step legacy track. Each prestige grants Reputation, each prestige tier has a named rank, and Reputation is spent across a 10-goal, 10-rank prestige tree aligned with the game’s major systems.**

This is now the intended prestige structure.

---

# PART II — IMPLEMENTATION PLANNING / SPECIFICATION SHEET

## 18. New Prestige Tier Definitions
Suggested types:

```ts
export type PrestigeTierId =
  | 'iron'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'titanium'
  | 'sapphire'
  | 'ruby'
  | 'diamond'
  | 'onyx';
```

Suggested mapping:

```ts
export const PRESTIGE_TIERS: PrestigeTierId[] = [
  'iron',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'titanium',
  'sapphire',
  'ruby',
  'diamond',
  'onyx',
];
```

---

## 19. Prestige Goal Type Definitions
Suggested goal type:

```ts
export type PrestigeGoalId =
  | 'globalRecognition'
  | 'seedCapital'
  | 'betterHiringPipeline'
  | 'institutionalKnowledge'
  | 'gridOrchestration'
  | 'complianceFrameworks'
  | 'policyCapital'
  | 'marketReputation'
  | 'deskEfficiency'
  | 'strategicReserves';
```

Suggested definition shape:

```ts
type PrestigeGoalDefinition = {
  id: PrestigeGoalId;
  name: string;
  maxRank: number;
  description: string;
};
```

---

## 20. Prestige Goal Definitions
Suggested first-pass data:

```ts
export const PRESTIGE_GOALS: Record<PrestigeGoalId, PrestigeGoalDefinition> = {
  globalRecognition: {
    id: 'globalRecognition',
    name: 'Global Recognition',
    maxRank: 10,
    description: 'Increase all profits.',
  },
  seedCapital: {
    id: 'seedCapital',
    name: 'Seed Capital',
    maxRank: 10,
    description: 'Start each run with more cash.',
  },
  betterHiringPipeline: {
    id: 'betterHiringPipeline',
    name: 'Better Hiring Pipeline',
    maxRank: 10,
    description: 'Reduce all human staff costs.',
  },
  institutionalKnowledge: {
    id: 'institutionalKnowledge',
    name: 'Institutional Knowledge',
    maxRank: 10,
    description: 'Increase Research Point production.',
  },
  gridOrchestration: {
    id: 'gridOrchestration',
    name: 'Grid Orchestration',
    maxRank: 10,
    description: 'Increase machine output and power capacity.',
  },
  complianceFrameworks: {
    id: 'complianceFrameworks',
    name: 'Compliance Frameworks',
    maxRank: 10,
    description: 'Reduce compliance burden and drag.',
  },
  policyCapital: {
    id: 'policyCapital',
    name: 'Policy Capital',
    maxRank: 10,
    description: 'Increase Influence gain.',
  },
  marketReputation: {
    id: 'marketReputation',
    name: 'Market Reputation',
    maxRank: 10,
    description: 'Increase sector output.',
  },
  deskEfficiency: {
    id: 'deskEfficiency',
    name: 'Desk Efficiency',
    maxRank: 10,
    description: 'Increase human output.',
  },
  strategicReserves: {
    id: 'strategicReserves',
    name: 'Strategic Reserves',
    maxRank: 10,
    description: 'Improve timed boost performance.',
  },
};
```

---

## 21. GameState Additions / Clarifications
Suggested prestige-related state:

```ts
prestigeCount: number;
reputation: number;
spentReputation: number;
prestigeGoalRanks: Record<PrestigeGoalId, number>;
```

Optional UI/planning state:

```ts
plannedPrestigeGoalRanks?: Record<PrestigeGoalId, number>;
```

### Important rule
`prestigeCount` must not exceed 10.

---

## 22. Reputation Gain Calculation
Suggested helper:

```ts
getReputationGainForNextPrestige(state)
```

This should calculate the Reputation awarded if the player resets now.

### First-pass simplification
This can initially be based on prestige count milestone targets / fixed curve rather than a more complicated score formula.

---

## 23. Prestige Goal Rank Cost Helper
Suggested helper:

```ts
getPrestigeGoalNextRankCost(goalId, currentRank)
```

Recommended first-pass implementation:

```ts
if (currentRank <= 2) return 1;
if (currentRank <= 5) return 2;
if (currentRank <= 7) return 3;
return 4;
```

This assumes zero-based `currentRank` input.

---

## 24. Prestige Goal Effect Helpers
Suggested helpers:

```ts
getGlobalRecognitionMultiplier(state)
getSeedCapitalValue(state)
getHiringCostMultiplier(state)
getInstitutionalKnowledgeMultiplier(state)
getGridOrchestrationMultipliers(state)
getComplianceFrameworksRelief(state)
getPolicyCapitalMultiplier(state)
getMarketReputationMultiplier(state)
getDeskEfficiencyMultiplier(state)
getStrategicReservesModifiers(state)
```

These should be used by existing economy, compliance, boosts, and power selectors.

---

## 25. Prestige Action Rules
Suggested actions:

```ts
performPrestigeReset()
spendReputationOnPrestigeGoal(goalId)
setPlannedPrestigeGoalRank(goalId, rank)
clearPrestigePlan()
```

### performPrestigeReset()
Should:
- verify prestigeCount < 10
- calculate reputation gain
- reset run-level state
- increment prestigeCount
- add earned reputation

### spendReputationOnPrestigeGoal(goalId)
Should:
- verify sufficient free reputation
- verify rank < max rank
- spend reputation
- increment goal rank

---

## 26. Prestige Track UI Requirements
The prestige UI should now include a Prestige Track showing:
- 10 prestige seals / badges
- completed prestige marks filled in
- current tier label
- prestige count display

### Example
- `● ● ● ○ ○ ○ ○ ○ ○ ○`
- **Prestige 3 / 10**
- **Current Tier: Silver**

This is the approved visual model.

---

## 27. Prestige Screen Requirements
The prestige screen should show:
- Prestige Track
- current tier
- next tier name if relevant
- current Reputation
- free Reputation
- expected Reputation on next reset
- prestige goal list with rank / 10
- next-rank cost
- effect per rank

This is now the minimum intended prestige screen.

---

## 28. Save / Load Requirements
The save model must include:

```ts
prestigeCount
reputation
spentReputation
prestigeGoalRanks
```

Optional planning state can also be saved if desired, but it is not required.

### Migration defaults
```ts
prestigeCount = 0
reputation = 0
spentReputation = 0
prestigeGoalRanks = {
  globalRecognition: 0,
  seedCapital: 0,
  betterHiringPipeline: 0,
  institutionalKnowledge: 0,
  gridOrchestration: 0,
  complianceFrameworks: 0,
  policyCapital: 0,
  marketReputation: 0,
  deskEfficiency: 0,
  strategicReserves: 0,
}
```

This ensures compatibility.

---

# PART III — UI / PROGRESSION NOTES

## 29. Relationship to the Rest of the Game
This prestige redesign now aligns the meta layer with the actual game systems.

### It now supports
- economy
- humans
- institutions
- research
- automation
- power
- compliance
- lobbying
- sectors
- boosts

This is why this redesign is important before milestone expansion.

---

## 30. Relationship to Phase 11 Milestones
Milestones are now deferred.

This is the right decision because milestones should reflect the final prestige structure rather than being designed first and then patched later.

Phase 11 should therefore build on this prestige model.

---

## 31. Future Expansion Hooks
The following can be added later if desired, but are not required for the first implementation:
- tier-specific prestige visuals
- prestige completion celebration per tier
- prestige history / run summaries
- special reward for Prestige 10 (Onyx completion)
- post-10 cosmetic-only continuation if ever desired

These are optional future hooks only.

---

# PART IV — IMPLEMENTATION ORDER AND TESTING

## 32. Recommended Implementation Order
### Step 1
Replace or formalize prestige count cap at 10.

### Step 2
Add prestige tier names and prestige track UI model.

### Step 3
Replace prestige goal list with the approved 10-goal structure.

### Step 4
Implement rank cost scaling.

### Step 5
Implement reputation gain curve and reset logic.

### Step 6
Patch economy/research/automation/compliance/lobbying/boost selectors to read prestige goal effects.

### Step 7
Build final prestige screen UI with tier track, reputation, and goal list.

### Step 8
Balance test prestige pacing from 1 to 10.

---

## 33. Testing Checklist
Phase 10 should be considered successful if:
- prestige cannot exceed 10 total resets
- each prestige clearly advances the track and tier name
- reputation gain feels rewarding across all 10 prestiges
- prestige goals feel aligned with the current game systems
- the player can understand what each goal does and what it costs
- Prestige 1 arrives at the intended slowdown point
- the full prestige arc feels completable and well-paced

---

## 34. Final Summary
Phase 10 redesigns prestige into a finite, named, structured legacy system.

### Final approved Phase 10 rule
**Prestige is a finite 10-tier system with named legacy ranks, increasing Reputation rewards, and a 10-goal prestige tree that supports the game’s major systems and is intended to be completed by Prestige 10.**

This document should be treated as the design and implementation planning source of truth for Phase 10.

