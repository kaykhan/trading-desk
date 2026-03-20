import { TIMED_BOOSTS } from '../data/boosts'
import { CAPACITY_INFRASTRUCTURE } from '../data/capacity'
import { getLobbyingPolicyDefinition } from '../data/lobbyingPolicies'
import { MILESTONES } from '../data/milestones'
import { POWER_INFRASTRUCTURE } from '../data/powerInfrastructure'
import { PRESTIGE_UPGRADES } from '../data/prestigeUpgrades'
import { getRepeatableUpgradeCost, getRepeatableUpgradeDefinition, REPEATABLE_UPGRADES } from '../data/repeatableUpgrades'
import { getResearchTechDefinition, RESEARCH_TECH } from '../data/researchTech'
import { getUpgradeDefinition } from '../data/upgrades'
import { isAutomationStrategyDefinitionUnlocked, mechanics } from '../lib/mechanics'
import type { AutomationStrategyId, AutomationUnitId, CompliancePaymentCategoryId, GameState, LobbyingPolicyId, MilestoneDefinition, MilestoneRequirement, PowerInfrastructureId, PrestigeUpgradeId, RepeatableUpgradeId, SectorId, TimedBoostId, UnitId, UpgradeId } from '../types/game'
import { canAffordCapacityPower, getBulkCapacityInfrastructureCost, getTotalDeskSlots, getUsedDeskSlots, isCapacityInfrastructureVisible } from '../utils/capacity'
import { payComplianceCategoryNow } from '../utils/compliance'
import { getAutomationBulkCost } from '../utils/automation'
import { getBulkPowerInfrastructureCost, getBulkUnitCost, getCashPerSecond, getInfluencePerSecond, getPowerCapacity, getPowerUsage, getResearchPointsPerSecond, getSectorCashPerSecond, isPowerInfrastructureUnlocked, isUnitUnlocked } from '../utils/economy'
import { getPrestigeGoalNextRankCost } from '../utils/prestige'
import { areResearchTechPrerequisitesMet, isResearchTechUnlocked } from '../utils/research'
import { getGenericInstitutionCount, getInstitutionMandateApplicationCost, getInstitutionMandateResearchUnlockId } from '../utils/mandates'
import { getGenericTraderCount, getSpecializationResearchUnlockId, getTraderSpecialistTrainingCost } from '../utils/specialization'
import { isMilestoneDefinitionMet } from '../utils/milestones'
import { cloneGameState } from './simState'
import type { SimConfig, SimState } from './simState'

const POWER_IDS: PowerInfrastructureId[] = ['serverRack', 'serverRoom', 'dataCenter', 'cloudCompute']
const COMPLIANCE_CATEGORIES: CompliancePaymentCategoryId[] = ['staff', 'energy', 'automation', 'institutional']
function buyUpgrade(game: GameState, upgradeId: UpgradeId): boolean {
  const upgrade = getUpgradeDefinition(upgradeId)

  if (!upgrade || game.purchasedUpgrades[upgradeId]) {
    return false
  }

  if (upgrade.visibleWhen && !upgrade.visibleWhen(game)) {
    return false
  }

  if (game.cash < upgrade.cost) {
    return false
  }

  game.cash -= upgrade.cost
  game.purchasedUpgrades[upgradeId] = true
  return true
}

function buyResearchTech(game: GameState, techId: (typeof RESEARCH_TECH)[number]['id']): boolean {
  const tech = getResearchTechDefinition(techId)

  if (!tech || game.purchasedResearchTech[techId]) {
    return false
  }

  if (!isResearchTechUnlocked(game, techId) || !areResearchTechPrerequisitesMet(game, techId)) {
    return false
  }

  const currencyKey = tech.currency === 'cash' ? 'cash' : 'researchPoints'

  if (game[currencyKey] < tech.researchCost) {
    return false
  }

  game[currencyKey] -= tech.researchCost
  game.purchasedResearchTech[techId] = true
  game.discoveredLobbying ||= techId === 'regulatoryAffairs'

  if (techId === 'technologyMarkets') {
    game.unlockedSectors.technology = true
  }

  if (techId === 'energyMarkets') {
    game.unlockedSectors.energy = true
  }

  return true
}

function buyUnit(game: GameState, unitId: UnitId): boolean {
  if (!isUnitUnlocked(game, unitId)) {
    return false
  }

  const result = unitId === 'quantTrader' || unitId === 'ruleBasedBot' || unitId === 'mlTradingBot' || unitId === 'aiTradingBot'
    ? getAutomationBulkCost(game, unitId as AutomationUnitId, 1)
    : getBulkUnitCost(game, unitId, 1)

  if (result.quantity <= 0 || game.cash < result.totalCost) {
    return false
  }

  game.cash -= result.totalCost

  if (unitId === 'intern') game.internCount += 1
  if (unitId === 'internResearchScientist') game.internResearchScientistCount += 1
  if (unitId === 'juniorTrader') game.juniorTraderCount += 1
  if (unitId === 'juniorResearchScientist') game.juniorResearchScientistCount += 1
  if (unitId === 'seniorTrader') game.seniorTraderCount += 1
  if (unitId === 'seniorResearchScientist') game.seniorResearchScientistCount += 1
  if (unitId === 'propDesk') game.propDeskCount += 1
  if (unitId === 'institutionalDesk') game.institutionalDeskCount += 1
  if (unitId === 'hedgeFund') game.hedgeFundCount += 1
  if (unitId === 'investmentFirm') game.investmentFirmCount += 1
  if (unitId === 'quantTrader') game.quantTraderCount += 1
  if (unitId === 'ruleBasedBot') game.ruleBasedBotCount += 1
  if (unitId === 'mlTradingBot') game.mlTradingBotCount += 1
  if (unitId === 'aiTradingBot') game.aiTradingBotCount += 1
  if (unitId === 'juniorPolitician') game.juniorPoliticianCount += 1
  return true
}

function buyPowerInfrastructure(game: GameState, infrastructureId: PowerInfrastructureId): boolean {
  if (!isPowerInfrastructureUnlocked(game)) {
    return false
  }

  const result = getBulkPowerInfrastructureCost(game, infrastructureId, 1)

  if (result.quantity <= 0 || game.cash < result.totalCost) {
    return false
  }

  game.cash -= result.totalCost
  if (infrastructureId === 'serverRack') game.serverRackCount += 1
  if (infrastructureId === 'serverRoom') game.serverRoomCount += 1
  if (infrastructureId === 'dataCenter') game.dataCenterCount += 1
  if (infrastructureId === 'cloudCompute') game.cloudComputeCount += 1
  return true
}

function buyBestPowerInfrastructure(game: GameState): boolean {
  if (!isPowerInfrastructureUnlocked(game)) {
    return false
  }

  const preferredIds: PowerInfrastructureId[] = []
  if (game.serverRoomCount <= 0) preferredIds.push('serverRoom')
  if (game.dataCenterCount <= 0) preferredIds.push('dataCenter')
  if (game.cloudComputeCount <= 0) preferredIds.push('cloudCompute')

  for (const infrastructureId of preferredIds) {
    if (buyPowerInfrastructure(game, infrastructureId)) {
      return true
    }
  }

  const bestCandidate = POWER_IDS
    .map((id) => {
      const result = getBulkPowerInfrastructureCost(game, id, 1)

      if (result.quantity <= 0 || game.cash < result.totalCost) {
        return null
      }

      return {
        id,
        score: result.totalCost / POWER_INFRASTRUCTURE[id].powerCapacity,
      }
    })
    .filter((candidate): candidate is { id: PowerInfrastructureId; score: number } => candidate !== null)
    .sort((left, right) => left.score - right.score)[0]

  return bestCandidate ? buyPowerInfrastructure(game, bestCandidate.id) : false
}

