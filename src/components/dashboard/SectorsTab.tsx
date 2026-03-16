import { BriefcaseBusiness, Building2, Layers3, TrendingUp, Zap } from 'lucide-react'
import { getSectorDefinition, SECTOR_IDS } from '@/data/sectors'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import type { HumanAssignableUnitId, SectorId } from '@/types/game'
import { formatMultiplier, formatNumber, formatPlainRate } from '@/utils/formatting'
import { PurchaseCard, SummaryTile } from './DashboardPrimitives'

const ASSIGNABLE_UNITS: Array<{ id: HumanAssignableUnitId; label: string; shortLabel: string }> = [
  { id: 'intern', label: 'Interns', shortLabel: 'Interns' },
  { id: 'juniorTrader', label: 'Junior Traders', shortLabel: 'Juniors' },
  { id: 'seniorTrader', label: 'Senior Traders', shortLabel: 'Seniors' },
]

function SectorUnitControls({ unitId, sectorId }: { unitId: HumanAssignableUnitId; sectorId: SectorId }) {
  const assignUnitToSector = useGameStore((state) => state.assignUnitToSector)
  const unassignUnitFromSector = useGameStore((state) => state.unassignUnitFromSector)
  const assignMaxToSector = useGameStore((state) => state.assignMaxToSector)
  const clearSectorAssignments = useGameStore((state) => state.clearSectorAssignments)
  const assigned = useGameStore(selectors.assignedCountForSector(unitId, sectorId))
  const available = useGameStore(selectors.availableCount(unitId))

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 bg-background/45 px-2 py-2">
      <div>
        <p className="text-[10px] uppercase tracking-[0.16em] text-primary">{ASSIGNABLE_UNITS.find((unit) => unit.id === unitId)?.label}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">Assigned {assigned} | Available {available}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Button size="xs" variant="outline" className="rounded-md uppercase tracking-[0.12em]" disabled={assigned <= 0} onClick={() => unassignUnitFromSector(unitId, sectorId, 1)}>
          -1
        </Button>
        <Button size="xs" variant="outline" className="rounded-md uppercase tracking-[0.12em]" disabled={available <= 0} onClick={() => assignUnitToSector(unitId, sectorId, 1)}>
          +1
        </Button>
        <Button size="xs" variant="outline" className="rounded-md uppercase tracking-[0.12em]" disabled={available <= 0} onClick={() => assignMaxToSector(unitId, sectorId)}>
          Max
        </Button>
        <Button size="xs" variant="outline" className="rounded-md uppercase tracking-[0.12em]" disabled={assigned <= 0} onClick={() => clearSectorAssignments(unitId, sectorId)}>
          Clear
        </Button>
      </div>
    </div>
  )
}

function SectorIncomeBreakdown({ sectorId }: { sectorId: SectorId }) {
  const gameState = useGameStore((state) => state)
  const breakdown = selectors.sectorBreakdown(gameState)[sectorId]

  return (
    <div className="grid gap-2 md:grid-cols-4">
      <div className="rounded-lg border border-border/70 bg-background/45 p-2 text-[11px] text-muted-foreground">
        <p className="uppercase tracking-[0.14em] text-primary">Interns</p>
        <p className="mt-1">{formatPlainRate(breakdown.internIncome * breakdown.multiplier)}</p>
      </div>
      <div className="rounded-lg border border-border/70 bg-background/45 p-2 text-[11px] text-muted-foreground">
        <p className="uppercase tracking-[0.14em] text-primary">Juniors</p>
        <p className="mt-1">{formatPlainRate(breakdown.juniorIncome * breakdown.multiplier)}</p>
      </div>
      <div className="rounded-lg border border-border/70 bg-background/45 p-2 text-[11px] text-muted-foreground">
        <p className="uppercase tracking-[0.14em] text-primary">Seniors</p>
        <p className="mt-1">{formatPlainRate(breakdown.seniorIncome * breakdown.multiplier)}</p>
      </div>
      <div className="rounded-lg border border-primary/30 bg-primary/10 p-2 text-[11px] text-foreground">
        <p className="uppercase tracking-[0.14em] text-primary">Multiplier</p>
        <p className="mt-1">{formatMultiplier(breakdown.multiplier)} ({Math.round((breakdown.multiplier - 1) * 100)}%)</p>
      </div>
    </div>
  )
}

