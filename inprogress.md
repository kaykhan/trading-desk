# In Progress

This file is a working handoff note for the current balance / milestone / simulation pass.

## Next Actions

- rebalance the prestige backbone first, starting with first prestige toward `30m`
- improve prestige counts at `2h`, `5h`, `12h`, and `20h` before making big late-cost cuts
- rerun `npm run typecheck` and `npm run pacing:benchmark` after each balance change
- then reassess whether late walls like `cloudCompute` still need direct numeric changes

## Main Goal

Balance the game around a player who follows milestones strictly.

Target pacing:

- first prestige around `30m`
- soft complete around `15-20h`
- hard complete at `40h+`

Run 1 content target:

- should reach `Prop Desk`
- should reach `Quant Trader`
- should not need to reach deeper systems like `Institutional Desk`, `Rule Bot`, `ML Bot`, or `AI Bot`

## What We Were Working On

We were making the milestone-guided simulation honest and data-driven so it can be used as the main balance benchmark.

That work had two big parts:

1. move hidden progression gates into milestone structure / `mechanics.json`
2. make the sim follow milestones literally instead of making ad hoc choices

## Important Design Decisions

- `mechanics.json` is the canonical source of truth for progression metadata
- formulas stay in code; we are not building a DSL
- regular milestones are `run` milestones and reset on prestige
- prestige milestones are `meta` milestones and persist through prestige
- later systems can be gated behind persistent meta milestones

## Major Changes Already Made

### Milestone / sim structure

- added milestone `scope` support: `run` vs `meta`
- added persistent `unlockedMetaMilestones`
- prestige reset now preserves meta milestones
- benchmark/report now shows:
  - current run target
  - next meta target
  - last unlocked milestone
  - blocked time on current target

### Canonical JSON migration work

- canonicalized more upgrade/lobbying/specialization/mandate taxonomy into `mechanics.json`
- added many milestone `requirements`
- updated runtime/UI to consume those JSON definitions

### Milestone ladder fixes already added

- `Prop Desk Expansion` before `Institutional Entry`
- `Political Footing` before `First Policy Win`
- explicit hedge-fund ladder:
  - `Institutional Desk Expansion`
  - `Rule Bot Bench`
  - `Data Centre Expansion`
  - `Fund Launch`
  - then `Multi-Institution Structure`
- explicit late ladder additions:
  - `ML Bot Bench`
  - `AI Systems Research`
  - `Cloud Expansion`
  - `Global Platform` moved later behind these steps

### Sim behavior fixes already made

- compliance milestone path fixed so `Pay Your Compliance` actually works
- sector-income milestone path fixed so targeted sector focus is not immediately overwritten by default rebalance
- milestone targeting fixed so the sim aims at the first actually unmet milestone, not just the first locked one in storage state

## Current Benchmark State

Reference benchmark is the `Milestone Guided` run from `npm run pacing:benchmark`.

Current headline results:

- `30m`: no prestige yet; lifetime cash about `401,142`
- `2h`: still run `1`, no prestige yet
- `5h`: only `1` prestige
- `12h`: only `3` prestiges
- `20h`: only `5` prestiges

This is well behind the intended prestige curve.

Target prestige curve:

- `0.5h`: `1` prestige or basically at threshold
- `2h`: `2-4`
- `5h`: `5-8`
- `12h`: `8-12+`
- `20h`: `10+`

## Where We Left Off

Current active blocker in the milestone-guided benchmark:

- `AI Systems` (`firstAIBot`, milestone `#71`)

What we found:

- this is no longer mainly a hidden milestone-order problem
- by the time the sim is blocked here, it already has:
  - `3` ML bots
  - `AI Trading Systems` research
  - `Cloud Infrastructure` research
- but it still has:
  - `0` cloud compute
  - `0` AI bots

The actual wall at that point is cash:

- current cash at the blocker: about `1,268,859`
- first `cloudCompute` cost: about `6,500,000`
- next `aiTradingBot` cost: about `400,000`

So the late blocker is currently a real numeric balance wall.

## Important Interpretation

Even though `AI Systems` is a real late cash wall, the whole run is also arriving there with too little prestige acceleration.

So we should not assume every late-game problem should be solved by reducing late-game costs directly.

The bigger balance issue is:

- first prestige is far too late
- prestige acceleration remains too weak through `2h`, `5h`, `12h`, and `20h`

That probably makes every later wall feel worse than it should.

## Best Next Steps

Recommended next phase:

1. do a prestige/backbone balance pass
2. get first prestige back toward `30m`
3. increase prestige acceleration through `2h` and `5h`
4. rerun the benchmark
5. only then reassess whether late walls like `cloudCompute` still need direct cost changes

## What To Test

### Quick verification

Run typecheck:

```bash
npm run typecheck
```

Run the full benchmark:

```bash
npm run pacing:benchmark
```

### What to inspect in the benchmark output

For `Milestone Guided`, always check:

- `30m` checkpoint
  - lifetime cash
  - prestige count
  - whether only intended run-1 systems are present
- `2h`, `5h`, `12h`, `20h`
  - prestige count vs target curve
  - current run target milestone
  - blocked duration
  - whether major systems are actually online

### Specific things to compare after any balance change

- first prestige timing
- prestige count at `2h`, `5h`, `12h`, `20h`
- whether run 1 still stays limited to the intended content scope
- whether milestone-guided still progresses through:
  - lobbying
  - mandates
  - hedge fund ladder
  - ML ladder

## Useful Commands Used During Investigation

Main benchmark:

```bash
npm run pacing:benchmark
```

Typecheck:

```bash
npm run typecheck
```

Ad hoc sim inspection pattern used repeatedly:

```bash
./node_modules/.bin/tsx --eval "import { runSimulation } from './src/sim/simRunner.ts'; import { MILESTONE_GUIDED_SIM_CONFIG } from './src/sim/simState.ts'; const result=runSimulation({...MILESTONE_GUIDED_SIM_CONFIG,maxSeconds:20*60*60}); console.log(JSON.stringify({time:result.state.timeSeconds, run:result.state.runIndex, stallReason:result.metrics.stallReason}, null, 2));"
```

## Most Relevant Files

- `mechanics.json`
- `docs/balance-strategy.md`
- `docs/pacing-plan.md`
- `scripts/pacing-benchmark.ts`
- `src/sim/simActions.ts`
- `src/sim/simRunner.ts`
- `src/sim/simMetrics.ts`
- `src/utils/milestones.ts`
- `src/utils/prestige.ts`

## Short Summary

We made the milestone ladder much healthier and surfaced several hidden prerequisite chains as explicit milestones.

The sim now gets much farther than before:

- institutional desks
- lobbying
- mandates
- hedge fund ladder
- ML ladder
- AI research

But the whole run is still badly behind the intended prestige curve.

That is the main balance problem to tackle next.
