import { create } from 'zustand'
import { DEFAULT_AUTOMATION_CONFIG, DEFAULT_AUTOMATION_CYCLE_STATE } from '../data/automation'
import type { AppInfo } from '../../shared/game'
import { canAffordCapacityPower, getBulkCapacityInfrastructureCost, getFloorExpansionCost, getOfficeCost, getOfficeExpansionCost, isCapacityInfrastructureVisible } from '../utils/capacity'
import { CAPACITY_INFRASTRUCTURE } from '../data/capacity'
import { getLobbyingPolicyDefinition } from '../data/lobbyingPolicies'
import { getBulkRepeatableUpgradeCost, getMaxAffordableRepeatableUpgradeQuantity, getRepeatableUpgradeDefinition, getRepeatableUpgradeRank, isRepeatableUpgradeGloballyUnlocked } from '../data/repeatableUpgrades'
import { getResearchTechDefinition } from '../data/researchTech'
import { DEFAULT_UNLOCKED_SECTORS } from '../data/sectors'
import { initialState } from '../data/initialState'
import { getPrestigeUpgradeDefinition } from '../data/prestigeUpgrades'
import { getUpgradeDefinition } from '../data/upgrades'
import { isSectorDefinitionUnlockedByResearch, mechanics } from '../lib/mechanics'
import { getAutomationBulkCost, isAutomationStrategyUnlocked, isAutomationUnitUnlocked, processAutomationCycles } from '../utils/automation'
import { activateTimedBoostRuntime, processTimedBoosts } from '../utils/boosts'
import { payComplianceCategoryNow, processComplianceTimer } from '../utils/compliance'
import { getAvailableAssignableUnitCount, getBulkPowerInfrastructureCost, getBulkUnitCost, getCashPerSecond, getInfluencePerSecond, getManualIncome, getResearchPointsPerSecond, isPowerInfrastructureUnlocked, isUnitUnlocked } from '../utils/economy'
import { processMarketEventTimer } from '../utils/marketEvents'
import { applyMilestoneRewards, evaluateMilestones } from '../utils/milestones'
import { getElapsedOfflineSeconds, getOfflineSecondsApplied } from '../utils/offlineProgress'
import { exportState, importState, loadStateFromStorage, SAVE_KEY, saveStateToStorage } from '../utils/persistence'
import { createPrestigeResetState, getPrestigeGoalNextRankCost } from '../utils/prestige'
import { areResearchTechPrerequisitesMet, isEnergySectorUnlocked, isLobbyingUnlocked, isResearchTechUnlocked } from '../utils/research'
import { getGenericTraderCount, getSpecializationResearchUnlockId, getTraderSpecialistTrainingCost } from '../utils/specialization'
import { getGenericInstitutionCount, getInstitutionMandateApplicationCost, getInstitutionMandateResearchUnlockId } from '../utils/mandates'
import type { AutomationStrategyId, AutomationUnitId, BuyMode, CompliancePaymentCategoryId, DeskViewId, GameState, GameStore, GameTabId, GenericSectorAssignableUnitId, GlobalBoostId, HumanAssignableUnitId, InstitutionalMandateId, InstitutionalMandateUnitId, LobbyingPolicyId, ModalId, OfflineSummary, PowerInfrastructureId, PrestigeUpgradeId, RepeatableUpgradeId, ResearchTechId, SectorId, TimedBoostId, UnitId } from '../types/game'

type StoreUiState = {
  appInfo: AppInfo | null
  activeTab: GameTabId
  activeModal: ModalId | null
  offlineSummary: OfflineSummary | null
  latestTradeFeedback: GameStore['latestTradeFeedback']
  milestoneUnlockQueue: GameStore['milestoneUnlockQueue']
}

const initialUiState: StoreUiState = {
  appInfo: null,
  activeTab: 'upgrades',
  activeModal: null,
  offlineSummary: null,
  latestTradeFeedback: null,
  milestoneUnlockQueue: [],
}

function withMilestones(nextState: Partial<GameStore>, baseState: GameStore): Partial<GameStore> {
  const stateForEvaluation = {
    ...baseState,
    ...nextState,
  } as GameStore
  const baseDeskSlotsBeforeRewards = stateForEvaluation.baseDeskSlots
  const evaluation = evaluateMilestones(stateForEvaluation)

  if (evaluation.newlyUnlockedIds.length <= 0) {
    return nextState
  }

  const rewardState = applyMilestoneRewards(stateForEvaluation, evaluation.rewards)

  return {
    ...nextState,
    ...rewardState,
    ...(stateForEvaluation.baseDeskSlots !== baseDeskSlotsBeforeRewards ? { baseDeskSlots: stateForEvaluation.baseDeskSlots } : {}),
    unlockedMilestones: evaluation.unlockedMilestones,
    unlockedMetaMilestones: evaluation.unlockedMetaMilestones,
    milestoneUnlockQueue: [...baseState.milestoneUnlockQueue, ...evaluation.newlyUnlockedIds],
  }
}

function getSectorUnlocksAfterResearch(state: GameState, techId: ResearchTechId): Record<SectorId, boolean> {
  const nextState = {
    ...state,
    purchasedResearchTech: {
      ...state.purchasedResearchTech,
      [techId]: true,
    },
  }

  return (Object.keys(mechanics.sectors) as SectorId[]).reduce<Record<SectorId, boolean>>((acc, sectorId) => {
    acc[sectorId] = state.unlockedSectors[sectorId] || isSectorDefinitionUnlockedByResearch(nextState, sectorId)
    return acc
  }, { ...state.unlockedSectors })
}

function updateSectorAssignment(
  state: GameState,
  unitId: GenericSectorAssignableUnitId,
  sectorId: SectorId,
  nextValue: number,
): GameState['sectorAssignments'] {
  return {
    ...state.sectorAssignments,
    [unitId]: {
      ...state.sectorAssignments[unitId],
      [sectorId]: Math.max(0, Math.floor(nextValue)),
    },
  }
}