function buyCapacityInfrastructure(game: GameState, infrastructureId: 'deskSpace' | 'floorSpace' | 'office'): boolean {
  if (!isCapacityInfrastructureVisible(game, infrastructureId)) {
    return false
  }

  const powerUsagePerPurchase = CAPACITY_INFRASTRUCTURE[infrastructureId].powerUsage
  const result = getBulkCapacityInfrastructureCost(game, infrastructureId, 1, powerUsagePerPurchase)

  if (result.quantity <= 0 || game.cash < result.totalCost || !canAffordCapacityPower(game, powerUsagePerPurchase)) {
    return false
  }

  game.cash -= result.totalCost
  if (infrastructureId === 'deskSpace') game.deskSpaceCount += 1
  if (infrastructureId === 'floorSpace') game.floorSpaceCount += 1
  if (infrastructureId === 'office') game.officeCount += 1
  return true
}

function buyMinimumSupportUnits(game: GameState, milestone: MilestoneDefinition | null = null): boolean {
  let changed = false

  if (game.purchasedResearchTech.foundationsOfFinanceTraining && game.internResearchScientistCount < 5 && canBuyOptionalHumanUnit(game, 'internResearchScientist', milestone)) {
    changed = buyUnit(game, 'internResearchScientist') || changed
  }

  if (game.purchasedResearchTech.juniorScientists && game.juniorResearchScientistCount < 5 && canBuyOptionalHumanUnit(game, 'juniorResearchScientist', milestone)) {
    changed = buyUnit(game, 'juniorResearchScientist') || changed
  }

  if (game.purchasedResearchTech.seniorScientists && game.seniorResearchScientistCount < 1 && canBuyOptionalHumanUnit(game, 'seniorResearchScientist', milestone)) {
    changed = buyUnit(game, 'seniorResearchScientist') || changed
  }

  if (game.purchasedResearchTech.regulatoryAffairs && game.juniorPoliticianCount < 1) {
    changed = buyUnit(game, 'juniorPolitician') || changed
  }

  return changed
}

function buyRepeatableUpgrade(game: GameState, upgradeId: RepeatableUpgradeId): boolean {
  const upgrade = getRepeatableUpgradeDefinition(upgradeId)

  if (!upgrade) {
    return false
  }

  if (upgrade.visibleWhen && !upgrade.visibleWhen(game)) {
    return false
  }

  if (upgrade.unlockWhen && !upgrade.unlockWhen(game)) {
    return false
  }

  const currentRank = game.repeatableUpgradeRanks[upgradeId] ?? 0

  if (currentRank >= upgrade.maxRank) {
    return false
  }

  const nextCost = getRepeatableUpgradeCost(upgrade.baseCost, upgrade.costScaling, currentRank)

  if (upgrade.currency === 'cash') {
    if (game.cash < nextCost) return false
    game.cash -= nextCost
  } else if (upgrade.currency === 'researchPoints') {
    if (game.researchPoints < nextCost) return false
    game.researchPoints -= nextCost
  } else {
    if (game.influence < nextCost) return false
    game.influence -= nextCost
  }

  game.repeatableUpgradeRanks[upgradeId] = currentRank + 1
  return true
}

function buyLobbyingPolicy(game: GameState, policyId: LobbyingPolicyId): boolean {
  const policy = getLobbyingPolicyDefinition(policyId)

  if (!policy || game.purchasedPolicies[policyId]) {
    return false
  }

  if (game.purchasedResearchTech.regulatoryAffairs !== true || game.influence < policy.influenceCost) {
    return false
  }

  game.influence -= policy.influenceCost
  game.purchasedPolicies[policyId] = true
  return true
}

function activateTimedBoost(game: GameState, boostId: TimedBoostId): boolean {
  const runtime = game.timedBoosts[boostId]

  if (game.purchasedResearchTech[TIMED_BOOSTS[boostId].unlockResearchTechId] !== true) {
    return false
  }

  if (runtime.isActive || runtime.remainingCooldownSeconds > 0) {
    return false
  }

  game.timedBoosts[boostId] = {
    ...runtime,
    isActive: true,
    remainingActiveSeconds: TIMED_BOOSTS[boostId].durationSeconds,
    remainingCooldownSeconds: 0,
  }
  game.totalTimedBoostActivations += 1
  return true
}

function setAutomationConfig(game: GameState): void {
  const unlockedStrategies: AutomationStrategyId[] = (['meanReversion', 'momentum', 'arbitrage', 'marketMaking', 'scalping'] as const)
    .filter((strategyId) => isAutomationStrategyDefinitionUnlocked(game, strategyId))

  const unlockedSectors: SectorId[] = ['finance', 'technology', 'energy'].filter((sectorId) => game.unlockedSectors[sectorId as SectorId]) as SectorId[]

  if (unlockedStrategies.length <= 0 || unlockedSectors.length <= 0) {
    return
  }

  const assign = (unitId: AutomationUnitId, sector: SectorId, strategyIndex: number) => {
    game.automationConfig[unitId] = {
      marketTarget: sector,
      strategy: unlockedStrategies[Math.min(strategyIndex, unlockedStrategies.length - 1)],
    }
  }

  assign('quantTrader', 'finance', 0)
  assign('ruleBasedBot', unlockedSectors.includes('technology') ? 'technology' : unlockedSectors[0], 1)
  assign('mlTradingBot', unlockedSectors.includes('energy') ? 'energy' : unlockedSectors[0], 2)
  assign('aiTradingBot', unlockedSectors.includes('technology') ? 'technology' : unlockedSectors[0], 3)
}

function clearSectorAssignments(game: GameState): void {
  game.sectorAssignments.intern = { finance: 0, technology: 0, energy: 0 }
  game.sectorAssignments.juniorTrader = { finance: 0, technology: 0, energy: 0 }
  game.sectorAssignments.seniorTrader = { finance: 0, technology: 0, energy: 0 }
  game.sectorAssignments.propDesk = { finance: 0, technology: 0, energy: 0 }
  game.sectorAssignments.institutionalDesk = { finance: 0, technology: 0, energy: 0 }
  game.sectorAssignments.hedgeFund = { finance: 0, technology: 0, energy: 0 }
  game.sectorAssignments.investmentFirm = { finance: 0, technology: 0, energy: 0 }
}

function assignToSector(game: GameState, unitId: keyof GameState['sectorAssignments'], sectorId: SectorId, amount: number): void {
  if (!game.unlockedSectors[sectorId]) {
    return
  }

  const owned = unitId === 'intern'
    ? game.internCount
    : unitId === 'juniorTrader'
      ? game.juniorTraderCount
      : unitId === 'seniorTrader'
        ? game.seniorTraderCount
        : unitId === 'propDesk'
          ? game.propDeskCount
          : unitId === 'institutionalDesk'
            ? game.institutionalDeskCount
            : unitId === 'hedgeFund'
              ? game.hedgeFundCount
              : game.investmentFirmCount

  const assignedTotal = Object.values(game.sectorAssignments[unitId]).reduce((sum, value) => sum + value, 0)
  const available = Math.max(0, owned - assignedTotal)
  const quantity = Math.min(available, Math.max(0, Math.floor(amount)))

  if (quantity > 0) {
    game.sectorAssignments[unitId][sectorId] += quantity
  }
}

