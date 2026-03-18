# Stock Incremental Game — Headless Simulation Design Document

## Purpose
This document defines a comprehensive design for a **headless game state simulator** for the stock incremental game.

The simulator is intended to test:
- progression pacing
- economy balance
- unlock timing
- upgrade and optimisation value
- prestige pacing
- compliance pressure
- event impact
- lobbying usefulness
- automation strategy value

The simulator should run **much faster than real time** and must not require manual play or visual rendering.

---

# 1. Core Goal
The goal of the simulator is to let us “play” the game automatically without using the actual UI.

Instead of rendering visuals and waiting in real time, the simulator will:
- hold game state in memory
- update resources and timers numerically
- make automated decisions using scripted player policies
- record metrics from the simulated run

### Core design philosophy
Simulate the **economy and decisions**, not the visuals.

That is the most important rule.

---

# 2. Why the Simulator Exists
The game now has many interacting systems:
- manual trading
- human staff
- sectors
- office capacity
- research
- human specialization
- institutional mandates
- automation cycles
- market events
- compliance reviews
- lobbying relief
- boosts
- prestige
- optimisations

At this scale, manual testing alone becomes too slow and too inconsistent.

The simulator exists to answer questions like:
- When should Prestige 1 happen?
- Is automation too strong relative to institutions?
- Is compliance too punishing?
- Are some upgrades never worth buying?
- Are events too weak or too disruptive?
- Does the prestige curve actually complete by Prestige 10?

---

# 3. Non-Goals
The simulator is **not** intended to test:
- visual polish
- UI clarity
- animation feel
- player emotional satisfaction from progress bars, ticks, or sounds
- readability of menus or labels

Those still require real playtesting.

The simulator is specifically for:
- system balance
- pacing
- progression flow
- decision logic outcomes

---

# 4. What “Headless” Means
A headless simulator means:
- no rendering
- no DOM/UI
- no animations
- no real-time waiting
- no frame-by-frame graphics loop

It should only process:
- numbers
- timers
- state transitions
- decisions

This is what allows it to run much faster than real time.

---

# 5. Speed Requirement
The simulator should run **faster than real time**.

A full player run that might take:
- 60–90 minutes in the live game

should ideally simulate in:
- seconds
- or less

This is a hard design requirement.

### Key rule
The simulator must **never** be built as a visual replay of the game.

It should be a pure logic engine.

---

# 6. Simulation Modes
The simulator should support two execution styles.

## A. Fixed-step simulation
Advance time in fixed increments, such as:
- 1 second
- 5 seconds

### Pros
- easier to implement first
- easier to debug
- maps naturally to existing timer systems

### Cons
- less efficient than event-driven simulation

### Recommendation
Use this for the first version.

---

## B. Event-driven simulation
Advance time directly to the next meaningful event, such as:
- next automation cycle completion
- next compliance review
- next market event expiry
- next boost cooldown completion
- next affordable purchase point

### Pros
- much faster
- ideal for large-scale batch testing

### Cons
- more complex to build
- requires stronger event scheduling logic

### Recommendation
Plan for this architecture even if the first implementation starts fixed-step.

---

# 7. Recommended Build Strategy
### Phase 1 of simulator
Build a **fixed-step, 1-second simulation** first.

This is simple, accurate enough, and already very fast compared with real time.

### Phase 2 of simulator
Refactor or extend toward **event-driven jumps** once the game formulas stabilize.

This gives a good development path:
- get correctness first
- optimize speed second

---

# 8. Core Simulator Architecture
The simulator should have 4 main components:

## 1. Game State Model
A full numerical representation of the game.

## 2. Tick / Time Processor
Updates state over time.

## 3. Decision Policy Engine
Chooses what the simulated player does.

## 4. Logging / Metrics Layer
Records progression and outcomes.

These four parts should be kept separate.

---

# 9. Game State Model
The simulator should use a state structure that mirrors the real game as closely as possible.

