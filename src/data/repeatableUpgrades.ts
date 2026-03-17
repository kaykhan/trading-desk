import type { GameState, RepeatableUpgradeDefinition, RepeatableUpgradeId } from '../types/game'

export const REPEATABLE_UPGRADE_IDS: RepeatableUpgradeId[] = [
  'manualExecutionRefinement',
  'humanDeskTuning',
  'institutionalProcessRefinement',
  'sectorAllocationEfficiency',
  'researchThroughput',
  'trainingMethodology',
  'analyticalModeling',
  'executionStackTuning',
  'modelEfficiency',
  'computeOptimization',
  'signalQualityControl',
  'complianceSystems',
  'filingEfficiency',
  'policyReach',
  'institutionalAccess',
]

export const REPEATABLE_UPGRADES: RepeatableUpgradeDefinition[] = [
  {
    id: 'manualExecutionRefinement',
    name: 'Manual Execution Refinement',
    family: 'desk',
    currency: 'cash',
    maxRank: 100,
    perRankDescription: 'Manual trade value +0.5% per rank',
    baseCost: 5_000,
    costScaling: 1.11,
    effectPerRank: 0.005,
    description: 'Long-tail manual trade improvement after the first prestige.',
    unlockConditionDescription: 'Unlocked after Prestige 1',
    visibleWhen: (state) => state.prestigeCount >= 1,
    unlockWhen: (state) => state.prestigeCount >= 1,
  },
  {
    id: 'humanDeskTuning',
    name: 'Human Desk Tuning',
    family: 'desk',
    currency: 'cash',
    maxRank: 100,
    perRankDescription: 'Human output +0.5% per rank',
    baseCost: 15_000,
    costScaling: 1.11,
    effectPerRank: 0.005,
    description: 'Broad human desk output scaling.',
    unlockConditionDescription: 'Requires human desk units active',
    visibleWhen: (state) => state.prestigeCount >= 1,
    unlockWhen: (state) => state.internCount + state.juniorTraderCount + state.seniorTraderCount > 0,
  },
  {
    id: 'institutionalProcessRefinement',
    name: 'Institutional Process Refinement',
    family: 'desk',
    currency: 'cash',
    maxRank: 100,
    perRankDescription: 'Institution output +0.75% per rank',
    baseCost: 100_000,
    costScaling: 1.12,
    effectPerRank: 0.0075,
    description: 'Broad institution output scaling.',
    unlockConditionDescription: 'Requires institution systems active',
    visibleWhen: (state) => state.prestigeCount >= 1,
    unlockWhen: (state) => state.propDeskCount + state.institutionalDeskCount + state.hedgeFundCount + state.investmentFirmCount > 0,
  },
  {
    id: 'sectorAllocationEfficiency',
    name: 'Sector Allocation Efficiency',
    family: 'desk',
    currency: 'cash',
    maxRank: 100,
    perRankDescription: 'Sector-assigned output +0.5% per rank',
    baseCost: 50_000,
    costScaling: 1.11,
    effectPerRank: 0.005,
    description: 'Rewards sector-based deployment.',
    unlockConditionDescription: 'Requires sectors active',
    visibleWhen: (state) => state.prestigeCount >= 1,
    unlockWhen: (state) => Object.values(state.unlockedSectors).some(Boolean),
  },
  {
    id: 'researchThroughput',
    name: 'Research Throughput',
    family: 'research',
    currency: 'researchPoints',
    maxRank: 100,
    perRankDescription: 'Research Point generation +0.75% per rank',
    baseCost: 250,
    costScaling: 1.1,
    effectPerRank: 0.0075,
    description: 'Broad RP scaling.',
    unlockConditionDescription: 'Requires research active',
    visibleWhen: (state) => state.prestigeCount >= 1,
    unlockWhen: (state) => state.internResearchScientistCount + state.juniorResearchScientistCount + state.seniorResearchScientistCount > 0,
  },
  {
    id: 'trainingMethodology',
    name: 'Training Methodology',
    family: 'research',
    currency: 'researchPoints',
    maxRank: 100,
    perRankDescription: 'Specialist and mandate effectiveness +0.5% per rank',
    baseCost: 400,
    costScaling: 1.1,
    effectPerRank: 0.005,
    description: 'Supports people and institution strategy systems.',
    unlockConditionDescription: 'Requires specializations or mandates active',
    visibleWhen: (state) => state.prestigeCount >= 1,
    unlockWhen: (state) =>
      Object.values(state.traderSpecialists.seniorTrader).some((value) => value > 0)
      || Object.values(state.institutionMandates.propDesk).some((value) => value > 0)
      || Object.values(state.institutionMandates.institutionalDesk).some((value) => value > 0)
      || Object.values(state.institutionMandates.hedgeFund).some((value) => value > 0)
      || Object.values(state.institutionMandates.investmentFirm).some((value) => value > 0),
  },
  {
    id: 'analyticalModeling',
    name: 'Analytical Modeling',
    family: 'research',
    currency: 'researchPoints',
    maxRank: 100,
    perRankDescription: 'Market target and strategy effectiveness +0.5% per rank',
    baseCost: 500,
    costScaling: 1.1,
    effectPerRank: 0.005,
    description: 'Improves machine-side strategic fit.',
    unlockConditionDescription: 'Requires automation strategy systems active',
    visibleWhen: (state) => state.prestigeCount >= 1,
    unlockWhen: (state) =>
      state.purchasedResearchTech.meanReversionModels === true
      || state.purchasedResearchTech.momentumModels === true
      || state.purchasedResearchTech.arbitrageEngine === true
      || state.purchasedResearchTech.marketMakingEngine === true
      || state.purchasedResearchTech.scalpingFramework === true,
  },
  {
    id: 'executionStackTuning',
    name: 'Execution Stack Tuning',
    family: 'automation',
    currency: 'cash',
    maxRank: 100,
    perRankDescription: 'Automation cycle payout +0.75% per rank',
    baseCost: 80_000,
    costScaling: 1.12,
    effectPerRank: 0.0075,
    description: 'Broad machine-side scaling.',
    unlockConditionDescription: 'Requires automation active',
    visibleWhen: (state) => state.prestigeCount >= 1,
    unlockWhen: (state) => state.quantTraderCount + state.ruleBasedBotCount + state.mlTradingBotCount + state.aiTradingBotCount > 0,
  },
  {
    id: 'modelEfficiency',
    name: 'Model Efficiency',
    family: 'automation',
    currency: 'researchPoints',
    maxRank: 100,
    perRankDescription: 'Automation cycle duration -0.3% per rank',
    baseCost: 600,
    costScaling: 1.11,
    effectPerRank: 0.003,
    description: 'Smooth cycle-speed improvement.',
    unlockConditionDescription: 'Requires automation active',
    visibleWhen: (state) => state.prestigeCount >= 1,
    unlockWhen: (state) => state.quantTraderCount + state.ruleBasedBotCount + state.mlTradingBotCount + state.aiTradingBotCount > 0,
  },
  {
    id: 'computeOptimization',
    name: 'Compute Optimization',
    family: 'automation',
    currency: 'researchPoints',
    maxRank: 100,
    perRankDescription: 'Machine power usage -0.4% per rank',
    baseCost: 800,
    costScaling: 1.11,
    effectPerRank: 0.004,
    description: 'Improves automation sustainability.',
    unlockConditionDescription: 'Requires machine systems active',
    visibleWhen: (state) => state.prestigeCount >= 1,
    unlockWhen: (state) => state.ruleBasedBotCount + state.mlTradingBotCount + state.aiTradingBotCount > 0,
  },
  {
    id: 'signalQualityControl',
    name: 'Signal Quality Control',
    family: 'automation',
    currency: 'researchPoints',
    maxRank: 100,
    perRankDescription: 'Strategy effectiveness +0.5% per rank',
    baseCost: 700,
    costScaling: 1.1,
    effectPerRank: 0.005,
    description: 'Refines automation strategy performance.',
    unlockConditionDescription: 'Requires automation strategies unlocked',
    visibleWhen: (state) => state.prestigeCount >= 1,
    unlockWhen: (state) =>
      state.purchasedResearchTech.meanReversionModels === true
      || state.purchasedResearchTech.momentumModels === true
      || state.purchasedResearchTech.arbitrageEngine === true
      || state.purchasedResearchTech.marketMakingEngine === true
      || state.purchasedResearchTech.scalpingFramework === true,
  },
  {
    id: 'complianceSystems',
    name: 'Compliance Systems',
    family: 'governance',
    currency: 'influence',
    maxRank: 100,
    perRankDescription: 'Compliance burden contribution -0.5% per rank',
    baseCost: 8,
    costScaling: 1.12,
    effectPerRank: 0.005,
    description: 'Broad compliance pressure relief.',
    unlockConditionDescription: 'Requires compliance visible',
    visibleWhen: (state) => state.prestigeCount >= 1,
    unlockWhen: (state) => state.complianceVisible,
  },
  {
    id: 'filingEfficiency',
    name: 'Filing Efficiency',
    family: 'governance',
    currency: 'influence',
    maxRank: 100,
    perRankDescription: 'Compliance review costs -0.75% per rank',
    baseCost: 10,
    costScaling: 1.12,
    effectPerRank: 0.0075,
    description: 'Reduces timed compliance payments.',
    unlockConditionDescription: 'Requires compliance visible',
    visibleWhen: (state) => state.prestigeCount >= 1,
    unlockWhen: (state) => state.complianceVisible,
  },
  {
    id: 'policyReach',
    name: 'Policy Reach',
    family: 'governance',
    currency: 'influence',
    maxRank: 100,
    perRankDescription: 'Influence gain +0.5% per rank',
    baseCost: 12,
    costScaling: 1.13,
    effectPerRank: 0.005,
    description: 'Improves governance-side progression.',
    unlockConditionDescription: 'Requires lobbying active',
    visibleWhen: (state) => state.prestigeCount >= 1,
    unlockWhen: (state) => state.discoveredLobbying || state.purchasedResearchTech.regulatoryAffairs === true || state.juniorPoliticianCount > 0,
  },
  {
    id: 'institutionalAccess',
    name: 'Institutional Access',
    family: 'governance',
    currency: 'influence',
    maxRank: 100,
    perRankDescription: 'Institutional compliance costs and friction -0.5% per rank',
    baseCost: 14,
    costScaling: 1.13,
    effectPerRank: 0.005,
    description: 'Supports institution-heavy builds.',
    unlockConditionDescription: 'Requires institution systems active',
    visibleWhen: (state) => state.prestigeCount >= 1,
    unlockWhen: (state) => state.propDeskCount + state.institutionalDeskCount + state.hedgeFundCount + state.investmentFirmCount > 0,
  },
]

