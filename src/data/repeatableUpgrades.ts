import { isMechanicsConditionMet, mechanics } from '../lib/mechanics'
import type { GameState, RepeatableUpgradeDefinition, RepeatableUpgradeId } from '../types/game'

export const REPEATABLE_UPGRADE_IDS: RepeatableUpgradeId[] = Object.keys(mechanics.repeatableUpgrades) as RepeatableUpgradeId[]

function buildVisibleWhen(visibleAfterPrestigeCount: number): RepeatableUpgradeDefinition['visibleWhen'] {
  return (state: GameState) => state.prestigeCount >= visibleAfterPrestigeCount
}

function buildUnlockWhen(unlockRequires: unknown): RepeatableUpgradeDefinition['unlockWhen'] {
  return (state: GameState) => isMechanicsConditionMet(unlockRequires, state)
}

export const REPEATABLE_UPGRADES: RepeatableUpgradeDefinition[] = REPEATABLE_UPGRADE_IDS.map((id) => {
  const upgrade = mechanics.repeatableUpgrades[id]

  return {
    id,
    name: upgrade.name,
    family: upgrade.family,
    currency: upgrade.currency,
    maxRank: upgrade.maxRank,
    perRankDescription: upgrade.perRankDescription,
    baseCost: upgrade.baseCost,
    costScaling: upgrade.costScaling,
    effectPerRank: upgrade.effectPerRank,
    description: upgrade.description,
    unlockConditionDescription: upgrade.unlockConditionDescription,
    visibleWhen: buildVisibleWhen(upgrade.visibleAfterPrestigeCount),
    unlockWhen: buildUnlockWhen(upgrade.unlockRequires),
  }
})

const REPEATABLE_UPGRADE_MAP = Object.fromEntries(REPEATABLE_UPGRADES.map((upgrade) => [upgrade.id, upgrade])) as Record<RepeatableUpgradeId, RepeatableUpgradeDefinition>

export function getRepeatableUpgradeDefinition(id: RepeatableUpgradeId): RepeatableUpgradeDefinition | undefined {
  return REPEATABLE_UPGRADE_MAP[id]
}

export function getRepeatableUpgradeRank(state: GameState, id: RepeatableUpgradeId): number {
  return state.repeatableUpgradeRanks[id] ?? 0
}

export function isRepeatableUpgradeGloballyUnlocked(state: GameState): boolean {
  return state.prestigeCount >= 1
}

export function getTotalRepeatableUpgradeRanksPurchased(state: GameState): number {
  return REPEATABLE_UPGRADE_IDS.reduce((total, id) => total + getRepeatableUpgradeRank(state, id), 0)
}

export function getRepeatableUpgradeCost(baseCost: number, costScaling: number, currentRank: number): number {
  return Math.floor(baseCost * Math.pow(costScaling, currentRank))
}

export function getBulkRepeatableUpgradeCost(baseCost: number, costScaling: number, currentRank: number, quantity: number): { totalCost: number; quantity: number } {
  let totalCost = 0
  let purchased = 0

  while (purchased < quantity && currentRank + purchased < 100) {
    totalCost += getRepeatableUpgradeCost(baseCost, costScaling, currentRank + purchased)
    purchased += 1
  }

  return { totalCost, quantity: purchased }
}

export function getMaxAffordableRepeatableUpgradeQuantity(baseCost: number, costScaling: number, currentRank: number, availableCurrency: number): { totalCost: number; quantity: number } {
  let totalCost = 0
  let quantity = 0

  while (currentRank + quantity < 100) {
    const nextCost = getRepeatableUpgradeCost(baseCost, costScaling, currentRank + quantity)
    if (totalCost + nextCost > availableCurrency) break
    totalCost += nextCost
    quantity += 1
  }

  return { totalCost, quantity }
}

export function getRepeatableUpgradeMultiplier(state: GameState, id: RepeatableUpgradeId): number {
  const rank = getRepeatableUpgradeRank(state, id)
  const definition = mechanics.repeatableUpgrades[id]
  if (!definition) return 1

  if (definition.effectModel === 'reductionMultiplier') {
    return Math.max(Number(definition.floor ?? 0.5), 1 - rank * Number(definition.effectPerRank))
  }

  return 1 + rank * Number(definition.effectPerRank)
}