### Suggested top-level state groups
- time
- currencies
- ownership of units
- upgrades
- research
- sectors
- assignments
- automation configuration
- automation cycle runtime
- events
- compliance
- lobbying
- boosts
- prestige
- optimisations
- milestone tracking later

### Example shape
```ts
type SimState = {
  timeSeconds: number;

  cash: number;
  researchPoints: number;
  influence: number;
  reputation: number;

  prestigeCount: number;

  units: Record<string, number>;
  upgradesPurchased: Record<string, boolean>;
  researchPurchased: Record<string, boolean>;
  prestigeGoalRanks: Record<string, number>;
  optimisationRanks: Record<string, number>;

  unlockedSectors: Record<string, boolean>;
  sectorAssignments: Record<string, unknown>;

  automationUnits: Record<string, number>;
  automationConfig: Record<string, unknown>;
  automationCycleState: Record<string, unknown>;

  activeMarketEvent: string | null;
  activeMarketEventRemainingSeconds: number;

  complianceVisible: boolean;
  complianceReviewRemainingSeconds: number;
  lastCompliancePayment: number;

  timedBoosts: Record<string, unknown>;
  globalBoostsOwned: Record<string, boolean>;

  metaFlags: Record<string, boolean>;
};
```

This does not have to be identical to the runtime game state, but it should be very close.

---

# 10. Reuse of Real Game Logic
### Strong requirement
The simulator should reuse the **same formulas and constants** as the live game wherever possible.

This is critical.

### Why
If the simulator uses separate fake math, then:
- tuning becomes unreliable
- balance conclusions become weaker
- simulator and live game drift apart

### Recommended architecture
Share modules such as:
- constants data
- production formulas
- upgrade effects
- prestige effects
- compliance formulas
- automation payout formulas
- event modifiers
- optimisation effects

The simulator should call those same shared functions without rendering the UI.

---

# 11. Tick / Time Processor
The simulator needs a core time-processing function.

### Example concept
```ts
function tick(state: SimState, deltaSeconds: number): SimState
```

This function should:
- add passive human/institution income
- process research generation
- process influence generation
- advance automation cycles
- apply automation payouts
- decrement boost timers and cooldowns
- decrement market event timers
- process compliance review timer
- trigger compliance payments when due
- process unlock checks
- update derived visibility flags

This is the heart of the simulator.

---

# 12. Order of Operations in a Tick
A consistent order matters.

### Recommended order
1. advance time
2. update active timers
3. process expiring or completing systems:
   - automation cycles
   - boosts
   - events
   - compliance reviews
4. apply resource generation for the elapsed time
5. refresh derived state and unlock visibility
6. allow the bot-player to choose actions

The exact order can be tuned, but it should stay consistent.

---

# 13. Action System
The simulator should support a structured action model.

### Suggested action examples
- buy unit
- buy upgrade
- buy research tech
- assign to sector
- train specialist
- apply mandate
- buy automation unit
- set automation market target
- set automation strategy
- activate timed boost
- pay compliance category or full review
- buy optimisation
- buy lobbying policy
- prestige reset

### Example type
```ts
type SimAction =
  | { type: 'buyUnit'; unitId: string; quantity: number }
  | { type: 'buyUpgrade'; upgradeId: string }
  | { type: 'buyResearch'; researchId: string }
  | { type: 'activateBoost'; boostId: string }
  | { type: 'performPrestige' }
  | { type: 'buyOptimisation'; optimisationId: string };
```

Each action should have a matching application function.

---

# 14. Bot-Player / Decision Policy Engine
The simulator is only useful if it can make decisions like a player.

This should be handled by a **policy engine**.

### Core concept
```ts
function chooseAction(state: SimState): SimAction | null
```

The policy engine should inspect the game state and decide what to do next.

---

# 15. Types of Simulated Players
The simulator should support multiple play styles.

## 1. Greedy ROI Bot
Always buys the thing with the best short-term return.

### Purpose
Finds exploits and overpowered purchase paths.

---

## 2. Conservative Growth Bot
Prefers:
- stable growth
- low-risk purchases
- more orderly pacing
- safer compliance behavior

### Purpose
Approximates more typical players.

