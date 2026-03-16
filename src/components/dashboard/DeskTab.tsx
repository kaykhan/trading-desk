import { FlaskConical, Lock, MonitorCog, TrendingUp, Users } from 'lucide-react'
import { CAPACITY_INFRASTRUCTURE } from '@/data/capacity'
import { POWER_INFRASTRUCTURE } from '@/data/powerInfrastructure'
import { UNITS } from '@/data/units'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import type { BuyMode, DeskViewId, UnitId } from '@/types/game'
import { formatCurrency, formatNumber, formatPlainRate, formatRate } from '@/utils/formatting'
import { GAME_CONSTANTS } from '@/data/constants'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectorsTab } from './SectorsTab'
import { PurchaseCard } from './DashboardPrimitives'

const BUY_MODES: BuyMode[] = [1, 5, 10, 'max']

const deskViewMeta: Array<{ id: DeskViewId; label: string; disabled?: boolean }> = [
  { id: 'trading', label: 'Trading' },
  { id: 'sectors', label: 'Sectors' },
  { id: 'scientists', label: 'Scientists' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'politicians', label: 'Politicians' },
  { id: 'commodities', label: 'Commodities', disabled: true },
]

type UnitPanelConfig = {
  unitId: UnitId
  title: string
  purchaseLabel: string
  lockedReason: string
  totalLabel: string
  extraBadges?: string[]
}

type HumanAssignmentSummary = {
  owned: number
  assigned: number
  available: number
}

function DeskUnitBuyControls({ unitId, activeMode, onChange }: { unitId: UnitId; activeMode: BuyMode; onChange: (_mode: BuyMode) => void }) {
  const label = unitId === 'intern'
    ? 'Intern'
    : unitId === 'juniorTrader'
    ? 'Junior'
    : unitId === 'seniorTrader'
      ? 'Senior'
      : unitId === 'ruleBasedBot'
        ? 'Rule'
        : unitId === 'mlTradingBot'
          ? 'ML'
          : unitId === 'aiTradingBot'
            ? 'AI'
          : unitId === 'internResearchScientist'
            ? 'Int Sci'
          : unitId === 'juniorResearchScientist'
            ? 'Jr Sci'
            : unitId === 'seniorResearchScientist'
              ? 'Sr Sci'
              : unitId === 'propDesk'
                ? 'Prop'
                : unitId === 'institutionalDesk'
                  ? 'Inst'
                  : unitId === 'hedgeFund'
                    ? 'Fund'
                    : unitId === 'investmentFirm'
                      ? 'Firm'
              : 'Policy'

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      {BUY_MODES.map((mode) => (
        <Button
          key={`${unitId}-${String(mode)}`}
          size="xs"
          variant={activeMode === mode ? 'default' : 'outline'}
          className="rounded-md uppercase tracking-[0.12em]"
          onClick={() => onChange(mode)}
        >
          {typeof mode === 'number' ? `x${mode}` : 'Max'}
        </Button>
      ))}
    </div>
  )
}

function UnitPanel({ config, incomeLabel, totalCost, nextCost, quantity, buyMode, disabled, unlocked, titleDescription, onBuy, onModeChange, assignmentSummary }: {
  config: UnitPanelConfig
  incomeLabel: string
  totalCost: number
  nextCost: number
  quantity: number
  buyMode: BuyMode
  disabled: boolean
  unlocked: boolean
  titleDescription: string
  onBuy: () => void
  onModeChange: (_mode: BuyMode) => void
  assignmentSummary?: HumanAssignmentSummary
}) {
  const blockedByDeskCapacity = (config.unitId === 'intern' || config.unitId === 'juniorTrader' || config.unitId === 'seniorTrader') && disabled && totalCost === 0
  const status = unlocked ? (blockedByDeskCapacity ? 'Need Desk Slots' : disabled ? 'Need cash' : 'Ready') : 'Locked'
  const statusTone = unlocked ? (blockedByDeskCapacity ? 'locked' : disabled ? 'default' : 'ready') : 'locked'
  const badges = [
    `${quantity} owned`,
    ...(assignmentSummary ? [`${assignmentSummary.assigned} assigned`, `${assignmentSummary.available} available`] : []),
    `${config.totalLabel} ${incomeLabel}`,
    ...(config.extraBadges ?? []),
  ]

  return (
    <div className={!unlocked ? 'opacity-60' : undefined}>
      <PurchaseCard
        title={config.title}
        description={unlocked ? titleDescription : config.lockedReason}
        infoTooltip={`${unlocked ? titleDescription : config.lockedReason}\n\n${buyMode === 'max' ? `Max (${quantity})` : `x${buyMode}`} costs ${formatCurrency(totalCost || nextCost)}${buyMode !== 'max' ? ` | Next ${formatCurrency(nextCost)}` : ''}`}
        status={status}
        statusTone={statusTone}
        actionLabel={`${config.purchaseLabel} ${formatCurrency(totalCost || nextCost)}`}
        disabled={!unlocked || disabled}
        disabledReason={!unlocked ? config.lockedReason : blockedByDeskCapacity ? 'Need more Desk Slots for additional human traders.' : disabled ? 'Not enough cash for current buy mode.' : undefined}
        badges={badges}
        onClick={onBuy}
        footer={<DeskUnitBuyControls unitId={config.unitId} activeMode={buyMode} onChange={onModeChange} />}
        compact
      />
    </div>
  )
}

