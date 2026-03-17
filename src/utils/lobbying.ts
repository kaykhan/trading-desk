import type { GameState, LobbyingPolicyId } from '../types/game'

type LobbyingPolicyReliefDefinition = {
  burdenRelief?: number
  penaltyRelief?: number
  humanPenaltyRelief?: number
  staffCostReduction?: number
  energyCostReduction?: number
  automationCostReduction?: number
  institutionalCostReduction?: number
  sectorRelief?: number
  automationOversightRelief?: number
  institutionalReportingRelief?: number
  effectSummary: string
}

const LOBBYING_POLICY_RELIEF: Record<LobbyingPolicyId, LobbyingPolicyReliefDefinition> = {
  hiringIncentives: {
    staffCostReduction: 0.12,
    effectSummary: 'Reduces Staff Compliance costs by 12%.',
  },
  deskExpansionCredits: {
    burdenRelief: 1,
    staffCostReduction: 0.08,
    effectSummary: 'Staff burden contribution -10%, Staff Compliance costs -8%.',
  },
  executiveCompensationReform: {
    humanPenaltyRelief: 0.05,
    effectSummary: 'Human-side compliance drag -5%.',
  },
  industrialPowerSubsidies: {
    energyCostReduction: 0.15,
    effectSummary: 'Reduces Energy Compliance costs by 15%.',
  },
  priorityGridAccess: {
    burdenRelief: 1.2,
    effectSummary: 'Energy and infrastructure burden contribution -12%.',
  },
  dataCenterEnergyCredits: {
    energyCostReduction: 0.1,
    automationOversightRelief: 0.8,
    effectSummary: 'Energy Compliance costs -10%, machine oversight burden -8%.',
  },
  capitalGainsRelief: {
    institutionalCostReduction: 0.15,
    institutionalReportingRelief: 0.5,
    effectSummary: 'Reduces Institutional Compliance costs by 15%.',
  },
  extendedTradingWindow: {
    sectorRelief: 1,
    effectSummary: 'Sector burden contribution -10%.',
  },
  marketDeregulation: {
    burdenRelief: 1,
    penaltyRelief: 0.05,
    institutionalReportingRelief: 1,
    effectSummary: 'Institutional burden contribution -10%, sector compliance drag -5%.',
  },
  automationTaxCredit: {
    automationCostReduction: 0.15,
    effectSummary: 'Reduces Automation Compliance costs by 15%.',
  },
  fastTrackServerPermits: {
    automationOversightRelief: 1.2,
    effectSummary: 'Automation oversight burden -12%, especially for ML and AI systems.',
  },
  aiInfrastructureIncentives: {
    penaltyRelief: 0.05,
    automationOversightRelief: 1,
    effectSummary: 'Advanced automation oversight pressure -10%, compliance efficiency drag -5%.',
  },
}

export function getLobbyingPolicyReliefDefinition(policyId: LobbyingPolicyId): LobbyingPolicyReliefDefinition {
  return LOBBYING_POLICY_RELIEF[policyId]
}

function hasPolicy(state: GameState, policyId: LobbyingPolicyId): boolean {
  return state.purchasedPolicies[policyId] === true
}

function sumPurchasedPolicyValues(state: GameState, selector: (definition: LobbyingPolicyReliefDefinition) => number | undefined): number {
  let total = 0

  for (const policyId of Object.keys(LOBBYING_POLICY_RELIEF) as LobbyingPolicyId[]) {
    if (!hasPolicy(state, policyId)) {
      continue
    }

    total += selector(LOBBYING_POLICY_RELIEF[policyId]) ?? 0
  }

  return total
}

export function getComplianceBurdenRelief(state: GameState): number {
  return sumPurchasedPolicyValues(state, (definition) => definition.burdenRelief)
}

export function getCompliancePenaltyRelief(state: GameState): number {
  return sumPurchasedPolicyValues(state, (definition) => definition.penaltyRelief)
}

export function getHumanCompliancePenaltyRelief(state: GameState): number {
  return sumPurchasedPolicyValues(state, (definition) => definition.humanPenaltyRelief)
}

export function getStaffComplianceCostReliefRate(state: GameState): number {
  return Math.min(0.5, sumPurchasedPolicyValues(state, (definition) => definition.staffCostReduction))
}

