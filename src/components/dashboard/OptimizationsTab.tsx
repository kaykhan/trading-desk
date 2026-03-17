import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { REPEATABLE_UPGRADES } from '@/data/repeatableUpgrades'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import type { RepeatableUpgradeDefinition, RepeatableUpgradeFamily, RepeatableUpgradeId } from '@/types/game'
import { formatCurrency, formatNumber } from '@/utils/formatting'
import { PurchaseCard } from './DashboardPrimitives'

const BUY_MODES = [1, 5, 10, 'max'] as const

const OPTIMIZATION_SECTIONS: Array<{
  family: RepeatableUpgradeFamily
  title: string
  description: string
}> = [
  {
    family: 'desk',
    title: 'Desk Optimisations',
    description: 'Manual trading, human desk output, institution output, and sector deployment refinement.',
  },
  {
    family: 'research',
    title: 'Research Optimisations',
    description: 'Research generation, training quality, and analytical refinement for late-game planning.',
  },
  {
    family: 'automation',
    title: 'Automation Optimisations',
    description: 'Cycle payout, runtime efficiency, power usage, and strategy quality for machine systems.',
  },
  {
    family: 'governance',
    title: 'Governance Optimisations',
    description: 'Compliance relief, filing cost reduction, influence growth, and institution support.',
  },
]

function formatPercent(value: number) {
  return `${(value * 100).toFixed(value * 100 < 10 ? 1 : 0)}%`
}

function getCurrentTotalEffect(upgrade: RepeatableUpgradeDefinition, multiplier: number) {
  if (upgrade.id === 'modelEfficiency' || upgrade.id === 'computeOptimization' || upgrade.id === 'complianceSystems' || upgrade.id === 'filingEfficiency' || upgrade.id === 'institutionalAccess') {
    return `${formatPercent(1 - multiplier)} reduction`
  }

  return `${formatPercent(multiplier - 1)} total`
}

function getCurrencyLabel(currency: RepeatableUpgradeDefinition['currency'], amount: number) {
  if (currency === 'cash') {
    return formatCurrency(amount)
  }

  if (currency === 'researchPoints') {
    return `${formatNumber(amount)} RP`
  }

  return `${formatNumber(amount, { decimalsBelowThreshold: 2 })} inf`
}

function getUpgradeStatus(isVisible: boolean, isUnlocked: boolean, canAfford: boolean, rank: number, maxRank: number) {
  if (!isVisible) return 'Locked'
  if (!isUnlocked) return 'Locked'
  if (rank >= maxRank) return 'Capped'
  return canAfford ? 'Ready' : 'Need funds'
}

function getUpgradeStatusTone(isVisible: boolean, isUnlocked: boolean, canAfford: boolean, rank: number, maxRank: number) {
  if (!isVisible || !isUnlocked) return 'locked' as const
  if (rank >= maxRank) return 'done' as const
  return canAfford ? 'ready' as const : 'warning' as const
}

