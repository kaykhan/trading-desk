import { getBulkRepeatableUpgradeCost, getMaxAffordableRepeatableUpgradeQuantity, getRepeatableUpgradeCost as getRepeatableUpgradeScaledCost, getRepeatableUpgradeDefinition, getRepeatableUpgradeMultiplier, getRepeatableUpgradeRank as getRepeatableRank } from '../data/repeatableUpgrades'
import { getAiTradingBotCost, getAiTradingBotPowerUsage, getBulkPowerInfrastructureCost, getBulkUnitCost, getCashPerSecond, getGlobalMultiplier, getHumanTradingPowerUsage, getIncomeBreakdown, getInfluencePerSecond, getInternCost, getInternResearchScientistCost, getJuniorResearchScientistCost, getJuniorTraderCost, getMachineEfficiencyMultiplier, getManualIncome, getMlTradingBotCost, getMlTradingBotPowerUsage, getNextPowerInfrastructureCost, getNextUnitCost, getPowerCapacity, getPowerUsage, getPrestigeMultiplier, getResearchPointsPerSecond, getRuleBasedBotCost, getRuleBasedBotPowerUsage, getSeniorResearchScientistCost, getSeniorTraderCost, isPowerInfrastructureUnlocked, isUnitUnlocked } from '../utils/economy'
import { getLobbyingPolicyDefinition } from '../data/lobbyingPolicies'
import { getPrestigeUpgradeDefinition } from '../data/prestigeUpgrades'
import { getResearchTechDefinition } from '../data/researchTech'
import { getUpgradeDefinition } from '../data/upgrades'
import { canPrestige, getLifetimeReputation, getPrestigeGain, getSeedCapitalBonus } from '../utils/prestige'
import { getProgressionSummary } from '../utils/progression'
import type { GameState, LobbyingPolicyId, PowerInfrastructureId, PrestigeUpgradeId, RepeatableUpgradeId, ResearchTechId, UnitId, UpgradeId } from '../types/game'