export function SectorsTab() {
  const gameState = useGameStore((state) => state)
  const acknowledgeSectorUnlock = useGameStore((state) => state.acknowledgeSectorUnlock)

  const unlockedSectors = selectors.unlockedSectors(gameState)
  const generalDeskCashPerSecond = selectors.generalDeskCashPerSecond(gameState)
  const sectorBreakdown = selectors.sectorBreakdown(gameState)
  const usedDeskSlots = selectors.usedDeskSlots(gameState)
  const totalDeskSlots = selectors.totalDeskSlots(gameState)
  const availableDeskSlots = selectors.availableDeskSlots(gameState)
  const financeUnlocked = selectors.isSectorUnlocked('finance')(gameState)
  const technologyUnlocked = selectors.isSectorUnlocked('technology')(gameState)
  const energyUnlocked = selectors.isSectorUnlocked('energy')(gameState)

  const humanSummary = ASSIGNABLE_UNITS.map((unit) => ({
    ...unit,
    owned: selectors.ownedAssignableCount(unit.id)(gameState),
    assigned: selectors.assignedCount(unit.id)(gameState),
    available: selectors.availableCount(unit.id)(gameState),
  }))

  const unlockedCount = [financeUnlocked, technologyUnlocked, energyUnlocked].filter(Boolean).length

  return (
    <Card className="terminal-panel rounded-2xl border-border/80 bg-card/92">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-[0.16em]">Sectors</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Assign human traders to specialized sectors while unassigned staff keep working on the General Desk</CardDescription>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto pr-1">
        <div className="grid gap-2 md:grid-cols-3">
          <SummaryTile label="General Desk" value={formatPlainRate(generalDeskCashPerSecond)} icon={BriefcaseBusiness} />
          <SummaryTile label="Unlocked Sectors" value={`${unlockedCount}/${SECTOR_IDS.length}`} icon={Layers3} />
          <SummaryTile label="Sector Output" value={formatPlainRate(SECTOR_IDS.reduce((total, sectorId) => total + (unlockedSectors[sectorId] ? sectorBreakdown[sectorId].totalIncome : 0), 0))} icon={TrendingUp} />
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-[11px] text-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <Building2 className="size-4 text-primary" />
            <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Desk Capacity</p>
            <Badge variant="outline" className="h-5 rounded-md border-primary/40 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary">Desk Slots: {usedDeskSlots} / {totalDeskSlots} used</Badge>
            <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{availableDeskSlots} free</Badge>
          </div>
          <p className="mt-1">Sector assignment does not create more room. Desk capacity is firm-wide and limits total human traders, whether they stay on the General Desk or move into sectors. Expand under Infrastructure when the firm needs more seats.</p>
        </div>

        <div className="rounded-xl border border-border/80 bg-background/60 p-3">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-primary" />
            <p className="text-[10px] uppercase tracking-[0.18em] text-primary">Human Availability</p>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {humanSummary.map((unit) => (
              <div key={unit.id} className="rounded-lg border border-border/70 bg-background/45 p-2 text-[11px] text-muted-foreground">
                <p className="uppercase tracking-[0.14em] text-primary">{unit.label}</p>
                <p className="mt-1">{unit.owned} owned / {unit.assigned} assigned / {unit.available} available</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-[11px] text-foreground">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-primary" />
            <p className="uppercase tracking-[0.16em] text-primary">General Desk</p>
          </div>
          <p className="mt-1">Unassigned Interns, Juniors, and Seniors continue producing here by default. Sector assignment is an optimization layer, not a requirement.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {humanSummary.map((unit) => (
              <Badge key={unit.id} variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {unit.shortLabel} {unit.available}
              </Badge>
            ))}
            <Badge variant="outline" className="h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary">
              {formatPlainRate(generalDeskCashPerSecond)}
            </Badge>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-background/60 p-3 text-[11px] text-muted-foreground">
          <p className="text-[10px] uppercase tracking-[0.16em] text-primary">How Sector Output Works</p>
          <p className="mt-1">Each assigned Intern, Junior, or Senior stops contributing to the General Desk and starts contributing to one sector. Sector output uses the trader's current production after existing upgrades, then applies the sector multiplier.</p>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <div className={`rounded-xl border p-3 text-[11px] ${technologyUnlocked ? 'border-primary/30 bg-primary/10 text-foreground' : 'border-border/80 bg-background/55 text-muted-foreground'}`}>
            <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Technology Sector</p>
            <p className="mt-1">{technologyUnlocked ? 'Unlocked via Algorithmic Trading. Assign traders here for higher-growth returns.' : 'Research Algorithmic Trading to unlock this growth-focused sector.'}</p>
            {technologyUnlocked && gameState.ui.dismissedSectorUnlocks.technology !== true ? (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-primary/30 bg-background/55 p-2">
                <span className="text-[10px] uppercase tracking-[0.14em] text-primary">New unlock</span>
                <Button size="xs" className="rounded-md uppercase tracking-[0.12em]" onClick={() => acknowledgeSectorUnlock('technology')}>
                  Got it
                </Button>
              </div>
            ) : null}
          </div>
          <div className={`rounded-xl border p-3 text-[11px] ${energyUnlocked ? 'border-primary/30 bg-primary/10 text-foreground' : 'border-border/80 bg-background/55 text-muted-foreground'}`}>
            <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Energy Sector</p>
            <p className="mt-1">{energyUnlocked ? 'Unlocked via Power Systems Engineering. Use it as a steady sector with future power-related synergies.' : 'Research Power Systems Engineering to unlock this infrastructure-adjacent sector.'}</p>
            {energyUnlocked && gameState.ui.dismissedSectorUnlocks.energy !== true ? (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-primary/30 bg-background/55 p-2">
                <span className="text-[10px] uppercase tracking-[0.14em] text-primary">New unlock</span>
                <Button size="xs" className="rounded-md uppercase tracking-[0.12em]" onClick={() => acknowledgeSectorUnlock('energy')}>
                  Got it
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        {SECTOR_IDS.map((sectorId) => {
          const sector = getSectorDefinition(sectorId)
          const unlocked = unlockedSectors[sectorId] === true
          const sectorIncome = selectors.sectorCashPerSecond(sectorId)(gameState)
          const lockReason = sectorId === 'technology'
            ? 'Unlocks with Algorithmic Trading research.'
            : sectorId === 'energy'
              ? 'Unlocks with Power Systems Engineering research.'
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
                  unlocked ? `${formatNumber(humanSummary.reduce((total, unit) => total + selectors.assignedCountForSector(unit.id, sectorId)(gameState), 0))} assigned` : 'Locked lane',
                ]}
                footer={unlocked ? (
                  <div className="space-y-2">
                    <SectorIncomeBreakdown sectorId={sectorId} />
                    {ASSIGNABLE_UNITS.map((unit) => <SectorUnitControls key={`${sectorId}-${unit.id}`} unitId={unit.id} sectorId={sectorId} />)}
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
