import { GAME_CONSTANTS } from '../data/constants'
import { POWER_INFRASTRUCTURE } from '../data/powerInfrastructure'
import { getRepeatableUpgradeDefinition, getRepeatableUpgradeMultiplier, getRepeatableUpgradeRank } from '../data/repeatableUpgrades'
import { UNITS } from '../data/units'
import type { BuyMode, GameState, PowerInfrastructureId, RepeatableUpgradeId, UpgradeId, UnitId } from '../types/game'
import { getHumanStaffCostMultiplier, getMachineOutputPrestigeMultiplier, getPowerCapacityPrestigeMultiplier, getProfitPrestigeMultiplier, getResearchPrestigeMultiplier } from './prestige'

export function getScaledCost(baseCost: number, scaling: number, owned: number): number {
  return Math.floor(baseCost * Math.pow(scaling, owned))
}

function getRepeatableOutputMultiplier(state: GameState, upgradeIds: RepeatableUpgradeId[]): number {
  return upgradeIds.reduce((multiplier, upgradeId) => {
    const upgrade = getRepeatableUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return multiplier
    }

    return multiplier * getRepeatableUpgradeMultiplier(getRepeatableUpgradeRank(state, upgradeId), upgrade.effectPerRank)
  }, 1)
}

export function getHumanSystemsOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, [])
}

export function getInternOptimizationMultiplier(state: GameState): number {
  return getHumanSystemsOptimizationMultiplier(state) * getRepeatableOutputMultiplier(state, ['internDeskTraining', 'internPlaybooks'])
}

export function getManualTradeOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['manualTradeRefinement'])
}

export function getPoliticianOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['politicalNetworking', 'constituencyResearch'])
}

export function getJuniorTraderOptimizationMultiplier(state: GameState): number {
  return getHumanSystemsOptimizationMultiplier(state) * getRepeatableOutputMultiplier(state, ['juniorTraderTraining', 'behavioralModeling'])
}

export function getSeniorTraderOptimizationMultiplier(state: GameState): number {
  return getHumanSystemsOptimizationMultiplier(state) * getRepeatableOutputMultiplier(state, ['seniorDeskPerformance', 'decisionSystems'])
}

export function getPropDeskOptimizationMultiplier(state: GameState): number {
  return getHumanSystemsOptimizationMultiplier(state) * getRepeatableOutputMultiplier(state, ['propDeskScaling', 'propDeskResearch'])
}

export function getInstitutionalDeskOptimizationMultiplier(state: GameState): number {
  return getHumanSystemsOptimizationMultiplier(state) * getRepeatableOutputMultiplier(state, ['institutionalDeskCoordination', 'institutionalAnalytics'])
}

export function getHedgeFundOptimizationMultiplier(state: GameState): number {
  return getHumanSystemsOptimizationMultiplier(state) * getRepeatableOutputMultiplier(state, ['hedgeFundExecution', 'hedgeFundResearch'])
}

export function getInvestmentFirmOptimizationMultiplier(state: GameState): number {
  return getHumanSystemsOptimizationMultiplier(state) * getRepeatableOutputMultiplier(state, ['investmentFirmOperations', 'firmWideSystems'])
}

export function getRuleBasedBotOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['ruleBasedExecution', 'signalRefinement'])
}

export function getMlTradingBotOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['mlModelDeployment', 'mlFeaturePipelines'])
}

export function getAiTradingBotOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['aiClusterOrchestration', 'aiTrainingSystems'])
}

export function getJuniorScientistOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['juniorLabProtocols', 'juniorLabOptimization'])
}

export function getInternScientistOptimizationMultiplier(state: GameState): number {
  return getHumanSystemsOptimizationMultiplier(state) * getRepeatableOutputMultiplier(state, ['internLabTraining', 'internResearchNotes'])
}

export function getSeniorScientistOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['seniorLabMethods', 'seniorLabOptimization'])
}

export function getServerRoomCapacityMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['serverRoomExpansion'])
}

export function getDataCenterCapacityMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['dataCenterOverbuild'])
}

export function getServerRackCapacityMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['rackDensity'])
}

export function getCloudInfrastructureCapacityMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['cloudFailover'])
}

export function getEnergyOptimizationReduction(state: GameState): number {
  const rank = getRepeatableUpgradeRank(state, 'energyOptimization')
  const upgrade = getRepeatableUpgradeDefinition('energyOptimization')

  if (!upgrade || rank <= 0) {
    return 0
  }

  return Math.min(0.8, rank * upgrade.effectPerRank)
}

export function getServerEfficiencyReduction(state: GameState): number {
  const rank = getRepeatableUpgradeRank(state, 'serverEfficiency')
  const upgrade = getRepeatableUpgradeDefinition('serverEfficiency')

  if (!upgrade || rank <= 0) {
    return 0
  }

  return Math.min(0.8, rank * upgrade.effectPerRank)
}

function getCostReductionFromUpgrade(state: GameState, upgradeId: RepeatableUpgradeId): number {
  const rank = getRepeatableUpgradeRank(state, upgradeId)
  const upgrade = getRepeatableUpgradeDefinition(upgradeId)

  if (!upgrade || rank <= 0) {
    return 0
  }

  return Math.min(0.75, rank * upgrade.effectPerRank)
}

export function getGlobalMultiplier(state: GameState): number {
  let multiplier = 1

  if ((state.purchasedPrestigeUpgrades.tradeMultiplier ?? 0) > 0) {
    multiplier *= 1.25
  }

  if (state.purchasedPolicies.capitalGainsRelief) {
    multiplier *= 1.1
  }

  if (state.purchasedPolicies.marketDeregulation) {
    multiplier *= 1.15
  }

  return multiplier
}

export function getPrestigeMultiplier(state: GameState): number {
  return getProfitPrestigeMultiplier(state)
}

export function getManualIncome(state: GameState): number {
  let value: number = GAME_CONSTANTS.baseClickIncome

  if (state.purchasedUpgrades.betterTerminal) {
    value = 2
  }

  if (state.purchasedUpgrades.hotkeyMacros) {
    value += 2
  }

  if (state.purchasedUpgrades.premiumDataFeed) {
    value *= 1.5
  }

  if (state.purchasedUpgrades.marketScanner) {
    value *= 1.1
  }

  if (state.purchasedPolicies.extendedTradingWindow) {
    value *= 1.25
  }

  return value * getManualTradeOptimizationMultiplier(state) * getGlobalMultiplier(state) * getPrestigeMultiplier(state)
}

export function getInternIncome(state: GameState): number {
  let value = UNITS.intern.baseIncomePerSecond

  if (state.purchasedUpgrades.deskUpgrade) {
    value = 0.6
  }

  if (state.purchasedUpgrades.trainingProgram) {
    value += 0.4
  }

  if (state.purchasedUpgrades.internCohort) {
    value += 0.6
  }

  if (state.purchasedUpgrades.marketScanner) {
    value *= 1.1
  }

  if (state.purchasedUpgrades.premiumDataFeed) {
    value *= 1.2
  }

  if (state.purchasedUpgrades.firmwideDeskStandards) {
    value *= 1.15
  }

  return value * getInternOptimizationMultiplier(state)
}

export function getJuniorTraderIncome(state: GameState): number {
  let value: number = UNITS.juniorTrader.baseIncomePerSecond

  if (state.purchasedUpgrades.marketScanner) {
    value *= 1.1
  }

  if (state.purchasedUpgrades.premiumDataFeed) {
    value *= 1.2
  }

  if (state.purchasedUpgrades.juniorAnalystProgram) {
    value *= 1.25
  }

  if (state.purchasedUpgrades.firmwideDeskStandards) {
    value *= 1.15
  }

  return value * getJuniorTraderOptimizationMultiplier(state)
}

export function getSeniorTraderIncome(state: GameState): number {
  let value = state.purchasedUpgrades.executiveTraining ? 30 : UNITS.seniorTrader.baseIncomePerSecond

  if (state.purchasedPolicies.executiveCompensationReform) {
    value *= 1.15
  }

  if (state.purchasedUpgrades.premiumDataFeed) {
    value *= 1.1
  }

  if (state.purchasedUpgrades.marketScanner) {
    value *= 1.1
  }

  if (state.purchasedUpgrades.firmwideDeskStandards) {
    value *= 1.15
  }

  return value * getSeniorTraderOptimizationMultiplier(state)
}

