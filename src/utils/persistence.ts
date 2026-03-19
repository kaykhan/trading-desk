import { DEFAULT_AUTOMATION_CONFIG, DEFAULT_AUTOMATION_CYCLE_STATE } from '../data/automation'
import { DEFAULT_GLOBAL_BOOSTS_OWNED, DEFAULT_TIMED_BOOSTS } from '../data/boosts'
import { initialState } from '../data/initialState'
import { LOBBYING_POLICIES } from '../data/lobbyingPolicies'
import { MARKET_EVENT_HISTORY_LIMIT, MARKET_EVENTS } from '../data/marketEvents'
import { PRESTIGE_UPGRADES } from '../data/prestigeUpgrades'
import { REPEATABLE_UPGRADE_IDS, REPEATABLE_UPGRADES } from '../data/repeatableUpgrades'
import { RESEARCH_TECH } from '../data/researchTech'
import { DEFAULT_UNLOCKED_SECTORS, SECTOR_IDS } from '../data/sectors'
import { UPGRADES } from '../data/upgrades'
import { MILESTONES } from '../data/milestones'
import { mechanics } from '../lib/mechanics'
import type { AutomationStrategyId, AutomationUnitId, BuyMode, CompliancePaymentCategoryId, GameState, GenericSectorAssignableUnitId, GlobalBoostId, HumanAssignableUnitId, InstitutionalMandateId, InstitutionalMandateUnitId, LobbyingPolicyId, MarketEventHistoryEntry, MarketEventId, PrestigeUpgradeId, RepeatableUpgradeId, ResearchTechId, SectorId, TimedBoostId, TraderSpecialistUnitId, TraderSpecializationId, UpgradeId } from '../types/game'
import { inferCompliancePaymentsMadeFromState, inferComplianceReviewCountFromState, inferTimedBoostActivationsFromState } from './milestones'

export const SAVE_KEY = mechanics.runtime.save.storageKey

const UPGRADE_IDS = UPGRADES.map((upgrade) => upgrade.id)
const PRESTIGE_UPGRADE_IDS = PRESTIGE_UPGRADES.map((upgrade) => upgrade.id)
const RESEARCH_TECH_IDS = RESEARCH_TECH.map((tech) => tech.id)
const LOBBYING_POLICY_IDS = LOBBYING_POLICIES.map((policy) => policy.id)
const MILESTONE_IDS = MILESTONES.map((milestone) => milestone.id)
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

function isMilestoneId(value: string): boolean {
  return MILESTONE_IDS.includes(value)
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

function isMarketEventId(value: string): value is MarketEventId {
  return value in MARKET_EVENTS
}

function getNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function getBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function isBuyMode(value: unknown): value is BuyMode {
  return value === 1 || value === 5 || value === 10 || value === 'max'
}

function getLegacyRepeatableRank(source: Record<string, unknown>, keys: string[]): number {
  const values = keys
    .map((key) => source[key])
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0)
    .map((value) => Math.floor(value))

  if (values.length === 0) {
    return 0
  }

  return Math.min(100, Math.max(...values))
}

const LEGACY_REPEATABLE_RANK_MIGRATION: Record<RepeatableUpgradeId, string[]> = {
  manualExecutionRefinement: ['manualExecutionRefinement', 'manualTradeRefinement'],
  humanDeskTuning: ['humanDeskTuning', 'internDeskTraining', 'internPlaybooks', 'juniorTraderTraining', 'seniorDeskPerformance', 'behavioralModeling'],
  institutionalProcessRefinement: ['institutionalProcessRefinement', 'propDeskScaling', 'institutionalDeskCoordination', 'hedgeFundExecution', 'investmentFirmOperations', 'propDeskResearch', 'institutionalAnalytics', 'hedgeFundResearch', 'firmWideSystems'],
  sectorAllocationEfficiency: ['sectorAllocationEfficiency'],
  researchThroughput: ['researchThroughput', 'internLabTraining', 'internResearchNotes', 'juniorLabProtocols', 'seniorLabMethods', 'juniorLabOptimization', 'seniorLabOptimization'],
  trainingMethodology: ['trainingMethodology'],
  analyticalModeling: ['analyticalModeling', 'signalRefinement', 'mlFeaturePipelines', 'aiTrainingSystems', 'algorithmRefinement', 'exchangeColocationModels'],
  executionStackTuning: ['executionStackTuning', 'ruleBasedExecution', 'mlModelDeployment', 'aiClusterOrchestration', 'botDeploymentTuning', 'tradingServerThroughput'],
  modelEfficiency: ['modelEfficiency'],
  computeOptimization: ['computeOptimization', 'energyOptimization', 'serverEfficiency'],
  signalQualityControl: ['signalQualityControl', 'signalRefinement', 'mlFeaturePipelines', 'aiTrainingSystems', 'algorithmRefinement', 'exchangeColocationModels'],
  complianceSystems: ['complianceSystems'],
  filingEfficiency: ['filingEfficiency'],
  policyReach: ['policyReach', 'politicalNetworking', 'constituencyResearch'],
  institutionalAccess: ['institutionalAccess'],
}

