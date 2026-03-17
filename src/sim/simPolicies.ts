import { performRoiActions, performScriptedGrowthActions, performUnlockChasingActions } from './simActions'
import type { SimConfig, SimState } from './simState'

export function runPolicyStep(state: SimState, config: SimConfig): boolean {
  if (state.policyId === 'unlockChasing') {
    return performUnlockChasingActions(state, config)
  }

  if (state.policyId === 'roi') {
    return performRoiActions(state, config)
  }

  return performScriptedGrowthActions(state, config)
}
