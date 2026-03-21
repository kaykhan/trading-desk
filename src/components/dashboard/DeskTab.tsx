import type { ReactNode } from 'react'
import { useState } from 'react'
import { ChevronDown, ChevronUp, FlaskConical, Lock, MonitorCog, TrendingUp, Users } from 'lucide-react'
import { CAPACITY_INFRASTRUCTURE } from '@/data/capacity'
import { POWER_INFRASTRUCTURE } from '@/data/powerInfrastructure'
import { UNITS } from '@/data/units'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGameStore } from '@/store/gameStore'
import { AUTOMATION_STRATEGIES, AUTOMATION_STRATEGY_IDS, AUTOMATION_UNIT_IDS, AUTOMATION_UNITS } from '@/data/automation'
import { selectors } from '@/store/selectors'
import type { AutomationUnitId, BuyMode, DeskViewId, InstitutionalMandateId, InstitutionalMandateUnitId, SectorId, TraderSpecialistUnitId, TraderSpecializationId, UnitId } from '@/types/game'
import { formatCurrency, formatNumber, formatPlainRate, formatRate } from '@/utils/formatting'
import { mechanics } from '@/lib/mechanics'
import { getUnlockedAutomationStrategies } from '@/utils/automation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectorsTab } from './SectorsTab'
import { PurchaseCard } from './DashboardPrimitives'

const SPECIALIZATION_IDS: TraderSpecializationId[] = ['finance', 'technology', 'energy']
const SPECIALIZATION_LABELS: Record<TraderSpecializationId, string> = { ...mechanics.specialization.labels }

const MANDATE_IDS: InstitutionalMandateId[] = ['finance', 'technology', 'energy']
const MANDATE_LABELS: Record<InstitutionalMandateId, string> = { ...mechanics.mandates.labels }

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

