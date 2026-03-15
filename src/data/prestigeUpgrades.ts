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
    maxRank: 6,
    description: 'Reduce all human staff costs by 5 percent per rank.',
  },
  {
    id: 'institutionalKnowledge',
    name: 'Institutional Knowledge',
    category: 'prestige',
    baseCost: 4,
    maxRank: 6,
    description: 'Increase Research Point production by 12 percent per rank.',
  },
  {
    id: 'gridOrchestration',
    name: 'Grid Orchestration',
    category: 'prestige',
    baseCost: 5,
    maxRank: 6,
    description: 'Increase machine output and power capacity by 5 percent per rank.',
  },
]

export function getPrestigeUpgradeDefinition(upgradeId: PrestigeUpgradeDefinition['id']): PrestigeUpgradeDefinition | undefined {
  return PRESTIGE_UPGRADES.find((upgrade) => upgrade.id === upgradeId)
}
