import { Activity, Newspaper, Radio, TimerReset, TriangleAlert } from 'lucide-react'
import { getMarketEventAccentClasses } from '@/data/marketEvents'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import { MARKET_EVENTS } from '@/data/marketEvents'
import { formatMarketEventTimer, getMarketEventEffectSummaryFromDefinition } from '@/utils/marketEvents'
import { Badge } from '@/components/ui/badge'

export function EventsTab() {
  const activeEvent = useGameStore(selectors.activeMarketEvent)
  const activeEventId = useGameStore(selectors.activeMarketEventId)
  const remainingLabel = useGameStore(selectors.marketEventRemainingLabel)
  const nextEventCooldownLabel = useGameStore(selectors.nextMarketEventCooldownLabel)
  const effectSummary = useGameStore(selectors.marketEventEffectSummary)
  const history = useGameStore(selectors.marketEventHistory)
  const activeAccent = activeEvent ? getMarketEventAccentClasses(activeEvent.category) : null

  return (
    <div className="terminal-panel space-y-2 rounded-xl border-border/80 bg-card/92 p-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <Newspaper className="size-4 text-primary" />
        <h3 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">Events</h3>
        <Badge variant="outline" className={activeEvent ? 'h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary' : 'h-5 rounded-md border-border/70 bg-background/50 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground'}>{activeEvent ? 'Live Event' : 'No Active Event'}</Badge>
      </div>

      {activeEvent ? (
        <div className={`rounded-xl border p-3 ${activeAccent?.border ?? 'border-border/80'} ${activeAccent?.panel ?? 'bg-background/60'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-2">
            <div className="flex items-center gap-2">
              <Radio className={`size-3.5 ${activeAccent?.icon ?? 'text-primary'}`} />
              <Badge variant="outline" className={`h-5 rounded-md px-1.5 text-[10px] uppercase tracking-[0.12em] ${activeAccent?.badge ?? 'border-primary/40 bg-primary/10 text-primary'}`}>{activeEvent.category}</Badge>
            </div>
            <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{remainingLabel} remaining</Badge>
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
              <span className={`inline-flex size-1.5 rounded-full ${activeEvent.category === 'sector' ? 'bg-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.6)]' : 'bg-amber-300 shadow-[0_0_10px_rgba(252,211,77,0.6)]'}`} />
              <span>Live Feed</span>
            </div>
            <h4 className="font-mono text-[15px] font-semibold uppercase tracking-[0.04em] text-foreground">{activeEvent.name}</h4>
            <p className="border-l border-border/70 pl-2 text-[12px] leading-5 text-muted-foreground">{activeEvent.description}</p>
          </div>
          <div className={`mt-3 rounded-lg border p-2 text-[12px] ${activeAccent?.ticker ?? 'border-border/80 bg-background/60 text-foreground'}`}>
            <div className="flex items-center gap-2">
              <TriangleAlert className={`size-3.5 ${activeAccent?.icon ?? 'text-primary'}`} />
              <span className="text-[10px] uppercase tracking-[0.14em] opacity-80">Ticker</span>
            </div>
            <p className="mt-1">{effectSummary}</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border/70 bg-[linear-gradient(135deg,rgba(20,26,34,0.96),rgba(15,23,42,0.85))] p-3 text-[12px] text-muted-foreground">
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            <span className="inline-flex size-1.5 rounded-full bg-emerald-300/70" />
            <span>Calm Tape</span>
          </div>
          <p className="mt-2 rounded-lg border border-border/70 bg-background/45 p-2 leading-5">Waiting for the next market condition to roll in. Next window in {nextEventCooldownLabel}.</p>
        </div>
      )}

      <div className="rounded-xl border border-border/70 bg-background/35 p-2.5">
        <div className="flex items-center gap-2">
          <TimerReset className="size-4 text-primary" />
          <h4 className="text-[12px] font-semibold leading-none text-foreground">Event Log</h4>
        </div>
        <div className="mt-2 space-y-2">
          {history.length > 0 ? history.map((entry, index) => {
            const definition = MARKET_EVENTS[entry.eventId]

            if (!definition) {
              return null
            }

            return (
              <div key={`${entry.eventId}-${entry.endedAt}-${index}`} className={`rounded-lg border p-2 ${getMarketEventAccentClasses(definition.category).border} bg-background/45`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[12px] font-medium text-foreground">{definition.name}</span>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatMarketEventTimer(entry.durationSeconds)}</span>
                </div>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{definition.description}</p>
                <p className={`mt-1 text-[11px] leading-4 ${definition.category === 'sector' ? 'text-sky-200' : 'text-amber-200'}`}>{getMarketEventEffectSummaryFromDefinition(definition)}</p>
              </div>
            )
          }) : <div className="rounded-lg border border-border/70 bg-background/45 p-2 text-[11px] text-muted-foreground">Completed events will appear here once the market starts rotating.</div>}
        </div>
      </div>
    </div>
  )
}
