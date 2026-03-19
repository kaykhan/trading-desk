import { isMechanicsConditionMet, mechanics } from '../lib/mechanics'
import type { GameState, UpgradeDefinition, UpgradeGroup, UpgradeId } from '../types/game'

function buildVisibleWhen(visibleWhen: unknown): UpgradeDefinition['visibleWhen'] {
  if (visibleWhen == null) {
    return undefined
  }

  return (state: GameState) => isMechanicsConditionMet(visibleWhen, state)
}

export const UPGRADE_GROUP_ORDER: UpgradeGroup[] = [...mechanics.upgrades.groupOrder]

export const UPGRADE_GROUP_LABELS: Record<UpgradeGroup, string> = { ...mechanics.upgrades.groupLabels }

export const UPGRADE_GROUP_DESCRIPTIONS: Record<UpgradeGroup, string> = { ...mechanics.upgrades.groupDescriptions }

export const UPGRADES: UpgradeDefinition[] = (Object.entries(mechanics.upgrades.items) as Array<[UpgradeId, typeof mechanics.upgrades.items[UpgradeId]]>).map(([id, upgrade]) => ({
  id,
  name: upgrade.name,
  category: upgrade.category,
  group: upgrade.group,
  cost: upgrade.cost,
  description: upgrade.description,
  visibleWhen: buildVisibleWhen(upgrade.visibleWhen),
}))

const UPGRADE_MAP = Object.fromEntries(UPGRADES.map((upgrade) => [upgrade.id, upgrade])) as Record<UpgradeId, UpgradeDefinition>

export function getUpgradeDefinition(upgradeId: UpgradeDefinition['id']): UpgradeDefinition | undefined {
  return UPGRADE_MAP[upgradeId]
}
