import { BrainCircuit, Cpu, TrendingUp } from 'lucide-react'
import { RESEARCH_UPGRADES } from '@/data/tabContent'
import { getUpgradeDefinition } from '@/data/upgrades'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import { formatCurrency, formatMultiplier } from '@/utils/formatting'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ActionRow, SummaryTile } from './DashboardPrimitives'

export function ResearchTab() {
  const gameState = useGameStore((state) => state)
  const buyUpgrade = useGameStore((state) => state.buyUpgrade)
  const globalMultiplier = useGameStore(selectors.globalMultiplier)

  const purchasedResearchCount = RESEARCH_UPGRADES.filter((upgrade) => gameState.purchasedUpgrades[upgrade.id]).length
  const researchUnlocks = RESEARCH_UPGRADES.filter((upgrade) => upgrade.id === 'juniorHiringProgram' || upgrade.id === 'seniorRecruitment' || upgrade.id === 'algorithmicTrading')
  const researchSystems = RESEARCH_UPGRADES.filter((upgrade) => upgrade.id !== 'juniorHiringProgram' && upgrade.id !== 'seniorRecruitment' && upgrade.id !== 'algorithmicTrading')

  const nextResearchTarget = !gameState.purchasedUpgrades.juniorHiringProgram
    ? 'Unlock Junior Hiring Program to open your first staffing tier.'
    : !gameState.purchasedUpgrades.seniorRecruitment
      ? 'Push into Senior Recruitment once juniors are carrying the desk.'
      : !gameState.purchasedUpgrades.algorithmicTrading
        ? 'Take Algorithmic Trading when senior income can support automation.'
        : 'Use system upgrades to multiply the full firm.'

  return (
    <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-[0.16em]">Research</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Unlocks and firm-wide systems</CardDescription>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-2">
        <div className="grid gap-2 md:grid-cols-3">
          <SummaryTile label="Research Bought" value={`${purchasedResearchCount}/${RESEARCH_UPGRADES.length}`} icon={BrainCircuit} />
          <SummaryTile label="Firm Multiplier" value={formatMultiplier(globalMultiplier)} icon={TrendingUp} />
          <SummaryTile label="Tier Unlocks" value={`${researchUnlocks.filter((upgrade) => gameState.purchasedUpgrades[upgrade.id]).length}/${researchUnlocks.length}`} icon={Cpu} />
        </div>
        <div className="rounded-xl border border-primary/25 bg-primary/10 p-2 text-[11px] text-foreground">
          <span className="text-[10px] uppercase tracking-[0.18em] text-primary">Next research</span>
          <p className="mt-1 leading-4">{nextResearchTarget}</p>
        </div>
        <ScrollArea className="h-full min-h-0 pr-2">
          <div className="space-y-3">
            <div className="space-y-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-primary">Tier unlocks</p>
                <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">These upgrades open the next major operating tier.</p>
              </div>
              {researchUnlocks.map((upgrade) => {
                const isPurchased = selectors.isUpgradePurchased(upgrade.id)(gameState)
                const visible = selectors.isUpgradeVisible(upgrade.id)(gameState)
                const shortfall = selectors.upgradeCashShortfall(upgrade.id)(gameState)
                const definition = getUpgradeDefinition(upgrade.id)
                const lockedReason = !visible && upgrade.id === 'seniorRecruitment'
                  ? `Requires 5 Junior Traders (${gameState.juniorTraderCount}/5).`
                  : !visible && upgrade.id === 'algorithmicTrading'
                    ? `Requires 5 Senior Traders (${gameState.seniorTraderCount}/5).`
                    : undefined
                const description = !visible && lockedReason
                  ? `${definition?.description} ${lockedReason}`
                  : upgrade.description

                return (
                  <ActionRow
                    key={upgrade.id}
                    title={upgrade.name}
                    description={description}
                    cost={`Cost ${formatCurrency(upgrade.cost)}`}
                    status={isPurchased ? 'Unlocked' : !visible ? 'Locked' : shortfall > 0 ? 'Need cash' : 'Ready'}
                    statusTone={isPurchased ? 'done' : !visible ? 'locked' : shortfall > 0 ? 'default' : 'ready'}
                    actionLabel={isPurchased ? 'Unlocked' : 'Research'}
                    disabled={!selectors.canAffordUpgrade(upgrade.id)(gameState)}
                    disabledReason={!isPurchased ? lockedReason ?? (shortfall > 0 ? `Need ${formatCurrency(shortfall)} more cash.` : undefined) : undefined}
                    onClick={() => buyUpgrade(upgrade.id)}
                  />
                )
              })}
            </div>
            <Separator className="bg-border/60" />
            <div className="space-y-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-primary">System upgrades</p>
                <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Firm-wide boosts that improve the whole economy.</p>
              </div>
              {researchSystems.map((upgrade) => {
                const isPurchased = selectors.isUpgradePurchased(upgrade.id)(gameState)
                const visible = selectors.isUpgradeVisible(upgrade.id)(gameState)
                const shortfall = selectors.upgradeCashShortfall(upgrade.id)(gameState)
                const lockedReason = !visible && upgrade.id === 'bullMarket'
                  ? 'Requires Trade Multiplier first.'
                  : undefined
                const description = lockedReason ? `${upgrade.description} ${lockedReason}` : upgrade.description

                return (
                  <ActionRow
                    key={upgrade.id}
                    title={upgrade.name}
                    description={description}
                    cost={`Cost ${formatCurrency(upgrade.cost)}`}
                    status={isPurchased ? 'Purchased' : !visible ? 'Locked' : shortfall > 0 ? 'Need cash' : 'Ready'}
                    statusTone={isPurchased ? 'done' : !visible ? 'locked' : shortfall > 0 ? 'default' : 'ready'}
                    actionLabel={isPurchased ? 'Purchased' : 'Research'}
                    disabled={!selectors.canAffordUpgrade(upgrade.id)(gameState)}
                    disabledReason={!isPurchased ? lockedReason ?? (shortfall > 0 ? `Need ${formatCurrency(shortfall)} more cash.` : undefined) : undefined}
                    onClick={() => buyUpgrade(upgrade.id)}
                  />
                )
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
