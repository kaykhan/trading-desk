import { GLOBAL_BOOSTS, TIMED_BOOSTS } from '../data/boosts'
import { MILESTONE_CATEGORY_LABELS, MILESTONES } from '../data/milestones'
import { PRESTIGE_UPGRADES } from '../data/prestigeUpgrades'
import { RESEARCH_TECH } from '../data/researchTech'
import { SECTOR_IDS } from '../data/sectors'
import { REPEATABLE_UPGRADES } from '../data/repeatableUpgrades'
import { UPGRADES } from '../data/upgrades'
import type { GameState, MilestoneDefinition, MilestoneId, MilestoneReward, RepeatableUpgradeFamily, ResearchTechId, UpgradeGroup } from '../types/game'
import { getOwnedGlobalBoostCount, isTimedBoostAutoUnlocked } from './boosts'
import { getComplianceReviewIntervalSeconds } from './compliance'
import { getIncomeBreakdown } from './economy'
import { getLifetimeReputation } from './prestige'
import { isAutomationUnlocked, isLobbyingUnlocked, isPowerInfrastructureUnlocked } from './research'

type MilestoneEvaluation = {
  unlockedMilestones: Partial<Record<MilestoneId, boolean>>
  rewards: MilestoneReward
  newlyUnlockedIds: MilestoneId[]
}

function isMilestoneUnlocked(state: GameState, milestoneId: MilestoneId): boolean {
  return state.unlockedMilestones[milestoneId] === true
}

function sumRecordValues(record: Record<string, number | boolean | undefined>): number {
  return Object.values(record).reduce<number>((total, value) => total + (typeof value === 'number' ? value : value === true ? 1 : 0), 0)
}

function getPurchasedUpgradeCount(state: GameState): number {
  return UPGRADES.reduce((total, upgrade) => total + (state.purchasedUpgrades[upgrade.id] === true ? 1 : 0), 0)
}

function getPurchasedUpgradeCountByGroup(state: GameState, group: UpgradeGroup): number {
  return UPGRADES.reduce((total, upgrade) => total + (upgrade.group === group && state.purchasedUpgrades[upgrade.id] === true ? 1 : 0), 0)
}

function getPurchasedResearchNodeCount(state: GameState): number {
  return RESEARCH_TECH.reduce((total, tech) => total + (state.purchasedResearchTech[tech.id] === true ? 1 : 0), 0)
}

function getResearchUnlocked(state: GameState): boolean {
  return state.purchasedResearchTech.foundationsOfFinanceTraining === true
    || state.internResearchScientistCount > 0
    || state.juniorResearchScientistCount > 0
    || state.seniorResearchScientistCount > 0
    || state.researchPoints > 0
    || state.lifetimeResearchPointsEarned > 0
}

function getUnlockedSectorCount(state: GameState): number {
  return SECTOR_IDS.reduce((total, sectorId) => total + (state.unlockedSectors[sectorId] === true ? 1 : 0), 0)
}

function getTotalAssignedUnitsToSectors(state: GameState): number {
  return Object.values(state.sectorAssignments).reduce((total, sectorAssignments) => total + sumRecordValues(sectorAssignments), 0)
}

function getActiveAssignedSectorCount(state: GameState): number {
  return SECTOR_IDS.reduce((total, sectorId) => total + (getTotalAssignedUnitsToSector(state, sectorId) > 0 ? 1 : 0), 0)
}

function getTotalAssignedUnitsToSector(state: GameState, sectorId: 'finance' | 'technology' | 'energy'): number {
  return Object.values(state.sectorAssignments).reduce((total, sectorAssignments) => total + (sectorAssignments[sectorId] ?? 0), 0)
}

function getTotalSpecialistTrainingResearchUnlocked(state: GameState): number {
  const ids: ResearchTechId[] = ['financeSpecialistTraining', 'technologySpecialistTraining', 'energySpecialistTraining']
  return ids.reduce((total, id) => total + (state.purchasedResearchTech[id] === true ? 1 : 0), 0)
}

