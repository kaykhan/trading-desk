import { Cpu, Landmark, TrendingUp, Users } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import { formatCurrency, formatMultiplier, formatRate } from '@/utils/formatting'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SummaryTile } from './DashboardPrimitives'

export function StatsTab() {
  const appInfo = useGameStore((state) => state.appInfo)
  const lifetimeCashEarned = useGameStore((state) => state.lifetimeCashEarned)
  const juniorTraderCount = useGameStore((state) => state.juniorTraderCount)
  const seniorTraderCount = useGameStore((state) => state.seniorTraderCount)
  const tradingBotCount = useGameStore((state) => state.tradingBotCount)
  const juniorIncome = useGameStore(selectors.juniorIncome)
  const seniorIncome = useGameStore(selectors.seniorIncome)
  const botIncome = useGameStore(selectors.botIncome)
  const globalMultiplier = useGameStore(selectors.globalMultiplier)
  const prestigeMultiplier = useGameStore(selectors.prestigeMultiplier)

  return (
    <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-[0.16em]">Stats</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Firm snapshot and breakdowns</CardDescription>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-3">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          <SummaryTile label="Lifetime Cash" value={formatCurrency(lifetimeCashEarned, lifetimeCashEarned < 100 ? 1 : 0)} icon={TrendingUp} />
          <SummaryTile label="Build" value={appInfo ? appInfo.version : 'Preview'} icon={Landmark} />
          <SummaryTile label="Juniors" value={juniorTraderCount.toString()} icon={Users} />
          <SummaryTile label="Seniors / Bots" value={`${seniorTraderCount} / ${tradingBotCount}`} icon={Cpu} />
        </div>
        <div className="rounded-xl border border-border/80 bg-background/65 p-2.5 text-[11px]">
          <div className="flex items-center justify-between"><span className="text-muted-foreground">Junior desk</span><span className="font-mono text-primary">{formatRate(juniorIncome)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Senior desk</span><span className="font-mono text-primary">{formatRate(seniorIncome)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Trading bots</span><span className="font-mono text-primary">{formatRate(botIncome)}</span></div>
          <Separator className="my-3 bg-border/60" />
          <div className="flex items-center justify-between"><span className="text-muted-foreground">Research multiplier</span><span className="font-mono text-primary">{formatMultiplier(globalMultiplier)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Prestige multiplier</span><span className="font-mono text-primary">{formatMultiplier(prestigeMultiplier)}</span></div>
        </div>
      </CardContent>
    </Card>
  )
}
