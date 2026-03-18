# Stock Incremental Game — Phase 9 Design Document and Implementation Planning

## Scope
This document covers **Phase 9 — Boosts Tab / Temporary Abilities**.

It combines:
1. **Design document**
2. **Implementation planning / specification sheet**
3. **System integration notes**

Phase 9 introduces a dedicated **Boosts** tab with two distinct systems that live together in one place:
- **Timed Activatable Boosts** with duration and cooldown
- **Global Premium Boosts** that provide persistent account-wide modifiers

This document defines how both systems coexist cleanly while preserving clear player understanding.

---

# PART I — DESIGN DOCUMENT

## 1. Phase 9 Goal
The goal of Phase 9 is to add short-term tactical power and long-term global enhancement without confusing the player.

By this stage of the game, the player already has:
- sectors
- human specialists
- institutional mandates
- automation cycles
- market events
- compliance pressure
- lobbying mitigation

Boosts should now give the player:
- a reason to time actions around good windows
- stronger tactical responses to events and compliance
- a premium/global progression layer that is clearly separate from ordinary gameplay boosts

### Core design philosophy
The Boosts tab should contain:
- **temporary activatable power**
- **persistent global modifiers**

But the UI must clearly separate the two.

---

## 2. Two Boost Families
The Boosts tab should be split into two families.

### A. Timed Boosts
These are activatable abilities with:
- duration
- cooldown
- optional auto-activation later

These are the core gameplay boosts.

### B. Global Boosts
These are persistent long-term modifiers that do not use cooldowns.

These should be treated as:
- separate from normal boosts
- always-on once obtained
- clearly labeled as global/premium/account-wide

This split is important.

---

## 3. Timed Boosts Design Role
Timed boosts should create short windows of heightened value.

They should feel good to use during moments like:
- favorable market events
- strong automation setups
- research pushes
- before a compliance review
- during high-value market targeting windows

This makes them tactical rather than just passive modifiers.

---

## 4. Timed Boosts Duration and Cooldown Rules
### Approved timing direction
Timed boosts should:
- last roughly **5 minutes**
- have cooldowns such as **30 minutes** for normal boosts
- have cooldowns such as **60 minutes** for stronger boosts

This is now the intended standard.

### Why this works
- 5 minutes is long enough to matter
- 30–60 minute cooldowns make boosts feel valuable
- cooldowns prevent spam and preserve timing choices

---

## 5. Timed Boost Examples
### Aggressive Trading Window
Temporarily increases human and sector output.

### Deploy Reserve Capital
Temporarily boosts all profits.

### Overclock Servers
Temporarily increases automation cycle payout or speed, possibly with higher machine stress later if desired.

### Research Sprint
Temporarily increases Research Point generation.

### Compliance Freeze
Temporarily softens compliance drag or delays pressure later if desired.

These are strong first candidates.

---

## 6. Timed Boost Design Rules
### Rule 1 — Clear effect
Each boost should have a very understandable effect.

### Rule 2 — Cooldown visible
The player must clearly see when the boost can be used again.

### Rule 3 — Duration visible
The player must clearly see remaining active time.

### Rule 4 — Strong but not mandatory
Boosts should feel impactful without making the game feel bad when they are unavailable.

### Rule 5 — Auto mode is late-game convenience
Auto-activation should not be available immediately.

---

## 7. Auto-Activation Rule
Timed boosts should later support **auto-toggle / auto-activation**, but only through a late-game Research node.

### Approved design
Auto-activation is not a default convenience.
It is a later progression reward.

### Example research node direction
- **Boost Automation**
- **Tactical Automation Systems**
- **Executive Automation Protocols**

This node should unlock the ability to mark boosts as auto-enabled.

---

## 8. Global Boosts Design Role
Global boosts are different from timed boosts.

They are not about timing.
They are about persistent enhancement.

### Approved examples
- **Increase overall profits by 5%**
- **Increase global energy supply by 5%**
- **Increase global influence by 5%**
- **Increase global reputation by 5%**

These should be represented as persistent modifiers.

---

## 9. Global Boost Positioning
Global boosts should live in the same Boosts tab, but in a clearly separate section.

### Important UI rule
The player must never confuse:
- a timed activatable boost
with
- a permanent global boost

So the Boosts tab should visually split into something like:
- **Timed Boosts**
- **Global Boosts**

This is the recommended structure.

---

