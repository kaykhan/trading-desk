import { create } from 'zustand'
import type { AppInfo } from '../../shared/game'
import { getLobbyingPolicyDefinition } from '../data/lobbyingPolicies'
import { getResearchTechDefinition } from '../data/researchTech'
import { initialState } from '../data/initialState'
import { getPrestigeUpgradeDefinition } from '../data/prestigeUpgrades'
import { getUpgradeDefinition } from '../data/upgrades'
import { getBulkPowerInfrastructureCost, getBulkUnitCost, getCashPerSecond, getInfluencePerSecond, getManualIncome, getResearchPointsPerSecond, isPowerInfrastructureUnlocked, isUnitUnlocked } from '../utils/economy'
import { getElapsedOfflineSeconds, getOfflineSecondsApplied } from '../utils/offlineProgress'
import { exportState, importState, loadStateFromStorage, saveStateToStorage } from '../utils/persistence'
import { createPrestigeResetState } from '../utils/prestige'
import type { BuyMode, DeskViewId, GameState, GameStore, GameTabId, LobbyingPolicyId, ModalId, OfflineSummary, PowerInfrastructureId, ResearchTechId, UnitId } from '../types/game'

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

function getSnapshot(state: GameStore) {
  const snapshot: GameState = {
    cash: state.cash,
    researchPoints: state.researchPoints,
    influence: state.influence,
    lifetimeCashEarned: state.lifetimeCashEarned,
    reputation: state.reputation,
    reputationSpent: state.reputationSpent,
    prestigeCount: state.prestigeCount,
    juniorTraderCount: state.juniorTraderCount,
    seniorTraderCount: state.seniorTraderCount,
    tradingServerCount: state.tradingServerCount,
    tradingBotCount: state.tradingBotCount,
    juniorResearchScientistCount: state.juniorResearchScientistCount,
    seniorResearchScientistCount: state.seniorResearchScientistCount,
    serverRoomCount: state.serverRoomCount,
    dataCenterCount: state.dataCenterCount,
    purchasedUpgrades: state.purchasedUpgrades,
    purchasedResearchTech: state.purchasedResearchTech,
    purchasedPolicies: state.purchasedPolicies,
    purchasedPrestigeUpgrades: state.purchasedPrestigeUpgrades,
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

      if (unitId === 'seniorTrader') {
        return {
          ...nextState,
          seniorTraderCount: state.seniorTraderCount + result.quantity,
        }
      }

      if (unitId === 'tradingServer') {
        return {
          ...nextState,
          tradingServerCount: state.tradingServerCount + result.quantity,
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

      return {
        ...nextState,
        tradingBotCount: state.tradingBotCount + result.quantity,
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

      if (infrastructureId === 'serverRoom') {
        return { ...nextState, serverRoomCount: state.serverRoomCount + result.quantity }
      }

      return { ...nextState, dataCenterCount: state.dataCenterCount + result.quantity }
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
  buyResearchTech: (techId: ResearchTechId) => {
    set((state) => {
      const tech = getResearchTechDefinition(techId)

      if (!tech || state.purchasedResearchTech[techId]) {
        return state
      }

      if (tech.visibleWhen && !tech.visibleWhen(state)) {
        return state
      }

      if (state.researchPoints < tech.researchCost) {
        return state
      }

      return {
        researchPoints: state.researchPoints - tech.researchCost,
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

      if (state.purchasedResearchTech.regulatoryAffairs !== true) {
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
      ...createPrestigeResetState(state),
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
    set({
      ...initialState,
      ...initialUiState,
      lastSaveTimestamp: Date.now(),
    })
  },
}))
