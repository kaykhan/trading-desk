import { DEFAULT_AUTOMATION_CONFIG, DEFAULT_AUTOMATION_CYCLE_STATE } from '../data/automation'
import { initialState } from '../data/initialState'
import { LOBBYING_POLICIES } from '../data/lobbyingPolicies'
import { PRESTIGE_UPGRADES } from '../data/prestigeUpgrades'
import { REPEATABLE_UPGRADES } from '../data/repeatableUpgrades'
import { RESEARCH_TECH } from '../data/researchTech'
import { DEFAULT_UNLOCKED_SECTORS, SECTOR_IDS } from '../data/sectors'
import { UPGRADES } from '../data/upgrades'
import type { AutomationStrategyId, AutomationUnitId, GameState, GenericSectorAssignableUnitId, HumanAssignableUnitId, InstitutionalMandateId, InstitutionalMandateUnitId, LobbyingPolicyId, PrestigeUpgradeId, RepeatableUpgradeId, ResearchTechId, SectorId, TraderSpecialistUnitId, TraderSpecializationId, UpgradeId } from '../types/game'

export const SAVE_KEY = 'stock-incremental-save-v1'

const UPGRADE_IDS = UPGRADES.map((upgrade) => upgrade.id)
const PRESTIGE_UPGRADE_IDS = PRESTIGE_UPGRADES.map((upgrade) => upgrade.id)
const RESEARCH_TECH_IDS = RESEARCH_TECH.map((tech) => tech.id)
const LOBBYING_POLICY_IDS = LOBBYING_POLICIES.map((policy) => policy.id)
const REPEATABLE_UPGRADE_IDS = REPEATABLE_UPGRADES.map((upgrade) => upgrade.id)

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

function isRepeatableUpgradeId(value: string): value is RepeatableUpgradeId {
  return REPEATABLE_UPGRADE_IDS.includes(value as RepeatableUpgradeId)
}

