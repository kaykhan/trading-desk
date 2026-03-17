# Stock Incremental Game — Phase 6 Design Document and Implementation Planning

## Scope
This document covers **Phase 6 — Random Market Events / Cycles**.

It combines:
1. **Design document**
2. **Implementation planning / specification sheet**
3. **System integration notes**

Phase 6 introduces temporary market conditions that make the economy dynamic rather than permanently solved.

This phase defines:
- market event categories
- sector-specific event effects
- systemic event effects
- event timing and scheduling
- event UI requirements
- how events interact with sectors, specializations, mandates, automation strategies, and power

It also notes future opportunities for more visible timed mechanics, while keeping the first implementation readable and controlled.

---

# PART I — DESIGN DOCUMENT

## 1. Phase 6 Goal
The goal of Phase 6 is to make the market feel alive.

Before this phase, the player can eventually arrive at a stable setup that is always optimal unless they manually change it.

After this phase, temporary market conditions should create reasons to:
- re-evaluate sector focus
- value certain specialist setups more highly
- value certain mandates more highly
- favor different automation target/strategy combinations
- respond to short-term windows of opportunity or pressure

### Core design philosophy
Events should create **interesting temporary shifts**, not random chaos.

---

## 2. What Market Events Should Feel Like
Events should feel like:
- a changing market backdrop
- a reason to react
- a source of tactical opportunity
- a source of mild pressure

They should **not** feel like:
- arbitrary punishment
- constant disruption
- impossible-to-plan randomness

### Intended player feeling
- “Technology is hot right now, I should lean into that.”
- “Energy is weak for the moment; maybe I shift some human attention elsewhere.”
- “This event makes my current bot setup especially valuable.”

---

## 3. Event Types
Phase 6 should support two broad classes of events.

### Sector-specific events
These affect one market sector more strongly than others.

Examples:
- **Tech Rally**
- **Energy Boom**
- **Financial Tightening**
- **Healthcare Breakthrough** later
- **Commodity Glut** later

### Systemic events
These affect the broader game economy or multiple systems at once.

Examples:
- **Volatility Spike**
- **Liquidity Crunch**
- **Interest Rate Shock**
- **Grid Stress Warning**
- **Compliance Sweep** later

This split should be preserved in the implementation.

---

## 4. Initial Event Set
The first implementation should use a small set of readable events.

### Recommended initial sector events
- **Tech Rally**
- **Energy Boom**
- **Financial Tightening**

### Recommended initial systemic events
- **Volatility Spike**
- **Liquidity Crunch**
- **Grid Stress Warning**

This is enough to prove the system without flooding the game with content.

---

## 5. Event Design Rules
### Rule 1 — Events should be temporary
Events should last a limited time and then expire.

### Rule 2 — Events should be visible
The player must be able to clearly see what is active and what it does.

### Rule 3 — Events should be understandable
The first implementation should use simple modifiers.

### Rule 4 — Events should reward adaptation
The player should gain value from responding intelligently.

### Rule 5 — Events should not invalidate whole builds
Events can favor some setups and weaken others, but should not make a build feel useless.

---

## 6. Sector Event Effects
Sector events should primarily affect sector output multipliers.

### Example
#### Tech Rally
- Technology sector output increases temporarily

#### Energy Boom
- Energy sector output increases temporarily

#### Financial Tightening
- Finance sector output decreases temporarily

This is the cleanest first implementation.

---

## 7. Systemic Event Effects
Systemic events should affect broader mechanics.

### Example
#### Volatility Spike
- increases payout potential for certain automation strategies later
- can initially act as a broad small bonus to automation output or specific strategies

#### Liquidity Crunch
- reduces broad market efficiency slightly
- can reduce certain sector or institutional outputs

#### Grid Stress Warning
- worsens machine-side conditions, such as reducing effective machine performance or increasing the significance of Power constraints

These events are especially useful because they connect to later compliance/lobbying and automation layers.

---

## 8. Interaction With Existing Systems
Phase 6 should not be isolated. It should make the already-built systems more meaningful.

### Sectors
Events should affect sector attractiveness directly.

### Human specialization
Matching specialists become more valuable when their target sector is in a favorable event window.

### Institutional mandates
Mandated institutions gain more value when their sector is favored.

### Automation
Market-targeted automation should care about sector event conditions.

### Power
Systemic machine-side events like Grid Stress Warning should reinforce the Power system.

This is what turns events from simple modifiers into meaningful gameplay.

---

## 9. Event Timing Philosophy
Events should appear often enough to matter but not so often that the market feels random every few seconds.

### Recommended first-pass behavior
- one active event at a time
- event lasts for a moderate duration
- some downtime between events or direct chaining depending on feel

### Suggested first-pass timing
- event duration: **60–120 seconds**
- event refresh / reroll logic can begin simple and later become more elaborate

This is a good first balance range.

---

## 10. Event UI Philosophy
The UI should make events feel like market conditions the player is watching.

### Must show
- event name
- remaining time
- event effect summary

