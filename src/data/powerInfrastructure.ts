import type { PowerInfrastructureDefinition, PowerInfrastructureId } from '../types/game'

export const POWER_INFRASTRUCTURE: Record<PowerInfrastructureId, PowerInfrastructureDefinition> = {
  serverRoom: {
    id: 'serverRoom',
    name: 'Server Room',
    baseCost: 9000,
    costScaling: 1.15,
    powerCapacity: 12,
    description: 'Early machine infrastructure that supports trading bots and the first automation stack.',
  },
  dataCenter: {
    id: 'dataCenter',
    name: 'Data Centre',
    baseCost: 1000000,
    costScaling: 1.21,
    powerCapacity: 140,
    description: 'Heavy machine infrastructure required to sustain trading servers and dense automation load.',
  },
}