export function getEnergyComplianceCostReliefRate(state: GameState): number {
  return Math.min(0.5, sumPurchasedPolicyValues(state, (definition) => definition.energyCostReduction))
}

export function getAutomationComplianceCostReliefRate(state: GameState): number {
  return Math.min(0.5, sumPurchasedPolicyValues(state, (definition) => definition.automationCostReduction))
}

export function getInstitutionalComplianceCostReliefRate(state: GameState): number {
  return Math.min(0.5, sumPurchasedPolicyValues(state, (definition) => definition.institutionalCostReduction))
}

export function getSectorComplianceRelief(state: GameState): number {
  return sumPurchasedPolicyValues(state, (definition) => definition.sectorRelief)
}

export function getAutomationOversightRelief(state: GameState): number {
  return sumPurchasedPolicyValues(state, (definition) => definition.automationOversightRelief)
}

export function getInstitutionalReportingRelief(state: GameState): number {
  return sumPurchasedPolicyValues(state, (definition) => definition.institutionalReportingRelief)
}

export function getActiveLobbyingPolicyIds(state: GameState): LobbyingPolicyId[] {
  return (Object.keys(LOBBYING_POLICY_RELIEF) as LobbyingPolicyId[]).filter((policyId) => hasPolicy(state, policyId))
}

export function getLobbyingReadout(state: GameState): string {
  const activePolicies = getActiveLobbyingPolicyIds(state)

  if (activePolicies.length <= 0) {
    return 'No active relief yet. Lobbying is available, but compliance pressure is still mostly unmanaged.'
  }

  if (getComplianceBurdenRelief(state) >= 2) {
    return 'Active policy relief is now materially reducing burden growth and softening recurring compliance pressure.'
  }

  if (getAutomationComplianceCostReliefRate(state) > 0 || getInstitutionalComplianceCostReliefRate(state) > 0) {
    return 'Lobbying is starting to stabilize heavier automation and institutional builds.'
  }

  return 'Early lobbying relief is active and already trimming compliance costs and drag.'
}

export function getPolicyActiveSavingsSummary(state: GameState, policyId: LobbyingPolicyId): string | null {
  if (!hasPolicy(state, policyId)) {
    return null
  }

  const definition = getLobbyingPolicyReliefDefinition(policyId)
  const savings: string[] = []

  if (definition.staffCostReduction) {
    const total = (state.internCount * 1 + state.juniorTraderCount * 2 + state.seniorTraderCount * 4 + state.internResearchScientistCount * 1 + state.juniorResearchScientistCount * 2.5 + state.seniorResearchScientistCount * 5 + state.juniorPoliticianCount * 3) * definition.staffCostReduction
    savings.push(`Active Savings: $${Math.round(total)} staff / review`)
  }

  if (definition.energyCostReduction) {
    const total = (state.serverRackCount * 0.6 + state.serverRoomCount * 6 + state.dataCenterCount * 44 + state.cloudComputeCount * 140) * definition.energyCostReduction
    savings.push(`Active Savings: $${Math.round(total)} energy / review`)
  }

  if (definition.automationCostReduction) {
    const total = (state.quantTraderCount * 1 + state.ruleBasedBotCount * 3 + state.mlTradingBotCount * 6 + state.aiTradingBotCount * 12) * definition.automationCostReduction
    savings.push(`Active Savings: $${Math.round(total)} automation / review`)
  }

  if (definition.institutionalCostReduction) {
    const total = (state.propDeskCount * 5 + state.institutionalDeskCount * 10 + state.hedgeFundCount * 20 + state.investmentFirmCount * 40) * definition.institutionalCostReduction
    savings.push(`Active Savings: $${Math.round(total)} institutional / review`)
  }

  if (definition.burdenRelief) {
    savings.push(`Burden Relief: -${definition.burdenRelief.toFixed(1)}`)
  }

  if (definition.penaltyRelief) {
    savings.push(`Drag Relief: +${(definition.penaltyRelief * 100).toFixed(1)}% efficiency`)
  }

  if (definition.humanPenaltyRelief) {
    savings.push(`Human Drag Relief: +${(definition.humanPenaltyRelief * 100).toFixed(1)}%`)
  }

  return savings.length > 0 ? savings.join(' | ') : null
}
