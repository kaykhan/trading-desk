import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Beaker, Radio, Scale, Shield, TriangleAlert, Trophy, Users, Zap } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { getMarketEventAccentClasses } from '@/data/marketEvents'
import { selectors } from '@/store/selectors'
import { formatCurrencyTicker, formatNumber, formatPlainRate, formatRate } from '@/utils/formatting'
import { getNextRecommendedMilestoneSummary } from '@/utils/milestones'
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
  const complianceEfficiencyMultiplier = useGameStore(selectors.complianceEfficiencyMultiplier)
  const usedDeskSlots = useGameStore(selectors.usedDeskSlots)
  const totalDeskSlots = useGameStore(selectors.totalDeskSlots)
  const unlockedMilestoneCount = useGameStore(selectors.unlockedMilestoneCount)
  const totalMilestoneCount = useGameStore(selectors.totalMilestoneCount)
  const nextRecommendedMilestoneSummary = getNextRecommendedMilestoneSummary(gameState)
  const activeMarketEvent = useGameStore(selectors.activeMarketEvent)
  const activeMarketEventRemainingLabel = useGameStore(selectors.marketEventRemainingLabel)
  const nextMarketEventCooldownLabel = useGameStore(selectors.nextMarketEventCooldownLabel)
  const marketEventEffectSummary = useGameStore(selectors.marketEventEffectSummary)
  const openModal = useGameStore((state) => state.openModal)
  const researchVisible = gameState.purchasedResearchTech.foundationsOfFinanceTraining === true || gameState.internResearchScientistCount > 0 || gameState.juniorResearchScientistCount > 0 || gameState.seniorResearchScientistCount > 0 || researchPoints > 0
  const technologySectorUnlocked = selectors.technologySectorUnlocked(gameState)
  const energySectorUnlocked = selectors.energySectorUnlocked(gameState)
  const technologySectorJustUnlocked = technologySectorUnlocked && gameState.ui.dismissedSectorUnlocks.technology !== true
  const energySectorJustUnlocked = energySectorUnlocked && gameState.ui.dismissedSectorUnlocks.energy !== true
  const [marketNewsFlash, setMarketNewsFlash] = useState(false)
  const [tickerLineIndex, setTickerLineIndex] = useState(0)
  const previousEventIdRef = useRef<string | null>(null)
  const activeAccent = activeMarketEvent ? getMarketEventAccentClasses(activeMarketEvent.category) : null

  const activeTickerLines = activeMarketEvent
    ? [
        activeMarketEvent.name,
        activeMarketEvent.description,
        marketEventEffectSummary ?? 'Market conditions shifting.',
      ]
    : [
        'Markets are calm for now.',
        `Next event window in ${nextMarketEventCooldownLabel}.`,
        'Watch sector and machine conditions for the next move.',
      ]

  const compactStatBadges = [
    researchVisible
      ? {
          key: 'research',
          icon: Beaker,
          title: 'Research points and research gain',
          className: 'border-cyan-300/55 bg-cyan-400/14 text-cyan-50',
          body: <><span className="font-mono text-foreground">{formatNumber(researchPoints, { decimalsBelowThreshold: researchPoints < 100 ? 1 : 0 })}</span> <span className="ml-1.5 font-mono text-primary">{formatPlainRate(researchPointsPerSecond)}</span></>,
        }
      : null,
    {
      key: 'desks',
      icon: Users,
      title: 'Desk slots in use and total capacity',
      className: 'border-stone-300/55 bg-stone-400/14 text-stone-50',
      body: <span className="font-mono text-foreground">{usedDeskSlots} / {totalDeskSlots}</span>,
    },
    {
      key: 'power',
      icon: Zap,
      title: 'Power used and total generation',
      className: 'border-amber-300/55 bg-amber-400/14 text-amber-50',
      body: <><span className="font-mono text-foreground">{formatNumber(powerUsage, { decimalsBelowThreshold: 1 })}</span> <span className="mx-1 font-mono text-muted-foreground">/</span> <span className="font-mono text-primary">{formatNumber(powerCapacity, { decimalsBelowThreshold: 1 })}</span></>,
    },
    {
      key: 'influence',
      icon: Shield,
      title: 'Influence stockpile and gain rate',
      className: 'border-emerald-300/55 bg-emerald-400/14 text-emerald-50',
      body: <><span className="font-mono text-foreground">{formatNumber(influence, { decimalsBelowThreshold: influence < 100 ? 2 : 1 })}</span> <span className="ml-1.5 font-mono text-primary">{formatPlainRate(influencePerSecond)}</span></>,
    },
    {
      key: 'compliance-efficiency',
      icon: Scale,
      title: 'Firmwide compliance efficiency multiplier',
      className: 'border-sky-300/55 bg-sky-400/14 text-sky-50',
      body: <span className="font-mono text-foreground">{(complianceEfficiencyMultiplier * 100).toFixed(1)}%</span>,
    },
    {
      key: 'reputation',
      icon: Shield,
      title: 'Reputation earned this run',
      className: 'border-slate-300/55 bg-slate-400/14 text-slate-50',
      body: <span className="font-mono text-foreground">{reputation.toLocaleString()}</span>,
    },
    {
      key: 'prestiges',
      icon: Trophy,
      title: 'Total prestige resets completed',
      className: 'border-rose-300/55 bg-rose-400/14 text-rose-50',
      body: <span className="font-mono text-foreground">{prestigeCount.toLocaleString()}</span>,
    },
  ].filter(Boolean) as Array<{ key: string; icon: typeof Beaker; title: string; className: string; body: ReactNode }>

  useEffect(() => {
    if (activeMarketEvent?.id && previousEventIdRef.current !== activeMarketEvent.id) {
      setMarketNewsFlash(true)
      setTickerLineIndex(0)
      const timeout = window.setTimeout(() => setMarketNewsFlash(false), 1400)
      previousEventIdRef.current = activeMarketEvent.id
      return () => window.clearTimeout(timeout)
    }

    if (!activeMarketEvent) {
      previousEventIdRef.current = null
      setMarketNewsFlash(false)
      setTickerLineIndex(0)
    }

    return undefined
  }, [activeMarketEvent])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTickerLineIndex((current) => (current + 1) % activeTickerLines.length)
    }, 2600)

    return () => window.clearInterval(interval)
  }, [activeTickerLines.length])

  return (
    <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(260px,0.45fr)_minmax(260px,0.45fr)] xl:auto-rows-fr">
      <section className="h-full rounded-xl border border-border/80 bg-card/92 p-2.5">
        <div className="flex items-start justify-between gap-3">
          <p className="pt-0.5 text-[10px] uppercase tracking-[0.18em] text-primary">Economy</p>
          <div className="flex min-w-0 flex-wrap justify-end gap-2">
            {compactStatBadges.map((item) => {
              const Icon = item.icon

              return (
                <Badge key={item.key} variant="outline" title={item.title} className={`min-h-9 justify-start whitespace-nowrap rounded-md px-2.5 py-1.5 text-[10px] font-normal tracking-[0.08em] ${item.className}`}>
                  <Icon className="size-3 text-primary" />
                  <span className="ml-1.5">{item.body}</span>
                </Badge>
              )
            })}
            {technologySectorUnlocked ? <Badge variant="outline" className="min-h-9 justify-start whitespace-nowrap rounded-md border-primary/40 bg-primary/10 px-2.5 py-1.5 text-[10px] font-normal uppercase tracking-[0.08em] text-primary">{technologySectorJustUnlocked ? 'New: Tech Sector' : 'Sector Tech Online'}</Badge> : null}
            {energySectorUnlocked ? <Badge variant="outline" className="min-h-9 justify-start whitespace-nowrap rounded-md border-primary/40 bg-primary/10 px-2.5 py-1.5 text-[10px] font-normal uppercase tracking-[0.08em] text-primary">{energySectorJustUnlocked ? 'New: Energy Sector' : 'Sector Energy Online'}</Badge> : null}
          </div>
        </div>

        <div className="mt-5 flex min-h-[72px] flex-col justify-end xl:min-h-[70px] xl:mt-6">
          <p className="font-mono text-[36px] font-semibold leading-none text-foreground xl:text-[48px]">
            {formatCurrencyTicker(cash)}
          </p>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
            {formatRate(cashPerSecond)}
          </p>
        </div>
      </section>

      <button
        type="button"
        onClick={() => openModal('marketEvents')}
        className={`h-full w-full cursor-pointer rounded-xl border p-2.5 text-left ${marketNewsFlash ? `${activeAccent?.border ?? 'border-amber-300/70'} ${activeAccent?.panel ?? ''} shadow-[0_0_0_1px_rgba(251,191,36,0.18),0_0_30px_rgba(251,191,36,0.12)] animate-[market-news-flash_1.4s_ease-out]` : 'border-border/80 bg-card/92'} overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
      >
        <div className="flex h-full min-h-[112px] flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-2">
          <div className="flex items-center gap-2">
            <Radio className={`size-3.5 ${activeMarketEvent ? activeAccent?.icon ?? 'text-amber-300' : 'text-muted-foreground'}`} />
            <p className="text-[9px] uppercase tracking-[0.18em] text-primary">Market News</p>
          </div>
          {activeMarketEvent ? <Badge variant="outline" className={`h-5 rounded-md px-1.5 text-[9px] uppercase tracking-[0.12em] ${activeAccent?.badge ?? 'border-amber-400/40 bg-amber-500/10 text-amber-200'}`}>{activeMarketEventRemainingLabel}</Badge> : <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[9px] uppercase tracking-[0.12em] text-muted-foreground">Next {nextMarketEventCooldownLabel}</Badge>}
        </div>
        <div className="mt-2 min-h-0 flex-1 overflow-hidden">
          <div className={`flex items-center gap-2 overflow-hidden text-[9px] uppercase tracking-[0.16em] ${activeMarketEvent ? 'text-amber-200/80' : 'text-muted-foreground'}`}>
            <span className={`inline-flex size-1.5 shrink-0 rounded-full ${activeMarketEvent ? 'bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.7)]' : 'bg-emerald-300/70'}`} />
            <span className="shrink-0">{activeMarketEvent ? 'Live Feed' : 'Calm Tape'}</span>
            <p className="truncate font-mono text-[13px] font-semibold uppercase tracking-[0.04em] text-foreground">{activeMarketEvent ? activeMarketEvent.name : 'No Active Event'}</p>
          </div>
          <p className={`mt-1 line-clamp-2 border-l pl-2 text-[10px] leading-4 ${activeMarketEvent ? 'border-amber-300/35 text-muted-foreground' : 'border-border/70 text-muted-foreground'}`}>{activeMarketEvent ? activeMarketEvent.description : 'Markets are calm for now. Watch for the next temporary event window.'}</p>
        </div>
        <div className={`mt-1.5 rounded-lg border p-2 text-[10px] leading-4 ${activeMarketEvent ? activeAccent?.ticker ?? 'border-amber-400/30 bg-[linear-gradient(90deg,rgba(245,158,11,0.12),rgba(15,23,42,0.18))] text-amber-100' : 'border-border/80 bg-[linear-gradient(90deg,rgba(34,197,94,0.05),rgba(15,23,42,0.18))] text-muted-foreground'}`}>
          <div className="flex items-center gap-1.5">
            <TriangleAlert className={`size-3 ${activeMarketEvent ? activeAccent?.icon ?? 'text-amber-200' : 'text-muted-foreground'}`} />
            <span className="uppercase tracking-[0.14em] opacity-80">Ticker</span>
          </div>
          <p key={`${activeMarketEvent?.id ?? 'calm'}-${tickerLineIndex}`} className="mt-1 animate-[ticker-fade_0.35s_ease-out]">{activeTickerLines[tickerLineIndex]}</p>
        </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => openModal('milestones')}
        className="h-full w-full cursor-pointer rounded-xl border border-border/80 bg-[linear-gradient(180deg,rgba(20,28,22,0.96),rgba(13,18,15,0.98))] p-2 text-left shadow-[0_0_0_1px_rgba(34,197,94,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <div className="flex items-start justify-between gap-2 border-b border-emerald-500/15 pb-2">
          <div>
            <p className="text-[9px] uppercase tracking-[0.16em] text-primary">Milestones</p>
            <p className="mt-1 text-[10px] leading-4 text-muted-foreground">Collectible progression targets that keep the next major step visible.</p>
          </div>
          <Badge variant="outline" className="h-5 rounded-md border-emerald-500/40 bg-emerald-500/10 px-1.5 text-[9px] uppercase tracking-[0.12em] text-emerald-300">{unlockedMilestoneCount} / {totalMilestoneCount}</Badge>
        </div>
        <div className="mt-2 rounded-lg border border-emerald-500/15 bg-[linear-gradient(180deg,rgba(22,32,24,0.96),rgba(12,18,14,0.96))] p-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[8px] uppercase tracking-[0.16em] text-muted-foreground">Next milestone</p>
            {nextRecommendedMilestoneSummary ? <Badge variant="outline" className="h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[9px] uppercase tracking-[0.12em] text-primary">{nextRecommendedMilestoneSummary.categoryLabel}</Badge> : null}
            {nextRecommendedMilestoneSummary?.rewardSummary ? <Badge variant="outline" className="h-5 rounded-md border-emerald-500/40 bg-emerald-500/10 px-1.5 text-[9px] uppercase tracking-[0.12em] text-emerald-300">{nextRecommendedMilestoneSummary.rewardSummary}</Badge> : null}
          </div>
          <p className="mt-1 text-[11px] font-semibold leading-4 text-foreground">{nextRecommendedMilestoneSummary ? nextRecommendedMilestoneSummary.name : 'All milestones unlocked.'}</p>
          {nextRecommendedMilestoneSummary ? <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{nextRecommendedMilestoneSummary.description}</p> : null}
          {nextRecommendedMilestoneSummary?.progressLabel ? <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-emerald-300">{nextRecommendedMilestoneSummary.progressLabel}</p> : null}
        </div>
      </button>
    </div>
  )
}