export function getRuleBasedBotIncome(state: GameState): number {
  let value = state.purchasedUpgrades.lowLatencyServers ? 65 : UNITS.ruleBasedBot.baseIncomePerSecond

  if (state.purchasedUpgrades.systematicExecution) {
    value *= 1.15
  }

  if (state.purchasedUpgrades.botTelemetry) {
    value *= 1.2
  }

  return value * getRuleBasedBotOptimizationMultiplier(state) * getMachineOutputPrestigeMultiplier(state)
}

export function getPropDeskIncome(state: GameState): number {
  let value = UNITS.propDesk.baseIncomePerSecond

  if (state.purchasedUpgrades.propDeskMandates) {
    value *= 1.25
  }

  return value * getPropDeskOptimizationMultiplier(state)
}

export function getInstitutionalDeskIncome(state: GameState): number {
  let value = UNITS.institutionalDesk.baseIncomePerSecond

  if (state.purchasedUpgrades.institutionalRelationships) {
    value *= 1.3
  }

  return value * getInstitutionalDeskOptimizationMultiplier(state)
}

export function getHedgeFundIncome(state: GameState): number {
  let value = UNITS.hedgeFund.baseIncomePerSecond

  if (state.purchasedUpgrades.fundOfFundsNetwork) {
    value *= 1.3
  }

  return value * getHedgeFundOptimizationMultiplier(state)
}

export function getInvestmentFirmIncome(state: GameState): number {
  let value = UNITS.investmentFirm.baseIncomePerSecond

  if (state.purchasedUpgrades.globalDistribution) {
    value *= 1.35
  }

  return value * getInvestmentFirmOptimizationMultiplier(state)
}

export function getMlTradingBotIncome(state: GameState): number {
  let value = UNITS.mlTradingBot.baseIncomePerSecond

  if (state.purchasedUpgrades.executionCluster) {
    value *= 1.4
  }

  if (state.purchasedUpgrades.modelOpsPipeline) {
    value *= 1.25
  }

  if (state.purchasedPolicies.fastTrackServerPermits) {
    value *= 1.15
  }

  return value * getMlTradingBotOptimizationMultiplier(state) * getMachineOutputPrestigeMultiplier(state)
}

export function getAiTradingBotIncome(state: GameState): number {
  let value = UNITS.aiTradingBot.baseIncomePerSecond

  if (state.purchasedUpgrades.aiRiskStack) {
    value *= 1.35
  }

  if (state.purchasedPolicies.fastTrackServerPermits) {
    value *= 1.15
  }

  return value * getAiTradingBotOptimizationMultiplier(state) * getMachineOutputPrestigeMultiplier(state)
}

export function getRuleBasedBotPowerUsage(state: GameState): number {
  let perBotUsage = GAME_CONSTANTS.ruleBasedBotPowerUsage

  if (state.purchasedPolicies.dataCenterEnergyCredits) {
    perBotUsage *= 0.8
  }

  if (state.purchasedUpgrades.coolingSystems) {
    perBotUsage *= 0.9
  }

  perBotUsage *= 1 - getEnergyOptimizationReduction(state)

  return state.ruleBasedBotCount * perBotUsage
}

export function getHumanTradingPowerUsage(state: GameState): number {
  return state.internCount * GAME_CONSTANTS.internPowerUsage
    + state.juniorTraderCount * GAME_CONSTANTS.juniorTraderPowerUsage
    + state.seniorTraderCount * GAME_CONSTANTS.seniorTraderPowerUsage
    + state.propDeskCount * GAME_CONSTANTS.propDeskPowerUsage
    + state.institutionalDeskCount * GAME_CONSTANTS.institutionalDeskPowerUsage
    + state.hedgeFundCount * GAME_CONSTANTS.hedgeFundPowerUsage
    + state.investmentFirmCount * GAME_CONSTANTS.investmentFirmPowerUsage
}

