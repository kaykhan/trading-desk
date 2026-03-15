import { ALGORITHMIC_UPGRADES, INFRASTRUCTURE_UPGRADES, SCIENTIST_UPGRADES, TRADING_DESK_UPGRADES } from '@/data/tabContent'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import { formatCurrency } from '@/utils/formatting'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ActionRow } from './DashboardPrimitives'

const UPGRADE_SECTIONS = [
  {
    title: 'Trading Desk Upgrades',
    description: 'Manual trading, trader output, and broad desk-side scaling.',
    upgrades: TRADING_DESK_UPGRADES,
  },
  {
    title: 'Scientist Upgrades',
    description: 'Improve Research Point and Influence output from the science team.',
    upgrades: SCIENTIST_UPGRADES,
  },
  {
    title: 'Algorithmic Trading Upgrades',
    description: 'Increase bot and trading server efficiency once the machine stack is online.',
    upgrades: ALGORITHMIC_UPGRADES,
  },
  {
    title: 'Infrastructure Upgrades',
    description: 'Increase capacity and reduce machine load across infrastructure systems.',
    upgrades: INFRASTRUCTURE_UPGRADES,
  },
] as const

function getUpgradeLockedReason(upgradeId: string, state: ReturnType<typeof useGameStore.getState>) {
  switch (upgradeId) {
    case 'marketScanner':
      return `Requires at least 1 Junior Trader (${state.juniorTraderCount}/1).`
    case 'deskUpgrade':
    case 'trainingProgram':
      return `Requires at least 1 Junior Trader (${state.juniorTraderCount}/1).`
    case 'executiveTraining':
      return `Requires at least 1 Senior Trader (${state.seniorTraderCount}/1).`
    case 'labAutomation':
      return `Requires at least 1 Junior Scientist (${state.juniorResearchScientistCount}/1).`
    case 'researchGrants':
      return state.purchasedResearchTech.seniorScientists
        ? `Requires at least 1 Senior Scientist (${state.seniorResearchScientistCount}/1).`
        : 'Requires Senior Scientists research first.'
    case 'policyAnalysisDesk':
      return state.purchasedResearchTech.regulatoryAffairs
        ? `Requires at least 1 Senior Scientist (${state.seniorResearchScientistCount}/1).`
        : 'Requires Regulatory Affairs research first.'
    case 'botTelemetry':
    case 'lowLatencyServers':
      return state.purchasedResearchTech.algorithmicTrading
        ? `Requires at least 1 Trading Bot (${state.tradingBotCount}/1).`
        : 'Requires Algorithmic Trading research first.'
    case 'executionCluster':
      return state.purchasedResearchTech.tradingServers
        ? `Requires at least 1 Trading Server (${state.tradingServerCount}/1).`
        : 'Requires Trading Servers research first.'
    case 'coolingSystems':
      return state.purchasedResearchTech.powerSystemsEngineering
        ? 'Requires owned infrastructure first.'
        : 'Requires Power Systems Engineering research first.'
    case 'powerDistribution':
      return 'Requires Power Systems Engineering research first.'
    default:
      return 'Unlock the related system first.'
  }
}

export function UpgradesTab() {
  const gameState = useGameStore((state) => state)
  const buyUpgrade = useGameStore((state) => state.buyUpgrade)

  return (
    <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-[0.16em]">Upgrades</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">System efficiency upgrades grouped by firm function</CardDescription>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-2">
        <ScrollArea className="h-full min-h-0 pr-2">
          <div className="space-y-3">
            {UPGRADE_SECTIONS.map((section, index) => {
              return (
                <div key={section.title} className="space-y-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-primary">{section.title}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{section.description}</p>
                  </div>
                  {section.upgrades.length > 0 ? section.upgrades.map((upgrade) => {
                    const isPurchased = selectors.isUpgradePurchased(upgrade.id)(gameState)
                    const visible = selectors.isUpgradeVisible(upgrade.id)(gameState)
                    const shortfall = selectors.upgradeCashShortfall(upgrade.id)(gameState)
                    const lockedReason = !visible ? getUpgradeLockedReason(upgrade.id, gameState) : undefined

                    return (
                      <ActionRow
                        key={upgrade.id}
                        title={upgrade.name}
                        description={upgrade.description}
                        cost={`Cost ${formatCurrency(upgrade.cost)}`}
                        status={isPurchased ? 'Purchased' : !visible ? 'Locked' : shortfall > 0 ? 'Need cash' : 'Ready'}
                        statusTone={isPurchased ? 'done' : !visible ? 'locked' : shortfall > 0 ? 'default' : 'ready'}
                        actionLabel={isPurchased ? 'Purchased' : !visible ? 'Locked' : 'Upgrade'}
                        disabled={!selectors.canAffordUpgrade(upgrade.id)(gameState)}
                        disabledReason={!isPurchased ? lockedReason ?? (shortfall > 0 ? `Need ${formatCurrency(shortfall)} more cash.` : undefined) : undefined}
                        onClick={() => buyUpgrade(upgrade.id)}
                      />
                    )
                  }) : <div className="rounded-xl border border-border/70 bg-background/45 p-2 text-[11px] text-muted-foreground">No upgrades visible yet for this system.</div>}
                  {index < UPGRADE_SECTIONS.length - 1 ? <Separator className="bg-border/60" /> : null}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