function assignAllRemainingToFinance(game: GameState): void {
  assignToSector(game, 'intern', 'finance', game.internCount)
  assignToSector(game, 'juniorTrader', 'finance', game.juniorTraderCount)
  assignToSector(game, 'seniorTrader', 'finance', game.seniorTraderCount)
  assignToSector(game, 'propDesk', 'finance', game.propDeskCount)
  assignToSector(game, 'institutionalDesk', 'finance', game.institutionalDeskCount)
  assignToSector(game, 'hedgeFund', 'finance', game.hedgeFundCount)
  assignToSector(game, 'investmentFirm', 'finance', game.investmentFirmCount)
}

function rebalanceSectors(game: GameState): void {
  clearSectorAssignments(game)

  if (!game.unlockedSectors.finance) {
    return
  }

  if (game.unlockedSectors.technology) {
    assignToSector(game, 'juniorTrader', 'technology', 1)
    assignToSector(game, 'seniorTrader', 'technology', 1)
    assignToSector(game, 'institutionalDesk', 'technology', 1)
  }

  if (game.unlockedSectors.energy) {
    assignToSector(game, 'juniorTrader', 'energy', 1)
    assignToSector(game, 'seniorTrader', 'energy', 1)
    assignToSector(game, 'hedgeFund', 'energy', 1)
  }

  assignToSector(game, 'propDesk', 'finance', 1)
  assignAllRemainingToFinance(game)
}

function focusSectorForMilestone(game: GameState, sectorId: SectorId): void {
  clearSectorAssignments(game)

  if (!game.unlockedSectors[sectorId]) {
    if (game.unlockedSectors.finance) {
      assignAllRemainingToFinance(game)
    }
    return
  }

  assignToSector(game, 'intern', sectorId, game.internCount)
  assignToSector(game, 'juniorTrader', sectorId, game.juniorTraderCount)
  assignToSector(game, 'seniorTrader', sectorId, game.seniorTraderCount)
  assignToSector(game, 'propDesk', sectorId, game.propDeskCount)
  assignToSector(game, 'institutionalDesk', sectorId, game.institutionalDeskCount)
  assignToSector(game, 'hedgeFund', sectorId, game.hedgeFundCount)
  assignToSector(game, 'investmentFirm', sectorId, game.investmentFirmCount)
}

function pushSectorIncomeMilestone(game: GameState, milestone: MilestoneDefinition): boolean {
  if (typeof milestone.targetId !== 'string') {
    return false
  }

  const sectorId = milestone.targetId as SectorId
  focusSectorForMilestone(game, sectorId)

  const targetIncome = milestone.conditionValue ?? 0
  if (getSectorCashPerSecond(game, sectorId) >= targetIncome) {
    return false
  }

  return buyAffordableFromList(
    ['institutionalDesk', 'propDesk', 'seniorTrader', 'juniorTrader', 'intern'] as const,
    (unitId) => buyOrUnlockUnit(game, unitId),
  )
}

function trainSpecialists(game: GameState): void {
  const tryTrain = (specializationId: 'finance' | 'technology' | 'energy') => {
    const unlockId = getSpecializationResearchUnlockId(specializationId)

    if (game.purchasedResearchTech[unlockId] !== true) {
      return
    }

    const availableGeneric = getGenericTraderCount(game, 'seniorTrader')
    const cost = getTraderSpecialistTrainingCost('seniorTrader')

    if (availableGeneric > 0 && game.cash >= cost) {
      game.cash -= cost
      game.traderSpecialists.seniorTrader[specializationId] += 1
    }
  }

  tryTrain('finance')
  tryTrain('technology')
  tryTrain('energy')
}

function applyMandates(game: GameState): void {
  const tryApply = (unitId: 'propDesk' | 'institutionalDesk' | 'hedgeFund', mandateId: 'finance' | 'technology' | 'energy') => {
    const unlockId = getInstitutionMandateResearchUnlockId(mandateId)

    if (game.purchasedResearchTech[unlockId] !== true) {
      return
    }

    const available = getGenericInstitutionCount(game, unitId)
    const cost = getInstitutionMandateApplicationCost(unitId)

    if (available > 0 && game.cash >= cost) {
      game.cash -= cost
      game.institutionMandates[unitId][mandateId] += 1
    }
  }

  tryApply('propDesk', 'finance')
  tryApply('institutionalDesk', 'technology')
  tryApply('hedgeFund', 'energy')
}

function payCompliance(game: GameState): boolean {
  const hasOutstandingCompliance = COMPLIANCE_CATEGORIES.some((category) => game.compliancePayments[category].overdueAmount > 0)
  const complianceDueNow = game.complianceReviewRemainingSeconds <= 0

  if (!game.complianceVisible && game.purchasedResearchTech.regulatoryAffairs !== true && !hasOutstandingCompliance && !complianceDueNow) {
    return false
  }

  game.complianceTabOpened = true
  let paidAny = false

  for (const category of COMPLIANCE_CATEGORIES) {
    if (game.compliancePayments[category].overdueAmount <= 0) {
      continue
    }

    const beforeCash = game.cash
    const result = payComplianceCategoryNow(game, category)
    if (result.cash < beforeCash) {
      game.totalCompliancePaymentsMade += 1
      paidAny = true
    }
    game.cash = result.cash
    game.compliancePayments = result.compliancePayments
    game.lastCompliancePayment = result.lastCompliancePayment
  }

  return paidAny
}

function buyPrestigeUpgrade(game: GameState, upgradeId: PrestigeUpgradeId): boolean {
  const definition = PRESTIGE_UPGRADES.find((upgrade) => upgrade.id === upgradeId)

  if (!definition) {
    return false
  }

  const currentRank = game.purchasedPrestigeUpgrades[upgradeId] ?? 0

  if (currentRank >= definition.maxRank) {
    return false
  }

  const nextCost = getPrestigeGoalNextRankCost(upgradeId, currentRank)

  if (game.reputation < nextCost) {
    return false
  }

  game.reputation -= nextCost
  game.reputationSpent += nextCost
  game.purchasedPrestigeUpgrades[upgradeId] = currentRank + 1
  return true
}

export function performScriptedGrowthActions(state: SimState, config: SimConfig): boolean {
  let performedAnyAction = false
  let actionsTaken = 0
  const game = state.game
  const prestigeMode = state.policyId === 'prestigeAware'

  while (actionsTaken < config.maxActionsPerTick) {
    let changed = false

    for (const unitId of config.unitPriority) {
      if (prestigeMode && unitId === 'internResearchScientist' && game.quantTraderCount <= 0 && game.ruleBasedBotCount <= 0) {
        continue
      }
      if (prestigeMode && unitId === 'juniorResearchScientist' && game.ruleBasedBotCount <= 0) {
        continue
      }
      while (buyUnit(game, unitId)) {
        changed = true
      }
    }

    for (const upgradeId of config.upgradePriority) {
      if (prestigeMode && ['labAutomation', 'researchGrants', 'sharedResearchLibrary', 'backtestingSuite', 'institutionalResearchNetwork', 'crossDisciplinaryModels'].includes(upgradeId)) {
        continue
      }
      changed = buyUpgrade(game, upgradeId) || changed
    }

    for (const techId of config.researchPriority) {
      if (prestigeMode && ['financeSpecialistTraining', 'technologySpecialistTraining', 'energySpecialistTraining', 'researchSprintProtocols'].includes(techId)) {
        continue
      }
      changed = buyResearchTech(game, techId) || changed
    }

    changed = buyMinimumSupportUnits(game) || changed

    if (getUsedDeskSlots(game) >= getTotalDeskSlots(game)) {
      changed = buyCapacityInfrastructure(game, 'deskSpace') || changed
      changed = buyCapacityInfrastructure(game, 'floorSpace') || changed
      changed = buyCapacityInfrastructure(game, 'office') || changed
    }

    while (getPowerUsage(game) > getPowerCapacity(game) && buyBestPowerInfrastructure(game)) {
      changed = true
    }

    setAutomationConfig(game)
    rebalanceSectors(game)
    trainSpecialists(game)
    applyMandates(game)
    changed = payCompliance(game) || changed

    for (const policyId of config.policyPriority) {
      changed = buyLobbyingPolicy(game, policyId) || changed
    }

    for (const boostId of config.timedBoostPriority) {
      changed = activateTimedBoost(game, boostId) || changed
    }

    for (const repeatable of REPEATABLE_UPGRADES) {
      changed = buyRepeatableUpgrade(game, repeatable.id) || changed
    }

    for (const prestigeId of config.prestigePriority) {
      changed = buyPrestigeUpgrade(game, prestigeId) || changed
    }

    if (!changed) {
      break
    }

    performedAnyAction = true
    actionsTaken += 1
  }

  return performedAnyAction
}