export function getUnitPowerUsagePerPurchase(state: GameState, unitId: UnitId): number {
  if (unitId === 'intern') return GAME_CONSTANTS.internPowerUsage
  if (unitId === 'juniorTrader') return GAME_CONSTANTS.juniorTraderPowerUsage
  if (unitId === 'seniorTrader') return GAME_CONSTANTS.seniorTraderPowerUsage
  if (unitId === 'propDesk') return GAME_CONSTANTS.propDeskPowerUsage
  if (unitId === 'institutionalDesk') return GAME_CONSTANTS.institutionalDeskPowerUsage
  if (unitId === 'hedgeFund') return GAME_CONSTANTS.hedgeFundPowerUsage
  if (unitId === 'investmentFirm') return GAME_CONSTANTS.investmentFirmPowerUsage
  if (unitId === 'internResearchScientist') return GAME_CONSTANTS.internScientistPowerUsage
  if (unitId === 'juniorResearchScientist') return GAME_CONSTANTS.juniorScientistPowerUsage
  if (unitId === 'seniorResearchScientist') return GAME_CONSTANTS.seniorScientistPowerUsage
  if (unitId === 'ruleBasedBot') {
    let usage = GAME_CONSTANTS.ruleBasedBotPowerUsage
    if (state.purchasedPolicies.dataCenterEnergyCredits) usage *= 0.8
    if (state.purchasedUpgrades.coolingSystems) usage *= 0.9
    usage *= 1 - getEnergyOptimizationReduction(state)
    return usage
  }
  if (unitId === 'mlTradingBot') {
    let usage = GAME_CONSTANTS.mlTradingBotPowerUsage
    if (state.purchasedPolicies.dataCenterEnergyCredits) usage *= 0.8
    if (state.purchasedUpgrades.coolingSystems) usage *= 0.9
    usage *= 1 - getEnergyOptimizationReduction(state)
    return usage
  }
  if (unitId === 'aiTradingBot') {
    let usage = state.purchasedUpgrades.coolingSystems ? GAME_CONSTANTS.aiTradingBotPowerUsage * 0.9 : GAME_CONSTANTS.aiTradingBotPowerUsage
    usage *= 1 - getServerEfficiencyReduction(state)
    return usage
  }
  return 0
}

export function getResearchStaffPowerUsage(state: GameState): number {
  return state.internResearchScientistCount * GAME_CONSTANTS.internScientistPowerUsage
    + state.juniorResearchScientistCount * GAME_CONSTANTS.juniorScientistPowerUsage
    + state.seniorResearchScientistCount * GAME_CONSTANTS.seniorScientistPowerUsage
}

export function getMlTradingBotPowerUsage(state: GameState): number {
  let perBotUsage = GAME_CONSTANTS.mlTradingBotPowerUsage

  if (state.purchasedPolicies.dataCenterEnergyCredits) {
    perBotUsage *= 0.8
  }

  if (state.purchasedUpgrades.coolingSystems) {
    perBotUsage *= 0.9
  }

  perBotUsage *= 1 - getEnergyOptimizationReduction(state)

  return state.mlTradingBotCount * perBotUsage
}

export function getAiTradingBotPowerUsage(state: GameState): number {
  let perBotUsage = state.purchasedUpgrades.coolingSystems
    ? GAME_CONSTANTS.aiTradingBotPowerUsage * 0.9
    : GAME_CONSTANTS.aiTradingBotPowerUsage

  perBotUsage *= 1 - getServerEfficiencyReduction(state)

  return state.aiTradingBotCount * perBotUsage
}