### Should show
- event category (sector or systemic)
- affected market or system
- a short descriptive phrase

This should be visible without requiring the player to dig into a sub-menu.

---

## 11. Where Event UI Should Appear
The first implementation should show active events in a highly visible place.

### Recommended location
A top-of-screen banner, strip, or status card.

Optional supporting views:
- event tooltip
- event log in a future stats/history area

The player should always know the current event state.

---

## 12. Future Visible Process Opportunities
You asked to park certain visible/timed mechanics for now, but they should be acknowledged in future phases.

Market events are a natural place to later include:
- visible countdown timers
- timed reaction windows
- event-linked boosts
- stronger active-play opportunities

Phase 6 first pass should remain simple, but the design should leave room for these later expansions.

---

## 13. Final Design Summary for Phase 6
### Final approved Phase 6 rule
**Temporary market events and cycles create changing sector and system conditions that reward adaptation without overwhelming the player.**

This is the intended role of the event system.

---

# PART II — IMPLEMENTATION PLANNING / SPECIFICATION SHEET

## 14. Event Type Definitions
Suggested type definitions:

```ts
export type MarketEventId =
  | 'techRally'
  | 'energyBoom'
  | 'financialTightening'
  | 'volatilitySpike'
  | 'liquidityCrunch'
  | 'gridStressWarning';

export type MarketEventCategory = 'sector' | 'systemic';
```

---

## 15. Event Definition Model
Suggested event definition shape:

```ts
type MarketEventDefinition = {
  id: MarketEventId;
  name: string;
  category: MarketEventCategory;
  durationSeconds: number;
  description: string;
  affectedSector?: SectorId;
  sectorOutputMultiplier?: number;
  automationOutputMultiplier?: number;
  machineEfficiencyMultiplier?: number;
  globalOutputMultiplier?: number;
};
```

This is intentionally simple and can be extended later.

---

## 16. Initial Event Definitions
Suggested first-pass data:

```ts
export const MARKET_EVENTS: Record<MarketEventId, MarketEventDefinition> = {
  techRally: {
    id: 'techRally',
    name: 'Tech Rally',
    category: 'sector',
    durationSeconds: 90,
    description: 'Technology markets are surging.',
    affectedSector: 'technology',
    sectorOutputMultiplier: 1.2,
  },
  energyBoom: {
    id: 'energyBoom',
    name: 'Energy Boom',
    category: 'sector',
    durationSeconds: 90,
    description: 'Energy markets are outperforming.',
    affectedSector: 'energy',
    sectorOutputMultiplier: 1.2,
  },
  financialTightening: {
    id: 'financialTightening',
    name: 'Financial Tightening',
    category: 'sector',
    durationSeconds: 90,
    description: 'Finance activity is under pressure.',
    affectedSector: 'finance',
    sectorOutputMultiplier: 0.85,
  },
  volatilitySpike: {
    id: 'volatilitySpike',
    name: 'Volatility Spike',
    category: 'systemic',
    durationSeconds: 75,
    description: 'Market volatility is elevated.',
    automationOutputMultiplier: 1.1,
  },
  liquidityCrunch: {
    id: 'liquidityCrunch',
    name: 'Liquidity Crunch',
    category: 'systemic',
    durationSeconds: 75,
    description: 'Liquidity is tightening across the market.',
    globalOutputMultiplier: 0.92,
  },
  gridStressWarning: {
    id: 'gridStressWarning',
    name: 'Grid Stress Warning',
    category: 'systemic',
    durationSeconds: 60,
    description: 'Power infrastructure is under strain.',
    machineEfficiencyMultiplier: 0.9,
  },
};
```

These are placeholders and should be tuned later.

---

## 17. GameState Additions
The game state must track the active event and remaining time.

Suggested additions:

```ts
activeMarketEvent: MarketEventId | null;
activeMarketEventRemainingSeconds: number;
```

Optional future addition:

```ts
marketEventHistory: MarketEventId[];
```

This is not required in the first implementation.

---

## 18. Event Scheduling Rule
The first implementation should use a simple event scheduler.

### Recommended rule
- if no event is active, roll/select the next event
- start its timer
- decrement timer each tick
- when timer reaches zero, clear it and select the next event

### Important first-pass simplification
Use a simple random selection from the event pool, optionally excluding immediate repeats.

No complex weighted market simulation is needed yet.

---

## 19. Tick Integration
The main tick loop should now also update event timing.

### Event processing flow
On each tick:
1. reduce remaining active event time
2. if event expires, clear it and start another event
3. all production calculations read current active event modifiers

This should happen before or alongside production calculation for clarity.

---

## 20. Event Modifier Integration
Suggested helper functions:

```ts
getActiveMarketEvent(state)
getSectorEventMultiplier(state, sectorId)
getGlobalEventMultiplier(state)
getAutomationEventMultiplier(state)
getMachineEfficiencyEventModifier(state)
```

### Important integration rule
Event effects should be applied through selectors/helper functions, not hard-coded directly into many formulas.

