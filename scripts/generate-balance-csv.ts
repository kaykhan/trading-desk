import { writeFileSync } from 'node:fs'

import { AUTOMATION_STRATEGIES, AUTOMATION_UNITS } from '../src/data/automation'
import { GLOBAL_BOOSTS, TIMED_BOOSTS } from '../src/data/boosts'
import { CAPACITY_CONSTANTS, CAPACITY_INFRASTRUCTURE } from '../src/data/capacity'
import { GAME_CONSTANTS } from '../src/data/constants'
import { initialState } from '../src/data/initialState'
import { LOBBYING_POLICIES } from '../src/data/lobbyingPolicies'
import { MARKET_EVENTS, MARKET_EVENT_COOLDOWN_MAX_SECONDS, MARKET_EVENT_COOLDOWN_MIN_SECONDS, MARKET_EVENT_HISTORY_LIMIT } from '../src/data/marketEvents'
import { MILESTONES } from '../src/data/milestones'
import { POWER_INFRASTRUCTURE } from '../src/data/powerInfrastructure'
import { PRESTIGE_REPUTATION_GAIN_CURVE, PRESTIGE_TIERS, PRESTIGE_TIER_LABELS, PRESTIGE_UPGRADES } from '../src/data/prestigeUpgrades'
import { REPEATABLE_UPGRADES } from '../src/data/repeatableUpgrades'
import { RESEARCH_TECH } from '../src/data/researchTech'
import { DEFAULT_UNLOCKED_SECTORS, SECTORS } from '../src/data/sectors'
import { UNITS } from '../src/data/units'
import { UPGRADES } from '../src/data/upgrades'
import type { AutomationStrategyId, AutomationUnitId, CapacityInfrastructureId, GlobalBoostId, LobbyingPolicyId, MarketEventId, PowerInfrastructureId, RepeatableUpgradeId, ResearchTechId, TimedBoostId, UnitId, UpgradeId } from '../src/types/game'
import { getPrestigeLifetimeCashRequirement } from '../src/utils/prestige'

type Row = Record<string, string | number | boolean | null | undefined>

const OUTPUT_PATH = new URL('../balance.csv', import.meta.url)

const columns = [
  'category',
  'subtype',
  'id',
  'name',
  'group',
  'branch',
  'track',
  'family',
  'value',
  'currency',
  'base_cost',
  'cost_scaling',
  'max_rank',
  'base_output',
  'output_unit',
  'avg_output_per_second',
  'avg_output_unit',
  'duration_seconds',
  'cooldown_seconds',
  'power_usage',
  'power_formula',
  'power_capacity',
  'desk_slots',
  'cost_formula',
  'bulk_formula',
  'effect_formula',
  'condition_rule',
  'prerequisites',
  'visible_rule',
  'unlock_rule',
  'reward_formula',
  'notes',
  'source_files',
] as const

const rows: Row[] = []

