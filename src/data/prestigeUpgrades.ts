import type { PrestigeUpgradeDefinition } from '../types/game'

export const PRESTIGE_UPGRADES: PrestigeUpgradeDefinition[] = [
  {
    id: 'brandRecognition',
    name: 'Brand Recognition',
    category: 'prestige',
    baseCost: 1,
    maxRank: 10,
    description: 'Gain +10 percent all profits per rank.',
  },
  {
    id: 'seedCapital',
    name: 'Seed Capital',
    category: 'prestige',
    baseCost: 2,
    maxRank: 10,
    description: 'Start each run with extra cash.',
  },
  {
    id: 'betterHiringPipeline',
    name: 'Better Hiring Pipeline',
    category: 'prestige',
    baseCost: 3,
    maxRank: 5,
    description: 'Make Junior Traders cheaper on all future runs.',
  },
]

export function getPrestigeUpgradeDefinition(upgradeId: PrestigeUpgradeDefinition['id']): PrestigeUpgradeDefinition | undefined {
  return PRESTIGE_UPGRADES.find((upgrade) => upgrade.id === upgradeId)
}
