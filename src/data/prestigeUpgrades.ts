import type { PrestigeTierId, PrestigeUpgradeDefinition } from '../types/game'

export const PRESTIGE_TIERS: PrestigeTierId[] = [
  'iron',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'titanium',
  'sapphire',
  'ruby',
  'diamond',
  'onyx',
]

export const PRESTIGE_TIER_LABELS: Record<PrestigeTierId, string> = {
  iron: 'Iron',
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  titanium: 'Titanium',
  sapphire: 'Sapphire',
  ruby: 'Ruby',
  diamond: 'Diamond',
  onyx: 'Onyx',
}

export const PRESTIGE_REPUTATION_GAIN_CURVE = [4, 6, 9, 13, 17, 21, 26, 31, 37, 66] as const

export const PRESTIGE_UPGRADES: PrestigeUpgradeDefinition[] = [
  {
    id: 'globalRecognition',
    name: 'Global Recognition',
    category: 'prestige',
    maxRank: 10,
    description: 'Increase all profits by 5% per rank.',
  },
  {
    id: 'seedCapital',
    name: 'Seed Capital',
    category: 'prestige',
    maxRank: 10,
    description: 'Start each run with more cash.',
  },
  {
    id: 'betterHiringPipeline',
    name: 'Better Hiring Pipeline',
    category: 'prestige',
    maxRank: 10,
    description: 'Reduce all human staff costs by 5% per rank.',
  },
  {
    id: 'institutionalKnowledge',
    name: 'Institutional Knowledge',
    category: 'prestige',
    maxRank: 10,
    description: 'Increase Research Point production by 10% per rank.',
  },
  {
    id: 'gridOrchestration',
    name: 'Grid Orchestration',
    category: 'prestige',
    maxRank: 10,
    description: 'Increase machine output and power capacity by 5% per rank.',
  },
  {
    id: 'complianceFrameworks',
    name: 'Compliance Frameworks',
    category: 'prestige',
    maxRank: 10,
    description: 'Reduce compliance burden and drag by 5% per rank.',
  },
  {
    id: 'policyCapital',
    name: 'Policy Capital',
    category: 'prestige',
    maxRank: 10,
    description: 'Increase Influence gain by 5% per rank.',
  },
  {
    id: 'marketReputation',
    name: 'Market Reputation',
    category: 'prestige',
    maxRank: 10,
    description: 'Increase sector output by 3% per rank.',
  },
  {
    id: 'deskEfficiency',
    name: 'Desk Efficiency',
    category: 'prestige',
    maxRank: 10,
    description: 'Increase human output by 4% per rank.',
  },
  {
    id: 'strategicReserves',
    name: 'Strategic Reserves',
    category: 'prestige',
    maxRank: 10,
    description: 'Reduce timed boost cooldowns by 3% per rank.',
  },
]

export const PRESTIGE_UPGRADE_MAP = Object.fromEntries(PRESTIGE_UPGRADES.map((upgrade) => [upgrade.id, upgrade]))

export function getPrestigeUpgradeDefinition(upgradeId: PrestigeUpgradeDefinition['id']): PrestigeUpgradeDefinition | undefined {
  return PRESTIGE_UPGRADE_MAP[upgradeId]
}