function BulkAdjustControls({
  maxAdd,
  onAdd,
  addLabel,
  compact = false,
}: {
  maxAdd: number
  onAdd: (_amount: number) => void
  addLabel: string
  compact?: boolean
}) {
  const [selectedAmount, setSelectedAmount] = useState<1 | 5 | 10 | 'max' | 'custom'>(1)
  const [customAmount, setCustomAmount] = useState('25')

  const maxAmount = maxAdd
  const parsedCustom = Math.max(0, Math.floor(Number(customAmount) || 0))
  const resolvedAmount = selectedAmount === 'max'
    ? maxAmount
    : selectedAmount === 'custom'
      ? Math.min(parsedCustom, maxAmount)
      : Math.min(selectedAmount, maxAmount)

  return (
    <div className={`rounded-lg border border-border/70 bg-background/40 ${compact ? 'p-2' : 'p-2.5'}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Available {maxAmount}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {[1, 5, 10].map((amount) => (
          <Button
            key={`bulk-${amount}`}
            size="xs"
            variant={selectedAmount === amount ? 'default' : 'outline'}
            className="rounded-md uppercase tracking-[0.12em]"
            onClick={() => setSelectedAmount(amount as 1 | 5 | 10)}
          >
            {amount}
          </Button>
        ))}
        <Button size="xs" variant={selectedAmount === 'max' ? 'default' : 'outline'} className="rounded-md uppercase tracking-[0.12em]" onClick={() => setSelectedAmount('max')}>
          Max
        </Button>
        <Button size="xs" variant={selectedAmount === 'custom' ? 'default' : 'outline'} className="rounded-md uppercase tracking-[0.12em]" onClick={() => setSelectedAmount('custom')}>
          Custom
        </Button>
        {selectedAmount === 'custom' ? (
          <input
            inputMode="numeric"
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value.replace(/[^0-9]/g, ''))}
            className="h-7 w-20 rounded-md border border-border/70 bg-background/60 px-2 text-xs text-foreground outline-none ring-0 placeholder:text-muted-foreground"
            placeholder="25"
          />
        ) : null}
        <Button
          size="xs"
          variant={resolvedAmount > 0 ? 'default' : 'outline'}
          className="rounded-md uppercase tracking-[0.12em]"
          disabled={resolvedAmount <= 0}
          onClick={() => {
            if (resolvedAmount <= 0) {
              return
            }

            onAdd(resolvedAmount)
          }}
        >
          {addLabel} {resolvedAmount > 0 ? resolvedAmount : ''}
        </Button>
      </div>
    </div>
  )
}

function TraderSpecialistManager({ unitId }: { unitId: TraderSpecialistUnitId }) {
  const [open, setOpen] = useState(false)
  const trainTraderSpecialist = useGameStore((state) => state.trainTraderSpecialist)
  const gameState = useGameStore((state) => state)
  const genericCount = useGameStore(selectors.genericTraderCount(unitId))
  const trainingCost = useGameStore(selectors.traderSpecialistTrainingCost(unitId))
  const headerLabel = 'Senior Trader Specialization'
  const ToggleIcon = open ? ChevronUp : ChevronDown

  return (
    <div className="rounded-lg border border-border/70 bg-background/35 p-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 rounded-md text-left"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-primary">{headerLabel}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Generic pool {genericCount} | Train Senior Trader specialists who automatically deploy into their matching sector.</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border/70 bg-background/50 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {open ? 'Collapse' : 'Expand'}
          <ToggleIcon className="size-3.5" />
        </div>
      </button>

      {open ? (
        <div className="mt-3 space-y-3">
          {SPECIALIZATION_IDS.map((specializationId) => {
            const unlocked = selectors.traderSpecialistTrainingUnlocked(specializationId)(gameState)
            const trainedCount = selectors.traderSpecialistCount(unitId, specializationId)(gameState)
            const maxTrainable = unlocked ? Math.min(genericCount, Math.floor(gameState.cash / trainingCost)) : 0
            const sectorId = specializationId
            const assigned = selectors.assignedTraderSpecialistsForSector(unitId, specializationId, sectorId)(gameState)
            const sectorUnlocked = selectors.isSectorUnlocked(sectorId)(gameState)
            const activeCount = sectorUnlocked ? assigned : 0

            return (
              <div key={`${unitId}-${specializationId}`} className="rounded-xl border border-border/80 bg-background/55 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-primary">{SPECIALIZATION_LABELS[specializationId]} Specialists</p>
                  <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Trained {trainedCount}</Badge>
                  <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Active {activeCount}</Badge>
                  <Badge variant="outline" className="h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary">Train {formatCurrency(trainingCost)}</Badge>
                </div>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  {unlocked
                    ? `Matching ${SPECIALIZATION_LABELS[specializationId]} sector deployments gain a +20% bonus.`
                    : `Requires ${SPECIALIZATION_LABELS[specializationId]} Specialist Training research.`}
                </p>

                <div className="mt-2">
                  <BulkAdjustControls
                    maxAdd={maxTrainable}
                    onAdd={(amount) => trainTraderSpecialist(unitId, specializationId, amount)}
                    addLabel="Train"
                    compact
                  />
                </div>

                <div className="mt-3 border-t border-border/60 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-primary">Auto-Assigned To {SPECIALIZATION_LABELS[sectorId]}</p>
                    <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Active {assigned}</Badge>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {sectorUnlocked ? 'Training immediately routes these specialists into the matching sector lane for a +20% bonus.' : 'This specialization will activate automatically once the matching sector is unlocked.'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function InstitutionalMandateManager({ unitId }: { unitId: InstitutionalMandateUnitId }) {
  const [open, setOpen] = useState(false)
  const applyInstitutionMandate = useGameStore((state) => state.applyInstitutionMandate)
  const gameState = useGameStore((state) => state)
  const genericCount = useGameStore(selectors.genericInstitutionCount(unitId))
  const mandateCost = useGameStore(selectors.institutionMandateApplicationCost(unitId))
  const headerLabel = unitId === 'propDesk'
    ? 'Prop Desk Mandates'
    : unitId === 'institutionalDesk'
      ? 'Institutional Desk Mandates'
      : unitId === 'hedgeFund'
        ? 'Hedge Fund Mandates'
        : 'Investment Firm Mandates'
  const ToggleIcon = open ? ChevronUp : ChevronDown
  const bonusLabel = unitId === 'propDesk' ? '+5%' : unitId === 'institutionalDesk' ? '+7.5%' : unitId === 'hedgeFund' ? '+10%' : '+12.5%'

  return (
    <div className="rounded-lg border border-border/70 bg-background/35 p-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 rounded-md text-left"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-primary">{headerLabel}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Generic pool {genericCount} | Apply mandates, then manually assign institutions to sectors to activate the matching bonus.</p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border/70 bg-background/50 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {open ? 'Collapse' : 'Expand'}
          <ToggleIcon className="size-3.5" />
        </div>
      </button>

      {open ? (
        <div className="mt-3 space-y-3">
          {MANDATE_IDS.map((mandateId) => {
            const unlocked = selectors.institutionMandateUnlocked(mandateId)(gameState)
            const appliedCount = selectors.institutionMandateCount(unitId, mandateId)(gameState)
            const maxApplicable = unlocked ? Math.min(genericCount, Math.floor(gameState.cash / mandateCost)) : 0
            const activeCount = selectors.assignedInstitutionMandatesForSector(unitId, mandateId, mandateId)(gameState)
            const sectorUnlocked = selectors.isSectorUnlocked(mandateId)(gameState)

            return (
              <div key={`${unitId}-${mandateId}`} className="rounded-xl border border-border/80 bg-background/55 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-primary">{MANDATE_LABELS[mandateId]}</p>
                  <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Applied {appliedCount}</Badge>
                  <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Active {activeCount}</Badge>
                  <Badge variant="outline" className="h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary">{bonusLabel}</Badge>
                  <Badge variant="outline" className="h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary">Apply {formatCurrency(mandateCost)}</Badge>
                </div>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  {unlocked ? `Matching ${MANDATE_LABELS[mandateId]} deployments gain a ${bonusLabel} bonus.` : `Requires ${MANDATE_LABELS[mandateId]} research.`}
                </p>

                <div className="mt-2">
                  <BulkAdjustControls
                    maxAdd={maxApplicable}
                    onAdd={(amount) => applyInstitutionMandate(unitId, mandateId, amount)}
                    addLabel="Apply"
                    compact
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
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

function UnitPanel({ config, incomeLabel, totalCost, nextCost, quantity, buyMode, disabled, blockedByDeskCapacity = false, unlocked, titleDescription, onBuy, onModeChange, assignmentSummary, extraContent }: {
  config: UnitPanelConfig
  incomeLabel: string
  totalCost: number
  nextCost: number
  quantity: number
  buyMode: BuyMode
  disabled: boolean
  blockedByDeskCapacity?: boolean
  unlocked: boolean
  titleDescription: string
  onBuy: () => void
  onModeChange: (_mode: BuyMode) => void
  assignmentSummary?: HumanAssignmentSummary
  extraContent?: ReactNode
}) {
  const status = unlocked ? (blockedByDeskCapacity ? 'Need Desk Slots' : disabled ? 'Need cash' : 'Ready') : 'Locked'
  const statusTone = unlocked ? (blockedByDeskCapacity ? 'warning' : disabled ? 'warning' : 'ready') : 'locked'
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
        disabledReason={!unlocked ? config.lockedReason : blockedByDeskCapacity ? 'Need more Desk Slots for additional staff.' : disabled ? 'Not enough cash for current buy mode.' : undefined}
        badges={badges}
        onClick={onBuy}
        footer={<div className="space-y-1.5"><DeskUnitBuyControls unitId={config.unitId} activeMode={buyMode} onChange={onModeChange} />{extraContent}</div>}
        compact
      />
    </div>
  )
}

function AutomationCard({ unitId }: { unitId: AutomationUnitId }) {
  const gameState = useGameStore((state) => state)
  const buyUnit = useGameStore((state) => state.buyUnit)
  const setUnitBuyMode = useGameStore((state) => state.setUnitBuyMode)
  const setAutomationMarketTarget = useGameStore((state) => state.setAutomationMarketTarget)
  const setAutomationStrategy = useGameStore((state) => state.setAutomationStrategy)

  const unlocked = useGameStore(selectors.automationUnitUnlocked(unitId))
  const owned = useGameStore(selectors.automationUnitOwnedCount(unitId))
  const buyMode = useGameStore(selectors.automationBuyMode(unitId))
  const quantity = useGameStore(selectors.automationBulkQuantity(unitId))
  const totalCost = useGameStore(selectors.automationBulkTotalCost(unitId))
  const nextCost = useGameStore(selectors.automationNextCost(unitId))
  const config = useGameStore(selectors.automationConfig(unitId))
  const runtime = useGameStore(selectors.automationCycleRuntime(unitId))
  const progressPercent = useGameStore(selectors.automationProgressPercent(unitId))
  const nextPayout = useGameStore(selectors.automationAdjustedPayout(unitId))
  const averageIncome = useGameStore(selectors.automationAverageIncomePerSecond(unitId))
  const timeRemaining = useGameStore(selectors.automationTimeRemaining(unitId))
  const displayedCycleDuration = useGameStore(selectors.automationDisplayedCycleDuration(unitId))
  const powerUse = useGameStore(selectors.automationPowerUse(unitId))
  const unlockedStrategies = getUnlockedAutomationStrategies(gameState)
  const canAfford = quantity > 0 && gameState.cash >= totalCost
  const justPaid = runtime.lastCompletedAt !== null && Date.now() - runtime.lastCompletedAt < Number(mechanics.constants.automationPayoutFlashMs)
  const payoutFlashClass = justPaid
    ? unitId === 'quantTrader'
      ? 'border-amber-400/50 bg-amber-500/10 text-amber-100'
      : unitId === 'ruleBasedBot'
        ? 'border-sky-400/50 bg-sky-500/10 text-sky-100'
        : unitId === 'mlTradingBot'
          ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100'
          : 'border-rose-400/50 bg-rose-500/10 text-rose-100'
    : null
  const label = AUTOMATION_UNITS[unitId].name
  const lockedReason = unitId === 'quantTrader'
    ? `Requires Algorithmic Foundations research (${gameState.purchasedResearchTech.algorithmicTrading ? 'done' : 'not researched'}).`
    : unitId === 'ruleBasedBot'
      ? `Requires Rule-Based Automation research (${gameState.purchasedResearchTech.ruleBasedAutomation ? 'done' : 'not researched'}).`
      : unitId === 'mlTradingBot'
        ? `Requires Machine Learning Trading research and at least 1 Data Centre (${gameState.dataCenterCount}/1).`
        : `Requires AI Trading Systems research and at least 1 Cloud Compute (${gameState.cloudComputeCount}/1).`

  return (
    <div className={!unlocked ? 'opacity-60' : undefined}>
      <div className={`rounded-xl border border-border/80 bg-background/65 p-2 transition-all duration-300 ${justPaid ? 'scale-[1.01] shadow-[0_0_0_1px_rgba(34,197,94,0.35),0_0_28px_rgba(34,197,94,0.12)]' : ''}`}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">{label}</h3>
          <Badge variant="outline" className={unlocked ? 'h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary' : 'h-5 rounded-md border-border/70 bg-background/50 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground'}>{unlocked ? 'Online' : 'Locked'}</Badge>
          <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Owned {owned}</Badge>
          <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Cycle {formatNumber(displayedCycleDuration, { decimalsBelowThreshold: 1 })}s</Badge>
          <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatNumber(powerUse * owned, { decimalsBelowThreshold: 1 })} power</Badge>
        </div>
        <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{unlocked ? AUTOMATION_UNITS[unitId].description : lockedReason}</p>

        <div className="mt-3 space-y-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Cycle Progress</span>
              <div className="flex items-center gap-3 normal-case tracking-normal text-[11px]">
                <span className={justPaid && payoutFlashClass ? `transition-all duration-300 ${payoutFlashClass}` : undefined}>{formatCurrency(nextPayout, nextPayout < 100 ? 1 : 0)}</span>
                <span>{formatRate(averageIncome).replace(' / sec', '/s')}</span>
                <span>{formatNumber(timeRemaining, { decimalsBelowThreshold: 1 })}s</span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded bg-background/80">
              <div
                className="h-full rounded transition-all duration-200"
                style={{
                  width: `${progressPercent * 100}%`,
                  background: 'linear-gradient(90deg, rgb(220 38 38) 0%, rgb(194 65 12) 18%, rgb(234 179 8) 58%, rgb(132 204 22) 82%, rgb(34 197 94) 100%)',
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-2 lg:grid-cols-2">
          <label className="rounded-lg border border-border/70 bg-background/45 p-2 text-[11px] text-muted-foreground">
            <span className="block text-[10px] uppercase tracking-[0.16em] text-primary">Target Market</span>
            <select
              value={config.marketTarget ?? ''}
              onChange={(event) => setAutomationMarketTarget(unitId, event.target.value === '' ? null : event.target.value as SectorId)}
              className="mt-2 h-8 w-full rounded-md border border-border/70 bg-background/70 px-2 text-xs text-foreground outline-none"
              disabled={!unlocked}
            >
              <option value="">Unassigned</option>
              <option value="finance">Finance</option>
              <option value="technology">Technology</option>
              <option value="energy">Energy</option>
            </select>
          </label>
          <label className="rounded-lg border border-border/70 bg-background/45 p-2 text-[11px] text-muted-foreground">
            <span className="block text-[10px] uppercase tracking-[0.16em] text-primary">Strategy</span>
            <select
              value={config.strategy ?? ''}
              onChange={(event) => setAutomationStrategy(unitId, event.target.value === '' ? null : event.target.value as typeof config.strategy)}
              className="mt-2 h-8 w-full rounded-md border border-border/70 bg-background/70 px-2 text-xs text-foreground outline-none"
              disabled={!unlocked}
            >
              <option value="">No strategy</option>
              {AUTOMATION_STRATEGY_IDS.map((strategyId) => (
                <option key={`${unitId}-${strategyId}`} value={strategyId} disabled={!unlockedStrategies.includes(strategyId)}>
                  {AUTOMATION_STRATEGIES[strategyId].name}{!unlockedStrategies.includes(strategyId) ? ' (locked)' : ''}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Automation</span>
          {BUY_MODES.map((mode) => (
            <Button key={`${unitId}-${String(mode)}`} size="xs" variant={buyMode === mode ? 'default' : 'outline'} className="rounded-md uppercase tracking-[0.12em]" onClick={() => setUnitBuyMode(unitId as UnitId, mode)}>
              {typeof mode === 'number' ? `x${mode}` : 'Max'}
            </Button>
          ))}
          <Button size="xs" variant={canAfford && unlocked ? 'default' : 'outline'} className="ml-auto rounded-md uppercase tracking-[0.12em]" disabled={!unlocked || !canAfford} onClick={() => buyUnit(unitId as UnitId, buyMode)}>
            {`${buyMode === 'max' ? `Deploy Max (${quantity})` : `Deploy ${typeof buyMode === 'number' ? `x${buyMode}` : 'Max'}`} ${formatCurrency(totalCost || nextCost)}`}
          </Button>
        </div>
      </div>
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
  const manualTradeOptimizationRank = useGameStore(selectors.repeatableUpgradeRank('manualExecutionRefinement'))
  const internIncome = useGameStore(selectors.internIncome)
  const juniorIncome = useGameStore(selectors.juniorIncome)
  const seniorIncome = useGameStore(selectors.seniorIncome)
  const propDeskIncome = useGameStore(selectors.propDeskIncome)
  const institutionalDeskIncome = useGameStore(selectors.institutionalDeskIncome)
  const hedgeFundIncome = useGameStore(selectors.hedgeFundIncome)
  const investmentFirmIncome = useGameStore(selectors.investmentFirmIncome)
  const quantTraderIncome = useGameStore(selectors.quantTraderIncome)
  const ruleBasedBotIncome = useGameStore(selectors.ruleBasedBotIncome)
  const mlTradingBotIncome = useGameStore(selectors.mlTradingBotIncome)
  const aiTradingBotIncome = useGameStore(selectors.aiTradingBotIncome)
  const researchPointsPerSecond = useGameStore(selectors.researchPointsPerSecond)
  const influencePerSecond = useGameStore(selectors.influencePerSecond)
  const powerResearchUnlocked = useGameStore(selectors.powerInfrastructureUnlocked)
  const powerUsage = useGameStore(selectors.powerUsage)
  const powerCapacity = useGameStore(selectors.powerCapacity)
  const capacityPowerUsage = useGameStore(selectors.capacityPowerUsage)
  const machineEfficiencyMultiplier = useGameStore(selectors.machineEfficiencyMultiplier)
  const quantTraderPowerUsage = useGameStore(selectors.quantTraderPowerUsage)
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
  const deskSpaceVisible = useGameStore(selectors.capacityInfrastructureVisible('deskSpace'))
  const floorSpaceVisible = useGameStore(selectors.capacityInfrastructureVisible('floorSpace'))
  const officeVisible = useGameStore(selectors.capacityInfrastructureVisible('office'))
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
  const nextQuantTraderCost = useGameStore(selectors.nextQuantTraderCost)
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
  const quantTraderBuyMode = useGameStore(selectors.unitBuyMode('quantTrader'))
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
      lockedReason: 'Unlock with Foundations of Finance Training in Research.',
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
      unitId: 'quantTrader',
      title: 'Quant Trader',
      purchaseLabel: 'Deploy',
      lockedReason: `Requires Algorithmic Foundations research (${gameState.purchasedResearchTech.algorithmicTrading ? 'done' : 'not researched'}).`,
      totalLabel: 'System',
      extraBadges: ['Cycle-based'],
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
      lockedReason: 'Unlock with Foundations of Finance Training in Research.',
      totalLabel: 'Research',
      extraBadges: ['0.35 RP / sec', 'Desk-based'],
    },
    {
      unitId: 'juniorResearchScientist',
      title: 'Junior Scientist',
      purchaseLabel: 'Hire',
      lockedReason: `Requires Junior Scientists research (${gameState.purchasedResearchTech.juniorScientists ? 'done' : 'not researched'}).`,
      totalLabel: 'Research',
      extraBadges: ['1.1 RP / sec', 'Desk-based'],
    },
    {
      unitId: 'seniorResearchScientist',
      title: 'Senior Scientist',
      purchaseLabel: 'Hire',
      lockedReason: `Requires Senior Scientists research (${gameState.purchasedResearchTech.seniorScientists ? 'done' : 'not researched'}).`,
      totalLabel: 'Research',
      extraBadges: ['3.4 RP / sec', 'Desk-based'],
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
      lockedReason: `Requires Rule-Based Automation research (${gameState.purchasedResearchTech.ruleBasedAutomation ? 'done' : 'not researched'}).`,
      totalLabel: 'Machine',
      extraBadges: ['5 power each'],
    },
    {
      unitId: 'mlTradingBot',
      title: 'ML Bot',
      purchaseLabel: 'Deploy',
      lockedReason: `Requires Machine Learning Trading and at least 1 Data Centre (${gameState.dataCenterCount}/1).`,
      totalLabel: 'Machine',
      extraBadges: ['18 power each'],
    },
    {
      unitId: 'aiTradingBot',
      title: 'AI Bot',
      purchaseLabel: 'Deploy',
      lockedReason: `Requires AI Trading Systems research and at least 1 Cloud Compute (${gameState.cloudComputeCount}/1).`,
      totalLabel: 'Machine',
      extraBadges: ['48 power each'],
    },
  ]

  const getUnitState = (unitId: UnitId) => {
    const unlocked = selectors.isUnitUnlocked(unitId)(gameState)
    const deskLimited = unitId === 'intern' || unitId === 'juniorTrader' || unitId === 'seniorTrader' || unitId === 'internResearchScientist' || unitId === 'juniorResearchScientist' || unitId === 'seniorResearchScientist'
    const disabled = !selectors.canAffordUnitInCurrentMode(unitId)(gameState)
    const totalCost = selectors.bulkUnitTotalCost(unitId)(gameState)
    const quantity = selectors.bulkUnitQuantity(unitId)(gameState)
    const currentBuyMode = selectors.unitBuyMode(unitId)(gameState)
    const blockedByDeskCapacity = deskLimited && (
      availableDeskSlots <= 0
      || (typeof currentBuyMode === 'number' && availableDeskSlots < currentBuyMode)
    )

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

    if (unitId === 'quantTrader') {
      return { unlocked, disabled, blockedByDeskCapacity: false, totalCost, quantity, nextCost: nextQuantTraderCost, buyMode: quantTraderBuyMode, count: gameState.quantTraderCount, totalIncome: formatRate(quantTraderIncome), description: UNITS.quantTrader.description }
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
      return { unlocked, disabled: disabled || blockedByDeskCapacity, blockedByDeskCapacity, totalCost, quantity, nextCost: nextInternScientistCost, buyMode: internScientistBuyMode, count: gameState.internResearchScientistCount, totalIncome: `${formatNumber(gameState.internResearchScientistCount * 0.35, { decimalsBelowThreshold: 2 })} RP / sec`, description: UNITS.internResearchScientist.description }
    }

    if (unitId === 'juniorResearchScientist') {
      return { unlocked, disabled: disabled || blockedByDeskCapacity, blockedByDeskCapacity, totalCost, quantity, nextCost: nextJuniorScientistCost, buyMode: juniorScientistBuyMode, count: gameState.juniorResearchScientistCount, totalIncome: `${formatNumber(gameState.juniorResearchScientistCount * 1.1, { decimalsBelowThreshold: 1 })} RP / sec`, description: UNITS.juniorResearchScientist.description }
    }

    if (unitId === 'juniorPolitician') {
      return { unlocked, disabled, blockedByDeskCapacity: false, totalCost, quantity, nextCost: nextJuniorPoliticianCost, buyMode: juniorPoliticianBuyMode, count: gameState.juniorPoliticianCount, totalIncome: `${formatNumber(gameState.juniorPoliticianCount * 0.01, { decimalsBelowThreshold: 2 })} inf / sec`, description: UNITS.juniorPolitician.description }
    }

    return { unlocked, disabled: disabled || blockedByDeskCapacity, blockedByDeskCapacity, totalCost, quantity, nextCost: nextSeniorScientistCost, buyMode: seniorScientistBuyMode, count: gameState.seniorResearchScientistCount, totalIncome: `${formatNumber(gameState.seniorResearchScientistCount * 3.4, { decimalsBelowThreshold: 1 })} RP / sec`, description: UNITS.seniorResearchScientist.description }
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
  const serverRackVisible = useGameStore(selectors.powerInfrastructureVisible('serverRack'))
  const serverRoomVisible = useGameStore(selectors.powerInfrastructureVisible('serverRoom'))
  const dataCenterVisible = useGameStore(selectors.powerInfrastructureVisible('dataCenter'))
  const cloudComputeVisible = useGameStore(selectors.powerInfrastructureVisible('cloudCompute'))
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
          <div className="rounded-xl border border-border/70 bg-background/35 p-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Users className="size-4 text-primary" />
              <p className="text-[10px] uppercase tracking-[0.16em] text-primary">People Traders</p>
            </div>
            <div className="mt-2 space-y-2">
          {unitPanelConfigs.filter((item) => item.unitId === 'intern' || item.unitId === 'juniorTrader' || item.unitId === 'seniorTrader').map((config) => {
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
                blockedByDeskCapacity={state.blockedByDeskCapacity}
                unlocked={state.unlocked}
                titleDescription={state.description}
                assignmentSummary={assignmentSummary}
                extraContent={config.unitId === 'seniorTrader'
                  ? <TraderSpecialistManager unitId="seniorTrader" />
                  : config.unitId === 'propDesk' || config.unitId === 'institutionalDesk' || config.unitId === 'hedgeFund' || config.unitId === 'investmentFirm'
                    ? <InstitutionalMandateManager unitId={config.unitId} />
                    : undefined}
                onBuy={() => buyUnit(config.unitId, state.buyMode)}
                onModeChange={(mode) => setUnitBuyMode(config.unitId, mode)}
              />
            )
          })}
            </div>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/35 p-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <MonitorCog className="size-4 text-primary" />
              <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Organizational Units</p>
            </div>
            <div className="mt-2 space-y-2">
          {unitPanelConfigs.filter((item) => item.unitId === 'propDesk' || item.unitId === 'institutionalDesk' || item.unitId === 'hedgeFund' || item.unitId === 'investmentFirm').map((config) => {
            const state = getUnitState(config.unitId)
            const mandateUnitId = config.unitId === 'propDesk' || config.unitId === 'institutionalDesk' || config.unitId === 'hedgeFund' || config.unitId === 'investmentFirm'
              ? config.unitId
              : 'propDesk'
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
                blockedByDeskCapacity={state.blockedByDeskCapacity}
                unlocked={state.unlocked}
                titleDescription={state.description}
                extraContent={<InstitutionalMandateManager unitId={mandateUnitId} />}
                onBuy={() => buyUnit(config.unitId, state.buyMode)}
                onModeChange={(mode) => setUnitBuyMode(config.unitId, mode)}
              />
            )
          })}
            </div>
          </div>
        </div> : null}

        {showSectorsView ? <SectorsTab /> : null}

        {showScientistsView ? <div className={gameState.purchasedResearchTech.foundationsOfFinanceTraining ? 'terminal-panel space-y-2 rounded-xl border-border/80 bg-card/92 p-2.5' : 'terminal-panel space-y-2 rounded-xl border-border/60 bg-card/70 p-2.5 opacity-60'}>
          <div className="flex flex-wrap items-center gap-2">
            <FlaskConical className="size-4 text-primary" />
            <h3 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">Scientists</h3>
            <Badge variant="outline" className={gameState.purchasedResearchTech.foundationsOfFinanceTraining ? 'h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary' : 'h-5 rounded-md border-border/70 bg-background/50 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground'}>{gameState.purchasedResearchTech.foundationsOfFinanceTraining ? 'Unlocked' : 'Locked'}</Badge>
            {gameState.purchasedResearchTech.foundationsOfFinanceTraining ? (
              <>
                <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatPlainRate(researchPointsPerSecond)} research</Badge>
                <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{availableDeskSlots} free desks</Badge>
              </>
            ) : null}
          </div>
          <p className="text-[11px] leading-4 text-muted-foreground">Scientists now use desk capacity like traders. They no longer consume energy, so office space is the main scaling constraint for the research team.</p>
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
                blockedByDeskCapacity={state.blockedByDeskCapacity}
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
                blockedByDeskCapacity={state.blockedByDeskCapacity}
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
            <h3 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">Automation Systems</h3>
            <Badge variant="outline" className={selectors.algorithmicUnlocked(gameState) ? 'h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary' : 'h-5 rounded-md border-border/70 bg-background/50 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground'}>{selectors.algorithmicUnlocked(gameState) ? 'Unlocked' : 'Locked'}</Badge>
            {selectors.algorithmicUnlocked(gameState) ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatRate(quantTraderIncome + ruleBasedBotIncome + mlTradingBotIncome + aiTradingBotIncome)} avg</Badge> : null}
            {selectors.algorithmicUnlocked(gameState) ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Quant {formatNumber(quantTraderPowerUsage, { decimalsBelowThreshold: 1 })} power</Badge> : null}
            {selectors.algorithmicUnlocked(gameState) ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Rule {formatNumber(ruleBasedBotPowerUsage, { decimalsBelowThreshold: 1 })} power</Badge> : null}
            {selectors.algorithmicUnlocked(gameState) ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">ML {formatNumber(mlTradingBotPowerUsage, { decimalsBelowThreshold: 1 })} power</Badge> : null}
            {selectors.algorithmicUnlocked(gameState) ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">AI {formatNumber(aiTradingBotPowerUsage, { decimalsBelowThreshold: 1 })} power</Badge> : null}
          </div>
          <p className="text-[11px] leading-4 text-muted-foreground">Automation runs in visible execution cycles. Pick a target market and strategy for each machine class, then watch payout ticks land on completion instead of smooth passive income.</p>
          <div className="space-y-2">
            {AUTOMATION_UNIT_IDS.map((unitId) => (
              <AutomationCard key={unitId} unitId={unitId} />
            ))}
          </div>
        </div> : null}

        {showInfrastructureView ? <div className="terminal-panel space-y-2 rounded-xl border-border/80 bg-card/92 p-2.5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Lock className="size-4 text-primary" />
              <h3 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">Infrastructure</h3>
              <Badge variant="outline" className="h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary">Office Unlocked</Badge>
              <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatNumber(powerUsage, { decimalsBelowThreshold: 1 })} use / {formatNumber(powerCapacity, { decimalsBelowThreshold: 1 })} generating</Badge>
               {powerResearchUnlocked ? <Badge variant="outline" className="h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary">Energy Research Unlocked</Badge> : <Badge variant="outline" className="h-5 rounded-md border-border/70 bg-background/50 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Energy Research Locked</Badge>}
              {powerResearchUnlocked ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Quant {formatNumber(quantTraderPowerUsage, { decimalsBelowThreshold: 1 })}</Badge> : null}
              {powerResearchUnlocked ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Rule {formatNumber(ruleBasedBotPowerUsage, { decimalsBelowThreshold: 1 })}</Badge> : null}
              {powerResearchUnlocked ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">ML {formatNumber(mlTradingBotPowerUsage, { decimalsBelowThreshold: 1 })}</Badge> : null}
              {powerResearchUnlocked ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">AI {formatNumber(aiTradingBotPowerUsage, { decimalsBelowThreshold: 1 })}</Badge> : null}
            </div>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">Office capacity is available from the start and uses baseline utility power. Energy infrastructure is a separate research-gated lane for machine systems and larger electrical expansion. Permanent infrastructure upgrades like Rack Stacking are bought from the Upgrades tab, not this panel.</p>
            {machineEfficiencyMultiplier < 1 ? <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-amber-400">Over capacity - powered output {Math.round(machineEfficiencyMultiplier * 100)}%</p> : null}
          </div>

          <div className="space-y-2 rounded-xl border border-border/70 bg-background/35 p-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <h4 className="text-[12px] font-semibold leading-none text-foreground">Office</h4>
              <Badge variant="outline" className="h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary">{usedDeskSlots} / {totalDeskSlots} desks used</Badge>
              <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{availableDeskSlots} free</Badge>
            </div>
            <p className="text-[11px] leading-4 text-muted-foreground">Buy more space for traders and scientists here. Desk Space is the cheapest patch for one more staff seat, Floor Space is the first real expansion, and Office is the large-scale late purchase.</p>
            <div className="space-y-2">
               {[
                { id: 'deskSpace' as const, count: gameState.deskSpaceCount, buyMode: deskSpaceBuyMode, totalCost: deskSpaceTotalCost, quantity: deskSpaceQuantity, nextCost: deskSpaceCost, slotsGranted: CAPACITY_INFRASTRUCTURE.deskSpace.slotsGranted, powerUsage: CAPACITY_INFRASTRUCTURE.deskSpace.powerUsage, name: CAPACITY_INFRASTRUCTURE.deskSpace.name, description: CAPACITY_INFRASTRUCTURE.deskSpace.description, canAffordCash: gameState.cash >= (deskSpaceQuantity > 0 ? deskSpaceTotalCost : deskSpaceCost), canAffordEnergy: selectors.canAffordCapacityPower(CAPACITY_INFRASTRUCTURE.deskSpace.powerUsage * Math.max(1, deskSpaceQuantity))(gameState), visible: deskSpaceVisible, lockedReason: 'Starter office expansion available from the start.' },
                { id: 'floorSpace' as const, count: gameState.floorSpaceCount, buyMode: floorSpaceBuyMode, totalCost: floorSpaceTotalCost, quantity: floorSpaceQuantity, nextCost: floorSpaceCost, slotsGranted: CAPACITY_INFRASTRUCTURE.floorSpace.slotsGranted, powerUsage: CAPACITY_INFRASTRUCTURE.floorSpace.powerUsage, name: CAPACITY_INFRASTRUCTURE.floorSpace.name, description: CAPACITY_INFRASTRUCTURE.floorSpace.description, canAffordCash: gameState.cash >= (floorSpaceQuantity > 0 ? floorSpaceTotalCost : floorSpaceCost), canAffordEnergy: selectors.canAffordCapacityPower(CAPACITY_INFRASTRUCTURE.floorSpace.powerUsage * Math.max(1, floorSpaceQuantity))(gameState), visible: floorSpaceVisible, lockedReason: 'Requires Floor Space Planning research.' },
                { id: 'office' as const, count: gameState.officeCount, buyMode: officeBuyMode, totalCost: officeTotalCost, quantity: officeQuantity, nextCost: officeCost, slotsGranted: CAPACITY_INFRASTRUCTURE.office.slotsGranted, powerUsage: CAPACITY_INFRASTRUCTURE.office.powerUsage, name: CAPACITY_INFRASTRUCTURE.office.name, description: CAPACITY_INFRASTRUCTURE.office.description, canAffordCash: gameState.cash >= (officeQuantity > 0 ? officeTotalCost : officeCost), canAffordEnergy: selectors.canAffordCapacityPower(CAPACITY_INFRASTRUCTURE.office.powerUsage * Math.max(1, officeQuantity))(gameState), visible: officeVisible, lockedReason: 'Requires Office Expansion Planning research.' },
                ].map((item) => (
                <PurchaseCard
                  key={item.id}
                  title={item.name}
                  description={item.visible ? item.description : item.lockedReason}
                  status={!item.visible ? 'Locked' : item.canAffordCash && item.canAffordEnergy ? 'Ready' : !item.canAffordCash ? 'Need cash' : 'Need energy'}
                  statusTone={!item.visible ? 'locked' : item.canAffordCash && item.canAffordEnergy ? 'ready' : 'warning'}
                  actionLabel={`Build ${formatCurrency(item.totalCost || item.nextCost)}`}
                  disabled={!item.visible || !item.canAffordCash || !item.canAffordEnergy}
                  disabledReason={!item.visible ? item.lockedReason : !item.canAffordCash ? 'Not enough cash for this expansion.' : !item.canAffordEnergy ? 'Need more total power capacity for this office expansion.' : undefined}
                  badges={[`${item.count} owned`, `+${item.slotsGranted * Math.max(1, item.quantity)} slots`, `${formatNumber(item.powerUsage * Math.max(1, item.quantity), { decimalsBelowThreshold: 1 })} energy`]}
                  onClick={() => {
                    if (!item.visible) return
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
               {powerResearchUnlocked ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatNumber(powerUsage, { decimalsBelowThreshold: 1 })} / {formatNumber(powerCapacity, { decimalsBelowThreshold: 1 })}</Badge> : null}
            </div>
            <p className="text-[11px] leading-4 text-muted-foreground">Machine infrastructure powers bots and compute systems. Expand this lane to support higher bot tiers and avoid over-capacity penalties. Upgrade cards for this lane live in Upgrades - Infrastructure Upgrades.</p>
            <div className="space-y-2">
              {[
              { id: 'serverRack' as const, count: serverRackCount, buyMode: serverRackBuyMode, totalCost: serverRackTotalCost, quantity: serverRackQuantity, nextCost: nextServerRackCost, canAfford: canAffordServerRack, visible: serverRackVisible, lockedReason: 'Requires Power Systems Engineering research.' },
               { id: 'serverRoom' as const, count: serverRoomCount, buyMode: serverRoomBuyMode, totalCost: serverRoomTotalCost, quantity: serverRoomQuantity, nextCost: nextServerRoomCost, canAfford: canAffordServerRoom, visible: serverRoomVisible, lockedReason: 'Requires Server Room Systems research.' },
               { id: 'dataCenter' as const, count: dataCenterCount, buyMode: dataCenterBuyMode, totalCost: dataCenterTotalCost, quantity: dataCenterQuantity, nextCost: nextDataCenterCost, canAfford: canAffordDataCenter, visible: dataCenterVisible, lockedReason: 'Late-run infrastructure. Requires Data Centre Systems research.' },
               { id: 'cloudCompute' as const, count: cloudComputeCount, buyMode: cloudComputeBuyMode, totalCost: cloudComputeTotalCost, quantity: cloudComputeQuantity, nextCost: nextCloudComputeCost, canAfford: canAffordCloudCompute, visible: cloudComputeVisible, lockedReason: 'Late-run infrastructure. Requires Cloud Infrastructure research.' },
              ].map((item) => {
                const definition = POWER_INFRASTRUCTURE[item.id]
                 const status = item.visible && powerResearchUnlocked ? (item.canAfford ? 'Ready' : 'Need cash') : 'Locked'
                  const statusTone = item.visible && powerResearchUnlocked ? (item.canAfford ? 'ready' : 'warning') : 'locked'
                return (
                  <div key={item.id} className={!item.visible ? 'opacity-60' : undefined}>
                    <PurchaseCard
                      title={definition.name}
                      description={item.visible ? definition.description : item.lockedReason}
                      infoTooltip={`${item.visible ? definition.description : item.lockedReason}\n\n${item.buyMode === 'max' ? `Max (${item.quantity})` : `x${item.buyMode}`} costs ${formatCurrency(item.totalCost || item.nextCost)}${item.buyMode !== 'max' ? ` | Next ${formatCurrency(item.nextCost)}` : ''}`}
                      status={status}
                      statusTone={statusTone}
                      actionLabel={`Build ${formatCurrency(item.totalCost || item.nextCost)}`}
                      disabled={!item.visible || !powerResearchUnlocked || !item.canAfford}
                      disabledReason={!item.visible ? item.lockedReason : !powerResearchUnlocked ? 'Requires Server Rack research first.' : !item.canAfford ? 'Not enough cash for current buy mode.' : undefined}
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
