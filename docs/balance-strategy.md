# Balance Strategy

This document captures the long-term balancing approach for the game so pacing work stays aligned with the intended player experience.

## Core Goal

Balance the game around a player who follows milestones strictly as their primary guide to completion.

The game should feel structured, readable, and finishable on a known timeline rather than drifting based on ad hoc ROI tuning.

## Reference Player Model

The benchmark reference player is the milestone-guided simulation.

That sim should:

- follow milestone order strictly
- buy what the current milestone explicitly requires
- buy prerequisite tech, units, infrastructure, upgrades, or policies only when needed to satisfy that milestone
- avoid speculative or opportunistic purchases outside the current milestone chain
- use the current manual-click assumption for early progression

This model is the main balance target because it represents a player trying to complete the game by following the progression structure we authored.

## Target Timelines

### First Prestige

- target: around `30 minutes`
- by this point the player should be happy with unlocking:
  - `Prop Desk`
  - `Quant Trader`
- by this point the player does **not** need deeper systems like:
  - `Institutional Desk`
  - `Rule-Based Bot`
  - `ML Bot`
  - `AI Bot`

### Soft Complete

- target: around `15-20 hours`
- soft complete means the player has seen and meaningfully used all major systems
- remaining goals after this point should mostly feel like mastery, full optimization, or long-tail completion rather than missing fundamentals

### Hard Complete

- target: `40+ hours`
- hard complete means clearing the long-tail content, including all milestones and full optimisation/repeatable completion targets

## Prestige Curve Targets

Prestige timing is a core pacing backbone, not a side metric.

If prestige is too slow, late systems will appear with too little compounded acceleration and the game will feel underpowered even when milestone ordering is correct.

Target prestige counts for the milestone-guided benchmark:

- `0.5h`: `1` prestige or effectively at the threshold
- `2h`: `2-4` prestiges
- `5h`: `5-8` prestiges
- `12h`: `8-12+` prestiges
- `20h`: `10+` prestiges with major meta progression established

These are not intended to be perfect exact numbers, but they are the right shape for the current top-level goals:

- first prestige around `30m`
- soft complete around `15-20h`
- hard complete at `40h+`

If the benchmark is materially behind this prestige curve, late-game walls should be assumed to be partly downstream of weak prestige acceleration, not just isolated end-tier costs.

## Working-Backward Method

Balance should be done from the end goal backward, not from isolated early-game feelings.

### Step 1: Lock the destination

Use these pacing anchors as fixed targets:

- first prestige at about `30m`
- soft complete at about `15-20h`
- hard complete at `40h+`

### Step 2: Define what each phase must contain

Each time band should have a clear content expectation.

- Run 1: desk foundation, research online, `Prop Desk`, `Quant Trader`, first prestige nearly reached or reached
- Run 2: first prestige acceleration is felt, first preview systems become usable
- Midgame: automation, institutions, and lobbying are integrated into the build
- Lategame: deeper machine tiers, boosts, and broader prestige loops are active
- Soft complete: all major branches are online and meaningfully used

### Step 3: Make milestones the route through the game

Milestones are not just rewards; they are the intended completion path.

- milestone order should express the player journey
- milestone requirements in `mechanics.json` should describe the actual prerequisite chain
- the sim should not need to invent clever purchases outside milestone metadata

### Step 4: Tune the smallest point on the path that fixes the timeline

When a target is missed, adjust the narrowest useful lever first.

Examples:

- if first prestige is missed by a small amount, buff the relevant run-1 cash path rather than rewriting the whole progression tree
- if midgame is too slow, inspect the exact blocked milestone and the prerequisite chain feeding into it
- if late game is too short, stretch high-tier RP, infrastructure, automation, or optimisation requirements rather than slowing onboarding

## Preferred Balance Order

When making future balance changes, use this order:

1. confirm the exact pacing miss from the benchmark
2. identify the first milestone or system where progress is late or blocked
3. determine whether the miss is caused by:
   - raw cash income
   - raw RP income
   - influence income
   - milestone order
   - milestone prerequisite metadata
   - unlock requirements that stack too many gates
4. make the smallest numeric or metadata change that addresses that specific miss
5. rerun the benchmark and compare against the target window

## `mechanics.json` Role

`mechanics.json` is the canonical source of truth for balance and progression metadata.

It should own:

- ids
- labels
- categories and groups
- milestone order and rewards
- milestone prerequisite metadata
- unlock requirements
- costs, payouts, scaling, thresholds, and pacing numbers

Runtime code should continue owning formulas and procedural behavior, but it should not invent canonical progression data that belongs in JSON.

## Current Benchmark Interpretation

Current milestone-guided benchmark status:

- the run reaches `Prop Desk` and `Quant Trader` well before `30m`
- the run still misses first prestige badly on the current laddered build
- current `30m` lifetime cash is about `401,142`
- current prestige threshold is `500,000`
- current shortfall is about `98,858`
- current prestige counts are far behind the intended curve:
  - `0.5h`: actual `0`, target `1 or near-threshold`
  - `2h`: actual `0`, target `2-4`
  - `5h`: actual `1`, target `5-8`
  - `12h`: actual `3`, target `8-12+`
  - `20h`: actual `5`, target `10+`

Interpretation:

- Run 1 content scope is much healthier than before, but prestige timing is still far too slow
- the game is now reaching much deeper milestone ladders, but it is doing so with too little prestige acceleration
- some late walls are real numeric balance walls, but they should be interpreted in the context of an underpowered prestige curve
- we should avoid over-nerfing late costs in isolation before the prestige backbone is closer to target

## Practical Rules For Future Tuning

- protect onboarding clarity; do not make the first 10 minutes confusing just to stretch the total timeline
- prefer milestone-metadata fixes before adding sim-only heuristics
- prefer small targeted buffs/nerfs over broad sweeping changes
- do not use prestige timing alone as proof that the whole game is balanced
- always check both milestone count and actual system usage at each benchmark window
- if a system is supposed to appear later, do not force it into Run 1 just because it improves ROI

## Immediate Short-Term Focus

The next balancing passes should prioritize:

1. getting first prestige to land around `30m`
2. keeping Run 1 limited to the intended unlock set of `Prop Desk` and `Quant Trader`
3. fixing the next blocked milestone chains after that so the game can actually extend into a healthy `15-20h` soft-complete path
4. preserving `40h+` hard-complete space through long-tail milestones and optimisation depth
