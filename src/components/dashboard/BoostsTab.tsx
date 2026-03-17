import { Gauge, ShieldCheck, Sparkles, TimerReset } from 'lucide-react'
import { GLOBAL_BOOSTS, TIMED_BOOSTS } from '@/data/boosts'
import { RESEARCH_TECH_MAP } from '@/data/researchTech'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { SummaryTile } from './DashboardPrimitives'

export function BoostsTab() {
  const gameState = useGameStore((state) => state)
  const activateTimedBoost = useGameStore((state) => state.activateTimedBoost)
  const toggleTimedBoostAutoMode = useGameStore((state) => state.toggleTimedBoostAutoMode)
  const activeTimedBoostCount = useGameStore(selectors.activeTimedBoostCount)
  const timedBoostAutoUnlocked = useGameStore(selectors.timedBoostAutoUnlocked)
  const ownedGlobalBoostCount = useGameStore(selectors.ownedGlobalBoostCount)

  return (
    <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-[0.16em]">Boosts</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Timed tactical windows and persistent global modifiers</CardDescription>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-2">
        <div className="grid gap-2 md:grid-cols-3">
          <SummaryTile label="Active Timed Boosts" value={String(activeTimedBoostCount)} icon={Sparkles} />
          <SummaryTile label="Boost Automation" value={timedBoostAutoUnlocked ? 'Unlocked' : 'Locked'} icon={TimerReset} />
          <SummaryTile label="Owned Global Boosts" value={String(ownedGlobalBoostCount)} icon={ShieldCheck} />
        </div>

        <ScrollArea className="h-full min-h-0 pr-2">
          <div className="space-y-4">
            <div className="space-y-2 rounded-xl border border-border/80 bg-background/65 p-3">
              <div className="flex items-center gap-2">
                <TimerReset className="size-4 text-primary" />
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary">Timed Boosts</p>
              </div>
              <div className="space-y-2">
                {Object.values(TIMED_BOOSTS).map((boost) => {
                  const runtime = selectors.timedBoostState(boost.id)(gameState)
                  const unlocked = selectors.timedBoostUnlocked(boost.id)(gameState)
                  const canActivate = selectors.timedBoostCanActivate(boost.id)(gameState)
                  const statusLabel = selectors.timedBoostStatusLabel(boost.id)(gameState)
                  const durationLabel = selectors.timedBoostDurationLabel(boost.id)(gameState)
                  const cooldownLabel = selectors.timedBoostCooldownLabel(boost.id)(gameState)
                  const requiredResearch = RESEARCH_TECH_MAP[boost.unlockResearchTechId]

                  return (
                    <div key={boost.id} className="rounded-lg border border-border/70 bg-background/55 p-2.5 text-[11px]">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.14em] text-primary">{boost.name}</p>
                          <p className="mt-1 text-muted-foreground">{boost.description}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-primary/85">{unlocked ? 'Research unlocked' : `Requires ${requiredResearch.name}`}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{unlocked ? statusLabel : 'Locked'}</p>
                          <p className="mt-1 font-mono text-foreground">{unlocked ? (runtime.isActive ? durationLabel : cooldownLabel) : '--:--'}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap justify-end gap-2">
                        {timedBoostAutoUnlocked && unlocked ? (
                          <Button size="xs" variant={runtime.autoEnabled ? 'default' : 'outline'} className="rounded-md uppercase tracking-[0.12em]" onClick={() => toggleTimedBoostAutoMode(boost.id, !runtime.autoEnabled)}>
                            Auto: {runtime.autoEnabled ? 'On' : 'Off'}
                          </Button>
                        ) : null}
                        <Button size="xs" className="rounded-md uppercase tracking-[0.12em]" disabled={!unlocked || !canActivate} onClick={() => activateTimedBoost(boost.id)}>
                          Activate
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2 rounded-xl border border-border/80 bg-background/65 p-3">
              <div className="flex items-center gap-2">
                <Gauge className="size-4 text-primary" />
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary">Global Boosts</p>
              </div>
              <div className="space-y-2">
                {Object.values(GLOBAL_BOOSTS).map((boost) => {
                  const owned = selectors.globalBoostOwned(boost.id)(gameState)

                  return (
                    <div key={boost.id} className="rounded-lg border border-border/70 bg-background/55 p-2.5 text-[11px]">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.14em] text-primary">{boost.name}</p>
                          <p className="mt-1 text-muted-foreground">{boost.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{owned ? 'Owned' : 'Not owned'}</p>
                          <p className="mt-1 font-mono text-foreground">{owned ? 'Always On' : 'Unavailable'}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
