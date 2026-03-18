import type { UnitDefinition, UnitId } from '../types/game'
import { mechanics } from '../lib/mechanics'

export const UNITS: Record<UnitId, UnitDefinition> = (Object.entries(mechanics.units) as Array<[UnitId, typeof mechanics.units[UnitId]]>).reduce<Record<UnitId, UnitDefinition>>((acc, [id, unit]) => {
  acc[id] = {
    id,
    name: String(unit.name),
    baseCost: Number(unit.baseCost),
    costScaling: Number(unit.costScaling),
    baseIncomePerSecond: Number(unit.baseCashPerSecond ?? unit.baseCashPerSecondDisplay ?? 0),
    baseResearchPointsPerSecond: typeof unit.baseResearchPointsPerSecond === 'number' ? unit.baseResearchPointsPerSecond : undefined,
    baseInfluencePerSecond: typeof unit.baseInfluencePerSecond === 'number' ? unit.baseInfluencePerSecond : undefined,
    description: String(unit.description),
    tab: 'operations',
    unlockUpgradeId: unit.unlockResearchTechId as UnitDefinition['unlockUpgradeId'],
  }

  return acc
}, {} as Record<UnitId, UnitDefinition>)
