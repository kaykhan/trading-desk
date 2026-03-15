import type { UpgradeDefinition } from '../types/game'

export const UPGRADES: UpgradeDefinition[] = [
  {
    id: 'juniorHiringProgram',
    name: 'Junior Hiring Program',
    category: 'research',
    cost: 50,
    description: 'Unlock Junior Traders in Operations.',
  },
  {
    id: 'seniorRecruitment',
    name: 'Senior Recruitment',
    category: 'research',
    cost: 10_000,
    description: 'Unlock Senior Traders in Operations.',
    visibleWhen: (state) => state.juniorTraderCount >= 5,
  },
  {
    id: 'betterTerminal',
    name: 'Better Terminal',
    category: 'trading',
    cost: 20,
    description: 'Manual trades go from $1 to $2 per click.',
  },
  {
    id: 'hotkeyMacros',
    name: 'Hotkey Macros',
    category: 'trading',
    cost: 80,
    description: 'Add +2 cash per click.',
    visibleWhen: (state) => state.purchasedUpgrades.betterTerminal === true,
  },
  {
    id: 'premiumDataFeed',
    name: 'Premium Data Feed',
    category: 'trading',
    cost: 300,
    description: 'Boost manual income by 50 percent.',
    visibleWhen: (state) => state.purchasedUpgrades.hotkeyMacros === true,
  },
  {
    id: 'deskUpgrade',
    name: 'Desk Upgrade',
    category: 'operations',
    cost: 250,
    description: 'Junior Traders go from $1/sec to $2/sec.',
    visibleWhen: (state) => state.juniorTraderCount > 0,
  },
  {
    id: 'trainingProgram',
    name: 'Training Program',
    category: 'operations',
    cost: 2000,
    description: 'Junior Traders gain +1 cash/sec.',
    visibleWhen: (state) => state.juniorTraderCount > 0,
  },
  {
    id: 'executiveTraining',
    name: 'Executive Training',
    category: 'operations',
    cost: 25_000,
    description: 'Senior Traders go from $12/sec to $30/sec.',
    visibleWhen: (state) => state.seniorTraderCount > 0,
  },
  {
    id: 'algorithmicTrading',
    name: 'Algorithmic Trading',
    category: 'research',
    cost: 100_000,
    description: 'Unlock Trading Bots.',
    visibleWhen: (state) => state.seniorTraderCount >= 5,
  },
  {
    id: 'lowLatencyServers',
    name: 'Low-Latency Servers',
    category: 'operations',
    cost: 175_000,
    description: 'Trading Bots go from $40/sec to $65/sec.',
    visibleWhen: (state) => state.tradingBotCount > 0,
  },
  {
    id: 'tradeMultiplier',
    name: 'Trade Multiplier',
    category: 'research',
    cost: 1000,
    description: 'Increase all profits by 25 percent.',
  },
  {
    id: 'bullMarket',
    name: 'Bull Market',
    category: 'research',
    cost: 8000,
    description: 'Increase all profits by 50 percent.',
    visibleWhen: (state) => state.purchasedUpgrades.tradeMultiplier === true,
  },
]

export function getUpgradeDefinition(upgradeId: UpgradeDefinition['id']): UpgradeDefinition | undefined {
  return UPGRADES.find((upgrade) => upgrade.id === upgradeId)
}
