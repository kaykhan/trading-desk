import { POWER_INFRASTRUCTURE } from '../data/powerInfrastructure'
import { getRepeatableUpgradeMultiplier } from '../data/repeatableUpgrades'
import { getSectorDefinition, SECTOR_IDS } from '../data/sectors'
import { UNITS } from '../data/units'
import { isPowerInfrastructureDefinitionVisible, isUnitDefinitionUnlocked, mechanics } from '../lib/mechanics'
import type { BuyMode, GameState, GenericSectorAssignableUnitId, HumanAssignableUnitId, PowerInfrastructureId, RepeatableUpgradeId, SectorId, UpgradeId, UnitId } from '../types/game'
import { getAvailableDeskSlots, canBuyHumanUnit, getCapacityPowerUsage } from './capacity'
import { getGlobalEnergySupplyBoostMultiplier, getGlobalInfluenceBoostMultiplier, getGlobalProfitBoostMultiplier, getTimedHumanOutputBoostMultiplier, getTimedProfitBoostMultiplier, getTimedResearchBoostMultiplier, getTimedSectorOutputBoostMultiplier } from './boosts'
import { getComplianceEfficiencyMultiplier, getEnergyCompliancePenaltyMultiplier, getHumanCompliancePenaltyMultiplier, getInstitutionalCompliancePenaltyMultiplier } from './compliance'
import { getDeskEfficiencyMultiplier, getGlobalRecognitionMultiplier, getHumanStaffCostMultiplier, getMarketReputationMultiplier, getPolicyCapitalMultiplier, getPowerCapacityPrestigeMultiplier, getResearchPrestigeMultiplier } from './prestige'
import { isLobbyingUnlocked, isPowerInfrastructureUnlocked as hasPowerInfrastructureResearch } from './research'
import { getAssignedTraderSpecialistsForSector, getGenericTraderCount, getTraderSpecialistSectorBonus } from './specialization'
import { getAssignedInstitutionMandatesForSector, getGenericInstitutionCount, getInstitutionMandateBonus } from './mandates'
import { getGlobalEventMultiplier, getMachineEfficiencyEventModifier, getSectorEventMultiplier } from './marketEvents'

function isDeskLimitedUnit(unitId: UnitId): boolean {
  return unitId === 'intern'
    || unitId === 'juniorTrader'
    || unitId === 'seniorTrader'
    || unitId === 'internResearchScientist'
    || unitId === 'juniorResearchScientist'
    || unitId === 'seniorResearchScientist'
}

const ECONOMY_CONSTANTS = mechanics.constants
const UPGRADE_MULTIPLIERS = mechanics.multipliers.upgrades
const POLICY_MULTIPLIERS = mechanics.multipliers.policies

function hasHumanStaffDiscount(unitId: UnitId): boolean {
  return mechanics.units[unitId].costModel === 'unitExponentialWithHumanDiscount'
}

function getUpgradeMultiplier(state: GameState, purchasedKey: UpgradeId, multiplierKey: keyof typeof mechanics.multipliers.upgrades): number {
  return state.purchasedUpgrades[purchasedKey] ? Number(UPGRADE_MULTIPLIERS[multiplierKey]) : 1
}

function getPolicyMultiplier(state: GameState, purchasedKey: keyof GameState['purchasedPolicies'], multiplierKey: keyof typeof mechanics.multipliers.policies): number {
  return state.purchasedPolicies[purchasedKey] ? Number(POLICY_MULTIPLIERS[multiplierKey]) : 1
}

function getInfrastructureUpgradeCapacityMultiplier(state: GameState, upgradeId: UpgradeId, multiplierKey: keyof typeof mechanics.multipliers.upgrades): number {
  return state.purchasedUpgrades[upgradeId] ? Number(UPGRADE_MULTIPLIERS[multiplierKey]) : 1
}

function getBotPowerUsageMultiplier(state: GameState, includeEnergyCredits: boolean): number {
  let multiplier = 1

  if (includeEnergyCredits) {
    multiplier *= getPolicyMultiplier(state, 'dataCenterEnergyCredits', 'dataCenterEnergyCreditsBotPowerUsage')
  }

  multiplier *= getUpgradeMultiplier(state, 'coolingSystems', 'coolingSystemsPowerUsage')
  return multiplier
}

function getAutomationUnitDefinition(unitId: Extract<UnitId, 'ruleBasedBot' | 'mlTradingBot' | 'aiTradingBot'>) {
  return mechanics.units[unitId]
}

export function getScaledCost(baseCost: number, scaling: number, owned: number): number {
  return Math.floor(baseCost * Math.pow(scaling, owned))
}

function getRepeatableOutputMultiplier(state: GameState, upgradeIds: RepeatableUpgradeId[]): number {
  return upgradeIds.reduce((multiplier, upgradeId) => multiplier * getRepeatableUpgradeMultiplier(state, upgradeId), 1)
}

export function getHumanSystemsOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['humanDeskTuning'])
}