const LEGACY_REPEATABLE_BUY_MODE_ALIASES: Record<RepeatableUpgradeId, string[]> = {
  manualExecutionRefinement: ['manualTradeRefinement'],
  humanDeskTuning: ['internDeskTraining', 'internPlaybooks', 'juniorTraderTraining', 'seniorDeskPerformance', 'behavioralModeling'],
  institutionalProcessRefinement: ['propDeskScaling', 'institutionalDeskCoordination', 'hedgeFundExecution', 'investmentFirmOperations', 'propDeskResearch', 'institutionalAnalytics', 'hedgeFundResearch', 'firmWideSystems'],
  sectorAllocationEfficiency: [],
  researchThroughput: ['internLabTraining', 'internResearchNotes', 'juniorLabProtocols', 'seniorLabMethods', 'juniorLabOptimization', 'seniorLabOptimization'],
  trainingMethodology: [],
  analyticalModeling: ['signalRefinement', 'mlFeaturePipelines', 'aiTrainingSystems', 'algorithmRefinement', 'exchangeColocationModels'],
  executionStackTuning: ['ruleBasedExecution', 'mlModelDeployment', 'aiClusterOrchestration', 'botDeploymentTuning', 'tradingServerThroughput'],
  modelEfficiency: [],
  computeOptimization: ['energyOptimization', 'serverEfficiency'],
  signalQualityControl: ['signalRefinement', 'mlFeaturePipelines', 'aiTrainingSystems', 'algorithmRefinement', 'exchangeColocationModels'],
  complianceSystems: [],
  filingEfficiency: [],
  policyReach: ['politicalNetworking', 'constituencyResearch'],
  institutionalAccess: [],
}