## 10. Global Boost “Paywall” Note
You mentioned global boosts being behind a paywall.

For the design structure, these should be treated as:
- externally obtained / premium / account-wide boost entitlements
- persistent once available
- not part of ordinary timed boost cooldown gameplay

The implementation layer should therefore support:
- reading whether a global boost is owned/enabled
- applying its modifier globally
- displaying it in the Boosts tab

This keeps the gameplay model clear regardless of how acquisition is handled elsewhere.

---

## 11. Recommended Timed Boost Effects
Suggested first-pass timed boost identities:

### Aggressive Trading Window
- human and sector output increased for 5 minutes
- cooldown: 30 minutes

### Deploy Reserve Capital
- all profits increased for 5 minutes
- cooldown: 30 minutes

### Overclock Servers
- automation cycle payout and/or cycle speed improved for 5 minutes
- cooldown: 60 minutes

### Research Sprint
- research generation increased for 5 minutes
- cooldown: 30 minutes

### Compliance Freeze
- temporary compliance efficiency relief or reduced review impact for 5 minutes
- cooldown: 60 minutes

These are strong because they each touch a different part of the game.

---

## 12. Recommended Global Boost Effects
Suggested first-pass global boosts:

### Global Profit Boost
- overall profits +5%

### Global Energy Supply Boost
- total energy supply / capacity +5%

### Global Influence Boost
- global influence gain +5%

### Global Reputation Boost
- global reputation gain +5%

These are simple, broad, and easy to understand.

---

## 13. How Timed Boosts and Global Boosts Differ
### Timed boosts
- player-triggered
- cooldown-based
- duration-limited
- tactical

### Global boosts
- always-on
- no cooldown
- no duration
- strategic/persistent

This distinction must be explicit in both UI and code structure.

---

## 14. UI Philosophy for the Boosts Tab
The Boosts tab should feel like a command center for temporary power and persistent enhancement.

### It should clearly answer
- what boosts do I currently have?
- what can I activate now?
- what is currently active?
- when will a cooldown end?
- which global boosts are permanently helping me?

This is the required player-facing clarity.

---

## 15. Final Design Summary for Phase 9
### Final approved Phase 9 rule
**The Boosts tab contains both timed activatable boosts with cooldowns and persistent global boosts with always-on effects, with clear separation between the two systems.**

This is the intended design identity of the phase.

---

# PART II — IMPLEMENTATION PLANNING / SPECIFICATION SHEET

## 16. Timed Boost Type Definitions
Suggested types:

```ts
export type TimedBoostId =
  | 'aggressiveTradingWindow'
  | 'deployReserveCapital'
  | 'overclockServers'
  | 'researchSprint'
  | 'complianceFreeze';
```

Suggested definition shape:

```ts
type TimedBoostDefinition = {
  id: TimedBoostId;
  name: string;
  durationSeconds: number;
  cooldownSeconds: number;
  description: string;
};
```

---

## 17. Global Boost Type Definitions
Suggested types:

```ts
export type GlobalBoostId =
  | 'globalProfitBoost'
  | 'globalEnergySupplyBoost'
  | 'globalInfluenceBoost'
  | 'globalReputationBoost';
```

Suggested definition shape:

```ts
type GlobalBoostDefinition = {
  id: GlobalBoostId;
  name: string;
  description: string;
  multiplier: number;
};
```

---

## 18. Timed Boost Definitions
Suggested first-pass data:

```ts
export const TIMED_BOOSTS: Record<TimedBoostId, TimedBoostDefinition> = {
  aggressiveTradingWindow: {
    id: 'aggressiveTradingWindow',
    name: 'Aggressive Trading Window',
    durationSeconds: 300,
    cooldownSeconds: 1800,
    description: 'Temporarily increases human and sector output.',
  },
  deployReserveCapital: {
    id: 'deployReserveCapital',
    name: 'Deploy Reserve Capital',
    durationSeconds: 300,
    cooldownSeconds: 1800,
    description: 'Temporarily increases all profits.',
  },
  overclockServers: {
    id: 'overclockServers',
    name: 'Overclock Servers',
    durationSeconds: 300,
    cooldownSeconds: 3600,
    description: 'Temporarily boosts automation execution.',
  },
  researchSprint: {
    id: 'researchSprint',
    name: 'Research Sprint',
    durationSeconds: 300,
    cooldownSeconds: 1800,
    description: 'Temporarily increases Research Point generation.',
  },
  complianceFreeze: {
    id: 'complianceFreeze',
    name: 'Compliance Freeze',
    durationSeconds: 300,
    cooldownSeconds: 3600,
    description: 'Temporarily softens compliance pressure.',
  },
};
```

