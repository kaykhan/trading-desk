import type {
  AutomationStrategyId,
  AutomationUnitId,
  BuyMode,
  CompliancePaymentCategoryId,
  DeskViewId,
  GlobalBoostId,
  LobbyingPolicyId,
  LobbyingTrack,
  MarketEventCategory,
  MarketEventId,
  MilestoneCategoryId,
  MilestoneConditionModel,
  PowerInfrastructureId,
  PrestigeTierId,
  PrestigeUpgradeId,
  RepeatableUpgradeCurrency,
  RepeatableUpgradeFamily,
  RepeatableUpgradeId,
  ResearchBranchId,
  ResearchTechCurrency,
  ResearchTechId,
  SectorId,
  TimedBoostId,
  TimedBoostUnlockId,
  UnitId,
  UpgradeCategory,
  UpgradeGroup,
  UpgradeId,
} from './game'

export type MechanicsCondition = {
  all?: MechanicsCondition[]
  any?: MechanicsCondition[]
  prestigeCountAtLeast?: number
  discoveredLobbying?: boolean
  complianceVisible?: boolean
  anySectorUnlocked?: boolean
  purchasedPoliciesAtLeast?: number
  scientistsCountAtLeast?: number
  scientistCountAtLeast?: number
  humanCountAtLeast?: number
  institutionCountAtLeast?: number
  automationCountAtLeast?: number
  automationPowerUsersAtLeast?: number
  automationStrategiesUnlockedAtLeast?: number
  anyPowerInfrastructureAtLeast?: number
  activeTraderSeatsAtLeast?: number
  specialistsOrMandatesAtLeast?: number
  totalMandatesAtLeast?: number
  researchPointsAtLeast?: number
  researchTechPurchased?: ResearchTechId[]
  automationKindsAny?: AutomationUnitId[]
  internCountAtLeast?: number
  juniorTraderCountAtLeast?: number
  seniorTraderCountAtLeast?: number
  quantTraderCountAtLeast?: number
  propDeskCountAtLeast?: number
  institutionalDeskCountAtLeast?: number
  hedgeFundCountAtLeast?: number
  investmentFirmCountAtLeast?: number
  ruleBasedBotCountAtLeast?: number
  mlTradingBotCountAtLeast?: number
  aiTradingBotCountAtLeast?: number
  internResearchScientistCountAtLeast?: number
  juniorResearchScientistCountAtLeast?: number
  seniorResearchScientistCountAtLeast?: number
  juniorPoliticianCountAtLeast?: number
  serverRackCountAtLeast?: number
  serverRoomCountAtLeast?: number
  dataCenterCountAtLeast?: number
  cloudComputeCountAtLeast?: number
}

type MechanicsTimedBoostDefinition = {
  name: string
  description: string
  durationSeconds: number
  cooldownSeconds: number
  unlockResearchTechId: TimedBoostUnlockId
  [key: string]: number | string
}

type MechanicsGlobalBoostDefinition = {
  name: string
  description: string
  multiplier: number
}

type MechanicsMarketEventDefinition = {
  name: string
  category: MarketEventCategory
  description: string
  durationSeconds: number
  affectedSector?: SectorId
  sectorOutputMultiplier?: number
  automationOutputMultiplier?: number
  machineEfficiencyMultiplier?: number
  globalOutputMultiplier?: number
}

type MechanicsUpgradeDefinition = {
  name: string
  group: UpgradeGroup
  category: Exclude<UpgradeCategory, 'prestige'>
  cost: number
  description: string
  visibleWhen: MechanicsCondition | null
  quirk?: string
}

type MechanicsRepeatableUpgradeDefinition = {
  name: string
  family: RepeatableUpgradeFamily
  currency: RepeatableUpgradeCurrency
  baseCost: number
  costScaling: number
  costModel: string
  maxRank: number
  effectPerRank: number
  effectModel: string
  floor?: number
  visibleAfterPrestigeCount: number
  unlockRequires: MechanicsCondition
  description: string
  perRankDescription: string
  unlockConditionDescription: string
  quirk?: string
}

type MechanicsResearchTechDefinition = {
  name: string
  description: string
  branch: ResearchBranchId
  currency: ResearchTechCurrency
  cost: number
  prerequisites?: ResearchTechId[]
  visibility?: MechanicsCondition
  unlockRequirement?: MechanicsCondition
}

