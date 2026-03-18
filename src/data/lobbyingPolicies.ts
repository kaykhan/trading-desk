import type { LobbyingPolicyDefinition } from '../types/game'
import { mechanics } from '../lib/mechanics'

export const LOBBYING_POLICIES: LobbyingPolicyDefinition[] = [
  {
    id: 'hiringIncentives',
    name: mechanics.lobbyingPolicies.hiringIncentives.name,
    track: mechanics.lobbyingPolicies.hiringIncentives.track,
    influenceCost: mechanics.lobbyingPolicies.hiringIncentives.cost,
    description: 'Reduces Staff Compliance costs.',
  },
  {
    id: 'deskExpansionCredits',
    name: mechanics.lobbyingPolicies.deskExpansionCredits.name,
    track: mechanics.lobbyingPolicies.deskExpansionCredits.track,
    influenceCost: mechanics.lobbyingPolicies.deskExpansionCredits.cost,
    description: 'Reduces staff burden contribution and trims Staff Compliance costs.',
  },
  {
    id: 'executiveCompensationReform',
    name: mechanics.lobbyingPolicies.executiveCompensationReform.name,
    track: mechanics.lobbyingPolicies.executiveCompensationReform.track,
    influenceCost: mechanics.lobbyingPolicies.executiveCompensationReform.cost,
    description: 'Reduces human-side compliance drag.',
  },
  {
    id: 'industrialPowerSubsidies',
    name: mechanics.lobbyingPolicies.industrialPowerSubsidies.name,
    track: mechanics.lobbyingPolicies.industrialPowerSubsidies.track,
    influenceCost: mechanics.lobbyingPolicies.industrialPowerSubsidies.cost,
    description: 'Reduces Energy Compliance costs.',
  },
  {
    id: 'priorityGridAccess',
    name: mechanics.lobbyingPolicies.priorityGridAccess.name,
    track: mechanics.lobbyingPolicies.priorityGridAccess.track,
    influenceCost: mechanics.lobbyingPolicies.priorityGridAccess.cost,
    description: 'Reduces energy and infrastructure burden contribution.',
  },
  {
    id: 'dataCenterEnergyCredits',
    name: mechanics.lobbyingPolicies.dataCenterEnergyCredits.name,
    track: mechanics.lobbyingPolicies.dataCenterEnergyCredits.track,
    influenceCost: mechanics.lobbyingPolicies.dataCenterEnergyCredits.cost,
    description: 'Reduces Energy Compliance costs and lowers machine oversight burden.',
  },
  {
    id: 'capitalGainsRelief',
    name: mechanics.lobbyingPolicies.capitalGainsRelief.name,
    track: mechanics.lobbyingPolicies.capitalGainsRelief.track,
    influenceCost: mechanics.lobbyingPolicies.capitalGainsRelief.cost,
    description: 'Reduces Institutional Compliance costs.',
  },
  {
    id: 'extendedTradingWindow',
    name: mechanics.lobbyingPolicies.extendedTradingWindow.name,
    track: mechanics.lobbyingPolicies.extendedTradingWindow.track,
    influenceCost: mechanics.lobbyingPolicies.extendedTradingWindow.cost,
    description: 'Reduces sector burden contribution and market-access friction.',
  },
  {
    id: 'marketDeregulation',
    name: mechanics.lobbyingPolicies.marketDeregulation.name,
    track: mechanics.lobbyingPolicies.marketDeregulation.track,
    influenceCost: mechanics.lobbyingPolicies.marketDeregulation.cost,
    description: 'Reduces institutional burden contribution and softens sector-based compliance drag.',
  },
  {
    id: 'automationTaxCredit',
    name: mechanics.lobbyingPolicies.automationTaxCredit.name,
    track: mechanics.lobbyingPolicies.automationTaxCredit.track,
    influenceCost: mechanics.lobbyingPolicies.automationTaxCredit.cost,
    description: 'Reduces Automation Compliance costs.',
  },
  {
    id: 'fastTrackServerPermits',
    name: mechanics.lobbyingPolicies.fastTrackServerPermits.name,
    track: mechanics.lobbyingPolicies.fastTrackServerPermits.track,
    influenceCost: mechanics.lobbyingPolicies.fastTrackServerPermits.cost,
    description: 'Reduces automation oversight burden, especially for ML and AI systems.',
  },
  {
    id: 'aiInfrastructureIncentives',
    name: mechanics.lobbyingPolicies.aiInfrastructureIncentives.name,
    track: mechanics.lobbyingPolicies.aiInfrastructureIncentives.track,
    influenceCost: mechanics.lobbyingPolicies.aiInfrastructureIncentives.cost,
    description: 'Reduces advanced automation oversight pressure and softens compliance efficiency drag.',
  },
]

export function getLobbyingPolicyDefinition(policyId: LobbyingPolicyDefinition['id']): LobbyingPolicyDefinition | undefined {
  return LOBBYING_POLICIES.find((policy) => policy.id === policyId)
}