export function getRepeatableUpgradeDefinition(id: RepeatableUpgradeId): RepeatableUpgradeDefinition | undefined {
  return REPEATABLE_UPGRADES.find((upgrade) => upgrade.id === id)
}

export function getRepeatableUpgradeRank(state: GameState, id: RepeatableUpgradeId): number {
  return state.repeatableUpgradeRanks[id] ?? 0
}

export function isRepeatableUpgradeGloballyUnlocked(state: GameState): boolean {
  return state.prestigeCount >= 1
}

export function getTotalRepeatableUpgradeRanksPurchased(state: GameState): number {
  return REPEATABLE_UPGRADE_IDS.reduce((total, id) => total + getRepeatableUpgradeRank(state, id), 0)
}

export function getRepeatableUpgradeCost(baseCost: number, costScaling: number, currentRank: number): number {
  return Math.floor(baseCost * Math.pow(costScaling, currentRank))
}

export function getBulkRepeatableUpgradeCost(baseCost: number, costScaling: number, currentRank: number, quantity: number): { totalCost: number; quantity: number } {
  let totalCost = 0
  let purchased = 0

  while (purchased < quantity && currentRank + purchased < 100) {
    totalCost += getRepeatableUpgradeCost(baseCost, costScaling, currentRank + purchased)
    purchased += 1
  }

  return { totalCost, quantity: purchased }
}

export function getMaxAffordableRepeatableUpgradeQuantity(baseCost: number, costScaling: number, currentRank: number, availableCurrency: number): { totalCost: number; quantity: number } {
  let totalCost = 0
  let quantity = 0

  while (currentRank + quantity < 100) {
    const nextCost = getRepeatableUpgradeCost(baseCost, costScaling, currentRank + quantity)
    if (totalCost + nextCost > availableCurrency) break
    totalCost += nextCost
    quantity += 1
  }

  return { totalCost, quantity }
}

export function getRepeatableUpgradeMultiplier(state: GameState, id: RepeatableUpgradeId): number {
  const rank = getRepeatableUpgradeRank(state, id)
  const definition = getRepeatableUpgradeDefinition(id)
  if (!definition) return 1

  if (id === 'modelEfficiency' || id === 'computeOptimization' || id === 'complianceSystems' || id === 'filingEfficiency' || id === 'institutionalAccess') {
    return Math.max(id === 'filingEfficiency' ? 0.25 : 0.5, 1 - rank * definition.effectPerRank)
  }

  return 1 + rank * definition.effectPerRank
}