---

## 19. Global Boost Definitions
Suggested first-pass data:

```ts
export const GLOBAL_BOOSTS: Record<GlobalBoostId, GlobalBoostDefinition> = {
  globalProfitBoost: {
    id: 'globalProfitBoost',
    name: 'Global Profit Boost',
    description: 'Increase overall profits by 5%.',
    multiplier: 1.05,
  },
  globalEnergySupplyBoost: {
    id: 'globalEnergySupplyBoost',
    name: 'Global Energy Supply Boost',
    description: 'Increase global energy supply by 5%.',
    multiplier: 1.05,
  },
  globalInfluenceBoost: {
    id: 'globalInfluenceBoost',
    name: 'Global Influence Boost',
    description: 'Increase global influence gain by 5%.',
    multiplier: 1.05,
  },
  globalReputationBoost: {
    id: 'globalReputationBoost',
    name: 'Global Reputation Boost',
    description: 'Increase global reputation gain by 5%.',
    multiplier: 1.05,
  },
};
```

---

## 20. GameState Additions
Suggested timed boost runtime state:

```ts
timedBoosts: Record<TimedBoostId, {
  isActive: boolean;
  remainingActiveSeconds: number;
  remainingCooldownSeconds: number;
  autoEnabled: boolean;
}>;
```

Suggested global boost state:

```ts
globalBoostsOwned: Record<GlobalBoostId, boolean>;
```

### Notes
- `globalBoostsOwned` can represent entitlement/availability
- the actual acquisition source can remain external to this phase’s gameplay logic

---

## 21. Auto-Activation Research Node
Add a future/late-game research unlock such as:

```ts
boostAutomationProtocols
```

### Role
Unlocks the ability to toggle timed boosts into auto mode.

### Approved behavior
If a boost is set to auto and its cooldown reaches zero, it should activate automatically.

---

## 22. Timed Boost Runtime Rules
### Activation rule
A timed boost can be activated only if:
- it is not currently active
- its cooldown is zero

### Active state rule
While active:
- remaining active time counts down
- effect applies continuously

### Expiry rule
When active time reaches zero:
- boost deactivates
- cooldown begins

### Cooldown rule
Cooldown counts down until zero.

This is the core boost loop.

---

## 23. Recommended Timed Boost Effects
Suggested first-pass derived effects:

### Aggressive Trading Window
- human output and sector output multiplier boost

### Deploy Reserve Capital
- global profit multiplier boost

### Overclock Servers
- automation cycle payout multiplier and/or reduced cycle duration

### Research Sprint
- research points per second multiplier boost

### Compliance Freeze
- temporary improvement to compliance efficiency multiplier and/or temporary reduction to projected compliance cost pressure

These can all be implemented through selectors.

---

## 24. Global Boost Application Rules
Global boosts should apply as always-on multipliers.

### Example
If `globalProfitBoost` is owned:
- multiply profit formulas by `1.05`

If `globalEnergySupplyBoost` is owned:
- multiply total energy supply/capacity by `1.05`

If `globalInfluenceBoost` is owned:
- multiply influence gain formulas by `1.05`

If `globalReputationBoost` is owned:
- multiply reputation gain formulas by `1.05`

This is the intended implementation model.

---

## 25. Suggested Helper Functions
Timed boosts:

```ts
isTimedBoostActive(state, boostId)
canActivateTimedBoost(state, boostId)
getTimedBoostCooldownRemaining(state, boostId)
getTimedBoostDurationRemaining(state, boostId)
```

Global boosts:

```ts
isGlobalBoostOwned(state, boostId)
getGlobalProfitBoostMultiplier(state)
getGlobalEnergySupplyBoostMultiplier(state)
getGlobalInfluenceBoostMultiplier(state)
getGlobalReputationBoostMultiplier(state)
```

Combined effect helpers:

```ts
getTimedProfitBoostMultiplier(state)
getTimedResearchBoostMultiplier(state)
getTimedAutomationBoostMultiplier(state)
getTimedComplianceReliefMultiplier(state)
```

These should drive both gameplay and UI.

---

## 26. New Actions
Suggested actions:

