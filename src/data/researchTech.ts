import type { ResearchTechDefinition } from '../types/game'

export const RESEARCH_TECH: ResearchTechDefinition[] = [
  {
    id: 'algorithmicTrading',
    name: 'Algorithmic Trading',
    researchCost: 100,
    description: 'Unlock Trading Bots for the desk.',
    visibleWhen: (state) => state.seniorTraderCount >= 5,
  },
  {
    id: 'powerSystemsEngineering',
    name: 'Power Systems Engineering',
    researchCost: 150,
    description: 'Unlock infrastructure and machine support systems.',
    visibleWhen: (state) => state.purchasedResearchTech.algorithmicTrading === true || state.tradingBotCount > 0,
  },
  {
    id: 'seniorScientists',
    name: 'Senior Scientists',
    researchCost: 160,
    description: 'Unlock Senior Scientists for the research team.',
    visibleWhen: (state) => state.juniorResearchScientistCount >= 5 || state.researchPoints >= 80,
  },
  {
    id: 'dataCenterSystems',
    name: 'Data Centre Systems',
    researchCost: 325,
    description: 'Unlock Data Centres for heavy machine infrastructure.',
    visibleWhen: (state) => state.purchasedResearchTech.powerSystemsEngineering === true && state.tradingBotCount >= 5,
  },
  {
    id: 'tradingServers',
    name: 'Trading Servers',
    researchCost: 450,
    description: 'Unlock Trading Servers as the heavy machine tier.',
    visibleWhen: (state) => state.purchasedResearchTech.dataCenterSystems === true && state.tradingBotCount >= 5,
  },
  {
    id: 'regulatoryAffairs',
    name: 'Regulatory Affairs',
    researchCost: 250,
    description: 'Unlock Lobbying and institutional policy strategy.',
    visibleWhen: (state) => state.purchasedResearchTech.powerSystemsEngineering === true,
  },
]

export function getResearchTechDefinition(techId: ResearchTechDefinition['id']): ResearchTechDefinition | undefined {
  return RESEARCH_TECH.find((tech) => tech.id === techId)
}
