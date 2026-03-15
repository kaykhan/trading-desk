import { ArrowRight, BriefcaseBusiness, Cpu, TrendingUp, Users } from 'lucide-react'
import { OPERATIONS_UPGRADES, RESEARCH_UPGRADES, TRADING_UPGRADES } from '@/data/tabContent'
import { UNITS } from '@/data/units'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import type { BuyMode, UnitId, UpgradeId } from '@/types/game'
import { formatCurrency, formatRate } from '@/utils/formatting'
import { getProgressionSummary } from '@/utils/progression'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ActionRow, SummaryTile } from './DashboardPrimitives'

const BUY_MODES: BuyMode[] = [1, 5, 10, 'max']

type DeskSectionConfig = {
  unitId: UnitId
  title: string
  unlockLabel: string
  upgradeIds: UpgradeId[]
}

type RowTone = 'default' | 'ready' | 'locked' | 'done'

type DeskUnitMeta = {
  unlocked: boolean
  status: string
  statusTone: RowTone
  purchaseLabel: string
  disabled: boolean
  disabledReason?: string
  cost: string
  quantity: number
  onClick: () => void
  incomeLabel: string
}

type DeskUnitBuyControlsProps = {
  unitId: UnitId
  activeMode: BuyMode
  onChange: (_mode: BuyMode) => void
}

function DeskUnitBuyControls({ unitId, activeMode, onChange }: DeskUnitBuyControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {unitId === 'juniorTrader' ? 'Junior' : unitId === 'seniorTrader' ? 'Senior' : 'Bot'}
      </span>
      {BUY_MODES.map((mode) => (
        <Button
          key={`${unitId}-${String(mode)}`}
          size="xs"
          variant={activeMode === mode ? 'default' : 'outline'}
          className="rounded-md uppercase tracking-[0.12em]"
          onClick={() => onChange(mode)}
        >
          {typeof mode === 'number' ? `x${mode}` : 'Max'}
        </Button>
      ))}
    </div>
  )
}

const DESK_SECTIONS: DeskSectionConfig[] = [
  {
    unitId: 'juniorTrader',
    title: 'Junior Desk',
    unlockLabel: 'Research Junior Hiring Program to open this desk.',
    upgradeIds: ['deskUpgrade', 'trainingProgram'],
  },
  {
    unitId: 'seniorTrader',
    title: 'Senior Desk',
    unlockLabel: 'Reach 5 Juniors, then research Senior Recruitment.',
    upgradeIds: ['executiveTraining'],
  },
  {
    unitId: 'tradingBot',
    title: 'Bot Desk',
    unlockLabel: 'Reach 5 Seniors, then research Algorithmic Trading.',
    upgradeIds: ['lowLatencyServers'],
  },
]

