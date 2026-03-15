import type { ResearchTechDefinition } from '../types/game'

export const RESEARCH_TECH: ResearchTechDefinition[] = [
  {
    id: 'algorithmicTrading',
    name: 'Algorithmic Trading',
    researchCost: 700,
    description: 'Unlock Rule-Based Bots for the desk.',
    visibleWhen: (state) => state.seniorTraderCount >= 5,
  },
  {
    id: 'powerSystemsEngineering',
    name: 'Power Systems Engineering',
    researchCost: 500,
    description: 'Expand from starter racks into Server Rooms and formal machine support systems.',
    visibleWhen: (state) => state.purchasedUpgrades.juniorHiringProgram === true,
  },
  {
    id: 'juniorScientists',
    name: 'Junior Scientists',
    researchCost: 100,
    description: 'Unlock Junior Scientists for the research team.',
    visibleWhen: (state) => state.internResearchScientistCount >= 5 || state.researchPoints >= 40,
  },
  {
    id: 'seniorScientists',
    name: 'Senior Scientists',
    researchCost: 1_000,
    description: 'Unlock Senior Scientists for the research team.',
    visibleWhen: (state) => state.purchasedResearchTech.juniorScientists === true && (state.juniorResearchScientistCount >= 5 || state.researchPoints >= 160),
  },
  {
    id: 'propDeskOperations',
    name: 'Prop Desk Operations',
    researchCost: 100,
    description: 'Unlock Prop Desks as the first move from traders to organized teams.',
    visibleWhen: (state) => state.seniorTraderCount >= 5,
  },
  {
    id: 'institutionalDesks',
    name: 'Institutional Desks',
    researchCost: 1_500,
    description: 'Unlock Institutional Desks for larger coordinated trading operations.',
    visibleWhen: (state) => state.purchasedResearchTech.propDeskOperations === true && state.propDeskCount >= 3,
  },
  {
    id: 'hedgeFundStrategies',
    name: 'Hedge Fund Strategies',
    researchCost: 7_500,
    description: 'Unlock Hedge Funds as a major institutional capital tier.',
    visibleWhen: (state) => state.purchasedResearchTech.institutionalDesks === true && state.institutionalDeskCount >= 2,
  },
  {
    id: 'investmentFirms',
    name: 'Investment Firms',
    researchCost: 20_000,
    description: 'Unlock Investment Firms as the broad top-tier human trading organization.',
    visibleWhen: (state) => state.purchasedResearchTech.hedgeFundStrategies === true && state.hedgeFundCount >= 1,
  },
  {
    id: 'dataCenterSystems',
    name: 'Data Centre Systems',
    researchCost: 9_000,
    description: 'Unlock Data Centres and ML Trading Bots for heavier machine infrastructure.',
    visibleWhen: (state) => state.purchasedResearchTech.powerSystemsEngineering === true && state.ruleBasedBotCount >= 5,
  },
  {
    id: 'aiTradingSystems',
    name: 'AI Trading Systems',
    researchCost: 22_000,
    description: 'Unlock AI Trading Bots and Cloud Infrastructure as the late-run autonomous machine tier.',
    visibleWhen: (state) => state.purchasedResearchTech.dataCenterSystems === true && state.mlTradingBotCount >= 3,
  },
  {
    id: 'regulatoryAffairs',
    name: 'Regulatory Affairs',
    researchCost: 6_000,
    description: 'Unlock Lobbying and institutional policy strategy.',
    visibleWhen: (state) => state.purchasedResearchTech.powerSystemsEngineering === true,
  },
]

export function getResearchTechDefinition(techId: ResearchTechDefinition['id']): ResearchTechDefinition | undefined {
  return RESEARCH_TECH.find((tech) => tech.id === techId)
}
