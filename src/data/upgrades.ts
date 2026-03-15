import type { UpgradeDefinition } from '../types/game'

export const UPGRADES: UpgradeDefinition[] = [
  {
    id: 'betterTerminal',
    name: 'Better Terminal',
    category: 'manual',
    cost: 20,
    description: 'Manual trades go from $1 to $2 per click.',
  },
  {
    id: 'hotkeyMacros',
    name: 'Hotkey Macros',
    category: 'manual',
    cost: 80,
    description: 'Add +2 cash per click.',
    visibleWhen: (state) => state.purchasedUpgrades.betterTerminal === true,
  },
  {
    id: 'premiumDataFeed',
    name: 'Premium Data Feed',
    category: 'manual',
    cost: 300,
    description: 'Boost manual income by 50 percent.',
    visibleWhen: (state) => state.purchasedUpgrades.hotkeyMacros === true,
  },
  {
    id: 'deskUpgrade',
    name: 'Desk Upgrade',
    category: 'staff',
    cost: 250,
    description: 'Junior Traders go from $1/sec to $2/sec.',
    visibleWhen: (state) => state.juniorTraderCount > 0,
  },
  {
    id: 'trainingProgram',
    name: 'Training Program',
    category: 'staff',
    cost: 2000,
    description: 'Junior Traders gain +1 cash/sec.',
    visibleWhen: (state) => state.juniorTraderCount > 0,
  },
  {
    id: 'promotionProgram',
    name: 'Promotion Program',
    category: 'staff',
    cost: 10_000,
    description: 'Unlock promotion of Junior Traders into Senior Traders.',
    visibleWhen: (state) => state.juniorTraderCount >= 3,
  },
  {
    id: 'executiveTraining',
    name: 'Executive Training',
    category: 'staff',
    cost: 25_000,
    description: 'Senior Traders go from $8/sec to $12/sec.',
    visibleWhen: (state) => state.purchasedUpgrades.promotionProgram === true,
  },
  {
    id: 'algorithmicTrading',
    name: 'Algorithmic Trading',
    category: 'automation',
    cost: 100_000,
    description: 'Unlock Trading Bots.',
    visibleWhen: (state) => state.purchasedUpgrades.promotionProgram === true,
  },
  {
    id: 'lowLatencyServers',
    name: 'Low-Latency Servers',
    category: 'automation',
    cost: 175_000,
    description: 'Trading Bots go from $40/sec to $65/sec.',
    visibleWhen: (state) => state.tradingBotCount > 0,
  },
  {
    id: 'tradeMultiplier',
    name: 'Trade Multiplier',
    category: 'global',
    cost: 1000,
    description: 'Increase all profits by 25 percent.',
  },
  {
    id: 'bullMarket',
    name: 'Bull Market',
    category: 'global',
    cost: 8000,
    description: 'Increase all profits by 50 percent.',
    visibleWhen: (state) => state.purchasedUpgrades.tradeMultiplier === true,
  },
]

export function getUpgradeDefinition(upgradeId: UpgradeDefinition['id']): UpgradeDefinition | undefined {
  return UPGRADES.find((upgrade) => upgrade.id === upgradeId)
}
