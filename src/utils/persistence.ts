import { initialState } from '../data/initialState'
import { LOBBYING_POLICIES } from '../data/lobbyingPolicies'
import { PRESTIGE_UPGRADES } from '../data/prestigeUpgrades'
import { RESEARCH_TECH } from '../data/researchTech'
import { UPGRADES } from '../data/upgrades'
import type { GameState, LobbyingPolicyId, PrestigeUpgradeId, ResearchTechId, UpgradeId } from '../types/game'

export const SAVE_KEY = 'stock-incremental-save-v1'

const UPGRADE_IDS = UPGRADES.map((upgrade) => upgrade.id)
const PRESTIGE_UPGRADE_IDS = PRESTIGE_UPGRADES.map((upgrade) => upgrade.id)
const RESEARCH_TECH_IDS = RESEARCH_TECH.map((tech) => tech.id)
const LOBBYING_POLICY_IDS = LOBBYING_POLICIES.map((policy) => policy.id)

function isUpgradeId(value: string): value is UpgradeId {
  return UPGRADE_IDS.includes(value as UpgradeId)
}

function isPrestigeUpgradeId(value: string): value is PrestigeUpgradeId {
  return PRESTIGE_UPGRADE_IDS.includes(value as PrestigeUpgradeId)
}

function isResearchTechId(value: string): value is ResearchTechId {
  return RESEARCH_TECH_IDS.includes(value as ResearchTechId)
}

