import type { PrestigeTierId, PrestigeUpgradeDefinition } from '../types/game'
import { mechanics } from '../lib/mechanics'

export const PRESTIGE_TIERS: PrestigeTierId[] = [...mechanics.prestige.tiers] as PrestigeTierId[]

export const PRESTIGE_TIER_LABELS: Record<PrestigeTierId, string> = mechanics.prestige.tierLabels

export const PRESTIGE_REPUTATION_GAIN_CURVE = [...mechanics.prestige.gainCurve] as const

export const PRESTIGE_UPGRADES: PrestigeUpgradeDefinition[] = (Object.entries(mechanics.prestige.upgrades) as Array<[PrestigeUpgradeDefinition['id'], typeof mechanics.prestige.upgrades[PrestigeUpgradeDefinition['id']]]>).map(([id, upgrade]) => ({
  id,
  name: String(upgrade.name),
  category: 'prestige',
  maxRank: Number(upgrade.maxRank),
  description: String(upgrade.description),
}))

export const PRESTIGE_UPGRADE_MAP = Object.fromEntries(PRESTIGE_UPGRADES.map((upgrade) => [upgrade.id, upgrade]))

export function getPrestigeUpgradeDefinition(upgradeId: PrestigeUpgradeDefinition['id']): PrestigeUpgradeDefinition | undefined {
  return PRESTIGE_UPGRADE_MAP[upgradeId]
}
