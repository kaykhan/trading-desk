# TODO - Phase 10 Prestige Redesign - 17-03-2026

This TODO adapts `docs/stock_incremental_phase_10_prestige_redesign_design_and_implementation.md` to the current `Trading Desk` codebase after compliance, lobbying, and boosts work.

Status legend:

- [ ] not started
- [~] partial / needs follow-up
- [x] done

## Phase Goal

Redesign Prestige into a finite, named, readable 10-step legacy system where:

- the player can prestige a maximum of `10` times
- each prestige has a named tier
- Reputation remains the prestige currency
- prestige upgrades become a 10-goal tree aligned with the current full game
- Reputation gain follows a deliberate 10-prestige curve
- the Prestige UI clearly shows progress, current tier, next gain, and the redesigned tree

## Current Repo Reality

- [x] Prestige already exists as a reset loop with Reputation in:
  - `src/utils/prestige.ts`
  - `src/store/gameStore.ts`
  - `src/components/dashboard/PrestigeTab.tsx`
  - `src/components/PrestigeConfirmModal.tsx`
- [x] Current prestige system is still the older model:
  - 6 prestige upgrades instead of 10 approved goals
  - no named prestige tiers
  - no hard 10-prestige cap
  - current reputation gain is based on lifetime cash sqrt formula
  - current prestige planning UI assumes the old upgrade ids and costs
- [x] Save state already persists:
  - `prestigeCount`
  - `reputation`
  - `reputationSpent`
  - `purchasedPrestigeUpgrades`
- [x] Current prestige effects already hook into:
  - profits
  - research
  - seed capital
  - human staff cost
  - machine output
  - power capacity
- [x] New systems now exist that prestige should also touch:
  - compliance
  - lobbying / influence
  - sector output
  - boosts

## Design Lock For This Repo

- [ ] Cap `prestigeCount` at `10`
- [ ] Keep `reputation` as the spend currency
- [ ] Keep `reputationSpent` tracking lifetime spend
- [ ] Replace the old prestige upgrade list with the approved 10-goal structure
- [ ] Keep `purchasedPrestigeUpgrades` as the rank store for first pass, but update its ids to match the new approved goal ids
- [ ] Keep optional planning UI in first pass, but update it for the new goals and costs
- [ ] Replace the open-ended prestige gain formula with a finite curve keyed to next prestige count
- [ ] Keep the player able to finish or nearly finish the full prestige tree by Prestige 10

## Approved New Goal Set

- [ ] `globalRecognition`
- [ ] `seedCapital`
- [ ] `betterHiringPipeline`
- [ ] `institutionalKnowledge`
- [ ] `gridOrchestration`
- [ ] `complianceFrameworks`
- [ ] `policyCapital`
- [ ] `marketReputation`
- [ ] `deskEfficiency`
- [ ] `strategicReserves`

## Approved Tier Track

- [ ] `iron`
- [ ] `bronze`
- [ ] `silver`
- [ ] `gold`
- [ ] `platinum`
- [ ] `titanium`
- [ ] `sapphire`
- [ ] `ruby`
- [ ] `diamond`
- [ ] `onyx`

## 1. Type Redesign

- [ ] Add `PrestigeTierId` in `src/types/game.ts`
- [ ] Replace old `PrestigeUpgradeId` union with the approved 10-goal ids
- [ ] Update prestige definition types to fit the new goal model cleanly
- [ ] Ensure `GameState.purchasedPrestigeUpgrades` can still represent rank counts for all 10 goals
- [ ] Update any UI planning types that still assume the old 6-goal tree

## 2. Data Redesign - Prestige Goals

- [ ] Replace `src/data/prestigeUpgrades.ts` with the approved 10-goal structure
- [ ] Every goal should have:
  - `id`
  - `name`
  - `maxRank = 10`
  - `description`
- [ ] Remove legacy goals/ids that no longer fit:
  - `brandRecognition`
  - `tradeMultiplier`
- [ ] Map old saves as safely as possible during migration

## 3. Data Redesign - Prestige Tiers

- [ ] Add prestige tier definitions somewhere centralized, likely `src/data/prestige.ts` or `src/data/prestigeUpgrades.ts`
- [ ] Include tier order and display names
- [ ] Add helpers for:
  - current tier from `prestigeCount`
  - next tier from `prestigeCount`
  - completed prestige track display data

## 4. Cost Curve Redesign

- [ ] Add helper for next-rank cost by current rank in `src/utils/prestige.ts`
- [ ] Use the approved cost pattern:
  - ranks 1-3 cost `1`
  - ranks 4-6 cost `2`
  - ranks 7-8 cost `3`
  - ranks 9-10 cost `4`
- [ ] Remove old flat `baseCost` planning assumptions from UI and selectors
- [ ] Ensure all prestige rank purchases use this helper consistently

## 5. Reputation Gain Redesign

- [ ] Replace current lifetime-cash-only reputation gain helper with a finite next-prestige curve
- [ ] Add helper such as `getReputationGainForNextPrestige(state)`
- [ ] Target gain curve:
  - prestige 1 -> `4`
  - prestige 2 -> `6`
  - prestige 3 -> `9`
  - prestige 4 -> `13`
  - prestige 5 -> `17`
  - prestige 6 -> `21`
  - prestige 7 -> `26`
  - prestige 8 -> `31`
  - prestige 9 -> `37`
  - prestige 10 -> `66`
- [ ] Ensure prestige beyond 10 yields `0`

## 6. Prestige Reset Rules

- [ ] Update `performPrestigeReset` / existing prestige reset flow in `src/store/gameStore.ts` and `src/utils/prestige.ts`
- [ ] Enforce:
  - cannot prestige if `prestigeCount >= 10`
  - reset still requires normal prestige eligibility rules unless intentionally changed