function getTotalSpecialists(state: GameState): number {
  return Object.values(state.traderSpecialists.seniorTrader).reduce((total, value) => total + value, 0)
}

function getTotalCorrectSpecialistAssignments(state: GameState): number {
  return SECTOR_IDS.reduce((total, sectorId) => total + Math.min(state.traderSpecialists.seniorTrader[sectorId] ?? 0, state.sectorAssignments.seniorTrader[sectorId] ?? 0), 0)
}

function getTotalMandateFrameworkResearchUnlocked(state: GameState): number {
  const ids: ResearchTechId[] = ['financeMandateFramework', 'techGrowthMandateFramework', 'energyExposureFramework']
  return ids.reduce((total, id) => total + (state.purchasedResearchTech[id] === true ? 1 : 0), 0)
}

function getTotalMandatedInstitutions(state: GameState): number {
  return Object.values(state.institutionMandates).reduce((total, mandateCounts) => total + sumRecordValues(mandateCounts), 0)
}

function getTotalCorrectMandateAssignments(state: GameState): number {
  return (Object.keys(state.institutionMandates) as Array<keyof typeof state.institutionMandates>).reduce((total, unitId) => total + SECTOR_IDS.reduce((sectorTotal, sectorId) => sectorTotal + Math.min(state.institutionMandates[unitId][sectorId] ?? 0, state.sectorAssignments[unitId][sectorId] ?? 0), 0), 0)
}

function getTotalInstitutionUnits(state: GameState): number {
  return state.propDeskCount + state.institutionalDeskCount + state.hedgeFundCount + state.investmentFirmCount
}

function getTotalUnlockedAutomationStrategies(state: GameState): number {
  const ids: ResearchTechId[] = ['meanReversionModels', 'momentumModels', 'arbitrageEngine', 'marketMakingEngine', 'scalpingFramework']
  return ids.reduce((total, id) => total + (state.purchasedResearchTech[id] === true ? 1 : 0), 0)
}

function getTotalConfiguredAutomationClasses(state: GameState): number {
  return Object.values(state.automationConfig).reduce((total, config) => total + (config.marketTarget !== null && config.strategy !== null ? 1 : 0), 0)
}

function getTotalAutomationUnits(state: GameState): number {
  return state.quantTraderCount + state.ruleBasedBotCount + state.mlTradingBotCount + state.aiTradingBotCount
}

function getTotalPurchasedPolicies(state: GameState): number {
  return Object.values(state.purchasedPolicies).filter(Boolean).length
}

function getBoostsUnlocked(state: GameState): boolean {
  return Object.keys(TIMED_BOOSTS).some((boostId) => state.purchasedResearchTech[TIMED_BOOSTS[boostId as keyof typeof TIMED_BOOSTS].unlockResearchTechId] === true)
}

function getTotalOwnedGlobalBoosts(state: GameState): number {
  return getOwnedGlobalBoostCount(state)
}

function getTotalPrestigeGoalRanksPurchased(state: GameState): number {
  return PRESTIGE_UPGRADES.reduce((total, upgrade) => total + (state.purchasedPrestigeUpgrades[upgrade.id] ?? 0), 0)
}

function getTotalOptimisationRanks(state: GameState): number {
  return Object.values(state.repeatableUpgradeRanks).reduce((total, value) => total + (value ?? 0), 0)
}

function getOptimisationRanksByFamily(state: GameState, family: RepeatableUpgradeFamily): number {
  return REPEATABLE_UPGRADES
    .filter((upgrade) => upgrade.family === family)
    .reduce((total, upgrade) => total + (state.repeatableUpgradeRanks[upgrade.id] ?? 0), 0)
}