export function DeskTab() {
  const gameState = useGameStore((state) => state)
  const makeTrade = useGameStore((state) => state.makeTrade)
  const buyUnit = useGameStore((state) => state.buyUnit)
  const buyPowerInfrastructure = useGameStore((state) => state.buyPowerInfrastructure)
  const activeDeskView = useGameStore((state) => state.ui.activeDeskView)
  const setActiveDeskView = useGameStore((state) => state.setActiveDeskView)
  const setUnitBuyMode = useGameStore((state) => state.setUnitBuyMode)
  const setPowerBuyMode = useGameStore((state) => state.setPowerBuyMode)
  const latestTradeFeedback = useGameStore((state) => state.latestTradeFeedback)
  const cashPerClick = useGameStore(selectors.cashPerClick)
  const manualTradeOptimizationRank = useGameStore(selectors.repeatableUpgradeRank('manualTradeRefinement'))
  const internIncome = useGameStore(selectors.internIncome)
  const juniorIncome = useGameStore(selectors.juniorIncome)
  const seniorIncome = useGameStore(selectors.seniorIncome)
  const propDeskIncome = useGameStore(selectors.propDeskIncome)
  const institutionalDeskIncome = useGameStore(selectors.institutionalDeskIncome)
  const hedgeFundIncome = useGameStore(selectors.hedgeFundIncome)
  const investmentFirmIncome = useGameStore(selectors.investmentFirmIncome)
  const ruleBasedBotIncome = useGameStore(selectors.ruleBasedBotIncome)
  const mlTradingBotIncome = useGameStore(selectors.mlTradingBotIncome)
  const aiTradingBotIncome = useGameStore(selectors.aiTradingBotIncome)
  const researchPointsPerSecond = useGameStore(selectors.researchPointsPerSecond)
  const influencePerSecond = useGameStore(selectors.influencePerSecond)
  const powerUnlocked = useGameStore(selectors.powerInfrastructureUnlocked)
  const powerUsage = useGameStore(selectors.powerUsage)
  const powerCapacity = useGameStore(selectors.powerCapacity)
  const capacityPowerUsage = useGameStore(selectors.capacityPowerUsage)
  const machineEfficiencyMultiplier = useGameStore(selectors.machineEfficiencyMultiplier)
  const ruleBasedBotPowerUsage = useGameStore(selectors.ruleBasedBotPowerUsage)
  const mlTradingBotPowerUsage = useGameStore(selectors.mlTradingBotPowerUsage)
  const aiTradingBotPowerUsage = useGameStore(selectors.aiTradingBotPowerUsage)
  const generalDeskCashPerSecond = useGameStore(selectors.generalDeskCashPerSecond)
  const totalDeskSlots = useGameStore(selectors.totalDeskSlots)
  const usedDeskSlots = useGameStore(selectors.usedDeskSlots)
  const availableDeskSlots = useGameStore(selectors.availableDeskSlots)
  const deskSpaceCost = useGameStore(selectors.officeExpansionCost)
  const floorSpaceCost = useGameStore(selectors.floorExpansionCost)
  const officeCost = useGameStore(selectors.officeCost)
  const deskSpaceBuyMode = useGameStore(selectors.capacityBuyMode('deskSpace'))
  const floorSpaceBuyMode = useGameStore(selectors.capacityBuyMode('floorSpace'))
  const officeBuyMode = useGameStore(selectors.capacityBuyMode('office'))
  const deskSpaceTotalCost = useGameStore(selectors.bulkCapacityInfrastructureTotalCost('deskSpace'))
  const floorSpaceTotalCost = useGameStore(selectors.bulkCapacityInfrastructureTotalCost('floorSpace'))
  const officeTotalCost = useGameStore(selectors.bulkCapacityInfrastructureTotalCost('office'))
  const deskSpaceQuantity = useGameStore(selectors.bulkCapacityInfrastructureQuantity('deskSpace'))
  const floorSpaceQuantity = useGameStore(selectors.bulkCapacityInfrastructureQuantity('floorSpace'))
  const officeQuantity = useGameStore(selectors.bulkCapacityInfrastructureQuantity('office'))
  const buyDeskSpace = useGameStore((state) => state.buyDeskSpace)
  const buyFloorSpace = useGameStore((state) => state.buyFloorSpace)
  const buyOffice = useGameStore((state) => state.buyOffice)
  const setCapacityBuyMode = useGameStore((state) => state.setCapacityBuyMode)
  const acknowledgeCapacityFull = useGameStore((state) => state.acknowledgeCapacityFull)
  const internAssigned = useGameStore(selectors.assignedCount('intern'))
  const juniorAssigned = useGameStore(selectors.assignedCount('juniorTrader'))
  const seniorAssigned = useGameStore(selectors.assignedCount('seniorTrader'))
  const internAvailable = useGameStore(selectors.availableCount('intern'))
  const juniorAvailable = useGameStore(selectors.availableCount('juniorTrader'))
  const seniorAvailable = useGameStore(selectors.availableCount('seniorTrader'))

  const nextInternCost = useGameStore(selectors.nextInternCost)
  const nextJuniorTraderCost = useGameStore(selectors.nextJuniorTraderCost)
  const nextSeniorTraderCost = useGameStore(selectors.nextSeniorTraderCost)
  const nextPropDeskCost = useGameStore(selectors.nextPropDeskCost)
  const nextInstitutionalDeskCost = useGameStore(selectors.nextInstitutionalDeskCost)
  const nextHedgeFundCost = useGameStore(selectors.nextHedgeFundCost)
  const nextInvestmentFirmCost = useGameStore(selectors.nextInvestmentFirmCost)
  const nextRuleBasedBotCost = useGameStore(selectors.nextRuleBasedBotCost)
  const nextMlTradingBotCost = useGameStore(selectors.nextMlTradingBotCost)
  const nextAiTradingBotCost = useGameStore(selectors.nextAiTradingBotCost)
  const nextInternScientistCost = useGameStore(selectors.nextInternResearchScientistCost)
  const nextJuniorScientistCost = useGameStore(selectors.nextJuniorResearchScientistCost)
  const nextSeniorScientistCost = useGameStore(selectors.nextSeniorResearchScientistCost)
  const nextJuniorPoliticianCost = useGameStore(selectors.nextUnitCost('juniorPolitician'))

  const internBuyMode = useGameStore(selectors.unitBuyMode('intern'))
  const juniorBuyMode = useGameStore(selectors.unitBuyMode('juniorTrader'))
  const seniorBuyMode = useGameStore(selectors.unitBuyMode('seniorTrader'))
  const propDeskBuyMode = useGameStore(selectors.unitBuyMode('propDesk'))
  const institutionalDeskBuyMode = useGameStore(selectors.unitBuyMode('institutionalDesk'))
  const hedgeFundBuyMode = useGameStore(selectors.unitBuyMode('hedgeFund'))
  const investmentFirmBuyMode = useGameStore(selectors.unitBuyMode('investmentFirm'))
  const ruleBasedBotBuyMode = useGameStore(selectors.unitBuyMode('ruleBasedBot'))
  const mlTradingBotBuyMode = useGameStore(selectors.unitBuyMode('mlTradingBot'))
  const aiTradingBotBuyMode = useGameStore(selectors.unitBuyMode('aiTradingBot'))
  const internScientistBuyMode = useGameStore(selectors.unitBuyMode('internResearchScientist'))
  const juniorScientistBuyMode = useGameStore(selectors.unitBuyMode('juniorResearchScientist'))
  const seniorScientistBuyMode = useGameStore(selectors.unitBuyMode('seniorResearchScientist'))
  const juniorPoliticianBuyMode = useGameStore(selectors.unitBuyMode('juniorPolitician'))

  const unitPanelConfigs: UnitPanelConfig[] = [
    {
      unitId: 'intern',
      title: 'Intern',
      purchaseLabel: 'Hire',
      lockedReason: 'Unlock with Recruiter in Research.',
      totalLabel: 'Desk',
    },
    {
      unitId: 'juniorTrader',
      title: 'Junior Trader',
      purchaseLabel: 'Hire',
      lockedReason: `Unlock with Junior Trader Program after reaching 5 Interns (${gameState.internCount}/5).`,
      totalLabel: 'Desk',
    },
    {
      unitId: 'seniorTrader',
      title: 'Senior Trader',
      purchaseLabel: 'Hire',
      lockedReason: `Unlock with Senior Recruitment after reaching 5 Juniors (${gameState.juniorTraderCount}/5).`,
      totalLabel: 'Desk',
    },
    {
      unitId: 'propDesk',
      title: 'Prop Desk',
      purchaseLabel: 'Build',
      lockedReason: `Requires Prop Desk Operations research (${gameState.purchasedResearchTech.propDeskOperations ? 'done' : 'not researched'}).`,
      totalLabel: 'Team',
    },
    {
      unitId: 'institutionalDesk',
      title: 'Institutional Desk',
      purchaseLabel: 'Build',
      lockedReason: `Requires Institutional Desks research and at least 1 Server Room (${gameState.serverRoomCount}/1).`,
      totalLabel: 'Institution',
    },
    {
      unitId: 'hedgeFund',
      title: 'Hedge Fund',
      purchaseLabel: 'Launch',
      lockedReason: `Requires Hedge Fund Strategies research and at least 1 Data Centre (${gameState.dataCenterCount}/1).`,
      totalLabel: 'Capital',
    },
    {
      unitId: 'investmentFirm',
      title: 'Investment Firm',
      purchaseLabel: 'Launch',
      lockedReason: `Requires Investment Firms research and at least 1 Cloud Infrastructure (${gameState.cloudComputeCount}/1).`,
      totalLabel: 'Firm',
    },
    {
      unitId: 'internResearchScientist',
      title: 'Intern Scientist',
      purchaseLabel: 'Hire',
      lockedReason: 'Unlock with Recruiter in Research.',
      totalLabel: 'Research',
      extraBadges: ['0.35 RP / sec'],
    },
    {
      unitId: 'juniorResearchScientist',
      title: 'Junior Scientist',
      purchaseLabel: 'Hire',
      lockedReason: `Requires Junior Scientists research (${gameState.purchasedResearchTech.juniorScientists ? 'done' : 'not researched'}).`,
      totalLabel: 'Research',
      extraBadges: ['1.1 RP / sec'],
    },
    {
      unitId: 'seniorResearchScientist',
      title: 'Senior Scientist',
      purchaseLabel: 'Hire',
      lockedReason: `Requires Senior Scientists research (${gameState.purchasedResearchTech.seniorScientists ? 'done' : 'not researched'}).`,
      totalLabel: 'Research',
      extraBadges: ['3.4 RP / sec'],
    },
    {
      unitId: 'juniorPolitician',
      title: 'Senator',
      purchaseLabel: 'Hire',
      lockedReason: `Requires Regulatory Affairs research (${gameState.purchasedResearchTech.regulatoryAffairs ? 'done' : 'not researched'}).`,
      totalLabel: 'Influence',
      extraBadges: ['0.01 inf / sec'],
    },
    {
      unitId: 'ruleBasedBot',
      title: 'Rule-Based Bot',
      purchaseLabel: 'Deploy',
      lockedReason: `Unlock with Algorithmic Trading after reaching 5 Seniors (${gameState.seniorTraderCount}/5).`,
      totalLabel: 'Machine',
      extraBadges: ['5 power each'],
    },
    {
      unitId: 'mlTradingBot',
      title: 'ML Trading Bot',
      purchaseLabel: 'Deploy',
      lockedReason: `Requires Data Centre Systems and at least 1 Data Centre or Cloud Compute (${gameState.dataCenterCount + gameState.cloudComputeCount}/1).`,
      totalLabel: 'Machine',
      extraBadges: ['18 power each'],
    },
    {
      unitId: 'aiTradingBot',
      title: 'AI Trading Bot',
      purchaseLabel: 'Deploy',
      lockedReason: `Late-run machine tier. Requires AI Trading Systems, 3 ML Trading Bots (${gameState.mlTradingBotCount}/3), and at least 1 Data Centre or Cloud Compute (${gameState.dataCenterCount + gameState.cloudComputeCount}/1).`,
      totalLabel: 'Machine',
      extraBadges: ['48 power each'],
    },
  ]

  const getUnitState = (unitId: UnitId) => {
    const unlocked = selectors.isUnitUnlocked(unitId)(gameState)
    const deskLimited = unitId === 'intern' || unitId === 'juniorTrader' || unitId === 'seniorTrader'
    const disabled = !selectors.canAffordUnitInCurrentMode(unitId)(gameState)
    const totalCost = selectors.bulkUnitTotalCost(unitId)(gameState)
    const quantity = selectors.bulkUnitQuantity(unitId)(gameState)
    const blockedByDeskCapacity = deskLimited && availableDeskSlots <= 0

    if (unitId === 'intern') {
      return { unlocked, disabled: disabled || blockedByDeskCapacity, blockedByDeskCapacity, totalCost, quantity, nextCost: nextInternCost, buyMode: internBuyMode, count: gameState.internCount, totalIncome: formatRate(internIncome), description: UNITS.intern.description }
    }

    if (unitId === 'juniorTrader') {
      return { unlocked, disabled: disabled || blockedByDeskCapacity, blockedByDeskCapacity, totalCost, quantity, nextCost: nextJuniorTraderCost, buyMode: juniorBuyMode, count: gameState.juniorTraderCount, totalIncome: formatRate(juniorIncome), description: UNITS.juniorTrader.description }
    }

    if (unitId === 'seniorTrader') {
      return { unlocked, disabled: disabled || blockedByDeskCapacity, blockedByDeskCapacity, totalCost, quantity, nextCost: nextSeniorTraderCost, buyMode: seniorBuyMode, count: gameState.seniorTraderCount, totalIncome: formatRate(seniorIncome), description: UNITS.seniorTrader.description }
    }

    if (unitId === 'propDesk') {
      return { unlocked, disabled, blockedByDeskCapacity: false, totalCost, quantity, nextCost: nextPropDeskCost, buyMode: propDeskBuyMode, count: gameState.propDeskCount, totalIncome: formatRate(propDeskIncome), description: UNITS.propDesk.description }
    }

    if (unitId === 'institutionalDesk') {
      return { unlocked, disabled, blockedByDeskCapacity: false, totalCost, quantity, nextCost: nextInstitutionalDeskCost, buyMode: institutionalDeskBuyMode, count: gameState.institutionalDeskCount, totalIncome: formatRate(institutionalDeskIncome), description: UNITS.institutionalDesk.description }
    }

    if (unitId === 'hedgeFund') {
      return { unlocked, disabled, blockedByDeskCapacity: false, totalCost, quantity, nextCost: nextHedgeFundCost, buyMode: hedgeFundBuyMode, count: gameState.hedgeFundCount, totalIncome: formatRate(hedgeFundIncome), description: UNITS.hedgeFund.description }
    }

    if (unitId === 'investmentFirm') {
      return { unlocked, disabled, blockedByDeskCapacity: false, totalCost, quantity, nextCost: nextInvestmentFirmCost, buyMode: investmentFirmBuyMode, count: gameState.investmentFirmCount, totalIncome: formatRate(investmentFirmIncome), description: UNITS.investmentFirm.description }
    }

    if (unitId === 'ruleBasedBot') {
      return { unlocked, disabled, blockedByDeskCapacity: false, totalCost, quantity, nextCost: nextRuleBasedBotCost, buyMode: ruleBasedBotBuyMode, count: gameState.ruleBasedBotCount, totalIncome: formatRate(ruleBasedBotIncome), description: UNITS.ruleBasedBot.description }
    }

    if (unitId === 'mlTradingBot') {
      return { unlocked, disabled, blockedByDeskCapacity: false, totalCost, quantity, nextCost: nextMlTradingBotCost, buyMode: mlTradingBotBuyMode, count: gameState.mlTradingBotCount, totalIncome: formatRate(mlTradingBotIncome), description: UNITS.mlTradingBot.description }
    }

    if (unitId === 'aiTradingBot') {
      return { unlocked, disabled, blockedByDeskCapacity: false, totalCost, quantity, nextCost: nextAiTradingBotCost, buyMode: aiTradingBotBuyMode, count: gameState.aiTradingBotCount, totalIncome: formatRate(aiTradingBotIncome), description: UNITS.aiTradingBot.description }
    }

    if (unitId === 'internResearchScientist') {
      return { unlocked, disabled, blockedByDeskCapacity: false, totalCost, quantity, nextCost: nextInternScientistCost, buyMode: internScientistBuyMode, count: gameState.internResearchScientistCount, totalIncome: `${formatNumber(gameState.internResearchScientistCount * 0.35, { decimalsBelowThreshold: 2 })} RP / sec`, description: UNITS.internResearchScientist.description }
    }

    if (unitId === 'juniorResearchScientist') {
      return { unlocked, disabled, blockedByDeskCapacity: false, totalCost, quantity, nextCost: nextJuniorScientistCost, buyMode: juniorScientistBuyMode, count: gameState.juniorResearchScientistCount, totalIncome: `${formatNumber(gameState.juniorResearchScientistCount * 1.1, { decimalsBelowThreshold: 1 })} RP / sec`, description: UNITS.juniorResearchScientist.description }
    }

    if (unitId === 'juniorPolitician') {
      return { unlocked, disabled, blockedByDeskCapacity: false, totalCost, quantity, nextCost: nextJuniorPoliticianCost, buyMode: juniorPoliticianBuyMode, count: gameState.juniorPoliticianCount, totalIncome: `${formatNumber(gameState.juniorPoliticianCount * 0.01, { decimalsBelowThreshold: 2 })} inf / sec`, description: UNITS.juniorPolitician.description }
    }

    return { unlocked, disabled, blockedByDeskCapacity: false, totalCost, quantity, nextCost: nextSeniorScientistCost, buyMode: seniorScientistBuyMode, count: gameState.seniorResearchScientistCount, totalIncome: `${formatNumber(gameState.seniorResearchScientistCount * 3.4, { decimalsBelowThreshold: 1 })} RP / sec`, description: UNITS.seniorResearchScientist.description }
  }

  const serverRackBuyMode = useGameStore(selectors.powerBuyMode('serverRack'))
  const serverRoomBuyMode = useGameStore(selectors.powerBuyMode('serverRoom'))
  const dataCenterBuyMode = useGameStore(selectors.powerBuyMode('dataCenter'))
  const cloudComputeBuyMode = useGameStore(selectors.powerBuyMode('cloudCompute'))
  const serverRackCount = useGameStore(selectors.powerInfrastructureCount('serverRack'))
  const serverRoomCount = useGameStore(selectors.powerInfrastructureCount('serverRoom'))
  const dataCenterCount = useGameStore(selectors.powerInfrastructureCount('dataCenter'))
  const cloudComputeCount = useGameStore(selectors.powerInfrastructureCount('cloudCompute'))
  const serverRackTotalCost = useGameStore(selectors.bulkPowerInfrastructureTotalCost('serverRack'))
  const serverRoomTotalCost = useGameStore(selectors.bulkPowerInfrastructureTotalCost('serverRoom'))
  const dataCenterTotalCost = useGameStore(selectors.bulkPowerInfrastructureTotalCost('dataCenter'))
  const cloudComputeTotalCost = useGameStore(selectors.bulkPowerInfrastructureTotalCost('cloudCompute'))
  const serverRackQuantity = useGameStore(selectors.bulkPowerInfrastructureQuantity('serverRack'))
  const serverRoomQuantity = useGameStore(selectors.bulkPowerInfrastructureQuantity('serverRoom'))
  const dataCenterQuantity = useGameStore(selectors.bulkPowerInfrastructureQuantity('dataCenter'))
  const cloudComputeQuantity = useGameStore(selectors.bulkPowerInfrastructureQuantity('cloudCompute'))
  const nextServerRackCost = useGameStore(selectors.nextPowerInfrastructureCost('serverRack'))
  const nextServerRoomCost = useGameStore(selectors.nextPowerInfrastructureCost('serverRoom'))
  const nextDataCenterCost = useGameStore(selectors.nextPowerInfrastructureCost('dataCenter'))
  const nextCloudComputeCost = useGameStore(selectors.nextPowerInfrastructureCost('cloudCompute'))
  const canAffordServerRack = useGameStore(selectors.canAffordPowerInfrastructureInCurrentMode('serverRack'))
  const canAffordServerRoom = useGameStore(selectors.canAffordPowerInfrastructureInCurrentMode('serverRoom'))
  const canAffordDataCenter = useGameStore(selectors.canAffordPowerInfrastructureInCurrentMode('dataCenter'))
  const canAffordCloudCompute = useGameStore(selectors.canAffordPowerInfrastructureInCurrentMode('cloudCompute'))
  const manualTradeOptimizationBonus = manualTradeOptimizationRank * 8
  const totalTraderIncome = internIncome + juniorIncome + seniorIncome + propDeskIncome + institutionalDeskIncome + hedgeFundIncome + investmentFirmIncome
  const showTradingView = activeDeskView === 'trading'
  const showSectorsView = activeDeskView === 'sectors'
  const showScientistsView = activeDeskView === 'scientists'
  const showInfrastructureView = activeDeskView === 'infrastructure'
  const showPoliticiansView = activeDeskView === 'politicians'
  const capacityFullNoticeVisible = availableDeskSlots <= 0 && gameState.ui.dismissedCapacityFull !== true

  return (
    <div className="h-full min-h-0 overflow-y-auto pr-1">
      <div className="space-y-2">
        <Tabs value={activeDeskView} onValueChange={(value) => setActiveDeskView(value as DeskViewId)} className="min-h-0 flex flex-col overflow-hidden">
          <TabsList className="grid h-auto w-full shrink-0 grid-cols-6 gap-1 rounded-xl border border-border/80 bg-card/92 p-1">
            {deskViewMeta.map((view) => (
              <TabsTrigger
                key={view.id}
                value={view.id}
                disabled={view.disabled}
                className="gap-1.5 py-2 text-[10px] uppercase tracking-[0.12em] aria-selected:bg-primary aria-selected:text-primary-foreground disabled:border-border/60 disabled:bg-[linear-gradient(180deg,rgba(50,50,50,0.55),rgba(28,28,28,0.55))] disabled:text-muted-foreground disabled:opacity-100"
              >
                {view.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {showTradingView ? <div className="terminal-panel rounded-xl border-border/80 bg-card/92 p-2.5">
          <PurchaseCard
            title="Manual Trade"
            description={manualTradeOptimizationRank > 0 ? `Manual trades fund the first hires and every next unlock. Refinement bonus +${manualTradeOptimizationBonus}%.` : 'Manual trades fund the first hires and every next unlock.'}
            cost={`Click yields ${formatCurrency(cashPerClick, cashPerClick < 100 ? 1 : 0)} instantly.`}
            status="Ready"
            statusTone="ready"
            actionLabel="Trade"
            disabled={false}
            badges={[
              `${formatCurrency(cashPerClick, cashPerClick < 100 ? 1 : 0)} / click`,
              ...(manualTradeOptimizationRank > 0 ? [`Refinement r${manualTradeOptimizationRank}`] : []),
              ...(latestTradeFeedback ? [`Last +${formatCurrency(latestTradeFeedback.amount, latestTradeFeedback.amount < 100 ? 1 : 0)}`] : []),
            ]}
            onClick={makeTrade}
          />
        </div> : null}

        {showTradingView ? <div className="terminal-panel space-y-2 rounded-xl border-border/80 bg-card/92 p-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <Users className="size-4 text-primary" />
            <h3 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">Traders</h3>
            <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatRate(totalTraderIncome)}</Badge>
            <Badge variant="outline" className="h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary">General Desk {formatRate(generalDeskCashPerSecond)}</Badge>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-lg border border-border/70 bg-background/45 p-2 text-[11px] text-muted-foreground">Interns: {gameState.internCount} owned / {internAssigned} assigned / {internAvailable} available</div>
            <div className="rounded-lg border border-border/70 bg-background/45 p-2 text-[11px] text-muted-foreground">Juniors: {gameState.juniorTraderCount} owned / {juniorAssigned} assigned / {juniorAvailable} available</div>
            <div className="rounded-lg border border-border/70 bg-background/45 p-2 text-[11px] text-muted-foreground">Seniors: {gameState.seniorTraderCount} owned / {seniorAssigned} assigned / {seniorAvailable} available</div>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-[11px] text-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Desk Capacity</p>
              <Badge variant="outline" className="h-5 rounded-md border-primary/40 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary">Desk Slots: {usedDeskSlots} / {totalDeskSlots} used</Badge>
              <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{availableDeskSlots} free</Badge>
            </div>
            <p className="mt-1">Human traders no longer consume machine power directly. Human growth is constrained by firm-wide desk allocation, so you must choose when to keep hiring and when to expand the office footprint first.</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Capacity purchases now live under Infrastructure: Desk Space {formatCurrency(deskSpaceCost)}, Floor Space {formatCurrency(floorSpaceCost)}, Office {formatCurrency(officeCost)}.</p>
            {capacityFullNoticeVisible ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-background/60 p-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Desk Capacity Full</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">You have filled every available human desk. Go to Infrastructure and buy Desk Space, Floor Space, or an Office before hiring more traders.</p>
                </div>
                <Button size="xs" className="rounded-md uppercase tracking-[0.12em]" onClick={() => acknowledgeCapacityFull()}>
                  Got it
                </Button>
              </div>
            ) : null}
          </div>
          {unitPanelConfigs.filter((item) => item.unitId === 'intern' || item.unitId === 'juniorTrader' || item.unitId === 'seniorTrader' || item.unitId === 'propDesk' || item.unitId === 'institutionalDesk' || item.unitId === 'hedgeFund' || item.unitId === 'investmentFirm').map((config) => {
            const state = getUnitState(config.unitId)
            const assignmentSummary = config.unitId === 'intern'
              ? { owned: gameState.internCount, assigned: internAssigned, available: internAvailable }
              : config.unitId === 'juniorTrader'
                ? { owned: gameState.juniorTraderCount, assigned: juniorAssigned, available: juniorAvailable }
                : config.unitId === 'seniorTrader'
                  ? { owned: gameState.seniorTraderCount, assigned: seniorAssigned, available: seniorAvailable }
                  : undefined
            return (
              <UnitPanel
                key={config.unitId}
                config={config}
                incomeLabel={state.totalIncome}
                totalCost={state.totalCost}
                nextCost={state.nextCost}
                quantity={state.count}
                buyMode={state.buyMode}
                disabled={state.disabled}
                unlocked={state.unlocked}
                titleDescription={state.description}
                assignmentSummary={assignmentSummary}
                onBuy={() => buyUnit(config.unitId, state.buyMode)}
                onModeChange={(mode) => setUnitBuyMode(config.unitId, mode)}
              />
            )
          })}
        </div> : null}

        {showSectorsView ? <SectorsTab /> : null}

        {showScientistsView ? <div className={gameState.purchasedUpgrades.juniorHiringProgram ? 'terminal-panel space-y-2 rounded-xl border-border/80 bg-card/92 p-2.5' : 'terminal-panel space-y-2 rounded-xl border-border/60 bg-card/70 p-2.5 opacity-60'}>
          <div className="flex flex-wrap items-center gap-2">
            <FlaskConical className="size-4 text-primary" />
            <h3 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">Scientists</h3>
            <Badge variant="outline" className={gameState.purchasedUpgrades.juniorHiringProgram ? 'h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary' : 'h-5 rounded-md border-border/70 bg-background/50 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground'}>{gameState.purchasedUpgrades.juniorHiringProgram ? 'Unlocked' : 'Locked'}</Badge>
            {gameState.purchasedUpgrades.juniorHiringProgram ? (
              <>
                <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatPlainRate(researchPointsPerSecond)} research</Badge>
              </>
            ) : null}
          </div>
          {unitPanelConfigs.filter((item) => item.unitId === 'internResearchScientist' || item.unitId === 'juniorResearchScientist' || item.unitId === 'seniorResearchScientist').map((config) => {
            const state = getUnitState(config.unitId)
            return (
              <UnitPanel
                key={config.unitId}
                config={config}
                incomeLabel={state.totalIncome}
                totalCost={state.totalCost}
                nextCost={state.nextCost}
                quantity={state.count}
                buyMode={state.buyMode}
                disabled={state.disabled}
                unlocked={state.unlocked}
                titleDescription={state.description}
                onBuy={() => buyUnit(config.unitId, state.buyMode)}
                onModeChange={(mode) => setUnitBuyMode(config.unitId, mode)}
              />
            )
          })}
        </div> : null}

        {showPoliticiansView ? <div className={gameState.purchasedResearchTech.regulatoryAffairs ? 'terminal-panel space-y-2 rounded-xl border-border/80 bg-card/92 p-2.5' : 'terminal-panel space-y-2 rounded-xl border-border/60 bg-card/70 p-2.5 opacity-60'}>
          <div className="flex flex-wrap items-center gap-2">
            <Users className="size-4 text-primary" />
            <h3 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">Politicians</h3>
            <Badge variant="outline" className={gameState.purchasedResearchTech.regulatoryAffairs ? 'h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary' : 'h-5 rounded-md border-border/70 bg-background/50 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground'}>{gameState.purchasedResearchTech.regulatoryAffairs ? 'Unlocked' : 'Locked'}</Badge>
            {gameState.purchasedResearchTech.regulatoryAffairs ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatPlainRate(influencePerSecond)} influence</Badge> : null}
          </div>
          {unitPanelConfigs.filter((item) => item.unitId === 'juniorPolitician').map((config) => {
            const state = getUnitState(config.unitId)
            return (
              <UnitPanel
                key={config.unitId}
                config={config}
                incomeLabel={state.totalIncome}
                totalCost={state.totalCost}
                nextCost={state.nextCost}
                quantity={state.count}
                buyMode={state.buyMode}
                disabled={state.disabled}
                unlocked={state.unlocked}
                titleDescription={state.description}
                onBuy={() => buyUnit(config.unitId, state.buyMode)}
                onModeChange={(mode) => setUnitBuyMode(config.unitId, mode)}
              />
            )
          })}
        </div> : null}

        {showTradingView ? <div className="terminal-panel space-y-2 rounded-xl border-border/80 bg-card/92 p-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <MonitorCog className="size-4 text-primary" />
            <h3 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">Algorithmic Trading</h3>
            <Badge variant="outline" className={selectors.algorithmicUnlocked(gameState) ? 'h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary' : 'h-5 rounded-md border-border/70 bg-background/50 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground'}>{selectors.algorithmicUnlocked(gameState) ? 'Unlocked' : 'Locked'}</Badge>
            {selectors.algorithmicUnlocked(gameState) ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatRate(ruleBasedBotIncome + mlTradingBotIncome + aiTradingBotIncome)}</Badge> : null}
            {selectors.algorithmicUnlocked(gameState) ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Rule {formatNumber(ruleBasedBotPowerUsage, { decimalsBelowThreshold: 1 })} power</Badge> : null}
            {selectors.algorithmicUnlocked(gameState) ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">ML {formatNumber(mlTradingBotPowerUsage, { decimalsBelowThreshold: 1 })} power</Badge> : null}
            {selectors.algorithmicUnlocked(gameState) ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">AI {formatNumber(aiTradingBotPowerUsage, { decimalsBelowThreshold: 1 })} power</Badge> : null}
          </div>
          {unitPanelConfigs.filter((item) => item.unitId === 'ruleBasedBot' || item.unitId === 'mlTradingBot' || item.unitId === 'aiTradingBot').map((config) => {
            const state = getUnitState(config.unitId)
            return (
              <UnitPanel
                key={config.unitId}
                config={config}
                incomeLabel={state.totalIncome}
                totalCost={state.totalCost}
                nextCost={state.nextCost}
                quantity={state.count}
                buyMode={state.buyMode}
                disabled={state.disabled}
                unlocked={state.unlocked}
                titleDescription={state.description}
                onBuy={() => buyUnit(config.unitId, state.buyMode)}
                onModeChange={(mode) => setUnitBuyMode(config.unitId, mode)}
              />
            )
          })}
        </div> : null}

        {showInfrastructureView ? <div className={powerUnlocked ? 'terminal-panel space-y-2 rounded-xl border-border/80 bg-card/92 p-2.5' : 'terminal-panel space-y-2 rounded-xl border-border/60 bg-card/70 p-2.5 opacity-60'}>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Lock className="size-4 text-primary" />
              <h3 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">Infrastructure</h3>
              <Badge variant="outline" className={powerUnlocked ? 'h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary' : 'h-5 rounded-md border-border/70 bg-background/50 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground'}>{powerUnlocked ? 'Unlocked' : 'Locked'}</Badge>
              {powerUnlocked ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatNumber(powerUsage, { decimalsBelowThreshold: 1 })} use / {formatNumber(powerCapacity, { decimalsBelowThreshold: 1 })} generating</Badge> : null}
              {powerUnlocked ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Rule {formatNumber(ruleBasedBotPowerUsage, { decimalsBelowThreshold: 1 })}</Badge> : null}
              {powerUnlocked ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">ML {formatNumber(mlTradingBotPowerUsage, { decimalsBelowThreshold: 1 })}</Badge> : null}
              {powerUnlocked ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">AI {formatNumber(aiTradingBotPowerUsage, { decimalsBelowThreshold: 1 })}</Badge> : null}
            </div>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">Firm growth now splits cleanly between Office capacity for human traders and Energy infrastructure for machine systems. New desk capacity requires both cash and available energy support.</p>
            {powerUnlocked && machineEfficiencyMultiplier < 1 ? <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-amber-400">Over capacity - powered output {Math.round(machineEfficiencyMultiplier * 100)}%</p> : null}
          </div>

          <div className="space-y-2 rounded-xl border border-border/70 bg-background/35 p-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <h4 className="text-[12px] font-semibold leading-none text-foreground">Office</h4>
              <Badge variant="outline" className="h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary">{usedDeskSlots} / {totalDeskSlots} desks used</Badge>
              <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{availableDeskSlots} free</Badge>
            </div>
            <p className="text-[11px] leading-4 text-muted-foreground">Buy more space for human traders here. Each purchase requires cash and energy capacity: Desk Space is the cheapest patch for one more hire, Floor Space is the first real expansion, and Office is the large-scale late purchase.</p>
            <div className="space-y-2">
              {[
              { id: 'deskSpace' as const, count: gameState.deskSpaceCount, buyMode: deskSpaceBuyMode, totalCost: deskSpaceTotalCost, quantity: deskSpaceQuantity, nextCost: deskSpaceCost, slotsGranted: CAPACITY_INFRASTRUCTURE.deskSpace.slotsGranted, powerUsage: CAPACITY_INFRASTRUCTURE.deskSpace.powerUsage, name: CAPACITY_INFRASTRUCTURE.deskSpace.name, description: CAPACITY_INFRASTRUCTURE.deskSpace.description, canAffordCash: gameState.cash >= deskSpaceTotalCost && deskSpaceQuantity > 0, canAffordEnergy: selectors.canAffordCapacityPower(CAPACITY_INFRASTRUCTURE.deskSpace.powerUsage * Math.max(1, deskSpaceQuantity))(gameState) },
              { id: 'floorSpace' as const, count: gameState.floorSpaceCount, buyMode: floorSpaceBuyMode, totalCost: floorSpaceTotalCost, quantity: floorSpaceQuantity, nextCost: floorSpaceCost, slotsGranted: CAPACITY_INFRASTRUCTURE.floorSpace.slotsGranted, powerUsage: CAPACITY_INFRASTRUCTURE.floorSpace.powerUsage, name: CAPACITY_INFRASTRUCTURE.floorSpace.name, description: CAPACITY_INFRASTRUCTURE.floorSpace.description, canAffordCash: gameState.cash >= floorSpaceTotalCost && floorSpaceQuantity > 0, canAffordEnergy: selectors.canAffordCapacityPower(CAPACITY_INFRASTRUCTURE.floorSpace.powerUsage * Math.max(1, floorSpaceQuantity))(gameState) },
              { id: 'office' as const, count: gameState.officeCount, buyMode: officeBuyMode, totalCost: officeTotalCost, quantity: officeQuantity, nextCost: officeCost, slotsGranted: CAPACITY_INFRASTRUCTURE.office.slotsGranted, powerUsage: CAPACITY_INFRASTRUCTURE.office.powerUsage, name: CAPACITY_INFRASTRUCTURE.office.name, description: CAPACITY_INFRASTRUCTURE.office.description, canAffordCash: gameState.cash >= officeTotalCost && officeQuantity > 0, canAffordEnergy: selectors.canAffordCapacityPower(CAPACITY_INFRASTRUCTURE.office.powerUsage * Math.max(1, officeQuantity))(gameState) },
              ].map((item) => (
                <PurchaseCard
                  key={item.id}
                  title={item.name}
                  description={item.description}
                  status={item.canAffordCash && item.canAffordEnergy ? 'Ready' : !item.canAffordCash ? 'Need cash' : 'Need energy'}
                  statusTone={item.canAffordCash && item.canAffordEnergy ? 'ready' : 'default'}
                  actionLabel={`Build ${formatCurrency(item.totalCost || item.nextCost)}`}
                  disabled={!item.canAffordCash || !item.canAffordEnergy}
                  disabledReason={!item.canAffordCash ? 'Not enough cash for this expansion.' : !item.canAffordEnergy ? 'Need more Energy capacity for this office expansion.' : undefined}
                  badges={[`${item.count} owned`, `+${item.slotsGranted * Math.max(1, item.quantity)} slots`, `${formatNumber(item.powerUsage * Math.max(1, item.quantity), { decimalsBelowThreshold: 1 })} energy`]}
                  onClick={() => {
                    if (item.id === 'deskSpace') buyDeskSpace(item.buyMode)
                    if (item.id === 'floorSpace') buyFloorSpace(item.buyMode)
                    if (item.id === 'office') buyOffice(item.buyMode)
                  }}
                  compact
                  footer={
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Office</span>
                      {BUY_MODES.map((mode) => (
                        <Button key={`${item.id}-${String(mode)}`} size="xs" variant={item.buyMode === mode ? 'default' : 'outline'} className="rounded-md uppercase tracking-[0.12em]" onClick={() => setCapacityBuyMode(item.id, mode)}>
                          {typeof mode === 'number' ? `x${mode}` : 'Max'}
                        </Button>
                      ))}
                    </div>
                  }
                />
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Office capacity energy load: {formatNumber(capacityPowerUsage, { decimalsBelowThreshold: 1 })}</p>
          </div>

          <div className="space-y-2 rounded-xl border border-border/70 bg-background/35 p-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <MonitorCog className="size-4 text-primary" />
              <h4 className="text-[12px] font-semibold leading-none text-foreground">Energy</h4>
              {powerUnlocked ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatNumber(powerUsage, { decimalsBelowThreshold: 1 })} / {formatNumber(powerCapacity, { decimalsBelowThreshold: 1 })}</Badge> : null}
            </div>
            <p className="text-[11px] leading-4 text-muted-foreground">Machine infrastructure powers bots and compute systems. Expand this lane to support higher bot tiers and avoid over-capacity penalties.</p>
            <div className="space-y-2">
              {[
              { id: 'serverRack' as const, count: serverRackCount, buyMode: serverRackBuyMode, totalCost: serverRackTotalCost, quantity: serverRackQuantity, nextCost: nextServerRackCost, canAfford: canAffordServerRack, visible: true, lockedReason: 'Starter infrastructure.' },
              { id: 'serverRoom' as const, count: serverRoomCount, buyMode: serverRoomBuyMode, totalCost: serverRoomTotalCost, quantity: serverRoomQuantity, nextCost: nextServerRoomCost, canAfford: canAffordServerRoom, visible: gameState.purchasedResearchTech.powerSystemsEngineering === true, lockedReason: 'Requires Power Systems Engineering research.' },
              { id: 'dataCenter' as const, count: dataCenterCount, buyMode: dataCenterBuyMode, totalCost: dataCenterTotalCost, quantity: dataCenterQuantity, nextCost: nextDataCenterCost, canAfford: canAffordDataCenter, visible: gameState.purchasedResearchTech.dataCenterSystems === true, lockedReason: 'Late-run infrastructure. Requires Data Centre Systems research.' },
              { id: 'cloudCompute' as const, count: cloudComputeCount, buyMode: cloudComputeBuyMode, totalCost: cloudComputeTotalCost, quantity: cloudComputeQuantity, nextCost: nextCloudComputeCost, canAfford: canAffordCloudCompute, visible: gameState.purchasedResearchTech.aiTradingSystems === true, lockedReason: 'Late-run infrastructure. Requires AI Trading Systems research.' },
              ].map((item) => {
                const definition = POWER_INFRASTRUCTURE[item.id]
                const status = item.visible && powerUnlocked ? (item.canAfford ? 'Ready' : 'Need cash') : 'Locked'
                const statusTone = item.visible && powerUnlocked ? (item.canAfford ? 'ready' : 'default') : 'locked'
                return (
                  <div key={item.id} className={!item.visible ? 'opacity-60' : undefined}>
                    <PurchaseCard
                      title={definition.name}
                      description={item.visible ? definition.description : item.lockedReason}
                      infoTooltip={`${item.visible ? definition.description : item.lockedReason}\n\n${item.buyMode === 'max' ? `Max (${item.quantity})` : `x${item.buyMode}`} costs ${formatCurrency(item.totalCost || item.nextCost)}${item.buyMode !== 'max' ? ` | Next ${formatCurrency(item.nextCost)}` : ''}`}
                      status={status}
                      statusTone={statusTone}
                      actionLabel={`Build ${formatCurrency(item.totalCost || item.nextCost)}`}
                      disabled={!item.visible || !powerUnlocked || !item.canAfford}
                      disabledReason={!item.visible ? item.lockedReason : !powerUnlocked ? 'Requires Power Systems Engineering first.' : !item.canAfford ? 'Not enough cash for current buy mode.' : undefined}
                      badges={[`${item.count} owned`, `+${definition.powerCapacity} cap`]}
                      onClick={() => buyPowerInfrastructure(item.id, item.buyMode)}
                      compact
                      footer={
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Power</span>
                          {BUY_MODES.map((mode) => (
                            <Button key={`${item.id}-${String(mode)}`} size="xs" variant={item.buyMode === mode ? 'default' : 'outline'} className="rounded-md uppercase tracking-[0.12em]" onClick={() => setPowerBuyMode(item.id, mode)}>
                              {typeof mode === 'number' ? `x${mode}` : 'Max'}
                            </Button>
                          ))}
                        </div>
                      }
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div> : null}
      </div>
    </div>
  )
}