---

## 3. Research Rush Bot
Prioritizes:
- RP generation
- research unlocks
- automation branch speed

### Purpose
Tests research pacing and automation dominance.

---

## 4. Institution-Focused Bot
Prioritizes:
- organization tiers
- mandates
- sector alignment

### Purpose
Tests institution viability.

---

## 5. Automation-Focused Bot
Prioritizes:
- automation research
- bots
- strategy configuration
- infrastructure support

### Purpose
Tests machine-heavy builds.

---

## 6. Neglect Bots
Intentionally ignore part of the game.

Examples:
- no lobbying
- no boosts
- no automation
- no sectors
- no compliance management

### Purpose
Find systems that are too mandatory, too weak, or too punishing.

---

# 16. Decision Heuristics
The bot-player does not need human-like intelligence.
It just needs a decision model that is consistent and testable.

### Good heuristics include
- ROI priority
- threshold-based unlock chasing
- save-until-affordable logic
- prestige threshold logic
- event-aware retargeting
- compliance payment priority
- timed boost usage rules

### Example
A bot might:
- buy the best ROI purchase under current cash
- prioritize research if a key unlock is close
- activate boosts only during good market events
- prestige when projected Reputation gain exceeds a threshold or when time-to-next-gain becomes inefficient

These heuristics are enough for very useful tests.

---

# 17. Prestige Simulation Requirements
Prestige is one of the most important systems to simulate.

The simulator should support different prestige policies.

### Example prestige policies
- prestige as soon as next reset gives at least X reputation
- prestige only after automation is active
- prestige after a specific run time threshold
- prestige when marginal gain slows too much
- prestige only after compliance becomes visible

### Metrics to compare
- time to Prestige 1
- time to Prestige 2–10
- total run efficiency
- total reputation earned
- how complete the prestige tree is by Prestige 10

This is critical to validating the prestige arc.

---

# 18. Compliance Simulation Requirements
The simulator should model compliance very explicitly.

### It must test
- recurring compliance review timing
- category payment costs
- compliance burden scaling
- efficiency loss
- lobbying relief
- behavior when the bot pays compliance aggressively vs lazily

### Example policies
- always pay compliance immediately
- pay only when due
- prioritize certain categories first
- delay payment if cash is better spent elsewhere

This will help determine whether compliance is too weak or too punishing.

---

# 19. Automation Simulation Requirements
Automation is now mechanically distinct from human production, so the simulator must model it carefully.

### It must support
- automation unit ownership
- market target selection
- strategy selection
- cycle timers
- payout bursts
- power modifiers
- event modifiers
- boost interactions

### Important note
The simulator should treat automation as cycle-based, not passive flat income.

That is required for realistic balancing.

---

# 20. Event Simulation Requirements
The simulator must support random market events.

### It should model
- event selection
- event duration
- sector events
- systemic events
- event effects on sectors, automation, and compliance later

### Testing use
Compare:
- event-aware bots
- event-ignorant bots

This will reveal whether events are meaningful but fair.

---

# 21. Boost Simulation Requirements
The simulator must support:
- timed boost activation
- duration
- cooldown
- auto-activation later
- global boosts

### Test policies
- never use boosts
- always use boosts on cooldown
- only use boosts during favorable events
- save boosts for compliance windows

This will show whether boosts are balanced and whether tactical timing matters.

---

# 22. Logging / Metrics Layer
The simulator should log more than just final currencies.

### Important metrics
- time to first Intern
- time to first Junior Trader
- time to first Senior Trader
- time to first sector unlock
- time to first scientist
- time to automation unlocks
- time to first compliance reveal
- time to first lobbying policy
- time to first prestige
- times to Prestiges 2–10
- total units purchased by type
- total upgrades purchased
- total research nodes purchased
- total optimisations purchased
- average compliance burden
- average event exposure
- average automation share of income
- human share of income
- institution share of income
- machine share of income

These metrics should be stored per run.

---

# 23. Milestone Logging
The simulator should log all major progression milestones during a run.

