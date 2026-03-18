# TODO - Headless Simulation Framework - 17-03-2026

This TODO is based on the design source of truth:

- `docs/stock_incremental_headless_simulation_design_doc.md`

Status legend:

- [ ] not started
- [~] partial / needs follow-up
- [x] done

## Phase Goal

Build a proper headless simulation framework for `Trading Desk` that:

- runs much faster than real time
- reuses live-game formulas and constants wherever possible
- separates state, tick processing, actions, policies, metrics, and runners
- supports scripted bot-player strategies
- records progression, pacing, and balance metrics
- is structured so fixed-step simulation works first and event-driven simulation can be added later

## Design Lock From The Source Doc

- [ ] Simulate economy and decisions, not visuals
- [ ] Keep the simulator headless: no DOM, no rendering, no UI-layer dependencies
- [ ] Use fixed-step `1 second` simulation as version 1
- [ ] Architect the framework so event-driven jumps can be added later without rewriting everything
- [ ] Reuse shared live-game formulas/constants wherever possible instead of creating fake simulator math
- [ ] Keep simulation concerns modular and separated
- [ ] Treat multiple policy types as a core requirement, not a stretch goal
- [ ] Treat milestone logging as part of the broader simulation framework, not the whole framework
- [ ] Design for batch simulation and seeded randomness later, even if not all of it ships in v1

## Current Repo Reality

- [x] There is already a fast prototype script at `scripts/milestone-simulation.ts`
- [x] That script is plain-state and faster than the old store-driven attempt
- [x] The current script is still a prototype, not a framework
- [x] The current script mixes state mutation, time processing, policy logic, and reporting in one file
- [x] The current script has weak progression quality and does not yet complete the whole milestone arc
- [x] Shared live-game logic already exists in reusable utility modules under `src/utils/` and `src/data/`
- [x] The repo already has other headless validation scripts such as:
  - `scripts/balance-check.ts`
  - `scripts/prestige-check.ts`
  - `scripts/sector-validation.ts`
  - `scripts/capacity-validation.ts`

## Proposed Architecture For This Repo

- [ ] Create a dedicated simulation module area, recommended default:
  - `src/sim/`
- [ ] Split the framework into the doc-aligned module groups:
  - `src/sim/simState.ts`
  - `src/sim/simTick.ts`
  - `src/sim/simActions.ts`
  - `src/sim/simPolicies.ts`
  - `src/sim/simMetrics.ts`
  - `src/sim/simRunner.ts`
- [ ] Keep CLI/report scripts in `scripts/` as thin runners only
- [ ] Ensure simulation modules do not import React components or UI-only code
- [ ] Keep the state and runner usable from both CLI scripts and future automated tests

## 1. State Model

- [ ] Decide whether to reuse `GameState` directly for v1 or create a `SimState` wrapper around it
- [ ] Recommended default: use `GameState` plus small simulation-only metadata wrapper fields
- [ ] Add explicit simulation metadata structure, such as:
  - [ ] `timeSeconds`
  - [ ] `runIndex`
  - [ ] `seed`
  - [ ] `policyId`
  - [ ] counters for metrics accumulation
- [ ] Add a state factory helper, such as:
  - [ ] `createInitialSimState()`
  - [ ] `cloneSimState()`
- [ ] Keep simulator state very close to runtime game state so shared formulas stay valid
- [ ] Decide where milestone logging lives:
  - [ ] inside `SimState`
  - [ ] or in external metrics accumulators
- [ ] Recommended default: keep milestone logs in metrics, not in core state

## 2. Shared Logic Reuse Audit

- [ ] Audit which runtime modules are safe to reuse directly in simulation
- [ ] Confirm reuse of live logic for:
  - [ ] income formulas
  - [ ] research generation formulas
  - [ ] influence generation formulas
  - [ ] automation payout formulas
  - [ ] compliance formulas
  - [ ] prestige formulas
  - [ ] boost logic
  - [ ] optimisation effects
  - [ ] milestone evaluation
- [ ] Identify any runtime helpers that currently depend on store/UI assumptions and should be bypassed or wrapped
- [ ] Create adapter helpers where reuse is good but the runtime API shape is awkward for sim use

