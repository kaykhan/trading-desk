import { getRepeatableUpgradeMultiplier } from '../data/repeatableUpgrades'
import { mechanics } from '../lib/mechanics'
import type { ComplianceCostBreakdown, CompliancePaymentCategoryId, CompliancePaymentEntry, CompliancePaymentState, ComplianceSourceSummary, GameState } from '../types/game'
import { getTimedComplianceReliefMultiplier } from './boosts'
import { getComplianceFrameworksRelief } from './prestige'
import {
  getAutomationComplianceCostReliefRate,
  getAutomationOversightRelief,
  getComplianceBurdenRelief,
  getCompliancePenaltyRelief,
  getEnergyComplianceCostReliefRate,
  getHumanCompliancePenaltyRelief,
  getInstitutionalComplianceCostReliefRate,
  getInstitutionalReportingRelief,
  getSectorComplianceRelief,
  getStaffComplianceCostReliefRate,
} from './lobbying'

const COMPLIANCE_REVIEW_INTERVAL_SECONDS = mechanics.runtime.compliance.reviewIntervalSeconds
const COMPLIANCE_REVEAL_BURDEN = mechanics.runtime.compliance.revealBurdenThreshold
const COMPLIANCE_EFFICIENCY_FLOOR = mechanics.runtime.compliance.efficiencyFloor
const COMPLIANCE_EFFICIENCY_LOSS_PER_BURDEN = mechanics.runtime.compliance.efficiencyLossPerBurden
const COMPLIANCE_PARAMS = mechanics.compliance
const UPGRADE_MULTIPLIERS = mechanics.multipliers.upgrades
const POLICY_MULTIPLIERS = mechanics.multipliers.policies
const OVERDUE_PENALTY = COMPLIANCE_PARAMS.overduePenalty as Record<'human' | 'energy' | 'automation' | 'institutional', { floor: number; ratePerCurrency: number }>

function getComplianceNumber(bucket: string, key: string): number {
  return Number((COMPLIANCE_PARAMS[bucket] as Record<string, number>)[key])
}

function roundComplianceValue(value: number): number {
  return Math.max(0, Math.round(value * 100) / 100)
}

function getEnergyOptimizationReduction(state: GameState): number {
  return Math.max(0, 1 - getRepeatableUpgradeMultiplier(state, 'computeOptimization'))
}

function getServerEfficiencyReduction(state: GameState): number {
  return Math.max(0, 1 - getRepeatableUpgradeMultiplier(state, 'computeOptimization'))
}

function getCompliancePowerCapacity(state: GameState): number {
  let capacity = Number(mechanics.constants.baseUtilityPowerCapacity)
    + state.serverRackCount * mechanics.powerInfrastructure.serverRack.powerCapacity * (state.purchasedUpgrades.rackStacking ? Number(UPGRADE_MULTIPLIERS.rackStacking) : 1)
    + state.serverRoomCount * mechanics.powerInfrastructure.serverRoom.powerCapacity * (state.purchasedUpgrades.roomScaleout ? Number(UPGRADE_MULTIPLIERS.roomScaleout) : 1)
    + state.dataCenterCount * mechanics.powerInfrastructure.dataCenter.powerCapacity * (state.purchasedUpgrades.dataCenterFabric ? Number(UPGRADE_MULTIPLIERS.dataCenterFabric) : 1)
    + state.cloudComputeCount * mechanics.powerInfrastructure.cloudCompute.powerCapacity * (state.purchasedUpgrades.cloudBurstContracts ? Number(UPGRADE_MULTIPLIERS.cloudBurstContracts) : 1)

  if (state.purchasedPolicies.priorityGridAccess) {
    capacity *= Number(POLICY_MULTIPLIERS.priorityGridAccessPowerCapacity)
  }

  if (state.purchasedUpgrades.powerDistribution) {
    capacity *= Number(UPGRADE_MULTIPLIERS.powerDistribution)
  }

  return capacity
}

