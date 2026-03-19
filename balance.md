# Balance Review

This report is based on `mechanics.json` and current runtime formulas.

It intentionally ignores simulation output and focuses on raw costs, outputs, prerequisites, milestone flow, rewards, and progression structure.

## Executive View

- Early human trading is mostly coherent.
- Midgame research, automation, lobbying, and prestige are likely overtuned upward.
- Several milestone rewards are mismatched to the difficulty and timing of the milestone.
- A few upgrades are trap or misleading purchases.
- Sector and unit ROI curves are uneven enough that some branches look clearly dominated.

## Trading Economy

Base payback by unit:

- `intern`: `15 / 0.3 = 50s`
- `juniorTrader`: `120 / 3.2 = 37.5s`
- `seniorTrader`: `3500 / 16 = 218.75s`
- `quantTrader`: `2500 / 5 = 500s`
- `propDesk`: `18000 / 120 = 150s`
- `institutionalDesk`: `150000 / 540 = 278s`
- `hedgeFund`: `1100000 / 3200 = 344s`
- `investmentFirm`: `8500000 / 18000 = 472s`

Issues:

- `quantTrader` is much worse than `seniorTrader` on raw ROI while also sitting behind research.
- The first automation step is economically unappealing unless desk-slot pressure alone justifies it.
- The institution ladder is better ROI than first automation at the low end, especially `propDesk`.

Recommended fixes:

- Raise `quantTrader` payout from `20` to around `28-36`, or lower cost from `2500` to `1500-1800`.
- Alternatively keep raw ROI weaker, but make Quant Traders unlock earlier and position them as slotless scaling.
- Consider slightly reducing `propDesk` output or increasing cost if machines should become attractive before institutions.

## Manual Trading And Early Upgrades

- `betterTerminal` and `tradeShortcuts` are very strong and cheap, which works for onboarding.
- `Premium Data Feed` is misleading: the description says manual income `+25%`, but runtime applies the manual multiplier twice, making its real manual boost `1.5625x`.

Issues:

- Manual trading is stronger than the UI suggests.
- This makes the early curve harder to reason about and hides real balance.

Recommended fixes:

- If intended, update the description to match runtime.
- If not intended, remove one of the two applications in code.
- Preferred outcome: keep a single `1.25x` manual multiplier and let the human-output bonus stay separate.

## Research Economy

Base RP unit payback:

- `internResearchScientist`: `600 / 0.35 = 1714s`
- `juniorResearchScientist`: `2400 / 1.1 = 2182s`
- `seniorResearchScientist`: `9500 / 3.4 = 2794s`

Research costs:

- early: `100`, `140`, `150`, `220`, `380`
- mid: `700`, `1000`, `1400`, `1500`, `2100`, `2800`
- high wall: `6000`, `6500`, `7500`, `9000`, `18000`, `20000`, `22000`

Issues:

- Research staff have much slower payback than cash units.
- Many core progression systems depend on large RP walls.
- Research upgrades appear after the player is already likely underpowered on RP generation.

Recommended fixes:

- Buff RP production:
  - `internResearchScientist`: `0.35 -> 0.5`
  - `juniorResearchScientist`: `1.1 -> 1.6`
  - `seniorResearchScientist`: `3.4 -> 5.0` or `5.5`
- Or cut high RP costs:
  - `regulatoryAffairs`: `6000 -> 3000-4000`
  - `dataCenterSystems`: `9000 -> 5000-6500`
  - `hedgeFundStrategies`: `7500 -> 4500-6000`
  - `investmentFirms`: `20000 -> 12000-15000`
  - `boostAutomationProtocols`: `18000 -> 9000-12000`
  - `cloudInfrastructure`: `22000 -> 12000-16000`
- Best approach: moderate RP unit buffs plus moderate top-end RP cost cuts.

## Research Flow And Branch Structure

Current chain pressure:

- `algorithmicTrading` requires `seniorRecruitment`, and also has a 5-Senior unlock gate.
- `ruleBasedAutomation` sits behind `algorithmicTrading`.
- `machineLearningTrading` requires both `ruleBasedAutomation` and `dataCenterSystems`.
- `dataCenterSystems` requires 5 rule bots.
- `aiTradingSystems` requires `machineLearningTrading`, `dataCenterSystems`, and 3 ML bots.

Issues:

- This is a stacked-gate problem: RP + owned unit counts + infrastructure + prior tech.
- The player repeatedly pays multiple gates for the same progression tier.

Recommended fixes:

- Reduce `algorithmicTrading` unlock requirement from 5 Seniors to 2 or 3.
- Reduce `dataCenterSystems` unlock requirement from 5 rule bots to 2 or 3.
- Remove either the `machineLearningTrading` 5-rule-bot dependency or the `dataCenterSystems` 5-rule-bot dependency.
- Reduce `aiTradingSystems` ML requirement from 3 to 1 or 2.

## Automation Economy

Raw automation ROI:

- `ruleBasedBot`: `12000 / 11.67 = 1029s`
- `mlTradingBot`: `80000 / 18.33 = 4364s`
- `aiTradingBot`: `400000 / 32.5 = 12308s`

Issues:

- Automation baselines are very weak compared with human and institution ladders.
- Later machine tiers are expensive in both cash and infrastructure.
- `quantTrader` has no live power use, but still has weak payout.

Recommended fixes:

- Buff cycle payouts:
  - `ruleBasedBot`: `70 -> 110-140`
  - `mlTradingBot`: `220 -> 400-500`
  - `aiTradingBot`: `650 -> 1400-1800`
- Or reduce costs substantially:
  - `ruleBasedBot`: `12000 -> 6000-8000`
  - `mlTradingBot`: `80000 -> 30000-50000`
  - `aiTradingBot`: `400000 -> 120000-200000`
- Preferred approach: buff payout more than cutting cost so machines keep a capital-intensive identity.

## Lobbying And Influence

- `juniorPolitician` costs `14000` and generates only `0.01 influence/sec`.
- First policy costs are `12`, `16`, `18`, `20`, later reaching `48`.

Issues:

- Getting influence generation online is likely too slow.
- Governance repeatables are cheap enough in influence terms, but the income source is too weak.

Recommended fixes:

- Increase `juniorPolitician` base influence from `0.01` to `0.05` or `0.08`.
- Or reduce politician cost from `14000` to `3000-6000`.
- Preferred first adjustment: `0.01 -> 0.05`.

## Infrastructure And Power

Capacity efficiency:

- `deskSpace`: `180` per slot
- `floorSpace`: `340` per slot
- `office`: `420` per slot

Power per slot:

- `deskSpace`: `0.5`
- `floorSpace`: `0.32`
- `office`: `0.3`

Machine power infrastructure efficiency:

- `serverRack`: `1800 / 3 = 600 per power`
- `serverRoom`: `100000 / 30 = 3333 per power`
- `dataCenter`: `1000000 / 220 = 4545 per power`
- `cloudCompute`: `6500000 / 700 = 9286 per power`

Issues:

- Capacity infra looks mostly healthy.
- Machine power tiers become drastically less cost-efficient per power.
- Combined with weak machine ROI, this compounds mid/late automation pain.

Recommended fixes:

- Lower `serverRoom` cost to `70000-85000`.
- Lower `dataCenter` cost to `600000-750000`.
- Lower `cloudCompute` cost to `3000000-4500000`.
- Or significantly increase machine payouts so these infra prices make sense.

## Sector Balance

Base sector multipliers:

- Finance: `1.0`
- Technology: `1.2`
- Energy: `1.08`

Issues:

- Technology appears to be the default strongest sector.
- Energy looks comparatively weak in both base value and strategy support.

Recommended fixes:

- Reduce Technology to `1.15`, or
- Raise Energy to `1.12-1.15`, or
- Give Energy stronger unique strategy synergy.

## Milestone Flow

The intended line appears to be:

- desk and human staff
- research
- sectors
- specialization
- automation
- institutions and lobbying
- boosts
- prestige
- repeatables

This structure is good conceptually, but the numeric pacing has several cliff edges.

Good early rewards:

- `smallTeam` gives `10` desk slots very early.
- `unlockResearch`, `firstInternScientist`, and `firstResearchNode` all help the branch they introduce.

Issues:

- `firstCompliancePayment` gives only `1 influence`.
- `firstComplianceReview` gives only `2 influence`.
- `unlockAutomation` gives only `100 RP`, which is tiny relative to nearby automation costs.
- `firstQuantTrader` gives `15000 cash`, which is large, but only after the gate is already cleared.
- `firstGlobalBoost` gives only `2 influence`, which may be too small for that stage.
- `firstPrestige` gives `1 reputation`, but prestige itself is a huge threshold.

Recommended fixes:

- Increase milestone rewards around branch-entry spikes:
  - `unlockAutomation`: `100 RP -> 250-500 RP`
  - `firstStrategyUnlocked`: `100 RP -> 150-250 RP`
  - `unlockLobbying`: `3 influence -> 5-8 influence`
  - `firstLobbyingPolicy`: `2 influence -> 3-5 influence`
  - `unlockBoosts`: keep `75000 cash`, consider adding `100-200 RP`