## 3. Tick / Time Processor

- [ ] Create `src/sim/simTick.ts`
- [ ] Implement a single simulation tick entrypoint, likely:
  - [ ] `tickSim(state, deltaSeconds)`
- [ ] Keep tick order consistent with the design doc:
  - [ ] advance time
  - [ ] update timers
  - [ ] process expiring/completing systems
  - [ ] apply generation and payouts
  - [ ] refresh derived/unlockable state
  - [ ] allow action decisions outside the tick
- [ ] Support all major runtime systems in fixed-step mode:
  - [ ] manual trade handling when policy chooses it
  - [ ] passive human income
  - [ ] research generation
  - [ ] influence generation
  - [ ] automation cycles and burst payouts
  - [ ] timed boost timers/cooldowns
  - [ ] market event timers
  - [ ] compliance review timer and due payments
  - [ ] milestone evaluation
- [ ] Ensure tick logic is deterministic for a fixed seed and policy
- [ ] Ensure tick logic can later support event-jump scheduling without rewriting business rules

## 4. Action System

- [ ] Create `src/sim/simActions.ts`
- [ ] Define a structured simulation action union, for example:
  - [ ] `buyUnit`
  - [ ] `buyUpgrade`
  - [ ] `buyResearch`
  - [ ] `buyPowerInfrastructure`
  - [ ] `buyCapacityInfrastructure`
  - [ ] `assignToSector`
  - [ ] `trainSpecialist`
  - [ ] `applyMandate`
  - [ ] `setAutomationTarget`
  - [ ] `setAutomationStrategy`
  - [ ] `activateTimedBoost`
  - [ ] `payCompliance`
  - [ ] `buyPolicy`
  - [ ] `buyOptimisation`
  - [ ] `performPrestige`
- [ ] Build pure action application helpers that mutate/return sim state without store dependencies
- [ ] Ensure every supported action reuses live-game cost and unlock formulas wherever possible
- [ ] Keep action validation and action application clearly separated if useful
- [ ] Decide whether v1 supports single action per decision step or action batches
- [ ] Recommended default: one chosen action at a time, with optional helper loops for obvious bulk purchase passes

## 5. Decision Policy Engine

- [ ] Create `src/sim/simPolicies.ts`
- [ ] Define a policy interface, such as:
  - [ ] `chooseAction(state, context) => SimAction | null`
- [ ] Define policy metadata identifiers for comparison and logging
- [ ] Implement at least these policy families from the design doc:
  - [ ] `greedy-roi`
  - [ ] `conservative-growth`
  - [ ] `research-rush`
  - [ ] `institution-focus`
  - [ ] `automation-focus`
  - [ ] at least one neglect bot, recommended default: `no-lobbying`
- [ ] Implement reusable decision heuristics:
  - [ ] ROI-based purchase scoring
  - [ ] unlock chasing thresholds
  - [ ] save-until-affordable logic
  - [ ] compliance payment behavior policies
  - [ ] boost usage rules
  - [ ] prestige timing rules
  - [ ] event-aware retargeting hooks later
- [ ] Decide how often a policy may act:
  - [ ] every tick
  - [ ] after each tick until no affordable action remains
- [ ] Recommended default: after each tick, allow repeated policy actions until policy returns `null` or action budget is reached

## 6. Metrics Layer

- [ ] Create `src/sim/simMetrics.ts`
- [ ] Define a metrics shape for per-run outputs
- [ ] Log milestone timings and key progression timings, including:
  - [ ] first Intern
  - [ ] first Junior Trader
  - [ ] first Senior Trader
  - [ ] first sector unlock
  - [ ] first scientist
  - [ ] first automation unlock
  - [ ] compliance visible
  - [ ] first lobbying policy
  - [ ] first prestige
  - [ ] prestiges `2` through `10`
- [ ] Log broader balance metrics from the design doc, including:
  - [ ] total units purchased by type
  - [ ] total upgrades purchased
  - [ ] total research nodes purchased
  - [ ] total optimisation ranks purchased
  - [ ] average compliance burden
  - [ ] average automation share of income
  - [ ] average human share of income
  - [ ] average institution share of income
  - [ ] average machine share of income
  - [ ] boost usage counts
  - [ ] event exposure metrics once events are included
