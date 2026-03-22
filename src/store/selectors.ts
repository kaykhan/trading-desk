import { canAffordCapacityPower, getAvailableDeskSlots, getBulkCapacityInfrastructureCost, getCapacityPowerUsage, getFloorExpansionCost, getNextCapacityCost, getOfficeCost, getOfficeExpansionCost, getTotalDeskSlots, getUsedDeskSlots, isAtDeskCapacity, isCapacityInfrastructureVisible } from '../utils/capacity'
import { GLOBAL_BOOSTS, TIMED_BOOSTS } from '../data/boosts'
import { canActivateTimedBoost, formatBoostTimer, getActiveTimedBoostCount, getOwnedGlobalBoostCount, getTimedBoostCooldownRemaining, getTimedBoostDurationRemaining, getTimedBoostStatusLabel, isGlobalBoostOwned, isTimedBoostAutoUnlocked, isTimedBoostActive, isTimedBoostUnlocked } from '../utils/boosts'
import { getBaseAutomationComplianceCost, getBaseComplianceBurden, getBaseComplianceCostBreakdown, getBaseComplianceEfficiencyMultiplier, getBaseEnergyComplianceCost, getBaseInstitutionalComplianceCost, getBaseStaffComplianceCost, getComplianceBurden, getComplianceCategoryOutstandingDue, getComplianceCostBreakdown, getComplianceEfficiencyMultiplier, getCompliancePaymentPenaltyHint, getCompliancePaymentStatusLabel, getComplianceReviewDueAmount, getComplianceReviewLabel, getComplianceStatusCopy, getCompliancePenaltyPercent, getComplianceRevealBurdenThreshold, getEffectiveComplianceBurden, getFinalComplianceEfficiencyMultiplier, getTopComplianceSources, getTotalBaseComplianceCost, getTotalComplianceSavingsFromLobbying, getTotalEffectiveComplianceCost, isComplianceVisible } from '../utils/compliance'
import { getActiveLobbyingPolicyIds, getAutomationComplianceCostReliefRate, getComplianceBurdenRelief, getCompliancePenaltyRelief, getEnergyComplianceCostReliefRate, getInstitutionalComplianceCostReliefRate, getLobbyingPolicyReliefDefinition, getLobbyingReadout, getPolicyActiveSavingsSummary, getStaffComplianceCostReliefRate } from '../utils/lobbying'
import { AUTOMATION_STRATEGY_IDS, AUTOMATION_UNIT_IDS } from '../data/automation'
import { getBulkRepeatableUpgradeCost, getMaxAffordableRepeatableUpgradeQuantity, getRepeatableUpgradeCost as getRepeatableUpgradeScaledCost, getRepeatableUpgradeDefinition, getRepeatableUpgradeMultiplier, getRepeatableUpgradeRank as getRepeatableRank, getTotalRepeatableUpgradeRanksPurchased, isRepeatableUpgradeGloballyUnlocked } from '../data/repeatableUpgrades'
import { MARKET_EVENTS } from '../data/marketEvents'
import { getAutomationAdjustedPayout, getAutomationAverageIncomePerSecond, getAutomationBulkCost, getAutomationDisplayedCycleDuration, getAutomationNextCost, getAutomationPowerUse, getAutomationProgressPercent, getAutomationStrategyLabel, getAutomationTimeRemaining, getAutomationUnitLabel, getAutomationOwnedCount, getUnlockedAutomationStrategies, isAutomationStrategyUnlocked, isAutomationUnitUnlocked } from '../utils/automation'
import { getAssignedCount, getAssignedCountForSector, getAiTradingBotCost, getAiTradingBotPowerUsage, getAvailableAssignableUnitCount, getBulkPowerInfrastructureCost, getBulkUnitCost, getCashPerSecond, getGeneralDeskCashPerSecond, getGlobalMultiplier, getHumanTradingPowerUsage, getIncomeBreakdown, getInfluencePerSecond, getInternCost, getInternResearchScientistCost, getJuniorResearchScientistCost, getJuniorTraderCost, getMachineEfficiencyMultiplier, getManualIncome, getMlTradingBotCost, getMlTradingBotPowerUsage, getNextPowerInfrastructureCost, getNextUnitCost, getOwnedAssignableUnitCount, getPowerCapacity, getPowerUsage, getPrestigeMultiplier, getQuantTraderCost, getResearchPointsPerSecond, getRuleBasedBotCost, getRuleBasedBotPowerUsage, getSectorCashPerSecond, getSeniorResearchScientistCost, getSeniorTraderCost, isPowerInfrastructureVisible, isUnitUnlocked } from '../utils/economy'
import { getLobbyingPolicyDefinition } from '../data/lobbyingPolicies'
import { PRESTIGE_TIER_LABELS, PRESTIGE_TIERS, getPrestigeUpgradeDefinition } from '../data/prestigeUpgrades'
import { getResearchTechsByBranch, RESEARCH_BRANCH_ORDER } from '../data/researchTech'
import { getUpgradeDefinition } from '../data/upgrades'
import { canPrestige, getLifetimeReputation, getNextPrestigeTierLabel, getPrestigeGain, getPrestigeGoalNextRankCost, getPrestigeTierLabel, getReputationGainForNextPrestige, getSeedCapitalBonus } from '../utils/prestige'
import { CAPACITY_INFRASTRUCTURE } from '../data/capacity'
import { canBuyResearchTech, getMissingResearchPrerequisites, getResearchTechShortfall, isAutomationUnlocked, isEnergySectorUnlocked, isLobbyingUnlocked, isPowerInfrastructureUnlocked, isResearchTechUnlocked, isResearchTechVisible, isTechnologySectorUnlocked } from '../utils/research'
import { formatMarketEventTimer, getActiveMarketEvent, getAutomationEventMultiplier, getGlobalEventMultiplier, getMachineEfficiencyEventModifier, getMarketEventEffectSummary, getMarketEventRemainingSeconds, getNextMarketEventCooldownSeconds, getSectorEventMultiplier, isMarketEventActive } from '../utils/marketEvents'
import { getAssignedTraderSpecialistsForSector, getGenericTraderCount, getSpecializationResearchUnlockId, getTotalTraderSpecialists, getTraderSpecialistCount, getTraderSpecialistTrainingCost } from '../utils/specialization'
import { getAssignedInstitutionMandatesForSector, getGenericInstitutionCount, getInstitutionMandateApplicationCost, getInstitutionMandateCount, getInstitutionMandateResearchUnlockId, getTotalInstitutionMandates } from '../utils/mandates'
import { getMilestoneDefinition, getMilestonePageCount, getMilestoneProgressLabel, getMilestoneRewardSummary, getMilestonesForPage, getNextRecommendedMilestone, getNextRecommendedMilestoneSummary, getUnlockedMilestoneCount, getVisibleMilestones, getMilestoneTotalCount } from '../utils/milestones'
import type { AutomationStrategyId, AutomationUnitId, CapacityInfrastructureId, GameState, GenericSectorAssignableUnitId, HumanAssignableUnitId, InstitutionalMandateId, InstitutionalMandateUnitId, LobbyingPolicyId, PowerInfrastructureId, PrestigeUpgradeId, RepeatableUpgradeId, ResearchTechId, SectorId, TraderSpecialistUnitId, TraderSpecializationId, UnitId, UpgradeId } from '../types/game'