function getOwnedCount(game: GameState, unitId: UnitId): number {
  if (unitId === 'intern') return game.internCount
  if (unitId === 'internResearchScientist') return game.internResearchScientistCount
  if (unitId === 'juniorTrader') return game.juniorTraderCount
  if (unitId === 'juniorResearchScientist') return game.juniorResearchScientistCount
  if (unitId === 'seniorTrader') return game.seniorTraderCount
  if (unitId === 'seniorResearchScientist') return game.seniorResearchScientistCount
  if (unitId === 'propDesk') return game.propDeskCount
  if (unitId === 'institutionalDesk') return game.institutionalDeskCount
  if (unitId === 'hedgeFund') return game.hedgeFundCount
  if (unitId === 'investmentFirm') return game.investmentFirmCount
  if (unitId === 'quantTrader') return game.quantTraderCount
  if (unitId === 'ruleBasedBot') return game.ruleBasedBotCount
  if (unitId === 'mlTradingBot') return game.mlTradingBotCount
  if (unitId === 'aiTradingBot') return game.aiTradingBotCount
  return game.juniorPoliticianCount
}

function getOwnedInfrastructureCount(game: GameState, infrastructureId: 'deskSpace' | 'floorSpace' | 'office' | PowerInfrastructureId): number {
  if (infrastructureId === 'deskSpace') return game.deskSpaceCount
  if (infrastructureId === 'floorSpace') return game.floorSpaceCount
  if (infrastructureId === 'office') return game.officeCount
  if (infrastructureId === 'serverRack') return game.serverRackCount
  if (infrastructureId === 'serverRoom') return game.serverRoomCount
  if (infrastructureId === 'dataCenter') return game.dataCenterCount
  return game.cloudComputeCount
}

function getNextUnitCost(game: GameState, unitId: UnitId): number | null {
  if (!isUnitUnlocked(game, unitId)) {
    return null
  }

  const result = unitId === 'quantTrader' || unitId === 'ruleBasedBot' || unitId === 'mlTradingBot' || unitId === 'aiTradingBot'
    ? getAutomationBulkCost(game, unitId as AutomationUnitId, 1)
    : getBulkUnitCost(game, unitId, 1)

  return result.quantity > 0 ? result.totalCost : null
}

function canBuyResearchTech(game: GameState, techId: (typeof RESEARCH_TECH)[number]['id']): boolean {
  const tech = getResearchTechDefinition(techId)

  if (!tech || game.purchasedResearchTech[techId]) {
    return false
  }

  if (!isResearchTechUnlocked(game, techId) || !areResearchTechPrerequisitesMet(game, techId)) {
    return false
  }

  const currencyKey = tech.currency === 'cash' ? 'cash' : 'researchPoints'
  return game[currencyKey] >= tech.researchCost
}

function getCurrentValueScore(game: GameState): number {
  return getCashPerSecond(game) + getResearchPointsPerSecond(game) * 12 + getInfluencePerSecond(game) * 150
}

function scoreSimulationDelta(before: GameState, after: GameState): number {
  const cpsDelta = getCashPerSecond(after) - getCashPerSecond(before)
  const rpsDelta = getResearchPointsPerSecond(after) - getResearchPointsPerSecond(before)
  const ipsDelta = getInfluencePerSecond(after) - getInfluencePerSecond(before)
  const liquidityDelta = (after.cash - before.cash) * 0.00001 + (after.researchPoints - before.researchPoints) * 0.0005
  return cpsDelta + rpsDelta * 12 + ipsDelta * 150 + liquidityDelta
}

function getProgressionBottleneckTargets(game: GameState): { tech: Set<string>; unit: Set<UnitId> } {
  const tech = new Set<string>()
  const unit = new Set<UnitId>()

  if (!game.purchasedResearchTech.foundationsOfFinanceTraining) {
    tech.add('foundationsOfFinanceTraining')
    return { tech, unit }
  }

  if (game.internCount < 5) unit.add('intern')
  if (!game.purchasedResearchTech.juniorTraderProgram) tech.add('juniorTraderProgram')
  if (game.juniorTraderCount < 5) unit.add('juniorTrader')
  if (!game.purchasedResearchTech.seniorRecruitment) tech.add('seniorRecruitment')
  if (game.seniorTraderCount < 5) unit.add('seniorTrader')
  if (!game.purchasedResearchTech.algorithmicTrading) tech.add('algorithmicTrading')
  if (game.quantTraderCount < 1) unit.add('quantTrader')
  if (!game.purchasedResearchTech.serverRackSystems) tech.add('serverRackSystems')
  if (!game.purchasedResearchTech.ruleBasedAutomation) tech.add('ruleBasedAutomation')
  if (game.ruleBasedBotCount < 5) unit.add('ruleBasedBot')
  if (!game.purchasedResearchTech.regulatoryAffairs) tech.add('regulatoryAffairs')
  if (!game.purchasedResearchTech.propDeskOperations) tech.add('propDeskOperations')
  if (game.propDeskCount < 3) unit.add('propDesk')
  if (!game.purchasedResearchTech.institutionalDesks) tech.add('institutionalDesks')
  if (game.institutionalDeskCount < 2) unit.add('institutionalDesk')
  if (!game.purchasedResearchTech.serverRoomSystems) tech.add('serverRoomSystems')
  if (!game.purchasedResearchTech.dataCenterSystems) tech.add('dataCenterSystems')
  if (!game.purchasedResearchTech.machineLearningTrading) tech.add('machineLearningTrading')
  if (game.mlTradingBotCount < 3) unit.add('mlTradingBot')
  if (!game.purchasedResearchTech.aiTradingSystems) tech.add('aiTradingSystems')
  if (!game.purchasedResearchTech.hedgeFundStrategies) tech.add('hedgeFundStrategies')
  if (game.hedgeFundCount < 1) unit.add('hedgeFund')
  if (!game.purchasedResearchTech.investmentFirms) tech.add('investmentFirms')

  return { tech, unit }
}

function getUpcomingTargets(game: GameState, config: SimConfig): { tech: Set<string>; unit: Set<UnitId> } {
  const targetTechIds = new Set<string>()
  const targetUnitIds = new Set<UnitId>()
  const bottlenecks = getProgressionBottleneckTargets(game)

  for (const techId of bottlenecks.tech) {
    targetTechIds.add(techId)
  }

  for (const unitId of bottlenecks.unit) {
    targetUnitIds.add(unitId)
  }

  for (const techId of config.researchPriority) {
    if (!game.purchasedResearchTech[techId] && targetTechIds.size <= 0) {
      targetTechIds.add(techId)
      break
    }
  }

  for (const unitId of config.unitPriority) {
    const owned = getOwnedCount(game, unitId)
    if (owned <= 0 && targetUnitIds.size <= 0) {
      targetUnitIds.add(unitId)
      break
    }
  }

  return { tech: targetTechIds, unit: targetUnitIds }
}

