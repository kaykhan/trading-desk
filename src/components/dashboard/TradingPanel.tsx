import { ArrowRight, Cpu, TrendingUp } from 'lucide-react'
import { useEffect } from 'react'
import { TRADING_UPGRADES } from '@/data/tabContent'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import { formatCurrency, formatRate } from '@/utils/formatting'
import { getProgressionSummary } from '@/utils/progression'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ActionRow, SummaryTile } from './DashboardPrimitives'

export function TradingPanel() {
  const makeTrade = useGameStore((state) => state.makeTrade)
  const buyUpgrade = useGameStore((state) => state.buyUpgrade)
  const latestTradeFeedback = useGameStore((state) => state.latestTradeFeedback)
  const clearTradeFeedback = useGameStore((state) => state.clearTradeFeedback)
  const cashPerClick = useGameStore(selectors.cashPerClick)
  const cashPerSecond = useGameStore(selectors.cashPerSecond)
  const gameState = useGameStore((state) => state)
  const progressionSummary = getProgressionSummary(gameState)

  useEffect(() => {
    if (!latestTradeFeedback) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      clearTradeFeedback()
    }, 1200)

    return () => window.clearTimeout(timeoutId)
  }, [clearTradeFeedback, latestTradeFeedback])

  return (
    <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-lg uppercase tracking-[0.16em]">Trading</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Always-visible execution layer</CardDescription>
        <CardAction>
          <Badge variant="outline" className="rounded-md border-primary/40 bg-primary/10 text-[10px] uppercase tracking-[0.18em] text-primary">
            {progressionSummary.phaseLabel}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-2">
        <div className="relative flex min-h-[132px] flex-col justify-center rounded-xl border border-primary/30 bg-[radial-gradient(circle_at_top,rgba(255,221,51,0.14),transparent_45%),linear-gradient(180deg,rgba(34,34,34,0.98),rgba(22,22,22,0.98))] p-3 xl:min-h-[148px]">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Execution</p>
              <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Click to generate instant cash, then convert it into research and scaling.</p>
            </div>
            <Badge variant="outline" className="rounded-md border-primary/35 bg-background/60 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-primary">
              {progressionSummary.phaseLabel}
            </Badge>
          </div>

          <div className="mt-3 flex flex-col items-center">
            <Button
              size="sm"
              className="h-11 w-full max-w-sm rounded-lg border border-primary/50 bg-primary text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-[0_8px_18px_rgba(255,221,51,0.14)] transition hover:bg-primary/95 xl:h-12"
              onClick={makeTrade}
            >
              Make Trade
            </Button>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              <Badge variant="outline" className="rounded-md border-primary/40 bg-background/70 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-primary">
                Click {formatCurrency(cashPerClick, cashPerClick < 100 ? 1 : 0)}
              </Badge>
              <Badge variant="outline" className="rounded-md border-border/80 bg-background/70 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Flow {formatRate(cashPerSecond)}
              </Badge>
              {latestTradeFeedback ? (
                <Badge className="rounded-md bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
                  +{formatCurrency(latestTradeFeedback.amount, latestTradeFeedback.amount < 100 ? 1 : 0)}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-[1fr_1fr_1.2fr]">
          <SummaryTile label="Click Yield" value={formatCurrency(cashPerClick, cashPerClick < 100 ? 1 : 0)} icon={TrendingUp} />
          <SummaryTile label="Passive Rate" value={formatRate(cashPerSecond)} icon={Cpu} />
          <div className="rounded-xl border border-primary/30 bg-primary/10 p-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-primary">
              <ArrowRight className="size-3.5" />
              <span>Next target</span>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-foreground">{progressionSummary.nextTarget}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-background/60 p-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Manual upgrades</p>
              <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{progressionSummary.headline} Improve click value before you move more cash into the next tier.</p>
            </div>
            <Badge variant="outline" className="rounded-md border-border/80 bg-card/70 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Focus: {progressionSummary.focusArea}
            </Badge>
          </div>
        </div>

        <ScrollArea className="h-[140px] pr-1 xl:h-[156px]">
          <div className="grid gap-2 xl:grid-cols-3">
            {TRADING_UPGRADES.map((upgrade) => {
              const isPurchased = selectors.isUpgradePurchased(upgrade.id)(gameState)
              const visible = selectors.isUpgradeVisible(upgrade.id)(gameState)
              const shortfall = selectors.upgradeCashShortfall(upgrade.id)(gameState)

              if (!visible) {
                return null
              }

              return (
                <ActionRow
                  key={upgrade.id}
                  title={upgrade.name}
                  description={upgrade.description}
                  cost={`Cost ${formatCurrency(upgrade.cost)}`}
                  status={isPurchased ? 'Purchased' : shortfall > 0 ? 'Need cash' : 'Ready'}
                  statusTone={isPurchased ? 'done' : shortfall > 0 ? 'default' : 'ready'}
                  actionLabel={isPurchased ? 'Purchased' : 'Upgrade'}
                  disabled={!selectors.canAffordUpgrade(upgrade.id)(gameState)}
                  disabledReason={!isPurchased && shortfall > 0 ? `Need ${formatCurrency(shortfall)} more cash.` : undefined}
                  onClick={() => buyUpgrade(upgrade.id)}
                />
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
