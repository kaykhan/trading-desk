import type { PowerInfrastructureDefinition, PowerInfrastructureId } from '../types/game'
import { mechanics } from '../lib/mechanics'

export const POWER_INFRASTRUCTURE: Record<PowerInfrastructureId, PowerInfrastructureDefinition> = {
  serverRack: {
    id: 'serverRack',
    name: mechanics.powerInfrastructure.serverRack.name,
    baseCost: mechanics.powerInfrastructure.serverRack.baseCost,
    costScaling: mechanics.powerInfrastructure.serverRack.costScaling,
    powerCapacity: mechanics.powerInfrastructure.serverRack.powerCapacity,
    description: mechanics.powerInfrastructure.serverRack.description,
  },
  serverRoom: {
    id: 'serverRoom',
    name: mechanics.powerInfrastructure.serverRoom.name,
    baseCost: mechanics.powerInfrastructure.serverRoom.baseCost,
    costScaling: mechanics.powerInfrastructure.serverRoom.costScaling,
    powerCapacity: mechanics.powerInfrastructure.serverRoom.powerCapacity,
    description: mechanics.powerInfrastructure.serverRoom.description,
  },
  dataCenter: {
    id: 'dataCenter',
    name: mechanics.powerInfrastructure.dataCenter.name,
    baseCost: mechanics.powerInfrastructure.dataCenter.baseCost,
    costScaling: mechanics.powerInfrastructure.dataCenter.costScaling,
    powerCapacity: mechanics.powerInfrastructure.dataCenter.powerCapacity,
    description: mechanics.powerInfrastructure.dataCenter.description,
  },
  cloudCompute: {
    id: 'cloudCompute',
    name: mechanics.powerInfrastructure.cloudCompute.name,
    baseCost: mechanics.powerInfrastructure.cloudCompute.baseCost,
    costScaling: mechanics.powerInfrastructure.cloudCompute.costScaling,
    powerCapacity: mechanics.powerInfrastructure.cloudCompute.powerCapacity,
    description: mechanics.powerInfrastructure.cloudCompute.description,
  },
}
