import { useState } from 'react'
import { BriefcaseBusiness, Layers3, TrendingUp, Users } from 'lucide-react'
import { getSectorDefinition, SECTOR_IDS } from '@/data/sectors'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import type { GenericSectorAssignableUnitId, HumanAssignableUnitId, SectorId } from '@/types/game'
import { formatMultiplier, formatNumber, formatPlainRate } from '@/utils/formatting'
import { PurchaseCard, SummaryTile } from './DashboardPrimitives'

const ASSIGNABLE_UNITS: Array<{ id: HumanAssignableUnitId; label: string; shortLabel: string }> = [
  { id: 'intern', label: 'Interns', shortLabel: 'Interns' },
  { id: 'juniorTrader', label: 'Junior Traders', shortLabel: 'Juniors' },
  { id: 'seniorTrader', label: 'Senior Traders', shortLabel: 'Seniors' },
]

const INSTITUTION_UNITS = [
  { id: 'propDesk', label: 'Prop Desks' },
  { id: 'institutionalDesk', label: 'Institutional Desks' },
  { id: 'hedgeFund', label: 'Hedge Funds' },
  { id: 'investmentFirm', label: 'Investment Firms' },
] as const

const SECTOR_ASSIGNMENT_LABELS: Record<GenericSectorAssignableUnitId, string> = {
  intern: 'Interns',
  juniorTrader: 'Junior Traders',
  seniorTrader: 'Senior Traders',
  propDesk: 'Prop Desks',
  institutionalDesk: 'Institutional Desks',
  hedgeFund: 'Hedge Funds',
  investmentFirm: 'Investment Firms',
}

