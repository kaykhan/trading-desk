import type { PowerInfrastructureDefinition, PowerInfrastructureId } from '../types/game'

export const POWER_INFRASTRUCTURE: Record<PowerInfrastructureId, PowerInfrastructureDefinition> = {
  serverRack: {
    id: 'serverRack',
    name: 'Server Rack',
    baseCost: 1800,
    costScaling: 1.14,
    powerCapacity: 3,
    description: 'The first tiny infrastructure step for early automation experiments and a handful of machines.',
  },
  serverRoom: {
    id: 'serverRoom',
    name: 'Server Room',
    baseCost: 10_000,
    costScaling: 1.15,
    powerCapacity: 30,
    description: 'A proper in-house machine floor that supports sustained Rule-Based and ML system growth.',
  },
  dataCenter: {
    id: 'dataCenter',
    name: 'Data Centre',
    baseCost: 1_000_000,
    costScaling: 1.21,
    powerCapacity: 220,
    description: 'Heavy machine infrastructure required to sustain ML and AI trading systems at scale.',
  },
  cloudCompute: {
    id: 'cloudCompute',
    name: 'Cloud Infrastructure',
    baseCost: 6_500_000,
    costScaling: 1.24,
    powerCapacity: 700,
    description: 'Late modern infrastructure that buys huge elastic compute capacity once local expansion gets expensive.',
  },
}
