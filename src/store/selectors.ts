import { getBulkUnitCost, getCashPerSecond, getGlobalMultiplier, getIncomeBreakdown, getJuniorTraderCost, getManualIncome, getNextUnitCost, getPrestigeMultiplier, getSeniorTraderCost, getTradingBotCost, isUnitUnlocked } from '../utils/economy'
import { getPrestigeUpgradeDefinition } from '../data/prestigeUpgrades'
import { getUpgradeDefinition } from '../data/upgrades'
import { canPrestige, getLifetimeReputation, getPrestigeGain, getSeedCapitalBonus } from '../utils/prestige'
import { getProgressionSummary } from '../utils/progression'
import type { GameState, PrestigeUpgradeId, UnitId, UpgradeId } from '../types/game'

export const selectors = {
  cashPerClick: (state: GameState) => getManualIncome(state),
  cashPerSecond: (state: GameState) => getCashPerSecond(state),
  juniorIncome: (state: GameState) => getIncomeBreakdown(state).juniorIncome,
  seniorIncome: (state: GameState) => getIncomeBreakdown(state).seniorIncome,
  botIncome: (state: GameState) => getIncomeBreakdown(state).botIncome,
  globalMultiplier: (state: GameState) => getGlobalMultiplier(state),
  prestigeMultiplier: (state: GameState) => getPrestigeMultiplier(state),
  nextJuniorTraderCost: (state: GameState) => getJuniorTraderCost(state),
  nextSeniorTraderCost: (state: GameState) => getSeniorTraderCost(state),
  nextTradingBotCost: (state: GameState) => getTradingBotCost(state),
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
  isUpgradePurchased: (upgradeId: UpgradeId) => (state: GameState) => state.purchasedUpgrades[upgradeId] === true,
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
  bulkUnitQuantity: (unitId: UnitId) => (state: GameState) => getBulkUnitCost(state, unitId, state.ui.unitBuyModes[unitId]).quantity,
  bulkUnitTotalCost: (unitId: UnitId) => (state: GameState) => getBulkUnitCost(state, unitId, state.ui.unitBuyModes[unitId]).totalCost,
  canAffordUnitInCurrentMode: (unitId: UnitId) => (state: GameState) => getBulkUnitCost(state, unitId, state.ui.unitBuyModes[unitId]).quantity > 0,
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
