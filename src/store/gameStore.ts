import { create } from 'zustand'
import type { AppInfo } from '../../shared/game'
import { initialState } from '../data/initialState'
import { getPrestigeUpgradeDefinition } from '../data/prestigeUpgrades'
import { getUpgradeDefinition } from '../data/upgrades'
import { getCashPerSecond, getJuniorTraderCost, getManualIncome, getPromotionCost, getTradingBotCost } from '../utils/economy'
import { getElapsedOfflineSeconds, getOfflineSecondsApplied } from '../utils/offlineProgress'
import { exportState, importState, loadStateFromStorage, saveStateToStorage } from '../utils/persistence'
import { createPrestigeResetState } from '../utils/prestige'
import type { GameState, GameStore, ModalId, OfflineSummary, ShopTabId } from '../types/game'

type StoreUiState = {
  appInfo: AppInfo | null
  activeShopTab: ShopTabId
  activeModal: ModalId | null
  offlineSummary: OfflineSummary | null
}

const initialUiState: StoreUiState = {
  appInfo: null,
  activeShopTab: 'manual',
  activeModal: null,
  offlineSummary: null,
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
  buyJuniorTrader: () => {
    set((state) => {
      const cost = getJuniorTraderCost(state)

      if (state.cash < cost) {
        return state
      }

      return {
        cash: state.cash - cost,
        juniorTraderCount: state.juniorTraderCount + 1,
      }
    })
  },
  buyTradingBot: () => {
    set((state) => {
      if (!state.purchasedUpgrades.algorithmicTrading) {
        return state
      }

      const cost = getTradingBotCost(state)

      if (state.cash < cost) {
        return state
      }

      return {
        cash: state.cash - cost,
        tradingBotCount: state.tradingBotCount + 1,
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
  promoteJuniorToSenior: () => {
    set((state) => {
      const promotionCost = getPromotionCost()

      if (!state.purchasedUpgrades.promotionProgram || state.juniorTraderCount <= 0 || state.cash < promotionCost) {
        return state
      }

      return {
        cash: state.cash - promotionCost,
        juniorTraderCount: state.juniorTraderCount - 1,
        seniorTraderCount: state.seniorTraderCount + 1,
      }
    })
  },
  prestigeReset: () => {
    set((state) => ({
      ...createPrestigeResetState(state),
      appInfo: state.appInfo,
      activeShopTab: 'prestige',
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
        activeShopTab: state.activeShopTab,
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
      activeShopTab: currentState.activeShopTab,
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
  setActiveShopTab: (tab) => {
    set({ activeShopTab: tab })
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
  resetFoundation: () => {
    set({
      ...initialState,
      ...initialUiState,
      lastSaveTimestamp: Date.now(),
    })
  },
}))
