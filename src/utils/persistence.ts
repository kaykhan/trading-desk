import { initialState } from '../data/initialState'
import { PRESTIGE_UPGRADES } from '../data/prestigeUpgrades'
import { UPGRADES } from '../data/upgrades'
import type { GameState, PrestigeUpgradeId, UpgradeId } from '../types/game'

export const SAVE_KEY = 'stock-incremental-save-v1'

const UPGRADE_IDS = UPGRADES.map((upgrade) => upgrade.id)
const PRESTIGE_UPGRADE_IDS = PRESTIGE_UPGRADES.map((upgrade) => upgrade.id)

function isUpgradeId(value: string): value is UpgradeId {
  return UPGRADE_IDS.includes(value as UpgradeId)
}

function isPrestigeUpgradeId(value: string): value is PrestigeUpgradeId {
  return PRESTIGE_UPGRADE_IDS.includes(value as PrestigeUpgradeId)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function getBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return window.btoa(binary)
}

function decodeBase64(value: string): string {
  const binary = window.atob(value)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function normalizeGameState(value: unknown): GameState | null {
  if (!isRecord(value)) {
    return null
  }

  const purchasedUpgradesSource = isRecord(value.purchasedUpgrades) ? value.purchasedUpgrades : {}
  const purchasedPrestigeUpgradesSource = isRecord(value.purchasedPrestigeUpgrades) ? value.purchasedPrestigeUpgrades : {}
  const settingsSource = isRecord(value.settings) ? value.settings : {}
  const uiSource = isRecord(value.ui) ? value.ui : {}

  const purchasedUpgrades = Object.fromEntries(
    Object.entries(purchasedUpgradesSource).filter(
      ([key, entryValue]) => isUpgradeId(key) && entryValue === true,
    ),
  )

  const purchasedPrestigeUpgrades = Object.fromEntries(
    Object.entries(purchasedPrestigeUpgradesSource).filter(
      ([key, entryValue]) =>
        isPrestigeUpgradeId(key) && typeof entryValue === 'number' && Number.isFinite(entryValue) && entryValue >= 0,
    ),
  )

  return {
    cash: getNumber(value.cash, initialState.cash),
    lifetimeCashEarned: getNumber(value.lifetimeCashEarned, initialState.lifetimeCashEarned),
    reputation: getNumber(value.reputation, initialState.reputation),
    reputationSpent: getNumber(value.reputationSpent, initialState.reputationSpent),
    prestigeCount: getNumber(value.prestigeCount, initialState.prestigeCount),
    juniorTraderCount: getNumber(value.juniorTraderCount, initialState.juniorTraderCount),
    seniorTraderCount: getNumber(value.seniorTraderCount, initialState.seniorTraderCount),
    tradingBotCount: getNumber(value.tradingBotCount, initialState.tradingBotCount),
    purchasedUpgrades,
    purchasedPrestigeUpgrades,
    lastSaveTimestamp: getNumber(value.lastSaveTimestamp, Date.now()),
    totalOfflineSecondsApplied: getNumber(value.totalOfflineSecondsApplied, initialState.totalOfflineSecondsApplied),
    settings: {
      autosaveEnabled: getBoolean(settingsSource.autosaveEnabled, initialState.settings.autosaveEnabled),
      shortNumberThreshold: getNumber(settingsSource.shortNumberThreshold, initialState.settings.shortNumberThreshold),
    },
    ui: {
      unitBuyModes: {
        juniorTrader:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.juniorTrader === 1 || uiSource.unitBuyModes.juniorTrader === 5 || uiSource.unitBuyModes.juniorTrader === 10 || uiSource.unitBuyModes.juniorTrader === 'max')
            ? uiSource.unitBuyModes.juniorTrader
            : initialState.ui.unitBuyModes.juniorTrader,
        seniorTrader:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.seniorTrader === 1 || uiSource.unitBuyModes.seniorTrader === 5 || uiSource.unitBuyModes.seniorTrader === 10 || uiSource.unitBuyModes.seniorTrader === 'max')
            ? uiSource.unitBuyModes.seniorTrader
            : initialState.ui.unitBuyModes.seniorTrader,
        tradingBot:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.tradingBot === 1 || uiSource.unitBuyModes.tradingBot === 5 || uiSource.unitBuyModes.tradingBot === 10 || uiSource.unitBuyModes.tradingBot === 'max')
            ? uiSource.unitBuyModes.tradingBot
            : initialState.ui.unitBuyModes.tradingBot,
      },
    },
  }
}

export function saveStateToStorage(state: GameState): void {
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(state))
}

export function loadStateFromStorage(): GameState | null {
  const raw = window.localStorage.getItem(SAVE_KEY)

  if (!raw) {
    return null
  }

  try {
    return normalizeGameState(JSON.parse(raw))
  } catch {
    return null
  }
}

export function exportState(state: GameState): string {
  return encodeBase64(JSON.stringify(state))
}

export function importState(encodedSave: string): GameState | null {
  try {
    const decoded = decodeBase64(encodedSave.trim())
    return normalizeGameState(JSON.parse(decoded))
  } catch {
    return null
  }
}