```ts
activateTimedBoost(boostId)
toggleTimedBoostAutoMode(boostId, enabled)
processTimedBoosts(deltaSeconds)
```

Optional external/integration action:

```ts
setGlobalBoostOwned(globalBoostId, owned)
```

This may be set by external entitlement logic rather than player gameplay actions.

---

## 27. Tick Loop Integration
The main tick loop must now also process timed boosts.

### On each tick
- reduce active duration for active boosts
- deactivate and start cooldown when active duration expires
- reduce cooldown for inactive boosts
- if auto-enabled and cooldown reaches zero, activate boost automatically (only if auto-activation research is unlocked)

This should remain separate from automation cycle processing for clarity.

---

## 28. UI Requirements
The Boosts tab should be split into two major sections.

### Section 1 — Timed Boosts
Each card should show:
- boost name
- effect summary
- active / inactive / cooling down state
- remaining active duration
- remaining cooldown
- activate button
- auto-toggle (if unlocked)

### Section 2 — Global Boosts
Each card should show:
- global boost name
- effect summary
- owned / not owned state
- always-on status if owned

This separation is required.

---

## 29. Recommended Top Summary in Boosts Tab
The tab should also have a top summary area showing:
- currently active timed boosts
- auto-boost automation unlocked or not
- owned global boosts count

This will help the page feel legible once more boosts exist.

---

## 30. Save / Load Requirements
The save model should include:

```ts
timedBoosts
globalBoostsOwned
```

### Migration defaults
Timed boosts:
- inactive
- duration 0
- cooldown 0
- autoEnabled false

Global boosts:
- all false unless provided externally

---

# PART III — SYSTEM INTEGRATION NOTES

## 31. Interaction With Sectors
Timed boosts should become more meaningful during favorable market events or when the player has strong specialist and mandate alignment.

This is one of the biggest reasons boosts are valuable at this stage of the game.

---

## 32. Interaction With Automation
Overclock Servers is especially important because automation already has:
- cycle timing
- market targeting
- strategy selection

Timed boosts should layer cleanly on top of this without replacing the automation system.

---

## 33. Interaction With Compliance
Compliance Freeze should be the bridge between the Boosts system and the Compliance/Lobbying systems.

This is a good tactical counterpart to the more permanent lobbying mitigation of Phase 8.

---

## 34. Interaction With Lobbying
Lobbying remains the persistent mitigation layer.
Boosts should be tactical short-term tools.

This distinction should remain clear.

---

## 35. Interaction With Research
The late-game auto-activation node should sit in a future-appropriate branch, likely in Automation or an executive systems branch later.

This makes auto-boosting a progression reward rather than free convenience.

---

## 36. Future Expansion Hooks
The following are good future directions but should remain deferred:
- boost queues / priorities
- boost presets
- event-triggered auto-rules
- stacking / chaining boosts
- visual global countdown bar outside the Boosts tab

The first implementation should remain simpler.

---

# PART IV — IMPLEMENTATION ORDER AND TESTING

## 37. Recommended Implementation Order
### Step 1
Add timed boost and global boost type definitions and data.

### Step 2
Add timed boost runtime state and global boost ownership state.

### Step 3
Implement timed boost activation/cooldown processing.

### Step 4
Implement timed boost effect selectors and integrate into existing formulas.

### Step 5
Implement global boost selectors and integrate into global formulas.

### Step 6
Add Boosts tab UI with separate Timed Boosts and Global Boosts sections.

### Step 7
Add late-game research hook for auto-activation.

### Step 8
Balance test effect strengths, cooldowns, and duration values.

---

## 38. Testing Checklist
Phase 9 should be considered successful if:
- timed boosts activate, expire, and cool down correctly
- timed boosts feel meaningful but not mandatory every minute
- global boosts apply persistent modifiers correctly
- the UI clearly separates temporary boosts from persistent global boosts
- auto-activation only works when the late-game research unlock is present
- boosts feel especially rewarding when combined with events, automation, or compliance windows

---

## 39. Final Summary
Phase 9 introduces a dedicated Boosts tab with both tactical temporary abilities and persistent global modifiers.

### Final approved Phase 9 rule
**The Boosts tab contains timed activatable boosts with duration/cooldown gameplay and persistent global boosts with always-on modifiers, clearly separated in one interface.**

This document should be treated as the design and implementation planning source of truth for Phase 9.