function getSnapshot(state: GameStore) {
  const snapshot: GameState = {
    cash: state.cash,
    researchPoints: state.researchPoints,
    influence: state.influence,
    unlockedMilestones: state.unlockedMilestones,
    unlockedMetaMilestones: state.unlockedMetaMilestones,
    lifetimeManualTrades: state.lifetimeManualTrades,
    lifetimeResearchPointsEarned: state.lifetimeResearchPointsEarned,
    totalComplianceReviewsTriggered: state.totalComplianceReviewsTriggered,
    totalCompliancePaymentsMade: state.totalCompliancePaymentsMade,
    complianceTabOpened: state.complianceTabOpened,
    totalTimedBoostActivations: state.totalTimedBoostActivations,
    discoveredLobbying: state.discoveredLobbying,
    complianceVisible: state.complianceVisible,
    complianceReviewRemainingSeconds: state.complianceReviewRemainingSeconds,
    compliancePayments: state.compliancePayments,
    lastCompliancePayment: state.lastCompliancePayment,
    timedBoosts: state.timedBoosts,
    globalBoostsOwned: state.globalBoostsOwned,
    lifetimeCashEarned: state.lifetimeCashEarned,
    reputation: state.reputation,
    reputationSpent: state.reputationSpent,
    prestigeCount: state.prestigeCount,
    internCount: state.internCount,
    juniorTraderCount: state.juniorTraderCount,
    seniorTraderCount: state.seniorTraderCount,
    quantTraderCount: state.quantTraderCount,
    baseDeskSlots: state.baseDeskSlots,
    deskSpaceCount: state.deskSpaceCount,
    floorSpaceCount: state.floorSpaceCount,
    officeCount: state.officeCount,
    propDeskCount: state.propDeskCount,
    institutionalDeskCount: state.institutionalDeskCount,
    hedgeFundCount: state.hedgeFundCount,
    investmentFirmCount: state.investmentFirmCount,
    ruleBasedBotCount: state.ruleBasedBotCount,
    mlTradingBotCount: state.mlTradingBotCount,
    aiTradingBotCount: state.aiTradingBotCount,
    internResearchScientistCount: state.internResearchScientistCount,
    juniorResearchScientistCount: state.juniorResearchScientistCount,
    seniorResearchScientistCount: state.seniorResearchScientistCount,
    juniorPoliticianCount: state.juniorPoliticianCount,
    serverRackCount: state.serverRackCount,
    serverRoomCount: state.serverRoomCount,
    dataCenterCount: state.dataCenterCount,
    cloudComputeCount: state.cloudComputeCount,
    activeMarketEvent: state.activeMarketEvent,
    activeMarketEventRemainingSeconds: state.activeMarketEventRemainingSeconds,
    nextMarketEventCooldownSeconds: state.nextMarketEventCooldownSeconds,
    marketEventHistory: state.marketEventHistory,
    unlockedSectors: state.unlockedSectors,
    automationConfig: state.automationConfig,
    automationCycleState: state.automationCycleState,
    sectorAssignments: state.sectorAssignments,
    traderSpecialists: state.traderSpecialists,
    institutionMandates: state.institutionMandates,
    purchasedUpgrades: state.purchasedUpgrades,
    purchasedResearchTech: state.purchasedResearchTech,
    purchasedPolicies: state.purchasedPolicies,
    purchasedPrestigeUpgrades: state.purchasedPrestigeUpgrades,
    repeatableUpgradeRanks: state.repeatableUpgradeRanks,
    lastSaveTimestamp: state.lastSaveTimestamp,
    totalOfflineSecondsApplied: state.totalOfflineSecondsApplied,
    settings: state.settings,
    ui: state.ui,
  }

  return snapshot
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  ...initialUiState,
  makeTrade: () => {
    set((state) => {
      const gain = getManualIncome(state)

      return withMilestones({
          cash: state.cash + gain,
          lifetimeCashEarned: state.lifetimeCashEarned + gain,
          lifetimeManualTrades: state.lifetimeManualTrades + 1,
          latestTradeFeedback: {
            amount: gain,
            timestamp: Date.now(),
          },
        }, state)
      })
  },
  tick: (deltaSeconds) => {
    if (deltaSeconds <= 0) {
      return
    }

      set((state) => {
        const eventResult = processMarketEventTimer(state, deltaSeconds, Date.now())
      const stateWithEvents = {
        ...state,
        ...eventResult,
      }
      const complianceResult = processComplianceTimer(stateWithEvents, deltaSeconds)
      const stateWithCompliance = {
        ...stateWithEvents,
        ...complianceResult,
      }
      const timedBoosts = processTimedBoosts(stateWithCompliance, deltaSeconds)
      const stateWithBoosts = {
        ...stateWithCompliance,
        timedBoosts,
      }
      const gain = getCashPerSecond(stateWithBoosts) * deltaSeconds
      const researchGain = getResearchPointsPerSecond(stateWithBoosts) * deltaSeconds
      const influenceGain = getInfluencePerSecond(stateWithBoosts) * deltaSeconds
      const automationResult = processAutomationCycles(stateWithBoosts, deltaSeconds, Date.now())

      const automationCashGain = automationResult.cash - stateWithBoosts.cash

        if (gain <= 0 && researchGain <= 0 && influenceGain <= 0 && automationCashGain <= 0) {
          return withMilestones({
            complianceVisible: complianceResult.complianceVisible,
            complianceReviewRemainingSeconds: complianceResult.complianceReviewRemainingSeconds,
            compliancePayments: complianceResult.compliancePayments,
            lastCompliancePayment: complianceResult.lastCompliancePayment,
            totalComplianceReviewsTriggered: state.totalComplianceReviewsTriggered + (complianceResult.complianceReviewRemainingSeconds > state.complianceReviewRemainingSeconds ? 1 : 0),
            timedBoosts,
            lastSaveTimestamp: Date.now(),
          }, state)
        }

        return withMilestones({
          cash: automationResult.cash + gain,
          researchPoints: state.researchPoints + researchGain,
          influence: state.influence + influenceGain,
          lifetimeResearchPointsEarned: state.lifetimeResearchPointsEarned + researchGain,
          lifetimeCashEarned: automationResult.lifetimeCashEarned + gain,
          automationCycleState: automationResult.automationCycleState,
          complianceVisible: complianceResult.complianceVisible,
          complianceReviewRemainingSeconds: complianceResult.complianceReviewRemainingSeconds,
          compliancePayments: complianceResult.compliancePayments,
          lastCompliancePayment: complianceResult.lastCompliancePayment,
          totalComplianceReviewsTriggered: state.totalComplianceReviewsTriggered + (complianceResult.complianceReviewRemainingSeconds > state.complianceReviewRemainingSeconds ? 1 : 0),
          timedBoosts,
          activeMarketEvent: eventResult.activeMarketEvent,
          activeMarketEventRemainingSeconds: eventResult.activeMarketEventRemainingSeconds,
          nextMarketEventCooldownSeconds: eventResult.nextMarketEventCooldownSeconds,
          marketEventHistory: eventResult.marketEventHistory,
          lastSaveTimestamp: Date.now(),
        }, state)
      })
    },
  buyUnit: (unitId: UnitId, quantity: BuyMode) => {
    set((state) => {
      if (!isUnitUnlocked(state, unitId)) {
        return state
      }

      const result = getBulkUnitCost(state, unitId, quantity)

      if (result.quantity <= 0 || state.cash < result.totalCost) {
        return state
      }

      const nextState = {
        cash: state.cash - result.totalCost,
      }

      if (unitId === 'juniorTrader') {
        return withMilestones({
          ...nextState,
          juniorTraderCount: state.juniorTraderCount + result.quantity,
        }, state)
      }

      if (unitId === 'intern') {
        return withMilestones({
          ...nextState,
          internCount: state.internCount + result.quantity,
        }, state)
      }

      if (unitId === 'internResearchScientist') {
        return withMilestones({
          ...nextState,
          internResearchScientistCount: state.internResearchScientistCount + result.quantity,
        }, state)
      }

      if (unitId === 'seniorTrader') {
        return withMilestones({
          ...nextState,
          seniorTraderCount: state.seniorTraderCount + result.quantity,
        }, state)
      }

      if (unitId === 'quantTrader') {
        const automationResult = getAutomationBulkCost(state, 'quantTrader', quantity)

        if (automationResult.quantity <= 0 || state.cash < automationResult.totalCost) {
          return state
        }

        return withMilestones({
          cash: state.cash - automationResult.totalCost,
          quantTraderCount: state.quantTraderCount + automationResult.quantity,
        }, state)
      }

      if (unitId === 'propDesk') {
        return withMilestones({
          ...nextState,
          propDeskCount: state.propDeskCount + result.quantity,
        }, state)
      }

      if (unitId === 'institutionalDesk') {
        return withMilestones({
          ...nextState,
          institutionalDeskCount: state.institutionalDeskCount + result.quantity,
        }, state)
      }

      if (unitId === 'hedgeFund') {
        return withMilestones({
          ...nextState,
          hedgeFundCount: state.hedgeFundCount + result.quantity,
        }, state)
      }

      if (unitId === 'investmentFirm') {
        return withMilestones({
          ...nextState,
          investmentFirmCount: state.investmentFirmCount + result.quantity,
        }, state)
      }

      if (unitId === 'ruleBasedBot') {
        const automationResult = getAutomationBulkCost(state, 'ruleBasedBot', quantity)

        if (automationResult.quantity <= 0 || state.cash < automationResult.totalCost) {
          return state
        }

        return withMilestones({
          cash: state.cash - automationResult.totalCost,
          ruleBasedBotCount: state.ruleBasedBotCount + automationResult.quantity,
        }, state)
      }

      if (unitId === 'juniorResearchScientist') {
        return withMilestones({
          ...nextState,
          juniorResearchScientistCount: state.juniorResearchScientistCount + result.quantity,
        }, state)
      }

      if (unitId === 'seniorResearchScientist') {
        return withMilestones({
          ...nextState,
          seniorResearchScientistCount: state.seniorResearchScientistCount + result.quantity,
        }, state)
      }

      if (unitId === 'juniorPolitician') {
        return withMilestones({
          ...nextState,
          juniorPoliticianCount: state.juniorPoliticianCount + result.quantity,
        }, state)
      }

      if (unitId === 'mlTradingBot') {
        const automationResult = getAutomationBulkCost(state, 'mlTradingBot', quantity)

        if (automationResult.quantity <= 0 || state.cash < automationResult.totalCost) {
          return state
        }

        return withMilestones({
          cash: state.cash - automationResult.totalCost,
          mlTradingBotCount: state.mlTradingBotCount + automationResult.quantity,
        }, state)
      }

      if (unitId === 'aiTradingBot') {
        const automationResult = getAutomationBulkCost(state, 'aiTradingBot', quantity)

        if (automationResult.quantity <= 0 || state.cash < automationResult.totalCost) {
          return state
        }

        return withMilestones({
          cash: state.cash - automationResult.totalCost,
          aiTradingBotCount: state.aiTradingBotCount + automationResult.quantity,
        }, state)
      }

      return state
    })
  },
  buyPowerInfrastructure: (infrastructureId: PowerInfrastructureId, quantity: BuyMode) => {
    set((state) => {
      if (!isPowerInfrastructureUnlocked(state)) {
        return state
      }

      const result = getBulkPowerInfrastructureCost(state, infrastructureId, quantity)

      if (result.quantity <= 0 || state.cash < result.totalCost) {
        return state
      }

      const nextState = {
        cash: state.cash - result.totalCost,
      }

      if (infrastructureId === 'serverRack') {
        return withMilestones({ ...nextState, serverRackCount: state.serverRackCount + result.quantity }, state)
      }

      if (infrastructureId === 'serverRoom') {
        return withMilestones({ ...nextState, serverRoomCount: state.serverRoomCount + result.quantity }, state)
      }

      if (infrastructureId === 'dataCenter') {
        return withMilestones({ ...nextState, dataCenterCount: state.dataCenterCount + result.quantity }, state)
      }

      return withMilestones({ ...nextState, cloudComputeCount: state.cloudComputeCount + result.quantity }, state)
    })
  },
  buyDeskSpace: (quantity = 1) => {
    set((state) => {
      const result = getBulkCapacityInfrastructureCost(state, 'deskSpace', quantity, CAPACITY_INFRASTRUCTURE.deskSpace.powerUsage)

      if (result.quantity <= 0 || state.cash < result.totalCost || !canAffordCapacityPower(state, CAPACITY_INFRASTRUCTURE.deskSpace.powerUsage * result.quantity)) {
        return state
      }

      return withMilestones({
        cash: state.cash - result.totalCost,
        deskSpaceCount: state.deskSpaceCount + result.quantity,
      }, state)
    })
  },
  buyFloorSpace: (quantity = 1) => {
    set((state) => {
      if (!isCapacityInfrastructureVisible(state, 'floorSpace')) {
        return state
      }

      const result = getBulkCapacityInfrastructureCost(state, 'floorSpace', quantity, CAPACITY_INFRASTRUCTURE.floorSpace.powerUsage)

      if (result.quantity <= 0 || state.cash < result.totalCost || !canAffordCapacityPower(state, CAPACITY_INFRASTRUCTURE.floorSpace.powerUsage * result.quantity)) {
        return state
      }

      return withMilestones({
        cash: state.cash - result.totalCost,
        floorSpaceCount: state.floorSpaceCount + result.quantity,
      }, state)
    })
  },
  buyOffice: (quantity = 1) => {
    set((state) => {
      if (!isCapacityInfrastructureVisible(state, 'office')) {
        return state
      }

      const result = getBulkCapacityInfrastructureCost(state, 'office', quantity, CAPACITY_INFRASTRUCTURE.office.powerUsage)

      if (result.quantity <= 0 || state.cash < result.totalCost || !canAffordCapacityPower(state, CAPACITY_INFRASTRUCTURE.office.powerUsage * result.quantity)) {
        return state
      }

      return withMilestones({
        cash: state.cash - result.totalCost,
        officeCount: state.officeCount + result.quantity,
      }, state)
    })
  },
  buyUpgrade: (upgradeId) => {
    set((state) => {
      const upgrade = getUpgradeDefinition(upgradeId)

      if (!upgrade || state.purchasedUpgrades[upgradeId]) {
        return state
      }

      if (upgrade.visibleWhen && !upgrade.visibleWhen(state)) {
        return state
      }

      if (state.cash < upgrade.cost) {
        return state
      }

      return withMilestones({
        cash: state.cash - upgrade.cost,
        purchasedUpgrades: {
          ...state.purchasedUpgrades,
          [upgradeId]: true,
        },
      }, state)
    })
  },
  buyRepeatableUpgrade: (upgradeId: RepeatableUpgradeId) => {
    set((state) => {
      const upgrade = getRepeatableUpgradeDefinition(upgradeId)

      if (!upgrade) {
        return state
      }

       if (!isRepeatableUpgradeGloballyUnlocked(state)) {
        return state
      }

      if (upgrade.visibleWhen && !upgrade.visibleWhen(state)) {
        return state
      }

      if (upgrade.unlockWhen && !upgrade.unlockWhen(state)) {
        return state
      }

      const currentRank = getRepeatableUpgradeRank(state, upgradeId)
      const buyMode = state.ui.repeatableUpgradeBuyModes[upgradeId]
      const availableCurrency = upgrade.currency === 'cash' ? state.cash : upgrade.currency === 'researchPoints' ? state.researchPoints : state.influence
      const purchase = buyMode === 'max'
        ? getMaxAffordableRepeatableUpgradeQuantity(upgrade.baseCost, upgrade.costScaling, currentRank, availableCurrency)
        : getBulkRepeatableUpgradeCost(upgrade.baseCost, upgrade.costScaling, currentRank, buyMode)

      if (purchase.quantity <= 0 || availableCurrency < purchase.totalCost) {
        return state
      }

      if (upgrade.currency === 'cash') {
        return withMilestones({
          cash: state.cash - purchase.totalCost,
          repeatableUpgradeRanks: {
            ...state.repeatableUpgradeRanks,
            [upgradeId]: currentRank + purchase.quantity,
          },
        }, state)
      }

      if (upgrade.currency === 'researchPoints') {
        return withMilestones({
          researchPoints: state.researchPoints - purchase.totalCost,
          repeatableUpgradeRanks: {
            ...state.repeatableUpgradeRanks,
            [upgradeId]: currentRank + purchase.quantity,
          },
        }, state)
      }

      return withMilestones({
        influence: state.influence - purchase.totalCost,
        repeatableUpgradeRanks: {
          ...state.repeatableUpgradeRanks,
          [upgradeId]: currentRank + purchase.quantity,
        },
      }, state)
    })
  },
  buyResearchTech: (techId: ResearchTechId) => {
    set((state) => {
      const tech = getResearchTechDefinition(techId)

      if (!tech || state.purchasedResearchTech[techId]) {
        return state
      }

      if (!isResearchTechUnlocked(state, techId)) {
        return state
      }

      if (!areResearchTechPrerequisitesMet(state, techId)) {
        return state
      }

      const currencyKey = tech.currency === 'cash' ? 'cash' : 'researchPoints'

      if (state[currencyKey] < tech.researchCost) {
        return state
      }

      return withMilestones({
        [currencyKey]: state[currencyKey] - tech.researchCost,
        discoveredLobbying: state.discoveredLobbying || isLobbyingUnlocked({ ...state, purchasedResearchTech: { ...state.purchasedResearchTech, [techId]: true } }),
        unlockedSectors: getSectorUnlocksAfterResearch(state, techId),
        purchasedResearchTech: {
          ...state.purchasedResearchTech,
          [techId]: true,
        },
      }, state)
    })
  },
  buyLobbyingPolicy: (policyId: LobbyingPolicyId) => {
    set((state) => {
      const policy = getLobbyingPolicyDefinition(policyId)

      if (!policy || state.purchasedPolicies[policyId]) {
        return state
      }

      if (!isLobbyingUnlocked(state)) {
        return state
      }

      if (state.influence < policy.influenceCost) {
        return state
      }

      return withMilestones({
        influence: state.influence - policy.influenceCost,
        purchasedPolicies: {
          ...state.purchasedPolicies,
          [policyId]: true,
        },
      }, state)
    })
  },
  buyPrestigeUpgrade: (upgradeId) => {
    set((state) => {
      const upgrade = getPrestigeUpgradeDefinition(upgradeId)
      const currentRank = state.purchasedPrestigeUpgrades[upgradeId] ?? 0
      const nextCost = getPrestigeGoalNextRankCost(upgradeId, currentRank)

      if (!upgrade || currentRank >= upgrade.maxRank || state.reputation < nextCost) {
        return state
      }

      return withMilestones({
        reputation: state.reputation - nextCost,
        reputationSpent: state.reputationSpent + nextCost,
        purchasedPrestigeUpgrades: {
          ...state.purchasedPrestigeUpgrades,
          [upgradeId]: currentRank + 1,
        },
      }, state)
    })
  },
  prestigeReset: () => {
    set((state) => withMilestones({
      ...createPrestigeResetState(state, state.ui.prestigePurchasePlan),
      appInfo: state.appInfo,
      activeTab: 'prestige',
      activeModal: null,
      offlineSummary: null,
      milestoneUnlockQueue: state.milestoneUnlockQueue,
    }, state))
  },
  applyOfflineProgress: (secondsAway) => {
    set((state) => {
      const appliedSeconds = Math.min(secondsAway, getOfflineSecondsApplied(Date.now() - secondsAway * 1000, Date.now()))
      const eventResult = processMarketEventTimer(state, appliedSeconds, Date.now())
      const stateWithEvents = {
        ...state,
        ...eventResult,
      }
      const complianceResult = processComplianceTimer(stateWithEvents, appliedSeconds)
      const stateWithCompliance = {
        ...stateWithEvents,
        ...complianceResult,
      }
      const timedBoosts = processTimedBoosts(stateWithCompliance, appliedSeconds)
      const stateWithBoosts = {
        ...stateWithCompliance,
        timedBoosts,
      }
      const passiveCashEarned = getCashPerSecond(stateWithBoosts) * appliedSeconds
      const researchEarned = getResearchPointsPerSecond(stateWithBoosts) * appliedSeconds
      const influenceEarned = getInfluencePerSecond(stateWithBoosts) * appliedSeconds
      const automationResult = processAutomationCycles(stateWithBoosts, appliedSeconds, Date.now())
      const cashEarned = passiveCashEarned + (automationResult.cash - stateWithBoosts.cash)

      if (appliedSeconds <= 0 || (cashEarned <= 0 && researchEarned <= 0 && influenceEarned <= 0)) {
        return {
          offlineSummary: null,
        }
      }

        return withMilestones({
          cash: state.cash + cashEarned,
          researchPoints: state.researchPoints + researchEarned,
          influence: state.influence + influenceEarned,
          lifetimeResearchPointsEarned: state.lifetimeResearchPointsEarned + researchEarned,
          lifetimeCashEarned: state.lifetimeCashEarned + cashEarned,
          automationCycleState: automationResult.automationCycleState,
          complianceVisible: complianceResult.complianceVisible,
          complianceReviewRemainingSeconds: complianceResult.complianceReviewRemainingSeconds,
          compliancePayments: complianceResult.compliancePayments,
          lastCompliancePayment: complianceResult.lastCompliancePayment,
          totalComplianceReviewsTriggered: state.totalComplianceReviewsTriggered + (complianceResult.complianceReviewRemainingSeconds > state.complianceReviewRemainingSeconds ? 1 : 0),
          timedBoosts,
          activeMarketEvent: eventResult.activeMarketEvent,
          activeMarketEventRemainingSeconds: eventResult.activeMarketEventRemainingSeconds,
          nextMarketEventCooldownSeconds: eventResult.nextMarketEventCooldownSeconds,
          marketEventHistory: eventResult.marketEventHistory,
          totalOfflineSecondsApplied: state.totalOfflineSecondsApplied + appliedSeconds,
          lastSaveTimestamp: Date.now(),
          offlineSummary: {
            secondsAway,
            appliedSeconds,
            cashEarned,
            researchEarned,
            influenceEarned,
          },
          activeModal: 'offlineEarnings',
        }, state)
      })
    },
  saveGame: () => {
    set((state) => {
      const snapshot = {
        ...getSnapshot(state),
        lastSaveTimestamp: Date.now(),
      }

      saveStateToStorage(snapshot)

      return {
        lastSaveTimestamp: snapshot.lastSaveTimestamp,
      }
    })
  },
  loadGame: () => {
    set((state) => {
      const savedState = loadStateFromStorage()

      if (!savedState) {
        return state
      }

      const now = Date.now()
      const secondsAway = getElapsedOfflineSeconds(savedState.lastSaveTimestamp, now)
      const appliedSeconds = getOfflineSecondsApplied(savedState.lastSaveTimestamp, now)
      const eventResult = processMarketEventTimer(savedState, appliedSeconds, now)
      const savedStateWithEvents = {
        ...savedState,
        ...eventResult,
      }
      const complianceResult = processComplianceTimer(savedStateWithEvents, appliedSeconds)
      const savedStateWithCompliance = {
        ...savedStateWithEvents,
        ...complianceResult,
      }
      const timedBoosts = processTimedBoosts(savedStateWithCompliance, appliedSeconds)
      const savedStateWithBoosts = {
        ...savedStateWithCompliance,
        timedBoosts,
      }
      const passiveCashEarned = getCashPerSecond(savedStateWithBoosts) * appliedSeconds
      const researchEarned = getResearchPointsPerSecond(savedStateWithBoosts) * appliedSeconds
      const influenceEarned = getInfluencePerSecond(savedStateWithBoosts) * appliedSeconds
      const automationResult = processAutomationCycles(savedStateWithBoosts, appliedSeconds, now)
      const cashEarned = passiveCashEarned + (automationResult.cash - savedStateWithBoosts.cash)

      return withMilestones({
        ...savedState,
        appInfo: state.appInfo,
        activeTab: state.activeTab,
        activeModal: cashEarned > 0 || researchEarned > 0 || influenceEarned > 0 ? 'offlineEarnings' : null,
        offlineSummary:
          cashEarned > 0 || researchEarned > 0 || influenceEarned > 0
            ? {
                secondsAway,
                appliedSeconds,
                cashEarned,
                researchEarned,
                influenceEarned,
              }
            : null,
        cash: savedState.cash + cashEarned,
        researchPoints: savedState.researchPoints + researchEarned,
        influence: savedState.influence + influenceEarned,
        lifetimeResearchPointsEarned: savedState.lifetimeResearchPointsEarned + researchEarned,
        lifetimeCashEarned: savedState.lifetimeCashEarned + cashEarned,
        automationCycleState: automationResult.automationCycleState,
        complianceVisible: complianceResult.complianceVisible,
        complianceReviewRemainingSeconds: complianceResult.complianceReviewRemainingSeconds,
        compliancePayments: complianceResult.compliancePayments,
        lastCompliancePayment: complianceResult.lastCompliancePayment,
        totalComplianceReviewsTriggered: savedState.totalComplianceReviewsTriggered + (complianceResult.complianceReviewRemainingSeconds > savedState.complianceReviewRemainingSeconds ? 1 : 0),
        timedBoosts,
        activeMarketEvent: eventResult.activeMarketEvent,
        activeMarketEventRemainingSeconds: eventResult.activeMarketEventRemainingSeconds,
        nextMarketEventCooldownSeconds: eventResult.nextMarketEventCooldownSeconds,
        marketEventHistory: eventResult.marketEventHistory,
        totalOfflineSecondsApplied: savedState.totalOfflineSecondsApplied + appliedSeconds,
        lastSaveTimestamp: now,
        milestoneUnlockQueue: state.milestoneUnlockQueue,
      }, state)
    })
  },
  exportSave: (): string => {
    const state = get()
    const snapshot = {
      ...getSnapshot(state),
      lastSaveTimestamp: Date.now(),
    }

    set({ lastSaveTimestamp: snapshot.lastSaveTimestamp })
    saveStateToStorage(snapshot)
    return exportState(snapshot)
  },
  importSave: (encodedSave) => {
    const importedState = importState(encodedSave)

    if (!importedState) {
      return false
    }

    const currentState = get()
    const now = Date.now()
    const secondsAway = getElapsedOfflineSeconds(importedState.lastSaveTimestamp, now)
    const appliedSeconds = getOfflineSecondsApplied(importedState.lastSaveTimestamp, now)
    const eventResult = processMarketEventTimer(importedState, appliedSeconds, now)
    const importedStateWithEvents = {
      ...importedState,
      ...eventResult,
    }
    const complianceResult = processComplianceTimer(importedStateWithEvents, appliedSeconds)
    const importedStateWithCompliance = {
      ...importedStateWithEvents,
      ...complianceResult,
    }
    const timedBoosts = processTimedBoosts(importedStateWithCompliance, appliedSeconds)
    const importedStateWithBoosts = {
      ...importedStateWithCompliance,
      timedBoosts,
    }
    const passiveCashEarned = getCashPerSecond(importedStateWithBoosts) * appliedSeconds
    const researchEarned = getResearchPointsPerSecond(importedStateWithBoosts) * appliedSeconds
    const influenceEarned = getInfluencePerSecond(importedStateWithBoosts) * appliedSeconds
    const automationResult = processAutomationCycles(importedStateWithBoosts, appliedSeconds, now)
    const cashEarned = passiveCashEarned + (automationResult.cash - importedStateWithBoosts.cash)
    const activeModal: ModalId | null = cashEarned > 0 || researchEarned > 0 || influenceEarned > 0 ? 'offlineEarnings' : null

    const hydratedState: Partial<GameStore> = withMilestones({
      ...importedState,
      appInfo: currentState.appInfo,
      activeTab: currentState.activeTab,
      activeModal,
      offlineSummary:
        cashEarned > 0 || researchEarned > 0 || influenceEarned > 0
          ? {
              secondsAway,
              appliedSeconds,
              cashEarned,
              researchEarned,
              influenceEarned,
            }
          : null,
      cash: importedState.cash + cashEarned,
      researchPoints: importedState.researchPoints + researchEarned,
      influence: importedState.influence + influenceEarned,
      lifetimeResearchPointsEarned: importedState.lifetimeResearchPointsEarned + researchEarned,
      lifetimeCashEarned: importedState.lifetimeCashEarned + cashEarned,
      automationCycleState: automationResult.automationCycleState,
      complianceVisible: complianceResult.complianceVisible,
      complianceReviewRemainingSeconds: complianceResult.complianceReviewRemainingSeconds,
      compliancePayments: complianceResult.compliancePayments,
      lastCompliancePayment: complianceResult.lastCompliancePayment,
      totalComplianceReviewsTriggered: importedState.totalComplianceReviewsTriggered + (complianceResult.complianceReviewRemainingSeconds > importedState.complianceReviewRemainingSeconds ? 1 : 0),
      timedBoosts,
      activeMarketEvent: eventResult.activeMarketEvent,
      activeMarketEventRemainingSeconds: eventResult.activeMarketEventRemainingSeconds,
      nextMarketEventCooldownSeconds: eventResult.nextMarketEventCooldownSeconds,
      marketEventHistory: eventResult.marketEventHistory,
      totalOfflineSecondsApplied: importedState.totalOfflineSecondsApplied + appliedSeconds,
      lastSaveTimestamp: now,
      milestoneUnlockQueue: currentState.milestoneUnlockQueue,
    }, currentState)

    saveStateToStorage({
      ...importedState,
      cash: importedState.cash + cashEarned,
      researchPoints: importedState.researchPoints + researchEarned,
       influence: importedState.influence + influenceEarned,
       lifetimeCashEarned: importedState.lifetimeCashEarned + cashEarned,
        automationCycleState: automationResult.automationCycleState,
        complianceVisible: complianceResult.complianceVisible,
        complianceReviewRemainingSeconds: complianceResult.complianceReviewRemainingSeconds,
        compliancePayments: complianceResult.compliancePayments,
        lastCompliancePayment: complianceResult.lastCompliancePayment,
        timedBoosts,
        activeMarketEvent: eventResult.activeMarketEvent,
       activeMarketEventRemainingSeconds: eventResult.activeMarketEventRemainingSeconds,
       nextMarketEventCooldownSeconds: eventResult.nextMarketEventCooldownSeconds,
      marketEventHistory: eventResult.marketEventHistory,
      totalOfflineSecondsApplied: importedState.totalOfflineSecondsApplied + appliedSeconds,
      lastSaveTimestamp: now,
    })
    set(hydratedState)
    return true
  },
  setAppInfo: (appInfo) => {
    set({ appInfo })
  },
  setActiveTab: (tab) => {
    set((state) => withMilestones({ activeTab: tab, complianceTabOpened: state.complianceTabOpened || tab === 'compliance' }, state))
  },
  activateTimedBoost: (boostId: TimedBoostId) => {
    set((state) => withMilestones({
      timedBoosts: activateTimedBoostRuntime(state, boostId),
      totalTimedBoostActivations: state.totalTimedBoostActivations + 1,
    }, state))
  },
  toggleTimedBoostAutoMode: (boostId: TimedBoostId, enabled) => {
    set((state) => ({
      timedBoosts: {
        ...state.timedBoosts,
        [boostId]: {
          ...state.timedBoosts[boostId],
          autoEnabled: enabled,
        },
      },
    }))
  },
  setGlobalBoostOwned: (boostId: GlobalBoostId, owned) => {
    set((state) => withMilestones({
      globalBoostsOwned: {
        ...state.globalBoostsOwned,
        [boostId]: owned,
      },
    }, state))
  },
  payComplianceCategory: (category: CompliancePaymentCategoryId) => {
    set((state) => {
      const paymentResult = payComplianceCategoryNow(state, category)
      const paymentMade = paymentResult.cash < state.cash

      return withMilestones({
        ...paymentResult,
        totalCompliancePaymentsMade: state.totalCompliancePaymentsMade + (paymentMade ? 1 : 0),
      }, state)
    })
  },
  setComplianceAutoPayEnabled: (category: CompliancePaymentCategoryId, enabled) => {
    set((state) => ({
      settings: {
        ...state.settings,
        complianceAutoPayEnabled: {
          ...state.settings.complianceAutoPayEnabled,
          [category]: enabled,
        },
      },
    }))
  },
  setActiveDeskView: (view: DeskViewId) => {
    set((state) => ({
      ui: {
        ...state.ui,
        activeDeskView: view,
      },
    }))
  },
  setUnitBuyMode: (unitId, mode) => {
    set((state) => ({
      ui: {
        ...state.ui,
        unitBuyModes: {
          ...state.ui.unitBuyModes,
          [unitId]: mode,
        },
      },
    }))
  },
  setPowerBuyMode: (infrastructureId, mode) => {
    set((state) => ({
      ui: {
        ...state.ui,
        powerBuyModes: {
          ...state.ui.powerBuyModes,
          [infrastructureId]: mode,
        },
      },
    }))
  },
  setCapacityBuyMode: (infrastructureId, mode) => {
    set((state) => ({
      ui: {
        ...state.ui,
        capacityBuyModes: {
          ...state.ui.capacityBuyModes,
          [infrastructureId]: mode,
        },
      },
    }))
  },
  setRepeatableUpgradeBuyMode: (upgradeId, mode) => {
    set((state) => ({
      ui: {
        ...state.ui,
        repeatableUpgradeBuyModes: {
          ...state.ui.repeatableUpgradeBuyModes,
          [upgradeId]: mode,
        },
      },
    }))
  },
  setResearchBranchExpanded: (branchId, expanded) => {
    set((state) => ({
      ui: {
        ...state.ui,
        researchBranchExpanded: {
          ...state.ui.researchBranchExpanded,
          [branchId]: expanded,
        },
      },
    }))
  },
  unlockSector: (sectorId) => {
    set((state) => withMilestones({
      unlockedSectors: {
        ...state.unlockedSectors,
        [sectorId]: true,
      },
    }, state))
  },
  assignUnitToSector: (unitId, sectorId, amount = 1) => {
    set((state) => {
      if (state.unlockedSectors[sectorId] !== true) {
        return state
      }

      const assignAmount = Math.max(0, Math.floor(amount))

      if (assignAmount <= 0) {
        return state
      }

      const available = getAvailableAssignableUnitCount(state, unitId)
      const quantity = Math.min(assignAmount, available)

      if (quantity <= 0) {
        return state
      }

      const currentAssigned = state.sectorAssignments[unitId][sectorId] ?? 0

      return withMilestones({
        sectorAssignments: updateSectorAssignment(state, unitId, sectorId, currentAssigned + quantity),
      }, state)
    })
  },
  unassignUnitFromSector: (unitId, sectorId, amount = 1) => {
    set((state) => {
      const unassignAmount = Math.max(0, Math.floor(amount))

      if (unassignAmount <= 0) {
        return state
      }

      const currentAssigned = state.sectorAssignments[unitId][sectorId] ?? 0
      const quantity = Math.min(unassignAmount, currentAssigned)

      if (quantity <= 0) {
        return state
      }

      return withMilestones({
        sectorAssignments: updateSectorAssignment(state, unitId, sectorId, currentAssigned - quantity),
      }, state)
    })
  },
  clearSectorAssignments: (unitId, sectorId) => {
    set((state) => withMilestones({
      sectorAssignments: updateSectorAssignment(state, unitId, sectorId, 0),
    }, state))
  },
  assignMaxToSector: (unitId, sectorId) => {
    set((state) => {
      if (state.unlockedSectors[sectorId] !== true) {
        return state
      }

      const available = getAvailableAssignableUnitCount(state, unitId)

      if (available <= 0) {
        return state
      }

      const currentAssigned = state.sectorAssignments[unitId][sectorId] ?? 0

      return withMilestones({
        sectorAssignments: updateSectorAssignment(state, unitId, sectorId, currentAssigned + available),
      }, state)
    })
  },
  setAutomationMarketTarget: (unitId: AutomationUnitId, sectorId: SectorId | null) => {
    set((state) => {
      if (!isAutomationUnitUnlocked(state, unitId)) {
        return state
      }

      if (sectorId !== null && state.unlockedSectors[sectorId] !== true) {
        return state
      }

      return withMilestones({
        automationConfig: {
          ...state.automationConfig,
          [unitId]: {
            ...state.automationConfig[unitId],
            marketTarget: sectorId,
          },
        },
      }, state)
    })
  },
  setAutomationStrategy: (unitId: AutomationUnitId, strategyId: AutomationStrategyId | null) => {
    set((state) => {
      if (!isAutomationUnitUnlocked(state, unitId)) {
        return state
      }

      if (strategyId !== null && !isAutomationStrategyUnlocked(state, strategyId)) {
        return state
      }

      return withMilestones({
        automationConfig: {
          ...state.automationConfig,
          [unitId]: {
            ...state.automationConfig[unitId],
            strategy: strategyId,
          },
        },
      }, state)
    })
  },
  trainTraderSpecialist: (unitId, specializationId, amount = 1) => {
    set((state) => {
      const quantity = Math.max(0, Math.floor(amount))

      if (quantity <= 0) {
        return state
      }

      const researchUnlockId = getSpecializationResearchUnlockId(specializationId)

      if (state.purchasedResearchTech[researchUnlockId] !== true) {
        return state
      }

      const availableGeneric = getGenericTraderCount(state, unitId)
      const trainingCost = getTraderSpecialistTrainingCost(unitId)
      const affordableQuantity = Math.min(quantity, availableGeneric, Math.floor(state.cash / trainingCost))

      if (affordableQuantity <= 0) {
        return state
      }

      return withMilestones({
        cash: state.cash - affordableQuantity * trainingCost,
        traderSpecialists: {
          ...state.traderSpecialists,
          seniorTrader: {
            ...state.traderSpecialists.seniorTrader,
            [specializationId]: state.traderSpecialists.seniorTrader[specializationId] + affordableQuantity,
          },
        },
      }, state)
    })
  },
  applyInstitutionMandate: (unitId, mandateId, amount = 1) => {
    set((state) => {
      const quantity = Math.max(0, Math.floor(amount))

      if (quantity <= 0) {
        return state
      }

      const researchUnlockId = getInstitutionMandateResearchUnlockId(mandateId)

      if (state.purchasedResearchTech[researchUnlockId] !== true) {
        return state
      }

      const availableGeneric = getGenericInstitutionCount(state, unitId)
      const applicationCost = getInstitutionMandateApplicationCost(unitId)
      const affordableQuantity = Math.min(quantity, availableGeneric, Math.floor(state.cash / applicationCost))

      if (affordableQuantity <= 0) {
        return state
      }

      return withMilestones({
        cash: state.cash - affordableQuantity * applicationCost,
        institutionMandates: {
          ...state.institutionMandates,
          [unitId]: {
            ...state.institutionMandates[unitId],
            [mandateId]: state.institutionMandates[unitId][mandateId] + affordableQuantity,
          },
        },
      }, state)
    })
  },
  acknowledgeSectorUnlock: (sectorId) => {
    set((state) => ({
      ui: {
        ...state.ui,
        dismissedSectorUnlocks: {
          ...state.ui.dismissedSectorUnlocks,
          [sectorId]: true,
        },
      },
    }))
  },
  acknowledgeCapacityFull: () => {
    set((state) => ({
      ui: {
        ...state.ui,
        dismissedCapacityFull: true,
      },
    }))
  },
  adjustPrestigePurchasePlan: (upgradeId: PrestigeUpgradeId, delta: 1 | -1) => {
    set((state) => ({
      ui: {
        ...state.ui,
        prestigePurchasePlan: {
          ...state.ui.prestigePurchasePlan,
          [upgradeId]: Math.max(0, (state.ui.prestigePurchasePlan[upgradeId] ?? 0) + delta),
        },
      },
    }))
  },
  clearPrestigePurchasePlan: () => {
    set((state) => ({
      ui: {
        ...state.ui,
        prestigePurchasePlan: { ...initialState.ui.prestigePurchasePlan },
      },
    }))
  },
  openModal: (modal) => {
    set({ activeModal: modal })
  },
  closeModal: () => {
    set({ activeModal: null })
  },
  setOfflineSummary: (summary) => {
    set({ offlineSummary: summary })
  },
  clearTradeFeedback: () => {
    set({ latestTradeFeedback: null })
  },
  dismissMilestoneNotification: () => {
    set((state) => ({
      milestoneUnlockQueue: state.milestoneUnlockQueue.slice(1),
    }))
  },
  resetFoundation: () => {
    window.localStorage.removeItem(SAVE_KEY)
    set((state) => ({
      ...initialState,
      automationConfig: { ...DEFAULT_AUTOMATION_CONFIG },
      automationCycleState: { ...DEFAULT_AUTOMATION_CYCLE_STATE },
      ...initialUiState,
      appInfo: state.appInfo,
      lastSaveTimestamp: Date.now(),
    }))
  },
}))