export function performUnlockChasingActions(state: SimState, config: SimConfig): boolean {
  const game = state.game
  const targets = getUpcomingTargets(game, config)
  let acted = false

  for (const techId of config.researchPriority) {
    if (!targets.tech.has(techId)) {
      continue
    }

    if (buyResearchTech(game, techId)) {
      acted = true
      break
    }
  }

  for (const unitId of config.unitPriority) {
    if (!targets.unit.has(unitId)) {
      continue
    }

    if (buyUnit(game, unitId)) {
      acted = true
      break
    }
  }

  if (!acted) {
    acted = performScriptedGrowthActions(state, {
      ...config,
      maxActionsPerTick: Math.min(8, config.maxActionsPerTick),
    })
  }

  acted = buyMinimumSupportUnits(game) || acted

  if (getUsedDeskSlots(game) >= getTotalDeskSlots(game)) {
    acted = buyCapacityInfrastructure(game, 'deskSpace') || acted
    acted = buyCapacityInfrastructure(game, 'floorSpace') || acted
    acted = buyCapacityInfrastructure(game, 'office') || acted
  }

  while (getPowerUsage(game) > getPowerCapacity(game) && buyBestPowerInfrastructure(game)) {
    acted = true
  }

  for (const upgradeId of config.upgradePriority) {
    if (buyUpgrade(game, upgradeId)) {
      acted = true
      break
    }
  }

  setAutomationConfig(game)
  rebalanceSectors(game)
  trainSpecialists(game)
  applyMandates(game)
  acted = payCompliance(game) || acted

  for (const policyId of config.policyPriority) {
    if (buyLobbyingPolicy(game, policyId)) {
      acted = true
      break
    }
  }

  for (const boostId of config.timedBoostPriority) {
    acted = activateTimedBoost(game, boostId) || acted
  }

  return acted
}

type RoiCandidate = {
  kind: 'unit' | 'upgrade' | 'research'
  id: string
  score: number
}

function canAffordSoon(game: GameState, cost: number, secondsWindow = 300): boolean {
  if (cost <= game.cash) {
    return true
  }

  const cps = getCashPerSecond(game)
  return cps > 0 && game.cash + cps * secondsWindow >= cost
}

function getTargetedMilestone(state: SimState) {
  return MILESTONES.find((milestone) => {
    if (milestone.scope !== 'run') {
      return false
    }

    if (state.game.unlockedMilestones[milestone.id] === true) {
      return false
    }

    if ((milestone.requiresMilestones ?? []).some((requiredId) => state.game.unlockedMilestones[requiredId] !== true && state.game.unlockedMetaMilestones[requiredId] !== true)) {
      return false
    }

    return !isMilestoneDefinitionMet(state.game, milestone)
  }) ?? null
}

function buyAffordableFromList<T extends string>(items: readonly T[], attempt: (id: T) => boolean): boolean {
  for (const item of items) {
    if (attempt(item)) {
      return true
    }
  }

  return false
}

function buyResearchPath(game: GameState, techId: (typeof RESEARCH_TECH)[number]['id'], seen: Set<(typeof RESEARCH_TECH)[number]['id']> = new Set()): boolean {
  if (seen.has(techId) || game.purchasedResearchTech[techId]) {
    return false
  }

  seen.add(techId)

  const definition = getResearchTechDefinition(techId)
  if (!definition) {
    return false
  }

  for (const prerequisiteId of definition.prerequisites ?? []) {
    if (!game.purchasedResearchTech[prerequisiteId] && buyResearchPath(game, prerequisiteId, seen)) {
      return true
    }
  }

  return buyResearchTech(game, techId)
}

function buyOrUnlockUnit(game: GameState, unitId: UnitId): boolean {
  if (buyUnit(game, unitId)) {
    return true
  }

  const unlockTechId = mechanics.units[unitId].unlockResearchTechId
  return typeof unlockTechId === 'string' ? buyResearchPath(game, unlockTechId as (typeof RESEARCH_TECH)[number]['id']) : false
}

function canAffordUnit(game: GameState, unitId: UnitId): boolean {
  const result = unitId === 'quantTrader' || unitId === 'ruleBasedBot' || unitId === 'mlTradingBot' || unitId === 'aiTradingBot'
    ? getAutomationBulkCost(game, unitId as AutomationUnitId, 1)
    : getBulkUnitCost(game, unitId, 1)

  return result.quantity > 0 && game.cash >= result.totalCost
}

function getRequiredDeskSlotsForMilestone(game: GameState, milestone: MilestoneDefinition | null): number {
  if (!milestone) {
    return 0
  }

  let reservedSlots = 0

  const reserveHumanUnit = (unitId: UnitId, quantity: number) => {
    if (quantity <= 0) {
      return
    }

    if (unitId === 'intern' || unitId === 'juniorTrader' || unitId === 'seniorTrader' || unitId === 'internResearchScientist' || unitId === 'juniorResearchScientist' || unitId === 'seniorResearchScientist') {
      reservedSlots += quantity
    }
  }

  if (milestone.conditionModel === 'unitCountAtLeast' && typeof milestone.targetId === 'string') {
    const targetUnitId = milestone.targetId as UnitId
    reserveHumanUnit(targetUnitId, Math.max(0, (milestone.conditionValue ?? 0) - getOwnedCount(game, targetUnitId)))
  }

  if (milestone.conditionModel === 'mixedUnitThresholds') {
    for (const [unitId, threshold] of Object.entries(milestone.thresholds ?? {})) {
      reserveHumanUnit(unitId as UnitId, Math.max(0, Number(threshold ?? 0) - getOwnedCount(game, unitId as UnitId)))
    }
  }

  for (const requirement of milestone.requirements ?? []) {
    if (requirement.type !== 'unit') {
      continue
    }

    const unitId = requirement.id as UnitId
    reserveHumanUnit(unitId, Math.max(0, (requirement.quantity ?? 1) - getOwnedCount(game, unitId)))
  }

  return reservedSlots
}

function canBuyOptionalHumanUnit(game: GameState, unitId: UnitId, milestone: MilestoneDefinition | null): boolean {
  if (!(unitId === 'intern' || unitId === 'juniorTrader' || unitId === 'seniorTrader' || unitId === 'internResearchScientist' || unitId === 'juniorResearchScientist' || unitId === 'seniorResearchScientist')) {
    return true
  }

  const availableSlots = Math.max(0, getTotalDeskSlots(game) - getUsedDeskSlots(game))
  const reservedSlots = getRequiredDeskSlotsForMilestone(game, milestone)
  return availableSlots > reservedSlots
}

function canAffordResearchTech(game: GameState, techId: (typeof RESEARCH_TECH)[number]['id']): boolean {
  const tech = getResearchTechDefinition(techId)
  if (!tech) return false
  const currencyKey = tech.currency === 'cash' ? 'cash' : 'researchPoints'
  return game[currencyKey] >= tech.researchCost
}

