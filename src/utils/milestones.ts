import { GLOBAL_BOOSTS, TIMED_BOOSTS } from '../data/boosts'
import { MILESTONE_CATEGORY_LABELS, MILESTONES } from '../data/milestones'
import { PRESTIGE_UPGRADES } from '../data/prestigeUpgrades'
import { REPEATABLE_UPGRADES } from '../data/repeatableUpgrades'
import { RESEARCH_TECH } from '../data/researchTech'
import { SECTOR_IDS } from '../data/sectors'
import { UPGRADES } from '../data/upgrades'
import type { GameState, MilestoneConditionModel, MilestoneDefinition, MilestoneId, MilestoneReward, RepeatableUpgradeFamily, ResearchTechId, UnitId } from '../types/game'
import { getOwnedGlobalBoostCount, isTimedBoostAutoUnlocked } from './boosts'
import { getComplianceReviewIntervalSeconds } from './compliance'
import { getIncomeBreakdown } from './economy'
import { getLifetimeReputation } from './prestige'
import { isAutomationUnlocked, isLobbyingUnlocked } from './research'

type MilestoneEvaluation = {
  unlockedMilestones: Partial<Record<MilestoneId, boolean>>
  unlockedMetaMilestones: Partial<Record<MilestoneId, boolean>>
  rewards: MilestoneReward
  newlyUnlockedIds: MilestoneId[]
}

function isMilestoneUnlocked(state: GameState, milestoneId: MilestoneId): boolean {
  return state.unlockedMilestones[milestoneId] === true || state.unlockedMetaMilestones[milestoneId] === true
}

function isRunMilestoneUnlocked(state: GameState, milestoneId: MilestoneId): boolean {
  return state.unlockedMilestones[milestoneId] === true
}

function isMetaMilestoneUnlocked(state: GameState, milestoneId: MilestoneId): boolean {
  return state.unlockedMetaMilestones[milestoneId] === true
}

function areRequiredMilestonesUnlocked(state: GameState, milestone: MilestoneDefinition): boolean {
  return (milestone.requiresMilestones ?? []).every((requiredId) => isMilestoneUnlocked(state, requiredId))
}

function sumRecordValues(record: Record<string, number | boolean | undefined>): number {
  return Object.values(record).reduce<number>((total, value) => total + (typeof value === 'number' ? value : value === true ? 1 : 0), 0)
}

function getPurchasedUpgradeCount(state: GameState): number {
  return UPGRADES.reduce((total, upgrade) => total + (state.purchasedUpgrades[upgrade.id] === true ? 1 : 0), 0)
}

