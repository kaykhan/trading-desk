import { isMechanicsConditionMet, mechanics } from '../lib/mechanics'
import type { GameState, UpgradeDefinition, UpgradeId } from '../types/game'

function buildVisibleWhen(visibleWhen: unknown): UpgradeDefinition['visibleWhen'] {
  if (visibleWhen == null) {
    return undefined
  }

  return (state: GameState) => isMechanicsConditionMet(visibleWhen, state)
}

export const UPGRADES: UpgradeDefinition[] = (Object.entries(mechanics.upgrades) as Array<[UpgradeId, typeof mechanics.upgrades[UpgradeId]]>).map(([id, upgrade]) => ({
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