export function getManualTradeOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['manualExecutionRefinement'])
}

export function getPoliticianOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['policyReach'])
}

export function getSectorAllocationOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['sectorAllocationEfficiency'])
}

export function getInternOptimizationMultiplier(state: GameState): number {
  return getHumanSystemsOptimizationMultiplier(state)
}

export function getJuniorTraderOptimizationMultiplier(state: GameState): number {
  return getHumanSystemsOptimizationMultiplier(state)
}

export function getSeniorTraderOptimizationMultiplier(state: GameState): number {
  return getHumanSystemsOptimizationMultiplier(state)
}

export function getPropDeskOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['institutionalProcessRefinement'])
}

export function getInstitutionalDeskOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['institutionalProcessRefinement'])
}

export function getHedgeFundOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['institutionalProcessRefinement'])
}

export function getInvestmentFirmOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['institutionalProcessRefinement'])
}

export function getRuleBasedBotOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['executionStackTuning'])
}

export function getMlTradingBotOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['executionStackTuning'])
}

export function getAiTradingBotOptimizationMultiplier(state: GameState): number {
  return getRepeatableOutputMultiplier(state, ['executionStackTuning'])
}

export function getJuniorScientistOptimizationMultiplier(state: GameState): number {
  return 1
}

export function getInternScientistOptimizationMultiplier(state: GameState): number {
  return 1
}

export function getSeniorScientistOptimizationMultiplier(state: GameState): number {
  return 1
}

export function getServerRoomCapacityMultiplier(state: GameState): number {
  return 1
}

export function getDataCenterCapacityMultiplier(state: GameState): number {
  return 1
}

export function getServerRackCapacityMultiplier(state: GameState): number {
  return 1
}

export function getCloudInfrastructureCapacityMultiplier(state: GameState): number {
  return 1
}

export function getEnergyOptimizationReduction(state: GameState): number {
  return Math.max(0, 1 - getRepeatableUpgradeMultiplier(state, 'computeOptimization'))
}

export function getServerEfficiencyReduction(state: GameState): number {
  return getEnergyOptimizationReduction(state)
}

export function getGlobalMultiplier(state: GameState): number {
  let multiplier = 1
  multiplier *= getGlobalProfitBoostMultiplier(state)
  multiplier *= getTimedProfitBoostMultiplier(state)
  return multiplier
}

export function getPrestigeMultiplier(state: GameState): number {
  return getGlobalRecognitionMultiplier(state)
}

export function getManualIncome(state: GameState): number {
  let value: number = Number(ECONOMY_CONSTANTS.baseClickIncome)

  if (state.purchasedUpgrades.betterTerminal) {
    value = Number(UPGRADE_MULTIPLIERS.betterTerminalBaseClickIncome)
  }

  if (state.purchasedUpgrades.premiumDataFeed) {
    value *= Number(UPGRADE_MULTIPLIERS.premiumDataFeedManual)
  }

  if (state.purchasedUpgrades.tradeShortcuts) {
    value += Number(UPGRADE_MULTIPLIERS.tradeShortcutsManualFlat)
  }

  if (state.purchasedUpgrades.premiumDataFeed) {
    value *= Number(UPGRADE_MULTIPLIERS.premiumDataFeedManual)
  }

  return value * getManualTradeOptimizationMultiplier(state) * getGlobalMultiplier(state) * getPrestigeMultiplier(state)
}

export function getInternIncome(state: GameState): number {
  let value = UNITS.intern.baseIncomePerSecond

  if (state.purchasedUpgrades.premiumDataFeed) {
    value *= Number(UPGRADE_MULTIPLIERS.premiumDataFeedHuman)
  }

  if (state.purchasedUpgrades.deskAnalytics) {
    value *= Number(UPGRADE_MULTIPLIERS.deskAnalyticsHuman)
  }

  if (state.purchasedUpgrades.crossDeskCoordination) {
    value *= Number(UPGRADE_MULTIPLIERS.crossDeskCoordinationHuman)
  }

  if (state.purchasedUpgrades.structuredOnboarding) {
    value *= Number(UPGRADE_MULTIPLIERS.structuredOnboardingHuman)
  }

  return value * getInternOptimizationMultiplier(state) * getDeskEfficiencyMultiplier(state)
}

export function getJuniorTraderIncome(state: GameState): number {
  let value: number = UNITS.juniorTrader.baseIncomePerSecond

  if (state.purchasedUpgrades.premiumDataFeed) {
    value *= Number(UPGRADE_MULTIPLIERS.premiumDataFeedHuman)
  }

  if (state.purchasedUpgrades.deskAnalytics) {
    value *= Number(UPGRADE_MULTIPLIERS.deskAnalyticsHuman)
  }

  if (state.purchasedUpgrades.crossDeskCoordination) {
    value *= Number(UPGRADE_MULTIPLIERS.crossDeskCoordinationHuman)
  }

  if (state.purchasedUpgrades.structuredOnboarding) {
    value *= Number(UPGRADE_MULTIPLIERS.structuredOnboardingHuman)
  }

  return value * getJuniorTraderOptimizationMultiplier(state) * getDeskEfficiencyMultiplier(state)
}