function buyOrUnlockInfrastructure(game: GameState, infrastructureId: 'deskSpace' | 'floorSpace' | 'office' | PowerInfrastructureId): boolean {
  if (infrastructureId === 'deskSpace' || infrastructureId === 'floorSpace' || infrastructureId === 'office') {
    if (buyCapacityInfrastructure(game, infrastructureId)) {
      return true
    }

    const unlockTechId = mechanics.capacityInfrastructure[infrastructureId].unlockResearchTechId
    return typeof unlockTechId === 'string' ? buyResearchPath(game, unlockTechId as (typeof RESEARCH_TECH)[number]['id']) : false
  }

  if (buyPowerInfrastructure(game, infrastructureId)) {
    return true
  }

  const unlockTechId = mechanics.powerInfrastructure[infrastructureId].unlockResearchTechId
  return typeof unlockTechId === 'string' ? buyResearchPath(game, unlockTechId as (typeof RESEARCH_TECH)[number]['id']) : false
}

function buyBestAvailableResearchInPriority(game: GameState, config: SimConfig, predicate?: (techId: (typeof RESEARCH_TECH)[number]['id']) => boolean): boolean {
  for (const techId of config.researchPriority) {
    if (predicate && !predicate(techId)) {
      continue
    }

    if (buyResearchPath(game, techId)) {
      return true
    }
  }

  return false
}

function buyBestAvailableUnitInPriority(game: GameState, config: SimConfig, predicate?: (unitId: UnitId) => boolean): boolean {
  for (const unitId of config.unitPriority) {
    if (predicate && !predicate(unitId)) {
      continue
    }

    if (buyOrUnlockUnit(game, unitId)) {
      return true
    }
  }

  return false
}

function buyBestAvailableUpgradeInPriority(game: GameState, config: SimConfig, predicate?: (upgradeId: UpgradeId) => boolean): boolean {
  for (const upgradeId of config.upgradePriority) {
    if (predicate && !predicate(upgradeId)) {
      continue
    }

    if (buyUpgrade(game, upgradeId)) {
      return true
    }
  }

  return false
}

function buyBestAvailablePolicyInPriority(game: GameState, config: SimConfig): boolean {
  for (const policyId of config.policyPriority) {
    if (buyLobbyingPolicy(game, policyId)) {
      return true
    }
  }

  return false
}

function ensureCapacityAndPower(game: GameState): boolean {
  let acted = false

  if (getUsedDeskSlots(game) >= getTotalDeskSlots(game)) {
    acted = buyCapacityInfrastructure(game, 'deskSpace') || acted
    acted = buyCapacityInfrastructure(game, 'floorSpace') || acted
    acted = buyCapacityInfrastructure(game, 'office') || acted
  }

  while (getPowerUsage(game) > getPowerCapacity(game) && buyBestPowerInfrastructure(game)) {
    acted = true
  }

  return acted
}

function maybeReserveDeskCapacityForMilestone(game: GameState, milestone: MilestoneDefinition | null): boolean {
  const reservedSlots = getRequiredDeskSlotsForMilestone(game, milestone)
  if (reservedSlots <= 0) {
    return false
  }

  const availableSlots = Math.max(0, getTotalDeskSlots(game) - getUsedDeskSlots(game))
  if (availableSlots >= reservedSlots) {
    return false
  }

  return buyCapacityInfrastructure(game, 'deskSpace') || buyCapacityInfrastructure(game, 'floorSpace') || buyCapacityInfrastructure(game, 'office')
}

function applyPassiveSimManagement(game: GameState, config: SimConfig, milestone: MilestoneDefinition | null): boolean {
  let acted = false
  acted = maybeReserveDeskCapacityForMilestone(game, milestone) || acted
  acted = ensureCapacityAndPower(game) || acted
  setAutomationConfig(game)
  if (milestone?.conditionModel !== 'sectorIncomeAtLeast') {
    rebalanceSectors(game)
  }

  if (milestone?.category === 'specialization') {
    trainSpecialists(game)
    applyMandates(game)
  }

  acted = payCompliance(game) || acted

  if (milestone?.category === 'boosts' || milestone?.conditionModel === 'timedBoostActivationsAtLeast') {
    for (const boostId of config.timedBoostPriority) {
      acted = activateTimedBoost(game, boostId) || acted
    }
  }

  return acted
}

function buyBoostSupport(game: GameState): boolean {
  return buyAffordableFromList(
    ['researchSprintProtocols', 'aggressiveTradingWindowProtocols', 'deployReserveCapitalProtocols'] as const,
    (techId) => buyResearchPath(game, techId),
  )
}


function buyThresholdUnitsForMilestone(game: GameState, milestone: MilestoneDefinition): boolean {
  if (milestone.id === 'firstIntern' || milestone.id === 'smallTeam' || milestone.id === 'tenInterns') {
    return buyOrUnlockUnit(game, 'intern')
  }

  if (milestone.id === 'firstJuniorTrader' || milestone.id === 'juniorDesk' || milestone.id === 'tenJuniors') {
    return buyOrUnlockUnit(game, 'juniorTrader')
  }

  if (milestone.id === 'firstSeniorTrader' || milestone.id === 'threeSeniors') {
    return buyOrUnlockUnit(game, 'seniorTrader')
  }

  if (milestone.id === 'firstInternScientist' || milestone.id === 'fiveInternScientists') {
    return buyOrUnlockUnit(game, 'internResearchScientist')
  }

  if (milestone.conditionModel === 'unitCountAtLeast' && typeof milestone.targetId === 'string') {
    const targetUnitId = milestone.targetId as UnitId
    const targetCount = milestone.conditionValue ?? 0
    if (getOwnedCount(game, targetUnitId) < targetCount) {
      return buyOrUnlockUnit(game, targetUnitId)
    }
  }

    if (milestone.conditionModel === 'humanCountAtLeast') {
      const target = milestone.conditionValue ?? 0
      const current = game.internCount + game.juniorTraderCount + game.seniorTraderCount
      if (current < target) {
        const missing = target - current
        if (game.internCount < 10 && canBuyOptionalHumanUnit(game, 'intern', milestone)) {
          return buyOrUnlockUnit(game, 'intern')
        }

        if (game.juniorTraderCount < 10 && canBuyOptionalHumanUnit(game, 'juniorTrader', milestone)) {
          return buyOrUnlockUnit(game, 'juniorTrader')
        }

        if (missing > 0 && canBuyOptionalHumanUnit(game, 'seniorTrader', milestone)) {
          return buyOrUnlockUnit(game, 'seniorTrader')
        }
      }
    }

  return false
}

function satisfyMilestoneRequirement(game: GameState, requirement: MilestoneRequirement): boolean {
  const targetQuantity = Math.max(1, requirement.quantity ?? 1)

  if (requirement.type === 'researchTech') {
    return buyResearchPath(game, requirement.id as (typeof RESEARCH_TECH)[number]['id'])
  }

  if (requirement.type === 'unit') {
    const unitId = requirement.id as UnitId
    return getOwnedCount(game, unitId) < targetQuantity ? buyOrUnlockUnit(game, unitId) : false
  }

  if (requirement.type === 'capacityInfrastructure' || requirement.type === 'powerInfrastructure') {
    const infrastructureId = requirement.id as 'deskSpace' | 'floorSpace' | 'office' | PowerInfrastructureId
    return getOwnedInfrastructureCount(game, infrastructureId) < targetQuantity ? buyOrUnlockInfrastructure(game, infrastructureId) : false
  }

  if (requirement.type === 'upgrade') {
    return buyUpgrade(game, requirement.id as UpgradeId)
  }

  return buyLobbyingPolicy(game, requirement.id as LobbyingPolicyId)
}

