import { getCashPerSecond, getGlobalMultiplier, getIncomeBreakdown, getJuniorTraderCost, getManualIncome, getPrestigeMultiplier, getPromotionCost, getTradingBotCost } from '../utils/economy'
import { getPrestigeUpgradeDefinition } from '../data/prestigeUpgrades'
import { getUpgradeDefinition } from '../data/upgrades'
import { canPrestige, getLifetimeReputation, getPrestigeGain, getSeedCapitalBonus } from '../utils/prestige'
import type { GameState, PrestigeUpgradeId, UpgradeId } from '../types/game'

export const selectors = {
  cashPerClick: (state: GameState) => getManualIncome(state),
  cashPerSecond: (state: GameState) => getCashPerSecond(state),
  incomeBreakdown: (state: GameState) => getIncomeBreakdown(state),
  globalMultiplier: (state: GameState) => getGlobalMultiplier(state),
  prestigeMultiplier: (state: GameState) => getPrestigeMultiplier(state),
  nextJuniorTraderCost: (state: GameState) => getJuniorTraderCost(state),
  promotionCost: (_state: GameState) => getPromotionCost(),
  nextTradingBotCost: (state: GameState) => getTradingBotCost(state),
  prestigeGainPreview: (state: GameState) => getPrestigeGain(state.lifetimeCashEarned),
  canPrestige: (state: GameState) => canPrestige(state),
  lifetimeReputation: (state: GameState) => getLifetimeReputation(state),
  seedCapitalBonus: (state: GameState) => getSeedCapitalBonus(state),
  canAffordJuniorTrader: (state: GameState) => state.cash >= getJuniorTraderCost(state),
  canAffordTradingBot: (state: GameState) =>
    state.purchasedUpgrades.algorithmicTrading === true && state.cash >= getTradingBotCost(state),
  isTradingBotUnlocked: (state: GameState) => state.purchasedUpgrades.algorithmicTrading === true,
  canPromoteJunior: (state: GameState) =>
    state.purchasedUpgrades.promotionProgram === true && state.juniorTraderCount > 0 && state.cash >= getPromotionCost(),
  isUpgradePurchased: (upgradeId: UpgradeId) => (state: GameState) => state.purchasedUpgrades[upgradeId] === true,
  canAffordUpgrade: (upgradeId: UpgradeId) => (state: GameState) => {
    const upgrade = getUpgradeDefinition(upgradeId)
    if (!upgrade || state.purchasedUpgrades[upgradeId]) {
      return false
    }

    return state.cash >= upgrade.cost
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
