import { create } from 'zustand'
import type { AppInfo } from '../../shared/game'
import { initialState } from '../data/initialState'
import { getPrestigeUpgradeDefinition } from '../data/prestigeUpgrades'
import { getUpgradeDefinition } from '../data/upgrades'
import { getBulkUnitCost, getCashPerSecond, getManualIncome, isUnitUnlocked } from '../utils/economy'
import { getElapsedOfflineSeconds, getOfflineSecondsApplied } from '../utils/offlineProgress'
import { exportState, importState, loadStateFromStorage, saveStateToStorage } from '../utils/persistence'
import { createPrestigeResetState } from '../utils/prestige'
import type { BuyMode, GameState, GameStore, GameTabId, ModalId, OfflineSummary, UnitId } from '../types/game'

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
    lifetimeCashEarned: state.lifetimeCashEarned,
    reputation: state.reputation,
    reputationSpent: state.reputationSpent,
    prestigeCount: state.prestigeCount,
    juniorTraderCount: state.juniorTraderCount,
    seniorTraderCount: state.seniorTraderCount,
    tradingBotCount: state.tradingBotCount,
    purchasedUpgrades: state.purchasedUpgrades,
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

      if (gain <= 0) {
        return { lastSaveTimestamp: Date.now() }
      }

      return {
        cash: state.cash + gain,
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

      return {
        ...nextState,
        tradingBotCount: state.tradingBotCount + result.quantity,
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

      if (appliedSeconds <= 0 || cashEarned <= 0) {
        return {
          offlineSummary: null,
        }
      }

      return {
        cash: state.cash + cashEarned,
        lifetimeCashEarned: state.lifetimeCashEarned + cashEarned,
        totalOfflineSecondsApplied: state.totalOfflineSecondsApplied + appliedSeconds,
        lastSaveTimestamp: Date.now(),
        offlineSummary: {
          secondsAway,
          appliedSeconds,
          cashEarned,
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

      return {
        ...savedState,
        appInfo: state.appInfo,
        activeTab: state.activeTab,
        activeModal: cashEarned > 0 ? 'offlineEarnings' : null,
        offlineSummary:
          cashEarned > 0
            ? {
                secondsAway,
                appliedSeconds,
                cashEarned,
              }
            : null,
        cash: savedState.cash + cashEarned,
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
    const activeModal: ModalId | null = cashEarned > 0 ? 'offlineEarnings' : null

    const hydratedState: Partial<GameStore> = {
      ...importedState,
      appInfo: currentState.appInfo,
      activeTab: currentState.activeTab,
      activeModal,
      offlineSummary:
        cashEarned > 0
          ? {
              secondsAway,
              appliedSeconds,
              cashEarned,
            }
          : null,
      cash: importedState.cash + cashEarned,
      lifetimeCashEarned: importedState.lifetimeCashEarned + cashEarned,
      totalOfflineSecondsApplied: importedState.totalOfflineSecondsApplied + appliedSeconds,
      lastSaveTimestamp: now,
    }

    saveStateToStorage({
      ...importedState,
      cash: importedState.cash + cashEarned,
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