export function getSeniorTraderIncome(state: GameState): number {
  let value = UNITS.seniorTrader.baseIncomePerSecond

  if (state.purchasedPolicies.executiveCompensationReform) {
    value *= Number(UPGRADE_MULTIPLIERS.executiveCompensationReformSeniorTrader)
  }

  if (state.purchasedUpgrades.premiumDataFeed) {
    value *= Number(UPGRADE_MULTIPLIERS.premiumDataFeedHuman)
  }

  if (state.purchasedUpgrades.deskAnalytics) {
    value *= Number(UPGRADE_MULTIPLIERS.deskAnalyticsHuman)
  }

  if (state.purchasedUpgrades.crossDeskCoordination) {
    value *= Number(UPGRADE_MULTIPLIERS.crossDeskCoordinationHuman)
  }

  return value * getSeniorTraderOptimizationMultiplier(state) * getDeskEfficiencyMultiplier(state)
}

export function getQuantTraderIncome(_state: GameState): number {
  return 0
}

export function getOwnedAssignableUnitCount(state: GameState, unitId: GenericSectorAssignableUnitId): number {
  if (unitId === 'intern') {
    return state.internCount
  }

  if (unitId === 'juniorTrader') {
    return state.juniorTraderCount
  }

  if (unitId === 'propDesk') {
    return state.propDeskCount
  }

  if (unitId === 'institutionalDesk') {
    return state.institutionalDeskCount
  }

  if (unitId === 'hedgeFund') {
    return state.hedgeFundCount
  }

  if (unitId === 'investmentFirm') {
    return state.investmentFirmCount
  }

  return state.seniorTraderCount
}

export function getAssignedCountForSector(state: GameState, unitId: GenericSectorAssignableUnitId, sectorId: SectorId): number {
  if (state.unlockedSectors[sectorId] !== true) {
    return 0
  }

  return Math.max(0, state.sectorAssignments[unitId]?.[sectorId] ?? 0)
}

export function getAssignedCount(state: GameState, unitId: GenericSectorAssignableUnitId): number {
  return SECTOR_IDS.reduce((total, sectorId) => total + getAssignedCountForSector(state, unitId, sectorId), 0)
}

export function getAvailableAssignableUnitCount(state: GameState, unitId: GenericSectorAssignableUnitId): number {
  if (unitId === 'seniorTrader') {
    return Math.max(0, getGenericTraderCount(state, 'seniorTrader') - getAssignedCount(state, unitId))
  }

  if (unitId === 'propDesk' || unitId === 'institutionalDesk' || unitId === 'hedgeFund' || unitId === 'investmentFirm') {
    return Math.max(0, getGenericInstitutionCount(state, unitId) - getAssignedCount(state, unitId))
  }

  return Math.max(0, getOwnedAssignableUnitCount(state, unitId) - getAssignedCount(state, unitId))
}

export function getPropDeskIncome(state: GameState): number {
  let value = UNITS.propDesk.baseIncomePerSecond

  if (state.purchasedUpgrades.propDeskOperatingModel) {
    value *= Number(UPGRADE_MULTIPLIERS.propDeskOperatingModel)
  }

  if (state.purchasedUpgrades.institutionalOperatingStandards) {
    value *= Number(UPGRADE_MULTIPLIERS.institutionalOperatingStandards)
  }

  return value * getPropDeskOptimizationMultiplier(state)
}

export function getInstitutionalDeskIncome(state: GameState): number {
  let value = UNITS.institutionalDesk.baseIncomePerSecond

  if (state.purchasedUpgrades.institutionalClientBook) {
    value *= Number(UPGRADE_MULTIPLIERS.institutionalClientBook)
  }

  if (state.purchasedUpgrades.institutionalOperatingStandards) {
    value *= Number(UPGRADE_MULTIPLIERS.institutionalOperatingStandards)
  }

  return value * getInstitutionalDeskOptimizationMultiplier(state)
}

export function getHedgeFundIncome(state: GameState): number {
  let value = UNITS.hedgeFund.baseIncomePerSecond

  if (state.purchasedUpgrades.fundStrategyCommittee) {
    value *= Number(UPGRADE_MULTIPLIERS.fundStrategyCommittee)
  }

  if (state.purchasedUpgrades.institutionalOperatingStandards) {
    value *= Number(UPGRADE_MULTIPLIERS.institutionalOperatingStandards)
  }

  return value * getHedgeFundOptimizationMultiplier(state)
}