function getCompliancePowerUsage(state: GameState): number {
  let ruleBasedBotUsage = state.ruleBasedBotCount * Number(mechanics.units.ruleBasedBot.livePowerUse)
  let mlBotUsage = state.mlTradingBotCount * Number(mechanics.units.mlTradingBot.livePowerUse)
  let aiBotUsage = state.aiTradingBotCount * Number(mechanics.units.aiTradingBot.livePowerUse)

  if (state.purchasedPolicies.dataCenterEnergyCredits) {
    ruleBasedBotUsage *= Number(POLICY_MULTIPLIERS.dataCenterEnergyCreditsBotPowerUsage)
    mlBotUsage *= Number(POLICY_MULTIPLIERS.dataCenterEnergyCreditsBotPowerUsage)
  }

  if (state.purchasedUpgrades.coolingSystems) {
    ruleBasedBotUsage *= Number(UPGRADE_MULTIPLIERS.coolingSystemsPowerUsage)
    mlBotUsage *= Number(UPGRADE_MULTIPLIERS.coolingSystemsPowerUsage)
    aiBotUsage *= Number(UPGRADE_MULTIPLIERS.coolingSystemsPowerUsage)
  }

  ruleBasedBotUsage *= 1 - getEnergyOptimizationReduction(state)
  mlBotUsage *= 1 - getEnergyOptimizationReduction(state)
  aiBotUsage *= 1 - getServerEfficiencyReduction(state)

  return ruleBasedBotUsage + mlBotUsage + aiBotUsage
}

