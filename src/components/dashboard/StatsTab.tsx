import { Cpu, Landmark, TrendingUp, Users } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import { formatCurrency, formatMultiplier, formatPlainRate, formatRate } from '@/utils/formatting'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SummaryTile } from './DashboardPrimitives'

export function StatsTab() {
  const appInfo = useGameStore((state) => state.appInfo)
  const lifetimeCashEarned = useGameStore((state) => state.lifetimeCashEarned)
  const internCount = useGameStore((state) => state.internCount)
  const juniorTraderCount = useGameStore((state) => state.juniorTraderCount)
  const seniorTraderCount = useGameStore((state) => state.seniorTraderCount)
  const ruleBasedBotCount = useGameStore((state) => state.ruleBasedBotCount)
  const mlTradingBotCount = useGameStore((state) => state.mlTradingBotCount)
  const aiTradingBotCount = useGameStore((state) => state.aiTradingBotCount)
  const internResearchScientistCount = useGameStore((state) => state.internResearchScientistCount)
  const juniorResearchScientistCount = useGameStore((state) => state.juniorResearchScientistCount)
  const seniorResearchScientistCount = useGameStore((state) => state.seniorResearchScientistCount)
  const internIncome = useGameStore(selectors.internIncome)
  const juniorIncome = useGameStore(selectors.juniorIncome)
  const seniorIncome = useGameStore(selectors.seniorIncome)
  const ruleBasedBotIncome = useGameStore(selectors.ruleBasedBotIncome)
  const mlTradingBotIncome = useGameStore(selectors.mlTradingBotIncome)
  const aiTradingBotIncome = useGameStore(selectors.aiTradingBotIncome)
  const globalMultiplier = useGameStore(selectors.globalMultiplier)
  const prestigeMultiplier = useGameStore(selectors.prestigeMultiplier)
  const researchPointsPerSecond = useGameStore(selectors.researchPointsPerSecond)
  const influencePerSecond = useGameStore(selectors.influencePerSecond)
  const influence = useGameStore(selectors.influence)
  const purchasedPolicyCount = useGameStore(selectors.purchasedPolicyCount)

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
          <SummaryTile label="Interns" value={internCount.toString()} icon={Users} />
          <SummaryTile label="Algo Bots" value={`${ruleBasedBotCount} / ${mlTradingBotCount} / ${aiTradingBotCount}`} icon={Cpu} />
        </div>
        <div className="rounded-xl border border-border/80 bg-background/65 p-2.5 text-[11px]">
          <div className="flex items-center justify-between"><span className="text-muted-foreground">Intern desk</span><span className="font-mono text-primary">{formatRate(internIncome)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Junior desk</span><span className="font-mono text-primary">{formatRate(juniorIncome)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Senior desk</span><span className="font-mono text-primary">{formatRate(seniorIncome)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Traders</span><span className="font-mono text-primary">{internCount} / {juniorTraderCount} / {seniorTraderCount}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Rule-based bots</span><span className="font-mono text-primary">{formatRate(ruleBasedBotIncome)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">ML trading bots</span><span className="font-mono text-primary">{formatRate(mlTradingBotIncome)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">AI trading bots</span><span className="font-mono text-primary">{formatRate(aiTradingBotIncome)}</span></div>
          <Separator className="my-3 bg-border/60" />
          <div className="flex items-center justify-between"><span className="text-muted-foreground">Intern scientists</span><span className="font-mono text-primary">{internResearchScientistCount}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Junior scientists</span><span className="font-mono text-primary">{juniorResearchScientistCount}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Senior scientists</span><span className="font-mono text-primary">{seniorResearchScientistCount}</span></div>
          <Separator className="my-3 bg-border/60" />
          <div className="flex items-center justify-between"><span className="text-muted-foreground">Research production</span><span className="font-mono text-primary">{formatPlainRate(researchPointsPerSecond)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Influence</span><span className="font-mono text-primary">{influence.toFixed(influence < 100 ? 2 : 1)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Influence production</span><span className="font-mono text-primary">{formatPlainRate(influencePerSecond)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Policies passed</span><span className="font-mono text-primary">{purchasedPolicyCount}</span></div>
          <Separator className="my-3 bg-border/60" />
          <div className="flex items-center justify-between"><span className="text-muted-foreground">Research multiplier</span><span className="font-mono text-primary">{formatMultiplier(globalMultiplier)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Prestige multiplier</span><span className="font-mono text-primary">{formatMultiplier(prestigeMultiplier)}</span></div>
        </div>
      </CardContent>
    </Card>
  )
}