export function OptimizationsTab() {
  const gameState = useGameStore((state) => state)
  const buyRepeatableUpgrade = useGameStore((state) => state.buyRepeatableUpgrade)
  const setRepeatableUpgradeBuyMode = useGameStore((state) => state.setRepeatableUpgradeBuyMode)
  const globallyUnlocked = useGameStore(selectors.repeatableUpgradesGloballyUnlocked)
  const totalRanksPurchased = useGameStore(selectors.totalRepeatableUpgradeRanksPurchased)

  return (
    <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-[0.16em]">Optimisations</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Broad 100-rank late-game refinement tracks unlocked after the first prestige.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-3">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-2">
          <div className="rounded-xl border border-border/80 bg-background/70 p-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Unlocked</p>
            <p className="mt-1 font-mono text-[13px] font-semibold text-foreground xl:text-sm">{globallyUnlocked ? 'Yes' : 'No'}</p>
          </div>
          <div className="rounded-xl border border-border/80 bg-background/70 p-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Total ranks</p>
            <p className="mt-1 font-mono text-[13px] font-semibold text-foreground xl:text-sm">{formatNumber(totalRanksPurchased)}</p>
          </div>
        </div>

        <ScrollArea className="h-full min-h-0 pr-2">
          <div className="space-y-3">
            {OPTIMIZATION_SECTIONS.map((section, index) => {
              const upgrades = REPEATABLE_UPGRADES.filter((upgrade) => upgrade.family === section.family)

              return (
                <div key={section.family} className="space-y-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-primary">{section.title}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{section.description}</p>
                  </div>
                  {upgrades.map((upgrade) => {
                    const rank = selectors.repeatableUpgradeRank(upgrade.id)(gameState)
                    const multiplier = selectors.repeatableUpgradeMultiplier(upgrade.id)(gameState)
                    const cost = selectors.bulkRepeatableUpgradeTotalCost(upgrade.id)(gameState)
                    const quantity = selectors.bulkRepeatableUpgradeQuantity(upgrade.id)(gameState)
                    const buyMode = selectors.repeatableUpgradeBuyMode(upgrade.id)(gameState)
                    const isVisible = selectors.isRepeatableUpgradeVisible(upgrade.id)(gameState)
                    const isUnlocked = selectors.isRepeatableUpgradeUnlocked(upgrade.id)(gameState)
                    const shortfall = selectors.repeatableUpgradeShortfall(upgrade.id)(gameState)
                    const canAfford = selectors.canAffordRepeatableUpgrade(upgrade.id)(gameState)
                    const purchaseLabel = buyMode === 'max' ? `Buy Max (${quantity})` : `Buy x${quantity}`
                    const disabledReason = !globallyUnlocked
                      ? 'Requires Prestige 1.'
                      : !isUnlocked
                        ? upgrade.unlockConditionDescription
                        : rank >= upgrade.maxRank
                          ? 'Maximum rank reached.'
                          : shortfall > 0
                            ? `Need ${getCurrencyLabel(upgrade.currency, shortfall)} more.`
                            : undefined

                    return (
                      <PurchaseCard
                        key={upgrade.id}
                        title={upgrade.name}
                        description={upgrade.description}
                        detail={(
                          <div className="mt-1 space-y-1 text-[11px] leading-4 text-muted-foreground">
                            <p>{upgrade.perRankDescription}</p>
                            <p>Current total: {getCurrentTotalEffect(upgrade, multiplier)}</p>
                            <p>Unlock: {upgrade.unlockConditionDescription}</p>
                          </div>
                        )}
                        cost={isVisible ? `${purchaseLabel} costs ${getCurrencyLabel(upgrade.currency, cost)}` : undefined}
                        status={getUpgradeStatus(isVisible, isUnlocked, canAfford, rank, upgrade.maxRank)}
                        statusTone={getUpgradeStatusTone(isVisible, isUnlocked, canAfford, rank, upgrade.maxRank)}
                        badges={[
                          { label: `${formatNumber(rank)}/${formatNumber(upgrade.maxRank)}`, tone: 'success' },
                          { label: upgrade.family, tone: 'default' },
                          { label: upgrade.currency, tone: 'default' },
                        ]}
                        actionLabel={rank >= upgrade.maxRank ? 'Maxed' : getCurrencyLabel(upgrade.currency, cost)}
                        disabled={!canAfford || rank >= upgrade.maxRank}
                        disabledReason={disabledReason}
                        onClick={() => buyRepeatableUpgrade(upgrade.id as RepeatableUpgradeId)}
                        footer={(
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Buy</span>
                            {BUY_MODES.map((mode) => (
                              <Button
                                key={`${upgrade.id}-${String(mode)}`}
                                size="xs"
                                variant={buyMode === mode ? 'default' : 'outline'}
                                className="rounded-md uppercase tracking-[0.12em]"
                                onClick={() => setRepeatableUpgradeBuyMode(upgrade.id as RepeatableUpgradeId, mode)}
                              >
                                {typeof mode === 'number' ? `x${mode}` : 'Max'}
                              </Button>
                            ))}
                          </div>
                        )}
                      />
                    )
                  })}
                  {index < OPTIMIZATION_SECTIONS.length - 1 ? <Separator className="bg-border/60" /> : null}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
