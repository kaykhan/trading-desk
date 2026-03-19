import { buildMechanicsPredicate, mechanics } from '../lib/mechanics'
import type { GameState, ResearchBranchId, ResearchTechDefinition, ResearchTechId } from '../types/game'

export const RESEARCH_BRANCH_ORDER: ResearchBranchId[] = [...mechanics.research.branches.order]

export const RESEARCH_BRANCH_LABELS: Record<ResearchBranchId, string> = { ...mechanics.research.branches.labels }

export const RESEARCH_BRANCH_DESCRIPTIONS: Record<ResearchBranchId, string> = { ...mechanics.research.branches.descriptions }

export const RESEARCH_SUBGROUPS = Object.entries(mechanics.research.subgroups).reduce<Partial<Record<ResearchBranchId, Array<{
  id: string
  title: string
  subtitle: string
  techIds: ResearchTechId[]
  paddingTop?: number
  paddingBottom?: number
  paddingX?: number
  variant?: 'default' | 'office' | 'energy'
}>>>>((acc, [id, subgroup]) => {
  const branchId = subgroup.branch
  const entry = {
    id,
    title: subgroup.title,
    subtitle: subgroup.subtitle,
    techIds: subgroup.techIds as ResearchTechId[],
    paddingTop: subgroup.paddingTop,
    paddingBottom: subgroup.paddingBottom,
    paddingX: subgroup.paddingX,
    variant: subgroup.variant,
  }

  acc[branchId] = [...(acc[branchId] ?? []), entry]
  return acc
}, {})

export const RESEARCH_TECH: ResearchTechDefinition[] = (Object.entries(mechanics.research.tech) as Array<[ResearchTechId, typeof mechanics.research.tech[ResearchTechId]]>).map(([id, tech]) => ({
  id,
  name: String(tech.name),
  branch: tech.branch as ResearchTechDefinition['branch'],
  currency: tech.currency as ResearchTechDefinition['currency'],
  researchCost: Number(tech.cost),
  description: String(tech.description),
  prerequisites: Array.isArray(tech.prerequisites) ? tech.prerequisites as ResearchTechId[] : [],
  visibleWhen: buildMechanicsPredicate(tech.visibility),
  unlockWhen: buildMechanicsPredicate(tech.unlockRequirement),
}))

export const RESEARCH_TECH_MAP: Record<ResearchTechId, ResearchTechDefinition> = Object.fromEntries(
  RESEARCH_TECH.map((tech) => [tech.id, tech]),
) as Record<ResearchTechId, ResearchTechDefinition>

export function getResearchTechDefinition(techId: ResearchTechId): ResearchTechDefinition | undefined {
  return RESEARCH_TECH_MAP[techId]
}

export function getResearchTechsByBranch(branchId: ResearchBranchId): ResearchTechDefinition[] {
  return RESEARCH_TECH.filter((tech) => tech.branch === branchId)
}

export function getResearchTechCurrencyLabel(tech: ResearchTechDefinition): string {
  return tech.currency === 'cash' ? '$' : 'RP'
}

export function getResearchTechCostValue(state: GameState, techId: ResearchTechId): number {
  const tech = getResearchTechDefinition(techId)

  if (!tech) {
    return 0
  }

  return tech.currency === 'cash' ? state.cash : state.researchPoints
}