export function getInvestmentFirmIncome(state: GameState): number {
  let value = UNITS.investmentFirm.baseIncomePerSecond

  if (state.purchasedUpgrades.globalDistributionNetwork) {
    value *= Number(UPGRADE_MULTIPLIERS.globalDistributionNetwork)
  }

  if (state.purchasedUpgrades.institutionalOperatingStandards) {
    value *= Number(UPGRADE_MULTIPLIERS.institutionalOperatingStandards)
  }

  return value * getInvestmentFirmOptimizationMultiplier(state)
}

export function getRuleBasedBotPowerUsage(state: GameState): number {
  let perBotUsage = Number(getAutomationUnitDefinition('ruleBasedBot').livePowerUse)
  perBotUsage *= getBotPowerUsageMultiplier(state, true)
  perBotUsage *= getRepeatableUpgradeMultiplier(state, 'computeOptimization')

  return state.ruleBasedBotCount * perBotUsage
}

export function getHumanTradingPowerUsage(_state: GameState): number {
  return 0
}

export function getUnitPowerUsagePerPurchase(state: GameState, unitId: UnitId): number {
  if (unitId === 'intern') return 0
  if (unitId === 'juniorTrader') return 0
  if (unitId === 'seniorTrader') return 0
  if (unitId === 'quantTrader') return 0
  if (unitId === 'propDesk') return 0
  if (unitId === 'institutionalDesk') return 0
  if (unitId === 'hedgeFund') return 0
  if (unitId === 'investmentFirm') return 0
  if (unitId === 'internResearchScientist') return 0
  if (unitId === 'juniorResearchScientist') return 0
  if (unitId === 'seniorResearchScientist') return 0
  if (unitId === 'ruleBasedBot') {
    let usage = Number(getAutomationUnitDefinition('ruleBasedBot').livePowerUse)
    usage *= getBotPowerUsageMultiplier(state, true)
    usage *= getRepeatableUpgradeMultiplier(state, 'computeOptimization')
    return usage
  }
  if (unitId === 'mlTradingBot') {
    let usage = Number(getAutomationUnitDefinition('mlTradingBot').livePowerUse)
    usage *= getBotPowerUsageMultiplier(state, true)
    usage *= getRepeatableUpgradeMultiplier(state, 'computeOptimization')
    return usage
  }
  if (unitId === 'aiTradingBot') {
    let usage = Number(getAutomationUnitDefinition('aiTradingBot').livePowerUse)
    usage *= getBotPowerUsageMultiplier(state, false)
    usage *= getRepeatableUpgradeMultiplier(state, 'computeOptimization')
    return usage
  }
  return 0
}

export function getResearchStaffPowerUsage(state: GameState): number {
  return 0
}

export function getMlTradingBotPowerUsage(state: GameState): number {
  let perBotUsage = Number(getAutomationUnitDefinition('mlTradingBot').livePowerUse)
  perBotUsage *= getBotPowerUsageMultiplier(state, true)
  perBotUsage *= getRepeatableUpgradeMultiplier(state, 'computeOptimization')

  return state.mlTradingBotCount * perBotUsage
}

export function getAiTradingBotPowerUsage(state: GameState): number {
  let perBotUsage = Number(getAutomationUnitDefinition('aiTradingBot').livePowerUse)
  perBotUsage *= getBotPowerUsageMultiplier(state, false)
  perBotUsage *= getRepeatableUpgradeMultiplier(state, 'computeOptimization')

  return state.aiTradingBotCount * perBotUsage
}

export function getPowerCapacity(state: GameState): number {
  const utilityCapacity = Number(ECONOMY_CONSTANTS.baseUtilityPowerCapacity)
  const rackCapacity = state.serverRackCount * POWER_INFRASTRUCTURE.serverRack.powerCapacity * getServerRackCapacityMultiplier(state) * getInfrastructureUpgradeCapacityMultiplier(state, 'rackStacking', 'rackStacking')
  const roomCapacity = state.serverRoomCount * POWER_INFRASTRUCTURE.serverRoom.powerCapacity * getServerRoomCapacityMultiplier(state) * getInfrastructureUpgradeCapacityMultiplier(state, 'roomScaleout', 'roomScaleout')
  const dataCenterCapacity = state.dataCenterCount * POWER_INFRASTRUCTURE.dataCenter.powerCapacity * getDataCenterCapacityMultiplier(state) * getInfrastructureUpgradeCapacityMultiplier(state, 'dataCenterFabric', 'dataCenterFabric')
  const cloudCapacity = state.cloudComputeCount * POWER_INFRASTRUCTURE.cloudCompute.powerCapacity * getCloudInfrastructureCapacityMultiplier(state) * getInfrastructureUpgradeCapacityMultiplier(state, 'cloudBurstContracts', 'cloudBurstContracts')

  let capacity = utilityCapacity + rackCapacity + roomCapacity + dataCenterCapacity + cloudCapacity

  if (state.purchasedPolicies.priorityGridAccess) {
    capacity *= Number(POLICY_MULTIPLIERS.priorityGridAccessPowerCapacity)
  }

  if (state.purchasedUpgrades.powerDistribution) {
    capacity *= Number(UPGRADE_MULTIPLIERS.powerDistribution)
  }

  return capacity * getPowerCapacityPrestigeMultiplier(state) * getGlobalEnergySupplyBoostMultiplier(state)
}