- [ ] Define milestone logging helpers for all full milestone ids, not just a hand-picked subset
- [ ] Add summary/format helpers so CLI scripts can print concise reports without duplicating logic

## 7. Runner Layer

- [ ] Create `src/sim/simRunner.ts`
- [ ] Implement a reusable runner API, such as:
  - [ ] `runSimulation(config)`
  - [ ] `runSimulationBatch(config)`
- [ ] Support runner config for:
  - [ ] max run time
  - [ ] max prestige count
  - [ ] chosen policy
  - [ ] fixed-step size
  - [ ] random seed
  - [ ] metrics level / report mode
- [ ] Ensure a run can end on conditions like:
  - [ ] reached target prestige
  - [ ] reached all milestones
  - [ ] reached max simulated time
  - [ ] progression stall detection
- [ ] Add stall detection so failed policies do not run forever
- [ ] Recommended default: end a run if no meaningful progress occurs across a configurable window

## 8. Prestige Simulation

- [ ] Implement explicit prestige policy logic aligned with the design doc
- [ ] Support prestige heuristics such as:
  - [ ] prestige as soon as minimum rep threshold is met
  - [ ] prestige after automation is online
  - [ ] prestige after compliance becomes visible
  - [ ] prestige after run-time threshold
  - [ ] prestige when marginal gain slows
- [ ] Track and report:
  - [ ] time to Prestige 1
  - [ ] time to Prestiges 2-10
  - [ ] total reputation earned
  - [ ] prestige tree completion by Prestige 10
- [ ] Ensure prestige reset simulation matches runtime reset behavior closely

## 9. Compliance Simulation

- [ ] Simulate compliance explicitly, not as a hand-waved tax
- [ ] Support policy variants for:
  - [ ] always pay immediately
  - [ ] pay only when due
  - [ ] prioritize category order
  - [ ] delay payment for higher-priority purchases
- [ ] Record:
  - [ ] first compliance reveal time
  - [ ] review counts
  - [ ] payment counts
  - [ ] total compliance spend
  - [ ] average burden / penalty over time
- [ ] Validate whether compliance pressure is too weak, fair, or too punishing across policies

## 10. Automation Simulation

- [ ] Treat automation as cycle-based, not passive flat income
- [ ] Simulate:
  - [ ] automation ownership
  - [ ] target market selection
  - [ ] strategy selection
  - [ ] cycle timers
  - [ ] payout bursts
  - [ ] power limitations
  - [ ] compliance modifiers
  - [ ] event modifiers later
  - [ ] boost interactions
- [ ] Add policy helpers for selecting automation strategies and retargeting markets
- [ ] Report machine share of total output and automation pacing milestones

## 11. Event Simulation

- [ ] Audit current runtime market event system for sim reuse
- [ ] Add seeded event selection support
- [ ] Simulate:
  - [ ] event selection
  - [ ] event duration
  - [ ] sector-specific effects
  - [ ] systemic effects
- [ ] Add event-aware vs event-ignorant bot comparisons later
- [ ] If events are deferred from v1, document them as an explicit `[~] partial` area rather than silently skipping them

## 12. Boost Simulation

- [ ] Support timed boosts fully:
  - [ ] unlock checks
  - [ ] activation rules
  - [ ] duration
  - [ ] cooldown
  - [ ] auto-activation
- [ ] Support global boosts once the acquisition path is properly modeled or specified
- [ ] Add policy variants:
  - [ ] never use boosts
  - [ ] always use on cooldown
  - [ ] use only during favorable events
  - [ ] save for compliance windows

## 13. Milestone Logging And Validation

- [ ] Log all milestone unlock times per run
- [ ] Track milestone completion order for progression sanity checking
- [ ] Compare simulated milestone order against intended milestone order to find progression mismatches
- [ ] Add milestone-specific validation reports for:
  - [ ] impossible milestones
  - [ ] late/unreasonable milestones
  - [ ] misordered milestones relative to real unlock path
