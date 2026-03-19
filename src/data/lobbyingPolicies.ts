import type { LobbyingPolicyDefinition, LobbyingPolicyId, LobbyingTrack } from '../types/game'
import { mechanics } from '../lib/mechanics'

export const LOBBYING_TRACK_ORDER: LobbyingTrack[] = [...mechanics.lobbyingPolicies.trackOrder]

export const LOBBYING_TRACK_LABELS: Record<LobbyingTrack, string> = { ...mechanics.lobbyingPolicies.trackLabels }

export const LOBBYING_TRACK_DESCRIPTIONS: Record<LobbyingTrack, string> = { ...mechanics.lobbyingPolicies.trackDescriptions }

const LOBBYING_POLICY_DESCRIPTIONS: Record<LobbyingPolicyId, string> = {
  hiringIncentives: 'Reduces Staff Compliance costs.',
  deskExpansionCredits: 'Reduces staff burden contribution and trims Staff Compliance costs.',
  executiveCompensationReform: 'Reduces human-side compliance drag.',
  industrialPowerSubsidies: 'Reduces Energy Compliance costs.',
  priorityGridAccess: 'Reduces energy and infrastructure burden contribution.',
  dataCenterEnergyCredits: 'Reduces Energy Compliance costs and lowers machine oversight burden.',
  capitalGainsRelief: 'Reduces Institutional Compliance costs.',
  extendedTradingWindow: 'Reduces sector burden contribution and market-access friction.',
  marketDeregulation: 'Reduces institutional burden contribution and softens sector-based compliance drag.',
  automationTaxCredit: 'Reduces Automation Compliance costs.',
  fastTrackServerPermits: 'Reduces automation oversight burden, especially for ML and AI systems.',
  aiInfrastructureIncentives: 'Reduces advanced automation oversight pressure and softens compliance efficiency drag.',
}

export const LOBBYING_POLICIES: LobbyingPolicyDefinition[] = (Object.entries(mechanics.lobbyingPolicies.items) as Array<[LobbyingPolicyId, typeof mechanics.lobbyingPolicies.items[LobbyingPolicyId]]>).map(([id, policy]) => ({
  id,
  name: policy.name,
  track: policy.track,
  influenceCost: policy.cost,
  description: LOBBYING_POLICY_DESCRIPTIONS[id],
}))

const LOBBYING_POLICY_MAP = Object.fromEntries(LOBBYING_POLICIES.map((policy) => [policy.id, policy])) as Record<LobbyingPolicyId, LobbyingPolicyDefinition>

export function getLobbyingPolicyDefinition(policyId: LobbyingPolicyDefinition['id']): LobbyingPolicyDefinition | undefined {
  return LOBBYING_POLICY_MAP[policyId]
}