function SectorBulkAdjustControls({
  maxAdd,
  maxRemove,
  onAdd,
  onRemove,
}: {
  maxAdd: number
  maxRemove: number
  onAdd: (_amount: number) => void
  onRemove: (_amount: number) => void
}) {
  const [mode, setMode] = useState<'add' | 'remove'>('add')
  const [selectedAmount, setSelectedAmount] = useState<1 | 5 | 10 | 'max' | 'custom'>(1)
  const [customAmount, setCustomAmount] = useState('25')

  const maxAmount = mode === 'add' ? maxAdd : maxRemove
  const parsedCustom = Math.max(0, Math.floor(Number(customAmount) || 0))
  const resolvedAmount = selectedAmount === 'max'
    ? maxAmount
    : selectedAmount === 'custom'
      ? Math.min(parsedCustom, maxAmount)
      : Math.min(selectedAmount, maxAmount)

  return (
    <div className="rounded-lg border border-border/70 bg-background/40 p-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <Button size="xs" variant={mode === 'add' ? 'default' : 'outline'} className="rounded-md uppercase tracking-[0.12em]" onClick={() => setMode('add')}>
          Add
        </Button>
        <Button size="xs" variant={mode === 'remove' ? 'default' : 'outline'} className="rounded-md uppercase tracking-[0.12em]" onClick={() => setMode('remove')}>
          Remove
        </Button>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Available {maxAmount}</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {[1, 5, 10].map((amount) => (
          <Button
            key={`sector-bulk-${amount}`}
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

            if (mode === 'add') {
              onAdd(resolvedAmount)
              return
            }

            onRemove(resolvedAmount)
          }}
        >
          {mode === 'add' ? 'Assign' : 'Unassign'} {resolvedAmount > 0 ? resolvedAmount : ''}
        </Button>
      </div>
    </div>
  )
}

function SectorUnitControls({ unitId, sectorId }: { unitId: GenericSectorAssignableUnitId; sectorId: SectorId }) {
  const assignUnitToSector = useGameStore((state) => state.assignUnitToSector)
  const unassignUnitFromSector = useGameStore((state) => state.unassignUnitFromSector)
  const gameState = useGameStore((state) => state)
  const assigned = selectors.assignedCountForSector(unitId, sectorId)(gameState)
  const available = selectors.availableCount(unitId)(gameState)
  const activeSeniorSpecialists = unitId === 'seniorTrader'
    ? selectors.assignedTraderSpecialistsForSector('seniorTrader', sectorId, sectorId)(gameState)
    : 0
  const activeMandates = unitId === 'propDesk' || unitId === 'institutionalDesk' || unitId === 'hedgeFund' || unitId === 'investmentFirm'
    ? selectors.assignedInstitutionMandatesForSector(unitId, sectorId, sectorId)(gameState)
    : 0
  const breakdown = selectors.sectorBreakdown(gameState)[sectorId]
  const rate = unitId === 'intern'
    ? breakdown.internIncome * breakdown.multiplier
    : unitId === 'juniorTrader'
      ? breakdown.juniorIncome * breakdown.multiplier
      : unitId === 'seniorTrader'
        ? breakdown.seniorIncome * breakdown.multiplier
        : unitId === 'propDesk'
          ? breakdown.propDeskIncome * breakdown.multiplier
          : unitId === 'institutionalDesk'
            ? breakdown.institutionalDeskIncome * breakdown.multiplier
            : unitId === 'hedgeFund'
              ? breakdown.hedgeFundIncome * breakdown.multiplier
              : breakdown.investmentFirmIncome * breakdown.multiplier

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 bg-background/45 px-2 py-2">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-primary">{SECTOR_ASSIGNMENT_LABELS[unitId]}</p>
          {unitId === 'seniorTrader' ? (
            <>
              <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                Gen {assigned}
              </Badge>
              <Badge variant="outline" className="h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[9px] uppercase tracking-[0.1em] text-primary">
                Spec {activeSeniorSpecialists}
              </Badge>
            </>
          ) : null}
          {activeMandates > 0 ? (
            <Badge variant="outline" className="h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[9px] uppercase tracking-[0.1em] text-primary">
              Mandated {activeMandates}
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Assigned {assigned} | Available {available}
        </p>
      </div>
      <div className="flex items-center gap-2 sm:ml-auto">
        <p className="font-mono text-[12px] font-semibold text-foreground">
          {formatPlainRate(rate)}
        </p>
      </div>
      <div className="w-full sm:w-auto sm:min-w-[360px]">
        <SectorBulkAdjustControls
          maxAdd={available}
          maxRemove={assigned}
          onAdd={(amount) => assignUnitToSector(unitId, sectorId, amount)}
          onRemove={(amount) => unassignUnitFromSector(unitId, sectorId, amount)}
        />
      </div>
    </div>
  )
}

export function SectorsTab() {
  const gameState = useGameStore((state) => state)

  const unlockedSectors = selectors.unlockedSectors(gameState)
  const generalDeskCashPerSecond = selectors.generalDeskCashPerSecond(gameState)
  const sectorBreakdown = selectors.sectorBreakdown(gameState)
  const financeUnlocked = selectors.isSectorUnlocked('finance')(gameState)
  const technologyUnlocked = selectors.isSectorUnlocked('technology')(gameState)
  const energyUnlocked = selectors.isSectorUnlocked('energy')(gameState)

  const humanSummary = ASSIGNABLE_UNITS.map((unit) => ({
    ...unit,
    owned: selectors.ownedAssignableCount(unit.id)(gameState),
    assigned: selectors.assignedCount(unit.id)(gameState),
    available: selectors.availableCount(unit.id)(gameState),
    activeSpecialists: unit.id === 'seniorTrader' ? selectors.totalTraderSpecialists('seniorTrader')(gameState) : 0,
  }))

  const totalAvailableTraders = humanSummary.reduce((total, unit) => total + unit.available, 0)
  const totalSeniorSpecialists = humanSummary.find((unit) => unit.id === 'seniorTrader')?.activeSpecialists ?? 0
  const availableInterns = humanSummary.find((unit) => unit.id === 'intern')?.available ?? 0
  const availableJuniors = humanSummary.find((unit) => unit.id === 'juniorTrader')?.available ?? 0
  const availableSeniors = humanSummary.find((unit) => unit.id === 'seniorTrader')?.available ?? 0

  const unlockedCount = [financeUnlocked, technologyUnlocked, energyUnlocked].filter(Boolean).length

  return (
    <Card className="terminal-panel rounded-2xl border-border/80 bg-card/92">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-[0.16em]">Sectors</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Assign human traders to specialized sectors while the rest continue working on the General Desk</CardDescription>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto pr-1">
        <div className="grid gap-2 md:grid-cols-4">
          <SummaryTile label="General Desk" value={formatPlainRate(generalDeskCashPerSecond)} icon={BriefcaseBusiness} infoTooltip="Unassigned Interns, Junior Traders, and Senior Traders continue producing on the General Desk by default." />
          <SummaryTile label="Unlocked Sectors" value={`${unlockedCount}/${SECTOR_IDS.length}`} icon={Layers3} infoTooltip="Research unlocks new sector lanes. Finance starts unlocked, while Technology and Energy are opened through Markets research." />
          <SummaryTile label="Sector Output" value={formatPlainRate(SECTOR_IDS.reduce((total, sectorId) => total + (unlockedSectors[sectorId] ? sectorBreakdown[sectorId].totalIncome : 0), 0))} icon={TrendingUp} infoTooltip="Assigned traders stop contributing to the General Desk and instead produce inside their assigned sector, multiplied by that sector's modifier." />
          <SummaryTile
            label="Trader Pool"
            value={totalSeniorSpecialists > 0 ? `${totalAvailableTraders} generic | ${totalSeniorSpecialists} specialists` : `${totalAvailableTraders} generic available`}
            icon={Users}
            infoTooltip={`Available traders: ${availableInterns} Interns, ${availableJuniors} Junior Traders, ${availableSeniors} Senior Traders.${totalSeniorSpecialists > 0 ? ` Senior specialists active: ${totalSeniorSpecialists}.` : ''}`}
          />
        </div>

        {SECTOR_IDS.map((sectorId) => {
          const sector = getSectorDefinition(sectorId)
          const unlocked = unlockedSectors[sectorId] === true
          const sectorIncome = selectors.sectorCashPerSecond(sectorId)(gameState)
          const activeSeniorSpecialists = selectors.assignedTraderSpecialistsForSector('seniorTrader', sectorId, sectorId)(gameState)
          const totalAssignedToSector = humanSummary.reduce((total, unit) => total + selectors.assignedCountForSector(unit.id, sectorId)(gameState), 0) + activeSeniorSpecialists
          const lockReason = sectorId === 'technology'
            ? 'Unlocks with Technology Markets research.'
            : sectorId === 'energy'
              ? 'Unlocks with Energy Markets research.'
              : 'Available from the start.'

          return (
            <div key={sectorId} className={!unlocked ? 'opacity-65' : undefined}>
          <PurchaseCard
                title={sector.name}
                description={unlocked ? sector.description : lockReason}
                status={unlocked ? 'Unlocked' : 'Locked'}
                statusTone={unlocked ? 'ready' : 'locked'}
                actionLabel={unlocked ? formatPlainRate(sectorIncome) : 'Locked'}
                disabled
                disabledReason={unlocked ? undefined : lockReason}
                badges={[
                  `Multiplier ${formatMultiplier(sector.baseProfitMultiplier)}`,
                  unlocked ? `${formatPlainRate(sectorIncome)}` : 'Future sector',
                  unlocked ? `${formatNumber(totalAssignedToSector)} assigned` : 'Locked lane',
                ]}
                footer={unlocked ? (
                  <div className="space-y-2">
                    {ASSIGNABLE_UNITS.map((unit) => <SectorUnitControls key={`${sectorId}-${unit.id}`} unitId={unit.id} sectorId={sectorId} />)}
                    {INSTITUTION_UNITS.map((unit) => <SectorUnitControls key={`${sectorId}-${unit.id}`} unitId={unit.id} sectorId={sectorId} />)}
                  </div>
                ) : undefined}
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
