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
  const nextInternCost = useGameStore(selectors.nextInternCost)
  const nextJuniorTraderCost = useGameStore(selectors.nextJuniorTraderCost)
  const nextSeniorTraderCost = useGameStore(selectors.nextSeniorTraderCost)
  const nextRuleBasedBotCost = useGameStore(selectors.nextRuleBasedBotCost)
  const internBulkQuantity = useGameStore(selectors.bulkUnitQuantity('intern'))
  const internBulkTotalCost = useGameStore(selectors.bulkUnitTotalCost('intern'))
  const juniorBulkQuantity = useGameStore(selectors.bulkUnitQuantity('juniorTrader'))
  const juniorBulkTotalCost = useGameStore(selectors.bulkUnitTotalCost('juniorTrader'))
  const seniorBulkQuantity = useGameStore(selectors.bulkUnitQuantity('seniorTrader'))
  const seniorBulkTotalCost = useGameStore(selectors.bulkUnitTotalCost('seniorTrader'))
  const botBulkQuantity = useGameStore(selectors.bulkUnitQuantity('ruleBasedBot'))
  const botBulkTotalCost = useGameStore(selectors.bulkUnitTotalCost('ruleBasedBot'))
  const internBuyMode = useGameStore(selectors.unitBuyMode('intern'))
  const juniorBuyMode = useGameStore(selectors.unitBuyMode('juniorTrader'))
  const seniorBuyMode = useGameStore(selectors.unitBuyMode('seniorTrader'))
  const botBuyMode = useGameStore(selectors.unitBuyMode('ruleBasedBot'))
  const internUnlocked = useGameStore(selectors.isUnitUnlocked('intern'))
  const juniorUnlocked = useGameStore(selectors.isUnitUnlocked('juniorTrader'))
  const seniorUnlocked = useGameStore(selectors.isUnitUnlocked('seniorTrader'))
  const botUnlocked = useGameStore(selectors.isUnitUnlocked('ruleBasedBot'))

  const nextOperationsGoal = !internUnlocked
    ? 'Research Recruiter first.'
    : !juniorUnlocked
      ? 'Scale Interns and unlock Junior Trader Program.'
      : !seniorUnlocked
        ? 'Scale Juniors and unlock Senior Recruitment.'
      : !botUnlocked
        ? 'Grow Seniors until Algorithmic Trading becomes available.'
        : 'Scale bots with bulk buying and infrastructure upgrades.'

  const currentLane = !internUnlocked
    ? 'Desk not started'
    : !juniorUnlocked
      ? 'Intern ramp'
      : !seniorUnlocked
        ? 'Junior expansion'
      : !botUnlocked
        ? 'Senior growth'
        : 'Automation scaling'

  const unitUnlockProgress = {
    intern: 'Unlock with Recruiter in Research.',
    juniorTrader: `Unlock with Junior Trader Program after reaching 5 Interns (${gameState.internCount}/5).`,
    seniorTrader: `Unlock with Senior Recruitment after reaching 5 Juniors (${gameState.juniorTraderCount}/5).`,
    ruleBasedBot: `Unlock with Algorithmic Trading after reaching 5 Seniors (${gameState.seniorTraderCount}/5).`,
  } as const

  const getUnitRow = (unitId: (typeof OPERATIONS_UNITS)[number]['id']) => {
    if (unitId === 'intern') {
      const affordable = selectors.canAffordIntern(gameState)
      const shortfall = Math.max(0, nextInternCost - gameState.cash)
      const unlocked = selectors.isUnitUnlocked('intern')(gameState)

      return {
        title: `Hire ${UNITS.intern.name}`,
        description: unlocked ? UNITS.intern.description : `${UNITS.intern.description} ${unitUnlockProgress.intern}`,
        cost: `${internBuyMode === 'max' ? 'Max' : `x${internBuyMode}`} costs ${formatCurrency(internBulkTotalCost || nextInternCost)}${internBuyMode !== 'max' ? ` | Next ${formatCurrency(nextInternCost)}` : ''}`,
        status: unlocked ? (affordable ? 'Ready' : 'Need cash') : 'Locked',
        actionLabel: internBuyMode === 'max' ? `Hire Max (${internBulkQuantity})` : `Hire x${internBuyMode}`,
        disabled: !selectors.canAffordUnitInCurrentMode('intern')(gameState),
        disabledReason: !unlocked ? unitUnlockProgress.intern : shortfall > 0 ? `Need ${formatCurrency(shortfall)} more cash for the next hire.` : undefined,
        onClick: () => buyUnit('intern', internBuyMode),
      }
    }

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

    const unlocked = selectors.isUnitUnlocked('ruleBasedBot')(gameState)
    const shortfall = Math.max(0, nextRuleBasedBotCost - gameState.cash)

    return {
      title: `Buy ${UNITS.ruleBasedBot.name}`,
      description: unlocked ? UNITS.ruleBasedBot.description : `${UNITS.ruleBasedBot.description} ${unitUnlockProgress.ruleBasedBot}`,
      cost: `${botBuyMode === 'max' ? 'Max' : `x${botBuyMode}`} costs ${formatCurrency(botBulkTotalCost || nextRuleBasedBotCost)}${botBuyMode !== 'max' ? ` | Next ${formatCurrency(nextRuleBasedBotCost)}` : ''}`,
      status: unlocked ? (shortfall > 0 ? 'Need cash' : 'Ready') : 'Locked',
      actionLabel: botBuyMode === 'max' ? `Deploy Max (${botBulkQuantity})` : `Deploy x${botBuyMode}`,
      disabled: !selectors.canAffordUnitInCurrentMode('ruleBasedBot')(gameState),
      disabledReason: !unlocked ? unitUnlockProgress.ruleBasedBot : shortfall > 0 ? `Need ${formatCurrency(shortfall)} more cash for the next bot.` : undefined,
      onClick: () => buyUnit('ruleBasedBot', botBuyMode),
    }
  }

  return (
    <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-[0.16em]">Operations</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Deployment and scaling layer</CardDescription>
        <CardAction>
          <Badge variant="outline" className="rounded-md border-border/80 bg-background/70 text-[10px] uppercase tracking-[0.18em] text-primary">
            {gameState.internCount} interns / {gameState.juniorTraderCount} juniors / {gameState.seniorTraderCount} seniors / {gameState.ruleBasedBotCount} bots
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-2">
        <div className="grid gap-2 md:grid-cols-4">
          <SummaryTile label="Interns" value={gameState.internCount.toString()} icon={Users} />
          <SummaryTile label="Juniors" value={gameState.juniorTraderCount.toString()} icon={Users} />
          <SummaryTile label="Seniors" value={gameState.seniorTraderCount.toString()} icon={BriefcaseBusiness} />
          <SummaryTile label="Bots" value={gameState.ruleBasedBotCount.toString()} icon={Cpu} />
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
