import { BarChart3, TrendingUp } from 'lucide-react'
import { PRESTIGE_TAB_UPGRADES } from '@/data/tabContent'
import { getPrestigeUpgradeDefinition } from '@/data/prestigeUpgrades'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import { formatCurrency, formatMultiplier, formatPlainRate } from '@/utils/formatting'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ActionRow, SummaryTile } from './DashboardPrimitives'

export function PrestigeTab() {
  const gameState = useGameStore((state) => state)
  const openModal = useGameStore((state) => state.openModal)
  const buyPrestigeUpgrade = useGameStore((state) => state.buyPrestigeUpgrade)
  const prestigePreview = useGameStore(selectors.prestigeGainPreview)
  const prestigeMultiplier = useGameStore(selectors.prestigeMultiplier)
  const canPrestigeNow = useGameStore(selectors.canPrestige)
  const seedCapitalBonus = useGameStore(selectors.seedCapitalBonus)
  const researchPointsPerSecond = useGameStore(selectors.researchPointsPerSecond)

  return (
    <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-[0.16em]">Prestige</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Long-run scaling across profits, research, staffing, and machine systems</CardDescription>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-2">
        <div className="grid gap-2 md:grid-cols-3">
          <SummaryTile label="Reputation" value={gameState.reputation.toString()} icon={BarChart3} />
          <SummaryTile label="Permanent Multiplier" value={formatMultiplier(prestigeMultiplier)} icon={TrendingUp} />
          <SummaryTile label="Next Seed Cash" value={formatCurrency(seedCapitalBonus)} icon={TrendingUp} />
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-2.5">
          <p className="text-[11px] leading-4 text-muted-foreground">
            {canPrestigeNow
              ? `Resetting now yields ${prestigePreview} Reputation. Permanent upgrades now support profits, research output, staffing efficiency, power capacity, machine output, and stronger starts.`
              : `Prestige is still locked. Reach the bot phase and build enough lifetime cash to earn your first Reputation.`}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-primary">Current research pace: {formatPlainRate(researchPointsPerSecond)}</p>
          <Button className="mt-2 rounded-lg uppercase tracking-[0.1em]" size="sm" disabled={!canPrestigeNow} onClick={() => openModal('prestigeConfirm')}>
            {canPrestigeNow ? 'Open prestige confirmation' : 'Prestige locked'}
          </Button>
        </div>
        <ScrollArea className="h-full min-h-0 pr-2">
          <div className="space-y-2">
            {PRESTIGE_TAB_UPGRADES.map((upgrade) => {
              const definition = getPrestigeUpgradeDefinition(upgrade.id)
              const currentRank = selectors.prestigeUpgradeRank(upgrade.id)(gameState)
              const nextCost = definition?.baseCost ?? upgrade.baseCost
              const shortfall = Math.max(0, nextCost - gameState.reputation)

              return (
                <ActionRow
                  key={upgrade.id}
                  title={upgrade.name}
                  description={upgrade.description}
                  cost={`Cost ${nextCost} reputation`}
                  status={currentRank >= upgrade.maxRank ? `Rank ${currentRank}/${upgrade.maxRank}` : shortfall > 0 ? 'Need rep' : 'Ready'}
                  statusTone={currentRank >= upgrade.maxRank ? 'done' : shortfall > 0 ? 'default' : 'ready'}
                  actionLabel={currentRank >= upgrade.maxRank ? 'Maxed' : 'Buy rank'}
                  disabled={!selectors.canAffordPrestigeUpgrade(upgrade.id)(gameState)}
                  disabledReason={currentRank < upgrade.maxRank && shortfall > 0 ? `Need ${shortfall} more Reputation.` : undefined}
                  onClick={() => buyPrestigeUpgrade(upgrade.id)}
                />
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