export function getPowerUsage(state: GameState): number {
  return getHumanTradingPowerUsage(state) + getCapacityPowerUsage(state) + getResearchStaffPowerUsage(state) + getRuleBasedBotPowerUsage(state) + getMlTradingBotPowerUsage(state) + getAiTradingBotPowerUsage(state)
}

export function getMachineEfficiencyMultiplier(state: GameState): number {
  const usage = getPowerUsage(state)
  const capacity = getPowerCapacity(state)
  const energyCompliancePenalty = getEnergyCompliancePenaltyMultiplier(state)

  if (usage <= 0) {
    return energyCompliancePenalty
  }

  if (usage <= capacity) {
    return energyCompliancePenalty
  }

  if (capacity <= 0) {
    return 0
  }

  let efficiency = capacity / usage

  if (state.purchasedPolicies.aiInfrastructureIncentives) {
    efficiency *= Number(POLICY_MULTIPLIERS.aiInfrastructureIncentivesOverCapRatio)
  }

  return Math.min(1, efficiency) * getMachineEfficiencyEventModifier(state) * energyCompliancePenalty
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

  if (hasHumanStaffDiscount(unitId)) {
    discount *= getHumanStaffCostMultiplier(state)
  }

  return Math.max(1, Math.floor(getScaledCost(unit.baseCost, unit.costScaling, owned) * discount))
}

export function getResearchPointsPerSecond(state: GameState): number {
  const infrastructureEfficiency = getMachineEfficiencyMultiplier(state)
  const complianceEfficiency = getComplianceEfficiencyMultiplier(state)
  const humanCompliancePenalty = getHumanCompliancePenaltyMultiplier(state)
  const researchOptimization = getRepeatableUpgradeMultiplier(state, 'researchThroughput')
  const internOutput = state.internResearchScientistCount * (UNITS.internResearchScientist.baseResearchPointsPerSecond ?? 0) * getInternScientistOptimizationMultiplier(state)
  const juniorOutput = state.juniorResearchScientistCount * (UNITS.juniorResearchScientist.baseResearchPointsPerSecond ?? 0) * getJuniorScientistOptimizationMultiplier(state)
  const seniorOutput = state.seniorResearchScientistCount * (UNITS.seniorResearchScientist.baseResearchPointsPerSecond ?? 0) * getSeniorScientistOptimizationMultiplier(state)
  const boostedInternOutput = state.purchasedUpgrades.sharedResearchLibrary ? internOutput * 1.12 : internOutput
  const boostedJuniorOutput = (state.purchasedUpgrades.labAutomation ? juniorOutput * Number(UPGRADE_MULTIPLIERS.labAutomationResearch) : juniorOutput) * (state.purchasedUpgrades.sharedResearchLibrary ? Number(UPGRADE_MULTIPLIERS.sharedResearchLibraryResearch) : 1)
  const boostedSeniorOutput = (state.purchasedUpgrades.researchGrants ? seniorOutput * Number(UPGRADE_MULTIPLIERS.researchGrantsResearch) : seniorOutput) * (state.purchasedUpgrades.sharedResearchLibrary ? Number(UPGRADE_MULTIPLIERS.sharedResearchLibraryResearch) : 1)
  const networkBoost = state.purchasedUpgrades.institutionalResearchNetwork ? Number(UPGRADE_MULTIPLIERS.institutionalResearchNetworkResearch) : 1
  const suiteBoost = state.purchasedUpgrades.backtestingSuite ? Number(UPGRADE_MULTIPLIERS.backtestingSuiteResearch) : 1
  const crossDisciplinaryBoost = state.purchasedUpgrades.crossDisciplinaryModels ? Number(UPGRADE_MULTIPLIERS.crossDisciplinaryModelsResearch) : 1
  const sharedLibraryBoost = state.purchasedUpgrades.sharedResearchLibrary ? Number(UPGRADE_MULTIPLIERS.sharedResearchLibraryResearch) : 1
  return ((internOutput * sharedLibraryBoost) + boostedJuniorOutput + boostedSeniorOutput) * networkBoost * suiteBoost * crossDisciplinaryBoost * researchOptimization * getResearchPrestigeMultiplier(state) * infrastructureEfficiency * complianceEfficiency * humanCompliancePenalty * getTimedResearchBoostMultiplier(state)
}