export const selectors = {
  cashPerClick: (state: GameState) => getManualIncome(state),
  cashPerSecond: (state: GameState) => getCashPerSecond(state)
    + getAutomationAverageIncomePerSecond(state, 'quantTrader')
    + getAutomationAverageIncomePerSecond(state, 'ruleBasedBot')
    + getAutomationAverageIncomePerSecond(state, 'mlTradingBot')
    + getAutomationAverageIncomePerSecond(state, 'aiTradingBot'),
  researchPoints: (state: GameState) => state.researchPoints,
  researchPointsPerSecond: (state: GameState) => getResearchPointsPerSecond(state),
  influence: (state: GameState) => state.influence,
  influencePerSecond: (state: GameState) => getInfluencePerSecond(state),
  activeTimedBoostCount: (state: GameState) => getActiveTimedBoostCount(state),
  timedBoostState: (boostId: keyof typeof TIMED_BOOSTS) => (state: GameState) => state.timedBoosts[boostId],
  timedBoostUnlocked: (boostId: keyof typeof TIMED_BOOSTS) => (state: GameState) => isTimedBoostUnlocked(state, boostId),
  timedBoostCanActivate: (boostId: keyof typeof TIMED_BOOSTS) => (state: GameState) => canActivateTimedBoost(state, boostId),
  timedBoostActive: (boostId: keyof typeof TIMED_BOOSTS) => (state: GameState) => isTimedBoostActive(state, boostId),
  timedBoostStatusLabel: (boostId: keyof typeof TIMED_BOOSTS) => (state: GameState) => getTimedBoostStatusLabel(state, boostId),
  timedBoostDurationLabel: (boostId: keyof typeof TIMED_BOOSTS) => (state: GameState) => formatBoostTimer(getTimedBoostDurationRemaining(state, boostId)),
  timedBoostCooldownLabel: (boostId: keyof typeof TIMED_BOOSTS) => (state: GameState) => formatBoostTimer(getTimedBoostCooldownRemaining(state, boostId)),
  timedBoostAutoUnlocked: (state: GameState) => isTimedBoostAutoUnlocked(state),
  ownedGlobalBoostCount: (state: GameState) => getOwnedGlobalBoostCount(state),
  globalBoostOwned: (boostId: keyof typeof GLOBAL_BOOSTS) => (state: GameState) => isGlobalBoostOwned(state, boostId),
  complianceVisible: (state: GameState) => isComplianceVisible(state),
  baseComplianceBurden: (state: GameState) => getBaseComplianceBurden(state),
  complianceBurdenRelief: (state: GameState) => getComplianceBurdenRelief(state),
  effectiveComplianceBurden: (state: GameState) => getEffectiveComplianceBurden(state),
  complianceBurden: (state: GameState) => getComplianceBurden(state),
  baseComplianceEfficiencyMultiplier: (state: GameState) => getBaseComplianceEfficiencyMultiplier(state),
  finalComplianceEfficiencyMultiplier: (state: GameState) => getFinalComplianceEfficiencyMultiplier(state),
  complianceEfficiencyMultiplier: (state: GameState) => getComplianceEfficiencyMultiplier(state),
  compliancePenaltyRelief: (state: GameState) => getCompliancePenaltyRelief(state),
  compliancePenaltyPercent: (state: GameState) => getCompliancePenaltyPercent(state),
  complianceReviewRemainingSeconds: (state: GameState) => state.complianceReviewRemainingSeconds,
  complianceReviewRemainingLabel: (state: GameState) => getComplianceReviewLabel(state),
  projectedComplianceCost: (state: GameState) => getComplianceReviewDueAmount(state),
  complianceReviewDueAmount: (state: GameState) => getComplianceReviewDueAmount(state),
  complianceCategoryDueAmount: (category: 'staff' | 'energy' | 'automation' | 'institutional') => (state: GameState) => getComplianceCategoryOutstandingDue(state, category),
  complianceCategoryStatusLabel: (category: 'staff' | 'energy' | 'automation' | 'institutional') => (state: GameState) => getCompliancePaymentStatusLabel(state, category),
  complianceCategoryPenaltyHint: (category: 'staff' | 'energy' | 'automation' | 'institutional') => (_state: GameState) => getCompliancePaymentPenaltyHint(category),
  complianceCategoryAutoPayEnabled: (category: 'staff' | 'energy' | 'automation' | 'institutional') => (state: GameState) => state.settings.complianceAutoPayEnabled[category],
  staffComplianceCost: (state: GameState) => getComplianceCostBreakdown(state).staff,
  energyComplianceCost: (state: GameState) => getComplianceCostBreakdown(state).energy,
  automationComplianceCost: (state: GameState) => getComplianceCostBreakdown(state).automation,
  institutionalComplianceCost: (state: GameState) => getComplianceCostBreakdown(state).institutional,
  baseStaffComplianceCost: (state: GameState) => getBaseStaffComplianceCost(state),
  baseEnergyComplianceCost: (state: GameState) => getBaseEnergyComplianceCost(state),
  baseAutomationComplianceCost: (state: GameState) => getBaseAutomationComplianceCost(state),
  baseInstitutionalComplianceCost: (state: GameState) => getBaseInstitutionalComplianceCost(state),
  baseComplianceCostBreakdown: (state: GameState) => getBaseComplianceCostBreakdown(state),
  complianceCostBreakdown: (state: GameState) => getComplianceCostBreakdown(state),
  totalBaseComplianceCost: (state: GameState) => getTotalBaseComplianceCost(state),
  totalEffectiveComplianceCost: (state: GameState) => getTotalEffectiveComplianceCost(state),
  totalComplianceSavingsFromLobbying: (state: GameState) => getTotalComplianceSavingsFromLobbying(state),
  staffComplianceCostReliefRate: (state: GameState) => getStaffComplianceCostReliefRate(state),
  energyComplianceCostReliefRate: (state: GameState) => getEnergyComplianceCostReliefRate(state),
  automationComplianceCostReliefRate: (state: GameState) => getAutomationComplianceCostReliefRate(state),
  institutionalComplianceCostReliefRate: (state: GameState) => getInstitutionalComplianceCostReliefRate(state),
  topComplianceSources: (state: GameState) => getTopComplianceSources(state),
  complianceStatusCopy: (state: GameState) => getComplianceStatusCopy(state),
  complianceRevealThreshold: (_state: GameState) => getComplianceRevealBurdenThreshold(),
  lastCompliancePayment: (state: GameState) => state.lastCompliancePayment,
  activeLobbyingPolicyIds: (state: GameState) => getActiveLobbyingPolicyIds(state),
  lobbyingReadout: (state: GameState) => getLobbyingReadout(state),
  policyMitigationSummary: (policyId: LobbyingPolicyId) => (_state: GameState) => getLobbyingPolicyReliefDefinition(policyId).effectSummary,
  policyActiveSavingsSummary: (policyId: LobbyingPolicyId) => (state: GameState) => getPolicyActiveSavingsSummary(state, policyId),
  activeMarketEvent: (state: GameState) => getActiveMarketEvent(state),
  activeMarketEventId: (state: GameState) => state.activeMarketEvent,
  marketEventActive: (state: GameState) => isMarketEventActive(state),
  marketEventRemainingSeconds: (state: GameState) => getMarketEventRemainingSeconds(state),
  marketEventRemainingLabel: (state: GameState) => formatMarketEventTimer(getMarketEventRemainingSeconds(state)),
  nextMarketEventCooldownSeconds: (state: GameState) => getNextMarketEventCooldownSeconds(state),
  nextMarketEventCooldownLabel: (state: GameState) => formatMarketEventTimer(getNextMarketEventCooldownSeconds(state)),
  marketEventEffectSummary: (state: GameState) => getMarketEventEffectSummary(state),
  marketEventHistory: (state: GameState) => state.marketEventHistory,
  sectorEventMultiplier: (sectorId: SectorId) => (state: GameState) => getSectorEventMultiplier(state, sectorId),
  globalEventMultiplier: (state: GameState) => getGlobalEventMultiplier(state),
  automationEventMultiplier: (state: GameState) => getAutomationEventMultiplier(state),
  machineEfficiencyEventModifier: (state: GameState) => getMachineEfficiencyEventModifier(state),
  assignedCount: (unitId: GenericSectorAssignableUnitId) => (state: GameState) => getAssignedCount(state, unitId),
  assignedCountForSector: (unitId: GenericSectorAssignableUnitId, sectorId: SectorId) => (state: GameState) => getAssignedCountForSector(state, unitId, sectorId),
  availableCount: (unitId: GenericSectorAssignableUnitId) => (state: GameState) => getAvailableAssignableUnitCount(state, unitId),
  ownedAssignableCount: (unitId: GenericSectorAssignableUnitId) => (state: GameState) => getOwnedAssignableUnitCount(state, unitId),
  unlockedSectors: (state: GameState) => state.unlockedSectors,
  isSectorUnlocked: (sectorId: SectorId) => (state: GameState) => state.unlockedSectors[sectorId] === true,
  generalDeskCashPerSecond: (state: GameState) => getGeneralDeskCashPerSecond(state),
  sectorCashPerSecond: (sectorId: SectorId) => (state: GameState) => getSectorCashPerSecond(state, sectorId),
  sectorBreakdown: (state: GameState) => getIncomeBreakdown(state).sectorBreakdown,
  totalDeskSlots: (state: GameState) => getTotalDeskSlots(state),
  usedDeskSlots: (state: GameState) => getUsedDeskSlots(state),
  availableDeskSlots: (state: GameState) => getAvailableDeskSlots(state),
  capacityPowerUsage: (state: GameState) => getCapacityPowerUsage(state),
  capacityBuyMode: (infrastructureId: CapacityInfrastructureId) => (state: GameState) => state.ui.capacityBuyModes[infrastructureId],
  capacityInfrastructureVisible: (infrastructureId: CapacityInfrastructureId) => (state: GameState) => isCapacityInfrastructureVisible(state, infrastructureId),
  officeExpansionCost: (state: GameState) => getOfficeExpansionCost(state),
  floorExpansionCost: (state: GameState) => getFloorExpansionCost(state),
  officeCost: (state: GameState) => getOfficeCost(state),
  nextCapacityInfrastructureCost: (infrastructureId: CapacityInfrastructureId) => (state: GameState) => getNextCapacityCost(state, infrastructureId),
  bulkCapacityInfrastructureTotalCost: (infrastructureId: CapacityInfrastructureId) => (state: GameState) => getBulkCapacityInfrastructureCost(state, infrastructureId, state.ui.capacityBuyModes[infrastructureId], CAPACITY_INFRASTRUCTURE[infrastructureId].powerUsage).totalCost,
  bulkCapacityInfrastructureQuantity: (infrastructureId: CapacityInfrastructureId) => (state: GameState) => getBulkCapacityInfrastructureCost(state, infrastructureId, state.ui.capacityBuyModes[infrastructureId], CAPACITY_INFRASTRUCTURE[infrastructureId].powerUsage).quantity,
  isAtDeskCapacity: (state: GameState) => isAtDeskCapacity(state),
  canAffordCapacityPower: (powerRequired: number) => (state: GameState) => canAffordCapacityPower(state, powerRequired),
  powerUsage: (state: GameState) => getPowerUsage(state),
  quantTraderPowerUsage: (_state: GameState) => 0,
  ruleBasedBotPowerUsage: (state: GameState) => getRuleBasedBotPowerUsage(state),
  mlTradingBotPowerUsage: (state: GameState) => getMlTradingBotPowerUsage(state),
  aiTradingBotPowerUsage: (state: GameState) => getAiTradingBotPowerUsage(state),
  humanTradingPowerUsage: (state: GameState) => getHumanTradingPowerUsage(state),
  powerCapacity: (state: GameState) => getPowerCapacity(state),
  machineEfficiencyMultiplier: (state: GameState) => getMachineEfficiencyMultiplier(state),
  juniorIncome: (state: GameState) => getIncomeBreakdown(state).juniorIncome,
  internIncome: (state: GameState) => getIncomeBreakdown(state).internIncome,
  seniorIncome: (state: GameState) => getIncomeBreakdown(state).seniorIncome,
  quantTraderIncome: (state: GameState) => getAutomationAverageIncomePerSecond(state, 'quantTrader'),
  propDeskIncome: (state: GameState) => getIncomeBreakdown(state).propDeskIncome,
  institutionalDeskIncome: (state: GameState) => getIncomeBreakdown(state).institutionalDeskIncome,
  hedgeFundIncome: (state: GameState) => getIncomeBreakdown(state).hedgeFundIncome,
  investmentFirmIncome: (state: GameState) => getIncomeBreakdown(state).investmentFirmIncome,
  ruleBasedBotIncome: (state: GameState) => getAutomationAverageIncomePerSecond(state, 'ruleBasedBot'),
  mlTradingBotIncome: (state: GameState) => getAutomationAverageIncomePerSecond(state, 'mlTradingBot'),
  aiTradingBotIncome: (state: GameState) => getAutomationAverageIncomePerSecond(state, 'aiTradingBot'),
  globalMultiplier: (state: GameState) => getGlobalMultiplier(state),
  prestigeMultiplier: (state: GameState) => getPrestigeMultiplier(state),
  nextInternCost: (state: GameState) => getInternCost(state),
  nextJuniorTraderCost: (state: GameState) => getJuniorTraderCost(state),
  nextSeniorTraderCost: (state: GameState) => getSeniorTraderCost(state),
  nextQuantTraderCost: (state: GameState) => getQuantTraderCost(state),
  nextRuleBasedBotCost: (state: GameState) => getRuleBasedBotCost(state),
  nextMlTradingBotCost: (state: GameState) => getMlTradingBotCost(state),
  nextAiTradingBotCost: (state: GameState) => getAiTradingBotCost(state),
  nextInternResearchScientistCost: (state: GameState) => getInternResearchScientistCost(state),
  nextJuniorResearchScientistCost: (state: GameState) => getJuniorResearchScientistCost(state),
  nextSeniorResearchScientistCost: (state: GameState) => getSeniorResearchScientistCost(state),
  nextPropDeskCost: (state: GameState) => getNextUnitCost(state, 'propDesk'),
  nextInstitutionalDeskCost: (state: GameState) => getNextUnitCost(state, 'institutionalDesk'),
  nextHedgeFundCost: (state: GameState) => getNextUnitCost(state, 'hedgeFund'),
  nextInvestmentFirmCost: (state: GameState) => getNextUnitCost(state, 'investmentFirm'),
  nextPowerInfrastructureCost: (infrastructureId: PowerInfrastructureId) => (state: GameState) => getNextPowerInfrastructureCost(state, infrastructureId),
  prestigeGainPreview: (state: GameState) => getReputationGainForNextPrestige(state),
  currentPrestigeTier: (state: GameState) => getPrestigeTierLabel(state.prestigeCount),
  nextPrestigeTier: (state: GameState) => getNextPrestigeTierLabel(state.prestigeCount),
  prestigeTrack: (state: GameState) => PRESTIGE_TIERS.map((tierId, index) => ({ id: tierId, label: PRESTIGE_TIER_LABELS[tierId], completed: index < state.prestigeCount, current: index + 1 === state.prestigeCount })),
  unlockedMilestoneCount: (state: GameState) => getUnlockedMilestoneCount(state),
  totalMilestoneCount: (_state: GameState) => getMilestoneTotalCount(),
  nextRecommendedMilestone: (state: GameState) => getNextRecommendedMilestone(state),
  nextRecommendedMilestoneSummary: (state: GameState) => getNextRecommendedMilestoneSummary(state),
  visibleMilestones: (state: GameState) => getVisibleMilestones(state),
  milestonePageCount: (state: GameState) => getMilestonePageCount(state),
  milestonesForPage: (page: number) => (state: GameState) => getMilestonesForPage(state, page),
  milestoneRewardSummary: (milestoneId: string) => (state: GameState) => {
    const milestone = getMilestoneDefinition(milestoneId)
    return milestone ? getMilestoneRewardSummary(milestone.reward) : ''
  },
  milestoneProgressLabel: (milestoneId: string) => (state: GameState) => getMilestoneProgressLabel(state, milestoneId),
  canPrestige: (state: GameState) => canPrestige(state),
  lifetimeReputation: (state: GameState) => getLifetimeReputation(state),
  seedCapitalBonus: (state: GameState) => getSeedCapitalBonus(state),
  isUnitUnlocked: (unitId: UnitId) => (state: GameState) => isUnitUnlocked(state, unitId),
  canAffordIntern: (state: GameState) => isUnitUnlocked(state, 'intern') && state.cash >= getInternCost(state),
  canAffordJuniorTrader: (state: GameState) => isUnitUnlocked(state, 'juniorTrader') && state.cash >= getJuniorTraderCost(state),
  canAffordSeniorTrader: (state: GameState) => isUnitUnlocked(state, 'seniorTrader') && state.cash >= getSeniorTraderCost(state),
  canAffordQuantTrader: (state: GameState) => isUnitUnlocked(state, 'quantTrader') && state.cash >= getQuantTraderCost(state),
  canAffordRuleBasedBot: (state: GameState) => isUnitUnlocked(state, 'ruleBasedBot') && state.cash >= getRuleBasedBotCost(state),
  canAffordSystematicExecution: (state: GameState) => selectors.canAffordUpgrade('systematicExecution')(state),
  powerInfrastructureUnlocked: (state: GameState) => isPowerInfrastructureUnlocked(state),
  canAffordPowerInfrastructure: (infrastructureId: PowerInfrastructureId) => (state: GameState) => isPowerInfrastructureUnlocked(state) && state.cash >= getNextPowerInfrastructureCost(state, infrastructureId),
  powerInfrastructureVisible: (infrastructureId: PowerInfrastructureId) => (state: GameState) => isPowerInfrastructureVisible(state, infrastructureId),
  isUpgradePurchased: (upgradeId: UpgradeId) => (state: GameState) => state.purchasedUpgrades[upgradeId] === true,
  isResearchTechPurchased: (techId: ResearchTechId) => (state: GameState) => state.purchasedResearchTech[techId] === true,
  isResearchTechVisible: (techId: ResearchTechId) => (state: GameState) => isResearchTechVisible(state, techId),
  isResearchTechUnlocked: (techId: ResearchTechId) => (state: GameState) => isResearchTechUnlocked(state, techId),
  canAffordResearchTech: (techId: ResearchTechId) => (state: GameState) => canBuyResearchTech(state, techId),
  researchTechShortfall: (techId: ResearchTechId) => (state: GameState) => getResearchTechShortfall(state, techId),
  missingResearchPrerequisites: (techId: ResearchTechId) => (state: GameState) => getMissingResearchPrerequisites(state, techId),
  researchTechsByBranch: (branchId: (typeof RESEARCH_BRANCH_ORDER)[number]) => (_state: GameState) => getResearchTechsByBranch(branchId),
  technologySectorUnlocked: (state: GameState) => isTechnologySectorUnlocked(state),
  energySectorUnlocked: (state: GameState) => isEnergySectorUnlocked(state),
  traderSpecialistTrainingUnlocked: (specializationId: TraderSpecializationId) => (state: GameState) => state.purchasedResearchTech[getSpecializationResearchUnlockId(specializationId)] === true,
  traderSpecialistTrainingCost: (unitId: TraderSpecialistUnitId) => (_state: GameState) => getTraderSpecialistTrainingCost(unitId),
  totalTraderSpecialists: (unitId: TraderSpecialistUnitId) => (state: GameState) => getTotalTraderSpecialists(state, unitId),
  traderSpecialistCount: (unitId: TraderSpecialistUnitId, specializationId: TraderSpecializationId) => (state: GameState) => getTraderSpecialistCount(state, unitId, specializationId),
  genericTraderCount: (unitId: TraderSpecialistUnitId) => (state: GameState) => getGenericTraderCount(state, unitId),
  assignedTraderSpecialistsForSector: (unitId: TraderSpecialistUnitId, specializationId: TraderSpecializationId, sectorId: SectorId) => (state: GameState) => getAssignedTraderSpecialistsForSector(state, unitId, specializationId, sectorId),
  institutionMandateUnlocked: (mandateId: InstitutionalMandateId) => (state: GameState) => state.purchasedResearchTech[getInstitutionMandateResearchUnlockId(mandateId)] === true,
  institutionMandateApplicationCost: (unitId: InstitutionalMandateUnitId) => (_state: GameState) => getInstitutionMandateApplicationCost(unitId),
  totalInstitutionMandates: (unitId: InstitutionalMandateUnitId) => (state: GameState) => getTotalInstitutionMandates(state, unitId),
  institutionMandateCount: (unitId: InstitutionalMandateUnitId, mandateId: InstitutionalMandateId) => (state: GameState) => getInstitutionMandateCount(state, unitId, mandateId),
  genericInstitutionCount: (unitId: InstitutionalMandateUnitId) => (state: GameState) => getGenericInstitutionCount(state, unitId),
  assignedInstitutionMandatesForSector: (unitId: InstitutionalMandateUnitId, mandateId: InstitutionalMandateId, sectorId: SectorId) => (state: GameState) => getAssignedInstitutionMandatesForSector(state, unitId, mandateId, sectorId),
  isUpgradeVisible: (upgradeId: UpgradeId) => (state: GameState) => {
    const upgrade = getUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return false
    }

    return upgrade.visibleWhen ? upgrade.visibleWhen(state) : true
  },
  repeatableUpgradeRank: (upgradeId: RepeatableUpgradeId) => (state: GameState) => getRepeatableRank(state, upgradeId),
  repeatableUpgradesGloballyUnlocked: (state: GameState) => isRepeatableUpgradeGloballyUnlocked(state),
  totalRepeatableUpgradeRanksPurchased: (state: GameState) => getTotalRepeatableUpgradeRanksPurchased(state),
  isRepeatableUpgradeVisible: (upgradeId: RepeatableUpgradeId) => (state: GameState) => {
    const upgrade = getRepeatableUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return false
    }

    if (!isRepeatableUpgradeGloballyUnlocked(state)) {
      return false
    }

    return upgrade.visibleWhen ? upgrade.visibleWhen(state) : true
  },
  isRepeatableUpgradeUnlocked: (upgradeId: RepeatableUpgradeId) => (state: GameState) => {
    const upgrade = getRepeatableUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return false
    }

    if (!isRepeatableUpgradeGloballyUnlocked(state)) {
      return false
    }

    if (upgrade.visibleWhen && !upgrade.visibleWhen(state)) {
      return false
    }

    return upgrade.unlockWhen ? upgrade.unlockWhen(state) : true
  },
  repeatableUpgradeCost: (upgradeId: RepeatableUpgradeId) => (state: GameState) => {
    const upgrade = getRepeatableUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return 0
    }

    return getRepeatableUpgradeScaledCost(upgrade.baseCost, upgrade.costScaling, getRepeatableRank(state, upgradeId))
  },
  repeatableUpgradeBuyMode: (upgradeId: RepeatableUpgradeId) => (state: GameState) => state.ui.repeatableUpgradeBuyModes[upgradeId],
  bulkRepeatableUpgradeQuantity: (upgradeId: RepeatableUpgradeId) => (state: GameState) => {
    const upgrade = getRepeatableUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return 0
    }

    const buyMode = state.ui.repeatableUpgradeBuyModes[upgradeId]
    const currentRank = getRepeatableRank(state, upgradeId)
    const availableCurrency = upgrade.currency === 'cash' ? state.cash : upgrade.currency === 'researchPoints' ? state.researchPoints : state.influence

    return buyMode === 'max'
      ? getMaxAffordableRepeatableUpgradeQuantity(upgrade.baseCost, upgrade.costScaling, currentRank, availableCurrency).quantity
      : getBulkRepeatableUpgradeCost(upgrade.baseCost, upgrade.costScaling, currentRank, buyMode).quantity
  },
  bulkRepeatableUpgradeTotalCost: (upgradeId: RepeatableUpgradeId) => (state: GameState) => {
    const upgrade = getRepeatableUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return 0
    }

    const buyMode = state.ui.repeatableUpgradeBuyModes[upgradeId]
    const currentRank = getRepeatableRank(state, upgradeId)
    const availableCurrency = upgrade.currency === 'cash' ? state.cash : upgrade.currency === 'researchPoints' ? state.researchPoints : state.influence

    return buyMode === 'max'
      ? getMaxAffordableRepeatableUpgradeQuantity(upgrade.baseCost, upgrade.costScaling, currentRank, availableCurrency).totalCost
      : getBulkRepeatableUpgradeCost(upgrade.baseCost, upgrade.costScaling, currentRank, buyMode).totalCost
  },
  canAffordRepeatableUpgrade: (upgradeId: RepeatableUpgradeId) => (state: GameState) => {
    const upgrade = getRepeatableUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return false
    }

    if (!isRepeatableUpgradeGloballyUnlocked(state)) {
      return false
    }

    if (upgrade.visibleWhen && !upgrade.visibleWhen(state)) {
      return false
    }

    if (upgrade.unlockWhen && !upgrade.unlockWhen(state)) {
      return false
    }

    const totalCost = selectors.bulkRepeatableUpgradeTotalCost(upgradeId)(state)
    const quantity = selectors.bulkRepeatableUpgradeQuantity(upgradeId)(state)

    return quantity > 0 && (upgrade.currency === 'cash' ? state.cash >= totalCost : upgrade.currency === 'researchPoints' ? state.researchPoints >= totalCost : state.influence >= totalCost)
  },
  repeatableUpgradeShortfall: (upgradeId: RepeatableUpgradeId) => (state: GameState) => {
    const upgrade = getRepeatableUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return 0
    }

    if (!isRepeatableUpgradeGloballyUnlocked(state)) {
      return 0
    }

    if (upgrade.visibleWhen && !upgrade.visibleWhen(state)) {
      return 0
    }

    const totalCost = selectors.bulkRepeatableUpgradeTotalCost(upgradeId)(state)
    return upgrade.currency === 'cash' ? Math.max(0, totalCost - state.cash) : upgrade.currency === 'researchPoints' ? Math.max(0, totalCost - state.researchPoints) : Math.max(0, totalCost - state.influence)
  },
  repeatableUpgradeMultiplier: (upgradeId: RepeatableUpgradeId) => (state: GameState) => {
    const upgrade = getRepeatableUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return 1
    }

    return getRepeatableUpgradeMultiplier(state, upgradeId)
  },
  canAffordUpgrade: (upgradeId: UpgradeId) => (state: GameState) => {
    const upgrade = getUpgradeDefinition(upgradeId)

    if (!upgrade || state.purchasedUpgrades[upgradeId]) {
      return false
    }

    if (upgrade.visibleWhen && !upgrade.visibleWhen(state)) {
      return false
    }

    return state.cash >= upgrade.cost
  },
  upgradeCashShortfall: (upgradeId: UpgradeId) => (state: GameState) => {
    const upgrade = getUpgradeDefinition(upgradeId)

    if (!upgrade || state.purchasedUpgrades[upgradeId]) {
      return 0
    }

    return Math.max(0, upgrade.cost - state.cash)
  },
  nextUnitCost: (unitId: UnitId) => (state: GameState) => getNextUnitCost(state, unitId),
  unitBuyMode: (unitId: UnitId) => (state: GameState) => state.ui.unitBuyModes[unitId],
  powerBuyMode: (infrastructureId: PowerInfrastructureId) => (state: GameState) => state.ui.powerBuyModes[infrastructureId],
  bulkUnitQuantity: (unitId: UnitId) => (state: GameState) => getBulkUnitCost(state, unitId, state.ui.unitBuyModes[unitId]).quantity,
  bulkUnitTotalCost: (unitId: UnitId) => (state: GameState) => getBulkUnitCost(state, unitId, state.ui.unitBuyModes[unitId]).totalCost,
  bulkPowerInfrastructureQuantity: (infrastructureId: PowerInfrastructureId) => (state: GameState) => getBulkPowerInfrastructureCost(state, infrastructureId, state.ui.powerBuyModes[infrastructureId]).quantity,
  bulkPowerInfrastructureTotalCost: (infrastructureId: PowerInfrastructureId) => (state: GameState) => getBulkPowerInfrastructureCost(state, infrastructureId, state.ui.powerBuyModes[infrastructureId]).totalCost,
  canAffordUnitInCurrentMode: (unitId: UnitId) => (state: GameState) => {
    const result = getBulkUnitCost(state, unitId, state.ui.unitBuyModes[unitId])

    return result.quantity > 0 && state.cash >= result.totalCost
  },
  canAffordPowerInfrastructureInCurrentMode: (infrastructureId: PowerInfrastructureId) => (state: GameState) => {
    const result = getBulkPowerInfrastructureCost(state, infrastructureId, state.ui.powerBuyModes[infrastructureId])

    return result.quantity > 0 && state.cash >= result.totalCost
  },
  powerInfrastructureCount: (infrastructureId: PowerInfrastructureId) => (state: GameState) => {
    if (infrastructureId === 'serverRack') {
      return state.serverRackCount
    }

    if (infrastructureId === 'serverRoom') {
      return state.serverRoomCount
    }

    if (infrastructureId === 'dataCenter') {
      return state.dataCenterCount
    }

    return state.cloudComputeCount
  },
  algorithmicUnlocked: (state: GameState) => isAutomationUnlocked(state),
  automationUnitOwnedCount: (unitId: AutomationUnitId) => (state: GameState) => getAutomationOwnedCount(state, unitId),
  automationUnitLabel: (unitId: AutomationUnitId) => (_state: GameState) => getAutomationUnitLabel(unitId),
  automationUnitUnlocked: (unitId: AutomationUnitId) => (state: GameState) => isAutomationUnitUnlocked(state, unitId),
  automationStrategyUnlocked: (strategyId: AutomationStrategyId) => (state: GameState) => isAutomationStrategyUnlocked(state, strategyId),
  automationUnlockedStrategies: (state: GameState) => getUnlockedAutomationStrategies(state),
  automationStrategyLabel: (strategyId: AutomationStrategyId) => (_state: GameState) => getAutomationStrategyLabel(strategyId),
  automationConfig: (unitId: AutomationUnitId) => (state: GameState) => state.automationConfig[unitId],
  automationCycleRuntime: (unitId: AutomationUnitId) => (state: GameState) => state.automationCycleState[unitId],
  automationProgressPercent: (unitId: AutomationUnitId) => (state: GameState) => getAutomationProgressPercent(state, unitId),
  automationAdjustedPayout: (unitId: AutomationUnitId) => (state: GameState) => getAutomationAdjustedPayout(state, unitId),
  automationAverageIncomePerSecond: (unitId: AutomationUnitId) => (state: GameState) => getAutomationAverageIncomePerSecond(state, unitId),
  automationTimeRemaining: (unitId: AutomationUnitId) => (state: GameState) => getAutomationTimeRemaining(state, unitId),
  automationDisplayedCycleDuration: (unitId: AutomationUnitId) => (state: GameState) => getAutomationDisplayedCycleDuration(state, unitId),
  automationPowerUse: (unitId: AutomationUnitId) => (state: GameState) => getAutomationPowerUse(state, unitId),
  automationBuyMode: (unitId: AutomationUnitId) => (state: GameState) => state.ui.unitBuyModes[unitId],
  automationBulkCost: (unitId: AutomationUnitId) => (state: GameState) => getAutomationBulkCost(state, unitId, state.ui.unitBuyModes[unitId]),
  automationBulkQuantity: (unitId: AutomationUnitId) => (state: GameState) => getAutomationBulkCost(state, unitId, state.ui.unitBuyModes[unitId]).quantity,
  automationBulkTotalCost: (unitId: AutomationUnitId) => (state: GameState) => getAutomationBulkCost(state, unitId, state.ui.unitBuyModes[unitId]).totalCost,
  automationNextCost: (unitId: AutomationUnitId) => (state: GameState) => getAutomationNextCost(state, unitId),
  lobbyingUnlocked: (state: GameState) => isLobbyingUnlocked(state),
  purchasedPolicyCount: (state: GameState) => Object.values(state.purchasedPolicies).filter(Boolean).length,
  isPolicyPurchased: (policyId: LobbyingPolicyId) => (state: GameState) => state.purchasedPolicies[policyId] === true,
  canAffordPolicy: (policyId: LobbyingPolicyId) => (state: GameState) => {
    const policy = getLobbyingPolicyDefinition(policyId)

    if (!policy || state.purchasedPolicies[policyId] || !isLobbyingUnlocked(state)) {
      return false
    }

    return state.influence >= policy.influenceCost
  },
  policyInfluenceShortfall: (policyId: LobbyingPolicyId) => (state: GameState) => {
    const policy = getLobbyingPolicyDefinition(policyId)

    if (!policy || state.purchasedPolicies[policyId]) {
      return 0
    }

    return Math.max(0, policy.influenceCost - state.influence)
  },
  prestigeUpgradeRank: (upgradeId: PrestigeUpgradeId) => (state: GameState) => state.purchasedPrestigeUpgrades[upgradeId] ?? 0,
  canAffordPrestigeUpgrade: (upgradeId: PrestigeUpgradeId) => (state: GameState) => {
    const upgrade = getPrestigeUpgradeDefinition(upgradeId)
    const currentRank = state.purchasedPrestigeUpgrades[upgradeId] ?? 0

    if (!upgrade || currentRank >= upgrade.maxRank) {
      return false
    }

    return state.reputation >= getPrestigeGoalNextRankCost(upgradeId, currentRank)
  },
  plannedPrestigeRank: (upgradeId: PrestigeUpgradeId) => (state: GameState) => state.ui.prestigePurchasePlan[upgradeId] ?? 0,
  plannedPrestigeCost: (state: GameState) => Object.entries(state.ui.prestigePurchasePlan).reduce((total, [upgradeId, planned]) => {
    if (typeof planned !== 'number' || planned <= 0) {
      return total
    }

    const definition = getPrestigeUpgradeDefinition(upgradeId as PrestigeUpgradeId)
    const currentRank = state.purchasedPrestigeUpgrades[upgradeId as PrestigeUpgradeId] ?? 0

    if (!definition || currentRank >= definition.maxRank) {
      return total
    }

    const purchasableRanks = Math.min(planned, definition.maxRank - currentRank)
    let plannedCost = 0
    for (let i = 0; i < purchasableRanks; i += 1) {
      plannedCost += getPrestigeGoalNextRankCost(upgradeId as PrestigeUpgradeId, currentRank + i)
    }

    return total + plannedCost
  }, 0),
  plannedPrestigeAvailable: (state: GameState) => state.reputation + getReputationGainForNextPrestige(state),
  plannedPrestigeRemaining: (state: GameState) => selectors.plannedPrestigeAvailable(state) - selectors.plannedPrestigeCost(state),
  prestigeUpgradeNextCost: (upgradeId: PrestigeUpgradeId) => (state: GameState) => getPrestigeGoalNextRankCost(upgradeId, state.purchasedPrestigeUpgrades[upgradeId] ?? 0),
  canPlanPrestigeUpgrade: (upgradeId: PrestigeUpgradeId, delta: 1 | -1 = 1) => (state: GameState) => {
    const definition = getPrestigeUpgradeDefinition(upgradeId)
    const currentRank = state.purchasedPrestigeUpgrades[upgradeId] ?? 0
    const plannedRank = state.ui.prestigePurchasePlan[upgradeId] ?? 0

    if (!definition || currentRank >= definition.maxRank) {
      return false
    }

    if (delta < 0) {
      return plannedRank > 0
    }

    if (currentRank + plannedRank >= definition.maxRank) {
      return false
    }

    return selectors.plannedPrestigeRemaining(state) >= getPrestigeGoalNextRankCost(upgradeId, currentRank + plannedRank)
  },
}
