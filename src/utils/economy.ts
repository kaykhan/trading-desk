import { GAME_CONSTANTS } from '../data/constants'
import { POWER_INFRASTRUCTURE } from '../data/powerInfrastructure'
import { UNITS } from '../data/units'
import type { BuyMode, GameState, PowerInfrastructureId, UpgradeId, UnitId } from '../types/game'
import { getHumanStaffCostMultiplier, getMachineOutputPrestigeMultiplier, getPowerCapacityPrestigeMultiplier, getProfitPrestigeMultiplier, getResearchPrestigeMultiplier } from './prestige'

export function getScaledCost(baseCost: number, scaling: number, owned: number): number {
  return Math.floor(baseCost * Math.pow(scaling, owned))
}

export function getGlobalMultiplier(state: GameState): number {
  let multiplier = 1

  if (state.purchasedUpgrades.tradeMultiplier) {
    multiplier *= 1.25
  }

  if (state.purchasedUpgrades.bullMarket) {
    multiplier *= 1.5
  }

  if (state.purchasedPolicies.capitalGainsRelief) {
    multiplier *= 1.1
  }

  if (state.purchasedPolicies.marketDeregulation) {
    multiplier *= 1.15
  }

  return multiplier
}

export function getPrestigeMultiplier(state: GameState): number {
  return getProfitPrestigeMultiplier(state)
}

export function getManualIncome(state: GameState): number {
  let value: number = GAME_CONSTANTS.baseClickIncome

  if (state.purchasedUpgrades.betterTerminal) {
    value = 2
  }

  if (state.purchasedUpgrades.hotkeyMacros) {
    value += 2
  }

  if (state.purchasedUpgrades.premiumDataFeed) {
    value *= 1.5
  }

  if (state.purchasedUpgrades.marketScanner) {
    value *= 1.1
  }

  if (state.purchasedPolicies.extendedTradingWindow) {
    value *= 1.25
  }

  return value * getGlobalMultiplier(state) * getPrestigeMultiplier(state)
}

export function getJuniorTraderIncome(state: GameState): number {
  let value: number = UNITS.juniorTrader.baseIncomePerSecond

  if (state.purchasedUpgrades.deskUpgrade) {
    value = 2
  }

  if (state.purchasedUpgrades.trainingProgram) {
    value += 1
  }

  if (state.purchasedUpgrades.marketScanner) {
    value *= 1.1
  }

  return value
}

export function getSeniorTraderIncome(state: GameState): number {
  let value = state.purchasedUpgrades.executiveTraining ? 30 : UNITS.seniorTrader.baseIncomePerSecond

  if (state.purchasedPolicies.executiveCompensationReform) {
    value *= 1.15
  }

  if (state.purchasedUpgrades.marketScanner) {
    value *= 1.1
  }

  return value
}

export function getTradingBotIncome(state: GameState): number {
  let value = state.purchasedUpgrades.lowLatencyServers ? 65 : UNITS.tradingBot.baseIncomePerSecond

  if (state.purchasedPolicies.fastTrackServerPermits) {
    value *= 1.15
  }

  if (state.purchasedUpgrades.botTelemetry) {
    value *= 1.2
  }

  return value * getMachineOutputPrestigeMultiplier(state)
}

export function getTradingServerIncome(state: GameState): number {
  let value = UNITS.tradingServer.baseIncomePerSecond

  if (state.purchasedUpgrades.executionCluster) {
    value *= 1.4
  }

  return value * getMachineOutputPrestigeMultiplier(state)
}

export function getTradingBotPowerUsage(state: GameState): number {
  let perBotUsage = GAME_CONSTANTS.tradingBotPowerUsage

  if (state.purchasedPolicies.dataCenterEnergyCredits) {
    perBotUsage *= 0.8
  }

  if (state.purchasedUpgrades.coolingSystems) {
    perBotUsage *= 0.9
  }

  return state.tradingBotCount * perBotUsage
}

export function getTradingServerPowerUsage(state: GameState): number {
  const perServerUsage = state.purchasedUpgrades.coolingSystems
    ? GAME_CONSTANTS.tradingServerPowerUsage * 0.9
    : GAME_CONSTANTS.tradingServerPowerUsage

  return state.tradingServerCount * perServerUsage
}

export function getPowerCapacity(state: GameState): number {
  let capacity = state.serverRoomCount * GAME_CONSTANTS.serverRoomPowerCapacity
    + state.dataCenterCount * GAME_CONSTANTS.dataCenterPowerCapacity

  if (state.purchasedPolicies.priorityGridAccess) {
    capacity *= 1.15
  }

  if (state.purchasedUpgrades.powerDistribution) {
    capacity *= 1.2
  }

  return capacity * getPowerCapacityPrestigeMultiplier(state)
}