That will keep the system maintainable.

---

## 21. Sector Integration
Sector output should now include an event multiplier layer.

### Updated sector output concept
```ts
sectorCashPerSecond =
  baseSectorProduction
  * sectorBaseMultiplier
  * sectorEventMultiplier
  * globalMultipliers
  * prestigeMultipliers
```

This is the main integration point for human specialists and institutional mandates too, because they already feed sector production.

---

## 22. Automation Integration
Automation cycle payout should now include event effects as well.

### Updated automation payout concept
```ts
cyclePayout =
  ownedCount
  * basePayout
  * marketTargetMultiplier
  * strategyMultiplier
  * automationEventMultiplier
  * machineEfficiencyMultiplier
  * machineEfficiencyEventModifier
```

This makes events relevant to machine systems too.

---

## 23. Power Integration
The `gridStressWarning` event should interact with the machine side cleanly.

### Approved first-pass behavior
It should reduce effective machine-side output indirectly by reducing machine efficiency through an event multiplier.

This is cleaner than introducing new temporary Power consumption numbers immediately.

---

## 24. New Selectors
Suggested selectors:

```ts
getActiveMarketEvent(state)
isMarketEventActive(state)
getMarketEventRemainingSeconds(state)
getSectorEventMultiplier(state, sectorId)
getAutomationEventMultiplier(state)
getGlobalEventMultiplier(state)
getMachineEfficiencyEventModifier(state)
```

These selectors should drive both gameplay formulas and UI.

---

## 25. New Actions / Tick Helpers
Suggested actions/helpers:

```ts
startRandomMarketEvent(state)
clearMarketEvent(state)
processMarketEventTimer(state, deltaSeconds)
```

Depending on architecture, these can live in the tick reducer instead of as publicly exposed actions.

---

## 26. UI Requirements
The first implementation should include a visible event display.

### Required event UI contents
- event name
- event description
- remaining time
- visually distinct category / warning style if helpful

### Recommended display location
Top banner or status strip above major management panels.

This is the preferred first implementation.

---

## 27. Optional Event Log (Deferred)
A rolling event log can be useful later, but it is not required for the first implementation.

This should be explicitly deferred so the phase stays focused.

---

## 28. Save / Load Requirements
The save model must include:

```ts
activeMarketEvent
activeMarketEventRemainingSeconds
```

### Migration defaults for older saves
```ts
activeMarketEvent = null
activeMarketEventRemainingSeconds = 0
```

This ensures compatibility.

---

# PART III — SYSTEM INTEGRATION NOTES

## 29. Interaction With Phase 1 Sectors
Events should be one of the first things that makes sectors feel alive rather than static.

This is one of the most important reasons Phase 6 exists.

---

## 30. Interaction With Phase 4A People Specialization
Sector events naturally increase the value of matching specialist placement.

Example:
- Technology Specialists matter more during a Tech Rally.

This should happen automatically through sector-level output multipliers.

---

## 31. Interaction With Phase 4B Institutional Mandates
Mandated organizational units become more attractive when their target sector is in a favorable event state.

Example:
- Hedge Fund with Tech Growth Mandate gains even more practical value during a Tech Rally.

Again, this should happen automatically through sector production.

---

## 32. Interaction With Phase 5 Automation
Automation units should feel especially good under event windows because they already have:
- market target
- strategy target
- cycle-based payouts

This phase gives those choices much more meaning.

Later, strategies can respond more specifically to different event types, but Phase 6 first pass should keep it simple.

---

## 33. Future Expansion Hooks
The following ideas are intentionally parked for later but should be remembered:
- more visible event countdown emphasis
- event-linked boosts
- stronger strategy-specific event interactions
- event history / trend view
- weighted sector climates
- multi-event overlap

The first implementation should not include these yet.

---

# PART IV — IMPLEMENTATION ORDER AND TESTING

## 34. Recommended Implementation Order
### Step 1
Add event types and event definition data.

### Step 2
Add active event state fields and save/load defaults.

### Step 3
Add event selector/helper functions.

### Step 4
Patch sector output formulas to include sector/global event modifiers.

### Step 5
Patch automation payout formulas to include automation/machine event modifiers.

### Step 6
Implement event timer processing in the main tick loop.

### Step 7
Add top-level event UI banner.

### Step 8
Balance test event durations, frequencies, and modifier strength.

---

## 35. Testing Checklist
Phase 6 should be considered successful if:
- events rotate correctly
- event timers tick down correctly
- sector events visibly affect the correct sectors
- systemic events visibly affect broader output as intended
- the UI makes current events obvious and understandable
- events reward adaptation but do not feel unfair
- sectors, mandates, specialists, and automation all feel more meaningful because of events

---

## 36. Final Summary
Phase 6 makes the market dynamic.

### Final approved Phase 6 rule
**Temporary market events and cycles create changing sector and system conditions that reward adaptation, make sectors and automation more meaningful, and keep the economy from feeling permanently solved.**

This document should be treated as the design and implementation planning source of truth for Phase 6.