export function getInfluencePerSecond(state: GameState): number {
  if (!isLobbyingUnlocked(state)) {
    return 0
  }

  const baseOutput = state.juniorPoliticianCount * (UNITS.juniorPolitician.baseInfluencePerSecond ?? 0) * getPoliticianOptimizationMultiplier(state)
  const infrastructureEfficiency = getMachineEfficiencyMultiplier(state)

  let value = baseOutput

  if (state.purchasedUpgrades.policyAnalysisDesk) {
    value *= Number(UPGRADE_MULTIPLIERS.policyAnalysisDesk)
  }

  if (state.purchasedUpgrades.donorNetwork) {
    value *= Number(UPGRADE_MULTIPLIERS.donorNetwork)
  }

  if (state.purchasedUpgrades.governmentRelationsOffice) {
    value *= Number(UPGRADE_MULTIPLIERS.governmentRelationsOffice)
  }

  return value * infrastructureEfficiency * getGlobalInfluenceBoostMultiplier(state) * getPolicyCapitalMultiplier(state)
}

export function getIncomeBreakdown(state: GameState) {
  const infrastructureEfficiency = getMachineEfficiencyMultiplier(state)
  const complianceEfficiency = getComplianceEfficiencyMultiplier(state)
  const humanCompliancePenalty = getHumanCompliancePenaltyMultiplier(state)
  const institutionalCompliancePenalty = getInstitutionalCompliancePenaltyMultiplier(state)
  const sectorAllocationMultiplier = getSectorAllocationOptimizationMultiplier(state)
  const deskEfficiency = infrastructureEfficiency * complianceEfficiency
  const humanDeskEfficiency = deskEfficiency * humanCompliancePenalty * getTimedHumanOutputBoostMultiplier(state)
  const institutionalDeskEfficiency = deskEfficiency * institutionalCompliancePenalty * getTimedSectorOutputBoostMultiplier(state)

  const generalDeskInternIncome = getAvailableAssignableUnitCount(state, 'intern') * getInternIncome(state) * humanDeskEfficiency
  const generalDeskJuniorIncome = getAvailableAssignableUnitCount(state, 'juniorTrader') * getJuniorTraderIncome(state) * humanDeskEfficiency
  const generalDeskSeniorIncome = getAvailableAssignableUnitCount(state, 'seniorTrader') * getSeniorTraderIncome(state) * humanDeskEfficiency

  const sectorBreakdown = Object.fromEntries(SECTOR_IDS.map((sectorId) => {
    const sectorDefinition = getSectorDefinition(sectorId)
    const unlocked = state.unlockedSectors[sectorId] === true
    const sectorInternIncome = getAssignedCountForSector(state, 'intern', sectorId) * getInternIncome(state) * humanDeskEfficiency * sectorAllocationMultiplier
    const sectorJuniorGenericIncome = getAssignedCountForSector(state, 'juniorTrader', sectorId) * getJuniorTraderIncome(state) * humanDeskEfficiency * sectorAllocationMultiplier
    const sectorSeniorGenericIncome = getAssignedCountForSector(state, 'seniorTrader', sectorId) * getSeniorTraderIncome(state) * humanDeskEfficiency * sectorAllocationMultiplier
    const sectorSeniorSpecialistIncome = (['finance', 'technology', 'energy'] as const).reduce((total, specializationId) => {
      const assigned = getAssignedTraderSpecialistsForSector(state, 'seniorTrader', specializationId, sectorId)
      return total + assigned * getSeniorTraderIncome(state) * getTraderSpecialistSectorBonus(state, 'seniorTrader', specializationId, sectorId) * humanDeskEfficiency * sectorAllocationMultiplier
    }, 0)
    const sectorPropDeskGenericIncome = getAssignedCountForSector(state, 'propDesk', sectorId) * getPropDeskIncome(state) * institutionalDeskEfficiency * sectorAllocationMultiplier
    const sectorInstitutionalDeskGenericIncome = getAssignedCountForSector(state, 'institutionalDesk', sectorId) * getInstitutionalDeskIncome(state) * institutionalDeskEfficiency * sectorAllocationMultiplier
    const sectorHedgeFundGenericIncome = getAssignedCountForSector(state, 'hedgeFund', sectorId) * getHedgeFundIncome(state) * institutionalDeskEfficiency * sectorAllocationMultiplier
    const sectorInvestmentFirmGenericIncome = getAssignedCountForSector(state, 'investmentFirm', sectorId) * getInvestmentFirmIncome(state) * institutionalDeskEfficiency * sectorAllocationMultiplier
    const sectorPropDeskIncome = (['finance', 'technology', 'energy'] as const).reduce((total, mandateId) => {
      const assigned = getAssignedInstitutionMandatesForSector(state, 'propDesk', mandateId, sectorId)
      return total + assigned * getPropDeskIncome(state) * getInstitutionMandateBonus(state, 'propDesk', mandateId, sectorId) * institutionalDeskEfficiency * sectorAllocationMultiplier
    }, 0)
    const sectorInstitutionalDeskIncome = (['finance', 'technology', 'energy'] as const).reduce((total, mandateId) => {
      const assigned = getAssignedInstitutionMandatesForSector(state, 'institutionalDesk', mandateId, sectorId)
      return total + assigned * getInstitutionalDeskIncome(state) * getInstitutionMandateBonus(state, 'institutionalDesk', mandateId, sectorId) * institutionalDeskEfficiency * sectorAllocationMultiplier
    }, 0)
    const sectorHedgeFundIncome = (['finance', 'technology', 'energy'] as const).reduce((total, mandateId) => {
      const assigned = getAssignedInstitutionMandatesForSector(state, 'hedgeFund', mandateId, sectorId)
      return total + assigned * getHedgeFundIncome(state) * getInstitutionMandateBonus(state, 'hedgeFund', mandateId, sectorId) * institutionalDeskEfficiency * sectorAllocationMultiplier
    }, 0)
    const sectorInvestmentFirmIncome = (['finance', 'technology', 'energy'] as const).reduce((total, mandateId) => {
      const assigned = getAssignedInstitutionMandatesForSector(state, 'investmentFirm', mandateId, sectorId)
      return total + assigned * getInvestmentFirmIncome(state) * getInstitutionMandateBonus(state, 'investmentFirm', mandateId, sectorId) * institutionalDeskEfficiency * sectorAllocationMultiplier
    }, 0)
    const sectorJuniorIncome = sectorJuniorGenericIncome
    const sectorSeniorIncome = sectorSeniorGenericIncome + sectorSeniorSpecialistIncome
    const totalIncome = unlocked ? (sectorInternIncome + sectorJuniorIncome + sectorSeniorIncome + sectorPropDeskGenericIncome + sectorInstitutionalDeskGenericIncome + sectorHedgeFundGenericIncome + sectorInvestmentFirmGenericIncome + sectorPropDeskIncome + sectorInstitutionalDeskIncome + sectorHedgeFundIncome + sectorInvestmentFirmIncome) * sectorDefinition.baseProfitMultiplier * getSectorEventMultiplier(state, sectorId) * getMarketReputationMultiplier(state) : 0

    return [sectorId, {
      sectorId,
      sectorName: sectorDefinition.name,
      unlocked,
      multiplier: sectorDefinition.baseProfitMultiplier * getSectorEventMultiplier(state, sectorId),
      internIncome: sectorInternIncome,
      juniorIncome: sectorJuniorIncome,
      seniorIncome: sectorSeniorIncome,
      juniorGenericIncome: sectorJuniorGenericIncome,
      juniorSpecialistIncome: 0,
      seniorGenericIncome: sectorSeniorGenericIncome,
      seniorSpecialistIncome: sectorSeniorSpecialistIncome,
      propDeskIncome: sectorPropDeskGenericIncome + sectorPropDeskIncome,
      institutionalDeskIncome: sectorInstitutionalDeskGenericIncome + sectorInstitutionalDeskIncome,
      hedgeFundIncome: sectorHedgeFundGenericIncome + sectorHedgeFundIncome,
      investmentFirmIncome: sectorInvestmentFirmGenericIncome + sectorInvestmentFirmIncome,
      totalIncome,
    }]
  })) as Record<SectorId, {
    sectorId: SectorId
    sectorName: string
    unlocked: boolean
    multiplier: number
    internIncome: number
    juniorIncome: number
    seniorIncome: number
    juniorGenericIncome: number
    juniorSpecialistIncome: number
    seniorGenericIncome: number
    seniorSpecialistIncome: number
    propDeskIncome: number
    institutionalDeskIncome: number
    hedgeFundIncome: number
    investmentFirmIncome: number
    totalIncome: number
  }>

  const generalDeskIncome = generalDeskInternIncome + generalDeskJuniorIncome + generalDeskSeniorIncome
  const totalSectorInternIncome = SECTOR_IDS.reduce((total, sectorId) => total + sectorBreakdown[sectorId].internIncome * sectorBreakdown[sectorId].multiplier, 0)
  const totalSectorJuniorIncome = SECTOR_IDS.reduce((total, sectorId) => total + sectorBreakdown[sectorId].juniorIncome * sectorBreakdown[sectorId].multiplier, 0)
  const totalSectorSeniorIncome = SECTOR_IDS.reduce((total, sectorId) => total + sectorBreakdown[sectorId].seniorIncome * sectorBreakdown[sectorId].multiplier, 0)
  const totalSectorIncome = SECTOR_IDS.reduce((total, sectorId) => total + sectorBreakdown[sectorId].totalIncome, 0)

  return {
    generalDeskInternIncome,
    generalDeskJuniorIncome,
    generalDeskSeniorIncome,
    generalDeskIncome,
    sectorBreakdown,
    totalSectorIncome,
    internIncome: generalDeskInternIncome + totalSectorInternIncome,
    juniorIncome: generalDeskJuniorIncome + totalSectorJuniorIncome,
    seniorIncome: generalDeskSeniorIncome + totalSectorSeniorIncome,
    propDeskIncome: getAvailableAssignableUnitCount(state, 'propDesk') * getPropDeskIncome(state) * institutionalDeskEfficiency,
    institutionalDeskIncome: getAvailableAssignableUnitCount(state, 'institutionalDesk') * getInstitutionalDeskIncome(state) * institutionalDeskEfficiency,
    hedgeFundIncome: getAvailableAssignableUnitCount(state, 'hedgeFund') * getHedgeFundIncome(state) * institutionalDeskEfficiency,
    investmentFirmIncome: getAvailableAssignableUnitCount(state, 'investmentFirm') * getInvestmentFirmIncome(state) * institutionalDeskEfficiency,
  }
}