function satisfyMilestoneRequirements(game: GameState, milestone: MilestoneDefinition): boolean {
  for (const requirement of milestone.requirements ?? []) {
    if (requirement.type === 'researchTech' && game.purchasedResearchTech[requirement.id as (typeof RESEARCH_TECH)[number]['id']] === true) {
      continue
    }

    if (requirement.type === 'unit' && getOwnedCount(game, requirement.id as UnitId) >= (requirement.quantity ?? 1)) {
      continue
    }

    if ((requirement.type === 'capacityInfrastructure' || requirement.type === 'powerInfrastructure') && getOwnedInfrastructureCount(game, requirement.id as 'deskSpace' | 'floorSpace' | 'office' | PowerInfrastructureId) >= (requirement.quantity ?? 1)) {
      continue
    }

    if (requirement.type === 'upgrade' && game.purchasedUpgrades[requirement.id as UpgradeId] === true) {
      continue
    }

    if (requirement.type === 'policy' && game.purchasedPolicies[requirement.id as LobbyingPolicyId] === true) {
      continue
    }

    return satisfyMilestoneRequirement(game, requirement)
  }

  return false
}

function actForMilestone(state: SimState, config: SimConfig): boolean {
  const game = state.game
  const milestone = getTargetedMilestone(state)

  if (!milestone) {
    return false
  }

  if (satisfyMilestoneRequirements(game, milestone)) {
    return true
  }

  switch (milestone.conditionModel) {
    case 'manualTradesAtLeast':
    case 'lifetimeResearchAtLeast':
    case 'complianceReviewsAtLeast':
    case 'timedBoostActivationsAtLeast':
    case 'reputationSpentAtLeast':
    case 'prestigeRanksPurchasedAtLeast':
    case 'optimisationRanksAtLeast':
      return false
    case 'prestigeCountAtLeast':
      return buyResearchPath(game, 'algorithmicTrading') || buyOrUnlockUnit(game, 'quantTrader') || buyResearchPath(game, 'ruleBasedAutomation') || buyOrUnlockUnit(game, 'ruleBasedBot')
    case 'researchUnlocked':
      return buyResearchPath(game, 'foundationsOfFinanceTraining')
    case 'researchTechPurchased':
      return typeof milestone.targetId === 'string' ? buyResearchPath(game, milestone.targetId as (typeof RESEARCH_TECH)[number]['id']) : false
    case 'unitCountAtLeast':
      return typeof milestone.targetId === 'string' ? buyOrUnlockUnit(game, milestone.targetId as UnitId) : false
    case 'infrastructureCountAtLeast':
      if (milestone.targetId === 'deskSpace' || milestone.targetId === 'floorSpace' || milestone.targetId === 'office') {
        return buyOrUnlockInfrastructure(game, milestone.targetId)
      }

      if (typeof milestone.targetId === 'string') {
        return buyOrUnlockInfrastructure(game, milestone.targetId as PowerInfrastructureId)
      }

      return false
    case 'oneTimeUpgradesPurchasedAtLeast':
      return buyBestAvailableUpgradeInPriority(game, config)
    case 'mixedUnitThresholds': {
      const thresholds = milestone.thresholds ?? {}
      for (const unitId of Object.keys(thresholds) as UnitId[]) {
        const target = thresholds[unitId] ?? 0
        if (getOwnedCount(game, unitId) < target && buyOrUnlockUnit(game, unitId)) {
          return true
        }
      }
      return false
    }
    case 'deskOrDeskPlusInstitutionIncomeAtLeast':
      return buyAffordableFromList(
        ['seniorTrader', 'juniorTrader', 'intern'] as const,
        (unitId) => canBuyOptionalHumanUnit(game, unitId, milestone) && buyOrUnlockUnit(game, unitId),
      )
    case 'humanCountAtLeast':
      return buyBestAvailableUnitInPriority(game, config, (unitId) => (unitId === 'intern' || unitId === 'juniorTrader' || unitId === 'seniorTrader') && canBuyOptionalHumanUnit(game, unitId, milestone))
    case 'researchNodesPurchasedAtLeast':
      return buyBestAvailableResearchInPriority(game, config)
    case 'effectiveServerRackCountAtLeast':
      return buyOrUnlockInfrastructure(game, 'serverRack')
    case 'assignedUnitsAtLeast':
    case 'activeAssignedSectorsAtLeast':
      rebalanceSectors(game)
      return false
    case 'sectorIncomeAtLeast':
      return pushSectorIncomeMilestone(game, milestone)
    case 'specialistResearchUnlockedAtLeast':
      return buyAffordableFromList(
        ['financeSpecialistTraining', 'technologySpecialistTraining', 'energySpecialistTraining'] as const,
        (techId) => buyResearchPath(game, techId),
      )
    case 'specialistsAtLeast':
    case 'correctSpecialistAssignmentsAtLeast':
      trainSpecialists(game)
      return false
    case 'automationStrategiesUnlockedAtLeast':
      return buyAffordableFromList(
        ['meanReversionModels', 'momentumModels', 'arbitrageEngine', 'marketMakingEngine', 'scalpingFramework'] as const,
        (techId) => buyResearchPath(game, techId),
      )
    case 'configuredAutomationClassesAtLeast':
      setAutomationConfig(game)
      return false
    case 'upgradesPurchasedInGroupAtLeast':
      return buyBestAvailableUpgradeInPriority(game, config, (upgradeId) => getUpgradeDefinition(upgradeId)?.group === milestone.targetId)
    case 'sectorUnlocked':
    case 'unlockedSectorsAtLeast':
      return buyAffordableFromList(
        ['technologyMarkets', 'energyMarkets'] as const,
        (techId) => buyResearchPath(game, techId),
      )
    case 'lobbyingUnlockedOrDiscovered':
      return buyResearchPath(game, 'regulatoryAffairs')
    case 'purchasedPoliciesAtLeast':
      return buyBestAvailablePolicyInPriority(game, config)
    case 'mandateResearchUnlockedAtLeast':
      return buyAffordableFromList(
        ['financeMandateFramework', 'techGrowthMandateFramework', 'energyExposureFramework'] as const,
        (techId) => buyResearchPath(game, techId),
      )
    case 'mandatedInstitutionsAtLeast':
    case 'correctMandateAssignmentsAtLeast':
      applyMandates(game)
      rebalanceSectors(game)
      return false
    case 'automationCountAtLeast':
      return buyAffordableFromList(
        ['quantTrader', 'ruleBasedBot', 'mlTradingBot', 'aiTradingBot'] as const,
        (unitId) => buyOrUnlockUnit(game, unitId),
      )
    case 'anyTimedBoostUnlocked':
      return buyBoostSupport(game)
    case 'ownedGlobalBoostsAtLeast':
      return false
    case 'optimisationRanksByFamilyAtLeast':
      return false
    case 'firstCompliancePayment':
      return payCompliance(game)
    default:
      return false
  }
}

export function performMilestoneGuidedActions(state: SimState, config: SimConfig): boolean {
  let acted = false
  let actionsTaken = 0

  while (actionsTaken < config.maxActionsPerTick) {
    const game = state.game
    const milestone = getTargetedMilestone(state)
    let changed = false

    changed = actForMilestone(state, config) || changed
    changed = applyPassiveSimManagement(game, config, milestone) || changed

    if (!changed && milestone) {
      changed = buyThresholdUnitsForMilestone(game, milestone)
    }

    if (!changed) {
      break
    }

    acted = true
    actionsTaken += 1
  }

  return acted
}

