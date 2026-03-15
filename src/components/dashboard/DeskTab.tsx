import { FlaskConical, Lock, MonitorCog, TrendingUp, Users } from 'lucide-react'
import { POWER_INFRASTRUCTURE } from '@/data/powerInfrastructure'
import { UNITS } from '@/data/units'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import type { BuyMode, DeskViewId, UnitId } from '@/types/game'
import { formatCurrency, formatNumber, formatPlainRate, formatRate } from '@/utils/formatting'
import { GAME_CONSTANTS } from '@/data/constants'
import { getProgressionSummary } from '@/utils/progression'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const BUY_MODES: BuyMode[] = [1, 5, 10, 'max']

const deskViewMeta: Array<{ id: DeskViewId; label: string; disabled?: boolean }> = [
  { id: 'trading', label: 'Trading' },
  { id: 'materials', label: 'Materials', disabled: true },
  { id: 'crypto', label: 'Crypto', disabled: true },
]

type UnitPanelConfig = {
  unitId: UnitId
  title: string
  purchaseLabel: string
  lockedReason: string
  totalLabel: string
  extraBadges?: string[]
}

function DeskUnitBuyControls({ unitId, activeMode, onChange }: { unitId: UnitId; activeMode: BuyMode; onChange: (_mode: BuyMode) => void }) {
  const label = unitId === 'juniorTrader'
    ? 'Junior'
    : unitId === 'seniorTrader'
      ? 'Senior'
      : unitId === 'tradingServer'
        ? 'Server'
        : unitId === 'tradingBot'
          ? 'Bot'
          : unitId === 'juniorResearchScientist'
            ? 'Jr Sci'
            : 'Sr Sci'

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
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

function UnitPanel({ config, incomeLabel, totalCost, nextCost, quantity, buyMode, disabled, unlocked, titleDescription, onBuy, onModeChange }: {
  config: UnitPanelConfig
  incomeLabel: string
  totalCost: number
  nextCost: number
  quantity: number
  buyMode: BuyMode
  disabled: boolean
  unlocked: boolean
  titleDescription: string
  onBuy: () => void
  onModeChange: (_mode: BuyMode) => void
}) {
  return (
    <div className={unlocked ? 'space-y-2 rounded-xl border border-border/80 bg-background/65 p-2' : 'space-y-2 rounded-xl border border-border/60 bg-background/45 p-2 opacity-60'}>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">{config.title}</h4>
          <Badge variant="outline" className={unlocked ? 'h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary' : 'h-5 rounded-md border-border/70 bg-background/50 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground'}>
            {unlocked ? (disabled ? 'Need cash' : 'Ready') : 'Locked'}
          </Badge>
          <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {quantity} owned
          </Badge>
          <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {config.totalLabel} {incomeLabel}
          </Badge>
          {config.extraBadges?.map((badge) => (
            <Badge key={badge} variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              {badge}
            </Badge>
          ))}
        </div>
        <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{unlocked ? titleDescription : config.lockedReason}</p>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-primary">{buyMode === 'max' ? 'Max' : `x${buyMode}`} costs {formatCurrency(totalCost || nextCost)}{buyMode !== 'max' ? ` | Next ${formatCurrency(nextCost)}` : ''}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <DeskUnitBuyControls unitId={config.unitId} activeMode={buyMode} onChange={onModeChange} />
        <Button
          title={!unlocked ? config.lockedReason : disabled ? 'Not enough cash for current buy mode.' : undefined}
          size="xs"
          variant={!unlocked || disabled ? 'outline' : 'default'}
          className={!unlocked || disabled ? 'rounded-md border-border/70 bg-background/40 text-muted-foreground uppercase tracking-[0.08em] opacity-100' : 'rounded-md uppercase tracking-[0.08em]'}
          disabled={!unlocked || disabled}
          onClick={onBuy}
        >
          {config.purchaseLabel} {formatCurrency(totalCost || nextCost)}
        </Button>
      </div>
    </div>
  )
}

export function DeskTab() {
  const gameState = useGameStore((state) => state)
  const makeTrade = useGameStore((state) => state.makeTrade)
  const buyUnit = useGameStore((state) => state.buyUnit)
  const buyPowerInfrastructure = useGameStore((state) => state.buyPowerInfrastructure)
  const activeDeskView = useGameStore((state) => state.ui.activeDeskView)
  const setActiveDeskView = useGameStore((state) => state.setActiveDeskView)
  const setUnitBuyMode = useGameStore((state) => state.setUnitBuyMode)
  const setPowerBuyMode = useGameStore((state) => state.setPowerBuyMode)
  const latestTradeFeedback = useGameStore((state) => state.latestTradeFeedback)
  const progressionSummary = getProgressionSummary(gameState)
  const cashPerClick = useGameStore(selectors.cashPerClick)
  const cashPerSecond = useGameStore(selectors.cashPerSecond)
  const juniorIncome = useGameStore(selectors.juniorIncome)
  const seniorIncome = useGameStore(selectors.seniorIncome)
  const tradingServerIncome = useGameStore(selectors.tradingServerIncome)
  const tradingBotIncome = useGameStore(selectors.botIncome)
  const researchPointsPerSecond = useGameStore(selectors.researchPointsPerSecond)
  const influencePerSecond = useGameStore(selectors.influencePerSecond)
  const powerUnlocked = useGameStore(selectors.powerInfrastructureUnlocked)
  const powerUsage = useGameStore(selectors.powerUsage)
  const powerCapacity = useGameStore(selectors.powerCapacity)
  const machineEfficiencyMultiplier = useGameStore(selectors.machineEfficiencyMultiplier)
  const tradingBotPowerUsage = useGameStore(selectors.tradingBotPowerUsage)
  const tradingServerPowerUsage = useGameStore(selectors.tradingServerPowerUsage)

  const nextJuniorTraderCost = useGameStore(selectors.nextJuniorTraderCost)
  const nextSeniorTraderCost = useGameStore(selectors.nextSeniorTraderCost)
  const nextTradingServerCost = useGameStore(selectors.nextTradingServerCost)
  const nextTradingBotCost = useGameStore(selectors.nextTradingBotCost)
  const nextJuniorScientistCost = useGameStore(selectors.nextJuniorResearchScientistCost)
  const nextSeniorScientistCost = useGameStore(selectors.nextSeniorResearchScientistCost)

  const juniorBuyMode = useGameStore(selectors.unitBuyMode('juniorTrader'))
  const seniorBuyMode = useGameStore(selectors.unitBuyMode('seniorTrader'))
  const serverBuyMode = useGameStore(selectors.unitBuyMode('tradingServer'))
  const botBuyMode = useGameStore(selectors.unitBuyMode('tradingBot'))
  const juniorScientistBuyMode = useGameStore(selectors.unitBuyMode('juniorResearchScientist'))
  const seniorScientistBuyMode = useGameStore(selectors.unitBuyMode('seniorResearchScientist'))

  const unitPanelConfigs: UnitPanelConfig[] = [
    {
      unitId: 'juniorTrader',
      title: 'Junior Trader',
      purchaseLabel: 'Hire',
      lockedReason: 'Unlock with Junior Hiring Program in Research.',
      totalLabel: 'Desk',
    },
    {
      unitId: 'seniorTrader',
      title: 'Senior Trader',
      purchaseLabel: 'Hire',
      lockedReason: `Unlock with Senior Recruitment after reaching 5 Juniors (${gameState.juniorTraderCount}/5).`,
      totalLabel: 'Desk',
    },
    {
      unitId: 'juniorResearchScientist',
      title: 'Junior Scientist',
      purchaseLabel: 'Hire',
      lockedReason: 'Unlock with Junior Hiring Program in Research.',
      totalLabel: 'Research',
      extraBadges: ['0.7 RP / sec', '0.02 inf / sec'],
    },
    {
      unitId: 'seniorResearchScientist',
      title: 'Senior Scientist',
      purchaseLabel: 'Hire',
      lockedReason: `Requires Senior Scientists research (${gameState.purchasedResearchTech.seniorScientists ? 'done' : 'not researched'}).`,
      totalLabel: 'Research',
      extraBadges: ['3.4 RP / sec', '0.10 inf / sec'],
    },
    {
      unitId: 'tradingBot',
      title: 'Trading Bot',
      purchaseLabel: 'Deploy',
      lockedReason: `Unlock with Algorithmic Trading after reaching 5 Seniors (${gameState.seniorTraderCount}/5).`,
      totalLabel: 'Machine',
      extraBadges: ['5 power each'],
    },
    {
      unitId: 'tradingServer',
      title: 'Trading Server',
      purchaseLabel: 'Deploy',
      lockedReason: `Requires Trading Servers research and at least 1 Data Centre (${gameState.dataCenterCount}/1).`,
      totalLabel: 'Machine',
      extraBadges: ['45 power each'],
    },
  ]

  const getUnitState = (unitId: UnitId) => {
    const unlocked = selectors.isUnitUnlocked(unitId)(gameState)
    const disabled = !selectors.canAffordUnitInCurrentMode(unitId)(gameState)
    const totalCost = selectors.bulkUnitTotalCost(unitId)(gameState)
    const quantity = selectors.bulkUnitQuantity(unitId)(gameState)

    if (unitId === 'juniorTrader') {
      return { unlocked, disabled, totalCost, quantity, nextCost: nextJuniorTraderCost, buyMode: juniorBuyMode, count: gameState.juniorTraderCount, totalIncome: formatRate(juniorIncome), description: UNITS.juniorTrader.description }
    }

    if (unitId === 'seniorTrader') {
      return { unlocked, disabled, totalCost, quantity, nextCost: nextSeniorTraderCost, buyMode: seniorBuyMode, count: gameState.seniorTraderCount, totalIncome: formatRate(seniorIncome), description: UNITS.seniorTrader.description }
    }

    if (unitId === 'tradingServer') {
      return { unlocked, disabled, totalCost, quantity, nextCost: nextTradingServerCost, buyMode: serverBuyMode, count: gameState.tradingServerCount, totalIncome: formatRate(tradingServerIncome), description: UNITS.tradingServer.description }
    }

    if (unitId === 'tradingBot') {
      return { unlocked, disabled, totalCost, quantity, nextCost: nextTradingBotCost, buyMode: botBuyMode, count: gameState.tradingBotCount, totalIncome: formatRate(tradingBotIncome), description: UNITS.tradingBot.description }
    }

    if (unitId === 'juniorResearchScientist') {
      return { unlocked, disabled, totalCost, quantity, nextCost: nextJuniorScientistCost, buyMode: juniorScientistBuyMode, count: gameState.juniorResearchScientistCount, totalIncome: `${formatNumber(gameState.juniorResearchScientistCount * 0.7, { decimalsBelowThreshold: 1 })} RP / sec`, description: UNITS.juniorResearchScientist.description }
    }

    return { unlocked, disabled, totalCost, quantity, nextCost: nextSeniorScientistCost, buyMode: seniorScientistBuyMode, count: gameState.seniorResearchScientistCount, totalIncome: `${formatNumber(gameState.seniorResearchScientistCount * 3.4, { decimalsBelowThreshold: 1 })} RP / sec`, description: UNITS.seniorResearchScientist.description }
  }

  const serverRoomBuyMode = useGameStore(selectors.powerBuyMode('serverRoom'))
  const dataCenterBuyMode = useGameStore(selectors.powerBuyMode('dataCenter'))
  const serverRoomCount = useGameStore(selectors.powerInfrastructureCount('serverRoom'))
  const dataCenterCount = useGameStore(selectors.powerInfrastructureCount('dataCenter'))
  const serverRoomTotalCost = useGameStore(selectors.bulkPowerInfrastructureTotalCost('serverRoom'))
  const dataCenterTotalCost = useGameStore(selectors.bulkPowerInfrastructureTotalCost('dataCenter'))
  const serverRoomQuantity = useGameStore(selectors.bulkPowerInfrastructureQuantity('serverRoom'))
  const dataCenterQuantity = useGameStore(selectors.bulkPowerInfrastructureQuantity('dataCenter'))
  const nextServerRoomCost = useGameStore(selectors.nextPowerInfrastructureCost('serverRoom'))
  const nextDataCenterCost = useGameStore(selectors.nextPowerInfrastructureCost('dataCenter'))
  const canAffordServerRoom = useGameStore(selectors.canAffordPowerInfrastructureInCurrentMode('serverRoom'))
  const canAffordDataCenter = useGameStore(selectors.canAffordPowerInfrastructureInCurrentMode('dataCenter'))

  return (
    <div className="h-full min-h-0 overflow-y-auto pr-1">
      <div className="space-y-2">
        <Tabs value={activeDeskView} onValueChange={(value) => setActiveDeskView(value as DeskViewId)} className="min-h-0 flex flex-col overflow-hidden">
          <TabsList className="grid h-auto w-full shrink-0 grid-cols-3 gap-1 rounded-xl border border-border/80 bg-card/92 p-1">
            {deskViewMeta.map((view) => (
              <TabsTrigger
                key={view.id}
                value={view.id}
                disabled={view.disabled}
                className="gap-1.5 py-2 text-[10px] uppercase tracking-[0.12em] data-active:bg-primary data-active:text-primary-foreground disabled:border-border/60 disabled:bg-[linear-gradient(180deg,rgba(50,50,50,0.55),rgba(28,28,28,0.55))] disabled:text-muted-foreground disabled:opacity-100"
              >
                {view.disabled ? <Lock className="size-3" /> : null}
                {view.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="terminal-panel space-y-2 rounded-xl border-border/80 bg-card/92 p-2.5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <h3 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">Trading Desk</h3>
              <Badge variant="outline" className="h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary">Always active</Badge>
              <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatCurrency(cashPerClick, cashPerClick < 100 ? 1 : 0)} / click</Badge>
              <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatRate(cashPerSecond)} passive</Badge>
              <Badge variant="outline" className="h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary">{progressionSummary.phaseLabel}</Badge>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">Manual trades fund the first hires and every next unlock.</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              {latestTradeFeedback ? <Badge className="rounded-md bg-primary px-1.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary-foreground">+{formatCurrency(latestTradeFeedback.amount, latestTradeFeedback.amount < 100 ? 1 : 0)}</Badge> : null}
            </div>
            <Button size="xs" className="rounded-md uppercase tracking-[0.08em]" onClick={makeTrade}>Trade</Button>
          </div>
        </div>

        <div className="terminal-panel space-y-2 rounded-xl border-border/80 bg-card/92 p-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <Users className="size-4 text-primary" />
            <h3 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">Traders</h3>
            <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatRate(juniorIncome + seniorIncome)}</Badge>
          </div>
          {unitPanelConfigs.filter((item) => item.unitId === 'juniorTrader' || item.unitId === 'seniorTrader').map((config) => {
            const state = getUnitState(config.unitId)
            return (
              <UnitPanel
                key={config.unitId}
                config={config}
                incomeLabel={state.totalIncome}
                totalCost={state.totalCost}
                nextCost={state.nextCost}
                quantity={state.count}
                buyMode={state.buyMode}
                disabled={state.disabled}
                unlocked={state.unlocked}
                titleDescription={state.description}
                onBuy={() => buyUnit(config.unitId, state.buyMode)}
                onModeChange={(mode) => setUnitBuyMode(config.unitId, mode)}
              />
            )
          })}
        </div>

        <div className={gameState.purchasedUpgrades.juniorHiringProgram ? 'terminal-panel space-y-2 rounded-xl border-border/80 bg-card/92 p-2.5' : 'terminal-panel space-y-2 rounded-xl border-border/60 bg-card/70 p-2.5 opacity-60'}>
          <div className="flex flex-wrap items-center gap-2">
            <FlaskConical className="size-4 text-primary" />
            <h3 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">Scientists</h3>
            <Badge variant="outline" className={gameState.purchasedUpgrades.juniorHiringProgram ? 'h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary' : 'h-5 rounded-md border-border/70 bg-background/50 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground'}>{gameState.purchasedUpgrades.juniorHiringProgram ? 'Unlocked' : 'Locked'}</Badge>
            {gameState.purchasedUpgrades.juniorHiringProgram ? (
              <>
                <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatPlainRate(researchPointsPerSecond)} research</Badge>
                <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatPlainRate(influencePerSecond)} influence</Badge>
              </>
            ) : null}
          </div>
          {unitPanelConfigs.filter((item) => item.unitId === 'juniorResearchScientist' || item.unitId === 'seniorResearchScientist').map((config) => {
            const state = getUnitState(config.unitId)
            return (
              <UnitPanel
                key={config.unitId}
                config={config}
                incomeLabel={state.totalIncome}
                totalCost={state.totalCost}
                nextCost={state.nextCost}
                quantity={state.count}
                buyMode={state.buyMode}
                disabled={state.disabled}
                unlocked={state.unlocked}
                titleDescription={state.description}
                onBuy={() => buyUnit(config.unitId, state.buyMode)}
                onModeChange={(mode) => setUnitBuyMode(config.unitId, mode)}
              />
            )
          })}
        </div>

        <div className="terminal-panel space-y-2 rounded-xl border-border/80 bg-card/92 p-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <MonitorCog className="size-4 text-primary" />
            <h3 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">Algorithmic Trading</h3>
            <Badge variant="outline" className={selectors.tradingBotsUnlocked(gameState) ? 'h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary' : 'h-5 rounded-md border-border/70 bg-background/50 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground'}>{selectors.tradingBotsUnlocked(gameState) ? 'Unlocked' : 'Locked'}</Badge>
            {selectors.tradingBotsUnlocked(gameState) ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatRate(tradingServerIncome + tradingBotIncome)}</Badge> : null}
            {selectors.tradingBotsUnlocked(gameState) ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Bots {formatNumber(tradingBotPowerUsage, { decimalsBelowThreshold: 1 })} power</Badge> : null}
            {selectors.tradingBotsUnlocked(gameState) ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Servers {formatNumber(tradingServerPowerUsage, { decimalsBelowThreshold: 1 })} power</Badge> : null}
          </div>
          {unitPanelConfigs.filter((item) => item.unitId === 'tradingBot' || item.unitId === 'tradingServer').map((config) => {
            const state = getUnitState(config.unitId)
            return (
              <UnitPanel
                key={config.unitId}
                config={config}
                incomeLabel={state.totalIncome}
                totalCost={state.totalCost}
                nextCost={state.nextCost}
                quantity={state.count}
                buyMode={state.buyMode}
                disabled={state.disabled}
                unlocked={state.unlocked}
                titleDescription={state.description}
                onBuy={() => buyUnit(config.unitId, state.buyMode)}
                onModeChange={(mode) => setUnitBuyMode(config.unitId, mode)}
              />
            )
          })}
        </div>

        <div className={powerUnlocked ? 'terminal-panel space-y-2 rounded-xl border-border/80 bg-card/92 p-2.5' : 'terminal-panel space-y-2 rounded-xl border-border/60 bg-card/70 p-2.5 opacity-60'}>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Lock className="size-4 text-primary" />
              <h3 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">Infrastructure</h3>
              <Badge variant="outline" className={powerUnlocked ? 'h-5 rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary' : 'h-5 rounded-md border-border/70 bg-background/50 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground'}>{powerUnlocked ? 'Unlocked' : 'Locked'}</Badge>
              {powerUnlocked ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{formatNumber(powerUsage, { decimalsBelowThreshold: 1 })} / {formatNumber(powerCapacity, { decimalsBelowThreshold: 1 })}</Badge> : null}
              {powerUnlocked ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Bots {formatNumber(tradingBotPowerUsage, { decimalsBelowThreshold: 1 })}</Badge> : null}
              {powerUnlocked ? <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Servers {formatNumber(tradingServerPowerUsage, { decimalsBelowThreshold: 1 })}</Badge> : null}
            </div>
            {!powerUnlocked ? <p className="mt-1 text-[11px] leading-4 text-muted-foreground">Unlock with Power Systems Engineering in Research.</p> : <p className="mt-1 text-[11px] leading-4 text-muted-foreground">Server Rooms cover early bot demand. Data Centres handle dense machine scaling and heavy trading server load.</p>}
            {powerUnlocked && machineEfficiencyMultiplier < 1 ? <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-amber-400">Over capacity - machine output {Math.round(machineEfficiencyMultiplier * 100)}%</p> : null}
          </div>

            {[
            { id: 'serverRoom' as const, count: serverRoomCount, buyMode: serverRoomBuyMode, totalCost: serverRoomTotalCost, quantity: serverRoomQuantity, nextCost: nextServerRoomCost, canAfford: canAffordServerRoom, visible: gameState.purchasedResearchTech.powerSystemsEngineering === true, lockedReason: 'Requires Power Systems Engineering research.' },
            { id: 'dataCenter' as const, count: dataCenterCount, buyMode: dataCenterBuyMode, totalCost: dataCenterTotalCost, quantity: dataCenterQuantity, nextCost: nextDataCenterCost, canAfford: canAffordDataCenter, visible: gameState.purchasedResearchTech.dataCenterSystems === true, lockedReason: 'Requires Data Centre Systems research.' },
          ].map((item) => {
            const definition = POWER_INFRASTRUCTURE[item.id]
            return (
              <div key={item.id} className={item.visible ? 'space-y-2 rounded-xl border border-border/80 bg-background/65 p-2' : 'space-y-2 rounded-xl border border-border/60 bg-background/45 p-2 opacity-60'}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">{definition.name}</h4>
                    <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{item.count} owned</Badge>
                    <Badge variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">+{definition.powerCapacity} cap</Badge>
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{item.visible ? definition.description : item.lockedReason}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-primary">{item.buyMode === 'max' ? 'Max' : `x${item.buyMode}`} costs {formatCurrency(item.totalCost || item.nextCost)}{item.buyMode !== 'max' ? ` | Next ${formatCurrency(item.nextCost)}` : ''}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Power</span>
                    {BUY_MODES.map((mode) => (
                      <Button key={`${item.id}-${String(mode)}`} size="xs" variant={item.buyMode === mode ? 'default' : 'outline'} className="rounded-md uppercase tracking-[0.12em]" onClick={() => setPowerBuyMode(item.id, mode)}>
                        {typeof mode === 'number' ? `x${mode}` : 'Max'}
                      </Button>
                    ))}
                  </div>
                  <Button title={!item.visible ? item.lockedReason : !item.canAfford ? 'Not enough cash for current buy mode.' : undefined} size="xs" variant={!item.visible || !powerUnlocked || !item.canAfford ? 'outline' : 'default'} className={!item.visible || !powerUnlocked || !item.canAfford ? 'rounded-md border-border/70 bg-background/40 text-muted-foreground uppercase tracking-[0.08em] opacity-100' : 'rounded-md uppercase tracking-[0.08em]'} disabled={!item.visible || !powerUnlocked || !item.canAfford} onClick={() => buyPowerInfrastructure(item.id, item.buyMode)}>
                    Build {formatCurrency(item.totalCost || item.nextCost)}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