export function getPowerCapacity(state: GameState): number {
  const rackCapacity = state.serverRackCount * GAME_CONSTANTS.serverRackPowerCapacity * getServerRackCapacityMultiplier(state) * (state.purchasedUpgrades.rackStacking ? 1.25 : 1)
  const roomCapacity = state.serverRoomCount * GAME_CONSTANTS.serverRoomPowerCapacity * getServerRoomCapacityMultiplier(state) * (state.purchasedUpgrades.roomScaleout ? 1.25 : 1)
  const dataCenterCapacity = state.dataCenterCount * GAME_CONSTANTS.dataCenterPowerCapacity * getDataCenterCapacityMultiplier(state) * (state.purchasedUpgrades.dataCenterFabric ? 1.3 : 1)
  const cloudCapacity = state.cloudComputeCount * GAME_CONSTANTS.cloudComputePowerCapacity * getCloudInfrastructureCapacityMultiplier(state) * (state.purchasedUpgrades.cloudBurstContracts ? 1.35 : 1)

  let capacity = rackCapacity + roomCapacity + dataCenterCapacity + cloudCapacity

  if (state.purchasedPolicies.priorityGridAccess) {
    capacity *= 1.15
  }

  if (state.purchasedUpgrades.powerDistribution) {
    capacity *= 1.2
  }

  return capacity * getPowerCapacityPrestigeMultiplier(state)
}

export function getPowerUsage(state: GameState): number {
  return getHumanTradingPowerUsage(state) + getResearchStaffPowerUsage(state) + getRuleBasedBotPowerUsage(state) + getMlTradingBotPowerUsage(state) + getAiTradingBotPowerUsage(state)
}

export function getMachineEfficiencyMultiplier(state: GameState): number {
  const usage = getPowerUsage(state)
  const capacity = getPowerCapacity(state)

  if (usage <= 0) {
    return 1
  }

  if (usage <= capacity) {
    return 1
  }

  if (capacity <= 0) {
    return 0
  }

  let efficiency = capacity / usage

  if (state.purchasedPolicies.aiInfrastructureIncentives) {
    efficiency *= 1.1
  }

  return Math.min(1, efficiency)
}

export function getResearchComputerScientistCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'juniorResearchScientist', state.juniorResearchScientistCount)
}

export function getInternResearchScientistCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'internResearchScientist', state.internResearchScientistCount)
}

export function getJuniorResearchScientistCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'juniorResearchScientist', state.juniorResearchScientistCount)
}

export function getSeniorResearchScientistCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'seniorResearchScientist', state.seniorResearchScientistCount)
}

function getDiscountedUnitCostAtOwned(state: GameState, unitId: UnitId, owned: number): number {
  const unit = UNITS[unitId]
  let discount = 1
  const humanTradingReduction = getCostReductionFromUpgrade(state, 'talentHeadhunters')
  const researchStaffReduction = getCostReductionFromUpgrade(state, 'researchEndowments')
  const politicalStaffReduction = getCostReductionFromUpgrade(state, 'patronageMachine')
  const machineReduction = getCostReductionFromUpgrade(state, 'automationSubsidies')

  if (unitId === 'intern' || unitId === 'juniorTrader') {
    const policyDiscount = state.purchasedPolicies.hiringIncentives ? 0.1 : 0
    discount *= getHumanStaffCostMultiplier(state)
    discount -= policyDiscount
    discount -= humanTradingReduction
  }

  if (unitId === 'seniorTrader' || unitId === 'propDesk' || unitId === 'institutionalDesk' || unitId === 'hedgeFund' || unitId === 'investmentFirm') {
    discount *= getHumanStaffCostMultiplier(state)
    discount -= humanTradingReduction

    if ((unitId === 'seniorTrader' || unitId === 'propDesk') && state.purchasedPolicies.deskExpansionCredits) {
      discount -= 0.1
    }
  }

  if (unitId === 'internResearchScientist' || unitId === 'juniorResearchScientist' || unitId === 'seniorResearchScientist') {
    discount *= getHumanStaffCostMultiplier(state)
    discount -= researchStaffReduction
  }

  if (unitId === 'juniorPolitician') {
    discount *= getHumanStaffCostMultiplier(state)
    discount -= politicalStaffReduction
  }

  if ((unitId === 'ruleBasedBot' || unitId === 'mlTradingBot' || unitId === 'aiTradingBot') && state.purchasedPolicies.automationTaxCredit) {
    discount -= 0.1
  }

  if (unitId === 'ruleBasedBot' || unitId === 'mlTradingBot' || unitId === 'aiTradingBot') {
    discount -= machineReduction
  }

  return Math.max(1, Math.floor(getScaledCost(unit.baseCost, unit.costScaling, owned) * discount))
}

