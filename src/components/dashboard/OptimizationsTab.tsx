import { REPEATABLE_UPGRADES } from '@/data/repeatableUpgrades'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import type { RepeatableUpgradeDefinition, RepeatableUpgradeId } from '@/types/game'
import { formatCurrency, formatNumber } from '@/utils/formatting'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { PurchaseCard } from './DashboardPrimitives'
const BUY_MODES = [1, 5, 10, 'max'] as const

const OPTIMIZATION_SECTIONS = [
  {
    title: 'Operations Optimizations',
    description: 'Cash-funded repeatables for purchasable desk units and power infrastructure.',
    upgrades: REPEATABLE_UPGRADES.filter((upgrade) => upgrade.family === 'operations'),
  },
  {
    title: 'Research Optimizations',
    description: 'RP-funded repeatables for modeling, scientist throughput, and machine efficiency.',
    upgrades: REPEATABLE_UPGRADES.filter((upgrade) => upgrade.family === 'research'),
  },
  {
    title: 'Influence Optimizations',
    description: 'Influence-funded repeatables that reduce purchase costs instead of increasing output.',
    upgrades: REPEATABLE_UPGRADES.filter((upgrade) => upgrade.family === 'influence'),
  },
] as const

function getOptimizationLockedReason(upgrade: RepeatableUpgradeDefinition, state: ReturnType<typeof useGameStore.getState>) {
  switch (upgrade.id) {
    case 'juniorTraderTraining':
    case 'behavioralModeling':
      return `Requires at least 1 Junior Trader (${state.juniorTraderCount}/1).`
    case 'manualTradeRefinement':
      return 'Requires Better Terminal first.'
    case 'internDeskTraining':
    case 'internPlaybooks':
      return state.purchasedUpgrades.juniorTraderProgram === true
        ? `Requires at least 1 Intern (${state.internCount}/1).`
        : 'Requires Junior Trader Program first.'
    case 'internLabTraining':
    case 'internResearchNotes':
      return state.purchasedResearchTech.juniorScientists === true
        ? `Requires at least 1 Intern Scientist (${state.internResearchScientistCount}/1).`
        : 'Requires Junior Scientists research first.'
    case 'politicalNetworking':
    case 'constituencyResearch':
    case 'talentHeadhunters':
    case 'researchEndowments':
    case 'patronageMachine':
      return state.purchasedResearchTech.regulatoryAffairs === true
        ? `Requires at least 1 Senator (${state.juniorPoliticianCount}/1).`
        : 'Requires Regulatory Affairs research first.'
    case 'automationSubsidies':
      return state.purchasedResearchTech.regulatoryAffairs === true
        ? state.purchasedResearchTech.algorithmicTrading === true
          ? `Requires at least 1 Rule-Based Bot (${state.ruleBasedBotCount}/1).`
          : 'Requires Algorithmic Trading research first.'
        : 'Requires Regulatory Affairs research first.'
    case 'infrastructureGrants':
      return state.purchasedResearchTech.regulatoryAffairs === true
        ? state.purchasedResearchTech.powerSystemsEngineering === true
          ? `Requires at least 1 Server Rack or Server Room (${state.serverRackCount + state.serverRoomCount}/1).`
          : 'Requires Power Systems Engineering research first.'
        : 'Requires Regulatory Affairs research first.'
    case 'seniorDeskPerformance':
    case 'decisionSystems':
      return state.purchasedUpgrades.seniorRecruitment === true
        ? `Requires at least 1 Senior Trader (${state.seniorTraderCount}/1).`
        : 'Requires Senior Recruitment first.'
    case 'propDeskScaling':
    case 'propDeskResearch':
      return state.purchasedResearchTech.propDeskOperations === true
        ? `Requires at least 1 Prop Desk (${state.propDeskCount}/1).`
        : 'Requires Prop Desk Operations research first.'
    case 'institutionalDeskCoordination':
    case 'institutionalAnalytics':
      return state.purchasedResearchTech.institutionalDesks === true
        ? `Requires at least 1 Institutional Desk (${state.institutionalDeskCount}/1).`
        : 'Requires Institutional Desks research first.'
    case 'hedgeFundExecution':
    case 'hedgeFundResearch':
      return state.purchasedResearchTech.hedgeFundStrategies === true
        ? `Requires at least 1 Hedge Fund (${state.hedgeFundCount}/1).`
        : 'Requires Hedge Fund Strategies research first.'
    case 'investmentFirmOperations':
    case 'firmWideSystems':
      return state.purchasedResearchTech.investmentFirms === true
        ? `Requires at least 1 Investment Firm (${state.investmentFirmCount}/1).`
        : 'Requires Investment Firms research first.'
    case 'ruleBasedExecution':
    case 'signalRefinement':
    case 'energyOptimization':
      return state.purchasedResearchTech.algorithmicTrading === true
        ? `Requires at least 1 Rule-Based Bot (${state.ruleBasedBotCount}/1).`
        : 'Requires Algorithmic Trading research first.'
    case 'mlModelDeployment':
    case 'mlFeaturePipelines':
      return state.purchasedResearchTech.dataCenterSystems === true
        ? `Requires at least 1 ML Trading Bot (${state.mlTradingBotCount}/1).`
        : 'Requires Data Centre Systems research first.'
    case 'aiClusterOrchestration':
    case 'aiTrainingSystems':
    case 'serverEfficiency':
      return state.purchasedResearchTech.aiTradingSystems === true
        ? `Requires at least 1 AI Trading Bot (${state.aiTradingBotCount}/1).`
        : 'Requires AI Trading Systems research first.'
    case 'juniorLabProtocols':
    case 'juniorLabOptimization':
      return `Requires at least 1 Junior Scientist (${state.juniorResearchScientistCount}/1).`
    case 'seniorLabMethods':
    case 'seniorLabOptimization':
      return state.purchasedResearchTech.seniorScientists === true
        ? `Requires at least 1 Senior Scientist (${state.seniorResearchScientistCount}/1).`
        : 'Requires Senior Scientists research first.'
    case 'rackDensity':
      return `Requires at least 1 Server Rack (${state.serverRackCount}/1).`
    case 'serverRoomExpansion':
      return state.purchasedResearchTech.powerSystemsEngineering === true
        ? `Requires at least 1 Server Room (${state.serverRoomCount}/1).`
        : 'Requires Power Systems Engineering research first.'
    case 'dataCenterOverbuild':
      return state.purchasedResearchTech.dataCenterSystems === true
        ? `Requires at least 1 Data Centre (${state.dataCenterCount}/1).`
        : 'Requires Data Centre Systems research first.'
    case 'cloudFailover':
      return state.purchasedResearchTech.aiTradingSystems === true
        ? `Requires at least 1 Cloud Infrastructure (${state.cloudComputeCount}/1).`
        : 'Requires AI Trading Systems research first.'
    default:
      return 'Unlock the related system first.'
  }
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(value * 100 < 10 ? 1 : 0)}%`
}

function getEffectPreview(upgrade: RepeatableUpgradeDefinition, rank: number) {
  const currentValue = rank * upgrade.effectPerRank
  const nextValue = (rank + 1) * upgrade.effectPerRank

  if (upgrade.effectType === 'powerUsageReduction') {
    return `Power reduction ${formatPercent(currentValue)} -> ${formatPercent(nextValue)}`
  }

  if (upgrade.effectType === 'powerCapacity') {
    return `Capacity bonus ${formatPercent(currentValue)} -> ${formatPercent(nextValue)}`
  }

  if (upgrade.effectType === 'costReduction') {
    return `Cost reduction ${formatPercent(currentValue)} -> ${formatPercent(nextValue)}`
  }

  if (upgrade.id === 'manualTradeRefinement') {
    return `Manual trade bonus ${formatPercent(currentValue)} -> ${formatPercent(nextValue)}`
  }

    if (upgrade.id === 'politicalNetworking' || upgrade.id === 'constituencyResearch') {
      return `Influence bonus ${formatPercent(currentValue)} -> ${formatPercent(nextValue)}`
    }

  return `Output bonus ${formatPercent(currentValue)} -> ${formatPercent(nextValue)}`
}

export function OptimizationsTab() {
  const gameState = useGameStore((state) => state)
  const buyRepeatableUpgrade = useGameStore((state) => state.buyRepeatableUpgrade)
  const setRepeatableUpgradeBuyMode = useGameStore((state) => state.setRepeatableUpgradeBuyMode)

  return (
    <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-[0.16em]">Optimizations</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Repeatable scaling for all purchasable units, scientists, machine systems, and infrastructure</CardDescription>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-2">
        <ScrollArea className="h-full min-h-0 pr-2">
          <div className="space-y-3">
            {OPTIMIZATION_SECTIONS.map((section, index) => (
              <div key={section.title} className="space-y-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-primary">{section.title}</p>
                  <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{section.description}</p>
                </div>
                {section.upgrades.map((upgrade) => {
                  const rank = selectors.repeatableUpgradeRank(upgrade.id)(gameState)
                  const cost = selectors.bulkRepeatableUpgradeTotalCost(upgrade.id)(gameState)
                  const quantity = selectors.bulkRepeatableUpgradeQuantity(upgrade.id)(gameState)
                  const buyMode = selectors.repeatableUpgradeBuyMode(upgrade.id)(gameState)
                  const isVisible = selectors.isRepeatableUpgradeVisible(upgrade.id)(gameState)
                  const isUnlocked = selectors.isRepeatableUpgradeUnlocked(upgrade.id)(gameState)
                  const shortfall = selectors.repeatableUpgradeShortfall(upgrade.id)(gameState)
                  const canAfford = selectors.canAffordRepeatableUpgrade(upgrade.id)(gameState)
                  const currencyLabel = upgrade.currency === 'cash' ? formatCurrency(cost) : upgrade.currency === 'researchPoints' ? `${formatNumber(cost)} RP` : `${formatNumber(cost, { decimalsBelowThreshold: 2 })} inf`
                  const lockReason = !isVisible || !isUnlocked ? getOptimizationLockedReason(upgrade, gameState) : undefined
                  const purchaseLabel = buyMode === 'max' ? `Max (${quantity})` : `x${quantity}`
                  const disabledReason = lockReason ?? (shortfall > 0 ? `Need ${upgrade.currency === 'cash' ? formatCurrency(shortfall) : upgrade.currency === 'researchPoints' ? `${formatNumber(shortfall)} RP` : `${formatNumber(shortfall, { decimalsBelowThreshold: 2 })} inf`} more.` : undefined)

                  return (
                    <PurchaseCard
                      key={upgrade.id}
                      title={`${upgrade.name} - Rank ${rank}`}
                      description={`${upgrade.description} ${getEffectPreview(upgrade, rank)}`}
                      cost={isVisible && isUnlocked ? `${purchaseLabel} costs ${currencyLabel}` : undefined}
                      status={!isVisible ? 'Future' : !isUnlocked ? 'Locked' : canAfford ? 'Ready' : 'Need funds'}
                      statusTone={!isVisible || !isUnlocked ? 'locked' : canAfford ? 'ready' : 'default'}
                      actionLabel={!isVisible || !isUnlocked ? 'Locked' : currencyLabel}
                      disabled={!canAfford}
                      disabledReason={disabledReason}
                      onClick={() => buyRepeatableUpgrade(upgrade.id as RepeatableUpgradeId)}
                      footer={
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
                      }
                    />
                  )
                })}
                {index < OPTIMIZATION_SECTIONS.length - 1 ? <Separator className="bg-border/60" /> : null}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