export function getPolicyBottleneckSummary(state: SimState): string[] {
  const game = state.game
  const blockers: string[] = []
  const targetedMilestone = getTargetedMilestone(state)

  if (targetedMilestone?.id === 'firstSeniorTrader') {
    if (!game.purchasedResearchTech.seniorRecruitment) {
      const definition = getResearchTechDefinition('seniorRecruitment')
      const current = game.juniorTraderCount
      const required = 5
      if (current < required) {
        blockers.push(`target ${targetedMilestone.name}: needs ${required} junior traders (${current}/${required}) before senior recruitment is unlockable`)
      }

      if (definition && !canAffordResearchTech(game, 'seniorRecruitment')) {
        blockers.push(`target ${targetedMilestone.name}: senior recruitment costs ${Math.floor(definition.researchCost).toLocaleString()} cash, cash is ${Math.floor(game.cash).toLocaleString()}`)
      }
    } else if (!canAffordUnit(game, 'seniorTrader')) {
      const cost = getNextUnitCost(game, 'seniorTrader')
      blockers.push(`target ${targetedMilestone.name}: next senior trader costs ${Math.floor(cost ?? 0).toLocaleString()}, cash is ${Math.floor(game.cash).toLocaleString()}`)
    } else {
      blockers.push(`target ${targetedMilestone.name}: senior trader is affordable and unlocked, but policy step made no purchase`)
    }

    const reservedSlots = getRequiredDeskSlotsForMilestone(game, targetedMilestone)
    if (getUsedDeskSlots(game) >= getTotalDeskSlots(game)) {
      blockers.push(`target ${targetedMilestone.name}: desk capacity capped at ${getUsedDeskSlots(game)}/${getTotalDeskSlots(game)} with ${reservedSlots} slots reserved for current chain`)
    }
  }

  const prestigeLifetimeCashRequirement = Number(mechanics.constants.prestigeUnlockLifetimeCash ?? mechanics.prestige.unlockRequirements.lifetimeCashAtLeast ?? 0)
  if (game.lifetimeCashEarned < prestigeLifetimeCashRequirement) {
    blockers.push(`prestige locked by lifetime cash ${Math.floor(game.lifetimeCashEarned).toLocaleString()}/${Math.floor(prestigeLifetimeCashRequirement).toLocaleString()}`)
  }

  if (game.seniorTraderCount < 5) {
    const cost = getNextUnitCost(game, 'seniorTrader')
    blockers.push(`automation gate needs 5 senior traders (${game.seniorTraderCount}/5)${cost ? `, next costs ${Math.floor(cost).toLocaleString()}` : ''}`)
  }

  if (!game.purchasedResearchTech.algorithmicTrading) {
    blockers.push('automation gate missing research `algorithmicTrading`')
  }

  if (!game.purchasedResearchTech.ruleBasedAutomation) {
    blockers.push('automation gate missing research `ruleBasedAutomation`')
  }

  if (game.ruleBasedBotCount < 5) {
    const cost = getNextUnitCost(game, 'ruleBasedBot')
    blockers.push(`mid-machine gate needs 5 rule bots (${game.ruleBasedBotCount}/5)${cost ? `, next costs ${Math.floor(cost).toLocaleString()}` : ''}`)
  }

  if (!game.purchasedResearchTech.regulatoryAffairs) {
    blockers.push('lobbying gate missing research `regulatoryAffairs`')
  }

  if (game.propDeskCount < 3) {
    const cost = getNextUnitCost(game, 'propDesk')
    blockers.push(`institution gate needs 3 prop desks (${game.propDeskCount}/3)${cost ? `, next costs ${Math.floor(cost).toLocaleString()}` : ''}`)
  }

  if (!game.purchasedResearchTech.serverRoomSystems) {
    blockers.push('infrastructure gate missing research `serverRoomSystems`')
  }

  if (getPowerUsage(game) > getPowerCapacity(game) * 0.95) {
    blockers.push(`power nearly capped at ${getPowerUsage(game).toFixed(1)}/${getPowerCapacity(game).toFixed(1)}`)
  }

  if (getUsedDeskSlots(game) >= getTotalDeskSlots(game)) {
    blockers.push(`desk capacity capped at ${getUsedDeskSlots(game)}/${getTotalDeskSlots(game)}`)
  }

  return blockers.slice(0, 6)
}

export function performRoiActions(state: SimState, config: SimConfig): boolean {
  const game = state.game
  const candidates: RoiCandidate[] = []
  const baselineValue = getCurrentValueScore(game)

  const addCandidate = (kind: RoiCandidate['kind'], id: string, cost: number, apply: (simulated: GameState) => boolean) => {
    if (cost <= 0) {
      return
    }

    const simulated = cloneGameState(game)
    const success = apply(simulated)

    if (!success) {
      return
    }

    setAutomationConfig(simulated)
    rebalanceSectors(simulated)
    const deltaScore = scoreSimulationDelta(game, simulated)
    const totalScore = (getCurrentValueScore(simulated) - baselineValue) + deltaScore
    candidates.push({ kind, id, score: totalScore / cost })
  }

  for (const unitId of config.unitPriority) {
    const cost = getNextUnitCost(game, unitId)
    if (cost && game.cash >= cost) {
      addCandidate('unit', unitId, cost, (simulated) => buyUnit(simulated, unitId))
    }
  }

  for (const upgradeId of config.upgradePriority) {
    const upgrade = getUpgradeDefinition(upgradeId)
    if (upgrade && !game.purchasedUpgrades[upgradeId] && (!upgrade.visibleWhen || upgrade.visibleWhen(game)) && game.cash >= upgrade.cost) {
      addCandidate('upgrade', upgradeId, upgrade.cost, (simulated) => buyUpgrade(simulated, upgradeId))
    }
  }

  for (const techId of config.researchPriority) {
    const tech = getResearchTechDefinition(techId)
    if (!tech || !canBuyResearchTech(game, techId)) {
      continue
    }

    addCandidate('research', techId, tech.researchCost, (simulated) => buyResearchTech(simulated, techId))
  }

  const bottlenecks = getProgressionBottleneckTargets(game)
  for (const techId of bottlenecks.tech) {
    const tech = getResearchTechDefinition(techId as (typeof RESEARCH_TECH)[number]['id'])
    if (tech && canBuyResearchTech(game, tech.id)) {
      addCandidate('research', tech.id, Math.max(1, tech.researchCost * 0.5), (simulated) => buyResearchTech(simulated, tech.id))
    }
  }

  for (const unitId of bottlenecks.unit) {
    const cost = getNextUnitCost(game, unitId)
    if (cost && game.cash >= cost) {
      addCandidate('unit', unitId, Math.max(1, cost * 0.5), (simulated) => buyUnit(simulated, unitId))
    }
  }

  const best = candidates.sort((left, right) => right.score - left.score)[0]

  let acted = false
  if (best?.kind === 'unit') acted = buyUnit(game, best.id as UnitId)
  if (best?.kind === 'upgrade') acted = buyUpgrade(game, best.id as UpgradeId)
  if (best?.kind === 'research') acted = buyResearchTech(game, best.id as (typeof RESEARCH_TECH)[number]['id'])

  acted = buyMinimumSupportUnits(game) || acted
  if (!acted) {
    acted = performUnlockChasingActions(state, {
      ...config,
      maxActionsPerTick: Math.min(6, config.maxActionsPerTick),
    })
  }
  setAutomationConfig(game)
  rebalanceSectors(game)
  trainSpecialists(game)
  applyMandates(game)
  acted = payCompliance(game) || acted
  for (const boostId of config.timedBoostPriority) {
    acted = activateTimedBoost(game, boostId) || acted
  }
  return acted
}