export const selectors = {
  cashPerClick: (state: GameState) => getManualIncome(state),
  cashPerSecond: (state: GameState) => getCashPerSecond(state),
  researchPoints: (state: GameState) => state.researchPoints,
  researchPointsPerSecond: (state: GameState) => getResearchPointsPerSecond(state),
  influence: (state: GameState) => state.influence,
  influencePerSecond: (state: GameState) => getInfluencePerSecond(state),
  powerUsage: (state: GameState) => getPowerUsage(state),
  ruleBasedBotPowerUsage: (state: GameState) => getRuleBasedBotPowerUsage(state),
  mlTradingBotPowerUsage: (state: GameState) => getMlTradingBotPowerUsage(state),
  aiTradingBotPowerUsage: (state: GameState) => getAiTradingBotPowerUsage(state),
  humanTradingPowerUsage: (state: GameState) => getHumanTradingPowerUsage(state),
  powerCapacity: (state: GameState) => getPowerCapacity(state),
  machineEfficiencyMultiplier: (state: GameState) => getMachineEfficiencyMultiplier(state),
  juniorIncome: (state: GameState) => getIncomeBreakdown(state).juniorIncome,
  internIncome: (state: GameState) => getIncomeBreakdown(state).internIncome,
  seniorIncome: (state: GameState) => getIncomeBreakdown(state).seniorIncome,
  propDeskIncome: (state: GameState) => getIncomeBreakdown(state).propDeskIncome,
  institutionalDeskIncome: (state: GameState) => getIncomeBreakdown(state).institutionalDeskIncome,
  hedgeFundIncome: (state: GameState) => getIncomeBreakdown(state).hedgeFundIncome,
  investmentFirmIncome: (state: GameState) => getIncomeBreakdown(state).investmentFirmIncome,
  ruleBasedBotIncome: (state: GameState) => getIncomeBreakdown(state).ruleBasedBotIncome,
  mlTradingBotIncome: (state: GameState) => getIncomeBreakdown(state).mlTradingBotIncome,
  aiTradingBotIncome: (state: GameState) => getIncomeBreakdown(state).aiTradingBotIncome,
  globalMultiplier: (state: GameState) => getGlobalMultiplier(state),
  prestigeMultiplier: (state: GameState) => getPrestigeMultiplier(state),
  nextInternCost: (state: GameState) => getInternCost(state),
  nextJuniorTraderCost: (state: GameState) => getJuniorTraderCost(state),
  nextSeniorTraderCost: (state: GameState) => getSeniorTraderCost(state),
  nextRuleBasedBotCost: (state: GameState) => getRuleBasedBotCost(state),
  nextMlTradingBotCost: (state: GameState) => getMlTradingBotCost(state),
  nextAiTradingBotCost: (state: GameState) => getAiTradingBotCost(state),
  nextInternResearchScientistCost: (state: GameState) => getInternResearchScientistCost(state),
  nextJuniorResearchScientistCost: (state: GameState) => getJuniorResearchScientistCost(state),
  nextSeniorResearchScientistCost: (state: GameState) => getSeniorResearchScientistCost(state),
  nextPropDeskCost: (state: GameState) => getNextUnitCost(state, 'propDesk'),
  nextInstitutionalDeskCost: (state: GameState) => getNextUnitCost(state, 'institutionalDesk'),
  nextHedgeFundCost: (state: GameState) => getNextUnitCost(state, 'hedgeFund'),
  nextInvestmentFirmCost: (state: GameState) => getNextUnitCost(state, 'investmentFirm'),
  nextPowerInfrastructureCost: (infrastructureId: PowerInfrastructureId) => (state: GameState) => getNextPowerInfrastructureCost(state, infrastructureId),
  prestigeGainPreview: (state: GameState) => getPrestigeGain(state.lifetimeCashEarned),
  progressionSummary: (state: GameState) => getProgressionSummary(state),
  canPrestige: (state: GameState) => canPrestige(state),
  lifetimeReputation: (state: GameState) => getLifetimeReputation(state),
  seedCapitalBonus: (state: GameState) => getSeedCapitalBonus(state),
  isUnitUnlocked: (unitId: UnitId) => (state: GameState) => isUnitUnlocked(state, unitId),
  canAffordIntern: (state: GameState) => isUnitUnlocked(state, 'intern') && state.cash >= getInternCost(state),
  canAffordJuniorTrader: (state: GameState) => isUnitUnlocked(state, 'juniorTrader') && state.cash >= getJuniorTraderCost(state),
  canAffordSeniorTrader: (state: GameState) => isUnitUnlocked(state, 'seniorTrader') && state.cash >= getSeniorTraderCost(state),
  canAffordRuleBasedBot: (state: GameState) => isUnitUnlocked(state, 'ruleBasedBot') && state.cash >= getRuleBasedBotCost(state),
  canAffordJuniorHiringProgram: (state: GameState) => selectors.canAffordUpgrade('juniorHiringProgram')(state),
  canAffordJuniorTraderProgram: (state: GameState) => selectors.canAffordUpgrade('juniorTraderProgram')(state),
  canAffordSeniorRecruitment: (state: GameState) => selectors.canAffordUpgrade('seniorRecruitment')(state),
  canAffordSystematicExecution: (state: GameState) => selectors.canAffordUpgrade('systematicExecution')(state),
  powerInfrastructureUnlocked: (state: GameState) => isPowerInfrastructureUnlocked(state),
  canAffordPowerInfrastructure: (infrastructureId: PowerInfrastructureId) => (state: GameState) => isPowerInfrastructureUnlocked(state) && state.cash >= getNextPowerInfrastructureCost(state, infrastructureId),
  isUpgradePurchased: (upgradeId: UpgradeId) => (state: GameState) => state.purchasedUpgrades[upgradeId] === true,
  isResearchTechPurchased: (techId: ResearchTechId) => (state: GameState) => state.purchasedResearchTech[techId] === true,
  isResearchTechVisible: (techId: ResearchTechId) => (state: GameState) => {
    const tech = getResearchTechDefinition(techId)

    if (!tech) {
      return false
    }

    return tech.visibleWhen ? tech.visibleWhen(state) : true
  },
  canAffordResearchTech: (techId: ResearchTechId) => (state: GameState) => {
    const tech = getResearchTechDefinition(techId)

    if (!tech || state.purchasedResearchTech[techId]) {
      return false
    }

    if (tech.visibleWhen && !tech.visibleWhen(state)) {
      return false
    }

    return state.researchPoints >= tech.researchCost
  },
  researchTechShortfall: (techId: ResearchTechId) => (state: GameState) => {
    const tech = getResearchTechDefinition(techId)

    if (!tech || state.purchasedResearchTech[techId]) {
      return 0
    }

    return Math.max(0, tech.researchCost - state.researchPoints)
  },
  isUpgradeVisible: (upgradeId: UpgradeId) => (state: GameState) => {
    const upgrade = getUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return false
    }

    return upgrade.visibleWhen ? upgrade.visibleWhen(state) : true
  },
  repeatableUpgradeRank: (upgradeId: RepeatableUpgradeId) => (state: GameState) => getRepeatableRank(state, upgradeId),
  isRepeatableUpgradeVisible: (upgradeId: RepeatableUpgradeId) => (state: GameState) => {
    const upgrade = getRepeatableUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return false
    }

    return upgrade.visibleWhen ? upgrade.visibleWhen(state) : true
  },
  isRepeatableUpgradeUnlocked: (upgradeId: RepeatableUpgradeId) => (state: GameState) => {
    const upgrade = getRepeatableUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return false
    }

    if (upgrade.visibleWhen && !upgrade.visibleWhen(state)) {
      return false
    }

    return upgrade.unlockWhen ? upgrade.unlockWhen(state) : true
  },
  repeatableUpgradeCost: (upgradeId: RepeatableUpgradeId) => (state: GameState) => {
    const upgrade = getRepeatableUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return 0
    }

    return getRepeatableUpgradeScaledCost(upgrade.baseCost, upgrade.costScaling, getRepeatableRank(state, upgradeId))
  },
  repeatableUpgradeBuyMode: (upgradeId: RepeatableUpgradeId) => (state: GameState) => state.ui.repeatableUpgradeBuyModes[upgradeId],
  bulkRepeatableUpgradeQuantity: (upgradeId: RepeatableUpgradeId) => (state: GameState) => {
    const upgrade = getRepeatableUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return 0
    }

    const buyMode = state.ui.repeatableUpgradeBuyModes[upgradeId]
    const currentRank = getRepeatableRank(state, upgradeId)
    const availableCurrency = upgrade.currency === 'cash' ? state.cash : upgrade.currency === 'researchPoints' ? state.researchPoints : state.influence

    return buyMode === 'max'
      ? getMaxAffordableRepeatableUpgradeQuantity(upgrade.baseCost, upgrade.costScaling, currentRank, availableCurrency).quantity
      : getBulkRepeatableUpgradeCost(upgrade.baseCost, upgrade.costScaling, currentRank, buyMode).quantity
  },
  bulkRepeatableUpgradeTotalCost: (upgradeId: RepeatableUpgradeId) => (state: GameState) => {
    const upgrade = getRepeatableUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return 0
    }

    const buyMode = state.ui.repeatableUpgradeBuyModes[upgradeId]
    const currentRank = getRepeatableRank(state, upgradeId)
    const availableCurrency = upgrade.currency === 'cash' ? state.cash : upgrade.currency === 'researchPoints' ? state.researchPoints : state.influence

    return buyMode === 'max'
      ? getMaxAffordableRepeatableUpgradeQuantity(upgrade.baseCost, upgrade.costScaling, currentRank, availableCurrency).totalCost
      : getBulkRepeatableUpgradeCost(upgrade.baseCost, upgrade.costScaling, currentRank, buyMode).totalCost
  },
  canAffordRepeatableUpgrade: (upgradeId: RepeatableUpgradeId) => (state: GameState) => {
    const upgrade = getRepeatableUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return false
    }

    if (upgrade.visibleWhen && !upgrade.visibleWhen(state)) {
      return false
    }

    if (upgrade.unlockWhen && !upgrade.unlockWhen(state)) {
      return false
    }

    const totalCost = selectors.bulkRepeatableUpgradeTotalCost(upgradeId)(state)
    const quantity = selectors.bulkRepeatableUpgradeQuantity(upgradeId)(state)

    return quantity > 0 && (upgrade.currency === 'cash' ? state.cash >= totalCost : upgrade.currency === 'researchPoints' ? state.researchPoints >= totalCost : state.influence >= totalCost)
  },
  repeatableUpgradeShortfall: (upgradeId: RepeatableUpgradeId) => (state: GameState) => {
    const upgrade = getRepeatableUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return 0
    }

    if (upgrade.visibleWhen && !upgrade.visibleWhen(state)) {
      return 0
    }

    const totalCost = selectors.bulkRepeatableUpgradeTotalCost(upgradeId)(state)
    return upgrade.currency === 'cash' ? Math.max(0, totalCost - state.cash) : upgrade.currency === 'researchPoints' ? Math.max(0, totalCost - state.researchPoints) : Math.max(0, totalCost - state.influence)
  },
  repeatableUpgradeMultiplier: (upgradeId: RepeatableUpgradeId) => (state: GameState) => {
    const upgrade = getRepeatableUpgradeDefinition(upgradeId)

    if (!upgrade) {
      return 1
    }

    return getRepeatableUpgradeMultiplier(getRepeatableRank(state, upgradeId), upgrade.effectPerRank)
  },
  canAffordUpgrade: (upgradeId: UpgradeId) => (state: GameState) => {
    const upgrade = getUpgradeDefinition(upgradeId)

    if (!upgrade || state.purchasedUpgrades[upgradeId]) {
      return false
    }

    if (upgrade.visibleWhen && !upgrade.visibleWhen(state)) {
      return false
    }

    return state.cash >= upgrade.cost
  },
  upgradeCashShortfall: (upgradeId: UpgradeId) => (state: GameState) => {
    const upgrade = getUpgradeDefinition(upgradeId)

    if (!upgrade || state.purchasedUpgrades[upgradeId]) {
      return 0
    }

    return Math.max(0, upgrade.cost - state.cash)
  },
  nextUnitCost: (unitId: UnitId) => (state: GameState) => getNextUnitCost(state, unitId),
  unitBuyMode: (unitId: UnitId) => (state: GameState) => state.ui.unitBuyModes[unitId],
  powerBuyMode: (infrastructureId: PowerInfrastructureId) => (state: GameState) => state.ui.powerBuyModes[infrastructureId],
  bulkUnitQuantity: (unitId: UnitId) => (state: GameState) => getBulkUnitCost(state, unitId, state.ui.unitBuyModes[unitId]).quantity,
  bulkUnitTotalCost: (unitId: UnitId) => (state: GameState) => getBulkUnitCost(state, unitId, state.ui.unitBuyModes[unitId]).totalCost,
  bulkPowerInfrastructureQuantity: (infrastructureId: PowerInfrastructureId) => (state: GameState) => getBulkPowerInfrastructureCost(state, infrastructureId, state.ui.powerBuyModes[infrastructureId]).quantity,
  bulkPowerInfrastructureTotalCost: (infrastructureId: PowerInfrastructureId) => (state: GameState) => getBulkPowerInfrastructureCost(state, infrastructureId, state.ui.powerBuyModes[infrastructureId]).totalCost,
  canAffordUnitInCurrentMode: (unitId: UnitId) => (state: GameState) => {
    const result = getBulkUnitCost(state, unitId, state.ui.unitBuyModes[unitId])

    return result.quantity > 0 && state.cash >= result.totalCost
  },
  canAffordPowerInfrastructureInCurrentMode: (infrastructureId: PowerInfrastructureId) => (state: GameState) => {
    const result = getBulkPowerInfrastructureCost(state, infrastructureId, state.ui.powerBuyModes[infrastructureId])

    return result.quantity > 0 && state.cash >= result.totalCost
  },
  powerInfrastructureCount: (infrastructureId: PowerInfrastructureId) => (state: GameState) => {
    if (infrastructureId === 'serverRack') {
      return state.serverRackCount
    }

    if (infrastructureId === 'serverRoom') {
      return state.serverRoomCount
    }

    if (infrastructureId === 'dataCenter') {
      return state.dataCenterCount
    }

    return state.cloudComputeCount
  },
  algorithmicUnlocked: (state: GameState) => state.purchasedResearchTech.algorithmicTrading === true,
  lobbyingUnlocked: (state: GameState) => state.discoveredLobbying || state.purchasedResearchTech.regulatoryAffairs === true,
  purchasedPolicyCount: (state: GameState) => Object.values(state.purchasedPolicies).filter(Boolean).length,
  isPolicyPurchased: (policyId: LobbyingPolicyId) => (state: GameState) => state.purchasedPolicies[policyId] === true,
  canAffordPolicy: (policyId: LobbyingPolicyId) => (state: GameState) => {
    const policy = getLobbyingPolicyDefinition(policyId)

    if (!policy || state.purchasedPolicies[policyId] || state.purchasedResearchTech.regulatoryAffairs !== true) {
      return false
    }

    return state.influence >= policy.influenceCost
  },
  policyInfluenceShortfall: (policyId: LobbyingPolicyId) => (state: GameState) => {
    const policy = getLobbyingPolicyDefinition(policyId)

    if (!policy || state.purchasedPolicies[policyId]) {
      return 0
    }

    return Math.max(0, policy.influenceCost - state.influence)
  },
  prestigeUpgradeRank: (upgradeId: PrestigeUpgradeId) => (state: GameState) => state.purchasedPrestigeUpgrades[upgradeId] ?? 0,
  canAffordPrestigeUpgrade: (upgradeId: PrestigeUpgradeId) => (state: GameState) => {
    const upgrade = getPrestigeUpgradeDefinition(upgradeId)
    const currentRank = state.purchasedPrestigeUpgrades[upgradeId] ?? 0

    if (!upgrade || currentRank >= upgrade.maxRank) {
      return false
    }

    return state.reputation >= upgrade.baseCost
  },
  plannedPrestigeRank: (upgradeId: PrestigeUpgradeId) => (state: GameState) => state.ui.prestigePurchasePlan[upgradeId] ?? 0,
  plannedPrestigeCost: (state: GameState) => Object.entries(state.ui.prestigePurchasePlan).reduce((total, [upgradeId, planned]) => {
    if (typeof planned !== 'number' || planned <= 0) {
      return total
    }

    const definition = getPrestigeUpgradeDefinition(upgradeId as PrestigeUpgradeId)
    const currentRank = state.purchasedPrestigeUpgrades[upgradeId as PrestigeUpgradeId] ?? 0

    if (!definition || currentRank >= definition.maxRank) {
      return total
    }

    const purchasableRanks = Math.min(planned, definition.maxRank - currentRank)

    return total + definition.baseCost * purchasableRanks
  }, 0),
  plannedPrestigeAvailable: (state: GameState) => state.reputation + getPrestigeGain(state.lifetimeCashEarned),
  plannedPrestigeRemaining: (state: GameState) => selectors.plannedPrestigeAvailable(state) - selectors.plannedPrestigeCost(state),
  canPlanPrestigeUpgrade: (upgradeId: PrestigeUpgradeId, delta: 1 | -1 = 1) => (state: GameState) => {
    const definition = getPrestigeUpgradeDefinition(upgradeId)
    const currentRank = state.purchasedPrestigeUpgrades[upgradeId] ?? 0
    const plannedRank = state.ui.prestigePurchasePlan[upgradeId] ?? 0

    if (!definition || currentRank >= definition.maxRank) {
      return false
    }

    if (delta < 0) {
      return plannedRank > 0
    }

    if (currentRank + plannedRank >= definition.maxRank) {
      return false
    }

    return selectors.plannedPrestigeRemaining(state) >= definition.baseCost
  },
}