function getMilestoneCondition(state: GameState, milestoneId: MilestoneId): boolean {
  const effectiveServerRackCount = Math.max(0, state.serverRackCount - 1)

  switch (milestoneId) {
    case 'firstTrade': return state.lifetimeManualTrades >= 1
    case 'activeDesk': return state.lifetimeManualTrades >= 25
    case 'firstIntern': return state.internCount >= 1
    case 'smallTeam': return state.internCount >= 5
    case 'firstJuniorTrader': return state.juniorTraderCount >= 1
    case 'firstDeskSpace': return state.deskSpaceCount >= 1
    case 'fourUpgrades': return getPurchasedUpgradeCount(state) >= 3
    case 'juniorDesk': return state.juniorTraderCount >= 5
    case 'firstSeniorTrader': return state.seniorTraderCount >= 1
    case 'builtTheDesk': return state.internCount >= 3 && state.juniorTraderCount >= 3 && state.seniorTraderCount >= 1
    case 'firstUpgrade': return getPurchasedUpgradeCount(state) >= 1
    case 'deskMomentum': return getIncomeBreakdown(state).generalDeskIncome >= 100 || (getIncomeBreakdown(state).internIncome + getIncomeBreakdown(state).juniorIncome + getIncomeBreakdown(state).seniorIncome + getIncomeBreakdown(state).propDeskIncome + getIncomeBreakdown(state).institutionalDeskIncome + getIncomeBreakdown(state).hedgeFundIncome + getIncomeBreakdown(state).investmentFirmIncome) >= 100
    case 'tenInterns': return state.internCount >= 10
    case 'tenJuniors': return state.juniorTraderCount >= 10
    case 'threeSeniors': return state.seniorTraderCount >= 3
    case 'firstDeskOptimization': return getOptimisationRanksByFamily(state, 'desk') >= 1
    case 'humanDeskScaled': return state.internCount + state.juniorTraderCount + state.seniorTraderCount >= 25
    case 'unlockResearch': return getResearchUnlocked(state)
    case 'firstInternScientist': return state.internResearchScientistCount >= 1
    case 'fiveInternScientists': return state.internResearchScientistCount >= 5
    case 'firstFloorSpace': return state.floorSpaceCount >= 1
    case 'firstSeniorScientist': return state.seniorResearchScientistCount >= 1
    case 'firstResearchNode': return getPurchasedResearchNodeCount(state) >= 1
    case 'hundredRP': return state.lifetimeResearchPointsEarned >= 100
    case 'fiveUpgrades': return getPurchasedUpgradeCount(state) >= 5
    case 'fiveResearchNodes': return getPurchasedResearchNodeCount(state) >= 5
    case 'firstResearchOptimization': return getOptimisationRanksByFamily(state, 'research') >= 1
    case 'firstExtraSector': return getUnlockedSectorCount(state) >= 2
    case 'unlockTechnologySector': return state.unlockedSectors.technology === true
    case 'unlockEnergySector': return state.unlockedSectors.energy === true
    case 'firstSectorAssignment': return getTotalAssignedUnitsToSectors(state) >= 1
    case 'multiSectorPresence': return getActiveAssignedSectorCount(state) >= 2
    case 'sectorFloorBuilt': return getTotalAssignedUnitsToSectors(state) >= 10
    case 'financeFocus': return getIncomeBreakdown(state).sectorBreakdown.finance.totalIncome >= 250
    case 'technologyFocus': return getIncomeBreakdown(state).sectorBreakdown.technology.totalIncome >= 250
    case 'energyFocus': return getIncomeBreakdown(state).sectorBreakdown.energy.totalIncome >= 250
    case 'firstSpecialistTrainingResearch': return getTotalSpecialistTrainingResearchUnlocked(state) >= 1
    case 'firstSpecialist': return getTotalSpecialists(state) >= 1
    case 'correctPlacement': return getTotalCorrectSpecialistAssignments(state) >= 1
    case 'specialistDesk': return getTotalSpecialists(state) >= 5
    case 'firstMandateResearch': return getTotalMandateFrameworkResearchUnlocked(state) >= 1
    case 'firstMandate': return getTotalMandatedInstitutions(state) >= 1
    case 'alignedInstitution': return getTotalCorrectMandateAssignments(state) >= 1
    case 'firstPropDesk': return state.propDeskCount >= 1
    case 'firstInstitutionalDesk': return state.institutionalDeskCount >= 1
    case 'firstHedgeFund': return state.hedgeFundCount >= 1
    case 'firstInvestmentFirm': return state.investmentFirmCount >= 1
    case 'institutionPortfolio': return state.propDeskCount >= 1 && state.institutionalDeskCount >= 1 && state.hedgeFundCount >= 1
    case 'institutionUpgrade': return getPurchasedUpgradeCountByGroup(state, 'institutions') >= 1
    case 'unlockAutomation': return isAutomationUnlocked(state)
    case 'firstQuantTrader': return state.quantTraderCount >= 1
    case 'unlockRuleBot': return state.purchasedResearchTech.ruleBasedAutomation === true
    case 'firstRuleBot': return state.ruleBasedBotCount >= 1
    case 'firstStrategyUnlocked': return getTotalUnlockedAutomationStrategies(state) >= 1
    case 'firstAutomationConfigured': return getTotalConfiguredAutomationClasses(state) >= 1
    case 'machineDesk': return getTotalAutomationUnits(state) >= 5
    case 'firstMLBot': return state.mlTradingBotCount >= 1
    case 'firstAIBot': return state.aiTradingBotCount >= 1
    case 'firstAutomationUpgrade': return getPurchasedUpgradeCountByGroup(state, 'automation') >= 1
    case 'firstAutomationOptimization': return getOptimisationRanksByFamily(state, 'automation') >= 1
    case 'firstServerRack': return effectiveServerRackCount >= 1
    case 'firstServerRoom': return state.serverRoomCount >= 1
    case 'firstDataCentre': return state.dataCenterCount >= 1
    case 'firstCloudCompute': return state.cloudComputeCount >= 1
    case 'firstInfrastructureUpgrade': return getPurchasedUpgradeCountByGroup(state, 'infrastructure') >= 1
    case 'firstComplianceReview': return state.totalComplianceReviewsTriggered >= 1
    case 'firstCompliancePayment': return state.totalCompliancePaymentsMade >= 1 || state.lastCompliancePayment > 0
    case 'unlockLobbying': return isLobbyingUnlocked(state) || state.discoveredLobbying
    case 'firstLobbyingPolicy': return getTotalPurchasedPolicies(state) >= 1
    case 'threePolicies': return getTotalPurchasedPolicies(state) >= 3
    case 'firstGovernanceUpgrade': return getPurchasedUpgradeCountByGroup(state, 'complianceLobbying') >= 1
    case 'firstGovernanceOptimization': return getOptimisationRanksByFamily(state, 'governance') >= 1
    case 'unlockBoosts': return getBoostsUnlocked(state)
    case 'firstTimedBoost': return state.totalTimedBoostActivations >= 1
    case 'firstGlobalBoost': return getTotalOwnedGlobalBoosts(state) >= 1
    case 'boostAutomationUnlocked': return isTimedBoostAutoUnlocked(state)
    case 'firstPrestige': return state.prestigeCount >= 1
    case 'firstReputationSpend': return state.reputationSpent >= 1
    case 'bronzePrestige': return state.prestigeCount >= 2
    case 'silverPrestige': return state.prestigeCount >= 3
    case 'goldPrestige': return state.prestigeCount >= 4
    case 'firstPrestigeGoalRank': return getTotalPrestigeGoalRanksPurchased(state) >= 1
    case 'tenPrestigeRanks': return getTotalPrestigeGoalRanksPurchased(state) >= 10
    case 'onyxLegacy': return state.prestigeCount >= 10
    case 'unlockOptimisations': return state.prestigeCount >= 1
    case 'firstOptimisation': return getTotalOptimisationRanks(state) >= 1
    case 'tenOptimisationRanks': return getTotalOptimisationRanks(state) >= 10
    case 'fiftyOptimisationRanks': return getTotalOptimisationRanks(state) >= 50
    case 'hundredOptimisationRanks': return getTotalOptimisationRanks(state) >= 100
    default: return false
  }
}