type MechanicsPrestigeUpgradeDefinition = {
  name: string
  maxRank: number
  effectPerRank: number
  effectKind: string
  costModel: string
  floor?: number
  description: string
}

type MechanicsMilestoneItemDefinition = {
  name: string
  description: string
  category: MilestoneCategoryId
  displayOrder: number
  reward: {
    cash?: number
    researchPoints?: number
    influence?: number
    reputation?: number
    deskSlots?: number
    note?: string
  }
  conditionModel: MilestoneConditionModel
  conditionValue?: number
  targetId?: string
  thresholds?: Partial<Record<UnitId, number>>
  achievementKey?: string
}

export type MechanicsJson = {
  meta: {
    schemaVersion: number
    canonical: boolean
    style: string
    purpose: string
    authoringRules: string[]
    notes: string[]
  }
  runtime: {
    save: {
      storageKey: string
      autosaveIntervalMs: number
      importExportEncoding: string
    }
    loop: {
      tickIntervalMs: number
      tickOrder: string[]
    }
    buyModes: BuyMode[]
    offline: {
      capSeconds: number
      simulatedSystems: string[]
    }
    marketEvents: {
      cooldownMinSeconds: number
      cooldownMaxSeconds: number
      historyLimit: number
      preventImmediateRepeat: boolean
      initialCooldownSeconds: number
    }
    compliance: {
      reviewIntervalSeconds: number
      revealBurdenThreshold: number
      efficiencyFloor: number
      efficiencyLossPerBurden: number
      autoPayOrder: CompliancePaymentCategoryId[]
    }
  }
  startingState: {
    resources: {
      cash: number
      researchPoints: number
      influence: number
      reputation: number
    }
    counts: Record<UnitId | 'deskSpace' | 'floorSpace' | 'office' | 'serverRack' | 'serverRoom' | 'dataCenter' | 'cloudCompute', number>
    lifetime: {
      lifetimeManualTrades: number
      lifetimeResearchPointsEarned: number
      lifetimeCashEarned: number
      totalComplianceReviewsTriggered: number
      totalCompliancePaymentsMade: number
      totalTimedBoostActivations: number
      reputationSpent: number
      prestigeCount: number
      totalOfflineSecondsApplied: number
    }
    flags: {
      discoveredLobbying: boolean
      complianceVisible: boolean
      complianceTabOpened: boolean
    }
    baseDeskSlots: number
    unlockedSectors: Record<SectorId, boolean>
    timers: {
      complianceReviewRemainingSeconds: number
      nextMarketEventCooldownSeconds: number
      activeMarketEventRemainingSeconds: number
    }
    timedBoosts: Record<TimedBoostId, { isActive: boolean; remainingActiveSeconds: number; remainingCooldownSeconds: number; autoEnabled: boolean }>
    globalBoostsOwned: Record<GlobalBoostId, boolean>
    automationConfig: Record<'quantTrader' | 'ruleBasedBot' | 'mlTradingBot' | 'aiTradingBot', { strategy: AutomationStrategyId | null; marketTarget: SectorId | null }>
    automationCycleState: Record<'quantTrader' | 'ruleBasedBot' | 'mlTradingBot' | 'aiTradingBot', { progressSeconds: number; lastPayout: number; lastCompletedAt: number | null }>
    compliancePayments: Record<CompliancePaymentCategoryId, { overdueAmount: number; paidThisCycle: number; lastPayment: number }>
    lastCompliancePayment: number
    activeMarketEvent: string | null
    marketEventHistory: unknown[]
    sectorAssignments: Record<'intern' | 'juniorTrader' | 'seniorTrader' | 'propDesk' | 'institutionalDesk' | 'hedgeFund' | 'investmentFirm', Record<SectorId, number>>
    traderSpecialists: Record<'seniorTrader', Record<SectorId, number>>
    institutionMandates: Record<'propDesk' | 'institutionalDesk' | 'hedgeFund' | 'investmentFirm', Record<SectorId, number>>
    purchased: {
      upgrades: Partial<Record<string, boolean>>
      researchTech: Partial<Record<string, boolean>>
      policies: Partial<Record<string, boolean>>
      prestigeUpgrades: Partial<Record<string, number>>
      repeatableUpgradeRanks: Partial<Record<string, number>>
      unlockedMilestones: Partial<Record<string, boolean>>
    }
    timestamps: {
      lastSaveTimestamp: number | 'runtime_now'
    }
    settings: {
      autosaveEnabled: boolean
      complianceAutoPayEnabled: Record<CompliancePaymentCategoryId, boolean>
      shortNumberThreshold: number
    }
    ui: {
      activeDeskView: DeskViewId
      capacityBuyModes: Record<'deskSpace' | 'floorSpace' | 'office', BuyMode>
      powerBuyModes: Record<PowerInfrastructureId, BuyMode>
      repeatableUpgradeBuyModes: Record<RepeatableUpgradeId, BuyMode>
      researchBranchExpanded: Record<ResearchBranchId, boolean>
      prestigePurchasePlan: Record<PrestigeUpgradeId, number>
      dismissedSectorUnlocks: Record<SectorId, boolean>
      dismissedCapacityFull: boolean
      unitBuyModes: Record<UnitId, BuyMode>
    }
  }
  constants: Record<string, unknown>
  costModels: Record<string, unknown>
  effectModels: Record<string, unknown>
  multipliers: {
    timedBoosts: Record<TimedBoostId, MechanicsTimedBoostDefinition>
    globalBoosts: Record<GlobalBoostId, MechanicsGlobalBoostDefinition>
    marketEvents: Record<MarketEventId, MechanicsMarketEventDefinition>
    upgrades: Record<string, number>
    policies: Record<string, number>
    specialization: Record<string, number>
    mandates: Record<string, number>
  }
  compliance: Record<string, unknown>
  sectors: Record<SectorId, { id: SectorId; name: string; baseProfitMultiplier: number; description: string; unlockResearchTechId: ResearchTechId | null }>
  units: Record<UnitId, Record<string, unknown>>
  capacityInfrastructure: {
    baseDeskSlots: number
    deskSpace: { name: string; description: string; baseCost: number; costScaling: number; costModel: string; slotsGranted: number; powerUsage: number; unlockResearchTechId: ResearchTechId | null }
    floorSpace: { name: string; description: string; baseCost: number; costScaling: number; costModel: string; slotsGranted: number; powerUsage: number; unlockResearchTechId: ResearchTechId | null }
    office: { name: string; description: string; baseCost: number; costScaling: number; costModel: string; slotsGranted: number; powerUsage: number; unlockResearchTechId: ResearchTechId | null }
  }
  powerInfrastructure: Record<PowerInfrastructureId, { name: string; description: string; baseCost: number; costScaling: number; costModel: string; powerCapacity: number; unlockResearchTechId: ResearchTechId }>
  automationStrategies: Record<AutomationStrategyId, { name: string; description: string; unlockResearchTechId: ResearchTechId; targetMultipliers: Record<SectorId | 'none', number> }>
  upgrades: Record<UpgradeId, MechanicsUpgradeDefinition>
  repeatableUpgrades: Record<RepeatableUpgradeId, MechanicsRepeatableUpgradeDefinition>
  lobbyingPolicies: Record<LobbyingPolicyId, { name: string; track: LobbyingTrack; cost: number }>
  research: {
    branches: {
      order: ResearchBranchId[]
      labels: Record<ResearchBranchId, string>
      descriptions: Record<ResearchBranchId, string>
    }
    tech: Record<ResearchTechId, MechanicsResearchTechDefinition>
  }
  prestige: {
    tiers: PrestigeTierId[]
    tierLabels: Record<PrestigeTierId, string>
    gainCurve: number[]
    unlockRequirements: Record<string, unknown>
    resetKeeps: string[]
    upgrades: Record<PrestigeUpgradeId, MechanicsPrestigeUpgradeDefinition>
  }
  specialization: Record<string, unknown>
  mandates: Record<string, unknown>
  milestones: {
    categoryOrder: MilestoneCategoryId[]
    categoryLabels: Record<MilestoneCategoryId, string>
    items: Record<string, MechanicsMilestoneItemDefinition>
  }
  formulaNotes: Record<string, unknown>
  knownQuirks: string[]
}