export function getResearchPointsPerSecond(state: GameState): number {
  const infrastructureEfficiency = getMachineEfficiencyMultiplier(state)
  const internOutput = state.internResearchScientistCount * (UNITS.internResearchScientist.baseResearchPointsPerSecond ?? 0) * getInternScientistOptimizationMultiplier(state)
  const juniorOutput = state.juniorResearchScientistCount * (UNITS.juniorResearchScientist.baseResearchPointsPerSecond ?? 0) * getJuniorScientistOptimizationMultiplier(state)
  const seniorOutput = state.seniorResearchScientistCount * (UNITS.seniorResearchScientist.baseResearchPointsPerSecond ?? 0) * getSeniorScientistOptimizationMultiplier(state)
  const boostedInternOutput = state.purchasedUpgrades.labAutomation ? internOutput * 1.25 : internOutput
  const boostedJuniorOutput = state.purchasedUpgrades.labAutomation ? juniorOutput * 1.25 : juniorOutput
  const boostedSeniorOutput = state.purchasedUpgrades.researchGrants ? seniorOutput * 1.35 : seniorOutput
  return (boostedInternOutput + boostedJuniorOutput + boostedSeniorOutput) * getResearchPrestigeMultiplier(state) * infrastructureEfficiency
}

export function getInfluencePerSecond(state: GameState): number {
  if (state.purchasedResearchTech.regulatoryAffairs !== true) {
    return 0
  }

  const baseOutput = state.juniorPoliticianCount * (UNITS.juniorPolitician.baseInfluencePerSecond ?? 0) * getPoliticianOptimizationMultiplier(state)
  const infrastructureEfficiency = getMachineEfficiencyMultiplier(state)

  let value = baseOutput

  if (state.purchasedUpgrades.policyAnalysisDesk) {
    value *= 1.5
  }

  if (state.purchasedUpgrades.donorRoundtables) {
    value *= 1.4
  }

  return value * infrastructureEfficiency
}

export function getIncomeBreakdown(state: GameState) {
  const infrastructureEfficiency = getMachineEfficiencyMultiplier(state)

  return {
    internIncome: state.internCount * getInternIncome(state) * infrastructureEfficiency,
    juniorIncome: state.juniorTraderCount * getJuniorTraderIncome(state) * infrastructureEfficiency,
    seniorIncome: state.seniorTraderCount * getSeniorTraderIncome(state) * infrastructureEfficiency,
    propDeskIncome: state.propDeskCount * getPropDeskIncome(state) * infrastructureEfficiency,
    institutionalDeskIncome: state.institutionalDeskCount * getInstitutionalDeskIncome(state) * infrastructureEfficiency,
    hedgeFundIncome: state.hedgeFundCount * getHedgeFundIncome(state) * infrastructureEfficiency,
    investmentFirmIncome: state.investmentFirmCount * getInvestmentFirmIncome(state) * infrastructureEfficiency,
    ruleBasedBotIncome: state.ruleBasedBotCount * getRuleBasedBotIncome(state) * infrastructureEfficiency,
    mlTradingBotIncome: state.mlTradingBotCount * getMlTradingBotIncome(state) * infrastructureEfficiency,
    aiTradingBotIncome: state.aiTradingBotCount * getAiTradingBotIncome(state) * infrastructureEfficiency,
  }
}

export function getCashPerSecond(state: GameState): number {
  const { internIncome, juniorIncome, seniorIncome, propDeskIncome, institutionalDeskIncome, hedgeFundIncome, investmentFirmIncome, ruleBasedBotIncome, mlTradingBotIncome, aiTradingBotIncome } = getIncomeBreakdown(state)
  const basePassiveIncome = internIncome + juniorIncome + seniorIncome + propDeskIncome + institutionalDeskIncome + hedgeFundIncome + investmentFirmIncome + ruleBasedBotIncome + mlTradingBotIncome + aiTradingBotIncome

  return basePassiveIncome * getGlobalMultiplier(state) * getPrestigeMultiplier(state)
}

export function getJuniorTraderCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'juniorTrader', state.juniorTraderCount)
}