export function getPowerUsage(state: GameState): number {
  return getTradingServerPowerUsage(state) + getTradingBotPowerUsage(state)
}

export function getMachineEfficiencyMultiplier(state: GameState): number {
  const usage = getPowerUsage(state)
  const capacity = getPowerCapacity(state)

  if (usage <= 0) {
    return 1
  }

  if (usage <= capacity) {
    return 1
  }

  if (capacity <= 0) {
    return 0
  }

  let efficiency = capacity / usage

  if (state.purchasedPolicies.aiInfrastructureIncentives) {
    efficiency *= 1.1
  }

  return Math.min(1, efficiency)
}

export function getResearchComputerScientistCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'juniorResearchScientist', state.juniorResearchScientistCount)
}

export function getJuniorResearchScientistCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'juniorResearchScientist', state.juniorResearchScientistCount)
}

export function getSeniorResearchScientistCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'seniorResearchScientist', state.seniorResearchScientistCount)
}

function getDiscountedUnitCostAtOwned(state: GameState, unitId: UnitId, owned: number): number {
  const unit = UNITS[unitId]
  let discount = 1

  if (unitId === 'juniorTrader') {
    const policyDiscount = state.purchasedPolicies.hiringIncentives ? 0.1 : 0
    discount *= getHumanStaffCostMultiplier(state)
    discount -= policyDiscount
  }

  if (unitId === 'seniorTrader') {
    discount *= getHumanStaffCostMultiplier(state)

    if (state.purchasedPolicies.deskExpansionCredits) {
      discount -= 0.1
    }
  }

  if (unitId === 'juniorResearchScientist' || unitId === 'seniorResearchScientist') {
    discount *= getHumanStaffCostMultiplier(state)
  }

  if (unitId === 'tradingBot' && state.purchasedPolicies.automationTaxCredit) {
    discount -= 0.1
  }

  return Math.max(1, Math.floor(getScaledCost(unit.baseCost, unit.costScaling, owned) * discount))
}

export function getResearchPointsPerSecond(state: GameState): number {
  const juniorOutput = state.juniorResearchScientistCount * (UNITS.juniorResearchScientist.baseResearchPointsPerSecond ?? 0)
  const seniorOutput = state.seniorResearchScientistCount * (UNITS.seniorResearchScientist.baseResearchPointsPerSecond ?? 0)
  const boostedJuniorOutput = state.purchasedUpgrades.labAutomation ? juniorOutput * 1.25 : juniorOutput
  const boostedSeniorOutput = state.purchasedUpgrades.researchGrants ? seniorOutput * 1.35 : seniorOutput
  return (boostedJuniorOutput + boostedSeniorOutput) * getResearchPrestigeMultiplier(state)
}

export function getInfluencePerSecond(state: GameState): number {
  if (state.purchasedResearchTech.regulatoryAffairs !== true) {
    return 0
  }

  const juniorOutput = state.juniorResearchScientistCount * (UNITS.juniorResearchScientist.baseInfluencePerSecond ?? 0)
  const seniorOutput = state.seniorResearchScientistCount * (UNITS.seniorResearchScientist.baseInfluencePerSecond ?? 0)

  const baseOutput = juniorOutput + seniorOutput

  return state.purchasedUpgrades.policyAnalysisDesk ? baseOutput * 1.5 : baseOutput
}

export function getIncomeBreakdown(state: GameState) {
  const machineEfficiency = getMachineEfficiencyMultiplier(state)

  return {
    juniorIncome: state.juniorTraderCount * getJuniorTraderIncome(state),
    seniorIncome: state.seniorTraderCount * getSeniorTraderIncome(state),
    tradingServerIncome: state.tradingServerCount * getTradingServerIncome(state) * machineEfficiency,
    botIncome: state.tradingBotCount * getTradingBotIncome(state) * machineEfficiency,
  }
}

export function getCashPerSecond(state: GameState): number {
  const { juniorIncome, seniorIncome, tradingServerIncome, botIncome } = getIncomeBreakdown(state)
  const basePassiveIncome = juniorIncome + seniorIncome + tradingServerIncome + botIncome

  return basePassiveIncome * getGlobalMultiplier(state) * getPrestigeMultiplier(state)
}

export function getJuniorTraderCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'juniorTrader', state.juniorTraderCount)
}

export function isUnitUnlocked(state: GameState, unitId: UnitId): boolean {
  if (unitId === 'juniorResearchScientist') {
    return state.purchasedUpgrades.juniorHiringProgram === true
  }

  if (unitId === 'seniorResearchScientist') {
    return state.purchasedResearchTech.seniorScientists === true
  }

  if (unitId === 'tradingBot') {
    return state.purchasedResearchTech.algorithmicTrading === true
  }

  if (unitId === 'tradingServer') {
    return state.purchasedResearchTech.tradingServers === true && state.dataCenterCount > 0
  }

  return state.purchasedUpgrades[UNITS[unitId].unlockUpgradeId as UpgradeId] === true
}

