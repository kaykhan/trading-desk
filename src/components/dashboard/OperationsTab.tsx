import { BriefcaseBusiness, Cpu, Users } from 'lucide-react'
import { OPERATIONS_UNITS, OPERATIONS_UPGRADES } from '@/data/tabContent'
import { UNITS } from '@/data/units'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import { formatCurrency } from '@/utils/formatting'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ActionRow, SummaryTile } from './DashboardPrimitives'

export function OperationsTab() {
  const gameState = useGameStore((state) => state)
  const buyUnit = useGameStore((state) => state.buyUnit)
  const buyUpgrade = useGameStore((state) => state.buyUpgrade)
  const nextJuniorTraderCost = useGameStore(selectors.nextJuniorTraderCost)
  const nextSeniorTraderCost = useGameStore(selectors.nextSeniorTraderCost)
  const nextTradingBotCost = useGameStore(selectors.nextTradingBotCost)
  const juniorBulkQuantity = useGameStore(selectors.bulkUnitQuantity('juniorTrader'))
  const juniorBulkTotalCost = useGameStore(selectors.bulkUnitTotalCost('juniorTrader'))
  const seniorBulkQuantity = useGameStore(selectors.bulkUnitQuantity('seniorTrader'))
  const seniorBulkTotalCost = useGameStore(selectors.bulkUnitTotalCost('seniorTrader'))
  const botBulkQuantity = useGameStore(selectors.bulkUnitQuantity('tradingBot'))
  const botBulkTotalCost = useGameStore(selectors.bulkUnitTotalCost('tradingBot'))
  const juniorBuyMode = useGameStore(selectors.unitBuyMode('juniorTrader'))
  const seniorBuyMode = useGameStore(selectors.unitBuyMode('seniorTrader'))
  const botBuyMode = useGameStore(selectors.unitBuyMode('tradingBot'))
  const juniorUnlocked = useGameStore(selectors.isUnitUnlocked('juniorTrader'))
  const seniorUnlocked = useGameStore(selectors.isUnitUnlocked('seniorTrader'))
  const botUnlocked = useGameStore(selectors.isUnitUnlocked('tradingBot'))

  const nextOperationsGoal = !juniorUnlocked
    ? 'Research Junior Hiring Program first.'
    : !seniorUnlocked
      ? 'Scale Juniors and unlock Senior Recruitment.'
      : !botUnlocked
        ? 'Grow Seniors until Algorithmic Trading becomes available.'
        : 'Scale bots with bulk buying and infrastructure upgrades.'

  const currentLane = !juniorUnlocked
    ? 'Desk not started'
    : !seniorUnlocked
      ? 'Junior expansion'
      : !botUnlocked
        ? 'Senior growth'
        : 'Automation scaling'

  const unitUnlockProgress = {
    juniorTrader: 'Unlock with Junior Hiring Program in Research.',
    seniorTrader: `Unlock with Senior Recruitment after reaching 5 Juniors (${gameState.juniorTraderCount}/5).`,
    tradingBot: `Unlock with Algorithmic Trading after reaching 5 Seniors (${gameState.seniorTraderCount}/5).`,
  } as const

  const getUnitRow = (unitId: (typeof OPERATIONS_UNITS)[number]['id']) => {
    if (unitId === 'juniorTrader') {
      const affordable = selectors.canAffordJuniorTrader(gameState)
      const shortfall = Math.max(0, nextJuniorTraderCost - gameState.cash)
      const unlocked = selectors.isUnitUnlocked('juniorTrader')(gameState)

      return {
        title: `Hire ${UNITS.juniorTrader.name}`,
        description: unlocked ? UNITS.juniorTrader.description : `${UNITS.juniorTrader.description} ${unitUnlockProgress.juniorTrader}`,
        cost: `${juniorBuyMode === 'max' ? 'Max' : `x${juniorBuyMode}`} costs ${formatCurrency(juniorBulkTotalCost || nextJuniorTraderCost)}${juniorBuyMode !== 'max' ? ` | Next ${formatCurrency(nextJuniorTraderCost)}` : ''}`,
        status: unlocked ? (affordable ? 'Ready' : 'Need cash') : 'Locked',
        actionLabel: juniorBuyMode === 'max' ? `Hire Max (${juniorBulkQuantity})` : `Hire x${juniorBuyMode}`,
        disabled: !selectors.canAffordUnitInCurrentMode('juniorTrader')(gameState),
        disabledReason: !unlocked ? unitUnlockProgress.juniorTrader : shortfall > 0 ? `Need ${formatCurrency(shortfall)} more cash for the next hire.` : undefined,
        onClick: () => buyUnit('juniorTrader', juniorBuyMode),
      }
    }

    if (unitId === 'seniorTrader') {
      const affordable = selectors.canAffordSeniorTrader(gameState)
      const shortfall = Math.max(0, nextSeniorTraderCost - gameState.cash)
      const unlocked = selectors.isUnitUnlocked('seniorTrader')(gameState)

      return {
        title: `Hire ${UNITS.seniorTrader.name}`,
        description: unlocked ? UNITS.seniorTrader.description : `${UNITS.seniorTrader.description} ${unitUnlockProgress.seniorTrader}`,
        cost: `${seniorBuyMode === 'max' ? 'Max' : `x${seniorBuyMode}`} costs ${formatCurrency(seniorBulkTotalCost || nextSeniorTraderCost)}${seniorBuyMode !== 'max' ? ` | Next ${formatCurrency(nextSeniorTraderCost)}` : ''}`,
        status: unlocked ? (affordable ? 'Ready' : 'Need cash') : 'Locked',
        actionLabel: seniorBuyMode === 'max' ? `Hire Max (${seniorBulkQuantity})` : `Hire x${seniorBuyMode}`,
        disabled: !selectors.canAffordUnitInCurrentMode('seniorTrader')(gameState),
        disabledReason: !unlocked ? unitUnlockProgress.seniorTrader : shortfall > 0 ? `Need ${formatCurrency(shortfall)} more cash for the next hire.` : undefined,
        onClick: () => buyUnit('seniorTrader', seniorBuyMode),
      }
    }

    const unlocked = selectors.isUnitUnlocked('tradingBot')(gameState)
    const shortfall = Math.max(0, nextTradingBotCost - gameState.cash)

    return {
      title: `Buy ${UNITS.tradingBot.name}`,
      description: unlocked ? UNITS.tradingBot.description : `${UNITS.tradingBot.description} ${unitUnlockProgress.tradingBot}`,
      cost: `${botBuyMode === 'max' ? 'Max' : `x${botBuyMode}`} costs ${formatCurrency(botBulkTotalCost || nextTradingBotCost)}${botBuyMode !== 'max' ? ` | Next ${formatCurrency(nextTradingBotCost)}` : ''}`,
      status: unlocked ? (shortfall > 0 ? 'Need cash' : 'Ready') : 'Locked',
      actionLabel: botBuyMode === 'max' ? `Deploy Max (${botBulkQuantity})` : `Deploy x${botBuyMode}`,
      disabled: !selectors.canAffordUnitInCurrentMode('tradingBot')(gameState),
      disabledReason: !unlocked ? unitUnlockProgress.tradingBot : shortfall > 0 ? `Need ${formatCurrency(shortfall)} more cash for the next bot.` : undefined,
      onClick: () => buyUnit('tradingBot', botBuyMode),
    }
  }

  return (
    <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-[0.16em]">Operations</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Deployment and scaling layer</CardDescription>
        <CardAction>
          <Badge variant="outline" className="rounded-md border-border/80 bg-background/70 text-[10px] uppercase tracking-[0.18em] text-primary">
            {gameState.juniorTraderCount} juniors / {gameState.seniorTraderCount} seniors / {gameState.tradingBotCount} bots
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-2">
        <div className="grid gap-2 md:grid-cols-3">
          <SummaryTile label="Juniors" value={gameState.juniorTraderCount.toString()} icon={Users} />
          <SummaryTile label="Seniors" value={gameState.seniorTraderCount.toString()} icon={BriefcaseBusiness} />
          <SummaryTile label="Bots" value={gameState.tradingBotCount.toString()} icon={Cpu} />
        </div>
        <div className="rounded-xl border border-primary/25 bg-primary/10 p-2 text-xs text-foreground">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-[0.18em] text-primary">Current lane</span>
            <Badge variant="outline" className="rounded-md border-primary/35 bg-background/60 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-primary">
              {currentLane}
            </Badge>
          </div>
          <p className="mt-1 text-[11px] leading-4">{nextOperationsGoal}</p>
        </div>
        <ScrollArea className="h-full min-h-0 pr-2">
          <div className="space-y-2">
            {OPERATIONS_UNITS.map((unit) => {
              const row = getUnitRow(unit.id)
              return (
                <ActionRow
                  key={unit.id}
                  {...row}
                  statusTone={
                    row.status === 'Ready'
                      ? 'ready'
                      : row.status === 'Locked'
                        ? 'locked'
                        : 'default'
                  }
                />
              )
            })}
            <Separator className="bg-border/60" />
            {OPERATIONS_UPGRADES.map((upgrade) => {
              const isPurchased = selectors.isUpgradePurchased(upgrade.id)(gameState)
              const shortfall = selectors.upgradeCashShortfall(upgrade.id)(gameState)
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