export function getInternCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'intern', state.internCount)
}

export function isUnitUnlocked(state: GameState, unitId: UnitId): boolean {
  if (unitId === 'juniorTrader') {
    return state.purchasedUpgrades.juniorTraderProgram === true
  }

  if (unitId === 'internResearchScientist') {
    return state.purchasedUpgrades.juniorHiringProgram === true
  }

  if (unitId === 'juniorResearchScientist') {
    return state.purchasedResearchTech.juniorScientists === true
  }

  if (unitId === 'seniorResearchScientist') {
    return state.purchasedResearchTech.seniorScientists === true
  }

  if (unitId === 'juniorPolitician') {
    return state.purchasedResearchTech.regulatoryAffairs === true
  }

  if (unitId === 'propDesk') {
    return state.purchasedResearchTech.propDeskOperations === true
  }

  if (unitId === 'institutionalDesk') {
    return state.purchasedResearchTech.institutionalDesks === true && state.serverRoomCount > 0
  }

  if (unitId === 'hedgeFund') {
    return state.purchasedResearchTech.hedgeFundStrategies === true && state.dataCenterCount > 0
  }

  if (unitId === 'investmentFirm') {
    return state.purchasedResearchTech.investmentFirms === true && state.cloudComputeCount > 0
  }

  if (unitId === 'ruleBasedBot') {
    return state.purchasedResearchTech.algorithmicTrading === true
  }

  if (unitId === 'mlTradingBot') {
    return state.purchasedResearchTech.dataCenterSystems === true && (state.dataCenterCount > 0 || state.cloudComputeCount > 0)
  }

  if (unitId === 'aiTradingBot') {
    return state.purchasedResearchTech.aiTradingSystems === true && (state.dataCenterCount > 0 || state.cloudComputeCount > 0)
  }

  return state.purchasedUpgrades[UNITS[unitId].unlockUpgradeId as UpgradeId] === true
}

export function getUnitCount(state: GameState, unitId: UnitId): number {
  switch (unitId) {
    case 'intern':
      return state.internCount
    case 'juniorTrader':
      return state.juniorTraderCount
    case 'seniorTrader':
      return state.seniorTraderCount
    case 'propDesk':
      return state.propDeskCount
    case 'institutionalDesk':
      return state.institutionalDeskCount
    case 'hedgeFund':
      return state.hedgeFundCount
    case 'investmentFirm':
      return state.investmentFirmCount
    case 'ruleBasedBot':
      return state.ruleBasedBotCount
    case 'mlTradingBot':
      return state.mlTradingBotCount
    case 'aiTradingBot':
      return state.aiTradingBotCount
    case 'internResearchScientist':
      return state.internResearchScientistCount
    case 'juniorResearchScientist':
      return state.juniorResearchScientistCount
    case 'seniorResearchScientist':
      return state.seniorResearchScientistCount
    case 'juniorPolitician':
      return state.juniorPoliticianCount
  }
}

export function getNextUnitCost(state: GameState, unitId: UnitId): number {
  return getDiscountedUnitCostAtOwned(state, unitId, getUnitCount(state, unitId))
}

export function getBulkUnitCost(state: GameState, unitId: UnitId, quantity: BuyMode): { quantity: number; totalCost: number } {
  if (!isUnitUnlocked(state, unitId)) {
    return { quantity: 0, totalCost: 0 }
  }

  const owned = getUnitCount(state, unitId)
  const powerCapacity = getPowerCapacity(state)
  const currentPowerUsage = getPowerUsage(state)
  const powerPerUnit = getUnitPowerUsagePerPurchase(state, unitId)

  if (quantity === 'max') {
    let totalCost = 0
    let bought = 0
    let simulatedOwned = owned

    while (true) {
      const nextCost = getDiscountedUnitCostAtOwned(state, unitId, simulatedOwned)

      if (totalCost + nextCost > state.cash) {
        break
      }

      if (currentPowerUsage + powerPerUnit * (bought + 1) > powerCapacity) {
        break
      }

      totalCost += nextCost
      simulatedOwned += 1
      bought += 1
    }

    return { quantity: bought, totalCost }
  }

  let totalCost = 0

  for (let i = 0; i < quantity; i += 1) {
    if (currentPowerUsage + powerPerUnit * (i + 1) > powerCapacity) {
      return { quantity: 0, totalCost: 0 }
    }

    totalCost += getDiscountedUnitCostAtOwned(state, unitId, owned + i)
  }

  return { quantity, totalCost }
}

