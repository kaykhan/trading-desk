import { mechanics } from '../lib/mechanics'
import type { MilestoneCategoryId, MilestoneDefinition, MilestoneId } from '../types/game'

export const MILESTONE_CATEGORY_ORDER: MilestoneCategoryId[] = [...mechanics.milestones.categoryOrder]

export const MILESTONE_CATEGORY_LABELS: Record<MilestoneCategoryId, string> = { ...mechanics.milestones.categoryLabels }

export const MILESTONES: MilestoneDefinition[] = (Object.entries(mechanics.milestones.items) as Array<[MilestoneId, (typeof mechanics.milestones.items)[string]]>)
  .map(([id, item]) => ({
    id,
    category: item.category,
    scope: item.scope ?? 'run',
    displayOrder: item.displayOrder,
    name: item.name,
    description: item.description,
    visibleByDefault: true,
    reward: { ...item.reward },
    conditionModel: item.conditionModel,
    conditionValue: item.conditionValue,
    targetId: item.targetId as MilestoneDefinition['targetId'],
    thresholds: item.thresholds,
    requiresMilestones: item.requiresMilestones as MilestoneDefinition['requiresMilestones'],
    requirements: item.requirements as MilestoneDefinition['requirements'],
    achievementKey: item.achievementKey,
  }))
  .sort((left, right) => left.displayOrder - right.displayOrder)
