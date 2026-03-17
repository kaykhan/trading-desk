import { getResearchTechDefinition, getResearchTechsByBranch } from '../data/researchTech'
import type { GameState, ResearchBranchId, ResearchTechDefinition, ResearchTechId } from '../types/game'

export function isResearchTechPurchased(state: GameState, techId: ResearchTechId): boolean {
  return state.purchasedResearchTech[techId] === true
}

export function areResearchTechPrerequisitesMet(state: GameState, techId: ResearchTechId): boolean {
  const tech = getResearchTechDefinition(techId)

  if (!tech) {
    return false
  }

  return (tech.prerequisites ?? []).every((prerequisiteId) => isResearchTechPurchased(state, prerequisiteId))
}

export function getMissingResearchPrerequisites(state: GameState, techId: ResearchTechId): ResearchTechDefinition[] {
  const tech = getResearchTechDefinition(techId)

  if (!tech) {
    return []
  }

  return (tech.prerequisites ?? [])
    .filter((prerequisiteId) => !isResearchTechPurchased(state, prerequisiteId))
    .map((prerequisiteId) => getResearchTechDefinition(prerequisiteId))
    .filter((definition): definition is ResearchTechDefinition => Boolean(definition))
}

export function isResearchTechVisible(state: GameState, techId: ResearchTechId): boolean {
  const tech = getResearchTechDefinition(techId)

  if (!tech) {
    return false
  }

  return tech.visibleWhen ? tech.visibleWhen(state) : true
}

export function isResearchTechUnlocked(state: GameState, techId: ResearchTechId): boolean {
  const tech = getResearchTechDefinition(techId)

  if (!tech || !isResearchTechVisible(state, techId)) {
    return false
  }

  if (!areResearchTechPrerequisitesMet(state, techId)) {
    return false
  }

  return tech.unlockWhen ? tech.unlockWhen(state) : true
}

export function getResearchTechCost(state: GameState, techId: ResearchTechId): number {
  const tech = getResearchTechDefinition(techId)

  if (!tech) {
    return 0
  }

  return tech.researchCost
}

export function getResearchTechShortfall(state: GameState, techId: ResearchTechId): number {
  const tech = getResearchTechDefinition(techId)

  if (!tech || isResearchTechPurchased(state, techId)) {
    return 0
  }

  const currencyAmount = tech.currency === 'cash' ? state.cash : state.researchPoints
  return Math.max(0, tech.researchCost - currencyAmount)
}

export function canBuyResearchTech(state: GameState, techId: ResearchTechId): boolean {
  const tech = getResearchTechDefinition(techId)

  if (!tech || isResearchTechPurchased(state, techId) || !isResearchTechUnlocked(state, techId)) {
    return false
  }

  return getResearchTechShortfall(state, techId) <= 0
}

export function getAvailableResearchTechsByBranch(state: GameState, branchId: ResearchBranchId): ResearchTechDefinition[] {
  return getResearchTechsByBranch(branchId).filter((tech) => isResearchTechVisible(state, tech.id))
}

export function isTechnologySectorUnlocked(state: GameState): boolean {
  return isResearchTechPurchased(state, 'technologyMarkets')
}

export function isEnergySectorUnlocked(state: GameState): boolean {
  return isResearchTechPurchased(state, 'energyMarkets')
}

export function isAutomationUnlocked(state: GameState): boolean {
  return isResearchTechPurchased(state, 'algorithmicTrading')
}

export function isPowerInfrastructureUnlocked(state: GameState): boolean {
  return isResearchTechPurchased(state, 'powerSystemsEngineering')
}

export function isLobbyingUnlocked(state: GameState): boolean {
  return isResearchTechPurchased(state, 'regulatoryAffairs')
}