export function DeskTab() {
  const gameState = useGameStore((state) => state)
  const makeTrade = useGameStore((state) => state.makeTrade)
  const buyUnit = useGameStore((state) => state.buyUnit)
  const buyUpgrade = useGameStore((state) => state.buyUpgrade)
  const setUnitBuyMode = useGameStore((state) => state.setUnitBuyMode)
  const latestTradeFeedback = useGameStore((state) => state.latestTradeFeedback)
  const progressionSummary = getProgressionSummary(gameState)
  const cashPerClick = useGameStore(selectors.cashPerClick)
  const cashPerSecond = useGameStore(selectors.cashPerSecond)
  const nextJuniorTraderCost = useGameStore(selectors.nextJuniorTraderCost)
  const nextSeniorTraderCost = useGameStore(selectors.nextSeniorTraderCost)
  const nextTradingBotCost = useGameStore(selectors.nextTradingBotCost)
  const juniorBuyMode = useGameStore(selectors.unitBuyMode('juniorTrader'))
  const seniorBuyMode = useGameStore(selectors.unitBuyMode('seniorTrader'))
  const botBuyMode = useGameStore(selectors.unitBuyMode('tradingBot'))
  const juniorBulkTotalCost = useGameStore(selectors.bulkUnitTotalCost('juniorTrader'))
  const seniorBulkTotalCost = useGameStore(selectors.bulkUnitTotalCost('seniorTrader'))
  const botBulkTotalCost = useGameStore(selectors.bulkUnitTotalCost('tradingBot'))

  const getUnitMeta = (unitId: UnitId): DeskUnitMeta => {
    if (unitId === 'juniorTrader') {
      const unlocked = selectors.isUnitUnlocked('juniorTrader')(gameState)
      const ready = selectors.canAffordJuniorTrader(gameState)
      const shortfall = Math.max(0, nextJuniorTraderCost - gameState.cash)

      return {
        unlocked,
        status: unlocked ? (ready ? 'Ready' : 'Need cash') : 'Locked',
        statusTone: unlocked ? (ready ? 'ready' : 'default') : 'locked' as const,
        purchaseLabel: 'Hire',
        disabled: !selectors.canAffordUnitInCurrentMode('juniorTrader')(gameState),
        disabledReason: !unlocked
          ? 'Unlock with Junior Hiring Program in Research.'
          : shortfall > 0
            ? `Need ${formatCurrency(shortfall)} more cash for the next hire.`
            : undefined,
        cost: `${juniorBuyMode === 'max' ? 'Max' : `x${juniorBuyMode}`} costs ${formatCurrency(juniorBulkTotalCost || nextJuniorTraderCost)}${juniorBuyMode !== 'max' ? ` | Next ${formatCurrency(nextJuniorTraderCost)}` : ''}`,
        quantity: gameState.juniorTraderCount,
        onClick: () => buyUnit('juniorTrader', juniorBuyMode),
        incomeLabel: `${formatRate(selectors.juniorIncome(gameState))} total`,
      }
    }

    if (unitId === 'seniorTrader') {
      const unlocked = selectors.isUnitUnlocked('seniorTrader')(gameState)
      const ready = selectors.canAffordSeniorTrader(gameState)
      const shortfall = Math.max(0, nextSeniorTraderCost - gameState.cash)

      return {
        unlocked,
        status: unlocked ? (ready ? 'Ready' : 'Need cash') : 'Locked',
        statusTone: unlocked ? (ready ? 'ready' : 'default') : 'locked' as const,
        purchaseLabel: 'Hire',
        disabled: !selectors.canAffordUnitInCurrentMode('seniorTrader')(gameState),
        disabledReason: !unlocked
          ? `Unlock with Senior Recruitment after reaching 5 Juniors (${gameState.juniorTraderCount}/5).`
          : shortfall > 0
            ? `Need ${formatCurrency(shortfall)} more cash for the next hire.`
            : undefined,
        cost: `${seniorBuyMode === 'max' ? 'Max' : `x${seniorBuyMode}`} costs ${formatCurrency(seniorBulkTotalCost || nextSeniorTraderCost)}${seniorBuyMode !== 'max' ? ` | Next ${formatCurrency(nextSeniorTraderCost)}` : ''}`,
        quantity: gameState.seniorTraderCount,
        onClick: () => buyUnit('seniorTrader', seniorBuyMode),
        incomeLabel: `${formatRate(selectors.seniorIncome(gameState))} total`,
      }
    }

    const unlocked = selectors.isUnitUnlocked('tradingBot')(gameState)
    const shortfall = Math.max(0, nextTradingBotCost - gameState.cash)
    const ready = unlocked && shortfall === 0

    return {
      unlocked,
      status: unlocked ? (ready ? 'Ready' : 'Need cash') : 'Locked',
      statusTone: unlocked ? (ready ? 'ready' : 'default') : 'locked' as const,
      purchaseLabel: 'Deploy',
      disabled: !selectors.canAffordUnitInCurrentMode('tradingBot')(gameState),
      disabledReason: !unlocked
        ? `Unlock with Algorithmic Trading after reaching 5 Seniors (${gameState.seniorTraderCount}/5).`
        : shortfall > 0
          ? `Need ${formatCurrency(shortfall)} more cash for the next bot.`
          : undefined,
      cost: `${botBuyMode === 'max' ? 'Max' : `x${botBuyMode}`} costs ${formatCurrency(botBulkTotalCost || nextTradingBotCost)}${botBuyMode !== 'max' ? ` | Next ${formatCurrency(nextTradingBotCost)}` : ''}`,
      quantity: gameState.tradingBotCount,
      onClick: () => buyUnit('tradingBot', botBuyMode),
      incomeLabel: `${formatRate(selectors.botIncome(gameState))} total`,
    }
  }

  const getResearchDescription = (upgradeId: UpgradeId, fallback: string) => {
    if (upgradeId === 'seniorRecruitment' && !selectors.isUpgradeVisible(upgradeId)(gameState)) {
      return `Unlock Senior Traders in the desk. Requires 5 Junior Traders (${gameState.juniorTraderCount}/5).`
    }

    if (upgradeId === 'algorithmicTrading' && !selectors.isUpgradeVisible(upgradeId)(gameState)) {
      return `Unlock Trading Bots in the desk. Requires 5 Senior Traders (${gameState.seniorTraderCount}/5).`
    }

    if (upgradeId === 'bullMarket' && !selectors.isUpgradeVisible(upgradeId)(gameState)) {
      return 'Increase all profits by 50 percent. Requires Trade Multiplier first.'
    }

    return fallback
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto pr-1">
      <div className="space-y-2">
        <Card className="terminal-panel rounded-2xl border-border/80 bg-card/92">
          <CardContent className="space-y-2 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary">Desk</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{progressionSummary.headline}</p>
              </div>
              <Badge variant="outline" className="rounded-md border-primary/40 bg-primary/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-primary">
                {progressionSummary.phaseLabel}
              </Badge>
            </div>

            <div className="relative rounded-xl border border-primary/30 bg-[radial-gradient(circle_at_top,rgba(255,221,51,0.14),transparent_45%),linear-gradient(180deg,rgba(34,34,34,0.98),rgba(22,22,22,0.98))] p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Trading</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Manual trades start every run and fund the next desk unlock.</p>
                </div>
                <div className="grid min-w-[160px] gap-2 sm:grid-cols-2 xl:min-w-[220px]">
                  <SummaryTile label="Cash / Click" value={formatCurrency(cashPerClick, cashPerClick < 100 ? 1 : 0)} icon={TrendingUp} />
                  <SummaryTile label="Cash / Sec" value={formatRate(cashPerSecond)} icon={Cpu} />
                </div>
              </div>

              <div className="mt-3 flex flex-col items-center gap-2">
                <Button
                  size="sm"
                  className="h-11 w-full max-w-sm rounded-lg border border-primary/50 bg-primary text-xs font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-[0_8px_18px_rgba(255,221,51,0.14)] transition hover:bg-primary/95"
                  onClick={makeTrade}
                >
                  Make Trade
                </Button>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <Badge variant="outline" className="rounded-md border-primary/40 bg-background/70 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-primary">
                    {progressionSummary.nextTarget}
                  </Badge>
                  {latestTradeFeedback ? (
                    <Badge className="rounded-md bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground">
                      +{formatCurrency(latestTradeFeedback.amount, latestTradeFeedback.amount < 100 ? 1 : 0)}
                    </Badge>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 grid gap-2 xl:grid-cols-3">
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
            </div>

          </CardContent>
        </Card>

        {DESK_SECTIONS.map((section) => {
          const unit = UNITS[section.unitId]
          const unitMeta = getUnitMeta(section.unitId)
          const SectionIcon = section.unitId === 'juniorTrader' ? Users : section.unitId === 'seniorTrader' ? BriefcaseBusiness : Cpu
          const inlineResearchUpgradeIds =
            section.unitId === 'juniorTrader'
              ? ['juniorHiringProgram', 'tradeMultiplier']
              : section.unitId === 'seniorTrader'
                ? ['seniorRecruitment', 'bullMarket']
                : ['algorithmicTrading']

          return (
            <Card key={section.unitId} className="terminal-panel rounded-2xl border-border/80 bg-card/92">
              <CardContent className="space-y-2 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <SectionIcon className="size-4 text-primary" />
                      <p className="text-sm font-semibold text-foreground">{section.title}</p>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{unit.description}</p>
                  </div>
                  <Badge variant="outline" className="rounded-md border-border/80 bg-background/60 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {unitMeta.quantity} owned
                  </Badge>
                </div>

                <div className="grid gap-2 rounded-xl border border-border/80 bg-background/65 p-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">{unit.name}</h3>
                        <Badge
                          variant="outline"
                          className={
                            unitMeta.statusTone === 'ready'
                              ? 'h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary'
                              : unitMeta.statusTone === 'locked'
                                ? 'h-5 rounded-md border-border/70 bg-background/50 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground'
                                : 'h-5 rounded-md border-border/80 bg-card/70 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary'
                          }
                        >
                          {unitMeta.status}
                        </Badge>
                        {unitMeta.unlocked ? (
                          <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                            {unitMeta.incomeLabel}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{unitMeta.unlocked ? `Scale ${unit.name}s to strengthen this desk tier.` : section.unlockLabel}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-primary">{unitMeta.cost}</p>
                      {unitMeta.disabled && unitMeta.disabledReason ? <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{unitMeta.disabledReason}</p> : null}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <DeskUnitBuyControls
                        unitId={section.unitId}
                        activeMode={
                          section.unitId === 'juniorTrader'
                            ? juniorBuyMode
                            : section.unitId === 'seniorTrader'
                              ? seniorBuyMode
                              : botBuyMode
                        }
                        onChange={(mode) => setUnitBuyMode(section.unitId, mode)}
                      />
                      <Button
                        size="xs"
                        variant={unitMeta.disabled ? 'outline' : 'default'}
                        className="rounded-md uppercase tracking-[0.08em]"
                        disabled={unitMeta.disabled}
                        onClick={unitMeta.onClick}
                        >
                          {unitMeta.purchaseLabel}
                        </Button>
                      </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="size-3.5 text-primary" />
                    <p className="text-[10px] uppercase tracking-[0.18em] text-primary">Relevant upgrades</p>
                  </div>
                  <div className="grid gap-2 xl:grid-cols-2">
                    {section.upgradeIds.map((upgradeId) => {
                      const upgrade = OPERATIONS_UPGRADES.find((item) => item.id === upgradeId)

                      if (!upgrade) {
                        return null
                      }

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

                <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-2">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="size-3.5 text-primary" />
                    <p className="text-[10px] uppercase tracking-[0.18em] text-primary">Unlock research</p>
                  </div>
                  <div className="grid gap-2 xl:grid-cols-2">
                    {inlineResearchUpgradeIds.map((upgradeId) => {
                      const upgrade = RESEARCH_UPGRADES.find((item) => item.id === upgradeId)

                      if (!upgrade) {
                        return null
                      }

                      const isPurchased = selectors.isUpgradePurchased(upgrade.id)(gameState)
                      const visible = selectors.isUpgradeVisible(upgrade.id)(gameState)
                      const shortfall = selectors.upgradeCashShortfall(upgrade.id)(gameState)
                      const description = getResearchDescription(upgrade.id, upgrade.description)

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
                          disabledReason={!isPurchased && !visible ? description : !isPurchased && shortfall > 0 ? `Need ${formatCurrency(shortfall)} more cash.` : undefined}
                          onClick={() => buyUpgrade(upgrade.id)}
                        />
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        <Card className="terminal-panel rounded-2xl border-border/80 bg-card/92">
          <CardContent className="space-y-2 p-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-primary">What next</p>
              <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{progressionSummary.objective}</p>
            </div>
            <Separator className="bg-border/60" />
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Current target</p>
              <p className="text-[11px] leading-4 text-foreground">{progressionSummary.nextTarget}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