- [ ] Keep milestone validation as one report built on top of the general framework

## 14. Batch Runs / Monte Carlo

- [ ] Add support for batch simulation runs
- [ ] Add config for run count per policy
- [ ] Produce averages / medians / outlier summaries
- [ ] Keep seeded randomness so policies can be compared against the same event stream
- [ ] Recommended later target:
  - [ ] `100` runs per strategy for comparison sweeps

## 15. RNG / Seeded Randomness

- [ ] Add a small seeded RNG utility for simulation
- [ ] Ensure runs are reproducible from a seed
- [ ] Ensure event selection and any future randomness use the seeded source instead of uncontrolled randomness
- [ ] Include the seed in run reports for debugging

## 16. CLI Scripts / Entry Points

- [ ] Convert `scripts/milestone-simulation.ts` into a thin runner over `src/sim/`
- [ ] Decide whether to create additional scripts such as:
  - [ ] `scripts/sim-run.ts`
  - [ ] `scripts/sim-batch.ts`
  - [ ] `scripts/sim-milestones.ts`
  - [ ] `scripts/sim-prestige.ts`
- [ ] Add package scripts for the main workflows, such as:
  - [ ] single-run progression report
  - [ ] milestone validation report
  - [ ] policy comparison report
  - [ ] batch seeded runs

## 17. Validation Against Live Game

- [ ] Validate one or more simulator runs against expected runtime behavior
- [ ] Check that simulator outputs match live logic for:
  - [ ] automation payouts
  - [ ] compliance timing
  - [ ] prestige rewards
  - [ ] upgrade effects
  - [ ] optimisation effects
  - [ ] milestone unlock conditions
- [ ] Add a short simulator validation checklist doc or section in the runner output

## 18. Performance Targets

- [ ] Preserve the hard rule that simulation should run in seconds, not real-time minutes/hours
- [ ] Measure runtime for a representative full run
- [ ] Measure runtime for batch runs once implemented
- [ ] Identify obvious hotspots before considering event-driven mode
- [ ] Keep fixed-step v1 simple and correct first, but avoid unnecessary object churn or store overhead

## 19. Event-Driven Future Hook

- [ ] Design the runner API so later event-driven stepping can plug in without changing policy/metrics interfaces
- [ ] Identify future jump targets such as:
  - [ ] next automation payout
  - [ ] next compliance review
  - [ ] next event expiry
  - [ ] next boost cooldown completion
  - [ ] next affordable purchase
  - [ ] next prestige threshold
- [ ] Do not block v1 on event-driven implementation

## 20. Output / Reporting

- [ ] Support human-readable CLI summaries
- [ ] Support structured outputs later, such as:
  - [ ] JSON export
  - [ ] CSV export
- [ ] Make reports answer practical tuning questions:
  - [ ] when prestige happens
  - [ ] what build dominates
  - [ ] whether compliance/lobbying matter
  - [ ] whether boosts matter
  - [ ] whether optimisations feel useful
  - [ ] whether some research/upgrades are dead content

## 21. Initial Build Order

- [ ] Step 1: extract the current simulation prototype into `src/sim/` modules
- [ ] Step 2: create clean state/tick/actions/policies/metrics/runner boundaries
- [ ] Step 3: keep a single fixed-step policy working end-to-end
- [ ] Step 4: add milestone logging and richer progression metrics
- [ ] Step 5: add prestige and compliance policy variants
- [ ] Step 6: add at least `3` policy profiles for comparison
- [ ] Step 7: add seeded randomness and market event support
- [ ] Step 8: add batch runs and structured report output

## 22. Definition Of Done For V1

- [ ] A full headless run executes through a reusable simulation framework, not a monolithic script
- [ ] The framework uses fixed-step `1 second` simulation
- [ ] The framework reuses live formulas for core systems
- [ ] At least one policy can progress through prestige meaningfully
- [ ] Metrics are captured in a structured way
- [ ] Milestone unlock timing is recorded for all milestones
- [ ] CLI output is generated through a thin runner script
- [ ] `npm run typecheck` passes
- [ ] A documented next path exists for event-driven mode and batch simulation
