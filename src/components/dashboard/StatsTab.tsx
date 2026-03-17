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
  const quantTraderCount = useGameStore((state) => state.quantTraderCount)
  const ruleBasedBotCount = useGameStore((state) => state.ruleBasedBotCount)
  const mlTradingBotCount = useGameStore((state) => state.mlTradingBotCount)
  const aiTradingBotCount = useGameStore((state) => state.aiTradingBotCount)
  const internResearchScientistCount = useGameStore((state) => state.internResearchScientistCount)
  const juniorResearchScientistCount = useGameStore((state) => state.juniorResearchScientistCount)
  const seniorResearchScientistCount = useGameStore((state) => state.seniorResearchScientistCount)
  const internIncome = useGameStore(selectors.internIncome)
  const juniorIncome = useGameStore(selectors.juniorIncome)
  const seniorIncome = useGameStore(selectors.seniorIncome)
  const quantTraderIncome = useGameStore(selectors.quantTraderIncome)
  const ruleBasedBotIncome = useGameStore(selectors.ruleBasedBotIncome)
  const mlTradingBotIncome = useGameStore(selectors.mlTradingBotIncome)
  const aiTradingBotIncome = useGameStore(selectors.aiTradingBotIncome)
  const globalMultiplier = useGameStore(selectors.globalMultiplier)
  const prestigeMultiplier = useGameStore(selectors.prestigeMultiplier)
  const researchPointsPerSecond = useGameStore(selectors.researchPointsPerSecond)
  const influencePerSecond = useGameStore(selectors.influencePerSecond)
  const influence = useGameStore(selectors.influence)
  const purchasedPolicyCount = useGameStore(selectors.purchasedPolicyCount)
  const generalDeskCashPerSecond = useGameStore(selectors.generalDeskCashPerSecond)
  const financeSectorCashPerSecond = useGameStore(selectors.sectorCashPerSecond('finance'))
  const technologySectorCashPerSecond = useGameStore(selectors.sectorCashPerSecond('technology'))
  const energySectorCashPerSecond = useGameStore(selectors.sectorCashPerSecond('energy'))
  const internAssigned = useGameStore(selectors.assignedCount('intern'))
  const juniorAssigned = useGameStore(selectors.assignedCount('juniorTrader'))
  const seniorAssigned = useGameStore(selectors.assignedCount('seniorTrader'))
  const unlockedSectors = useGameStore(selectors.unlockedSectors)
  const technologySectorUnlocked = useGameStore(selectors.technologySectorUnlocked)
  const energySectorUnlocked = useGameStore(selectors.energySectorUnlocked)
  const totalDeskSlots = useGameStore(selectors.totalDeskSlots)
  const usedDeskSlots = useGameStore(selectors.usedDeskSlots)
  const availableDeskSlots = useGameStore(selectors.availableDeskSlots)
  const deskSpaceCount = useGameStore((state) => state.deskSpaceCount)
  const floorSpaceCount = useGameStore((state) => state.floorSpaceCount)
  const officeCount = useGameStore((state) => state.officeCount)

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
          <SummaryTile label="Automation" value={`${quantTraderCount} / ${ruleBasedBotCount} / ${mlTradingBotCount} / ${aiTradingBotCount}`} icon={Cpu} />
        </div>
        <div className="rounded-xl border border-border/80 bg-background/65 p-2.5 text-[11px]">
          <div className="flex items-center justify-between"><span className="text-muted-foreground">Intern desk</span><span className="font-mono text-primary">{formatRate(internIncome)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Junior desk</span><span className="font-mono text-primary">{formatRate(juniorIncome)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Senior desk</span><span className="font-mono text-primary">{formatRate(seniorIncome)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Traders</span><span className="font-mono text-primary">{internCount} / {juniorTraderCount} / {seniorTraderCount}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Assigned traders</span><span className="font-mono text-primary">{internAssigned} / {juniorAssigned} / {seniorAssigned}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Desk Slots</span><span className="font-mono text-primary">{usedDeskSlots} / {totalDeskSlots}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Desk Slots free</span><span className="font-mono text-primary">{availableDeskSlots}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Desk Space</span><span className="font-mono text-primary">{deskSpaceCount}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Floor Space</span><span className="font-mono text-primary">{floorSpaceCount}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Offices</span><span className="font-mono text-primary">{officeCount}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">General Desk output</span><span className="font-mono text-primary">{formatRate(generalDeskCashPerSecond)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Finance sector</span><span className="font-mono text-primary">{unlockedSectors.finance ? formatRate(financeSectorCashPerSecond) : 'Locked'}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Technology sector</span><span className="font-mono text-primary">{technologySectorUnlocked && unlockedSectors.technology ? formatRate(technologySectorCashPerSecond) : 'Locked'}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Energy sector</span><span className="font-mono text-primary">{energySectorUnlocked && unlockedSectors.energy ? formatRate(energySectorCashPerSecond) : 'Locked'}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Quant traders</span><span className="font-mono text-primary">{formatRate(quantTraderIncome)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Rule-based bots</span><span className="font-mono text-primary">{formatRate(ruleBasedBotIncome)} avg</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">ML bots</span><span className="font-mono text-primary">{formatRate(mlTradingBotIncome)} avg</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">AI bots</span><span className="font-mono text-primary">{formatRate(aiTradingBotIncome)} avg</span></div>
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
          <div className="flex items-center justify-between"><span className="text-muted-foreground">Global profit multiplier</span><span className="font-mono text-primary">{formatMultiplier(globalMultiplier)}</span></div>
          <div className="mt-1.5 flex items-center justify-between"><span className="text-muted-foreground">Prestige multiplier</span><span className="font-mono text-primary">{formatMultiplier(prestigeMultiplier)}</span></div>
        </div>
      </CardContent>
    </Card>
  )
}