export function getUnitCount(state: GameState, unitId: UnitId): number {
  switch (unitId) {
    case 'juniorTrader':
      return state.juniorTraderCount
    case 'seniorTrader':
      return state.seniorTraderCount
    case 'tradingServer':
      return state.tradingServerCount
    case 'tradingBot':
      return state.tradingBotCount
    case 'juniorResearchScientist':
      return state.juniorResearchScientistCount
    case 'seniorResearchScientist':
      return state.seniorResearchScientistCount
  }
}

export function getNextUnitCost(state: GameState, unitId: UnitId): number {
  return getDiscountedUnitCostAtOwned(state, unitId, getUnitCount(state, unitId))
}

export function getBulkUnitCost(state: GameState, unitId: UnitId, quantity: BuyMode): { quantity: number; totalCost: number } {
  if (!isUnitUnlocked(state, unitId)) {
    return { quantity: 0, totalCost: 0 }
  }

  const owned = getUnitCount(state, unitId)

  if (quantity === 'max') {
    let totalCost = 0
    let bought = 0
    let simulatedOwned = owned

    while (true) {
      const nextCost = getDiscountedUnitCostAtOwned(state, unitId, simulatedOwned)

      if (totalCost + nextCost > state.cash) {
        break
      }

      totalCost += nextCost
      simulatedOwned += 1
      bought += 1
    }

    return { quantity: bought, totalCost }
  }

  let totalCost = 0

  for (let i = 0; i < quantity; i += 1) {
    totalCost += getDiscountedUnitCostAtOwned(state, unitId, owned + i)
  }

  return { quantity, totalCost }
}

export function getSeniorTraderCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'seniorTrader', state.seniorTraderCount)
}

export function getTradingBotCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'tradingBot', state.tradingBotCount)
}

export function getTradingServerCost(state: GameState): number {
  return getDiscountedUnitCostAtOwned(state, 'tradingServer', state.tradingServerCount)
}

export function isPowerInfrastructureUnlocked(state: GameState): boolean {
  return state.purchasedResearchTech.powerSystemsEngineering === true
}

export function isPowerInfrastructureVisible(state: GameState, infrastructureId: PowerInfrastructureId): boolean {
  if (infrastructureId === 'serverRoom') {
    return state.purchasedResearchTech.powerSystemsEngineering === true
  }

  return state.purchasedResearchTech.dataCenterSystems === true
}

export function getPowerInfrastructureCount(state: GameState, infrastructureId: PowerInfrastructureId): number {
  switch (infrastructureId) {
    case 'serverRoom':
      return state.serverRoomCount
    case 'dataCenter':
      return state.dataCenterCount
  }
}

export function getNextPowerInfrastructureCost(state: GameState, infrastructureId: PowerInfrastructureId): number {
  const definition = POWER_INFRASTRUCTURE[infrastructureId]
  const subsidyDiscount = state.purchasedPolicies.industrialPowerSubsidies ? 0.1 : 0
  return Math.max(1, Math.floor(getScaledCost(definition.baseCost, definition.costScaling, getPowerInfrastructureCount(state, infrastructureId)) * (1 - subsidyDiscount)))
}

export function getBulkPowerInfrastructureCost(state: GameState, infrastructureId: PowerInfrastructureId, quantity: BuyMode): { quantity: number; totalCost: number } {
  if (!isPowerInfrastructureVisible(state, infrastructureId)) {
    return { quantity: 0, totalCost: 0 }
  }

  const definition = POWER_INFRASTRUCTURE[infrastructureId]
  const owned = getPowerInfrastructureCount(state, infrastructureId)

  if (quantity === 'max') {
    let totalCost = 0
    let bought = 0
    let simulatedOwned = owned

    while (true) {
      const subsidyDiscount = state.purchasedPolicies.industrialPowerSubsidies ? 0.1 : 0
      const nextCost = Math.max(1, Math.floor(getScaledCost(definition.baseCost, definition.costScaling, simulatedOwned) * (1 - subsidyDiscount)))

      if (totalCost + nextCost > state.cash) {
        break
      }

      totalCost += nextCost
      simulatedOwned += 1
      bought += 1
    }

    return { quantity: bought, totalCost }
  }

  let totalCost = 0

  for (let i = 0; i < quantity; i += 1) {
    const subsidyDiscount = state.purchasedPolicies.industrialPowerSubsidies ? 0.1 : 0
    totalCost += Math.max(1, Math.floor(getScaledCost(definition.baseCost, definition.costScaling, owned + i) * (1 - subsidyDiscount)))
  }

  return { quantity, totalCost }
}

export function canAfford(state: GameState, amount: number): boolean {
  return state.cash >= amount
}
