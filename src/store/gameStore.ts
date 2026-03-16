import { create } from 'zustand'
import type { AppInfo } from '../../shared/game'
import { canAffordCapacityPower, getBulkCapacityInfrastructureCost, getFloorExpansionCost, getOfficeCost, getOfficeExpansionCost } from '../utils/capacity'
import { CAPACITY_INFRASTRUCTURE } from '../data/capacity'
import { getLobbyingPolicyDefinition } from '../data/lobbyingPolicies'
import { getBulkRepeatableUpgradeCost, getMaxAffordableRepeatableUpgradeQuantity, getRepeatableUpgradeDefinition, getRepeatableUpgradeRank } from '../data/repeatableUpgrades'
import { getResearchTechDefinition } from '../data/researchTech'
import { DEFAULT_UNLOCKED_SECTORS } from '../data/sectors'
import { initialState } from '../data/initialState'
import { getPrestigeUpgradeDefinition } from '../data/prestigeUpgrades'
import { getUpgradeDefinition } from '../data/upgrades'
import { getAvailableAssignableUnitCount, getBulkPowerInfrastructureCost, getBulkUnitCost, getCashPerSecond, getInfluencePerSecond, getManualIncome, getResearchPointsPerSecond, isPowerInfrastructureUnlocked, isUnitUnlocked } from '../utils/economy'
import { getElapsedOfflineSeconds, getOfflineSecondsApplied } from '../utils/offlineProgress'
import { exportState, importState, loadStateFromStorage, SAVE_KEY, saveStateToStorage } from '../utils/persistence'
import { createPrestigeResetState } from '../utils/prestige'
import { areResearchTechPrerequisitesMet, isEnergySectorUnlocked, isLobbyingUnlocked, isResearchTechUnlocked } from '../utils/research'
import { getGenericTraderCount, getSpecializationResearchUnlockId, getTraderSpecialistTrainingCost } from '../utils/specialization'
import { getGenericInstitutionCount, getInstitutionMandateApplicationCost, getInstitutionMandateResearchUnlockId } from '../utils/mandates'
import type { BuyMode, DeskViewId, GameState, GameStore, GameTabId, GenericSectorAssignableUnitId, HumanAssignableUnitId, InstitutionalMandateId, InstitutionalMandateUnitId, LobbyingPolicyId, ModalId, OfflineSummary, PowerInfrastructureId, PrestigeUpgradeId, RepeatableUpgradeId, ResearchTechId, SectorId, UnitId } from '../types/game'

type StoreUiState = {
  appInfo: AppInfo | null
  activeTab: GameTabId
  activeModal: ModalId | null
  offlineSummary: OfflineSummary | null
  latestTradeFeedback: GameStore['latestTradeFeedback']
}

const initialUiState: StoreUiState = {
  appInfo: null,
  activeTab: 'upgrades',
  activeModal: null,
  offlineSummary: null,
  latestTradeFeedback: null,
}

