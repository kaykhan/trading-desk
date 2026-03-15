import { BrainCircuit, Cpu, TrendingUp } from 'lucide-react'
import { OPERATIONS_UPGRADES, TRADING_UPGRADES } from '@/data/tabContent'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import { formatCurrency } from '@/utils/formatting'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ActionRow, SummaryTile } from './DashboardPrimitives'

export function UpgradesTab() {
  const gameState = useGameStore((state) => state)
  const buyUpgrade = useGameStore((state) => state.buyUpgrade)

  const purchasedTrading = TRADING_UPGRADES.filter((upgrade) => gameState.purchasedUpgrades[upgrade.id]).length
  const purchasedOperations = OPERATIONS_UPGRADES.filter((upgrade) => gameState.purchasedUpgrades[upgrade.id]).length

  return (
    <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-[0.16em]">Upgrades</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Manual and desk scaling upgrades</CardDescription>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-2">
        <div className="grid gap-2 md:grid-cols-3">
          <SummaryTile label="Trading Bought" value={`${purchasedTrading}/${TRADING_UPGRADES.length}`} icon={TrendingUp} />
          <SummaryTile label="Desk Bought" value={`${purchasedOperations}/${OPERATIONS_UPGRADES.length}`} icon={Cpu} />
          <SummaryTile label="Total Bought" value={`${purchasedTrading + purchasedOperations}/${TRADING_UPGRADES.length + OPERATIONS_UPGRADES.length}`} icon={BrainCircuit} />
        </div>

        <ScrollArea className="h-full min-h-0 pr-2">
          <div className="space-y-3">
            <div className="space-y-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-primary">Trading upgrades</p>
                <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Boost manual trading and early run cash generation.</p>
              </div>
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

            <Separator className="bg-border/60" />

            <div className="space-y-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-primary">Desk upgrades</p>
                <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Increase output from juniors, seniors, and bots after each desk unlock.</p>
              </div>
              {OPERATIONS_UPGRADES.map((upgrade) => {
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
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
