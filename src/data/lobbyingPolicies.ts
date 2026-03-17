import type { LobbyingPolicyDefinition } from '../types/game'

export const LOBBYING_POLICIES: LobbyingPolicyDefinition[] = [
  {
    id: 'hiringIncentives',
    name: 'Payroll Reporting Reform',
    track: 'labor',
    influenceCost: 12,
    description: 'Reduces Staff Compliance costs.',
  },
  {
    id: 'deskExpansionCredits',
    name: 'Workforce Filing Simplification',
    track: 'labor',
    influenceCost: 20,
    description: 'Reduces staff burden contribution and trims Staff Compliance costs.',
  },
  {
    id: 'executiveCompensationReform',
    name: 'Training Accreditation Relief',
    track: 'labor',
    influenceCost: 32,
    description: 'Reduces human-side compliance drag.',
  },
  {
    id: 'industrialPowerSubsidies',
    name: 'Industrial Energy Relief',
    track: 'energy',
    influenceCost: 16,
    description: 'Reduces Energy Compliance costs.',
  },
  {
    id: 'priorityGridAccess',
    name: 'Grid Stabilization Subsidies',
    track: 'energy',
    influenceCost: 24,
    description: 'Reduces energy and infrastructure burden contribution.',
  },
  {
    id: 'dataCenterEnergyCredits',
    name: 'Data Center Utility Credits',
    track: 'energy',
    influenceCost: 36,
    description: 'Reduces Energy Compliance costs and lowers machine oversight burden.',
  },
  {
    id: 'capitalGainsRelief',
    name: 'Institutional Reporting Relief',
    track: 'market',
    influenceCost: 18,
    description: 'Reduces Institutional Compliance costs.',
  },
  {
    id: 'extendedTradingWindow',
    name: 'Market Access Streamlining',
    track: 'market',
    influenceCost: 28,
    description: 'Reduces sector burden contribution and market-access friction.',
  },
  {
    id: 'marketDeregulation',
    name: 'Capital Requirements Easing',
    track: 'market',
    influenceCost: 42,
    description: 'Reduces institutional burden contribution and softens sector-based compliance drag.',
  },
  {
    id: 'automationTaxCredit',
    name: 'Algorithmic Exemptions',
    track: 'technology',
    influenceCost: 20,
    description: 'Reduces Automation Compliance costs.',
  },
  {
    id: 'fastTrackServerPermits',
    name: 'Model Registration Reform',
    track: 'technology',
    influenceCost: 32,
    description: 'Reduces automation oversight burden, especially for ML and AI systems.',
  },
  {
    id: 'aiInfrastructureIncentives',
    name: 'AI Oversight Streamlining',
    track: 'technology',
    influenceCost: 48,
    description: 'Reduces advanced automation oversight pressure and softens compliance efficiency drag.',
  },
]

export function getLobbyingPolicyDefinition(policyId: LobbyingPolicyDefinition['id']): LobbyingPolicyDefinition | undefined {
  return LOBBYING_POLICIES.find((policy) => policy.id === policyId)
}
