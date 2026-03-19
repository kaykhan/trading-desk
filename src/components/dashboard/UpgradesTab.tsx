import { UPGRADE_GROUPS } from '@/data/tabContent'
import { UPGRADE_GROUP_DESCRIPTIONS, UPGRADE_GROUP_LABELS } from '@/data/upgrades'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import { formatCurrency } from '@/utils/formatting'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ActionRow } from './DashboardPrimitives'

function getUpgradeLockedReason(upgradeId: string, state: ReturnType<typeof useGameStore.getState>) {
  switch (upgradeId) {
    case 'tradeShortcuts':
      return `Requires at least 1 Intern (${state.internCount}/1).`
    case 'premiumDataFeed':
    case 'deskAnalytics':
      return `Requires at least 1 Junior Trader (${state.juniorTraderCount}/1).`
    case 'crossDeskCoordination':
      return `Requires at least 1 Senior Trader (${state.seniorTraderCount}/1).`
    case 'structuredOnboarding':
      return `Requires at least 5 Interns and 2 Junior Traders (${state.internCount}/5, ${state.juniorTraderCount}/2).`
    case 'labAutomation':
      return `Requires at least 1 Junior Scientist (${state.juniorResearchScientistCount}/1).`
    case 'researchGrants':
      return `Requires at least 1 Senior Scientist (${state.seniorResearchScientistCount}/1).`
    case 'sharedResearchLibrary':
      return `Requires 2 Junior Scientists and 1 Senior Scientist (${state.juniorResearchScientistCount}/2, ${state.seniorResearchScientistCount}/1).`
    case 'backtestingSuite':
      return 'Requires active research production and Junior Scientists research.'
    case 'institutionalResearchNetwork':
      return 'Requires at least 4 total Scientists.'
    case 'crossDisciplinaryModels':
      return 'Requires at least 6 total Scientists.'
    case 'propDeskOperatingModel':
      return `Requires at least 1 Prop Desk (${state.propDeskCount}/1).`
    case 'institutionalClientBook':
      return `Requires at least 1 Institutional Desk (${state.institutionalDeskCount}/1).`
    case 'fundStrategyCommittee':
      return `Requires at least 1 Hedge Fund (${state.hedgeFundCount}/1).`
    case 'globalDistributionNetwork':
      return `Requires at least 1 Investment Firm (${state.investmentFirmCount}/1).`
    case 'institutionalOperatingStandards':
      return `Requires at least 1 Prop Desk and 1 Institutional Desk (${state.propDeskCount}/1, ${state.institutionalDeskCount}/1).`
    case 'mandateAlignmentFramework':
      return 'Requires at least 2 institution units with active mandates.'
    case 'policyAnalysisDesk':
      return 'Requires active Influence generation.'
    case 'regulatoryCounsel':
      return 'Requires visible Compliance.'
    case 'donorNetwork':
      return `Requires active Influence generation and at least 1 purchased lobbying policy (${Object.values(state.purchasedPolicies).filter(Boolean).length}/1).`
    case 'complianceSoftwareSuite':
      return 'Requires visible Compliance and active institutional activity.'
    case 'governmentRelationsOffice':
      return `Requires active lobbying and at least 3 purchased policies (${Object.values(state.purchasedPolicies).filter(Boolean).length}/3).`
    case 'filingAutomation':
      return 'Requires visible Compliance and active automation.'
    case 'systematicExecution':
    case 'botTelemetry':
      return 'Requires at least 1 Quant Trader or 1 Rule-Based Bot.'
    case 'executionRoutingStack':
      return `Requires at least 2 Rule-Based Bots (${state.ruleBasedBotCount}/2).`
    case 'modelServingCluster':
      return `Requires at least 1 ML Bot (${state.mlTradingBotCount}/1).`
    case 'inferenceBatching':
      return `Requires at least 2 ML Bots (${state.mlTradingBotCount}/2).`
    case 'aiRiskStack':
      return `Requires at least 1 AI Bot (${state.aiTradingBotCount}/1).`
    case 'rackStacking':
      return `Requires at least 1 Server Rack (${state.serverRackCount}/1).`
    case 'roomScaleout':
      return `Requires at least 1 Server Room (${state.serverRoomCount}/1).`
    case 'dataCenterFabric':
      return `Requires at least 1 Data Centre (${state.dataCenterCount}/1).`
    case 'cloudBurstContracts':
      return `Requires at least 1 Cloud Infrastructure (${state.cloudComputeCount}/1).`
    case 'coolingSystems':
      return 'Requires active machine systems and owned infrastructure.'
    case 'powerDistribution':
      return 'Requires at least 1 Server Rack and active machine systems.'
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
            {UPGRADE_GROUPS.map((section, index) => {
              return (
                <div key={section.group} className="space-y-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-primary">{UPGRADE_GROUP_LABELS[section.group]}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{UPGRADE_GROUP_DESCRIPTIONS[section.group]}</p>
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
                        statusTone={isPurchased ? 'done' : !visible ? 'locked' : shortfall > 0 ? 'warning' : 'ready'}
                        actionLabel={isPurchased ? 'Purchased' : !visible ? 'Locked' : 'Upgrade'}
                        disabled={!selectors.canAffordUpgrade(upgrade.id)(gameState)}
                        disabledReason={!isPurchased ? lockedReason ?? (shortfall > 0 ? `Need ${formatCurrency(shortfall)} more cash.` : undefined) : undefined}
                        onClick={() => buyUpgrade(upgrade.id)}
                      />
                    )
                  }) : <div className="rounded-xl border border-border/70 bg-background/45 p-2 text-[11px] text-muted-foreground">No upgrades visible yet for this system.</div>}
                  {index < UPGRADE_GROUPS.length - 1 ? <Separator className="bg-border/60" /> : null}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