export function getCashPerSecond(state: GameState): number {
  const { internIncome, juniorIncome, seniorIncome, propDeskIncome, institutionalDeskIncome, hedgeFundIncome, investmentFirmIncome } = getIncomeBreakdown(state)
  const basePassiveIncome = internIncome + juniorIncome + seniorIncome + propDeskIncome + institutionalDeskIncome + hedgeFundIncome + investmentFirmIncome

  return basePassiveIncome * getGlobalMultiplier(state) * getGlobalEventMultiplier(state) * getPrestigeMultiplier(state)
}

export function getGeneralDeskCashPerSecond(state: GameState): number {
  return getIncomeBreakdown(state).generalDeskIncome * getGlobalMultiplier(state) * getGlobalEventMultiplier(state) * getPrestigeMultiplier(state)
}

export function getSectorCashPerSecond(state: GameState, sectorId: SectorId): number {
  return getIncomeBreakdown(state).sectorBreakdown[sectorId].totalIncome * getGlobalMultiplier(state) * getGlobalEventMultiplier(state) * getPrestigeMultiplier(state)
}

export function getJuniorTraderCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'juniorTrader', state.juniorTraderCount)
}

export function getInternCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'intern', state.internCount)
}

export function isUnitUnlocked(state: GameState, unitId: UnitId): boolean {
  return isUnitDefinitionUnlocked(state, unitId)
}

