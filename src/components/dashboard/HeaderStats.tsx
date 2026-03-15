import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import { formatCurrencyTicker, formatNumber, formatPlainRate, formatRate } from '@/utils/formatting'
import { getProgressionSummary } from '@/utils/progression'
import { Badge } from '@/components/ui/badge'

export function HeaderStats() {
  const gameState = useGameStore((state) => state)
  const cash = useGameStore((state) => state.cash)
  const cashPerSecond = useGameStore(selectors.cashPerSecond)
  const researchPoints = useGameStore(selectors.researchPoints)
  const reputation = useGameStore((state) => state.reputation)
  const prestigeCount = useGameStore((state) => state.prestigeCount)
  const powerUsage = useGameStore(selectors.powerUsage)
  const powerCapacity = useGameStore(selectors.powerCapacity)
  const researchPointsPerSecond = useGameStore(selectors.researchPointsPerSecond)
  const influence = useGameStore(selectors.influence)
  const influencePerSecond = useGameStore(selectors.influencePerSecond)
  const progressionSummary = getProgressionSummary(gameState)
  const researchVisible = gameState.purchasedUpgrades.juniorHiringProgram === true || gameState.internResearchScientistCount > 0 || gameState.juniorResearchScientistCount > 0 || gameState.seniorResearchScientistCount > 0 || researchPoints > 0

  return (
    <div className="grid gap-2 xl:grid-cols-[minmax(0,0.8fr)_minmax(220px,0.2fr)]">
      <section className="rounded-xl border border-border/80 bg-card/92 p-2.5 xl:min-h-[108px]">
        <div className="grid gap-2 xl:grid-cols-[minmax(260px,max-content)_minmax(0,1fr)] xl:items-center">
          <div className="flex min-h-[92px] flex-col justify-center self-center xl:min-h-[84px]">
            <p className="text-[10px] uppercase tracking-[0.18em] text-primary">Economy</p>
            <p className="mt-3 font-mono text-[36px] font-semibold leading-none text-foreground xl:text-[48px]">
              {formatCurrencyTicker(cash)}
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
              {formatRate(cashPerSecond)}
            </p>
          </div>

          <div className="flex min-w-0 flex-wrap content-center items-center gap-2 self-center xl:justify-end">
            {researchVisible ? <Badge variant="outline" className="min-h-10 justify-start whitespace-nowrap rounded-md border-border/80 bg-background/60 px-3 py-2 text-[11px] font-normal uppercase tracking-[0.12em] text-muted-foreground">Research <span className="ml-1.5 font-mono text-foreground">{formatNumber(researchPoints, { decimalsBelowThreshold: researchPoints < 100 ? 1 : 0 })}</span> <span className="ml-1.5 font-mono text-primary">{formatPlainRate(researchPointsPerSecond)}</span></Badge> : null}
            <Badge variant="outline" className="min-h-10 justify-start whitespace-nowrap rounded-md border-border/80 bg-background/60 px-3 py-2 text-[11px] font-normal uppercase tracking-[0.12em] text-muted-foreground">Power <span className="ml-1.5 font-mono text-foreground">{formatNumber(powerUsage, { decimalsBelowThreshold: 1 })} use</span> <span className="mx-1 font-mono text-muted-foreground">/</span> <span className="font-mono text-primary">{formatNumber(powerCapacity, { decimalsBelowThreshold: 1 })} generating</span></Badge>
            <Badge variant="outline" className="min-h-10 justify-start whitespace-nowrap rounded-md border-border/80 bg-background/60 px-3 py-2 text-[11px] font-normal uppercase tracking-[0.12em] text-muted-foreground">Influence <span className="ml-1.5 font-mono text-foreground">{formatNumber(influence, { decimalsBelowThreshold: influence < 100 ? 2 : 1 })}</span> <span className="ml-1.5 font-mono text-primary">{formatPlainRate(influencePerSecond)}</span></Badge>
            <Badge variant="outline" className="min-h-10 justify-start whitespace-nowrap rounded-md border-border/80 bg-background/60 px-3 py-2 text-[11px] font-normal uppercase tracking-[0.12em] text-muted-foreground">Reputation <span className="ml-1.5 font-mono text-foreground">{reputation.toLocaleString()}</span></Badge>
            <Badge variant="outline" className="min-h-10 justify-start whitespace-nowrap rounded-md border-border/80 bg-background/60 px-3 py-2 text-[11px] font-normal uppercase tracking-[0.12em] text-muted-foreground">Prestiges <span className="ml-1.5 font-mono text-foreground">{prestigeCount.toLocaleString()}</span></Badge>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border/80 bg-card/92 p-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[9px] uppercase tracking-[0.16em] text-primary">Milestones</p>
          <Badge variant="outline" className="h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[9px] uppercase tracking-[0.12em] text-primary">{progressionSummary.phaseLabel}</Badge>
        </div>
        <p className="mt-1 text-[9px] leading-3.5 text-muted-foreground">{progressionSummary.objective}</p>
        <div className="mt-1.5 rounded-lg border border-border/80 bg-background/60 p-1.5">
          <p className="text-[8px] uppercase tracking-[0.16em] text-muted-foreground">Current target</p>
          <p className="mt-0.5 text-[9px] leading-3.5 text-foreground">{progressionSummary.nextTarget}</p>
        </div>
      </section>
    </div>
  )
}