### Example
```ts
type RunMilestoneLog = {
  firstInternAt?: number;
  firstJuniorTraderAt?: number;
  firstSectorUnlockedAt?: number;
  firstAutomationAt?: number;
  complianceVisibleAt?: number;
  firstPrestigeAt?: number;
};
```

This is extremely valuable for balancing progression pacing.

---

# 24. Batch Simulation / Monte Carlo Testing
Because the game has randomness and different possible strategies, one run is not enough.

### Recommended approach
Run many simulations for each policy.

### Example
- 100 runs per strategy
- 5 strategy types
- compare averages, medians, and outliers

This provides much stronger balancing evidence.

---

# 25. Randomness Handling
The simulator should support seeded randomness.

### Why
This allows:
- reproducible runs
- debugging specific bad or weird runs
- fair comparison between strategy policies using the same event sequence

### Requirement
Use a seeded RNG rather than uncontrolled randomness.

---

# 26. Fixed-Step vs Event-Driven Detail
## First implementation recommendation
Use **1-second fixed steps**.

This is easier and already much faster than real time.

### Why 1 second is acceptable
The game’s economy is built around:
- per-second income
- cycle timers
- review timers
- event timers

So 1-second resolution is usually good enough for first-pass balance testing.

## Later optimization
Move toward event-driven jumps when needed for mass simulation.

---

# 27. Discrete Event Opportunities
The simulator can later jump directly to the next meaningful event, such as:
- next affordable purchase
- next automation payout
- next compliance review
- next event expiry
- next boost cooldown completion
- next prestige condition trigger

This will make large simulation sweeps extremely fast.

---

# 28. Validation Strategy
The simulator should be validated against the live game.

### Recommended validation checks
- compare one real playthrough’s early progression against the simulator using the same decisions
- confirm automation payouts match runtime formulas
- confirm compliance review timing matches
- confirm prestige reward calculations match
- confirm upgrade and optimisation effects match

This is important so the simulator remains trustworthy.

---

# 29. Separation of Concerns
The simulator should be organized into modules.

### Suggested modules
- `simState.ts`
- `simTick.ts`
- `simActions.ts`
- `simPolicies.ts`
- `simMetrics.ts`
- `simRunner.ts`
- shared live-game formula modules

This makes the system easier to maintain.

---

# 30. Example Runner Loop
A simplified simulation runner might look like this:

```ts
state = createInitialState(seed);

while (state.timeSeconds < maxRunTime && state.prestigeCount < 10) {
  state = tick(state, 1);

  const action = chooseAction(state, policy);
  if (action) {
    state = applyAction(state, action);
  }

  recordMilestones(state, metrics);
}
```

This is enough for a first-pass simulator.

---

# 31. Performance Expectations
A correct headless simulator should **not** take real hours.

### Design requirement
A run that takes 60–90 real minutes should simulate in seconds or less.

This is possible because the simulator:
- does not render UI
- does not animate
- does not wait for real time
- processes only logic

This should be explicitly preserved during implementation.

---

# 32. Primary Outputs of the Simulator
At the end of simulation sweeps, the simulator should help answer questions like:
- Is Prestige 1 landing around the intended time?
- Are later prestiges pacing correctly?
- Which build archetypes dominate?
- Are compliance and lobbying meaningful but fair?
- Do boosts matter without becoming mandatory?
- Are optimisations useful but not overpowering?
- Are some upgrades or research nodes dead content?

These are the practical outputs we care about.

---

# 33. Future Expansion Hooks
The simulator should later be able to support:
- milestone system validation
- more complex prestige heuristics
- event-driven simulation
- multi-policy comparison dashboards
- CSV/JSON export of results
- parameter sweeps for balance tuning

These do not need to be in version 1.

---

# 34. Final Summary
The headless simulation system is a balance-testing and progression-validation tool.

### Final approved rule
The simulator should model the live game’s state, timers, formulas, and player decisions without rendering UI, run much faster than real time, support multiple automated play styles, and record progression/balance metrics across repeated runs.

This document should be treated as the design source of truth for building the game simulation framework.