- Reduce some later cash rewards if they trivialize purchases only after hard gates instead of helping before them.

## Milestone Linearity And Progression Cohesion

Issues:

- Research gets expensive before research output is healthy.
- Automation is gated too hard to feel like a smooth next step.
- Lobbying arrives late and pays slowly.
- Prestige sits far beyond all of that.

Conclusion:

- The progression graph is conceptually linear, but the numeric curve is not.
- It currently has multiple cliff edges instead of a staircase.

Recommended fixes:

- Make each new system reachable with one clear gate, not three stacked gates.
- Use milestone rewards to bridge into the next system, not reward the player only after they have already paid the entrance cost.

## Upgrade Pricing

Early desk upgrades look fine.

Research upgrade prices:

- `labAutomation`: `12000`
- `researchGrants`: `40000`
- `sharedResearchLibrary`: `110000`
- `backtestingSuite`: `250000`
- `institutionalResearchNetwork`: `900000`
- `crossDisciplinaryModels`: `2000000`

Automation upgrade prices:

- `systematicExecution`: `100000`
- `botTelemetry`: `130000`
- `executionRoutingStack`: `220000`
- `modelServingCluster`: `700000`
- `inferenceBatching`: `1200000`
- `aiRiskStack`: `4500000`

Issues:

- Research upgrades are likely overpriced relative to RP production and research branch entry cost.
- Automation upgrades are expensive relative to machine base weakness.

Recommended fixes:

- Cut research upgrade costs by roughly `30-50%` if current RP output remains unchanged.
- Cut first automation upgrade costs by `25-40%`, especially `systematicExecution` and `botTelemetry`.
- Or buff underlying units enough that these prices become acceptable.

## Trap Or Broken-Feeling Content

- `mandateAlignmentFramework` has no runtime effect.
- `analyticalModeling` has no runtime effect.
- `Premium Data Feed` description mismatches runtime.

Recommended fixes:

- Wire them up or remove and hide them.
- Fix the Premium Data Feed description mismatch immediately.

## Prestige Layer

- Prestige threshold is `4,000,000` lifetime cash and requires at least one machine unit.
- First prestige gain is only `4` reputation.

Issues:

- Getting into the prestige system likely happens too late.
- This delays the repeatable upgrade layer and slows the intended run-loop structure.

Recommended fixes:

- Lower first prestige threshold to `1.5m-2.5m`, or
- Raise late-midgame income enough to justify `4m`.
- Preferred approach: lower threshold.

## Priority Fix Order

1. Fix trap and misleading content:
   - `mandateAlignmentFramework`
   - `analyticalModeling`
   - `Premium Data Feed` mismatch
2. Fix research economy:
   - buff research staff and/or cut high RP costs
3. Fix first automation:
   - better Quant ROI
   - lower automation gate stacking
   - better Rule Bot ROI
4. Fix lobbying:
   - buff politician influence/sec
5. Fix prestige entry:
   - lower threshold
6. Retune milestone rewards around system unlocks
7. Fine-tune sector asymmetry

## Concrete Recommended Starting Patch Set

- `quantTrader` payout: `20 -> 32`
- `ruleBasedBot` payout: `70 -> 120`
- `mlTradingBot` payout: `220 -> 420`
- `aiTradingBot` payout: `650 -> 1500`
- `internResearchScientist` RP/s: `0.35 -> 0.5`
- `juniorResearchScientist` RP/s: `1.1 -> 1.6`
- `seniorResearchScientist` RP/s: `3.4 -> 5.0`
- `juniorPolitician` influence/s: `0.01 -> 0.05`
- `algorithmicTrading` unlock requirement: `5 seniors -> 3 seniors`
- `dataCenterSystems` unlock requirement: `5 rule bots -> 3 rule bots`
- `aiTradingSystems` unlock requirement: `3 ML bots -> 2 ML bots`
- `regulatoryAffairs` cost: `6000 -> 3500`
- `dataCenterSystems` cost: `9000 -> 6000`
- `cloudInfrastructure` cost: `22000 -> 14000`
- prestige threshold: `4,000,000 -> 2,000,000`
- `unlockAutomation` milestone reward: `100 RP -> 300 RP`
- `unlockLobbying` milestone reward: `3 influence -> 6 influence`
- Technology multiplier: `1.2 -> 1.15`, or Energy multiplier: `1.08 -> 1.12`