export function getUnlockedMilestoneCount(state: GameState): number {
  return MILESTONES.reduce((total, milestone) => total + (isMilestoneUnlocked(state, milestone.id) ? 1 : 0), 0)
}

export function getNextRecommendedMilestone(state: GameState): MilestoneDefinition | null {
  return MILESTONES.find((milestone) => milestone.visibleByDefault && !isMilestoneUnlocked(state, milestone.id)) ?? null
}

export function getNextRecommendedMilestoneSummary(state: GameState): {
  name: string
  description: string
  categoryLabel: string
  progressLabel: string | null
  rewardSummary: string
} | null {
  const milestone = getNextRecommendedMilestone(state)

  if (!milestone) {
    return null
  }

  return {
    name: milestone.name,
    description: milestone.description,
    categoryLabel: MILESTONE_CATEGORY_LABELS[milestone.category],
    progressLabel: getMilestoneProgressLabel(state, milestone.id),
    rewardSummary: getMilestoneRewardSummary(milestone.reward),
  }
}

export function getVisibleMilestones(state: GameState): MilestoneDefinition[] {
  return MILESTONES.filter((milestone) => milestone.visibleByDefault || isMilestoneUnlocked(state, milestone.id))
}

export function evaluateMilestones(state: GameState): MilestoneEvaluation {
  const unlockedMilestones: Partial<Record<MilestoneId, boolean>> = { ...state.unlockedMilestones }
  const rewards: MilestoneReward = {}
  const newlyUnlockedIds: MilestoneId[] = []

  for (const milestone of MILESTONES) {
    if (isMilestoneUnlocked(state, milestone.id)) {
      continue
    }

    if (!getMilestoneCondition(state, milestone.id)) {
      continue
    }

    unlockedMilestones[milestone.id] = true
    newlyUnlockedIds.push(milestone.id)
    rewards.cash = (rewards.cash ?? 0) + (milestone.reward.cash ?? 0)
    rewards.researchPoints = (rewards.researchPoints ?? 0) + (milestone.reward.researchPoints ?? 0)
    rewards.influence = (rewards.influence ?? 0) + (milestone.reward.influence ?? 0)
    rewards.reputation = (rewards.reputation ?? 0) + (milestone.reward.reputation ?? 0)
    rewards.deskSlots = (rewards.deskSlots ?? 0) + (milestone.reward.deskSlots ?? 0)
  }

  return {
    unlockedMilestones,
    rewards,
    newlyUnlockedIds,
  }
}

