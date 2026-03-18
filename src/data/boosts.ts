import type { GlobalBoostDefinition, GlobalBoostId, TimedBoostDefinition, TimedBoostId, TimedBoostRuntime } from '../types/game'
import { mechanics } from '../lib/mechanics'

export const TIMED_BOOSTS: Record<TimedBoostId, TimedBoostDefinition> = {
  aggressiveTradingWindow: {
    id: 'aggressiveTradingWindow',
    name: mechanics.multipliers.timedBoosts.aggressiveTradingWindow.name,
    durationSeconds: mechanics.multipliers.timedBoosts.aggressiveTradingWindow.durationSeconds,
    cooldownSeconds: mechanics.multipliers.timedBoosts.aggressiveTradingWindow.cooldownSeconds,
    description: mechanics.multipliers.timedBoosts.aggressiveTradingWindow.description,
    unlockResearchTechId: mechanics.multipliers.timedBoosts.aggressiveTradingWindow.unlockResearchTechId,
  },
  deployReserveCapital: {
    id: 'deployReserveCapital',
    name: mechanics.multipliers.timedBoosts.deployReserveCapital.name,
    durationSeconds: mechanics.multipliers.timedBoosts.deployReserveCapital.durationSeconds,
    cooldownSeconds: mechanics.multipliers.timedBoosts.deployReserveCapital.cooldownSeconds,
    description: mechanics.multipliers.timedBoosts.deployReserveCapital.description,
    unlockResearchTechId: mechanics.multipliers.timedBoosts.deployReserveCapital.unlockResearchTechId,
  },
  overclockServers: {
    id: 'overclockServers',
    name: mechanics.multipliers.timedBoosts.overclockServers.name,
    durationSeconds: mechanics.multipliers.timedBoosts.overclockServers.durationSeconds,
    cooldownSeconds: mechanics.multipliers.timedBoosts.overclockServers.cooldownSeconds,
    description: mechanics.multipliers.timedBoosts.overclockServers.description,
    unlockResearchTechId: mechanics.multipliers.timedBoosts.overclockServers.unlockResearchTechId,
  },
  researchSprint: {
    id: 'researchSprint',
    name: mechanics.multipliers.timedBoosts.researchSprint.name,
    durationSeconds: mechanics.multipliers.timedBoosts.researchSprint.durationSeconds,
    cooldownSeconds: mechanics.multipliers.timedBoosts.researchSprint.cooldownSeconds,
    description: mechanics.multipliers.timedBoosts.researchSprint.description,
    unlockResearchTechId: mechanics.multipliers.timedBoosts.researchSprint.unlockResearchTechId,
  },
  complianceFreeze: {
    id: 'complianceFreeze',
    name: mechanics.multipliers.timedBoosts.complianceFreeze.name,
    durationSeconds: mechanics.multipliers.timedBoosts.complianceFreeze.durationSeconds,
    cooldownSeconds: mechanics.multipliers.timedBoosts.complianceFreeze.cooldownSeconds,
    description: mechanics.multipliers.timedBoosts.complianceFreeze.description,
    unlockResearchTechId: mechanics.multipliers.timedBoosts.complianceFreeze.unlockResearchTechId,
  },
}

export const GLOBAL_BOOSTS: Record<GlobalBoostId, GlobalBoostDefinition> = {
  globalProfitBoost: {
    id: 'globalProfitBoost',
    name: mechanics.multipliers.globalBoosts.globalProfitBoost.name,
    description: mechanics.multipliers.globalBoosts.globalProfitBoost.description,
    multiplier: mechanics.multipliers.globalBoosts.globalProfitBoost.multiplier,
  },
  globalEnergySupplyBoost: {
    id: 'globalEnergySupplyBoost',
    name: mechanics.multipliers.globalBoosts.globalEnergySupplyBoost.name,
    description: mechanics.multipliers.globalBoosts.globalEnergySupplyBoost.description,
    multiplier: mechanics.multipliers.globalBoosts.globalEnergySupplyBoost.multiplier,
  },
  globalInfluenceBoost: {
    id: 'globalInfluenceBoost',
    name: mechanics.multipliers.globalBoosts.globalInfluenceBoost.name,
    description: mechanics.multipliers.globalBoosts.globalInfluenceBoost.description,
    multiplier: mechanics.multipliers.globalBoosts.globalInfluenceBoost.multiplier,
  },
  globalReputationBoost: {
    id: 'globalReputationBoost',
    name: mechanics.multipliers.globalBoosts.globalReputationBoost.name,
    description: mechanics.multipliers.globalBoosts.globalReputationBoost.description,
    multiplier: mechanics.multipliers.globalBoosts.globalReputationBoost.multiplier,
  },
}

export const DEFAULT_TIMED_BOOSTS: Record<TimedBoostId, TimedBoostRuntime> = {
  aggressiveTradingWindow: { ...mechanics.startingState.timedBoosts.aggressiveTradingWindow },
  deployReserveCapital: { ...mechanics.startingState.timedBoosts.deployReserveCapital },
  overclockServers: { ...mechanics.startingState.timedBoosts.overclockServers },
  researchSprint: { ...mechanics.startingState.timedBoosts.researchSprint },
  complianceFreeze: { ...mechanics.startingState.timedBoosts.complianceFreeze },
}

export const DEFAULT_GLOBAL_BOOSTS_OWNED: Record<GlobalBoostId, boolean> = {
  globalProfitBoost: mechanics.startingState.globalBoostsOwned.globalProfitBoost,
  globalEnergySupplyBoost: mechanics.startingState.globalBoostsOwned.globalEnergySupplyBoost,
  globalInfluenceBoost: mechanics.startingState.globalBoostsOwned.globalInfluenceBoost,
  globalReputationBoost: mechanics.startingState.globalBoostsOwned.globalReputationBoost,
}