export function getUnitCount(state: GameState, unitId: UnitId): number {
  switch (unitId) {
    case 'intern':
      return state.internCount
    case 'juniorTrader':
      return state.juniorTraderCount
    case 'seniorTrader':
      return state.seniorTraderCount
    case 'quantTrader':
      return state.quantTraderCount
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
  const humanDeskLimited = isDeskLimitedUnit(unitId)
  const availableDeskSlots = getAvailableDeskSlots(state)

  if (humanDeskLimited && !canBuyHumanUnit(state)) {
    return { quantity: 0, totalCost: 0 }
  }

  if (quantity === 'max') {
    let totalCost = 0
    let bought = 0
    let simulatedOwned = owned

    while (true) {
      const nextCost = getDiscountedUnitCostAtOwned(state, unitId, simulatedOwned)

      if (totalCost + nextCost > state.cash) {
        break
      }

      if (humanDeskLimited && bought + 1 > availableDeskSlots) {
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
    totalCost += getDiscountedUnitCostAtOwned(state, unitId, owned + i)
  }

  if (humanDeskLimited && quantity > availableDeskSlots) {
    return { quantity: 0, totalCost }
  }

  for (let i = 0; i < quantity; i += 1) {
    if (currentPowerUsage + powerPerUnit * (i + 1) > powerCapacity) {
      return { quantity: 0, totalCost }
    }
  }

  return { quantity, totalCost }
}

export function getSeniorTraderCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'seniorTrader', state.seniorTraderCount)
}

export function getQuantTraderCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'quantTrader', state.quantTraderCount)
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
  return hasPowerInfrastructureResearch(_state)
}

export function isPowerInfrastructureVisible(state: GameState, infrastructureId: PowerInfrastructureId): boolean {
  return isPowerInfrastructureDefinitionVisible(state, infrastructureId)
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
  const subsidyMultiplier = state.purchasedPolicies.industrialPowerSubsidies ? Number(POLICY_MULTIPLIERS.industrialPowerSubsidiesPowerPurchase) : 1
  return Math.max(1, Math.floor(getScaledCost(definition.baseCost, definition.costScaling, getPowerInfrastructureCount(state, infrastructureId)) * subsidyMultiplier))
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
        const subsidyMultiplier = state.purchasedPolicies.industrialPowerSubsidies ? Number(POLICY_MULTIPLIERS.industrialPowerSubsidiesPowerPurchase) : 1
        const nextCost = Math.max(1, Math.floor(getScaledCost(definition.baseCost, definition.costScaling, simulatedOwned) * subsidyMultiplier))

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
    const subsidyMultiplier = state.purchasedPolicies.industrialPowerSubsidies ? Number(POLICY_MULTIPLIERS.industrialPowerSubsidiesPowerPurchase) : 1
    totalCost += Math.max(1, Math.floor(getScaledCost(definition.baseCost, definition.costScaling, owned + i) * subsidyMultiplier))
  }

  return { quantity, totalCost }
}

export function canAfford(state: GameState, amount: number): boolean {
  return state.cash >= amount
}