- [ ] Preserve intended meta state on reset:
  - prestige count
  - reputation
  - reputation spent
  - prestige goal ranks
  - other current permanent/meta systems already preserved by design

## 7. Migration Plan

- [ ] Update save normalization in `src/utils/persistence.ts`
- [ ] Map old prestige ids into the new structure where reasonable
- [ ] Recommended migration defaults for removed/renamed goals:
  - `brandRecognition` -> `globalRecognition`
  - `tradeMultiplier` -> distribute or map into `marketReputation` or `globalRecognition`
- [ ] Clamp `prestigeCount` to max `10` during load
- [ ] Ensure `ui.prestigePurchasePlan` also migrates to the new ids

## 8. Prestige Effect Helpers

- [ ] Refactor `src/utils/prestige.ts` to expose helpers for the new 10-goal tree:
  - `getGlobalRecognitionMultiplier(state)`
  - `getSeedCapitalValue(state)`
  - `getHiringCostMultiplier(state)`
  - `getInstitutionalKnowledgeMultiplier(state)`
  - `getGridOrchestrationMachineMultiplier(state)`
  - `getGridOrchestrationPowerMultiplier(state)`
  - `getComplianceFrameworksRelief(state)`
  - `getPolicyCapitalMultiplier(state)`
  - `getMarketReputationMultiplier(state)`
  - `getDeskEfficiencyMultiplier(state)`
  - `getStrategicReservesCooldownMultiplier(state)` and/or duration helper
- [ ] Keep helpers readable and centralized

## 9. Game-System Integration

- [ ] Patch economy formulas in `src/utils/economy.ts` to use:
  - `globalRecognition`
  - `marketReputation`
  - `deskEfficiency`
  - updated `betterHiringPipeline`
  - updated `institutionalKnowledge`
  - updated `gridOrchestration`
  - `policyCapital` for influence gain
- [ ] Patch compliance formulas in `src/utils/compliance.ts` to use `complianceFrameworks`
- [ ] Patch boosts logic in `src/utils/boosts.ts` to use `strategicReserves`
- [ ] Patch prestige preview and gain selectors to use the new finite gain system

## 10. Selectors Update

- [ ] Update prestige selectors in `src/store/selectors.ts`
- [ ] Add/selectors for:
  - current prestige count
  - current tier
  - next tier
  - prestige track progress
  - free reputation
  - next prestige gain
  - goal next-rank cost
  - planned prestige spend under the new cost model

## 11. Prestige Tab UI Redesign

- [ ] Rebuild `src/components/dashboard/PrestigeTab.tsx` around the new finite system
- [ ] Add Prestige Track UI with 10 seals/badges
- [ ] Show:
  - `Prestige X / 10`
  - current tier name
  - next tier name if not maxed
  - current reputation
  - free reputation
  - expected reputation on next reset
- [ ] Replace old upgrade list with the new 10-goal list
- [ ] Each goal row/card should show:
  - rank / 10
  - next-rank cost
  - effect summary
  - planned rank count if plan UI remains

## 12. Prestige Confirm Modal Redesign

- [ ] Update `src/components/PrestigeConfirmModal.tsx`
- [ ] Show:
  - current prestige count and current tier
  - next tier gained on reset
  - projected reputation gain
  - reputation after reset
  - planned prestige purchases under new ids/costs
- [ ] Clearly message when prestige is capped at 10

## 13. Planning UI Refactor

- [ ] Update planning logic to support variable next-rank costs instead of flat base costs
- [ ] Ensure `adjustPrestigePurchasePlan` still works with the new cost model
- [ ] Ensure `plannedPrestigeCost`, `plannedPrestigeAvailable`, and `plannedPrestigeRemaining` all use the new rank cost helper
- [ ] Consider whether the plan remains worth keeping in first pass; if too costly, simplify but preserve visibility of next costs

## 14. Cap UX

- [ ] Add explicit messaging in Prestige UI when player reaches `10 / 10`
- [ ] Disable prestige reset action at max prestige
- [ ] Show `Onyx complete` or equivalent completion-state copy

## 15. Balance Pass

- [ ] Verify Prestige 1 lands roughly at the intended slowdown point
- [ ] Verify early goal ranks feel affordable and meaningful
- [ ] Verify total reputation across 10 prestiges lands around the full-tree target
- [ ] Verify `Strategic Reserves` is useful but not mandatory
- [ ] Verify `Compliance Frameworks` and `Policy Capital` feel relevant in the later game

## 16. Validation

- [ ] Verify prestige cannot exceed 10 total resets
- [ ] Verify current tier naming is correct at every prestige count
- [ ] Verify reputation gain matches the intended next-prestige curve
- [ ] Verify all 10 prestige goals can rank from 0 to 10 correctly
- [ ] Verify next-rank cost scaling works correctly across all ranks
- [ ] Verify old saves migrate without losing meta progression
- [ ] Verify planning UI uses the new costs correctly
- [ ] Verify prestige reset still preserves the correct permanent systems
- [ ] Run final checks:
  - `npm run typecheck`
  - `npm run build`

## Recommended Implementation Order

- [ ] 1. Redefine prestige ids, tiers, and goal data
- [ ] 2. Add rank cost scaling and finite reputation gain curve
- [ ] 3. Patch reset logic and migration for the new structure plus 10-prestige cap
- [ ] 4. Patch economy/compliance/lobbying/boost integrations to read new prestige helpers
- [ ] 5. Rebuild Prestige tab and confirm modal UI around track + new goals
- [ ] 6. Rebalance and validate across the full 10-prestige arc