export function applyMilestoneRewards(state: GameState, rewards: MilestoneReward): Pick<GameState, 'cash' | 'researchPoints' | 'influence' | 'reputation'> {
  if (rewards.deskSlots) {
    state.baseDeskSlots += rewards.deskSlots
  }

  return {
    cash: state.cash + (rewards.cash ?? 0),
    researchPoints: state.researchPoints + (rewards.researchPoints ?? 0),
    influence: state.influence + (rewards.influence ?? 0),
    reputation: state.reputation + (rewards.reputation ?? 0),
  }
}

export function getMilestoneNotificationLabel(milestoneId: MilestoneId): string {
  return MILESTONES.find((milestone) => milestone.id === milestoneId)?.name ?? milestoneId
}

export function getMilestonePageCount(state: GameState): number {
  return Math.max(1, Math.ceil(getVisibleMilestones(state).length / 16))
}

export function getMilestonesForPage(state: GameState, page: number): MilestoneDefinition[] {
  const safePage = Math.max(0, page)
  return getVisibleMilestones(state).slice(safePage * 16, safePage * 16 + 16)
}

export function getMilestoneRewardSummary(reward: MilestoneReward): string {
  const parts: string[] = []
  if (reward.cash) parts.push(`$${Math.floor(reward.cash).toLocaleString()}`)
  if (reward.researchPoints) parts.push(`${Math.floor(reward.researchPoints).toLocaleString()} RP`)
  if (reward.influence) parts.push(`${reward.influence.toLocaleString()} Influence`)
  if (reward.reputation) parts.push(`${reward.reputation.toLocaleString()} Reputation`)
  if (reward.deskSlots) parts.push(`${reward.deskSlots.toLocaleString()} Desk Slots`)
  if (reward.note) parts.push(reward.note)
  return parts.join(' · ')
}

