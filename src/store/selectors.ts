import { getBulkPowerInfrastructureCost, getBulkUnitCost, getCashPerSecond, getGlobalMultiplier, getIncomeBreakdown, getInfluencePerSecond, getJuniorResearchScientistCost, getJuniorTraderCost, getMachineEfficiencyMultiplier, getManualIncome, getNextPowerInfrastructureCost, getNextUnitCost, getPowerCapacity, getPowerUsage, getPrestigeMultiplier, getResearchPointsPerSecond, getSeniorResearchScientistCost, getSeniorTraderCost, getTradingBotCost, getTradingBotPowerUsage, getTradingServerCost, getTradingServerPowerUsage, isPowerInfrastructureUnlocked, isUnitUnlocked } from '../utils/economy'
import { getLobbyingPolicyDefinition } from '../data/lobbyingPolicies'
import { getPrestigeUpgradeDefinition } from '../data/prestigeUpgrades'
import { getResearchTechDefinition } from '../data/researchTech'
import { getUpgradeDefinition } from '../data/upgrades'
import { canPrestige, getLifetimeReputation, getPrestigeGain, getSeedCapitalBonus } from '../utils/prestige'
import { getProgressionSummary } from '../utils/progression'
import type { GameState, LobbyingPolicyId, PowerInfrastructureId, PrestigeUpgradeId, ResearchTechId, UnitId, UpgradeId } from '../types/game'

export const selectors = {
  cashPerClick: (state: GameState) => getManualIncome(state),
  cashPerSecond: (state: GameState) => getCashPerSecond(state),
  researchPoints: (state: GameState) => state.researchPoints,
  researchPointsPerSecond: (state: GameState) => getResearchPointsPerSecond(state),
  influence: (state: GameState) => state.influence,
  influencePerSecond: (state: GameState) => getInfluencePerSecond(state),
  powerUsage: (state: GameState) => getPowerUsage(state),
  tradingBotPowerUsage: (state: GameState) => getTradingBotPowerUsage(state),
  tradingServerPowerUsage: (state: GameState) => getTradingServerPowerUsage(state),
  powerCapacity: (state: GameState) => getPowerCapacity(state),
  machineEfficiencyMultiplier: (state: GameState) => getMachineEfficiencyMultiplier(state),
  juniorIncome: (state: GameState) => getIncomeBreakdown(state).juniorIncome,
  seniorIncome: (state: GameState) => getIncomeBreakdown(state).seniorIncome,
  tradingServerIncome: (state: GameState) => getIncomeBreakdown(state).tradingServerIncome,
  botIncome: (state: GameState) => getIncomeBreakdown(state).botIncome,
  globalMultiplier: (state: GameState) => getGlobalMultiplier(state),
  prestigeMultiplier: (state: GameState) => getPrestigeMultiplier(state),
  nextJuniorTraderCost: (state: GameState) => getJuniorTraderCost(state),
  nextSeniorTraderCost: (state: GameState) => getSeniorTraderCost(state),
  nextTradingServerCost: (state: GameState) => getTradingServerCost(state),
  nextTradingBotCost: (state: GameState) => getTradingBotCost(state),
  nextJuniorResearchScientistCost: (state: GameState) => getJuniorResearchScientistCost(state),
  nextSeniorResearchScientistCost: (state: GameState) => getSeniorResearchScientistCost(state),
  nextPowerInfrastructureCost: (infrastructureId: PowerInfrastructureId) => (state: GameState) => getNextPowerInfrastructureCost(state, infrastructureId),
  prestigeGainPreview: (state: GameState) => getPrestigeGain(state.lifetimeCashEarned),
  progressionSummary: (state: GameState) => getProgressionSummary(state),
  canPrestige: (state: GameState) => canPrestige(state),
  lifetimeReputation: (state: GameState) => getLifetimeReputation(state),
  seedCapitalBonus: (state: GameState) => getSeedCapitalBonus(state),
  isUnitUnlocked: (unitId: UnitId) => (state: GameState) => isUnitUnlocked(state, unitId),
  canAffordJuniorTrader: (state: GameState) => isUnitUnlocked(state, 'juniorTrader') && state.cash >= getJuniorTraderCost(state),
  canAffordSeniorTrader: (state: GameState) => isUnitUnlocked(state, 'seniorTrader') && state.cash >= getSeniorTraderCost(state),
  canAffordTradingBot: (state: GameState) => isUnitUnlocked(state, 'tradingBot') && state.cash >= getTradingBotCost(state),
  canAffordJuniorHiringProgram: (state: GameState) => selectors.canAffordUpgrade('juniorHiringProgram')(state),
  canAffordSeniorRecruitment: (state: GameState) => selectors.canAffordUpgrade('seniorRecruitment')(state),
  canAffordAlgorithmicTrading: (state: GameState) => selectors.canAffordUpgrade('algorithmicTrading')(state),
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
    if (infrastructureId === 'serverRoom') {
      return state.serverRoomCount
    }

    return state.dataCenterCount
  },
  tradingBotsUnlocked: (state: GameState) => state.purchasedResearchTech.algorithmicTrading === true,
  lobbyingUnlocked: (state: GameState) => state.purchasedResearchTech.regulatoryAffairs === true,
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
}