function compact(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function serialize(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : ''
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return compact(String(value))
}

function fnString(value: unknown): string {
  if (typeof value !== 'function') return ''
  return compact(value.toString())
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function addRow(row: Row): void {
  rows.push(row)
}

function rewardSummary(reward: { cash?: number; researchPoints?: number; influence?: number; reputation?: number; deskSlots?: number; note?: string }): string {
  const parts: string[] = []
  if (reward.cash) parts.push(`cash +${reward.cash}`)
  if (reward.researchPoints) parts.push(`researchPoints +${reward.researchPoints}`)
  if (reward.influence) parts.push(`influence +${reward.influence}`)
  if (reward.reputation) parts.push(`reputation +${reward.reputation}`)
  if (reward.deskSlots) parts.push(`baseDeskSlots +${reward.deskSlots}`)
  if (reward.note) parts.push(`note: ${reward.note}`)
  return parts.join(' | ')
}

function sourceFiles(...files: string[]): string {
  return files.join(' ; ')
}

const UPGRADE_EFFECT_FORMULAS: Record<UpgradeId, string> = {
  betterTerminal: 'manualClickBase = 2',
  tradeShortcuts: 'manualClickBase += 1',
  premiumDataFeed: 'manual click *= 1.25 twice; intern/junior/senior base output *= 1.1',
  deskAnalytics: 'intern/junior/senior base output *= 1.12',
  crossDeskCoordination: 'intern/junior/senior base output *= 1.15',
  structuredOnboarding: 'intern/juniorTrader base output *= 1.2',
  labAutomation: 'juniorScientist base RP *= 1.2',
  researchGrants: 'seniorScientist base RP *= 1.25',
  sharedResearchLibrary: 'intern/junior/senior scientist RP *= 1.12',
  backtestingSuite: 'total RP *= 1.15',
  institutionalResearchNetwork: 'total RP *= 1.2',
  crossDisciplinaryModels: 'total RP *= 1.1 only; described training bonus not implemented',
  propDeskOperatingModel: 'propDesk base output *= 1.2',
  institutionalClientBook: 'institutionalDesk base output *= 1.2',
  fundStrategyCommittee: 'hedgeFund base output *= 1.2',
  globalDistributionNetwork: 'investmentFirm base output *= 1.2',
  institutionalOperatingStandards: 'propDesk/institutionalDesk/hedgeFund/investmentFirm base output *= 1.12',
  mandateAlignmentFramework: 'no live runtime effect',
  systematicExecution: 'quantTrader and ruleBasedBot payout *= 1.15',
  botTelemetry: 'ruleBasedBot payout *= 1.15',
  executionRoutingStack: 'ruleBasedBot cycleDuration *= 0.9',
  modelServingCluster: 'mlTradingBot payout *= 1.2',
  inferenceBatching: 'mlTradingBot cycleDuration *= 0.9',
  aiRiskStack: 'aiTradingBot payout *= 1.2',
  rackStacking: 'serverRack capacity *= 1.25',
  coolingSystems: 'ruleBasedBot/mlTradingBot/aiTradingBot powerUse *= 0.9',
  roomScaleout: 'serverRoom capacity *= 1.25',
  powerDistribution: 'total power capacity *= 1.2',
  dataCenterFabric: 'dataCenter capacity *= 1.3',
  cloudBurstContracts: 'cloudCompute capacity *= 1.35',
  policyAnalysisDesk: 'influence *= 1.25',
  regulatoryCounsel: 'effectiveComplianceBurden *= 0.92',
  donorNetwork: 'influence *= 1.2',
  complianceSoftwareSuite: 'staff compliance cost *= 0.9; institutional compliance cost *= 0.9',
  governmentRelationsOffice: 'influence *= 1.15',
  filingAutomation: 'automation compliance cost *= 0.9; institutional compliance cost *= 0.9',
}

const UPGRADE_NOTES: Partial<Record<UpgradeId, string>> = {
  premiumDataFeed: 'manual multiplier is applied twice in runtime',
  crossDisciplinaryModels: 'description overstates effect; no training-methodology boost is wired',
  mandateAlignmentFramework: 'visible and purchasable, but not referenced by runtime formulas',
  rackStacking: 'description says +20%, code gives +25%',
  roomScaleout: 'description says +20%, code gives +25%',
  powerDistribution: 'description says +15%, code gives +20%',
  dataCenterFabric: 'description says +25%, code gives +30%',
  cloudBurstContracts: 'description says +25%, code gives +35%',
}

const POLICY_EFFECT_FORMULAS: Record<LobbyingPolicyId, string> = {
  hiringIncentives: 'staffComplianceCost *= 0.88',
  deskExpansionCredits: 'effectiveComplianceBurden -= 1; staffComplianceCost *= 0.92',
  executiveCompensationReform: 'humanCompliancePenaltyRelief += 0.05; seniorTrader base output *= 1.15',
  industrialPowerSubsidies: 'energyComplianceCost *= 0.85; powerInfrastructureCost *= 0.9',
  priorityGridAccess: 'effectiveComplianceBurden -= 1.2; total power capacity *= 1.15',
  dataCenterEnergyCredits: 'energyComplianceCost *= 0.9; automationComplianceBurden -= 0.8; ruleBasedBot/mlTradingBot powerUse *= 0.8',
  capitalGainsRelief: 'institutionalComplianceCost *= 0.85; institutionalComplianceBurden -= 0.5',
  extendedTradingWindow: 'sectorComplianceBurden -= 1',
  marketDeregulation: 'effectiveComplianceBurden -= 1; complianceEfficiency += 0.05; institutionalComplianceBurden -= 1',
  automationTaxCredit: 'automationComplianceCost *= 0.85',
  fastTrackServerPermits: 'automationComplianceBurden -= 1.2',
  aiInfrastructureIncentives: 'complianceEfficiency += 0.05; automationComplianceBurden -= 1; over-cap machine efficiency ratio *= 1.1 before clamp',
}

const TIMED_BOOST_EFFECT_FORMULAS: Record<TimedBoostId, string> = {
  aggressiveTradingWindow: 'human trader output *= 1.3; institution output *= 1.2',
  deployReserveCapital: 'manual cash, passive cash, and automation payout formulas *= 1.25',
  overclockServers: 'automation payout formulas *= 1.3',
  researchSprint: 'researchPointsPerSecond *= 1.5',
  complianceFreeze: 'compliance efficiency loss divisor *= 1.1; projected review total /= 1.1; per-category manual payment amounts are unchanged',
}

const GLOBAL_BOOST_EFFECT_FORMULAS: Record<GlobalBoostId, string> = {
  globalProfitBoost: 'globalProfitMultiplier *= 1.05',
  globalEnergySupplyBoost: 'powerCapacity *= 1.05',
  globalInfluenceBoost: 'influencePerSecond *= 1.05',
  globalReputationBoost: 'prestigeGain *= 1.05',
}

const MARKET_EVENT_EFFECT_FORMULAS: Record<MarketEventId, string> = {
  techRally: 'technology sector output *= 1.2; targeted automation to technology also gets sector event *= 1.2',
  energyBoom: 'energy sector output *= 1.2; targeted automation to energy also gets sector event *= 1.2',
  financialTightening: 'finance sector output *= 0.85; targeted automation to finance also gets sector event *= 0.85',
  volatilitySpike: 'automation payout formulas *= 1.1',
  liquidityCrunch: 'passive cash formulas *= 0.92 only; does not directly affect research, influence, or automation payout',
  gridStressWarning: 'over-cap machineEfficiency *= 0.9; no effect while power usage <= capacity',
}

const PRESTIGE_EFFECT_FORMULAS: Record<string, string> = {
  globalRecognition: 'globalRecognitionMultiplier = 1 + 0.05 * rank',
  seedCapital: 'startingCash = 250 * rank',
  betterHiringPipeline: 'humanStaffCostMultiplier = max(0.2, 1 - 0.05 * rank)',
  institutionalKnowledge: 'researchPrestigeMultiplier = 1 + 0.1 * rank',
  gridOrchestration: 'machineOutputPrestigeMultiplier = 1 + 0.05 * rank; powerCapacityPrestigeMultiplier = 1 + 0.05 * rank',
  complianceFrameworks: 'complianceFrameworksRelief = 0.05 * rank',
  policyCapital: 'policyCapitalMultiplier = 1 + 0.05 * rank',
  marketReputation: 'marketReputationMultiplier = 1 + 0.03 * rank',
  deskEfficiency: 'deskEfficiencyMultiplier = 1 + 0.04 * rank',
  strategicReserves: 'timedBoostCooldownMultiplier = max(0.5, 1 - 0.03 * rank)',
}

const REPEATABLE_EFFECT_FORMULAS: Record<RepeatableUpgradeId, string> = {
  manualExecutionRefinement: 'manualExecutionRefinementMultiplier = 1 + 0.005 * rank',
  humanDeskTuning: 'humanDeskTuningMultiplier = 1 + 0.005 * rank',
  institutionalProcessRefinement: 'institutionalProcessRefinementMultiplier = 1 + 0.0075 * rank',
  sectorAllocationEfficiency: 'sectorAllocationEfficiencyMultiplier = 1 + 0.005 * rank',
  researchThroughput: 'researchThroughputMultiplier = 1 + 0.0075 * rank',
  trainingMethodology: 'trainingMethodologyMultiplier = 1 + 0.005 * rank',
  analyticalModeling: 'analyticalModelingMultiplier = 1 + 0.005 * rank; currently not referenced by live runtime formulas',
  executionStackTuning: 'executionStackTuningMultiplier = 1 + 0.0075 * rank',
  modelEfficiency: 'modelEfficiencyMultiplier = max(0.5, 1 - 0.003 * rank)',
  computeOptimization: 'computeOptimizationMultiplier = max(0.5, 1 - 0.004 * rank)',
  signalQualityControl: 'signalQualityControlMultiplier = 1 + 0.005 * rank',
  complianceSystems: 'complianceSystemsMultiplier = max(0.5, 1 - 0.005 * rank)',
  filingEfficiency: 'filingEfficiencyMultiplier = max(0.25, 1 - 0.0075 * rank)',
  policyReach: 'policyReachMultiplier = 1 + 0.005 * rank',
  institutionalAccess: 'institutionalAccessMultiplier = max(0.5, 1 - 0.005 * rank)',
}

const UNIT_KIND: Record<UnitId, string> = {
  intern: 'human',
  juniorTrader: 'human',
  seniorTrader: 'human',
  quantTrader: 'automation',
  propDesk: 'institution',
  institutionalDesk: 'institution',
  hedgeFund: 'institution',
  investmentFirm: 'institution',
  ruleBasedBot: 'automation',
  mlTradingBot: 'automation',
  aiTradingBot: 'automation',
  internResearchScientist: 'research',
  juniorResearchScientist: 'research',
  seniorResearchScientist: 'research',
  juniorPolitician: 'influence',
}

const DESK_LIMITED_UNITS = new Set<UnitId>([
  'intern',
  'juniorTrader',
  'seniorTrader',
  'internResearchScientist',
  'juniorResearchScientist',
  'seniorResearchScientist',
])

const UNIT_UNLOCK_RULES: Record<UnitId, string> = {
  intern: 'requires purchasedResearchTech.foundationsOfFinanceTraining === true',
  juniorTrader: 'requires purchasedResearchTech.juniorTraderProgram === true',
  seniorTrader: 'requires purchasedResearchTech.seniorRecruitment === true',
  quantTrader: 'requires purchasedResearchTech.algorithmicTrading === true',
  propDesk: 'requires purchasedResearchTech.propDeskOperations === true',
  institutionalDesk: 'requires purchasedResearchTech.institutionalDesks === true and serverRoomCount > 0',
  hedgeFund: 'requires purchasedResearchTech.hedgeFundStrategies === true and dataCenterCount > 0',
  investmentFirm: 'requires purchasedResearchTech.investmentFirms === true and cloudComputeCount > 0',
  ruleBasedBot: 'requires purchasedResearchTech.ruleBasedAutomation === true',
  mlTradingBot: 'requires purchasedResearchTech.machineLearningTrading === true and dataCenterCount > 0',
  aiTradingBot: 'requires purchasedResearchTech.aiTradingSystems === true and cloudComputeCount > 0',
  internResearchScientist: 'requires purchasedResearchTech.foundationsOfFinanceTraining === true',
  juniorResearchScientist: 'requires purchasedResearchTech.juniorScientists === true',
  seniorResearchScientist: 'requires purchasedResearchTech.seniorScientists === true',
  juniorPolitician: 'requires purchasedResearchTech.regulatoryAffairs === true',
}

const UNIT_COST_FORMULAS: Record<UnitId, string> = {
  intern: 'internCost(n) = max(1, floor(15 * 1.15^n * humanStaffCostMultiplier))',
  juniorTrader: 'juniorTraderCost(n) = max(1, floor(120 * 1.17^n * humanStaffCostMultiplier))',
  seniorTrader: 'seniorTraderCost(n) = max(1, floor(3500 * 1.19^n * humanStaffCostMultiplier))',
  quantTrader: 'quantTraderCost(n) = max(1, floor(2500 * 1.22^n))',
  propDesk: 'propDeskCost(n) = max(1, floor(18000 * 1.2^n * humanStaffCostMultiplier))',
  institutionalDesk: 'institutionalDeskCost(n) = max(1, floor(150000 * 1.21^n * humanStaffCostMultiplier))',
  hedgeFund: 'hedgeFundCost(n) = max(1, floor(1100000 * 1.22^n * humanStaffCostMultiplier))',
  investmentFirm: 'investmentFirmCost(n) = max(1, floor(8500000 * 1.23^n * humanStaffCostMultiplier))',
  ruleBasedBot: 'ruleBasedBotCost(n) = max(1, floor(12000 * 1.24^n))',
  mlTradingBot: 'mlTradingBotCost(n) = max(1, floor(80000 * 1.26^n))',
  aiTradingBot: 'aiTradingBotCost(n) = max(1, floor(400000 * 1.28^n))',
  internResearchScientist: 'internScientistCost(n) = max(1, floor(600 * 1.19^n * humanStaffCostMultiplier))',
  juniorResearchScientist: 'juniorScientistCost(n) = max(1, floor(2400 * 1.21^n * humanStaffCostMultiplier))',
  seniorResearchScientist: 'seniorScientistCost(n) = max(1, floor(9500 * 1.22^n * humanStaffCostMultiplier))',
  juniorPolitician: 'senatorCost(n) = max(1, floor(14000 * 1.23^n * humanStaffCostMultiplier))',
}

const UNIT_BULK_FORMULA = 'bulkCost = sum(unitCost(owned + i)); max buy stops on cash shortage, desk-slot shortage for desk-limited units, or live power shortage for power-using units'

const UNIT_EFFECT_FORMULAS: Record<UnitId, string> = {
  intern: 'general cash/sec = availableInterns * 0.3 * premiumDataFeed?1.1 * deskAnalytics?1.12 * crossDeskCoordination?1.15 * structuredOnboarding?1.2 * humanDeskTuningMultiplier * deskEfficiencyMultiplier * machineEfficiency * complianceEfficiency * humanCompliancePenalty * globalProfitMultiplier * globalEventMultiplier * prestigeGlobalRecognitionMultiplier; sector-assigned version also multiplies by sectorAllocationEfficiencyMultiplier * sectorBaseMultiplier * sectorEventMultiplier * marketReputationMultiplier',
  juniorTrader: 'general cash/sec = availableJuniors * 3.2 * premiumDataFeed?1.1 * deskAnalytics?1.12 * crossDeskCoordination?1.15 * structuredOnboarding?1.2 * humanDeskTuningMultiplier * deskEfficiencyMultiplier * machineEfficiency * complianceEfficiency * humanCompliancePenalty * globalProfitMultiplier * globalEventMultiplier * prestigeGlobalRecognitionMultiplier; sector-assigned version also multiplies by sectorAllocationEfficiencyMultiplier * sectorBaseMultiplier * sectorEventMultiplier * marketReputationMultiplier',
  seniorTrader: 'general cash/sec = availableSeniors * 16 * executiveCompensationReform?1.15 * premiumDataFeed?1.1 * deskAnalytics?1.12 * crossDeskCoordination?1.15 * humanDeskTuningMultiplier * deskEfficiencyMultiplier * machineEfficiency * complianceEfficiency * humanCompliancePenalty * globalProfitMultiplier * globalEventMultiplier * prestigeGlobalRecognitionMultiplier; sector-assigned generic version also multiplies by sectorAllocationEfficiencyMultiplier * sectorBaseMultiplier * sectorEventMultiplier * marketReputationMultiplier; matching specialists add extra assigned output at * (1.2 * trainingMethodologyMultiplier)',
  quantTrader: 'payout per completed cycle = owned * 20 * marketTargetMultiplier * sectorEventMultiplierIfTargeted * strategyMultiplier * automationEventMultiplier * automationOptimizationMultiplier * machineEfficiency * complianceEfficiency * automationCompliancePenalty * timedAutomationBoostMultiplier * globalProfitMultiplier * prestigeGlobalRecognitionMultiplier; average cash/sec = payout / (4 * modelEfficiencyMultiplier)',
  propDesk: 'general cash/sec = availablePropDesks * 120 * propDeskOperatingModel?1.2 * institutionalOperatingStandards?1.12 * institutionalProcessRefinementMultiplier * machineEfficiency * complianceEfficiency * institutionalCompliancePenalty * timedInstitutionMultiplier(1.2 during aggressiveTradingWindow) * globalProfitMultiplier * globalEventMultiplier * prestigeGlobalRecognitionMultiplier; sector-assigned version also multiplies by sectorAllocationEfficiencyMultiplier * sectorBaseMultiplier * sectorEventMultiplier * marketReputationMultiplier; matching mandates add extra assigned output at * (1.05 * trainingMethodologyMultiplier)',
  institutionalDesk: 'general cash/sec = availableInstitutionalDesks * 540 * institutionalClientBook?1.2 * institutionalOperatingStandards?1.12 * institutionalProcessRefinementMultiplier * machineEfficiency * complianceEfficiency * institutionalCompliancePenalty * timedInstitutionMultiplier * globalProfitMultiplier * globalEventMultiplier * prestigeGlobalRecognitionMultiplier; matching mandate bonus uses 1.075 * trainingMethodologyMultiplier',
  hedgeFund: 'general cash/sec = availableHedgeFunds * 3200 * fundStrategyCommittee?1.2 * institutionalOperatingStandards?1.12 * institutionalProcessRefinementMultiplier * machineEfficiency * complianceEfficiency * institutionalCompliancePenalty * timedInstitutionMultiplier * globalProfitMultiplier * globalEventMultiplier * prestigeGlobalRecognitionMultiplier; matching mandate bonus uses 1.1 * trainingMethodologyMultiplier',
  investmentFirm: 'general cash/sec = availableInvestmentFirms * 18000 * globalDistributionNetwork?1.2 * institutionalOperatingStandards?1.12 * institutionalProcessRefinementMultiplier * machineEfficiency * complianceEfficiency * institutionalCompliancePenalty * timedInstitutionMultiplier * globalProfitMultiplier * globalEventMultiplier * prestigeGlobalRecognitionMultiplier; matching mandate bonus uses 1.125 * trainingMethodologyMultiplier',
  ruleBasedBot: 'payout per completed cycle = owned * 70 * marketTargetMultiplier * sectorEventMultiplierIfTargeted * strategyMultiplier * automationEventMultiplier * executionStackTuningMultiplier * signalQualityControlMultiplier * systematicExecution?1.15 * botTelemetry?1.15 * machineOutputPrestigeMultiplier * machineEfficiency * complianceEfficiency * automationCompliancePenalty * timedAutomationBoostMultiplier * globalProfitMultiplier * prestigeGlobalRecognitionMultiplier; average cash/sec = payout / (6 * executionRoutingStack?0.9 * modelEfficiencyMultiplier)',
  mlTradingBot: 'payout per completed cycle = owned * 220 * marketTargetMultiplier * sectorEventMultiplierIfTargeted * strategyMultiplier * automationEventMultiplier * executionStackTuningMultiplier * signalQualityControlMultiplier * modelServingCluster?1.2 * machineOutputPrestigeMultiplier * machineEfficiency * complianceEfficiency * automationCompliancePenalty * timedAutomationBoostMultiplier * globalProfitMultiplier * prestigeGlobalRecognitionMultiplier; average cash/sec = payout / (12 * inferenceBatching?0.9 * modelEfficiencyMultiplier)',
  aiTradingBot: 'payout per completed cycle = owned * 650 * marketTargetMultiplier * sectorEventMultiplierIfTargeted * strategyMultiplier * automationEventMultiplier * executionStackTuningMultiplier * signalQualityControlMultiplier * aiRiskStack?1.2 * machineOutputPrestigeMultiplier * machineEfficiency * complianceEfficiency * automationCompliancePenalty * timedAutomationBoostMultiplier * globalProfitMultiplier * prestigeGlobalRecognitionMultiplier; average cash/sec = payout / (20 * modelEfficiencyMultiplier)',
  internResearchScientist: 'research/sec = owned * 0.35 * sharedResearchLibrary?1.12; total RP then multiplies by institutionalResearchNetwork?1.2 * backtestingSuite?1.15 * crossDisciplinaryModels?1.1 * researchThroughputMultiplier * researchPrestigeMultiplier * machineEfficiency * complianceEfficiency * humanCompliancePenalty * researchSprint?1.5',
  juniorResearchScientist: 'research/sec = owned * 1.1 * labAutomation?1.2 * sharedResearchLibrary?1.12; total RP then multiplies by institutionalResearchNetwork?1.2 * backtestingSuite?1.15 * crossDisciplinaryModels?1.1 * researchThroughputMultiplier * researchPrestigeMultiplier * machineEfficiency * complianceEfficiency * humanCompliancePenalty * researchSprint?1.5',
  seniorResearchScientist: 'research/sec = owned * 3.4 * researchGrants?1.25 * sharedResearchLibrary?1.12; total RP then multiplies by institutionalResearchNetwork?1.2 * backtestingSuite?1.15 * crossDisciplinaryModels?1.1 * researchThroughputMultiplier * researchPrestigeMultiplier * machineEfficiency * complianceEfficiency * humanCompliancePenalty * researchSprint?1.5',
  juniorPolitician: 'influence/sec = owned * 0.01 * policyReachMultiplier * policyAnalysisDesk?1.25 * donorNetwork?1.2 * governmentRelationsOffice?1.15 * machineEfficiency * globalInfluenceBoostMultiplier * policyCapitalMultiplier',
}

const UNIT_POWER_FORMULAS: Record<UnitId, string> = {
  intern: '0 live runtime power usage',
  juniorTrader: '0 live runtime power usage',
  seniorTrader: '0 live runtime power usage',
  quantTrader: '0 live runtime power usage',
  propDesk: '0 live runtime power usage',
  institutionalDesk: '0 live runtime power usage',
  hedgeFund: '0 live runtime power usage',
  investmentFirm: '0 live runtime power usage',
  ruleBasedBot: '1.5 * dataCenterEnergyCredits?0.8 * coolingSystems?0.9 * computeOptimizationMultiplier',
  mlTradingBot: '8 * dataCenterEnergyCredits?0.8 * coolingSystems?0.9 * computeOptimizationMultiplier',
  aiTradingBot: '30 * coolingSystems?0.9 * computeOptimizationMultiplier',
  internResearchScientist: '0 live runtime power usage',
  juniorResearchScientist: '0 live runtime power usage',
  seniorResearchScientist: '0 live runtime power usage',
  juniorPolitician: '0 live runtime power usage',
}

const UNIT_NOTES: Partial<Record<UnitId, string>> = {
  quantTrader: 'baseIncomePerSecond exists in unit data for display, but runtime passive cash contribution is 0; value comes from automation cycles',
  intern: 'desk-limited purchase; uses 1 desk slot each',
  juniorTrader: 'desk-limited purchase; uses 1 desk slot each',
  seniorTrader: 'desk-limited purchase; uses 1 desk slot each; only trader unit with implemented specialist system',
  propDesk: 'no desk-slot usage; can be sector-assigned and mandated',
  institutionalDesk: 'purchase also requires at least 1 serverRoom',
  hedgeFund: 'purchase also requires at least 1 dataCenter',
  investmentFirm: 'purchase also requires at least 1 cloudCompute',
  ruleBasedBot: 'purchase blocked by live power headroom',
  mlTradingBot: 'purchase blocked by live power headroom and requires dataCenterCount > 0',
  aiTradingBot: 'purchase blocked by live power headroom and requires cloudComputeCount > 0',
  internResearchScientist: 'desk-limited purchase; uses 1 desk slot each',
  juniorResearchScientist: 'desk-limited purchase; uses 1 desk slot each',
  seniorResearchScientist: 'desk-limited purchase; uses 1 desk slot each',
  juniorPolitician: 'lobbying unit is not desk-limited and has no live power usage',
}

const CAPACITY_UNLOCK_RULES: Record<CapacityInfrastructureId, string> = {
  deskSpace: 'available from start',
  floorSpace: 'requires purchasedResearchTech.floorSpacePlanning === true',
  office: 'requires purchasedResearchTech.officeExpansionPlanning === true',
}

const POWER_UNLOCK_RULES: Record<PowerInfrastructureId, string> = {
  serverRack: 'visible from start; new purchases require purchasedResearchTech.serverRackSystems === true',
  serverRoom: 'requires purchasedResearchTech.serverRackSystems === true and purchasedResearchTech.serverRoomSystems === true',
  dataCenter: 'requires purchasedResearchTech.serverRackSystems === true and purchasedResearchTech.dataCenterSystems === true',
  cloudCompute: 'requires purchasedResearchTech.serverRackSystems === true and purchasedResearchTech.cloudInfrastructure === true',
}

const POWER_COST_FORMULAS: Record<PowerInfrastructureId, string> = {
  serverRack: 'serverRackCost(n) = max(1, floor(1800 * 1.14^n * (industrialPowerSubsidies ? 0.9 : 1)))',
  serverRoom: 'serverRoomCost(n) = max(1, floor(100000 * 1.15^n * (industrialPowerSubsidies ? 0.9 : 1)))',
  dataCenter: 'dataCenterCost(n) = max(1, floor(1000000 * 1.21^n * (industrialPowerSubsidies ? 0.9 : 1)))',
  cloudCompute: 'cloudInfrastructureCost(n) = max(1, floor(6500000 * 1.24^n * (industrialPowerSubsidies ? 0.9 : 1)))',
}

const CAPACITY_COST_FORMULAS: Record<CapacityInfrastructureId, string> = {
  deskSpace: 'deskSpaceCost(n) = floor(180 * 1.08^n)',
  floorSpace: 'floorSpaceCost(n) = floor(8500 * 1.24^n)',
  office: 'officeCost(n) = floor(42000 * 1.38^n)',
}

const SPECIALIZATION_ROWS = [
  {
    id: 'seniorTraderFinanceSpecialist',
    name: 'Senior Trader Finance Specialist',
    specialization: 'finance',
    unlock: 'requires purchasedResearchTech.financeSpecialistTraining === true',
  },
  {
    id: 'seniorTraderTechnologySpecialist',
    name: 'Senior Trader Technology Specialist',
    specialization: 'technology',
    unlock: 'requires purchasedResearchTech.technologySpecialistTraining === true',
  },
  {
    id: 'seniorTraderEnergySpecialist',
    name: 'Senior Trader Energy Specialist',
    specialization: 'energy',
    unlock: 'requires purchasedResearchTech.energySpecialistTraining === true',
  },
] as const

const MANDATE_ROWS = [
  { unitId: 'propDesk', mandateId: 'finance', id: 'propDeskFinanceMandate', name: 'Prop Desk Finance Mandate', baseCost: 5000, bonus: '1.05 * trainingMethodologyMultiplier', unlock: 'requires purchasedResearchTech.financeMandateFramework === true' },
  { unitId: 'propDesk', mandateId: 'technology', id: 'propDeskTechnologyMandate', name: 'Prop Desk Technology Mandate', baseCost: 5000, bonus: '1.05 * trainingMethodologyMultiplier', unlock: 'requires purchasedResearchTech.techGrowthMandateFramework === true' },
  { unitId: 'propDesk', mandateId: 'energy', id: 'propDeskEnergyMandate', name: 'Prop Desk Energy Mandate', baseCost: 5000, bonus: '1.05 * trainingMethodologyMultiplier', unlock: 'requires purchasedResearchTech.energyExposureFramework === true' },
  { unitId: 'institutionalDesk', mandateId: 'finance', id: 'institutionalDeskFinanceMandate', name: 'Institutional Desk Finance Mandate', baseCost: 12000, bonus: '1.075 * trainingMethodologyMultiplier', unlock: 'requires purchasedResearchTech.financeMandateFramework === true' },
  { unitId: 'institutionalDesk', mandateId: 'technology', id: 'institutionalDeskTechnologyMandate', name: 'Institutional Desk Technology Mandate', baseCost: 12000, bonus: '1.075 * trainingMethodologyMultiplier', unlock: 'requires purchasedResearchTech.techGrowthMandateFramework === true' },
  { unitId: 'institutionalDesk', mandateId: 'energy', id: 'institutionalDeskEnergyMandate', name: 'Institutional Desk Energy Mandate', baseCost: 12000, bonus: '1.075 * trainingMethodologyMultiplier', unlock: 'requires purchasedResearchTech.energyExposureFramework === true' },
  { unitId: 'hedgeFund', mandateId: 'finance', id: 'hedgeFundFinanceMandate', name: 'Hedge Fund Finance Mandate', baseCost: 30000, bonus: '1.1 * trainingMethodologyMultiplier', unlock: 'requires purchasedResearchTech.financeMandateFramework === true' },
  { unitId: 'hedgeFund', mandateId: 'technology', id: 'hedgeFundTechnologyMandate', name: 'Hedge Fund Technology Mandate', baseCost: 30000, bonus: '1.1 * trainingMethodologyMultiplier', unlock: 'requires purchasedResearchTech.techGrowthMandateFramework === true' },
  { unitId: 'hedgeFund', mandateId: 'energy', id: 'hedgeFundEnergyMandate', name: 'Hedge Fund Energy Mandate', baseCost: 30000, bonus: '1.1 * trainingMethodologyMultiplier', unlock: 'requires purchasedResearchTech.energyExposureFramework === true' },
  { unitId: 'investmentFirm', mandateId: 'finance', id: 'investmentFirmFinanceMandate', name: 'Investment Firm Finance Mandate', baseCost: 75000, bonus: '1.125 * trainingMethodologyMultiplier', unlock: 'requires purchasedResearchTech.financeMandateFramework === true' },
  { unitId: 'investmentFirm', mandateId: 'technology', id: 'investmentFirmTechnologyMandate', name: 'Investment Firm Technology Mandate', baseCost: 75000, bonus: '1.125 * trainingMethodologyMultiplier', unlock: 'requires purchasedResearchTech.techGrowthMandateFramework === true' },
  { unitId: 'investmentFirm', mandateId: 'energy', id: 'investmentFirmEnergyMandate', name: 'Investment Firm Energy Mandate', baseCost: 75000, bonus: '1.125 * trainingMethodologyMultiplier', unlock: 'requires purchasedResearchTech.energyExposureFramework === true' },
] as const

const SYSTEM_FORMULAS = [
  {
    id: 'gameTickSeconds',
    name: 'Game Tick Seconds',
    value: 0.1,
    effect: 'tick runs every 100ms from App.tsx; each tick processes market events, compliance timer, timed boosts, passive resources, automation cycles, and milestones',
    source: sourceFiles('src/App.tsx', 'src/store/gameStore.ts'),
  },
  {
    id: 'manualIncomeFormula',
    name: 'Manual Income Formula',
    effect: 'manualIncome = manualBase * manualExecutionRefinementMultiplier * globalProfitMultiplier * timedProfitMultiplier * prestigeGlobalRecognitionMultiplier; manualBase starts at 1, betterTerminal sets to 2, premiumDataFeed multiplies by 1.25 twice, tradeShortcuts adds 1',
    source: sourceFiles('src/utils/economy.ts', 'src/data/upgrades.ts', 'src/data/repeatableUpgrades.ts', 'src/utils/prestige.ts', 'src/utils/boosts.ts'),
  },
  {
    id: 'displayedCashPerSecondFormula',
    name: 'Displayed Cash Per Second Formula',
    effect: 'displayedCashPerSecond = passiveCashPerSecond + quantTraderAverageIncomePerSecond + ruleBasedBotAverageIncomePerSecond + mlBotAverageIncomePerSecond + aiBotAverageIncomePerSecond',
    source: sourceFiles('src/store/selectors.ts', 'src/utils/economy.ts', 'src/utils/automation.ts'),
  },
  {
    id: 'passiveCashPerSecondFormula',
    name: 'Passive Cash Per Second Formula',
    effect: 'passiveCashPerSecond = (human cash + institution cash from general desk and sectors) * globalProfitMultiplier * globalEventMultiplier * prestigeGlobalRecognitionMultiplier',
    source: sourceFiles('src/utils/economy.ts', 'src/utils/marketEvents.ts', 'src/utils/boosts.ts', 'src/utils/prestige.ts'),
  },
  {
    id: 'researchPointsPerSecondFormula',
    name: 'Research Points Per Second Formula',
    effect: 'researchPointsPerSecond = (tiered scientist RP sum after local upgrades) * institutionalResearchNetwork?1.2 * backtestingSuite?1.15 * crossDisciplinaryModels?1.1 * researchThroughputMultiplier * researchPrestigeMultiplier * machineEfficiency * complianceEfficiency * humanCompliancePenalty * researchSprint?1.5',
    source: sourceFiles('src/utils/economy.ts', 'src/data/upgrades.ts', 'src/data/repeatableUpgrades.ts', 'src/utils/prestige.ts', 'src/utils/boosts.ts', 'src/utils/compliance.ts'),
  },
  {
    id: 'influencePerSecondFormula',
    name: 'Influence Per Second Formula',
    effect: 'influencePerSecond = senators * 0.01 * policyReachMultiplier * policyAnalysisDesk?1.25 * donorNetwork?1.2 * governmentRelationsOffice?1.15 * machineEfficiency * globalInfluenceBoostMultiplier * policyCapitalMultiplier',
    source: sourceFiles('src/utils/economy.ts', 'src/data/upgrades.ts', 'src/data/repeatableUpgrades.ts', 'src/utils/prestige.ts', 'src/utils/boosts.ts'),
  },
  {
    id: 'deskSlotsFormula',
    name: 'Desk Slots Formula',
    effect: 'totalDeskSlots = baseDeskSlots + deskSpaceCount * 1 + floorSpaceCount * 25 + officeCount * 100; usedDeskSlots = interns + juniors + seniors + internScientists + juniorScientists + seniorScientists',
    source: sourceFiles('src/utils/capacity.ts', 'src/data/capacity.ts', 'src/data/initialState.ts'),
  },
  {
    id: 'powerCapacityFormula',
    name: 'Power Capacity Formula',
    effect: 'powerCapacity = (12 + serverRackCount*3*rackStacking?1.25 + serverRoomCount*30*roomScaleout?1.25 + dataCenterCount*220*dataCenterFabric?1.3 + cloudComputeCount*700*cloudBurstContracts?1.35) * priorityGridAccess?1.15 * powerDistribution?1.2 * powerCapacityPrestigeMultiplier * globalEnergySupplyBoostMultiplier',
    source: sourceFiles('src/utils/economy.ts', 'src/data/constants.ts', 'src/data/powerInfrastructure.ts', 'src/utils/prestige.ts', 'src/utils/boosts.ts'),
  },
  {
    id: 'powerUsageFormula',
    name: 'Power Usage Formula',
    effect: 'powerUsage = capacityInfrastructurePower + ruleBasedBotPower + mlTradingBotPower + aiTradingBotPower; humans, scientists, politicians, institutions, and quantTraders currently use 0 live runtime power',
    source: sourceFiles('src/utils/economy.ts', 'src/utils/capacity.ts', 'src/data/constants.ts'),
  },
  {
    id: 'machineEfficiencyFormula',
    name: 'Machine Efficiency Formula',
    effect: 'if usage <= 0 or usage <= capacity: machineEfficiency = energyCompliancePenalty; if usage > capacity: machineEfficiency = min(1, capacity/usage * aiInfrastructureIncentives?1.1:1) * gridStressWarning?0.9:1 * energyCompliancePenalty',
    source: sourceFiles('src/utils/economy.ts', 'src/utils/compliance.ts', 'src/utils/lobbying.ts', 'src/utils/marketEvents.ts'),
  },
  {
    id: 'automationPayoutFormula',
    name: 'Automation Payout Formula',
    effect: 'automationPayout = owned * basePayout * marketTargetMultiplier * sectorEventMultiplierIfTargeted * strategyMultiplier * automationEventMultiplier * automationOptimizationMultiplier * machineEfficiency * complianceEfficiency * automationCompliancePenalty * timedAutomationBoostMultiplier * globalProfitMultiplier * prestigeGlobalRecognitionMultiplier',
    source: sourceFiles('src/utils/automation.ts', 'src/utils/economy.ts', 'src/utils/compliance.ts', 'src/utils/boosts.ts', 'src/utils/marketEvents.ts', 'src/utils/prestige.ts'),
  },
  {
    id: 'automationDurationFormula',
    name: 'Automation Duration Formula',
    effect: 'cycleDuration = baseDuration * (executionRoutingStack?0.9 for ruleBasedBot) * (inferenceBatching?0.9 for mlTradingBot) * modelEfficiencyMultiplier',
    source: sourceFiles('src/utils/automation.ts', 'src/data/repeatableUpgrades.ts', 'src/data/upgrades.ts'),
  },
  {
    id: 'effectiveComplianceBurdenFormula',
    name: 'Effective Compliance Burden Formula',
    effect: 'effectiveComplianceBurden = max(0, baseComplianceBurden * (1 - complianceFrameworksRelief) * (regulatoryCounsel?0.92:1) * complianceSystemsMultiplier - flatLobbyingBurdenRelief)',
    source: sourceFiles('src/utils/compliance.ts', 'src/utils/lobbying.ts', 'src/utils/prestige.ts', 'src/data/repeatableUpgrades.ts'),
  },
  {
    id: 'complianceEfficiencyFormula',
    name: 'Compliance Efficiency Formula',
    effect: 'baseComplianceEfficiency = max(0.75, 1 - effectiveComplianceBurden * 0.005 * (1 / timedComplianceReliefMultiplier)); finalComplianceEfficiency = min(1, baseComplianceEfficiency + lobbyingPenaltyRelief + complianceFrameworksRelief)',
    source: sourceFiles('src/utils/compliance.ts', 'src/utils/boosts.ts', 'src/utils/lobbying.ts', 'src/utils/prestige.ts'),
  },
  {
    id: 'complianceReviewDueFormula',
    name: 'Compliance Review Due Formula',
    effect: 'categoryOutstandingDue = overdueAmount + currentCycleCost; projectedReviewBill = (staffOutstanding + energyOutstanding + automationOutstanding + institutionalOutstanding) / timedComplianceReliefMultiplier',
    source: sourceFiles('src/utils/compliance.ts', 'src/utils/boosts.ts'),
  },
  {
    id: 'complianceManualPaymentFormula',
    name: 'Compliance Manual Payment Formula',
    effect: 'manualCategoryPayment = min(cash, categoryOutstandingDue); remainingDue = categoryOutstandingDue - payment; this can prepay both overdue and current-cycle projected amount for a category',
    source: sourceFiles('src/utils/compliance.ts'),
  },
  {
    id: 'complianceAutopayFormula',
    name: 'Compliance Autopay Formula',
    effect: 'at each review rollover: overdue += currentCycleCost for each category, then enabled categories auto-pay in order [staff, energy, automation, institutional] using payment = min(cash, overdueAmount); autopay only touches overdue amounts after rollover',
    source: sourceFiles('src/utils/compliance.ts'),
  },
  {
    id: 'compliancePenaltyFormulas',
    name: 'Compliance Penalty Formulas',
    effect: 'humanPenalty = min(1, max(0.82, 1 - staffOverdue*0.0008) + humanPenaltyRelief); energyPenalty = max(0.82, 1 - energyOverdue*0.0008); automationPenalty = max(0.78, 1 - automationOverdue*0.001); institutionalPenalty = max(0.78, 1 - institutionalOverdue*0.001) * min(1, 1 + (1 - institutionalAccessMultiplier))',
    source: sourceFiles('src/utils/compliance.ts', 'src/utils/lobbying.ts', 'src/data/repeatableUpgrades.ts'),
  },
  {
    id: 'prestigeUnlockFormula',
    name: 'Prestige Unlock Formula',
    effect: `canPrestige = prestigeCount < 10 and lifetimeCashEarned >= thresholdByPrestigeCount[${PRESTIGE_TIERS.map((_tier, index) => getPrestigeLifetimeCashRequirement(index)).join(', ')}][prestigeCount] and (quantTraderCount > 0 or ruleBasedBotCount > 0)`,
    source: sourceFiles('src/utils/prestige.ts', 'src/data/constants.ts'),
  },
  {
    id: 'prestigeGainFormula',
    name: 'Prestige Gain Formula',
    effect: `prestigeGain = floor([${PRESTIGE_REPUTATION_GAIN_CURVE.join(', ')}][prestigeCount] * (globalReputationBoost?1.05:1)); extra lifetime cash above threshold does not increase the reward`,
    source: sourceFiles('src/utils/prestige.ts', 'src/data/prestigeUpgrades.ts', 'src/data/boosts.ts'),
  },
  {
    id: 'prestigeUpgradeCostFormula',
    name: 'Prestige Upgrade Cost Formula',
    effect: 'next prestige upgrade rank cost = 1 for currentRank 0-2, 2 for 3-5, 3 for 6-7, 4 for 8+',
    source: sourceFiles('src/utils/prestige.ts'),
  },
  {
    id: 'offlineCapFormula',
    name: 'Offline Cap Formula',
    effect: 'appliedOfflineSeconds = min(floor((now - lastSaveTimestamp)/1000), 28800)',
    source: sourceFiles('src/utils/offlineProgress.ts', 'src/data/constants.ts'),
  },
  {
    id: 'marketEventCooldownFormula',
    name: 'Market Event Cooldown Formula',
    effect: `next event cooldown = random integer from ${MARKET_EVENT_COOLDOWN_MIN_SECONDS} to ${MARKET_EVENT_COOLDOWN_MAX_SECONDS}; immediate repeat of the most recent event is avoided`,
    source: sourceFiles('src/utils/marketEvents.ts', 'src/data/marketEvents.ts'),
  },
]

const QUIRK_ROWS = [
  { id: 'premiumDataFeedDoubleApply', name: 'Premium Data Feed Double Applies To Manual Income', note: 'premiumDataFeed multiplies manual click value by 1.25 twice in getManualIncome()', source: sourceFiles('src/utils/economy.ts', 'src/data/upgrades.ts') },
  { id: 'mandateAlignmentFrameworkUnused', name: 'Mandate Alignment Framework Unused', note: 'upgrade exists in data and UI but is not referenced by runtime formulas', source: sourceFiles('src/data/upgrades.ts') },
  { id: 'analyticalModelingUnused', name: 'Analytical Modeling Unused', note: 'repeatable exists but no runtime formula reads it', source: sourceFiles('src/data/repeatableUpgrades.ts', 'src/utils/automation.ts', 'src/utils/economy.ts') },
  { id: 'institutionalAccessPenaltyClamp', name: 'Institutional Access Penalty Clamp', note: 'institutionalAccess reduces institutional compliance costs, but its overdue-penalty softening factor is clamped back to 1, so it has no practical effect there', source: sourceFiles('src/utils/compliance.ts', 'src/data/repeatableUpgrades.ts') },
  { id: 'displayedCashPerSecondIncludesAutomationAverage', name: 'Displayed Cash Per Second Includes Automation Average', note: 'UI headline cash/sec includes automation average income even though automation pays in cycle bursts', source: sourceFiles('src/store/selectors.ts', 'src/utils/automation.ts', 'src/utils/economy.ts') },
  { id: 'quantTraderIsAutomationNotPassive', name: 'Quant Trader Is Automation Not Passive', note: 'quantTrader baseIncomePerSecond exists in unit data, but getQuantTraderIncome() returns 0 and runtime cash comes from 20-cash cycle payouts every 4 seconds', source: sourceFiles('src/data/units.ts', 'src/data/automation.ts', 'src/utils/economy.ts', 'src/utils/automation.ts') },
  { id: 'humansAndInstitutionsUseZeroLivePower', name: 'Humans And Institutions Use Zero Live Power', note: 'several power constants exist for humans and institutions, but live runtime power formula only counts capacity infrastructure and non-quant automation', source: sourceFiles('src/data/constants.ts', 'src/utils/economy.ts', 'src/utils/compliance.ts') },
  { id: 'gridStressOnlyMattersOverCap', name: 'Grid Stress Warning Only Matters Over Power Cap', note: 'machineEfficiency event modifier is only multiplied in the over-cap branch of getMachineEfficiencyMultiplier()', source: sourceFiles('src/utils/economy.ts', 'src/utils/marketEvents.ts') },
  { id: 'liquidityCrunchPassiveCashOnly', name: 'Liquidity Crunch Hits Passive Cash Only', note: 'global event multiplier is used by passive cash formulas but not research, influence, or automation payout formulas', source: sourceFiles('src/utils/economy.ts', 'src/utils/automation.ts', 'src/utils/marketEvents.ts') },
  { id: 'startingServerRackFree', name: 'Starting Server Rack Is Free', note: 'initial state starts with serverRackCount = 1; the first-rack milestone subtracts this free starting rack', source: sourceFiles('src/data/initialState.ts', 'src/utils/milestones.ts') },
  { id: 'timedBoostActivationCounterCanOvercount', name: 'Timed Boost Activation Counter Can Overcount', note: 'store increments totalTimedBoostActivations whenever activateTimedBoost() is called, even if the boost cannot actually activate', source: sourceFiles('src/store/gameStore.ts', 'src/utils/boosts.ts') },
  { id: 'complianceFreezeDoesNotDiscountManualCategoryPay', name: 'Compliance Freeze Does Not Discount Manual Category Pay', note: 'complianceFreeze reduces compliance drag and the projected full review total, but payComplianceCategoryNow() still uses raw per-category outstanding due before the relief divisor', source: sourceFiles('src/utils/compliance.ts', 'src/utils/boosts.ts') },
  { id: 'shortNumberThresholdUnused', name: 'Short Number Threshold Setting Unused', note: 'settings.shortNumberThreshold is persisted but shared formatting helpers hardcode 1,000,000', source: sourceFiles('src/data/initialState.ts', 'src/utils/formatting.ts', 'src/utils/persistence.ts') },
]

for (const [id, value] of Object.entries(GAME_CONSTANTS)) {
  addRow({
    category: 'constant',
    subtype: 'game_constant',
    id,
    name: id,
    value: typeof value === 'number' ? value : String(value),
    notes:
      id === 'internPowerUsage' || id === 'juniorTraderPowerUsage' || id === 'seniorTraderPowerUsage' || id === 'internScientistPowerUsage' || id === 'juniorScientistPowerUsage' || id === 'seniorScientistPowerUsage' || id === 'propDeskPowerUsage' || id === 'institutionalDeskPowerUsage' || id === 'hedgeFundPowerUsage' || id === 'investmentFirmPowerUsage'
        ? 'defined in constants but not used by live runtime power formulas'
        : id === 'directReputationBonusPerPoint' || id === 'brandRecognitionBonusPerRank' || id === 'institutionalKnowledgeResearchBonusPerRank'
          ? 'legacy/unused balance constant in current runtime'
          : '',
    source_files: sourceFiles('src/data/constants.ts'),
  })
}

addRow({
  category: 'constant',
  subtype: 'game_constant',
  id: 'tickIntervalMs',
  name: 'Tick Interval Milliseconds',
  value: 100,
  notes: 'tick cadence is defined in App.tsx via setInterval(..., 100)',
  source_files: sourceFiles('src/App.tsx'),
})

addRow({
  category: 'constant',
  subtype: 'game_constant',
  id: 'marketEventHistoryLimit',
  name: 'Market Event History Limit',
  value: MARKET_EVENT_HISTORY_LIMIT,
  source_files: sourceFiles('src/data/marketEvents.ts'),
})

for (const [id, value] of Object.entries({
  startingCash: initialState.cash,
  startingResearchPoints: initialState.researchPoints,
  startingInfluence: initialState.influence,
  startingReputation: initialState.reputation,
  startingBaseDeskSlots: initialState.baseDeskSlots,
  startingServerRackCount: initialState.serverRackCount,
  startingComplianceReviewRemainingSeconds: initialState.complianceReviewRemainingSeconds,
  startingNextMarketEventCooldownSeconds: initialState.nextMarketEventCooldownSeconds,
})) {
  addRow({
    category: 'starting_state',
    subtype: 'initial_value',
    id,
    name: id,
    value,
    source_files: sourceFiles('src/data/initialState.ts'),
  })
}

for (const [id, unlocked] of Object.entries(DEFAULT_UNLOCKED_SECTORS)) {
  addRow({
    category: 'starting_state',
    subtype: 'initial_unlock',
    id: `startingSector_${id}`,
    name: `Starting Sector ${id}`,
    value: unlocked,
    source_files: sourceFiles('src/data/sectors.ts', 'src/data/initialState.ts'),
  })
}

for (const formula of SYSTEM_FORMULAS) {
  addRow({
    category: 'system_formula',
    subtype: 'formula',
    id: formula.id,
    name: formula.name,
    value: formula.value ?? '',
    effect_formula: formula.effect,
    source_files: formula.source,
  })
}

for (const unit of Object.values(UNITS)) {
  const automationUnit = unit.id in AUTOMATION_UNITS ? AUTOMATION_UNITS[unit.id as AutomationUnitId] : null
  const baseOutput = unit.baseResearchPointsPerSecond ?? unit.baseInfluencePerSecond ?? unit.baseIncomePerSecond ?? ''
  const outputUnit = unit.baseResearchPointsPerSecond !== undefined
    ? 'research/sec'
    : unit.baseInfluencePerSecond !== undefined
      ? 'influence/sec'
      : automationUnit
        ? 'cash/cycle'
        : 'cash/sec'
  const avgOutput = automationUnit ? automationUnit.basePayout / automationUnit.cycleDurationSeconds : baseOutput
  const avgOutputUnit = automationUnit ? 'cash/sec average' : outputUnit

  addRow({
    category: 'unit',
    subtype: UNIT_KIND[unit.id],
    id: unit.id,
    name: unit.name,
    group: unit.tab,
    currency: 'cash',
    base_cost: unit.baseCost,
    cost_scaling: unit.costScaling,
    base_output: automationUnit ? automationUnit.basePayout : baseOutput,
    output_unit: outputUnit,
    avg_output_per_second: avgOutput,
    avg_output_unit: avgOutputUnit,
    duration_seconds: automationUnit?.cycleDurationSeconds ?? '',
    power_usage: automationUnit?.powerUse ?? 0,
    power_formula: UNIT_POWER_FORMULAS[unit.id],
    desk_slots: DESK_LIMITED_UNITS.has(unit.id) ? 1 : 0,
    cost_formula: UNIT_COST_FORMULAS[unit.id],
    bulk_formula: UNIT_BULK_FORMULA,
    effect_formula: UNIT_EFFECT_FORMULAS[unit.id],
    prerequisites: unit.unlockUpgradeId,
    unlock_rule: UNIT_UNLOCK_RULES[unit.id],
    notes: unit.description + (UNIT_NOTES[unit.id] ? ` | ${UNIT_NOTES[unit.id]}` : ''),
    source_files: automationUnit
      ? sourceFiles('src/data/units.ts', 'src/data/automation.ts', 'src/utils/economy.ts', 'src/utils/automation.ts', 'src/utils/prestige.ts', 'src/utils/compliance.ts', 'src/utils/boosts.ts', 'src/utils/marketEvents.ts')
      : unit.baseResearchPointsPerSecond !== undefined
        ? sourceFiles('src/data/units.ts', 'src/utils/economy.ts', 'src/utils/prestige.ts', 'src/utils/compliance.ts', 'src/utils/boosts.ts')
        : unit.baseInfluencePerSecond !== undefined
          ? sourceFiles('src/data/units.ts', 'src/utils/economy.ts', 'src/utils/prestige.ts', 'src/utils/boosts.ts')
          : sourceFiles('src/data/units.ts', 'src/utils/economy.ts', 'src/utils/prestige.ts', 'src/utils/compliance.ts', 'src/utils/boosts.ts', 'src/utils/marketEvents.ts', 'src/utils/specialization.ts', 'src/utils/mandates.ts'),
  })
}

for (const infrastructure of Object.values(CAPACITY_INFRASTRUCTURE)) {
  addRow({
    category: 'capacity_infrastructure',
    subtype: 'desk_capacity',
    id: infrastructure.id,
    name: infrastructure.name,
    currency: 'cash',
    base_cost: infrastructure.baseCost,
    cost_scaling: infrastructure.costScaling,
    base_output: infrastructure.slotsGranted,
    output_unit: 'desk_slots',
    power_usage: infrastructure.powerUsage,
    power_formula: `${infrastructure.powerUsage} per owned`,
    desk_slots: infrastructure.slotsGranted,
    cost_formula: CAPACITY_COST_FORMULAS[infrastructure.id],
    bulk_formula: 'bulkCapacityCost = sum(itemCost(owned + i)); max buy stops on cash shortage or live power shortage',
    effect_formula: `totalDeskSlots += ${infrastructure.slotsGranted} per owned; powerUsage += ${infrastructure.powerUsage} per owned`,
    unlock_rule: CAPACITY_UNLOCK_RULES[infrastructure.id],
    notes: infrastructure.description,
    source_files: sourceFiles('src/data/capacity.ts', 'src/utils/capacity.ts', 'src/utils/economy.ts'),
  })
}

for (const infrastructure of Object.values(POWER_INFRASTRUCTURE)) {
  addRow({
    category: 'power_infrastructure',
    subtype: 'power_capacity',
    id: infrastructure.id,
    name: infrastructure.name,
    currency: 'cash',
    base_cost: infrastructure.baseCost,
    cost_scaling: infrastructure.costScaling,
    base_output: infrastructure.powerCapacity,
    output_unit: 'power_capacity',
    power_capacity: infrastructure.powerCapacity,
    cost_formula: POWER_COST_FORMULAS[infrastructure.id],
    bulk_formula: 'bulkPowerInfrastructureCost = sum(itemCost(owned + i)); max buy stops on cash shortage only',
    effect_formula:
      infrastructure.id === 'serverRack'
        ? 'adds 3 power capacity per owned before upgrade/policy/prestige/global multipliers'
        : infrastructure.id === 'serverRoom'
          ? 'adds 30 power capacity per owned before multipliers'
          : infrastructure.id === 'dataCenter'
            ? 'adds 220 power capacity per owned before multipliers'
            : 'adds 700 power capacity per owned before multipliers',
    unlock_rule: POWER_UNLOCK_RULES[infrastructure.id],
    notes: infrastructure.description,
    source_files: sourceFiles('src/data/powerInfrastructure.ts', 'src/utils/economy.ts', 'src/utils/research.ts', 'src/utils/lobbying.ts'),
  })
}

for (const upgrade of UPGRADES) {
  addRow({
    category: 'one_time_upgrade',
    subtype: 'upgrade',
    id: upgrade.id,
    name: upgrade.name,
    group: upgrade.group,
    currency: 'cash',
    base_cost: upgrade.cost,
    cost_formula: `fixedCost = ${upgrade.cost}`,
    effect_formula: UPGRADE_EFFECT_FORMULAS[upgrade.id],
    visible_rule: fnString(upgrade.visibleWhen),
    notes: upgrade.description + (UPGRADE_NOTES[upgrade.id] ? ` | ${UPGRADE_NOTES[upgrade.id]}` : ''),
    source_files: sourceFiles('src/data/upgrades.ts', 'src/utils/economy.ts', 'src/utils/automation.ts', 'src/utils/compliance.ts', 'src/utils/prestige.ts', 'src/utils/boosts.ts'),
  })
}

for (const upgrade of REPEATABLE_UPGRADES) {
  addRow({
    category: 'repeatable_upgrade',
    subtype: 'repeatable',
    id: upgrade.id,
    name: upgrade.name,
    family: upgrade.family,
    currency: upgrade.currency,
    base_cost: upgrade.baseCost,
    cost_scaling: upgrade.costScaling,
    max_rank: upgrade.maxRank,
    cost_formula: `rankCost(r) = floor(${upgrade.baseCost} * ${upgrade.costScaling}^r)`,
    bulk_formula: 'bulk repeatable cost = sum(rankCost(currentRank + i)); max buy stops on currency shortage or rank 100',
    effect_formula: REPEATABLE_EFFECT_FORMULAS[upgrade.id],
    visible_rule: fnString(upgrade.visibleWhen),
    unlock_rule: fnString(upgrade.unlockWhen),
    notes: `${upgrade.perRankDescription} | ${upgrade.description}`,
    source_files: sourceFiles('src/data/repeatableUpgrades.ts', 'src/utils/economy.ts', 'src/utils/automation.ts', 'src/utils/compliance.ts', 'src/utils/mandates.ts', 'src/utils/specialization.ts'),
  })
}

for (const tech of RESEARCH_TECH) {
  addRow({
    category: 'research_tech',
    subtype: 'research',
    id: tech.id,
    name: tech.name,
    branch: tech.branch,
    currency: tech.currency,
    base_cost: tech.researchCost,
    cost_formula: `fixedCost = ${tech.researchCost}`,
    effect_formula: tech.description,
    prerequisites: (tech.prerequisites ?? []).join(' | '),
    visible_rule: fnString(tech.visibleWhen),
    unlock_rule: fnString(tech.unlockWhen),
    notes: tech.lockedReason ? compact(tech.lockedReason.toString()) : '',
    source_files: sourceFiles('src/data/researchTech.ts', 'src/utils/research.ts', 'src/utils/economy.ts', 'src/utils/automation.ts'),
  })
}

for (const policy of LOBBYING_POLICIES) {
  addRow({
    category: 'lobbying_policy',
    subtype: 'policy',
    id: policy.id,
    name: policy.name,
    track: policy.track,
    currency: 'influence',
    base_cost: policy.influenceCost,
    cost_formula: `fixedCost = ${policy.influenceCost}`,
    effect_formula: POLICY_EFFECT_FORMULAS[policy.id],
    unlock_rule: 'requires purchasedResearchTech.regulatoryAffairs === true',
    notes: policy.description,
    source_files: sourceFiles('src/data/lobbyingPolicies.ts', 'src/utils/lobbying.ts', 'src/utils/economy.ts', 'src/utils/compliance.ts'),
  })
}

for (const sector of Object.values(SECTORS)) {
  addRow({
    category: 'sector',
    subtype: 'market_sector',
    id: sector.id,
    name: sector.name,
    value: sector.baseProfitMultiplier,
    base_output: sector.baseProfitMultiplier,
    output_unit: 'base_profit_multiplier',
    effect_formula: `sector base multiplier = ${sector.baseProfitMultiplier}`,
    unlock_rule:
      sector.id === 'finance'
        ? 'unlocked by default'
        : sector.id === 'technology'
          ? 'requires purchasedResearchTech.technologyMarkets === true'
          : 'requires purchasedResearchTech.energyMarkets === true',
    notes: sector.description,
    source_files: sourceFiles('src/data/sectors.ts', 'src/utils/research.ts', 'src/utils/economy.ts'),
  })
}

for (const strategyId of Object.keys(AUTOMATION_STRATEGIES) as AutomationStrategyId[]) {
  const strategy = AUTOMATION_STRATEGIES[strategyId]
  addRow({
    category: 'automation_strategy',
    subtype: 'strategy',
    id: strategy.id,
    name: strategy.name,
    effect_formula:
      strategy.id === 'meanReversion'
        ? 'finance target => 1.12; other targets or no target => 1.02'
        : strategy.id === 'momentum'
          ? 'technology target => 1.16; energy target => 1.05; finance/no target => 0.98'
          : strategy.id === 'arbitrage'
            ? 'finance target => 1.08; other targets or no target => 1.03'
            : strategy.id === 'marketMaking'
              ? 'finance target => 1.1; other targets or no target => 1.01'
              : 'technology target => 1.1; finance target => 1.04; energy or no target => 1.06',
    unlock_rule:
      strategy.id === 'meanReversion'
        ? 'requires purchasedResearchTech.meanReversionModels === true'
        : strategy.id === 'momentum'
          ? 'requires purchasedResearchTech.momentumModels === true'
          : strategy.id === 'arbitrage'
            ? 'requires purchasedResearchTech.arbitrageEngine === true'
            : strategy.id === 'marketMaking'
              ? 'requires purchasedResearchTech.marketMakingEngine === true'
              : 'requires purchasedResearchTech.scalpingFramework === true',
    notes: `${strategy.description} | strategy multiplier is further multiplied by signalQualityControlMultiplier`,
    source_files: sourceFiles('src/data/automation.ts', 'src/utils/automation.ts', 'src/data/repeatableUpgrades.ts'),
  })
}

for (const boost of Object.values(TIMED_BOOSTS)) {
  addRow({
    category: 'timed_boost',
    subtype: 'boost',
    id: boost.id,
    name: boost.name,
    duration_seconds: boost.durationSeconds,
    cooldown_seconds: boost.cooldownSeconds,
    effect_formula: TIMED_BOOST_EFFECT_FORMULAS[boost.id],
    unlock_rule: `requires purchasedResearchTech.${boost.unlockResearchTechId} === true`,
    notes: `${boost.description} | auto activation requires purchasedResearchTech.boostAutomationProtocols === true and autoEnabled === true`,
    source_files: sourceFiles('src/data/boosts.ts', 'src/utils/boosts.ts', 'src/store/gameStore.ts'),
  })
}

for (const boost of Object.values(GLOBAL_BOOSTS)) {
  addRow({
    category: 'global_boost',
    subtype: 'boost',
    id: boost.id,
    name: boost.name,
    value: boost.multiplier,
    base_output: boost.multiplier,
    output_unit: 'multiplier',
    effect_formula: GLOBAL_BOOST_EFFECT_FORMULAS[boost.id],
    notes: `${boost.description} | runtime supports owned toggle only; no normal purchase mechanic is defined in gameplay code`,
    source_files: sourceFiles('src/data/boosts.ts', 'src/utils/boosts.ts', 'src/store/gameStore.ts'),
  })
}

for (const event of Object.values(MARKET_EVENTS)) {
  addRow({
    category: 'market_event',
    subtype: event.category,
    id: event.id,
    name: event.name,
    duration_seconds: event.durationSeconds,
    effect_formula: MARKET_EVENT_EFFECT_FORMULAS[event.id],
    notes: event.description,
    source_files: sourceFiles('src/data/marketEvents.ts', 'src/utils/marketEvents.ts', 'src/utils/economy.ts', 'src/utils/automation.ts'),
  })
}

for (const upgrade of PRESTIGE_UPGRADES) {
  addRow({
    category: 'prestige_upgrade',
    subtype: 'prestige',
    id: upgrade.id,
    name: upgrade.name,
    max_rank: upgrade.maxRank,
    cost_formula: 'next rank cost = 1 for currentRank 0-2, 2 for 3-5, 3 for 6-7, 4 for 8+',
    effect_formula: PRESTIGE_EFFECT_FORMULAS[upgrade.id],
    notes: upgrade.description,
    source_files: sourceFiles('src/data/prestigeUpgrades.ts', 'src/utils/prestige.ts'),
  })
}

addRow({
  category: 'prestige_rule',
  subtype: 'tier_labels',
  id: 'prestigeTiers',
  name: 'Prestige Tiers',
  value: PRESTIGE_TIERS.length,
  notes: PRESTIGE_TIERS.map((tierId) => `${tierId}:${PRESTIGE_TIER_LABELS[tierId]}`).join(' | '),
  source_files: sourceFiles('src/data/prestigeUpgrades.ts'),
})

for (const spec of SPECIALIZATION_ROWS) {
  addRow({
    category: 'trader_specialization',
    subtype: 'specialist_training',
    id: spec.id,
    name: spec.name,
    currency: 'cash',
    base_cost: 2000,
    cost_formula: 'trainingCost = 2000 each (no scaling)',
    effect_formula: `matching-sector senior trader specialist bonus = 1.2 * trainingMethodologyMultiplier; active count equals trained count once matching sector is unlocked`,
    unlock_rule: spec.unlock,
    notes: `trained specialists are removed from the generic senior trader pool and automatically count toward the matching sector when that sector is unlocked`,
    source_files: sourceFiles('src/utils/specialization.ts', 'src/store/gameStore.ts', 'src/data/researchTech.ts'),
  })
}

for (const mandate of MANDATE_ROWS) {
  addRow({
    category: 'institution_mandate',
    subtype: mandate.unitId,
    id: mandate.id,
    name: mandate.name,
    currency: 'cash',
    base_cost: mandate.baseCost,
    cost_formula: `applicationCost = ${mandate.baseCost} each (no scaling)`,
    effect_formula: `matching-sector mandate bonus = ${mandate.bonus}; active count = min(appliedMandates, unitsAssignedToSameSector)`,
    unlock_rule: mandate.unlock,
    notes: `applying a mandate removes the unit from the generic ${mandate.unitId} pool`,
    source_files: sourceFiles('src/utils/mandates.ts', 'src/store/gameStore.ts', 'src/data/researchTech.ts'),
  })
}

for (const milestone of MILESTONES) {
  addRow({
    category: 'milestone',
    subtype: milestone.category,
    id: milestone.id,
    name: milestone.name,
    value: milestone.displayOrder,
    condition_rule: milestone.description,
    reward_formula: rewardSummary(milestone.reward),
    notes: `visibleByDefault=${milestone.visibleByDefault ? 'true' : 'false'}${milestone.achievementKey ? ` | achievementKey=${milestone.achievementKey}` : ''}`,
    source_files: sourceFiles('src/data/milestones.ts', 'src/utils/milestones.ts'),
  })
}

for (const quirk of QUIRK_ROWS) {
  addRow({
    category: 'quirk',
    subtype: 'implementation_mismatch',
    id: quirk.id,
    name: quirk.name,
    notes: quirk.note,
    source_files: quirk.source,
  })
}

const csv = [
  columns.join(','),
  ...rows.map((row) => columns.map((column) => csvEscape(serialize(row[column]))).join(',')),
].join('\n')

writeFileSync(OUTPUT_PATH, csv)
console.log(`Wrote ${rows.length} rows to ${OUTPUT_PATH.pathname}`)