function isLobbyingPolicyId(value: string): value is LobbyingPolicyId {
  return LOBBYING_POLICY_IDS.includes(value as LobbyingPolicyId)
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
  const purchasedResearchTechSource = isRecord(value.purchasedResearchTech) ? value.purchasedResearchTech : {}
  const purchasedPoliciesSource = isRecord(value.purchasedPolicies) ? value.purchasedPolicies : {}
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

  const purchasedResearchTech = Object.fromEntries(
    Object.entries(purchasedResearchTechSource).filter(
      ([key, entryValue]) => isResearchTechId(key) && entryValue === true,
    ),
  )

  const purchasedPolicies = Object.fromEntries(
    Object.entries(purchasedPoliciesSource).filter(
      ([key, entryValue]) => isLobbyingPolicyId(key) && entryValue === true,
    ),
  )

  return {
    cash: getNumber(value.cash, initialState.cash),
    researchPoints: getNumber(value.researchPoints, initialState.researchPoints),
    influence: getNumber(value.influence, initialState.influence),
    lifetimeCashEarned: getNumber(value.lifetimeCashEarned, initialState.lifetimeCashEarned),
    reputation: getNumber(value.reputation, initialState.reputation),
    reputationSpent: getNumber(value.reputationSpent, initialState.reputationSpent),
    prestigeCount: getNumber(value.prestigeCount, initialState.prestigeCount),
    juniorTraderCount: getNumber(value.juniorTraderCount, initialState.juniorTraderCount),
    seniorTraderCount: getNumber(value.seniorTraderCount, initialState.seniorTraderCount),
    tradingServerCount: getNumber(value.tradingServerCount, initialState.tradingServerCount),
    tradingBotCount: getNumber(value.tradingBotCount, initialState.tradingBotCount),
    juniorResearchScientistCount: getNumber(
      value.juniorResearchScientistCount,
      getNumber(value.researchComputerScientistCount, initialState.juniorResearchScientistCount),
    ),
    seniorResearchScientistCount: getNumber(value.seniorResearchScientistCount, initialState.seniorResearchScientistCount),
    serverRoomCount: getNumber(
      value.serverRoomCount,
      getNumber(value.backupGeneratorCount, initialState.serverRoomCount) + getNumber(value.powerContractCount, 0),
    ),
    dataCenterCount: getNumber(value.dataCenterCount, getNumber(value.gridExpansionCount, initialState.dataCenterCount)),
    purchasedUpgrades,
    purchasedResearchTech,
    purchasedPolicies,
    purchasedPrestigeUpgrades,
    lastSaveTimestamp: getNumber(value.lastSaveTimestamp, Date.now()),
    totalOfflineSecondsApplied: getNumber(value.totalOfflineSecondsApplied, initialState.totalOfflineSecondsApplied),
    settings: {
      autosaveEnabled: getBoolean(settingsSource.autosaveEnabled, initialState.settings.autosaveEnabled),
      shortNumberThreshold: getNumber(settingsSource.shortNumberThreshold, initialState.settings.shortNumberThreshold),
    },
    ui: {
      activeDeskView:
        uiSource.activeDeskView === 'trading' || uiSource.activeDeskView === 'materials' || uiSource.activeDeskView === 'crypto'
          ? uiSource.activeDeskView
          : initialState.ui.activeDeskView,
      powerBuyModes: {
        serverRoom:
          isRecord(uiSource.powerBuyModes) && (uiSource.powerBuyModes.serverRoom === 1 || uiSource.powerBuyModes.serverRoom === 5 || uiSource.powerBuyModes.serverRoom === 10 || uiSource.powerBuyModes.serverRoom === 'max')
            ? uiSource.powerBuyModes.serverRoom
            : isRecord(uiSource.powerBuyModes) && (uiSource.powerBuyModes.backupGenerator === 1 || uiSource.powerBuyModes.backupGenerator === 5 || uiSource.powerBuyModes.backupGenerator === 10 || uiSource.powerBuyModes.backupGenerator === 'max')
              ? uiSource.powerBuyModes.backupGenerator
              : isRecord(uiSource.powerBuyModes) && (uiSource.powerBuyModes.powerContract === 1 || uiSource.powerBuyModes.powerContract === 5 || uiSource.powerBuyModes.powerContract === 10 || uiSource.powerBuyModes.powerContract === 'max')
                ? uiSource.powerBuyModes.powerContract
                : initialState.ui.powerBuyModes.serverRoom,
        dataCenter:
          isRecord(uiSource.powerBuyModes) && (uiSource.powerBuyModes.dataCenter === 1 || uiSource.powerBuyModes.dataCenter === 5 || uiSource.powerBuyModes.dataCenter === 10 || uiSource.powerBuyModes.dataCenter === 'max')
            ? uiSource.powerBuyModes.dataCenter
            : isRecord(uiSource.powerBuyModes) && (uiSource.powerBuyModes.gridExpansion === 1 || uiSource.powerBuyModes.gridExpansion === 5 || uiSource.powerBuyModes.gridExpansion === 10 || uiSource.powerBuyModes.gridExpansion === 'max')
              ? uiSource.powerBuyModes.gridExpansion
              : initialState.ui.powerBuyModes.dataCenter,
      },
      unitBuyModes: {
        juniorTrader:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.juniorTrader === 1 || uiSource.unitBuyModes.juniorTrader === 5 || uiSource.unitBuyModes.juniorTrader === 10 || uiSource.unitBuyModes.juniorTrader === 'max')
            ? uiSource.unitBuyModes.juniorTrader
            : initialState.ui.unitBuyModes.juniorTrader,
        seniorTrader:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.seniorTrader === 1 || uiSource.unitBuyModes.seniorTrader === 5 || uiSource.unitBuyModes.seniorTrader === 10 || uiSource.unitBuyModes.seniorTrader === 'max')
            ? uiSource.unitBuyModes.seniorTrader
            : initialState.ui.unitBuyModes.seniorTrader,
        tradingServer:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.tradingServer === 1 || uiSource.unitBuyModes.tradingServer === 5 || uiSource.unitBuyModes.tradingServer === 10 || uiSource.unitBuyModes.tradingServer === 'max')
            ? uiSource.unitBuyModes.tradingServer
            : initialState.ui.unitBuyModes.tradingServer,
        tradingBot:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.tradingBot === 1 || uiSource.unitBuyModes.tradingBot === 5 || uiSource.unitBuyModes.tradingBot === 10 || uiSource.unitBuyModes.tradingBot === 'max')
            ? uiSource.unitBuyModes.tradingBot
            : initialState.ui.unitBuyModes.tradingBot,
        juniorResearchScientist:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.juniorResearchScientist === 1 || uiSource.unitBuyModes.juniorResearchScientist === 5 || uiSource.unitBuyModes.juniorResearchScientist === 10 || uiSource.unitBuyModes.juniorResearchScientist === 'max')
            ? uiSource.unitBuyModes.juniorResearchScientist
            : isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.researchComputerScientist === 1 || uiSource.unitBuyModes.researchComputerScientist === 5 || uiSource.unitBuyModes.researchComputerScientist === 10 || uiSource.unitBuyModes.researchComputerScientist === 'max')
              ? uiSource.unitBuyModes.researchComputerScientist
              : initialState.ui.unitBuyModes.juniorResearchScientist,
        seniorResearchScientist:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.seniorResearchScientist === 1 || uiSource.unitBuyModes.seniorResearchScientist === 5 || uiSource.unitBuyModes.seniorResearchScientist === 10 || uiSource.unitBuyModes.seniorResearchScientist === 'max')
            ? uiSource.unitBuyModes.seniorResearchScientist
            : initialState.ui.unitBuyModes.seniorResearchScientist,
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