function normalizeRepeatableUpgradeBuyModes(source: unknown): Record<RepeatableUpgradeId, BuyMode> {
  const sourceRecord = isRecord(source) ? source : {}

  return Object.fromEntries(REPEATABLE_UPGRADE_IDS.map((upgradeId) => {
    const aliases = [upgradeId, ...LEGACY_REPEATABLE_BUY_MODE_ALIASES[upgradeId]]
    const matchedMode = aliases
      .map((alias) => sourceRecord[alias])
      .find((value): value is BuyMode => isBuyMode(value))

    return [upgradeId, matchedMode ?? initialState.ui.repeatableUpgradeBuyModes[upgradeId]]
  })) as Record<RepeatableUpgradeId, BuyMode>
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

function normalizeMarketEventHistory(source: unknown): MarketEventHistoryEntry[] {
  if (!Array.isArray(source)) {
    return []
  }

  return source
    .filter((entry): entry is Record<string, unknown> => isRecord(entry))
    .map((entry) => ({
      eventId: typeof entry.eventId === 'string' && isMarketEventId(entry.eventId) ? entry.eventId : null,
      endedAt: getNumber(entry.endedAt, 0),
      durationSeconds: getNumber(entry.durationSeconds, 0),
    }))
    .filter((entry): entry is MarketEventHistoryEntry => entry.eventId !== null && entry.endedAt >= 0 && entry.durationSeconds > 0)
    .slice(0, MARKET_EVENT_HISTORY_LIMIT)
}

function normalizeCompliancePayments(source: unknown, legacyDueAmount: number): GameState['compliancePayments'] {
  const sourceRecord = isRecord(source) ? source : {}
  const categoryIds: CompliancePaymentCategoryId[] = ['staff', 'energy', 'automation', 'institutional']
  const legacyCarry = legacyDueAmount > 0 ? legacyDueAmount / categoryIds.length : 0

  return Object.fromEntries(categoryIds.map((categoryId) => {
    const entry = isRecord(sourceRecord[categoryId]) ? sourceRecord[categoryId] : {}
    return [categoryId, {
      overdueAmount: Math.max(0, getNumber(entry.overdueAmount, legacyCarry)),
      paidThisCycle: Math.max(0, getNumber(entry.paidThisCycle, 0)),
      lastPayment: Math.max(0, getNumber(entry.lastPayment, 0)),
    }]
  })) as GameState['compliancePayments']
}

function normalizeComplianceAutoPaySettings(source: unknown, legacyValue: boolean): GameState['settings']['complianceAutoPayEnabled'] {
  const sourceRecord = isRecord(source) ? source : {}

  return {
    staff: getBoolean(sourceRecord.staff, legacyValue),
    energy: getBoolean(sourceRecord.energy, legacyValue),
    automation: getBoolean(sourceRecord.automation, legacyValue),
    institutional: getBoolean(sourceRecord.institutional, legacyValue),
  }
}

function normalizeTimedBoosts(source: unknown): GameState['timedBoosts'] {
  const sourceRecord = isRecord(source) ? source : {}
  const boostIds = Object.keys(DEFAULT_TIMED_BOOSTS) as TimedBoostId[]

  return Object.fromEntries(boostIds.map((boostId) => {
    const entry = isRecord(sourceRecord[boostId]) ? sourceRecord[boostId] : {}
    return [boostId, {
      isActive: getBoolean(entry.isActive, DEFAULT_TIMED_BOOSTS[boostId].isActive),
      remainingActiveSeconds: Math.max(0, getNumber(entry.remainingActiveSeconds, DEFAULT_TIMED_BOOSTS[boostId].remainingActiveSeconds)),
      remainingCooldownSeconds: Math.max(0, getNumber(entry.remainingCooldownSeconds, DEFAULT_TIMED_BOOSTS[boostId].remainingCooldownSeconds)),
      autoEnabled: getBoolean(entry.autoEnabled, DEFAULT_TIMED_BOOSTS[boostId].autoEnabled),
    }]
  })) as GameState['timedBoosts']
}

function normalizeGlobalBoostsOwned(source: unknown): GameState['globalBoostsOwned'] {
  const sourceRecord = isRecord(source) ? source : {}
  const boostIds = Object.keys(DEFAULT_GLOBAL_BOOSTS_OWNED) as GlobalBoostId[]

  return Object.fromEntries(boostIds.map((boostId) => [
    boostId,
    getBoolean(sourceRecord[boostId], DEFAULT_GLOBAL_BOOSTS_OWNED[boostId]),
  ])) as GameState['globalBoostsOwned']
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
    ...(isRecord(value.purchasedUpgrades) && value.purchasedUpgrades.hotkeyMacros === true ? { tradeShortcuts: true } : {}),
    ...(isRecord(value.purchasedUpgrades) && value.purchasedUpgrades.marketScanner === true ? { deskAnalytics: true } : {}),
    ...(isRecord(value.purchasedUpgrades) && value.purchasedUpgrades.firmwideDeskStandards === true ? { crossDeskCoordination: true } : {}),
    ...(isRecord(value.purchasedUpgrades) && value.purchasedUpgrades.propDeskMandates === true ? { propDeskOperatingModel: true } : {}),
    ...(isRecord(value.purchasedUpgrades) && value.purchasedUpgrades.institutionalRelationships === true ? { institutionalClientBook: true } : {}),
    ...(isRecord(value.purchasedUpgrades) && value.purchasedUpgrades.fundOfFundsNetwork === true ? { fundStrategyCommittee: true } : {}),
    ...(isRecord(value.purchasedUpgrades) && value.purchasedUpgrades.globalDistribution === true ? { globalDistributionNetwork: true } : {}),
    ...(isRecord(value.purchasedUpgrades) && value.purchasedUpgrades.executionCluster === true ? { modelServingCluster: true } : {}),
    ...(isRecord(value.purchasedUpgrades) && value.purchasedUpgrades.donorRoundtables === true ? { donorNetwork: true } : {}),
  }

  const purchasedPrestigeUpgrades = Object.fromEntries(
    Object.entries(purchasedPrestigeUpgradesSource).filter(
      ([key, entryValue]) =>
        isPrestigeUpgradeId(key) && typeof entryValue === 'number' && Number.isFinite(entryValue) && entryValue >= 0,
    ),
  )

  const migratedPrestigeUpgrades = {
    ...(typeof purchasedPrestigeUpgrades.brandRecognition === 'number' ? { globalRecognition: purchasedPrestigeUpgrades.brandRecognition } : {}),
    ...(typeof purchasedPrestigeUpgrades.seedCapital === 'number' ? { seedCapital: purchasedPrestigeUpgrades.seedCapital } : {}),
    ...(typeof purchasedPrestigeUpgrades.betterHiringPipeline === 'number' ? { betterHiringPipeline: purchasedPrestigeUpgrades.betterHiringPipeline } : {}),
    ...(typeof purchasedPrestigeUpgrades.institutionalKnowledge === 'number' ? { institutionalKnowledge: purchasedPrestigeUpgrades.institutionalKnowledge } : {}),
    ...(typeof purchasedPrestigeUpgrades.gridOrchestration === 'number' ? { gridOrchestration: purchasedPrestigeUpgrades.gridOrchestration } : {}),
    ...(typeof purchasedPrestigeUpgrades.tradeMultiplier === 'number' ? { marketReputation: purchasedPrestigeUpgrades.tradeMultiplier } : {}),
    ...(typeof purchasedPrestigeUpgrades.globalRecognition === 'number' ? { globalRecognition: purchasedPrestigeUpgrades.globalRecognition } : {}),
    ...(typeof purchasedPrestigeUpgrades.complianceFrameworks === 'number' ? { complianceFrameworks: purchasedPrestigeUpgrades.complianceFrameworks } : {}),
    ...(typeof purchasedPrestigeUpgrades.policyCapital === 'number' ? { policyCapital: purchasedPrestigeUpgrades.policyCapital } : {}),
    ...(typeof purchasedPrestigeUpgrades.marketReputation === 'number' ? { marketReputation: purchasedPrestigeUpgrades.marketReputation } : {}),
    ...(typeof purchasedPrestigeUpgrades.deskEfficiency === 'number' ? { deskEfficiency: purchasedPrestigeUpgrades.deskEfficiency } : {}),
    ...(typeof purchasedPrestigeUpgrades.strategicReserves === 'number' ? { strategicReserves: purchasedPrestigeUpgrades.strategicReserves } : {}),
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

  const migratedRepeatableUpgradeRanks = Object.fromEntries(
    REPEATABLE_UPGRADE_IDS
      .map((upgradeId) => {
        const rank = getLegacyRepeatableRank(repeatableUpgradeRanksSource, LEGACY_REPEATABLE_RANK_MIGRATION[upgradeId])
        return rank > 0 ? [upgradeId, rank] : null
      })
      .filter((entry): entry is [RepeatableUpgradeId, number] => entry !== null),
  ) as Partial<Record<RepeatableUpgradeId, number>>

  const migratedPurchasedResearchTech: Partial<Record<ResearchTechId, boolean>> = {
    ...purchasedResearchTech,
    ...(isRecord(value.purchasedUpgrades) && value.purchasedUpgrades.juniorHiringProgram === true ? { foundationsOfFinanceTraining: true } : {}),
    ...(isRecord(value.purchasedUpgrades) && value.purchasedUpgrades.juniorTraderProgram === true ? { juniorTraderProgram: true } : {}),
    ...(isRecord(value.purchasedUpgrades) && value.purchasedUpgrades.seniorRecruitment === true ? { seniorRecruitment: true } : {}),
    ...(isRecord(value.purchasedResearchTech) && value.purchasedResearchTech.quantTradingSystems === true ? { algorithmicTrading: true } : {}),
    ...(isRecord(value.purchasedResearchTech) && value.purchasedResearchTech.serverRackSystems === true ? { serverRoomSystems: true } : {}),
    ...(isRecord(value.purchasedResearchTech) && value.purchasedResearchTech.aiTradingSystems === true ? { cloudInfrastructure: true } : {}),
    ...(getNumber(value.serverRoomCount, 0) > 0 ? { serverRoomSystems: true } : {}),
    ...(getNumber(value.cloudComputeCount, 0) > 0 ? { cloudInfrastructure: true } : {}),
    ...(isRecord(value.purchasedResearchTech) && value.purchasedResearchTech.tradingServers === true ? { aiTradingSystems: true } : {}),
  }

  const unlockedSectors = Object.fromEntries(SECTOR_IDS.map((sectorId) => {
    if (sectorId === 'finance') {
      return [sectorId, true]
    }

    if (sectorId === 'technology') {
      return [sectorId, migratedPurchasedResearchTech.technologyMarkets === true]
    }

    return [sectorId, migratedPurchasedResearchTech.energyMarkets === true]
  })) as Record<SectorId, boolean>

  const traderSpecialists = normalizeTraderSpecialists(value.traderSpecialists, value)
  const institutionMandates = normalizeInstitutionMandates(value.institutionMandates, value)
  const sectorAssignments = normalizeSectorAssignments(value.sectorAssignments, value)
  const automationConfig = normalizeAutomationConfig(value.automationConfig)
  const automationCycleState = normalizeAutomationCycleState(value.automationCycleState)
  const activeMarketEvent = typeof value.activeMarketEvent === 'string' && isMarketEventId(value.activeMarketEvent) ? value.activeMarketEvent : initialState.activeMarketEvent
  const activeMarketEventRemainingSeconds = Math.max(0, getNumber(value.activeMarketEventRemainingSeconds, initialState.activeMarketEventRemainingSeconds))
  const nextMarketEventCooldownSeconds = Math.max(0, getNumber(value.nextMarketEventCooldownSeconds, initialState.nextMarketEventCooldownSeconds))
  const marketEventHistory = normalizeMarketEventHistory(value.marketEventHistory)
  const legacyComplianceReviewDueAmount = Math.max(0, getNumber(value.complianceReviewDueAmount, 0))
  const compliancePayments = normalizeCompliancePayments(value.compliancePayments, legacyComplianceReviewDueAmount)
  const legacyComplianceAutoPayEnabled = getBoolean(settingsSource.complianceAutoPayEnabled, false)
  const timedBoosts = normalizeTimedBoosts(value.timedBoosts)
  const globalBoostsOwned = normalizeGlobalBoostsOwned(value.globalBoostsOwned)
  const unlockedMilestones = Object.fromEntries(
    Object.entries(isRecord(value.unlockedMilestones) ? value.unlockedMilestones : {}).filter(([key, entryValue]) => isMilestoneId(key) && entryValue === true),
  ) as GameState['unlockedMilestones']
  const unlockedMetaMilestones = Object.fromEntries(
    Object.entries(isRecord(value.unlockedMetaMilestones) ? value.unlockedMetaMilestones : {}).filter(([key, entryValue]) => isMilestoneId(key) && entryValue === true),
  ) as GameState['unlockedMetaMilestones']

  const normalizedStateBase = {
    cash: getNumber(value.cash, initialState.cash),
    researchPoints: getNumber(value.researchPoints, initialState.researchPoints),
    influence: getNumber(value.influence, initialState.influence),
    unlockedMilestones,
    unlockedMetaMilestones,
    lifetimeManualTrades: Math.max(0, getNumber(value.lifetimeManualTrades, initialState.lifetimeManualTrades)),
    lifetimeResearchPointsEarned: Math.max(0, getNumber(value.lifetimeResearchPointsEarned, getNumber(value.researchPoints, initialState.lifetimeResearchPointsEarned))),
    totalComplianceReviewsTriggered: Math.max(0, getNumber(value.totalComplianceReviewsTriggered, initialState.totalComplianceReviewsTriggered)),
    totalCompliancePaymentsMade: Math.max(0, getNumber(value.totalCompliancePaymentsMade, initialState.totalCompliancePaymentsMade)),
    complianceTabOpened: getBoolean(value.complianceTabOpened, initialState.complianceTabOpened),
    totalTimedBoostActivations: Math.max(0, getNumber(value.totalTimedBoostActivations, initialState.totalTimedBoostActivations)),
    discoveredLobbying:
      getBoolean(value.discoveredLobbying, initialState.discoveredLobbying)
      || (isRecord(value.purchasedResearchTech) && value.purchasedResearchTech.regulatoryAffairs === true),
    complianceVisible: getBoolean(value.complianceVisible, initialState.complianceVisible),
    complianceReviewRemainingSeconds: Math.max(0, getNumber(value.complianceReviewRemainingSeconds, initialState.complianceReviewRemainingSeconds)),
    compliancePayments,
    lastCompliancePayment: Math.max(0, getNumber(value.lastCompliancePayment, initialState.lastCompliancePayment)),
    timedBoosts,
    globalBoostsOwned,
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
    juniorResearchScientistCount: getNumber(value.juniorResearchScientistCount, getNumber(value.researchComputerScientistCount, initialState.juniorResearchScientistCount)),
    seniorResearchScientistCount: getNumber(value.seniorResearchScientistCount, initialState.seniorResearchScientistCount),
    juniorPoliticianCount: getNumber(value.juniorPoliticianCount, initialState.juniorPoliticianCount),
    serverRackCount: getNumber(value.serverRackCount, getNumber(value.backupGeneratorCount, 0) + getNumber(value.powerContractCount, initialState.serverRackCount)),
    serverRoomCount: getNumber(value.serverRoomCount, initialState.serverRoomCount),
    dataCenterCount: getNumber(value.dataCenterCount, getNumber(value.gridExpansionCount, initialState.dataCenterCount)),
    cloudComputeCount: getNumber(value.cloudComputeCount, initialState.cloudComputeCount),
    activeMarketEvent,
    activeMarketEventRemainingSeconds,
    nextMarketEventCooldownSeconds,
    marketEventHistory,
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
  } satisfies Omit<GameState, 'settings' | 'ui'>

  const normalizedState = {
    ...normalizedStateBase,
    totalComplianceReviewsTriggered: inferComplianceReviewCountFromState(normalizedStateBase as GameState),
    totalCompliancePaymentsMade: inferCompliancePaymentsMadeFromState(normalizedStateBase as GameState),
    totalTimedBoostActivations: inferTimedBoostActivationsFromState(normalizedStateBase as GameState),
  }

  return {
    ...normalizedState,
    settings: {
      autosaveEnabled: getBoolean(settingsSource.autosaveEnabled, initialState.settings.autosaveEnabled),
      complianceAutoPayEnabled: normalizeComplianceAutoPaySettings(settingsSource.complianceAutoPayEnabled, legacyComplianceAutoPayEnabled),
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
      repeatableUpgradeBuyModes: normalizeRepeatableUpgradeBuyModes(uiSource.repeatableUpgradeBuyModes),
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
        boosts:
          isRecord(uiSource.researchBranchExpanded) && typeof uiSource.researchBranchExpanded.boosts === 'boolean'
            ? uiSource.researchBranchExpanded.boosts
            : initialState.ui.researchBranchExpanded.boosts,
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
        globalRecognition: isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.globalRecognition === 'number' && uiSource.prestigePurchasePlan.globalRecognition >= 0 ? uiSource.prestigePurchasePlan.globalRecognition : isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.brandRecognition === 'number' && uiSource.prestigePurchasePlan.brandRecognition >= 0 ? uiSource.prestigePurchasePlan.brandRecognition : 0,
        seedCapital: isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.seedCapital === 'number' && uiSource.prestigePurchasePlan.seedCapital >= 0 ? uiSource.prestigePurchasePlan.seedCapital : 0,
        betterHiringPipeline: isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.betterHiringPipeline === 'number' && uiSource.prestigePurchasePlan.betterHiringPipeline >= 0 ? uiSource.prestigePurchasePlan.betterHiringPipeline : 0,
        institutionalKnowledge: isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.institutionalKnowledge === 'number' && uiSource.prestigePurchasePlan.institutionalKnowledge >= 0 ? uiSource.prestigePurchasePlan.institutionalKnowledge : 0,
        gridOrchestration: isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.gridOrchestration === 'number' && uiSource.prestigePurchasePlan.gridOrchestration >= 0 ? uiSource.prestigePurchasePlan.gridOrchestration : 0,
        complianceFrameworks: isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.complianceFrameworks === 'number' && uiSource.prestigePurchasePlan.complianceFrameworks >= 0 ? uiSource.prestigePurchasePlan.complianceFrameworks : 0,
        policyCapital: isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.policyCapital === 'number' && uiSource.prestigePurchasePlan.policyCapital >= 0 ? uiSource.prestigePurchasePlan.policyCapital : 0,
        marketReputation: isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.marketReputation === 'number' && uiSource.prestigePurchasePlan.marketReputation >= 0 ? uiSource.prestigePurchasePlan.marketReputation : isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.tradeMultiplier === 'number' && uiSource.prestigePurchasePlan.tradeMultiplier >= 0 ? uiSource.prestigePurchasePlan.tradeMultiplier : 0,
        deskEfficiency: isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.deskEfficiency === 'number' && uiSource.prestigePurchasePlan.deskEfficiency >= 0 ? uiSource.prestigePurchasePlan.deskEfficiency : 0,
        strategicReserves: isRecord(uiSource.prestigePurchasePlan) && typeof uiSource.prestigePurchasePlan.strategicReserves === 'number' && uiSource.prestigePurchasePlan.strategicReserves >= 0 ? uiSource.prestigePurchasePlan.strategicReserves : 0,
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
