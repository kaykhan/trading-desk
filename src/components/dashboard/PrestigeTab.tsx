import { BarChart3, ShieldCheck, TrendingUp } from 'lucide-react'
import { PRESTIGE_TIERS, PRESTIGE_TIER_LABELS } from '@/data/prestigeUpgrades'
import { PRESTIGE_TAB_UPGRADES } from '@/data/tabContent'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import { formatCurrency } from '@/utils/formatting'
import { canPrestige, getNextPrestigeTierLabel, getPrestigeGoalNextRankCost, getPrestigeTierLabel, getReputationGainForNextPrestige, getSeedCapitalBonus } from '@/utils/prestige'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PurchaseCard, SummaryTile } from './DashboardPrimitives'

function getTierSealClasses(index: number, prestigeCount: number): string {
  if (index < prestigeCount) {
    return 'border-primary bg-primary text-primary-foreground shadow-[0_0_0_1px_rgba(245,158,11,0.12),0_0_18px_rgba(245,158,11,0.16)]'
  }

  return 'border-border/70 bg-background/40 text-muted-foreground opacity-70'
}

export function PrestigeTab() {
  const gameState = useGameStore((state) => state)
  const openModal = useGameStore((state) => state.openModal)
  const adjustPrestigePurchasePlan = useGameStore((state) => state.adjustPrestigePurchasePlan)
  const clearPrestigePurchasePlan = useGameStore((state) => state.clearPrestigePurchasePlan)
  const prestigePreview = getReputationGainForNextPrestige(gameState)
  const canPrestigeNow = canPrestige(gameState)
  const seedCapitalBonus = getSeedCapitalBonus(gameState)
  const plannedPrestigeCost = useGameStore(selectors.plannedPrestigeCost)
  const plannedPrestigeAvailable = useGameStore(selectors.plannedPrestigeAvailable)
  const plannedPrestigeRemaining = useGameStore(selectors.plannedPrestigeRemaining)
  const currentTier = getPrestigeTierLabel(gameState.prestigeCount)
  const nextTier = getNextPrestigeTierLabel(gameState.prestigeCount)
  const prestigeTrack = PRESTIGE_TIERS.map((tierId, index) => ({ id: tierId, label: PRESTIGE_TIER_LABELS[tierId], completed: index < gameState.prestigeCount }))

  return (
    <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-[0.16em]">Prestige</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Finite 10-tier legacy track with named ranks and system-wide meta progression</CardDescription>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-2">
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-2.5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-primary">Prestige Track</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {prestigeTrack.map((step, index) => (
              <div key={step.id} className={`flex h-10 min-w-10 items-center justify-center rounded-xl border px-2 text-[10px] font-semibold uppercase tracking-[0.08em] ${getTierSealClasses(index, gameState.prestigeCount)}`} title={step.label}>
                {step.label.slice(0, 2)}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
            {gameState.prestigeCount >= 10
              ? 'Onyx complete. You have finished the full prestige track.'
              : `Current tier: ${currentTier}. Next tier: ${nextTier ?? 'None'}. Resetting now would yield ${prestigePreview} Reputation.`}
          </p>
          <div className="mt-2 flex gap-2">
            <Button className="rounded-lg uppercase tracking-[0.1em]" size="sm" variant="outline" onClick={clearPrestigePurchasePlan}>
              Clear planned purchases
            </Button>
            <Button className="rounded-lg uppercase tracking-[0.1em]" size="sm" disabled={!canPrestigeNow} onClick={() => openModal('prestigeConfirm')}>
              {canPrestigeNow ? 'Open prestige confirmation' : gameState.prestigeCount >= 10 ? 'Prestige complete' : 'Prestige locked'}
            </Button>
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          <SummaryTile label="Current Tier" value={currentTier} icon={ShieldCheck} />
          <SummaryTile label="Current Reputation" value={String(gameState.reputation)} icon={BarChart3} />
          <SummaryTile label="Next Reset Gain" value={`${prestigePreview} Rep`} icon={TrendingUp} />
          <SummaryTile label="Next Seed Cash" value={formatCurrency(seedCapitalBonus)} icon={TrendingUp} />
        </div>
        <div className="rounded-xl border border-border/80 bg-background/65 p-2.5 text-[11px]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Reputation after reset</span>
            <span className="font-mono text-primary">{plannedPrestigeAvailable}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Planned spend</span>
            <span className="font-mono text-primary">{plannedPrestigeCost}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Free reputation after plan</span>
            <span className="font-mono text-primary">{plannedPrestigeRemaining}</span>
          </div>
        </div>
        <ScrollArea className="h-full min-h-0 pr-2">
          <div className="space-y-2">
            {PRESTIGE_TAB_UPGRADES.map((upgrade) => {
              const currentRank = selectors.prestigeUpgradeRank(upgrade.id)(gameState)
              const nextCost = getPrestigeGoalNextRankCost(upgrade.id, currentRank)
              const plannedRank = selectors.plannedPrestigeRank(upgrade.id)(gameState)
              const canAddPlan = selectors.canPlanPrestigeUpgrade(upgrade.id, 1)(gameState)
              const canRemovePlan = selectors.canPlanPrestigeUpgrade(upgrade.id, -1)(gameState)

              return (
                <PurchaseCard
                  key={upgrade.id}
                  title={upgrade.name}
                  description={upgrade.description}
                  detail={<span className="text-[10px] uppercase tracking-[0.12em] text-primary">Next rank cost: {nextCost} Reputation</span>}
                  status={currentRank >= upgrade.maxRank ? `Rank ${currentRank}/${upgrade.maxRank}` : plannedRank > 0 ? `Queued x${plannedRank}` : `Rank ${currentRank}/${upgrade.maxRank}`}
                  statusTone={currentRank >= upgrade.maxRank ? 'done' : plannedRank > 0 ? 'ready' : 'default'}
                  actionLabel={currentRank >= upgrade.maxRank ? 'Maxed' : '+ Plan'}
                  disabled={!canAddPlan}
                  disabledReason={!canAddPlan && currentRank < upgrade.maxRank ? `Need ${nextCost} free reputation in the reset plan.` : undefined}
                  onClick={() => adjustPrestigePurchasePlan(upgrade.id, 1)}
                  footer={currentRank >= upgrade.maxRank ? undefined : (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Planned ranks: {plannedRank}</span>
                      <div className="flex gap-1.5">
                        <Button size="xs" variant="outline" className="rounded-md uppercase tracking-[0.12em]" disabled={!canRemovePlan} onClick={() => adjustPrestigePurchasePlan(upgrade.id, -1)}>
                          -1
                        </Button>
                        <Button size="xs" variant="default" className="rounded-md uppercase tracking-[0.12em]" disabled={!canAddPlan} onClick={() => adjustPrestigePurchasePlan(upgrade.id, 1)}>
                          +1
                        </Button>
                      </div>
                    </div>
                  )}
                />
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