function getSectorUnlocksAfterResearch(state: GameState, techId: ResearchTechId): Record<SectorId, boolean> {
  if (techId === 'technologyMarkets') {
    return {
      ...state.unlockedSectors,
      technology: true,
    }
  }

  if (techId === 'energyMarkets') {
    return {
      ...state.unlockedSectors,
      energy: true,
    }
  }

  return state.unlockedSectors
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
    discoveredLobbying: state.discoveredLobbying,
    lifetimeCashEarned: state.lifetimeCashEarned,
    reputation: state.reputation,
    reputationSpent: state.reputationSpent,
    prestigeCount: state.prestigeCount,
    internCount: state.internCount,
    juniorTraderCount: state.juniorTraderCount,
    seniorTraderCount: state.seniorTraderCount,
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
    unlockedSectors: state.unlockedSectors,
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

      return {
        cash: state.cash + gain,
        lifetimeCashEarned: state.lifetimeCashEarned + gain,
        latestTradeFeedback: {
          amount: gain,
          timestamp: Date.now(),
        },
      }
    })
  },
  tick: (deltaSeconds) => {
    if (deltaSeconds <= 0) {
      return
    }

    set((state) => {
      const gain = getCashPerSecond(state) * deltaSeconds
      const researchGain = getResearchPointsPerSecond(state) * deltaSeconds
      const influenceGain = getInfluencePerSecond(state) * deltaSeconds

      if (gain <= 0 && researchGain <= 0 && influenceGain <= 0) {
        return { lastSaveTimestamp: Date.now() }
      }

      return {
        cash: state.cash + gain,
        researchPoints: state.researchPoints + researchGain,
        influence: state.influence + influenceGain,
        lifetimeCashEarned: state.lifetimeCashEarned + gain,
        lastSaveTimestamp: Date.now(),
      }
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
        return {
          ...nextState,
          juniorTraderCount: state.juniorTraderCount + result.quantity,
        }
      }

      if (unitId === 'intern') {
        return {
          ...nextState,
          internCount: state.internCount + result.quantity,
        }
      }

      if (unitId === 'internResearchScientist') {
        return {
          ...nextState,
          internResearchScientistCount: state.internResearchScientistCount + result.quantity,
        }
      }

      if (unitId === 'seniorTrader') {
        return {
          ...nextState,
          seniorTraderCount: state.seniorTraderCount + result.quantity,
        }
      }

      if (unitId === 'propDesk') {
        return {
          ...nextState,
          propDeskCount: state.propDeskCount + result.quantity,
        }
      }

      if (unitId === 'institutionalDesk') {
        return {
          ...nextState,
          institutionalDeskCount: state.institutionalDeskCount + result.quantity,
        }
      }

      if (unitId === 'hedgeFund') {
        return {
          ...nextState,
          hedgeFundCount: state.hedgeFundCount + result.quantity,
        }
      }

      if (unitId === 'investmentFirm') {
        return {
          ...nextState,
          investmentFirmCount: state.investmentFirmCount + result.quantity,
        }
      }

      if (unitId === 'ruleBasedBot') {
        return {
          ...nextState,
          ruleBasedBotCount: state.ruleBasedBotCount + result.quantity,
        }
      }

      if (unitId === 'juniorResearchScientist') {
        return {
          ...nextState,
          juniorResearchScientistCount: state.juniorResearchScientistCount + result.quantity,
        }
      }

      if (unitId === 'seniorResearchScientist') {
        return {
          ...nextState,
          seniorResearchScientistCount: state.seniorResearchScientistCount + result.quantity,
        }
      }

      if (unitId === 'juniorPolitician') {
        return {
          ...nextState,
          juniorPoliticianCount: state.juniorPoliticianCount + result.quantity,
        }
      }

      if (unitId === 'mlTradingBot') {
        return {
          ...nextState,
          mlTradingBotCount: state.mlTradingBotCount + result.quantity,
        }
      }

      return {
        ...nextState,
        aiTradingBotCount: state.aiTradingBotCount + result.quantity,
      }
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
        return { ...nextState, serverRackCount: state.serverRackCount + result.quantity }
      }

      if (infrastructureId === 'serverRoom') {
        return { ...nextState, serverRoomCount: state.serverRoomCount + result.quantity }
      }

      if (infrastructureId === 'dataCenter') {
        return { ...nextState, dataCenterCount: state.dataCenterCount + result.quantity }
      }

      return { ...nextState, cloudComputeCount: state.cloudComputeCount + result.quantity }
    })
  },
  buyDeskSpace: (quantity = 1) => {
    set((state) => {
      const result = getBulkCapacityInfrastructureCost(state, 'deskSpace', quantity, CAPACITY_INFRASTRUCTURE.deskSpace.powerUsage)

      if (result.quantity <= 0 || state.cash < result.totalCost || !canAffordCapacityPower(state, CAPACITY_INFRASTRUCTURE.deskSpace.powerUsage * result.quantity)) {
        return state
      }

      return {
        cash: state.cash - result.totalCost,
        deskSpaceCount: state.deskSpaceCount + result.quantity,
      }
    })
  },
  buyFloorSpace: (quantity = 1) => {
    set((state) => {
      if (state.purchasedResearchTech.floorSpacePlanning !== true) {
        return state
      }

      const result = getBulkCapacityInfrastructureCost(state, 'floorSpace', quantity, CAPACITY_INFRASTRUCTURE.floorSpace.powerUsage)

      if (result.quantity <= 0 || state.cash < result.totalCost || !canAffordCapacityPower(state, CAPACITY_INFRASTRUCTURE.floorSpace.powerUsage * result.quantity)) {
        return state
      }

      return {
        cash: state.cash - result.totalCost,
        floorSpaceCount: state.floorSpaceCount + result.quantity,
      }
    })
  },
  buyOffice: (quantity = 1) => {
    set((state) => {
      if (state.purchasedResearchTech.officeExpansionPlanning !== true) {
        return state
      }

      const result = getBulkCapacityInfrastructureCost(state, 'office', quantity, CAPACITY_INFRASTRUCTURE.office.powerUsage)

      if (result.quantity <= 0 || state.cash < result.totalCost || !canAffordCapacityPower(state, CAPACITY_INFRASTRUCTURE.office.powerUsage * result.quantity)) {
        return state
      }

      return {
        cash: state.cash - result.totalCost,
        officeCount: state.officeCount + result.quantity,
      }
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

      return {
        cash: state.cash - upgrade.cost,
        purchasedUpgrades: {
          ...state.purchasedUpgrades,
          [upgradeId]: true,
        },
      }
    })
  },
  buyRepeatableUpgrade: (upgradeId: RepeatableUpgradeId) => {
    set((state) => {
      const upgrade = getRepeatableUpgradeDefinition(upgradeId)

      if (!upgrade) {
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
        return {
          cash: state.cash - purchase.totalCost,
          repeatableUpgradeRanks: {
            ...state.repeatableUpgradeRanks,
            [upgradeId]: currentRank + purchase.quantity,
          },
        }
      }

      if (upgrade.currency === 'researchPoints') {
        return {
          researchPoints: state.researchPoints - purchase.totalCost,
          repeatableUpgradeRanks: {
            ...state.repeatableUpgradeRanks,
            [upgradeId]: currentRank + purchase.quantity,
          },
        }
      }

      return {
        influence: state.influence - purchase.totalCost,
        repeatableUpgradeRanks: {
          ...state.repeatableUpgradeRanks,
          [upgradeId]: currentRank + purchase.quantity,
        },
      }
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

      return {
        [currencyKey]: state[currencyKey] - tech.researchCost,
        discoveredLobbying: state.discoveredLobbying || isLobbyingUnlocked({ ...state, purchasedResearchTech: { ...state.purchasedResearchTech, [techId]: true } }),
        unlockedSectors: getSectorUnlocksAfterResearch(state, techId),
        purchasedResearchTech: {
          ...state.purchasedResearchTech,
          [techId]: true,
        },
      }
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

      return {
        influence: state.influence - policy.influenceCost,
        purchasedPolicies: {
          ...state.purchasedPolicies,
          [policyId]: true,
        },
      }
    })
  },
  buyPrestigeUpgrade: (upgradeId) => {
    set((state) => {
      const upgrade = getPrestigeUpgradeDefinition(upgradeId)
      const currentRank = state.purchasedPrestigeUpgrades[upgradeId] ?? 0

      if (!upgrade || currentRank >= upgrade.maxRank || state.reputation < upgrade.baseCost) {
        return state
      }

      return {
        reputation: state.reputation - upgrade.baseCost,
        reputationSpent: state.reputationSpent + upgrade.baseCost,
        purchasedPrestigeUpgrades: {
          ...state.purchasedPrestigeUpgrades,
          [upgradeId]: currentRank + 1,
        },
      }
    })
  },
  prestigeReset: () => {
    set((state) => ({
      ...createPrestigeResetState(state, state.ui.prestigePurchasePlan),
      appInfo: state.appInfo,
      activeTab: 'prestige',
      activeModal: null,
      offlineSummary: null,
    }))
  },
  applyOfflineProgress: (secondsAway) => {
    set((state) => {
      const appliedSeconds = Math.min(secondsAway, getOfflineSecondsApplied(Date.now() - secondsAway * 1000, Date.now()))
      const cashEarned = getCashPerSecond(state) * appliedSeconds
      const researchEarned = getResearchPointsPerSecond(state) * appliedSeconds
      const influenceEarned = getInfluencePerSecond(state) * appliedSeconds

      if (appliedSeconds <= 0 || (cashEarned <= 0 && researchEarned <= 0 && influenceEarned <= 0)) {
        return {
          offlineSummary: null,
        }
      }

      return {
        cash: state.cash + cashEarned,
        researchPoints: state.researchPoints + researchEarned,
        influence: state.influence + influenceEarned,
        lifetimeCashEarned: state.lifetimeCashEarned + cashEarned,
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
      }
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
      const cashEarned = getCashPerSecond(savedState) * appliedSeconds
      const researchEarned = getResearchPointsPerSecond(savedState) * appliedSeconds
      const influenceEarned = getInfluencePerSecond(savedState) * appliedSeconds

      return {
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
        lifetimeCashEarned: savedState.lifetimeCashEarned + cashEarned,
        totalOfflineSecondsApplied: savedState.totalOfflineSecondsApplied + appliedSeconds,
        lastSaveTimestamp: now,
      }
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
    const cashEarned = getCashPerSecond(importedState) * appliedSeconds
    const researchEarned = getResearchPointsPerSecond(importedState) * appliedSeconds
    const influenceEarned = getInfluencePerSecond(importedState) * appliedSeconds
    const activeModal: ModalId | null = cashEarned > 0 || researchEarned > 0 || influenceEarned > 0 ? 'offlineEarnings' : null

    const hydratedState: Partial<GameStore> = {
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
      lifetimeCashEarned: importedState.lifetimeCashEarned + cashEarned,
      totalOfflineSecondsApplied: importedState.totalOfflineSecondsApplied + appliedSeconds,
      lastSaveTimestamp: now,
    }

    saveStateToStorage({
      ...importedState,
      cash: importedState.cash + cashEarned,
      researchPoints: importedState.researchPoints + researchEarned,
      influence: importedState.influence + influenceEarned,
      lifetimeCashEarned: importedState.lifetimeCashEarned + cashEarned,
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
    set({ activeTab: tab })
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
    set((state) => ({
      unlockedSectors: {
        ...state.unlockedSectors,
        [sectorId]: true,
      },
    }))
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

      return {
        sectorAssignments: updateSectorAssignment(state, unitId, sectorId, currentAssigned + quantity),
      }
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

      return {
        sectorAssignments: updateSectorAssignment(state, unitId, sectorId, currentAssigned - quantity),
      }
    })
  },
  clearSectorAssignments: (unitId, sectorId) => {
    set((state) => ({
      sectorAssignments: updateSectorAssignment(state, unitId, sectorId, 0),
    }))
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

      return {
        sectorAssignments: updateSectorAssignment(state, unitId, sectorId, currentAssigned + available),
      }
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

      return {
        cash: state.cash - affordableQuantity * trainingCost,
        traderSpecialists: {
          ...state.traderSpecialists,
          seniorTrader: {
            ...state.traderSpecialists.seniorTrader,
            [specializationId]: state.traderSpecialists.seniorTrader[specializationId] + affordableQuantity,
          },
        },
      }
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

      return {
        cash: state.cash - affordableQuantity * applicationCost,
        institutionMandates: {
          ...state.institutionMandates,
          [unitId]: {
            ...state.institutionMandates[unitId],
            [mandateId]: state.institutionMandates[unitId][mandateId] + affordableQuantity,
          },
        },
      }
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
  resetFoundation: () => {
    window.localStorage.removeItem(SAVE_KEY)
    set((state) => ({
      ...initialState,
      ...initialUiState,
      appInfo: state.appInfo,
      lastSaveTimestamp: Date.now(),
    }))
  },
}))
