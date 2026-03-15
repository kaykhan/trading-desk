import type { LobbyingPolicyDefinition } from '../types/game'

export const LOBBYING_POLICIES: LobbyingPolicyDefinition[] = [
  {
    id: 'hiringIncentives',
    name: 'Hiring Incentives',
    track: 'labor',
    influenceCost: 3,
    description: 'Reduce Junior Trader costs by 10 percent.',
  },
  {
    id: 'deskExpansionCredits',
    name: 'Desk Expansion Credits',
    track: 'labor',
    influenceCost: 4,
    description: 'Reduce Senior Trader costs by 10 percent.',
  },
  {
    id: 'executiveCompensationReform',
    name: 'Executive Compensation Reform',
    track: 'labor',
    influenceCost: 6,
    description: 'Increase Senior Trader output by 15 percent.',
  },
  {
    id: 'industrialPowerSubsidies',
    name: 'Industrial Power Subsidies',
    track: 'energy',
    influenceCost: 4,
    description: 'Reduce Power infrastructure costs by 10 percent.',
  },
  {
    id: 'priorityGridAccess',
    name: 'Priority Grid Access',
    track: 'energy',
    influenceCost: 6,
    description: 'Increase all Power capacity by 15 percent.',
  },
  {
    id: 'dataCenterEnergyCredits',
    name: 'Data Center Energy Credits',
    track: 'energy',
    influenceCost: 7,
    description: 'Reduce Trading Bot power usage by 20 percent.',
  },
  {
    id: 'capitalGainsRelief',
    name: 'Capital Gains Relief',
    track: 'market',
    influenceCost: 4,
    description: 'Increase all profits by 10 percent.',
  },
  {
    id: 'extendedTradingWindow',
    name: 'Extended Trading Window',
    track: 'market',
    influenceCost: 6,
    description: 'Increase manual trade income by 25 percent.',
  },
  {
    id: 'marketDeregulation',
    name: 'Market Deregulation',
    track: 'market',
    influenceCost: 9,
    description: 'Increase all profits by another 15 percent.',
  },
  {
    id: 'automationTaxCredit',
    name: 'Automation Tax Credit',
    track: 'technology',
    influenceCost: 5,
    description: 'Reduce Trading Bot costs by 10 percent.',
  },
  {
    id: 'fastTrackServerPermits',
    name: 'Fast-Track Server Permits',
    track: 'technology',
    influenceCost: 7,
    description: 'Increase Trading Bot output by 15 percent.',
  },
  {
    id: 'aiInfrastructureIncentives',
    name: 'AI Infrastructure Incentives',
    track: 'technology',
    influenceCost: 10,
    description: 'Increase machine efficiency by 10 percent.',
  },
]

export function getLobbyingPolicyDefinition(policyId: LobbyingPolicyDefinition['id']): LobbyingPolicyDefinition | undefined {
  return LOBBYING_POLICIES.find((policy) => policy.id === policyId)
}