export function getSeniorTraderCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'seniorTrader', state.seniorTraderCount)
}

export function getRuleBasedBotCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'ruleBasedBot', state.ruleBasedBotCount)
}

export function getMlTradingBotCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'mlTradingBot', state.mlTradingBotCount)
}

export function getAiTradingBotCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'aiTradingBot', state.aiTradingBotCount)
}

export function isPowerInfrastructureUnlocked(_state: GameState): boolean {
  return true
}

export function isPowerInfrastructureVisible(state: GameState, infrastructureId: PowerInfrastructureId): boolean {
  if (infrastructureId === 'serverRack') {
    return true
  }

  if (infrastructureId === 'serverRoom') {
    return state.purchasedResearchTech.powerSystemsEngineering === true
  }

  if (infrastructureId === 'dataCenter') {
    return state.purchasedResearchTech.dataCenterSystems === true
  }

  return state.purchasedResearchTech.aiTradingSystems === true
}

export function getPowerInfrastructureCount(state: GameState, infrastructureId: PowerInfrastructureId): number {
  switch (infrastructureId) {
    case 'serverRack':
      return state.serverRackCount
    case 'serverRoom':
      return state.serverRoomCount
    case 'dataCenter':
      return state.dataCenterCount
    case 'cloudCompute':
      return state.cloudComputeCount
  }
}

export function getNextPowerInfrastructureCost(state: GameState, infrastructureId: PowerInfrastructureId): number {
  const definition = POWER_INFRASTRUCTURE[infrastructureId]
  const subsidyDiscount = state.purchasedPolicies.industrialPowerSubsidies ? 0.1 : 0
  const infrastructureReduction = getCostReductionFromUpgrade(state, 'infrastructureGrants')
  return Math.max(1, Math.floor(getScaledCost(definition.baseCost, definition.costScaling, getPowerInfrastructureCount(state, infrastructureId)) * (1 - subsidyDiscount - infrastructureReduction)))
}

export function getBulkPowerInfrastructureCost(state: GameState, infrastructureId: PowerInfrastructureId, quantity: BuyMode): { quantity: number; totalCost: number } {
  if (!isPowerInfrastructureVisible(state, infrastructureId)) {
    return { quantity: 0, totalCost: 0 }
  }

  const definition = POWER_INFRASTRUCTURE[infrastructureId]
  const owned = getPowerInfrastructureCount(state, infrastructureId)

  if (quantity === 'max') {
    let totalCost = 0
    let bought = 0
    let simulatedOwned = owned

    while (true) {
      const subsidyDiscount = state.purchasedPolicies.industrialPowerSubsidies ? 0.1 : 0
      const infrastructureReduction = getCostReductionFromUpgrade(state, 'infrastructureGrants')
      const nextCost = Math.max(1, Math.floor(getScaledCost(definition.baseCost, definition.costScaling, simulatedOwned) * (1 - subsidyDiscount - infrastructureReduction)))

      if (totalCost + nextCost > state.cash) {
        break
      }

      totalCost += nextCost
      simulatedOwned += 1
      bought += 1
    }

    return { quantity: bought, totalCost }
  }

  let totalCost = 0

  for (let i = 0; i < quantity; i += 1) {
    const subsidyDiscount = state.purchasedPolicies.industrialPowerSubsidies ? 0.1 : 0
    const infrastructureReduction = getCostReductionFromUpgrade(state, 'infrastructureGrants')
    totalCost += Math.max(1, Math.floor(getScaledCost(definition.baseCost, definition.costScaling, owned + i) * (1 - subsidyDiscount - infrastructureReduction)))
  }

  return { quantity, totalCost }
}

export function canAfford(state: GameState, amount: number): boolean {
  return state.cash >= amount
}
