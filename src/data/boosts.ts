import type { GlobalBoostDefinition, GlobalBoostId, TimedBoostDefinition, TimedBoostId, TimedBoostRuntime } from '../types/game'

export const TIMED_BOOSTS: Record<TimedBoostId, TimedBoostDefinition> = {
  aggressiveTradingWindow: {
    id: 'aggressiveTradingWindow',
    name: 'Aggressive Trading Window',
    durationSeconds: 300,
    cooldownSeconds: 1800,
    description: 'Temporarily increases human and sector output.',
    unlockResearchTechId: 'aggressiveTradingWindowProtocols',
  },
  deployReserveCapital: {
    id: 'deployReserveCapital',
    name: 'Deploy Reserve Capital',
    durationSeconds: 300,
    cooldownSeconds: 1800,
    description: 'Temporarily increases all profits.',
    unlockResearchTechId: 'deployReserveCapitalProtocols',
  },
  overclockServers: {
    id: 'overclockServers',
    name: 'Overclock Servers',
    durationSeconds: 300,
    cooldownSeconds: 3600,
    description: 'Temporarily boosts automation execution.',
    unlockResearchTechId: 'overclockServersProtocols',
  },
  researchSprint: {
    id: 'researchSprint',
    name: 'Research Sprint',
    durationSeconds: 300,
    cooldownSeconds: 1800,
    description: 'Temporarily increases Research Point generation.',
    unlockResearchTechId: 'researchSprintProtocols',
  },
  complianceFreeze: {
    id: 'complianceFreeze',
    name: 'Compliance Freeze',
    durationSeconds: 300,
    cooldownSeconds: 3600,
    description: 'Temporarily softens compliance pressure.',
    unlockResearchTechId: 'complianceFreezeProtocols',
  },
}

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
}

export const DEFAULT_TIMED_BOOSTS: Record<TimedBoostId, TimedBoostRuntime> = {
  aggressiveTradingWindow: { isActive: false, remainingActiveSeconds: 0, remainingCooldownSeconds: 0, autoEnabled: false },
  deployReserveCapital: { isActive: false, remainingActiveSeconds: 0, remainingCooldownSeconds: 0, autoEnabled: false },
  overclockServers: { isActive: false, remainingActiveSeconds: 0, remainingCooldownSeconds: 0, autoEnabled: false },
  researchSprint: { isActive: false, remainingActiveSeconds: 0, remainingCooldownSeconds: 0, autoEnabled: false },
  complianceFreeze: { isActive: false, remainingActiveSeconds: 0, remainingCooldownSeconds: 0, autoEnabled: false },
}

export const DEFAULT_GLOBAL_BOOSTS_OWNED: Record<GlobalBoostId, boolean> = {
  globalProfitBoost: false,
  globalEnergySupplyBoost: false,
  globalInfluenceBoost: false,
  globalReputationBoost: false,
}