function isSectorId(value: string): value is SectorId {
  return SECTOR_IDS.includes(value as SectorId)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isAutomationUnitId(value: string): value is AutomationUnitId {
  return value === 'quantTrader' || value === 'ruleBasedBot' || value === 'mlTradingBot' || value === 'aiTradingBot'
}

function isAutomationStrategyId(value: string): value is AutomationStrategyId {
  return value === 'meanReversion' || value === 'momentum' || value === 'arbitrage' || value === 'marketMaking' || value === 'scalping'
}

function getNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function getBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function getSafeOwnedAssignableCount(rawState: Record<string, unknown>, unitId: HumanAssignableUnitId): number {
  if (unitId === 'intern') {
    return getNumber(rawState.internCount, initialState.internCount)
  }

  if (unitId === 'juniorTrader') {
    return getNumber(rawState.juniorTraderCount, initialState.juniorTraderCount)
  }

  return getNumber(rawState.seniorTraderCount, initialState.seniorTraderCount)
}

function getSafeOwnedTraderSpecialistCount(rawState: Record<string, unknown>, unitId: TraderSpecialistUnitId): number {
  return getNumber(rawState.seniorTraderCount, initialState.seniorTraderCount)
}

function normalizeTraderSpecialistCounts(source: unknown, ownedCount: number): Record<TraderSpecializationId, number> {
  const sourceRecord = isRecord(source) ? source : {}
  const specializationIds: TraderSpecializationId[] = ['finance', 'technology', 'energy']
  let remaining = ownedCount

  return Object.fromEntries(specializationIds.map((specializationId) => {
    const requested = getNumber(sourceRecord[specializationId], 0)
    const clamped = Math.min(Math.max(0, Math.floor(requested)), remaining)
    remaining -= clamped
    return [specializationId, clamped]
  })) as Record<TraderSpecializationId, number>
}

function normalizeTraderSpecialists(source: unknown, rawState: Record<string, unknown>): GameState['traderSpecialists'] {
  const sourceRecord = isRecord(source) ? source : {}

  return {
    seniorTrader: normalizeTraderSpecialistCounts(sourceRecord.seniorTrader, getSafeOwnedTraderSpecialistCount(rawState, 'seniorTrader')),
  }
}

function normalizeInstitutionMandateCounts(source: unknown, ownedCount: number): Record<InstitutionalMandateId, number> {
  const sourceRecord = isRecord(source) ? source : {}
  const mandateIds: InstitutionalMandateId[] = ['finance', 'technology', 'energy']
  let remaining = ownedCount

  return Object.fromEntries(mandateIds.map((mandateId) => {
    const requested = getNumber(sourceRecord[mandateId], 0)
    const clamped = Math.min(Math.max(0, Math.floor(requested)), remaining)
    remaining -= clamped
    return [mandateId, clamped]
  })) as Record<InstitutionalMandateId, number>
}

function normalizeInstitutionMandates(source: unknown, rawState: Record<string, unknown>): GameState['institutionMandates'] {
  const sourceRecord = isRecord(source) ? source : {}
  const getOwned = (unitId: InstitutionalMandateUnitId) => unitId === 'propDesk'
    ? getNumber(rawState.propDeskCount, initialState.propDeskCount)
    : unitId === 'institutionalDesk'
      ? getNumber(rawState.institutionalDeskCount, initialState.institutionalDeskCount)
      : unitId === 'hedgeFund'
        ? getNumber(rawState.hedgeFundCount, initialState.hedgeFundCount)
        : getNumber(rawState.investmentFirmCount, initialState.investmentFirmCount)

  return {
    propDesk: normalizeInstitutionMandateCounts(sourceRecord.propDesk, getOwned('propDesk')),
    institutionalDesk: normalizeInstitutionMandateCounts(sourceRecord.institutionalDesk, getOwned('institutionalDesk')),
    hedgeFund: normalizeInstitutionMandateCounts(sourceRecord.hedgeFund, getOwned('hedgeFund')),
    investmentFirm: normalizeInstitutionMandateCounts(sourceRecord.investmentFirm, getOwned('investmentFirm')),
  }
}

function getSafeOwnedGenericAssignableCount(rawState: Record<string, unknown>, unitId: GenericSectorAssignableUnitId): number {
  if (unitId === 'intern' || unitId === 'juniorTrader' || unitId === 'seniorTrader') {
    return getSafeOwnedAssignableCount(rawState, unitId)
  }

  if (unitId === 'propDesk') return getNumber(rawState.propDeskCount, initialState.propDeskCount)
  if (unitId === 'institutionalDesk') return getNumber(rawState.institutionalDeskCount, initialState.institutionalDeskCount)
  if (unitId === 'hedgeFund') return getNumber(rawState.hedgeFundCount, initialState.hedgeFundCount)
  return getNumber(rawState.investmentFirmCount, initialState.investmentFirmCount)
}

function normalizeSectorAssignments(source: unknown, rawState: Record<string, unknown>): GameState['sectorAssignments'] {
  const sourceRecord = isRecord(source) ? source : {}

  const normalizeUnitAssignments = (unitId: GenericSectorAssignableUnitId): Record<SectorId, number> => {
    const unitSource = isRecord(sourceRecord[unitId]) ? sourceRecord[unitId] : {}
    const ownedCount = getSafeOwnedGenericAssignableCount(rawState, unitId)
    let remaining = ownedCount

    return Object.fromEntries(SECTOR_IDS.map((sectorId) => {
      const rawValue = unitSource[sectorId]
      const requested = typeof rawValue === 'number' && Number.isFinite(rawValue) ? Math.max(0, Math.floor(rawValue)) : 0
      const clamped = Math.min(requested, remaining)
      remaining -= clamped
      return [sectorId, clamped]
    })) as Record<SectorId, number>
  }

  return {
    intern: normalizeUnitAssignments('intern'),
    juniorTrader: normalizeUnitAssignments('juniorTrader'),
    seniorTrader: normalizeUnitAssignments('seniorTrader'),
    propDesk: normalizeUnitAssignments('propDesk'),
    institutionalDesk: normalizeUnitAssignments('institutionalDesk'),
    hedgeFund: normalizeUnitAssignments('hedgeFund'),
    investmentFirm: normalizeUnitAssignments('investmentFirm'),
  }
}

function normalizeAutomationConfig(source: unknown): GameState['automationConfig'] {
  const sourceRecord = isRecord(source) ? source : {}

  const normalizeEntry = (unitId: AutomationUnitId) => {
    const entry = isRecord(sourceRecord[unitId]) ? sourceRecord[unitId] : {}
    return {
      strategy: typeof entry.strategy === 'string' && isAutomationStrategyId(entry.strategy) ? entry.strategy : DEFAULT_AUTOMATION_CONFIG[unitId].strategy,
      marketTarget: typeof entry.marketTarget === 'string' && isSectorId(entry.marketTarget) ? entry.marketTarget : DEFAULT_AUTOMATION_CONFIG[unitId].marketTarget,
    }
  }

  return {
    quantTrader: normalizeEntry('quantTrader'),
    ruleBasedBot: normalizeEntry('ruleBasedBot'),
    mlTradingBot: normalizeEntry('mlTradingBot'),
    aiTradingBot: normalizeEntry('aiTradingBot'),
  }
}

function normalizeAutomationCycleState(source: unknown): GameState['automationCycleState'] {
  const sourceRecord = isRecord(source) ? source : {}

  const normalizeEntry = (unitId: AutomationUnitId) => {
    const entry = isRecord(sourceRecord[unitId]) ? sourceRecord[unitId] : {}
    return {
      progressSeconds: getNumber(entry.progressSeconds, DEFAULT_AUTOMATION_CYCLE_STATE[unitId].progressSeconds),
      lastPayout: getNumber(entry.lastPayout, DEFAULT_AUTOMATION_CYCLE_STATE[unitId].lastPayout),
      lastCompletedAt: typeof entry.lastCompletedAt === 'number' && Number.isFinite(entry.lastCompletedAt) ? entry.lastCompletedAt : DEFAULT_AUTOMATION_CYCLE_STATE[unitId].lastCompletedAt,
    }
  }

  return {
    quantTrader: normalizeEntry('quantTrader'),
    ruleBasedBot: normalizeEntry('ruleBasedBot'),
    mlTradingBot: normalizeEntry('mlTradingBot'),
    aiTradingBot: normalizeEntry('aiTradingBot'),
  }
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
  const repeatableUpgradeRanksSource = isRecord(value.repeatableUpgradeRanks) ? value.repeatableUpgradeRanks : {}
  const unlockedSectorsSource = isRecord(value.unlockedSectors) ? value.unlockedSectors : {}
  const settingsSource = isRecord(value.settings) ? value.settings : {}
  const uiSource = isRecord(value.ui) ? value.ui : {}

  const purchasedUpgrades = Object.fromEntries(
    Object.entries(purchasedUpgradesSource).filter(
      ([key, entryValue]) => isUpgradeId(key) && entryValue === true,
    ),
  )

  const migratedPurchasedUpgrades = {
    ...purchasedUpgrades,
    ...(isRecord(value.purchasedUpgrades) && value.purchasedUpgrades.algorithmicTrading === true ? { systematicExecution: true } : {}),
  }

  const purchasedPrestigeUpgrades = Object.fromEntries(
    Object.entries(purchasedPrestigeUpgradesSource).filter(
      ([key, entryValue]) =>
        isPrestigeUpgradeId(key) && typeof entryValue === 'number' && Number.isFinite(entryValue) && entryValue >= 0,
    ),
  )

  const migratedPrestigeUpgrades = {
    ...purchasedPrestigeUpgrades,
    ...(isRecord(value.purchasedUpgrades) && value.purchasedUpgrades.tradeMultiplier === true ? { tradeMultiplier: 1 } : {}),
  }

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

  const repeatableUpgradeRanks = Object.fromEntries(
    Object.entries(repeatableUpgradeRanksSource).filter(
      ([key, entryValue]) => isRepeatableUpgradeId(key) && typeof entryValue === 'number' && Number.isFinite(entryValue) && entryValue >= 0,
    ),
  )

  const migratedRepeatableUpgradeRanks = {
    ...repeatableUpgradeRanks,
    ...(typeof repeatableUpgradeRanksSource.botDeploymentTuning === 'number' && Number.isFinite(repeatableUpgradeRanksSource.botDeploymentTuning) && repeatableUpgradeRanksSource.botDeploymentTuning >= 0
      ? { ruleBasedExecution: repeatableUpgradeRanksSource.botDeploymentTuning }
      : {}),
    ...(typeof repeatableUpgradeRanksSource.tradingServerThroughput === 'number' && Number.isFinite(repeatableUpgradeRanksSource.tradingServerThroughput) && repeatableUpgradeRanksSource.tradingServerThroughput >= 0
      ? { mlModelDeployment: repeatableUpgradeRanksSource.tradingServerThroughput }
      : {}),
    ...(typeof repeatableUpgradeRanksSource.algorithmRefinement === 'number' && Number.isFinite(repeatableUpgradeRanksSource.algorithmRefinement) && repeatableUpgradeRanksSource.algorithmRefinement >= 0
      ? { signalRefinement: repeatableUpgradeRanksSource.algorithmRefinement }
      : {}),
    ...(typeof repeatableUpgradeRanksSource.exchangeColocationModels === 'number' && Number.isFinite(repeatableUpgradeRanksSource.exchangeColocationModels) && repeatableUpgradeRanksSource.exchangeColocationModels >= 0
      ? { mlFeaturePipelines: repeatableUpgradeRanksSource.exchangeColocationModels }
      : {}),
  }

  const migratedPurchasedResearchTech: Partial<Record<ResearchTechId, boolean>> = {
    ...purchasedResearchTech,
    ...(isRecord(value.purchasedUpgrades) && value.purchasedUpgrades.juniorHiringProgram === true ? { foundationsOfFinanceTraining: true } : {}),
    ...(isRecord(value.purchasedUpgrades) && value.purchasedUpgrades.juniorTraderProgram === true ? { juniorTraderProgram: true } : {}),
    ...(isRecord(value.purchasedUpgrades) && value.purchasedUpgrades.seniorRecruitment === true ? { seniorRecruitment: true } : {}),
    ...(isRecord(value.purchasedResearchTech) && value.purchasedResearchTech.tradingServers === true ? { aiTradingSystems: true } : {}),
  }

  const unlockedSectors = Object.fromEntries(SECTOR_IDS.map((sectorId) => {
    const explicitValue = isSectorId(sectorId)
      ? getBoolean(unlockedSectorsSource[sectorId], DEFAULT_UNLOCKED_SECTORS[sectorId])
      : DEFAULT_UNLOCKED_SECTORS[sectorId]
    const autoUnlocked = sectorId === 'technology'
      ? migratedPurchasedResearchTech.technologyMarkets === true || migratedPurchasedResearchTech.algorithmicTrading === true
      : sectorId === 'energy'
        ? migratedPurchasedResearchTech.energyMarkets === true || migratedPurchasedResearchTech.powerSystemsEngineering === true
        : false

    return [sectorId, explicitValue || autoUnlocked]
  })) as Record<SectorId, boolean>

  const traderSpecialists = normalizeTraderSpecialists(value.traderSpecialists, value)
  const institutionMandates = normalizeInstitutionMandates(value.institutionMandates, value)
  const sectorAssignments = normalizeSectorAssignments(value.sectorAssignments, value)
  const automationConfig = normalizeAutomationConfig(value.automationConfig)
  const automationCycleState = normalizeAutomationCycleState(value.automationCycleState)

  return {
    cash: getNumber(value.cash, initialState.cash),
    researchPoints: getNumber(value.researchPoints, initialState.researchPoints),
    influence: getNumber(value.influence, initialState.influence),
    discoveredLobbying:
      getBoolean(value.discoveredLobbying, initialState.discoveredLobbying)
      || (isRecord(value.purchasedResearchTech) && value.purchasedResearchTech.regulatoryAffairs === true),
    lifetimeCashEarned: getNumber(value.lifetimeCashEarned, initialState.lifetimeCashEarned),
    reputation: getNumber(value.reputation, initialState.reputation),
    reputationSpent: getNumber(value.reputationSpent, initialState.reputationSpent),
    prestigeCount: getNumber(value.prestigeCount, initialState.prestigeCount),
    internCount: getNumber(value.internCount, initialState.internCount),
    juniorTraderCount: getNumber(value.juniorTraderCount, initialState.juniorTraderCount),
    seniorTraderCount: getNumber(value.seniorTraderCount, initialState.seniorTraderCount),
    quantTraderCount: getNumber(value.quantTraderCount, initialState.quantTraderCount),
    baseDeskSlots: getNumber(value.baseDeskSlots, initialState.baseDeskSlots),
    deskSpaceCount: getNumber(value.deskSpaceCount, getNumber(value.officeExpansionCount, initialState.deskSpaceCount)),
    floorSpaceCount: getNumber(value.floorSpaceCount, getNumber(value.floorExpansionCount, initialState.floorSpaceCount)),
    officeCount: getNumber(value.officeCount, initialState.officeCount),
    propDeskCount: getNumber(value.propDeskCount, initialState.propDeskCount),
    institutionalDeskCount: getNumber(value.institutionalDeskCount, initialState.institutionalDeskCount),
    hedgeFundCount: getNumber(value.hedgeFundCount, initialState.hedgeFundCount),
    investmentFirmCount: getNumber(value.investmentFirmCount, initialState.investmentFirmCount),
    ruleBasedBotCount: getNumber(value.ruleBasedBotCount, getNumber(value.tradingBotCount, initialState.ruleBasedBotCount)),
    mlTradingBotCount: getNumber(value.mlTradingBotCount, getNumber(value.tradingServerCount, initialState.mlTradingBotCount)),
    aiTradingBotCount: getNumber(value.aiTradingBotCount, initialState.aiTradingBotCount),
    internResearchScientistCount: getNumber(value.internResearchScientistCount, initialState.internResearchScientistCount),
    juniorResearchScientistCount: getNumber(
      value.juniorResearchScientistCount,
      getNumber(value.researchComputerScientistCount, initialState.juniorResearchScientistCount),
    ),
    seniorResearchScientistCount: getNumber(value.seniorResearchScientistCount, initialState.seniorResearchScientistCount),
    juniorPoliticianCount: getNumber(value.juniorPoliticianCount, initialState.juniorPoliticianCount),
    serverRackCount: getNumber(value.serverRackCount, getNumber(value.backupGeneratorCount, 0) + getNumber(value.powerContractCount, initialState.serverRackCount)),
    serverRoomCount: getNumber(value.serverRoomCount, initialState.serverRoomCount),
    dataCenterCount: getNumber(value.dataCenterCount, getNumber(value.gridExpansionCount, initialState.dataCenterCount)),
    cloudComputeCount: getNumber(value.cloudComputeCount, initialState.cloudComputeCount),
    unlockedSectors,
    automationConfig,
    automationCycleState,
    sectorAssignments,
    traderSpecialists,
    institutionMandates,
    purchasedUpgrades: migratedPurchasedUpgrades,
    purchasedResearchTech: migratedPurchasedResearchTech,
    purchasedPolicies,
    purchasedPrestigeUpgrades: migratedPrestigeUpgrades,
    repeatableUpgradeRanks: migratedRepeatableUpgradeRanks,
    lastSaveTimestamp: getNumber(value.lastSaveTimestamp, Date.now()),
    totalOfflineSecondsApplied: getNumber(value.totalOfflineSecondsApplied, initialState.totalOfflineSecondsApplied),
    settings: {
      autosaveEnabled: getBoolean(settingsSource.autosaveEnabled, initialState.settings.autosaveEnabled),
      shortNumberThreshold: getNumber(settingsSource.shortNumberThreshold, initialState.settings.shortNumberThreshold),
    },
    ui: {
      activeDeskView:
        uiSource.activeDeskView === 'trading' || uiSource.activeDeskView === 'sectors' || uiSource.activeDeskView === 'commodities' || uiSource.activeDeskView === 'scientists' || uiSource.activeDeskView === 'infrastructure' || uiSource.activeDeskView === 'politicians'
          ? uiSource.activeDeskView
          : uiSource.activeDeskView === 'materials' || uiSource.activeDeskView === 'crypto'
            ? 'commodities'
            : initialState.ui.activeDeskView,
      powerBuyModes: {
        serverRack:
          isRecord(uiSource.powerBuyModes) && (uiSource.powerBuyModes.serverRack === 1 || uiSource.powerBuyModes.serverRack === 5 || uiSource.powerBuyModes.serverRack === 10 || uiSource.powerBuyModes.serverRack === 'max')
            ? uiSource.powerBuyModes.serverRack
            : isRecord(uiSource.powerBuyModes) && (uiSource.powerBuyModes.backupGenerator === 1 || uiSource.powerBuyModes.backupGenerator === 5 || uiSource.powerBuyModes.backupGenerator === 10 || uiSource.powerBuyModes.backupGenerator === 'max')
              ? uiSource.powerBuyModes.backupGenerator
              : isRecord(uiSource.powerBuyModes) && (uiSource.powerBuyModes.powerContract === 1 || uiSource.powerBuyModes.powerContract === 5 || uiSource.powerBuyModes.powerContract === 10 || uiSource.powerBuyModes.powerContract === 'max')
                ? uiSource.powerBuyModes.powerContract
                : initialState.ui.powerBuyModes.serverRack,
        serverRoom:
          isRecord(uiSource.powerBuyModes) && (uiSource.powerBuyModes.serverRoom === 1 || uiSource.powerBuyModes.serverRoom === 5 || uiSource.powerBuyModes.serverRoom === 10 || uiSource.powerBuyModes.serverRoom === 'max')
            ? uiSource.powerBuyModes.serverRoom
            : initialState.ui.powerBuyModes.serverRoom,
        dataCenter:
          isRecord(uiSource.powerBuyModes) && (uiSource.powerBuyModes.dataCenter === 1 || uiSource.powerBuyModes.dataCenter === 5 || uiSource.powerBuyModes.dataCenter === 10 || uiSource.powerBuyModes.dataCenter === 'max')
            ? uiSource.powerBuyModes.dataCenter
            : isRecord(uiSource.powerBuyModes) && (uiSource.powerBuyModes.gridExpansion === 1 || uiSource.powerBuyModes.gridExpansion === 5 || uiSource.powerBuyModes.gridExpansion === 10 || uiSource.powerBuyModes.gridExpansion === 'max')
              ? uiSource.powerBuyModes.gridExpansion
              : initialState.ui.powerBuyModes.dataCenter,
        cloudCompute:
          isRecord(uiSource.powerBuyModes) && (uiSource.powerBuyModes.cloudCompute === 1 || uiSource.powerBuyModes.cloudCompute === 5 || uiSource.powerBuyModes.cloudCompute === 10 || uiSource.powerBuyModes.cloudCompute === 'max')
            ? uiSource.powerBuyModes.cloudCompute
            : initialState.ui.powerBuyModes.cloudCompute,
      },
      capacityBuyModes: {
        deskSpace:
          isRecord(uiSource.capacityBuyModes) && (uiSource.capacityBuyModes.deskSpace === 1 || uiSource.capacityBuyModes.deskSpace === 5 || uiSource.capacityBuyModes.deskSpace === 10 || uiSource.capacityBuyModes.deskSpace === 'max')
            ? uiSource.capacityBuyModes.deskSpace
            : initialState.ui.capacityBuyModes.deskSpace,
        floorSpace:
          isRecord(uiSource.capacityBuyModes) && (uiSource.capacityBuyModes.floorSpace === 1 || uiSource.capacityBuyModes.floorSpace === 5 || uiSource.capacityBuyModes.floorSpace === 10 || uiSource.capacityBuyModes.floorSpace === 'max')
            ? uiSource.capacityBuyModes.floorSpace
            : initialState.ui.capacityBuyModes.floorSpace,
        office:
          isRecord(uiSource.capacityBuyModes) && (uiSource.capacityBuyModes.office === 1 || uiSource.capacityBuyModes.office === 5 || uiSource.capacityBuyModes.office === 10 || uiSource.capacityBuyModes.office === 'max')
            ? uiSource.capacityBuyModes.office
            : initialState.ui.capacityBuyModes.office,
      },
      repeatableUpgradeBuyModes: {
        manualTradeRefinement:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.manualTradeRefinement === 1 || uiSource.repeatableUpgradeBuyModes.manualTradeRefinement === 5 || uiSource.repeatableUpgradeBuyModes.manualTradeRefinement === 10 || uiSource.repeatableUpgradeBuyModes.manualTradeRefinement === 'max')
            ? uiSource.repeatableUpgradeBuyModes.manualTradeRefinement
            : initialState.ui.repeatableUpgradeBuyModes.manualTradeRefinement,
        politicalNetworking:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.politicalNetworking === 1 || uiSource.repeatableUpgradeBuyModes.politicalNetworking === 5 || uiSource.repeatableUpgradeBuyModes.politicalNetworking === 10 || uiSource.repeatableUpgradeBuyModes.politicalNetworking === 'max')
            ? uiSource.repeatableUpgradeBuyModes.politicalNetworking
            : initialState.ui.repeatableUpgradeBuyModes.politicalNetworking,
        constituencyResearch:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.constituencyResearch === 1 || uiSource.repeatableUpgradeBuyModes.constituencyResearch === 5 || uiSource.repeatableUpgradeBuyModes.constituencyResearch === 10 || uiSource.repeatableUpgradeBuyModes.constituencyResearch === 'max')
            ? uiSource.repeatableUpgradeBuyModes.constituencyResearch
            : initialState.ui.repeatableUpgradeBuyModes.constituencyResearch,
        talentHeadhunters:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.talentHeadhunters === 1 || uiSource.repeatableUpgradeBuyModes.talentHeadhunters === 5 || uiSource.repeatableUpgradeBuyModes.talentHeadhunters === 10 || uiSource.repeatableUpgradeBuyModes.talentHeadhunters === 'max')
            ? uiSource.repeatableUpgradeBuyModes.talentHeadhunters
            : initialState.ui.repeatableUpgradeBuyModes.talentHeadhunters,
        researchEndowments:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.researchEndowments === 1 || uiSource.repeatableUpgradeBuyModes.researchEndowments === 5 || uiSource.repeatableUpgradeBuyModes.researchEndowments === 10 || uiSource.repeatableUpgradeBuyModes.researchEndowments === 'max')
            ? uiSource.repeatableUpgradeBuyModes.researchEndowments
            : initialState.ui.repeatableUpgradeBuyModes.researchEndowments,
        patronageMachine:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.patronageMachine === 1 || uiSource.repeatableUpgradeBuyModes.patronageMachine === 5 || uiSource.repeatableUpgradeBuyModes.patronageMachine === 10 || uiSource.repeatableUpgradeBuyModes.patronageMachine === 'max')
            ? uiSource.repeatableUpgradeBuyModes.patronageMachine
            : initialState.ui.repeatableUpgradeBuyModes.patronageMachine,
        automationSubsidies:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.automationSubsidies === 1 || uiSource.repeatableUpgradeBuyModes.automationSubsidies === 5 || uiSource.repeatableUpgradeBuyModes.automationSubsidies === 10 || uiSource.repeatableUpgradeBuyModes.automationSubsidies === 'max')
            ? uiSource.repeatableUpgradeBuyModes.automationSubsidies
            : initialState.ui.repeatableUpgradeBuyModes.automationSubsidies,
        infrastructureGrants:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.infrastructureGrants === 1 || uiSource.repeatableUpgradeBuyModes.infrastructureGrants === 5 || uiSource.repeatableUpgradeBuyModes.infrastructureGrants === 10 || uiSource.repeatableUpgradeBuyModes.infrastructureGrants === 'max')
            ? uiSource.repeatableUpgradeBuyModes.infrastructureGrants
            : initialState.ui.repeatableUpgradeBuyModes.infrastructureGrants,
        internDeskTraining:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.internDeskTraining === 1 || uiSource.repeatableUpgradeBuyModes.internDeskTraining === 5 || uiSource.repeatableUpgradeBuyModes.internDeskTraining === 10 || uiSource.repeatableUpgradeBuyModes.internDeskTraining === 'max')
            ? uiSource.repeatableUpgradeBuyModes.internDeskTraining
            : initialState.ui.repeatableUpgradeBuyModes.internDeskTraining,
        internPlaybooks:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.internPlaybooks === 1 || uiSource.repeatableUpgradeBuyModes.internPlaybooks === 5 || uiSource.repeatableUpgradeBuyModes.internPlaybooks === 10 || uiSource.repeatableUpgradeBuyModes.internPlaybooks === 'max')
            ? uiSource.repeatableUpgradeBuyModes.internPlaybooks
            : initialState.ui.repeatableUpgradeBuyModes.internPlaybooks,
        internLabTraining:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.internLabTraining === 1 || uiSource.repeatableUpgradeBuyModes.internLabTraining === 5 || uiSource.repeatableUpgradeBuyModes.internLabTraining === 10 || uiSource.repeatableUpgradeBuyModes.internLabTraining === 'max')
            ? uiSource.repeatableUpgradeBuyModes.internLabTraining
            : initialState.ui.repeatableUpgradeBuyModes.internLabTraining,
        internResearchNotes:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.internResearchNotes === 1 || uiSource.repeatableUpgradeBuyModes.internResearchNotes === 5 || uiSource.repeatableUpgradeBuyModes.internResearchNotes === 10 || uiSource.repeatableUpgradeBuyModes.internResearchNotes === 'max')
            ? uiSource.repeatableUpgradeBuyModes.internResearchNotes
            : initialState.ui.repeatableUpgradeBuyModes.internResearchNotes,
        juniorTraderTraining:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.juniorTraderTraining === 1 || uiSource.repeatableUpgradeBuyModes.juniorTraderTraining === 5 || uiSource.repeatableUpgradeBuyModes.juniorTraderTraining === 10 || uiSource.repeatableUpgradeBuyModes.juniorTraderTraining === 'max')
            ? uiSource.repeatableUpgradeBuyModes.juniorTraderTraining
            : initialState.ui.repeatableUpgradeBuyModes.juniorTraderTraining,
        seniorDeskPerformance:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.seniorDeskPerformance === 1 || uiSource.repeatableUpgradeBuyModes.seniorDeskPerformance === 5 || uiSource.repeatableUpgradeBuyModes.seniorDeskPerformance === 10 || uiSource.repeatableUpgradeBuyModes.seniorDeskPerformance === 'max')
            ? uiSource.repeatableUpgradeBuyModes.seniorDeskPerformance
            : initialState.ui.repeatableUpgradeBuyModes.seniorDeskPerformance,
        propDeskScaling:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.propDeskScaling === 1 || uiSource.repeatableUpgradeBuyModes.propDeskScaling === 5 || uiSource.repeatableUpgradeBuyModes.propDeskScaling === 10 || uiSource.repeatableUpgradeBuyModes.propDeskScaling === 'max')
            ? uiSource.repeatableUpgradeBuyModes.propDeskScaling
            : initialState.ui.repeatableUpgradeBuyModes.propDeskScaling,
        institutionalDeskCoordination:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.institutionalDeskCoordination === 1 || uiSource.repeatableUpgradeBuyModes.institutionalDeskCoordination === 5 || uiSource.repeatableUpgradeBuyModes.institutionalDeskCoordination === 10 || uiSource.repeatableUpgradeBuyModes.institutionalDeskCoordination === 'max')
            ? uiSource.repeatableUpgradeBuyModes.institutionalDeskCoordination
            : initialState.ui.repeatableUpgradeBuyModes.institutionalDeskCoordination,
        hedgeFundExecution:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.hedgeFundExecution === 1 || uiSource.repeatableUpgradeBuyModes.hedgeFundExecution === 5 || uiSource.repeatableUpgradeBuyModes.hedgeFundExecution === 10 || uiSource.repeatableUpgradeBuyModes.hedgeFundExecution === 'max')
            ? uiSource.repeatableUpgradeBuyModes.hedgeFundExecution
            : initialState.ui.repeatableUpgradeBuyModes.hedgeFundExecution,
        investmentFirmOperations:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.investmentFirmOperations === 1 || uiSource.repeatableUpgradeBuyModes.investmentFirmOperations === 5 || uiSource.repeatableUpgradeBuyModes.investmentFirmOperations === 10 || uiSource.repeatableUpgradeBuyModes.investmentFirmOperations === 'max')
            ? uiSource.repeatableUpgradeBuyModes.investmentFirmOperations
            : initialState.ui.repeatableUpgradeBuyModes.investmentFirmOperations,
        ruleBasedExecution:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.ruleBasedExecution === 1 || uiSource.repeatableUpgradeBuyModes.ruleBasedExecution === 5 || uiSource.repeatableUpgradeBuyModes.ruleBasedExecution === 10 || uiSource.repeatableUpgradeBuyModes.ruleBasedExecution === 'max')
            ? uiSource.repeatableUpgradeBuyModes.ruleBasedExecution
            : isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.botDeploymentTuning === 1 || uiSource.repeatableUpgradeBuyModes.botDeploymentTuning === 5 || uiSource.repeatableUpgradeBuyModes.botDeploymentTuning === 10 || uiSource.repeatableUpgradeBuyModes.botDeploymentTuning === 'max')
              ? uiSource.repeatableUpgradeBuyModes.botDeploymentTuning
              : initialState.ui.repeatableUpgradeBuyModes.ruleBasedExecution,
        mlModelDeployment:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.mlModelDeployment === 1 || uiSource.repeatableUpgradeBuyModes.mlModelDeployment === 5 || uiSource.repeatableUpgradeBuyModes.mlModelDeployment === 10 || uiSource.repeatableUpgradeBuyModes.mlModelDeployment === 'max')
            ? uiSource.repeatableUpgradeBuyModes.mlModelDeployment
            : isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.tradingServerThroughput === 1 || uiSource.repeatableUpgradeBuyModes.tradingServerThroughput === 5 || uiSource.repeatableUpgradeBuyModes.tradingServerThroughput === 10 || uiSource.repeatableUpgradeBuyModes.tradingServerThroughput === 'max')
              ? uiSource.repeatableUpgradeBuyModes.tradingServerThroughput
              : initialState.ui.repeatableUpgradeBuyModes.mlModelDeployment,
        aiClusterOrchestration:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.aiClusterOrchestration === 1 || uiSource.repeatableUpgradeBuyModes.aiClusterOrchestration === 5 || uiSource.repeatableUpgradeBuyModes.aiClusterOrchestration === 10 || uiSource.repeatableUpgradeBuyModes.aiClusterOrchestration === 'max')
            ? uiSource.repeatableUpgradeBuyModes.aiClusterOrchestration
            : initialState.ui.repeatableUpgradeBuyModes.aiClusterOrchestration,
        juniorLabProtocols:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.juniorLabProtocols === 1 || uiSource.repeatableUpgradeBuyModes.juniorLabProtocols === 5 || uiSource.repeatableUpgradeBuyModes.juniorLabProtocols === 10 || uiSource.repeatableUpgradeBuyModes.juniorLabProtocols === 'max')
            ? uiSource.repeatableUpgradeBuyModes.juniorLabProtocols
            : initialState.ui.repeatableUpgradeBuyModes.juniorLabProtocols,
        seniorLabMethods:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.seniorLabMethods === 1 || uiSource.repeatableUpgradeBuyModes.seniorLabMethods === 5 || uiSource.repeatableUpgradeBuyModes.seniorLabMethods === 10 || uiSource.repeatableUpgradeBuyModes.seniorLabMethods === 'max')
            ? uiSource.repeatableUpgradeBuyModes.seniorLabMethods
            : initialState.ui.repeatableUpgradeBuyModes.seniorLabMethods,
        rackDensity:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.rackDensity === 1 || uiSource.repeatableUpgradeBuyModes.rackDensity === 5 || uiSource.repeatableUpgradeBuyModes.rackDensity === 10 || uiSource.repeatableUpgradeBuyModes.rackDensity === 'max')
            ? uiSource.repeatableUpgradeBuyModes.rackDensity
            : initialState.ui.repeatableUpgradeBuyModes.rackDensity,
        serverRoomExpansion:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.serverRoomExpansion === 1 || uiSource.repeatableUpgradeBuyModes.serverRoomExpansion === 5 || uiSource.repeatableUpgradeBuyModes.serverRoomExpansion === 10 || uiSource.repeatableUpgradeBuyModes.serverRoomExpansion === 'max')
            ? uiSource.repeatableUpgradeBuyModes.serverRoomExpansion
            : initialState.ui.repeatableUpgradeBuyModes.serverRoomExpansion,
        dataCenterOverbuild:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.dataCenterOverbuild === 1 || uiSource.repeatableUpgradeBuyModes.dataCenterOverbuild === 5 || uiSource.repeatableUpgradeBuyModes.dataCenterOverbuild === 10 || uiSource.repeatableUpgradeBuyModes.dataCenterOverbuild === 'max')
            ? uiSource.repeatableUpgradeBuyModes.dataCenterOverbuild
            : initialState.ui.repeatableUpgradeBuyModes.dataCenterOverbuild,
        cloudFailover:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.cloudFailover === 1 || uiSource.repeatableUpgradeBuyModes.cloudFailover === 5 || uiSource.repeatableUpgradeBuyModes.cloudFailover === 10 || uiSource.repeatableUpgradeBuyModes.cloudFailover === 'max')
            ? uiSource.repeatableUpgradeBuyModes.cloudFailover
            : initialState.ui.repeatableUpgradeBuyModes.cloudFailover,
        behavioralModeling:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.behavioralModeling === 1 || uiSource.repeatableUpgradeBuyModes.behavioralModeling === 5 || uiSource.repeatableUpgradeBuyModes.behavioralModeling === 10 || uiSource.repeatableUpgradeBuyModes.behavioralModeling === 'max')
            ? uiSource.repeatableUpgradeBuyModes.behavioralModeling
            : initialState.ui.repeatableUpgradeBuyModes.behavioralModeling,
        decisionSystems:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.decisionSystems === 1 || uiSource.repeatableUpgradeBuyModes.decisionSystems === 5 || uiSource.repeatableUpgradeBuyModes.decisionSystems === 10 || uiSource.repeatableUpgradeBuyModes.decisionSystems === 'max')
            ? uiSource.repeatableUpgradeBuyModes.decisionSystems
            : initialState.ui.repeatableUpgradeBuyModes.decisionSystems,
        propDeskResearch:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.propDeskResearch === 1 || uiSource.repeatableUpgradeBuyModes.propDeskResearch === 5 || uiSource.repeatableUpgradeBuyModes.propDeskResearch === 10 || uiSource.repeatableUpgradeBuyModes.propDeskResearch === 'max')
            ? uiSource.repeatableUpgradeBuyModes.propDeskResearch
            : initialState.ui.repeatableUpgradeBuyModes.propDeskResearch,
        institutionalAnalytics:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.institutionalAnalytics === 1 || uiSource.repeatableUpgradeBuyModes.institutionalAnalytics === 5 || uiSource.repeatableUpgradeBuyModes.institutionalAnalytics === 10 || uiSource.repeatableUpgradeBuyModes.institutionalAnalytics === 'max')
            ? uiSource.repeatableUpgradeBuyModes.institutionalAnalytics
            : initialState.ui.repeatableUpgradeBuyModes.institutionalAnalytics,
        hedgeFundResearch:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.hedgeFundResearch === 1 || uiSource.repeatableUpgradeBuyModes.hedgeFundResearch === 5 || uiSource.repeatableUpgradeBuyModes.hedgeFundResearch === 10 || uiSource.repeatableUpgradeBuyModes.hedgeFundResearch === 'max')
            ? uiSource.repeatableUpgradeBuyModes.hedgeFundResearch
            : initialState.ui.repeatableUpgradeBuyModes.hedgeFundResearch,
        firmWideSystems:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.firmWideSystems === 1 || uiSource.repeatableUpgradeBuyModes.firmWideSystems === 5 || uiSource.repeatableUpgradeBuyModes.firmWideSystems === 10 || uiSource.repeatableUpgradeBuyModes.firmWideSystems === 'max')
            ? uiSource.repeatableUpgradeBuyModes.firmWideSystems
            : initialState.ui.repeatableUpgradeBuyModes.firmWideSystems,
        signalRefinement:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.signalRefinement === 1 || uiSource.repeatableUpgradeBuyModes.signalRefinement === 5 || uiSource.repeatableUpgradeBuyModes.signalRefinement === 10 || uiSource.repeatableUpgradeBuyModes.signalRefinement === 'max')
            ? uiSource.repeatableUpgradeBuyModes.signalRefinement
            : isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.algorithmRefinement === 1 || uiSource.repeatableUpgradeBuyModes.algorithmRefinement === 5 || uiSource.repeatableUpgradeBuyModes.algorithmRefinement === 10 || uiSource.repeatableUpgradeBuyModes.algorithmRefinement === 'max')
              ? uiSource.repeatableUpgradeBuyModes.algorithmRefinement
              : initialState.ui.repeatableUpgradeBuyModes.signalRefinement,
        mlFeaturePipelines:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.mlFeaturePipelines === 1 || uiSource.repeatableUpgradeBuyModes.mlFeaturePipelines === 5 || uiSource.repeatableUpgradeBuyModes.mlFeaturePipelines === 10 || uiSource.repeatableUpgradeBuyModes.mlFeaturePipelines === 'max')
            ? uiSource.repeatableUpgradeBuyModes.mlFeaturePipelines
            : isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.exchangeColocationModels === 1 || uiSource.repeatableUpgradeBuyModes.exchangeColocationModels === 5 || uiSource.repeatableUpgradeBuyModes.exchangeColocationModels === 10 || uiSource.repeatableUpgradeBuyModes.exchangeColocationModels === 'max')
              ? uiSource.repeatableUpgradeBuyModes.exchangeColocationModels
              : initialState.ui.repeatableUpgradeBuyModes.mlFeaturePipelines,
        aiTrainingSystems:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.aiTrainingSystems === 1 || uiSource.repeatableUpgradeBuyModes.aiTrainingSystems === 5 || uiSource.repeatableUpgradeBuyModes.aiTrainingSystems === 10 || uiSource.repeatableUpgradeBuyModes.aiTrainingSystems === 'max')
            ? uiSource.repeatableUpgradeBuyModes.aiTrainingSystems
            : initialState.ui.repeatableUpgradeBuyModes.aiTrainingSystems,
        juniorLabOptimization:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.juniorLabOptimization === 1 || uiSource.repeatableUpgradeBuyModes.juniorLabOptimization === 5 || uiSource.repeatableUpgradeBuyModes.juniorLabOptimization === 10 || uiSource.repeatableUpgradeBuyModes.juniorLabOptimization === 'max')
            ? uiSource.repeatableUpgradeBuyModes.juniorLabOptimization
            : initialState.ui.repeatableUpgradeBuyModes.juniorLabOptimization,
        seniorLabOptimization:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.seniorLabOptimization === 1 || uiSource.repeatableUpgradeBuyModes.seniorLabOptimization === 5 || uiSource.repeatableUpgradeBuyModes.seniorLabOptimization === 10 || uiSource.repeatableUpgradeBuyModes.seniorLabOptimization === 'max')
            ? uiSource.repeatableUpgradeBuyModes.seniorLabOptimization
            : initialState.ui.repeatableUpgradeBuyModes.seniorLabOptimization,
        energyOptimization:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.energyOptimization === 1 || uiSource.repeatableUpgradeBuyModes.energyOptimization === 5 || uiSource.repeatableUpgradeBuyModes.energyOptimization === 10 || uiSource.repeatableUpgradeBuyModes.energyOptimization === 'max')
            ? uiSource.repeatableUpgradeBuyModes.energyOptimization
            : initialState.ui.repeatableUpgradeBuyModes.energyOptimization,
        serverEfficiency:
          isRecord(uiSource.repeatableUpgradeBuyModes) && (uiSource.repeatableUpgradeBuyModes.serverEfficiency === 1 || uiSource.repeatableUpgradeBuyModes.serverEfficiency === 5 || uiSource.repeatableUpgradeBuyModes.serverEfficiency === 10 || uiSource.repeatableUpgradeBuyModes.serverEfficiency === 'max')
            ? uiSource.repeatableUpgradeBuyModes.serverEfficiency
            : initialState.ui.repeatableUpgradeBuyModes.serverEfficiency,
      },
      researchBranchExpanded: {
        humanCapital:
          isRecord(uiSource.researchBranchExpanded) && typeof uiSource.researchBranchExpanded.humanCapital === 'boolean'
            ? uiSource.researchBranchExpanded.humanCapital
            : initialState.ui.researchBranchExpanded.humanCapital,
        markets:
          isRecord(uiSource.researchBranchExpanded) && typeof uiSource.researchBranchExpanded.markets === 'boolean'
            ? uiSource.researchBranchExpanded.markets
            : initialState.ui.researchBranchExpanded.markets,
        infrastructure:
          isRecord(uiSource.researchBranchExpanded) && typeof uiSource.researchBranchExpanded.infrastructure === 'boolean'
            ? uiSource.researchBranchExpanded.infrastructure
            : initialState.ui.researchBranchExpanded.infrastructure,
        automation:
          isRecord(uiSource.researchBranchExpanded) && typeof uiSource.researchBranchExpanded.automation === 'boolean'
            ? uiSource.researchBranchExpanded.automation
            : initialState.ui.researchBranchExpanded.automation,
        regulation:
          isRecord(uiSource.researchBranchExpanded) && typeof uiSource.researchBranchExpanded.regulation === 'boolean'
            ? uiSource.researchBranchExpanded.regulation
            : initialState.ui.researchBranchExpanded.regulation,
      },
      dismissedSectorUnlocks: {
        finance: true,
        technology:
          isRecord(uiSource.dismissedSectorUnlocks) && typeof uiSource.dismissedSectorUnlocks.technology === 'boolean'
            ? uiSource.dismissedSectorUnlocks.technology
            : false,
        energy:
          isRecord(uiSource.dismissedSectorUnlocks) && typeof uiSource.dismissedSectorUnlocks.energy === 'boolean'
            ? uiSource.dismissedSectorUnlocks.energy
            : false,
      },
      dismissedCapacityFull:
        typeof uiSource.dismissedCapacityFull === 'boolean'
          ? uiSource.dismissedCapacityFull
          : initialState.ui.dismissedCapacityFull,
      prestigePurchasePlan: {
        brandRecognition: isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.brandRecognition === 'number' && uiSource.prestigePurchasePlan.brandRecognition >= 0 ? uiSource.prestigePurchasePlan.brandRecognition : 0,
        seedCapital: isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.seedCapital === 'number' && uiSource.prestigePurchasePlan.seedCapital >= 0 ? uiSource.prestigePurchasePlan.seedCapital : 0,
        betterHiringPipeline: isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.betterHiringPipeline === 'number' && uiSource.prestigePurchasePlan.betterHiringPipeline >= 0 ? uiSource.prestigePurchasePlan.betterHiringPipeline : 0,
        institutionalKnowledge: isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.institutionalKnowledge === 'number' && uiSource.prestigePurchasePlan.institutionalKnowledge >= 0 ? uiSource.prestigePurchasePlan.institutionalKnowledge : 0,
        gridOrchestration: isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.gridOrchestration === 'number' && uiSource.prestigePurchasePlan.gridOrchestration >= 0 ? uiSource.prestigePurchasePlan.gridOrchestration : 0,
        tradeMultiplier: isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.tradeMultiplier === 'number' && uiSource.prestigePurchasePlan.tradeMultiplier >= 0 ? uiSource.prestigePurchasePlan.tradeMultiplier : 0,
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
        quantTrader:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.quantTrader === 1 || uiSource.unitBuyModes.quantTrader === 5 || uiSource.unitBuyModes.quantTrader === 10 || uiSource.unitBuyModes.quantTrader === 'max')
            ? uiSource.unitBuyModes.quantTrader
            : initialState.ui.unitBuyModes.quantTrader,
        propDesk:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.propDesk === 1 || uiSource.unitBuyModes.propDesk === 5 || uiSource.unitBuyModes.propDesk === 10 || uiSource.unitBuyModes.propDesk === 'max')
            ? uiSource.unitBuyModes.propDesk
            : initialState.ui.unitBuyModes.propDesk,
        institutionalDesk:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.institutionalDesk === 1 || uiSource.unitBuyModes.institutionalDesk === 5 || uiSource.unitBuyModes.institutionalDesk === 10 || uiSource.unitBuyModes.institutionalDesk === 'max')
            ? uiSource.unitBuyModes.institutionalDesk
            : initialState.ui.unitBuyModes.institutionalDesk,
        hedgeFund:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.hedgeFund === 1 || uiSource.unitBuyModes.hedgeFund === 5 || uiSource.unitBuyModes.hedgeFund === 10 || uiSource.unitBuyModes.hedgeFund === 'max')
            ? uiSource.unitBuyModes.hedgeFund
            : initialState.ui.unitBuyModes.hedgeFund,
        investmentFirm:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.investmentFirm === 1 || uiSource.unitBuyModes.investmentFirm === 5 || uiSource.unitBuyModes.investmentFirm === 10 || uiSource.unitBuyModes.investmentFirm === 'max')
            ? uiSource.unitBuyModes.investmentFirm
            : initialState.ui.unitBuyModes.investmentFirm,
        ruleBasedBot:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.ruleBasedBot === 1 || uiSource.unitBuyModes.ruleBasedBot === 5 || uiSource.unitBuyModes.ruleBasedBot === 10 || uiSource.unitBuyModes.ruleBasedBot === 'max')
            ? uiSource.unitBuyModes.ruleBasedBot
            : isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.tradingBot === 1 || uiSource.unitBuyModes.tradingBot === 5 || uiSource.unitBuyModes.tradingBot === 10 || uiSource.unitBuyModes.tradingBot === 'max')
              ? uiSource.unitBuyModes.tradingBot
              : initialState.ui.unitBuyModes.ruleBasedBot,
        mlTradingBot:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.mlTradingBot === 1 || uiSource.unitBuyModes.mlTradingBot === 5 || uiSource.unitBuyModes.mlTradingBot === 10 || uiSource.unitBuyModes.mlTradingBot === 'max')
            ? uiSource.unitBuyModes.mlTradingBot
            : isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.tradingServer === 1 || uiSource.unitBuyModes.tradingServer === 5 || uiSource.unitBuyModes.tradingServer === 10 || uiSource.unitBuyModes.tradingServer === 'max')
              ? uiSource.unitBuyModes.tradingServer
              : initialState.ui.unitBuyModes.mlTradingBot,
        aiTradingBot:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.aiTradingBot === 1 || uiSource.unitBuyModes.aiTradingBot === 5 || uiSource.unitBuyModes.aiTradingBot === 10 || uiSource.unitBuyModes.aiTradingBot === 'max')
            ? uiSource.unitBuyModes.aiTradingBot
            : initialState.ui.unitBuyModes.aiTradingBot,
        intern:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.intern === 1 || uiSource.unitBuyModes.intern === 5 || uiSource.unitBuyModes.intern === 10 || uiSource.unitBuyModes.intern === 'max')
            ? uiSource.unitBuyModes.intern
            : initialState.ui.unitBuyModes.intern,
        internResearchScientist:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.internResearchScientist === 1 || uiSource.unitBuyModes.internResearchScientist === 5 || uiSource.unitBuyModes.internResearchScientist === 10 || uiSource.unitBuyModes.internResearchScientist === 'max')
            ? uiSource.unitBuyModes.internResearchScientist
            : initialState.ui.unitBuyModes.internResearchScientist,
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
        juniorPolitician:
          isRecord(uiSource.unitBuyModes) && (uiSource.unitBuyModes.juniorPolitician === 1 || uiSource.unitBuyModes.juniorPolitician === 5 || uiSource.unitBuyModes.juniorPolitician === 10 || uiSource.unitBuyModes.juniorPolitician === 'max')
            ? uiSource.unitBuyModes.juniorPolitician
            : initialState.ui.unitBuyModes.juniorPolitician,
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