function getPurchasedUpgradeCountByGroup(state: GameState, group: MilestoneDefinition['targetId']): number {
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

function getTotalUnlockedAutomationStrategies(state: GameState): number {
  return Object.keys(GLOBAL_BOOSTS) && ['meanReversionModels', 'momentumModels', 'arbitrageEngine', 'marketMakingEngine', 'scalpingFramework']
    .reduce((total, id) => total + (state.purchasedResearchTech[id as ResearchTechId] === true ? 1 : 0), 0)
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

function getUnitCount(state: GameState, unitId: UnitId): number {
  if (unitId === 'intern') return state.internCount
  if (unitId === 'juniorTrader') return state.juniorTraderCount
  if (unitId === 'seniorTrader') return state.seniorTraderCount
  if (unitId === 'quantTrader') return state.quantTraderCount
  if (unitId === 'propDesk') return state.propDeskCount
  if (unitId === 'institutionalDesk') return state.institutionalDeskCount
  if (unitId === 'hedgeFund') return state.hedgeFundCount
  if (unitId === 'investmentFirm') return state.investmentFirmCount
  if (unitId === 'ruleBasedBot') return state.ruleBasedBotCount
  if (unitId === 'mlTradingBot') return state.mlTradingBotCount
  if (unitId === 'aiTradingBot') return state.aiTradingBotCount
  if (unitId === 'internResearchScientist') return state.internResearchScientistCount
  if (unitId === 'juniorResearchScientist') return state.juniorResearchScientistCount
  if (unitId === 'seniorResearchScientist') return state.seniorResearchScientistCount
  return state.juniorPoliticianCount
}

function getInfrastructureCount(state: GameState, targetId: string): number {
  if (targetId === 'deskSpace') return state.deskSpaceCount
  if (targetId === 'floorSpace') return state.floorSpaceCount
  if (targetId === 'office') return state.officeCount
  if (targetId === 'serverRack') return state.serverRackCount
  if (targetId === 'serverRoom') return state.serverRoomCount
  if (targetId === 'dataCenter') return state.dataCenterCount
  if (targetId === 'cloudCompute') return state.cloudComputeCount
  return 0
}

function evaluateMilestoneCondition(state: GameState, milestone: MilestoneDefinition): boolean {
  const model: MilestoneConditionModel = milestone.conditionModel
  const targetId = milestone.targetId
  const value = milestone.conditionValue ?? 0
  const effectiveServerRackCount = Math.max(0, state.serverRackCount - 1)
  const breakdown = getIncomeBreakdown(state)

  switch (model) {
    case 'manualTradesAtLeast':
      return state.lifetimeManualTrades >= value
    case 'oneTimeUpgradesPurchasedAtLeast':
      return getPurchasedUpgradeCount(state) >= value
    case 'unitCountAtLeast':
      return typeof targetId === 'string' && getUnitCount(state, targetId as UnitId) >= value
    case 'infrastructureCountAtLeast':
      return typeof targetId === 'string' && getInfrastructureCount(state, targetId) >= value
    case 'mixedUnitThresholds':
      return Object.entries(milestone.thresholds ?? {}).every(([unitId, threshold]) => getUnitCount(state, unitId as UnitId) >= Number(threshold ?? 0))
    case 'firstCompliancePayment':
      return state.totalCompliancePaymentsMade >= 1 || state.lastCompliancePayment > 0
    case 'deskOrDeskPlusInstitutionIncomeAtLeast':
      return breakdown.generalDeskIncome >= value
        || (breakdown.internIncome + breakdown.juniorIncome + breakdown.seniorIncome + breakdown.propDeskIncome + breakdown.institutionalDeskIncome + breakdown.hedgeFundIncome + breakdown.investmentFirmIncome) >= value
    case 'humanCountAtLeast':
      return state.internCount + state.juniorTraderCount + state.seniorTraderCount >= value
    case 'researchUnlocked':
      return getResearchUnlocked(state)
    case 'researchNodesPurchasedAtLeast':
      return getPurchasedResearchNodeCount(state) >= value
    case 'effectiveServerRackCountAtLeast':
      return effectiveServerRackCount >= value
    case 'lifetimeResearchAtLeast':
      return state.lifetimeResearchPointsEarned >= value
    case 'complianceReviewsAtLeast':
      return state.totalComplianceReviewsTriggered >= value
    case 'assignedUnitsAtLeast':
      return getTotalAssignedUnitsToSectors(state) >= value
    case 'specialistResearchUnlockedAtLeast':
      return getTotalSpecialistTrainingResearchUnlocked(state) >= value
    case 'specialistsAtLeast':
      return getTotalSpecialists(state) >= value
    case 'correctSpecialistAssignmentsAtLeast':
      return getTotalCorrectSpecialistAssignments(state) >= value
    case 'researchTechPurchased':
      return typeof targetId === 'string' && state.purchasedResearchTech[targetId as ResearchTechId] === true
    case 'automationStrategiesUnlockedAtLeast':
      return getTotalUnlockedAutomationStrategies(state) >= value
    case 'configuredAutomationClassesAtLeast':
      return getTotalConfiguredAutomationClasses(state) >= value
    case 'upgradesPurchasedInGroupAtLeast':
      return getPurchasedUpgradeCountByGroup(state, targetId) >= value
    case 'sectorUnlocked':
      return typeof targetId === 'string' && state.unlockedSectors[targetId as keyof typeof state.unlockedSectors] === true
    case 'sectorIncomeAtLeast':
      return typeof targetId === 'string' && breakdown.sectorBreakdown[targetId as keyof typeof breakdown.sectorBreakdown].totalIncome >= value
    case 'activeAssignedSectorsAtLeast':
      return getActiveAssignedSectorCount(state) >= value
    case 'unlockedSectorsAtLeast':
      return getUnlockedSectorCount(state) >= value
    case 'lobbyingUnlockedOrDiscovered':
      return isLobbyingUnlocked(state) || state.discoveredLobbying
    case 'purchasedPoliciesAtLeast':
      return getTotalPurchasedPolicies(state) >= value
    case 'mandateResearchUnlockedAtLeast':
      return getTotalMandateFrameworkResearchUnlocked(state) >= value
    case 'mandatedInstitutionsAtLeast':
      return getTotalMandatedInstitutions(state) >= value
    case 'correctMandateAssignmentsAtLeast':
      return getTotalCorrectMandateAssignments(state) >= value
    case 'automationCountAtLeast':
      return getTotalAutomationUnits(state) >= value
    case 'anyTimedBoostUnlocked':
      return getBoostsUnlocked(state)
    case 'timedBoostActivationsAtLeast':
      return state.totalTimedBoostActivations >= value
    case 'ownedGlobalBoostsAtLeast':
      return getTotalOwnedGlobalBoosts(state) >= value
    case 'prestigeCountAtLeast':
      return state.prestigeCount >= value
    case 'reputationSpentAtLeast':
      return state.reputationSpent >= value
    case 'prestigeRanksPurchasedAtLeast':
      return getTotalPrestigeGoalRanksPurchased(state) >= value
    case 'optimisationRanksAtLeast':
      return getTotalOptimisationRanks(state) >= value
    case 'optimisationRanksByFamilyAtLeast':
      return typeof targetId === 'string' && getOptimisationRanksByFamily(state, targetId as RepeatableUpgradeFamily) >= value
  }
}

export function isMilestoneDefinitionMet(state: GameState, milestone: MilestoneDefinition): boolean {
  return evaluateMilestoneCondition(state, milestone)
}

export function getUnlockedMilestoneCount(state: GameState): number {
  return MILESTONES.reduce((total, milestone) => total + (isRunMilestoneUnlocked(state, milestone.id) ? 1 : 0), 0)
}

export function getUnlockedMetaMilestoneCount(state: GameState): number {
  return MILESTONES.reduce((total, milestone) => total + (isMetaMilestoneUnlocked(state, milestone.id) ? 1 : 0), 0)
}

export function getNextRecommendedMilestone(state: GameState): MilestoneDefinition | null {
  return MILESTONES.find((milestone) => milestone.visibleByDefault && milestone.scope === 'run' && !isRunMilestoneUnlocked(state, milestone.id) && areRequiredMilestonesUnlocked(state, milestone)) ?? null
}

export function getNextRecommendedMetaMilestone(state: GameState): MilestoneDefinition | null {
  return MILESTONES.find((milestone) => milestone.visibleByDefault && milestone.scope === 'meta' && !isMetaMilestoneUnlocked(state, milestone.id) && areRequiredMilestonesUnlocked(state, milestone)) ?? null
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
  return MILESTONES.filter((milestone) => milestone.scope === 'run' && (milestone.visibleByDefault || isMilestoneUnlocked(state, milestone.id) || areRequiredMilestonesUnlocked(state, milestone)))
}

export function getVisibleMetaMilestones(state: GameState): MilestoneDefinition[] {
  return MILESTONES.filter((milestone) => milestone.scope === 'meta' && (milestone.visibleByDefault || isMilestoneUnlocked(state, milestone.id) || areRequiredMilestonesUnlocked(state, milestone)))
}

export function getTotalRunMilestoneCount(): number {
  return MILESTONES.filter((milestone) => milestone.scope === 'run').length
}

export function getTotalMetaMilestoneCount(): number {
  return MILESTONES.filter((milestone) => milestone.scope === 'meta').length
}

export function evaluateMilestones(state: GameState): MilestoneEvaluation {
  const unlockedMilestones: Partial<Record<MilestoneId, boolean>> = { ...state.unlockedMilestones }
  const unlockedMetaMilestones: Partial<Record<MilestoneId, boolean>> = { ...state.unlockedMetaMilestones }
  const rewards: MilestoneReward = {}
  const newlyUnlockedIds: MilestoneId[] = []

  for (const milestone of MILESTONES) {
    if (isMilestoneUnlocked(state, milestone.id)) {
      continue
    }

    if (!areRequiredMilestonesUnlocked(state, milestone)) {
      continue
    }

    if (!evaluateMilestoneCondition(state, milestone)) {
      continue
    }

    if (milestone.scope === 'meta') {
      unlockedMetaMilestones[milestone.id] = true
    } else {
      unlockedMilestones[milestone.id] = true
    }
    newlyUnlockedIds.push(milestone.id)
    rewards.cash = (rewards.cash ?? 0) + (milestone.reward.cash ?? 0)
    rewards.researchPoints = (rewards.researchPoints ?? 0) + (milestone.reward.researchPoints ?? 0)
    rewards.influence = (rewards.influence ?? 0) + (milestone.reward.influence ?? 0)
    rewards.reputation = (rewards.reputation ?? 0) + (milestone.reward.reputation ?? 0)
    rewards.deskSlots = (rewards.deskSlots ?? 0) + (milestone.reward.deskSlots ?? 0)
  }

  return {
    unlockedMilestones,
    unlockedMetaMilestones,
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
  return Math.max(1, Math.ceil((getVisibleMilestones(state).length + getVisibleMetaMilestones(state).length) / 16))
}

export function getMilestonesForPage(state: GameState, page: number): MilestoneDefinition[] {
  const safePage = Math.max(0, page)
  return [...getVisibleMilestones(state), ...getVisibleMetaMilestones(state)].slice(safePage * 16, safePage * 16 + 16)
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

export function getNextRunMilestone(state: GameState): MilestoneDefinition | null {
  return MILESTONES.find((milestone) => milestone.scope === 'run' && !isRunMilestoneUnlocked(state, milestone.id) && areRequiredMilestonesUnlocked(state, milestone)) ?? null
}

export function getNextMetaMilestone(state: GameState): MilestoneDefinition | null {
  return MILESTONES.find((milestone) => milestone.scope === 'meta' && !isMetaMilestoneUnlocked(state, milestone.id) && areRequiredMilestonesUnlocked(state, milestone)) ?? null
}

export function getMilestoneProgressLabel(state: GameState, milestoneId: MilestoneId): string | null {
  const milestone = getMilestoneDefinition(milestoneId)

  if (!milestone) {
    return null
  }

  const value = milestone.conditionValue ?? 0

  switch (milestone.conditionModel) {
    case 'manualTradesAtLeast':
      return `${state.lifetimeManualTrades}/${value} trades`
    case 'unitCountAtLeast':
      return typeof milestone.targetId === 'string' ? `${getUnitCount(state, milestone.targetId as UnitId)}/${value} ${milestone.targetId}` : null
    case 'infrastructureCountAtLeast':
      return typeof milestone.targetId === 'string' ? `${getInfrastructureCount(state, milestone.targetId)}/${value} ${milestone.targetId}` : null
    case 'oneTimeUpgradesPurchasedAtLeast':
      return `${getPurchasedUpgradeCount(state)}/${value} upgrades`
    case 'humanCountAtLeast':
      return `${state.internCount + state.juniorTraderCount + state.seniorTraderCount}/${value} staff`
    case 'lifetimeResearchAtLeast':
      return `${Math.floor(state.lifetimeResearchPointsEarned)}/${value} RP`
    case 'researchNodesPurchasedAtLeast':
      return `${getPurchasedResearchNodeCount(state)}/${value} nodes`
    case 'assignedUnitsAtLeast':
      return `${getTotalAssignedUnitsToSectors(state)}/${value} assigned`
    case 'automationCountAtLeast':
      return `${getTotalAutomationUnits(state)}/${value} units`
    case 'purchasedPoliciesAtLeast':
      return `${getTotalPurchasedPolicies(state)}/${value} policies`
    case 'prestigeRanksPurchasedAtLeast':
      return `${getTotalPrestigeGoalRanksPurchased(state)}/${value} ranks`
    case 'optimisationRanksAtLeast':
      return `${getTotalOptimisationRanks(state)}/${value} ranks`
    case 'optimisationRanksByFamilyAtLeast':
      return typeof milestone.targetId === 'string' ? `${getOptimisationRanksByFamily(state, milestone.targetId as RepeatableUpgradeFamily)}/${value} ranks` : null
    default:
      return null
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