export function formatComplianceReviewTimer(seconds: number): string {
  const clamped = Math.max(0, Math.ceil(seconds))
  const minutes = Math.floor(clamped / 60)
  const remainingSeconds = clamped % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export function getComplianceReviewIntervalSeconds(): number {
  return COMPLIANCE_REVIEW_INTERVAL_SECONDS
}

export function getComplianceRevealBurdenThreshold(): number {
  return COMPLIANCE_REVEAL_BURDEN
}

export function getStaffComplianceBurden(state: GameState): number {
  return roundComplianceValue(
    state.internCount * getComplianceNumber('burdenPerUnit', 'intern')
      + state.juniorTraderCount * getComplianceNumber('burdenPerUnit', 'juniorTrader')
      + state.seniorTraderCount * getComplianceNumber('burdenPerUnit', 'seniorTrader')
      + state.internResearchScientistCount * getComplianceNumber('burdenPerUnit', 'internResearchScientist')
      + state.juniorResearchScientistCount * getComplianceNumber('burdenPerUnit', 'juniorResearchScientist')
      + state.seniorResearchScientistCount * getComplianceNumber('burdenPerUnit', 'seniorResearchScientist')
      + state.juniorPoliticianCount * getComplianceNumber('burdenPerUnit', 'juniorPolitician'),
  )
}

export function getBaseStaffComplianceBurden(state: GameState): number {
  return getStaffComplianceBurden(state)
}

export function getInstitutionComplianceBurden(state: GameState): number {
  const baseValue = roundComplianceValue(
    state.propDeskCount * 2
      + state.institutionalDeskCount * 4
      + state.hedgeFundCount * 7
      + state.investmentFirmCount * 12,
  )

  return roundComplianceValue(Math.max(0, baseValue - getInstitutionalReportingRelief(state)))
}

export function getBaseInstitutionComplianceBurden(state: GameState): number {
  return roundComplianceValue(
    state.propDeskCount * 2
      + state.institutionalDeskCount * 4
      + state.hedgeFundCount * 7
      + state.investmentFirmCount * 12,
  )
}

export function getAutomationComplianceBurden(state: GameState): number {
  const baseValue = roundComplianceValue(
    state.quantTraderCount * 0.5
      + state.ruleBasedBotCount * 1
      + state.mlTradingBotCount * 2
      + state.aiTradingBotCount * 4,
  )

  return roundComplianceValue(Math.max(0, baseValue - getAutomationOversightRelief(state)))
}

export function getBaseAutomationComplianceBurden(state: GameState): number {
  return roundComplianceValue(
    state.quantTraderCount * 0.5
      + state.ruleBasedBotCount * 1
      + state.mlTradingBotCount * 2
      + state.aiTradingBotCount * 4,
  )
}

export function getSectorComplianceBurden(state: GameState): number {
  const financeExposure = state.sectorAssignments.intern.finance
    + state.sectorAssignments.juniorTrader.finance
    + state.sectorAssignments.seniorTrader.finance
    + state.sectorAssignments.propDesk.finance
    + state.sectorAssignments.institutionalDesk.finance
    + state.sectorAssignments.hedgeFund.finance
    + state.sectorAssignments.investmentFirm.finance

  const financeSectorPresence = financeExposure > 0 ? 1.5 : 0
  const unlockedSectorBreadth = (state.unlockedSectors.technology ? getComplianceNumber('sectorBurden', 'technologyBreadth') : 0) + (state.unlockedSectors.energy ? getComplianceNumber('sectorBurden', 'energyBreadth') : 0)

  return roundComplianceValue(Math.max(0, financeSectorPresence + financeExposure * getComplianceNumber('sectorBurden', 'financeAssignedUnit') + unlockedSectorBreadth - getSectorComplianceRelief(state)))
}

export function getBaseSectorComplianceBurden(state: GameState): number {
  const financeExposure = state.sectorAssignments.intern.finance
    + state.sectorAssignments.juniorTrader.finance
    + state.sectorAssignments.seniorTrader.finance
    + state.sectorAssignments.propDesk.finance
    + state.sectorAssignments.institutionalDesk.finance
    + state.sectorAssignments.hedgeFund.finance
    + state.sectorAssignments.investmentFirm.finance

  const financeSectorPresence = financeExposure > 0 ? getComplianceNumber('sectorBurden', 'financePresence') : 0
  const unlockedSectorBreadth = (state.unlockedSectors.technology ? getComplianceNumber('sectorBurden', 'technologyBreadth') : 0) + (state.unlockedSectors.energy ? getComplianceNumber('sectorBurden', 'energyBreadth') : 0)

  return roundComplianceValue(financeSectorPresence + financeExposure * getComplianceNumber('sectorBurden', 'financeAssignedUnit') + unlockedSectorBreadth)
}

export function getEnergyComplianceBurden(state: GameState): number {
  const powerCapacity = getCompliancePowerCapacity(state)
  const powerUsage = getCompliancePowerUsage(state)

  return roundComplianceValue(powerCapacity * getComplianceNumber('energyBurden', 'powerCapacityFactor') + powerUsage * getComplianceNumber('energyBurden', 'powerUsageFactor'))
}

export function getBaseEnergyComplianceBurden(state: GameState): number {
  const powerCapacity = getCompliancePowerCapacity(state)
  const powerUsage = getCompliancePowerUsage(state)

  return roundComplianceValue(powerCapacity * getComplianceNumber('energyBurden', 'powerCapacityFactor') + powerUsage * getComplianceNumber('energyBurden', 'powerUsageFactor'))
}

export function getBaseComplianceBurden(state: GameState): number {
  return roundComplianceValue(
    getBaseStaffComplianceBurden(state)
      + getBaseInstitutionComplianceBurden(state)
      + getBaseAutomationComplianceBurden(state)
      + getBaseSectorComplianceBurden(state)
      + getBaseEnergyComplianceBurden(state),
  )
}

export function getEffectiveComplianceBurden(state: GameState): number {
  const upgradeRelief = state.purchasedUpgrades.regulatoryCounsel ? 1 - Number(UPGRADE_MULTIPLIERS.regulatoryCounselBurdenMultiplier) : 0
  return roundComplianceValue(Math.max(0, getBaseComplianceBurden(state) * (1 - getComplianceFrameworksRelief(state)) * (1 - upgradeRelief) * getRepeatableUpgradeMultiplier(state, 'complianceSystems') - getComplianceBurdenRelief(state)))
}

export function getComplianceBurden(state: GameState): number {
  return getEffectiveComplianceBurden(state)
}

export function getBaseComplianceEfficiencyMultiplier(state: GameState): number {
  return Math.max(COMPLIANCE_EFFICIENCY_FLOOR, 1 - getEffectiveComplianceBurden(state) * COMPLIANCE_EFFICIENCY_LOSS_PER_BURDEN * (1 / getTimedComplianceReliefMultiplier(state)))
}

export function getFinalComplianceEfficiencyMultiplier(state: GameState): number {
  return Math.min(1, getBaseComplianceEfficiencyMultiplier(state) + getCompliancePenaltyRelief(state) + getComplianceFrameworksRelief(state))
}

export function getComplianceEfficiencyMultiplier(state: GameState): number {
  return getFinalComplianceEfficiencyMultiplier(state)
}

export function getStaffComplianceCost(state: GameState): number {
  const baseValue = roundComplianceValue(
    state.internCount * 1
      + state.juniorTraderCount * 2
      + state.seniorTraderCount * 4
      + state.internResearchScientistCount * 1
      + state.juniorResearchScientistCount * 2.5
      + state.seniorResearchScientistCount * 5
      + state.juniorPoliticianCount * 3,
  )

  const upgradeRelief = state.purchasedUpgrades.complianceSoftwareSuite ? 1 - Number(UPGRADE_MULTIPLIERS.complianceSoftwareSuite) : 0

  return roundComplianceValue(baseValue * (1 - getStaffComplianceCostReliefRate(state)) * (1 - upgradeRelief) * getRepeatableUpgradeMultiplier(state, 'filingEfficiency'))
}

export function getBaseStaffComplianceCost(state: GameState): number {
  return roundComplianceValue(
    state.internCount * 1
      + state.juniorTraderCount * 2
      + state.seniorTraderCount * 4
      + state.internResearchScientistCount * 1
      + state.juniorResearchScientistCount * 2.5
      + state.seniorResearchScientistCount * 5
      + state.juniorPoliticianCount * 3,
  )
}

export function getEnergyComplianceCost(state: GameState): number {
  return roundComplianceValue(getBaseEnergyComplianceCost(state) * (1 - getEnergyComplianceCostReliefRate(state)) * getRepeatableUpgradeMultiplier(state, 'filingEfficiency'))
}

export function getBaseEnergyComplianceCost(state: GameState): number {
  return roundComplianceValue(getCompliancePowerCapacity(state) * getComplianceNumber('energyReviewCost', 'powerCapacityFactor') + getCompliancePowerUsage(state) * getComplianceNumber('energyReviewCost', 'powerUsageFactor'))
}

export function getAutomationComplianceCost(state: GameState): number {
  const baseValue = roundComplianceValue(
    state.quantTraderCount * 1
      + state.ruleBasedBotCount * 3
      + state.mlTradingBotCount * 6
      + state.aiTradingBotCount * 12,
  )

  const upgradeRelief = state.purchasedUpgrades.filingAutomation ? 1 - Number(UPGRADE_MULTIPLIERS.filingAutomation) : 0

  return roundComplianceValue(baseValue * (1 - getAutomationComplianceCostReliefRate(state)) * (1 - upgradeRelief) * getRepeatableUpgradeMultiplier(state, 'filingEfficiency'))
}

export function getBaseAutomationComplianceCost(state: GameState): number {
  return roundComplianceValue(
    state.quantTraderCount * 1
      + state.ruleBasedBotCount * 3
      + state.mlTradingBotCount * 6
      + state.aiTradingBotCount * 12,
  )
}

export function getInstitutionalComplianceCost(state: GameState): number {
  const baseValue = roundComplianceValue(
    state.propDeskCount * 5
      + state.institutionalDeskCount * 10
      + state.hedgeFundCount * 20
      + state.investmentFirmCount * 40,
  )

  const upgradeRelief = (state.purchasedUpgrades.complianceSoftwareSuite ? 1 - Number(UPGRADE_MULTIPLIERS.complianceSoftwareSuite) : 0) + (state.purchasedUpgrades.filingAutomation ? 1 - Number(UPGRADE_MULTIPLIERS.filingAutomation) : 0)

  return roundComplianceValue(baseValue * (1 - getInstitutionalComplianceCostReliefRate(state)) * (1 - upgradeRelief) * getRepeatableUpgradeMultiplier(state, 'filingEfficiency') * getRepeatableUpgradeMultiplier(state, 'institutionalAccess'))
}

export function getBaseInstitutionalComplianceCost(state: GameState): number {
  return roundComplianceValue(
    state.propDeskCount * 5
      + state.institutionalDeskCount * 10
      + state.hedgeFundCount * 20
      + state.investmentFirmCount * 40,
  )
}

export function getBaseComplianceCostBreakdown(state: GameState): ComplianceCostBreakdown {
  const staff = getBaseStaffComplianceCost(state)
  const energy = getBaseEnergyComplianceCost(state)
  const automation = getBaseAutomationComplianceCost(state)
  const institutional = getBaseInstitutionalComplianceCost(state)
  const total = roundComplianceValue(staff + energy + automation + institutional)

  return {
    staff,
    energy,
    automation,
    institutional,
    total,
  }
}

export function getComplianceCostBreakdown(state: GameState): ComplianceCostBreakdown {
  const staff = getStaffComplianceCost(state)
  const energy = getEnergyComplianceCost(state)
  const automation = getAutomationComplianceCost(state)
  const institutional = getInstitutionalComplianceCost(state)
  const total = roundComplianceValue(staff + energy + automation + institutional)

  return {
    staff,
    energy,
    automation,
    institutional,
    total,
  }
}

export function getTotalBaseComplianceCost(state: GameState): number {
  return getBaseComplianceCostBreakdown(state).total
}

export function getTotalEffectiveComplianceCost(state: GameState): number {
  return getComplianceCostBreakdown(state).total
}

export function getTotalComplianceSavingsFromLobbying(state: GameState): number {
  return roundComplianceValue(Math.max(0, getTotalBaseComplianceCost(state) - getTotalEffectiveComplianceCost(state)))
}

export function getTotalComplianceCost(state: GameState): number {
  return getComplianceCostBreakdown(state).total
}

function getCurrentComplianceCycleCosts(state: GameState): Omit<ComplianceCostBreakdown, 'total'> {
  const breakdown = getComplianceCostBreakdown(state)

  return {
    staff: breakdown.staff,
    energy: breakdown.energy,
    automation: breakdown.automation,
    institutional: breakdown.institutional,
  }
}

function getComplianceCategoryCycleCost(state: GameState, category: CompliancePaymentCategoryId): number {
  return getCurrentComplianceCycleCosts(state)[category]
}

export function getComplianceCategoryOutstandingDue(state: GameState, category: CompliancePaymentCategoryId): number {
  return roundComplianceValue(state.compliancePayments[category].overdueAmount + getComplianceCategoryCycleCost(state, category))
}

export function getComplianceReviewDueAmount(state: GameState): number {
  return roundComplianceValue(
    getComplianceCategoryOutstandingDue(state, 'staff')
      + getComplianceCategoryOutstandingDue(state, 'energy')
      + getComplianceCategoryOutstandingDue(state, 'automation')
      + getComplianceCategoryOutstandingDue(state, 'institutional'),
  ) / getTimedComplianceReliefMultiplier(state)
}

export function getComplianceCategoryStatus(state: GameState, category: CompliancePaymentCategoryId): 'current' | 'due' | 'overdue' {
  if (state.compliancePayments[category].overdueAmount > 0) {
    return 'overdue'
  }

  return state.complianceReviewRemainingSeconds <= 0 ? 'due' : 'current'
}

export function getCompliancePaymentStatusLabel(state: GameState, category: CompliancePaymentCategoryId): string {
  const status = getComplianceCategoryStatus(state, category)
  return status === 'overdue' ? 'Overdue' : status === 'due' ? 'Due now' : 'Current'
}

export function getCompliancePaymentPenaltyHint(category: CompliancePaymentCategoryId): string {
  if (category === 'staff') {
    return 'Unpaid staff compliance reduces human and research output.'
  }

  if (category === 'energy') {
    return 'Unpaid energy compliance worsens machine and power performance.'
  }

  if (category === 'automation') {
    return 'Unpaid automation compliance reduces bot effectiveness.'
  }

  return 'Unpaid institutional compliance reduces desk, fund, and firm output.'
}

export function getComplianceCategoryDriverSummary(state: GameState, category: CompliancePaymentCategoryId): string {
  if (category === 'staff') {
    const drivers = [
      { label: 'Senior Traders', value: state.seniorTraderCount * 4 },
      { label: 'Junior Traders', value: state.juniorTraderCount * 2 },
      { label: 'Senior Scientists', value: state.seniorResearchScientistCount * 5 },
      { label: 'Junior Scientists', value: state.juniorResearchScientistCount * 2.5 },
      { label: 'Interns', value: state.internCount * 1 },
      { label: 'Intern Scientists', value: state.internResearchScientistCount * 1 },
      { label: 'Senators', value: state.juniorPoliticianCount * 3 },
    ].filter((entry) => entry.value > 0).sort((left, right) => right.value - left.value).slice(0, 2)

    return drivers.length > 0 ? `Driven mostly by ${drivers.map((entry) => entry.label).join(' and ')}.` : 'No meaningful staff compliance drivers yet.'
  }

  if (category === 'energy') {
    const drivers = [
      { label: 'Cloud Compute', value: state.cloudComputeCount * 140 },
      { label: 'Data Centers', value: state.dataCenterCount * 44 },
      { label: 'Server Rooms', value: state.serverRoomCount * 6 },
      { label: 'AI Bots', value: state.aiTradingBotCount * 9 },
      { label: 'ML Bots', value: state.mlTradingBotCount * 2.4 },
      { label: 'Rule-Based Bots', value: state.ruleBasedBotCount * 0.45 },
    ].filter((entry) => entry.value > 0).sort((left, right) => right.value - left.value).slice(0, 2)

    return drivers.length > 0 ? `Driven mostly by ${drivers.map((entry) => entry.label).join(' and ')}.` : 'No meaningful energy compliance drivers yet.'
  }

  if (category === 'automation') {
    const drivers = [
      { label: 'AI Bots', value: state.aiTradingBotCount * 12 },
      { label: 'ML Bots', value: state.mlTradingBotCount * 6 },
      { label: 'Rule-Based Bots', value: state.ruleBasedBotCount * 3 },
      { label: 'Quant Traders', value: state.quantTraderCount * 1 },
    ].filter((entry) => entry.value > 0).sort((left, right) => right.value - left.value).slice(0, 2)

    return drivers.length > 0 ? `Driven mostly by ${drivers.map((entry) => entry.label).join(' and ')}.` : 'No meaningful automation compliance drivers yet.'
  }

  const drivers = [
    { label: 'Investment Firms', value: state.investmentFirmCount * 40 },
    { label: 'Hedge Funds', value: state.hedgeFundCount * 20 },
    { label: 'Institutional Desks', value: state.institutionalDeskCount * 10 },
    { label: 'Prop Desks', value: state.propDeskCount * 5 },
  ].filter((entry) => entry.value > 0).sort((left, right) => right.value - left.value).slice(0, 2)

  return drivers.length > 0 ? `Driven mostly by ${drivers.map((entry) => entry.label).join(' and ')}.` : 'No meaningful institutional compliance drivers yet.'
}

function resetComplianceCyclePayments(compliancePayments: CompliancePaymentState): CompliancePaymentState {
  return {
    staff: { ...compliancePayments.staff, paidThisCycle: 0, lastPayment: compliancePayments.staff.lastPayment },
    energy: { ...compliancePayments.energy, paidThisCycle: 0, lastPayment: compliancePayments.energy.lastPayment },
    automation: { ...compliancePayments.automation, paidThisCycle: 0, lastPayment: compliancePayments.automation.lastPayment },
    institutional: { ...compliancePayments.institutional, paidThisCycle: 0, lastPayment: compliancePayments.institutional.lastPayment },
  }
}

function rollComplianceCycleForward(state: GameState): CompliancePaymentState {
  const nextPayments = resetComplianceCyclePayments(state.compliancePayments)

  return {
    staff: {
      ...nextPayments.staff,
      overdueAmount: roundComplianceValue(nextPayments.staff.overdueAmount + getComplianceCategoryCycleCost(state, 'staff')),
    },
    energy: {
      ...nextPayments.energy,
      overdueAmount: roundComplianceValue(nextPayments.energy.overdueAmount + getComplianceCategoryCycleCost(state, 'energy')),
    },
    automation: {
      ...nextPayments.automation,
      overdueAmount: roundComplianceValue(nextPayments.automation.overdueAmount + getComplianceCategoryCycleCost(state, 'automation')),
    },
    institutional: {
      ...nextPayments.institutional,
      overdueAmount: roundComplianceValue(nextPayments.institutional.overdueAmount + getComplianceCategoryCycleCost(state, 'institutional')),
    },
  }
}

function getComplianceCategoryAutoPayOrder(): CompliancePaymentCategoryId[] {
  return [...mechanics.runtime.compliance.autoPayOrder]
}

function autoPayComplianceCategories(state: GameState, cash: number, compliancePayments: CompliancePaymentState): { cash: number; compliancePayments: CompliancePaymentState; totalPaid: number } {
  let nextCash = cash
  let totalPaid = 0
  const nextPayments: CompliancePaymentState = {
    staff: { ...compliancePayments.staff },
    energy: { ...compliancePayments.energy },
    automation: { ...compliancePayments.automation },
    institutional: { ...compliancePayments.institutional },
  }

  for (const category of getComplianceCategoryAutoPayOrder()) {
    if (state.settings.complianceAutoPayEnabled[category] !== true) {
      continue
    }

    const due = nextPayments[category].overdueAmount

    if (due <= 0 || nextCash <= 0) {
      continue
    }

    const payment = Math.min(nextCash, due)
    nextCash -= payment
    totalPaid += payment
    nextPayments[category] = {
      ...nextPayments[category],
      overdueAmount: roundComplianceValue(due - payment),
      paidThisCycle: roundComplianceValue(nextPayments[category].paidThisCycle + payment),
      lastPayment: payment,
    }
  }

  return {
    cash: nextCash,
    compliancePayments: nextPayments,
    totalPaid: roundComplianceValue(totalPaid),
  }
}

export function isComplianceVisible(state: GameState): boolean {
  return state.complianceVisible || getComplianceBurden(state) >= COMPLIANCE_REVEAL_BURDEN
}

export function getTopComplianceSources(state: GameState): ComplianceSourceSummary[] {
  return [
    { label: 'Staff Oversight', value: getStaffComplianceBurden(state) },
    { label: 'Institutional Reporting', value: getInstitutionComplianceBurden(state) },
    { label: 'Automation Oversight', value: getAutomationComplianceBurden(state) },
    { label: 'Market Exposure', value: getSectorComplianceBurden(state) },
    { label: 'Energy Footprint', value: getEnergyComplianceBurden(state) },
  ]
    .filter((entry) => entry.value > 0)
    .sort((left, right) => right.value - left.value)
    .slice(0, 4)
}

export function processComplianceTimer(
  state: GameState,
  deltaSeconds: number,
): Pick<GameState, 'cash' | 'complianceVisible' | 'complianceReviewRemainingSeconds' | 'compliancePayments' | 'lastCompliancePayment'> {
  if (deltaSeconds <= 0) {
    return {
      cash: state.cash,
      complianceVisible: state.complianceVisible,
      complianceReviewRemainingSeconds: state.complianceReviewRemainingSeconds,
      compliancePayments: state.compliancePayments,
      lastCompliancePayment: state.lastCompliancePayment,
    }
  }

  let cash = state.cash
  let complianceVisible = state.complianceVisible || getComplianceBurden(state) >= COMPLIANCE_REVEAL_BURDEN
  let complianceReviewRemainingSeconds = state.complianceReviewRemainingSeconds
  let compliancePayments = state.compliancePayments
  let lastCompliancePayment = state.lastCompliancePayment
  let carrySeconds = deltaSeconds

  while (carrySeconds > 0) {
    if (carrySeconds < complianceReviewRemainingSeconds) {
      complianceReviewRemainingSeconds -= carrySeconds
      carrySeconds = 0
      break
    }

    carrySeconds -= complianceReviewRemainingSeconds
    compliancePayments = rollComplianceCycleForward({
      ...state,
      cash,
      complianceVisible,
      complianceReviewRemainingSeconds,
      compliancePayments,
      lastCompliancePayment,
    })

    if (state.settings.complianceAutoPayEnabled) {
      const autoPayResult = autoPayComplianceCategories(state, cash, compliancePayments)
      cash = autoPayResult.cash
      compliancePayments = autoPayResult.compliancePayments
      lastCompliancePayment = autoPayResult.totalPaid
    } else {
      lastCompliancePayment = 0
    }

    complianceVisible = complianceVisible || getComplianceBurden(state) >= COMPLIANCE_REVEAL_BURDEN
    complianceReviewRemainingSeconds = COMPLIANCE_REVIEW_INTERVAL_SECONDS
  }

  return {
    cash,
    complianceVisible,
    complianceReviewRemainingSeconds,
    compliancePayments,
    lastCompliancePayment,
  }
}

export function payComplianceCategoryNow(
  state: GameState,
  category: CompliancePaymentCategoryId,
): Pick<GameState, 'cash' | 'compliancePayments' | 'lastCompliancePayment'> {
  const dueAmount = getComplianceCategoryOutstandingDue(state, category)
  const payment = Math.min(state.cash, dueAmount)
  const remainingDue = roundComplianceValue(dueAmount - payment)
  const nextPayments: CompliancePaymentState = {
    ...state.compliancePayments,
    [category]: {
      ...state.compliancePayments[category],
      overdueAmount: remainingDue,
      paidThisCycle: roundComplianceValue(state.compliancePayments[category].paidThisCycle + payment),
      lastPayment: payment,
    },
  }

  return {
    cash: Math.max(0, state.cash - payment),
    compliancePayments: nextPayments,
    lastCompliancePayment: payment,
  }
}

export function getHumanCompliancePenaltyMultiplier(state: GameState): number {
  const staffOverdue = state.compliancePayments.staff.overdueAmount
  return Math.min(1, Math.max(OVERDUE_PENALTY.human.floor, 1 - staffOverdue * OVERDUE_PENALTY.human.ratePerCurrency) + getHumanCompliancePenaltyRelief(state))
}

export function getEnergyCompliancePenaltyMultiplier(state: GameState): number {
  const energyOverdue = state.compliancePayments.energy.overdueAmount
  return Math.max(OVERDUE_PENALTY.energy.floor, 1 - energyOverdue * OVERDUE_PENALTY.energy.ratePerCurrency)
}

export function getAutomationCompliancePenaltyMultiplier(state: GameState): number {
  const automationOverdue = state.compliancePayments.automation.overdueAmount
  return Math.max(OVERDUE_PENALTY.automation.floor, 1 - automationOverdue * OVERDUE_PENALTY.automation.ratePerCurrency)
}

export function getInstitutionalCompliancePenaltyMultiplier(state: GameState): number {
  const institutionalOverdue = state.compliancePayments.institutional.overdueAmount
  return Math.max(OVERDUE_PENALTY.institutional.floor, 1 - institutionalOverdue * OVERDUE_PENALTY.institutional.ratePerCurrency) * Math.min(1, 1 + (1 - getRepeatableUpgradeMultiplier(state, 'institutionalAccess')))
}

export function getComplianceEfficiencyPercent(state: GameState): number {
  return getComplianceEfficiencyMultiplier(state) * 100
}

export function getCompliancePenaltyPercent(state: GameState): number {
  return Math.max(0, (1 - getComplianceEfficiencyMultiplier(state)) * 100)
}

export function getComplianceStatusCopy(state: GameState): string {
  const burden = getComplianceBurden(state)

  if (burden < COMPLIANCE_REVEAL_BURDEN) {
    return 'Light oversight. Compliance remains background noise for now.'
  }

  if (burden < 20) {
    return 'Regulatory pressure is building as the desk scales.'
  }

  if (burden < 40) {
    return 'Compliance is now a meaningful operating drag across the firm.'
  }

  return 'The firm is under heavy oversight. Future lobbying relief will matter.'
}

export function getComplianceActionSummary(state: GameState): string {
  const burden = getComplianceBurden(state)
  const totalCost = getComplianceReviewDueAmount(state)
  const topSource = getTopComplianceSources(state)[0]
  const breakdown = getComplianceCostBreakdown(state)
  const largestCost = [
    { label: 'staff compliance costs', value: breakdown.staff },
    { label: 'energy compliance costs', value: breakdown.energy },
    { label: 'automation compliance costs', value: breakdown.automation },
    { label: 'institutional compliance costs', value: breakdown.institutional },
  ].sort((left, right) => right.value - left.value)[0]

  if (burden < COMPLIANCE_REVEAL_BURDEN) {
    return 'Oversight is still light. Compliance exists in the background, but the next reviews should stay manageable while the desk is small.'
  }

  if (state.cash <= 0 && totalCost > 0) {
    return `Cash reserves are already thin. ${topSource?.label ?? 'Compliance pressure'} is the main burden driver, and ${largestCost.label} are your largest recurring review hit.`
  }

  if (totalCost > state.cash) {
    return `Your next compliance review is larger than current cash on hand. ${topSource?.label ?? 'Compliance pressure'} is driving burden, and ${largestCost.label} are the biggest bill category.`
  }

  if (topSource?.label === 'Market Exposure') {
    return `Finance exposure is pushing burden higher. ${largestCost.label[0].toUpperCase()}${largestCost.label.slice(1)} are currently the biggest part of the next review.`
  }

  return `${topSource?.label ?? 'Compliance pressure'} is currently your biggest burden driver, while ${largestCost.label} are leading the next review bill. Lobbying can later reduce both.`
}

export function getComplianceReviewLabel(state: GameState): string {
  return formatComplianceReviewTimer(state.complianceReviewRemainingSeconds)
}

export const COMPLIANCE_CONSTANTS = {
  reviewIntervalSeconds: COMPLIANCE_REVIEW_INTERVAL_SECONDS,
  revealBurden: COMPLIANCE_REVEAL_BURDEN,
  efficiencyFloor: COMPLIANCE_EFFICIENCY_FLOOR,
  efficiencyLossPerBurden: COMPLIANCE_EFFICIENCY_LOSS_PER_BURDEN,
  utilityPowerCapacity: Number(mechanics.constants.baseUtilityPowerCapacity),
} as const
