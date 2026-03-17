import { GAME_CONSTANTS } from '../data/constants'
import { getRepeatableUpgradeMultiplier } from '../data/repeatableUpgrades'
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

const COMPLIANCE_REVIEW_INTERVAL_SECONDS = 60
const COMPLIANCE_REVEAL_BURDEN = 5
const COMPLIANCE_EFFICIENCY_FLOOR = 0.75
const COMPLIANCE_EFFICIENCY_LOSS_PER_BURDEN = 0.005

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
  let capacity = GAME_CONSTANTS.baseUtilityPowerCapacity
    + state.serverRackCount * GAME_CONSTANTS.serverRackPowerCapacity * (state.purchasedUpgrades.rackStacking ? 1.25 : 1)
    + state.serverRoomCount * GAME_CONSTANTS.serverRoomPowerCapacity * (state.purchasedUpgrades.roomScaleout ? 1.25 : 1)
    + state.dataCenterCount * GAME_CONSTANTS.dataCenterPowerCapacity * (state.purchasedUpgrades.dataCenterFabric ? 1.3 : 1)
    + state.cloudComputeCount * GAME_CONSTANTS.cloudComputePowerCapacity * (state.purchasedUpgrades.cloudBurstContracts ? 1.35 : 1)

  if (state.purchasedPolicies.priorityGridAccess) {
    capacity *= 1.15
  }

  if (state.purchasedUpgrades.powerDistribution) {
    capacity *= 1.2
  }

  return capacity
}

function getCompliancePowerUsage(state: GameState): number {
  let ruleBasedBotUsage = state.ruleBasedBotCount * GAME_CONSTANTS.ruleBasedBotPowerUsage
  let mlBotUsage = state.mlTradingBotCount * GAME_CONSTANTS.mlTradingBotPowerUsage
  let aiBotUsage = state.aiTradingBotCount * GAME_CONSTANTS.aiTradingBotPowerUsage

  if (state.purchasedPolicies.dataCenterEnergyCredits) {
    ruleBasedBotUsage *= 0.8
    mlBotUsage *= 0.8
  }

  if (state.purchasedUpgrades.coolingSystems) {
    ruleBasedBotUsage *= 0.9
    mlBotUsage *= 0.9
    aiBotUsage *= 0.9
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
    state.internCount * 0.1
      + state.juniorTraderCount * 0.2
      + state.seniorTraderCount * 0.4
      + state.internResearchScientistCount * 0.08
      + state.juniorResearchScientistCount * 0.15
      + state.seniorResearchScientistCount * 0.3
      + state.juniorPoliticianCount * 0.25,
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
  const unlockedSectorBreadth = (state.unlockedSectors.technology ? 0.5 : 0) + (state.unlockedSectors.energy ? 0.5 : 0)

  return roundComplianceValue(Math.max(0, financeSectorPresence + financeExposure * 0.05 + unlockedSectorBreadth - getSectorComplianceRelief(state)))
}

export function getBaseSectorComplianceBurden(state: GameState): number {
  const financeExposure = state.sectorAssignments.intern.finance
    + state.sectorAssignments.juniorTrader.finance
    + state.sectorAssignments.seniorTrader.finance
    + state.sectorAssignments.propDesk.finance
    + state.sectorAssignments.institutionalDesk.finance
    + state.sectorAssignments.hedgeFund.finance
    + state.sectorAssignments.investmentFirm.finance

  const financeSectorPresence = financeExposure > 0 ? 1.5 : 0
  const unlockedSectorBreadth = (state.unlockedSectors.technology ? 0.5 : 0) + (state.unlockedSectors.energy ? 0.5 : 0)

  return roundComplianceValue(financeSectorPresence + financeExposure * 0.05 + unlockedSectorBreadth)
}

export function getEnergyComplianceBurden(state: GameState): number {
  const powerCapacity = getCompliancePowerCapacity(state)
  const powerUsage = getCompliancePowerUsage(state)

  return roundComplianceValue(powerCapacity * 0.01 + powerUsage * 0.02)
}

export function getBaseEnergyComplianceBurden(state: GameState): number {
  const powerCapacity = getCompliancePowerCapacity(state)
  const powerUsage = getCompliancePowerUsage(state)

  return roundComplianceValue(powerCapacity * 0.01 + powerUsage * 0.02)
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
  const upgradeRelief = state.purchasedUpgrades.regulatoryCounsel ? 0.08 : 0
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

  const upgradeRelief = state.purchasedUpgrades.complianceSoftwareSuite ? 0.1 : 0

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
  return roundComplianceValue(getCompliancePowerCapacity(state) * 0.2 + getCompliancePowerUsage(state) * 0.3)
}

export function getAutomationComplianceCost(state: GameState): number {
  const baseValue = roundComplianceValue(
    state.quantTraderCount * 1
      + state.ruleBasedBotCount * 3
      + state.mlTradingBotCount * 6
      + state.aiTradingBotCount * 12,
  )

  const upgradeRelief = state.purchasedUpgrades.filingAutomation ? 0.1 : 0

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

  const upgradeRelief = (state.purchasedUpgrades.complianceSoftwareSuite ? 0.1 : 0) + (state.purchasedUpgrades.filingAutomation ? 0.1 : 0)

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
  return ['staff', 'energy', 'automation', 'institutional']
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
  return Math.min(1, Math.max(0.82, 1 - staffOverdue * 0.0008) + getHumanCompliancePenaltyRelief(state))
}

export function getEnergyCompliancePenaltyMultiplier(state: GameState): number {
  const energyOverdue = state.compliancePayments.energy.overdueAmount
  return Math.max(0.82, 1 - energyOverdue * 0.0008)
}

export function getAutomationCompliancePenaltyMultiplier(state: GameState): number {
  const automationOverdue = state.compliancePayments.automation.overdueAmount
  return Math.max(0.78, 1 - automationOverdue * 0.001)
}

export function getInstitutionalCompliancePenaltyMultiplier(state: GameState): number {
  const institutionalOverdue = state.compliancePayments.institutional.overdueAmount
  return Math.max(0.78, 1 - institutionalOverdue * 0.001) * Math.min(1, 1 + (1 - getRepeatableUpgradeMultiplier(state, 'institutionalAccess')))
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
  utilityPowerCapacity: GAME_CONSTANTS.baseUtilityPowerCapacity,
} as const