export function getMilestoneDefinition(milestoneId: MilestoneId): MilestoneDefinition | undefined {
  return MILESTONES.find((milestone) => milestone.id === milestoneId)
}

export function getMilestoneProgressLabel(state: GameState, milestoneId: MilestoneId): string | null {
  switch (milestoneId) {
    case 'activeDesk': return `${state.lifetimeManualTrades}/25 trades`
    case 'smallTeam': return `${state.internCount}/5 interns`
    case 'firstDeskSpace': return `${state.deskSpaceCount}/1 desk space`
    case 'fourUpgrades': return `${getPurchasedUpgradeCount(state)}/3 upgrades`
    case 'juniorDesk': return `${state.juniorTraderCount}/5 juniors`
    case 'fiveInternScientists': return `${state.internResearchScientistCount}/5 intern scientists`
    case 'firstFloorSpace': return `${state.floorSpaceCount}/1 floor space`
    case 'fiveUpgrades': return `${getPurchasedUpgradeCount(state)}/5 upgrades`
    case 'tenInterns': return `${state.internCount}/10 interns`
    case 'tenJuniors': return `${state.juniorTraderCount}/10 juniors`
    case 'threeSeniors': return `${state.seniorTraderCount}/3 seniors`
    case 'humanDeskScaled': return `${state.internCount + state.juniorTraderCount + state.seniorTraderCount}/25 staff`
    case 'hundredRP': return `${Math.floor(state.lifetimeResearchPointsEarned)}/100 RP`
    case 'fiveResearchNodes': return `${getPurchasedResearchNodeCount(state)}/5 nodes`
    case 'sectorFloorBuilt': return `${getTotalAssignedUnitsToSectors(state)}/10 assigned`
    case 'machineDesk': return `${getTotalAutomationUnits(state)}/5 units`
    case 'threePolicies': return `${getTotalPurchasedPolicies(state)}/3 policies`
    case 'tenPrestigeRanks': return `${getTotalPrestigeGoalRanksPurchased(state)}/10 ranks`
    case 'tenOptimisationRanks': return `${getTotalOptimisationRanks(state)}/10 ranks`
    case 'fiftyOptimisationRanks': return `${getTotalOptimisationRanks(state)}/50 ranks`
    case 'hundredOptimisationRanks': return `${getTotalOptimisationRanks(state)}/100 ranks`
    default: return null
  }
}

export function inferComplianceReviewCountFromState(state: GameState): number {
  const totalOutstanding = state.compliancePayments.staff.overdueAmount + state.compliancePayments.energy.overdueAmount + state.compliancePayments.automation.overdueAmount + state.compliancePayments.institutional.overdueAmount
  if (totalOutstanding > 0 || state.complianceReviewRemainingSeconds < getComplianceReviewIntervalSeconds()) {
    return Math.max(1, state.totalComplianceReviewsTriggered)
  }

  return state.totalComplianceReviewsTriggered
}

export function inferCompliancePaymentsMadeFromState(state: GameState): number {
  if (state.lastCompliancePayment > 0) {
    return Math.max(1, state.totalCompliancePaymentsMade)
  }

  return state.totalCompliancePaymentsMade
}

export function inferTimedBoostActivationsFromState(state: GameState): number {
  const activeOrCooling = Object.values(state.timedBoosts).some((runtime) => runtime.isActive || runtime.remainingCooldownSeconds > 0)
  return activeOrCooling ? Math.max(1, state.totalTimedBoostActivations) : state.totalTimedBoostActivations
}

export function getLifetimeReputationSpentOrHeld(state: GameState): number {
  return getLifetimeReputation(state)
}

export function getMilestoneTotalCount(): number {
  return MILESTONES.length
}
