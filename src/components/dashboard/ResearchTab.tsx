import { BrainCircuit, Cpu, TrendingUp } from 'lucide-react'
import { RESEARCH_TECH } from '@/data/researchTech'
import { RESEARCH_UPGRADES } from '@/data/tabContent'
import { getUpgradeDefinition } from '@/data/upgrades'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import { formatCurrency, formatPlainRate } from '@/utils/formatting'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ActionRow, SummaryTile } from './DashboardPrimitives'

export function ResearchTab() {
  const gameState = useGameStore((state) => state)
  const buyUpgrade = useGameStore((state) => state.buyUpgrade)
  const buyResearchTech = useGameStore((state) => state.buyResearchTech)
  const researchPoints = useGameStore(selectors.researchPoints)
  const researchPointsPerSecond = useGameStore(selectors.researchPointsPerSecond)

  const purchasedTechCount = RESEARCH_TECH.filter((tech) => gameState.purchasedResearchTech[tech.id]).length
  const researchUnlocks = RESEARCH_UPGRADES.filter((upgrade) => upgrade.id === 'juniorHiringProgram' || upgrade.id === 'seniorRecruitment')
  const researchSystems = RESEARCH_UPGRADES.filter((upgrade) => upgrade.id !== 'juniorHiringProgram' && upgrade.id !== 'seniorRecruitment' && upgrade.id !== 'algorithmicTrading')

  const nextResearchTarget = !gameState.purchasedUpgrades.juniorHiringProgram
    ? 'Unlock Junior Hiring Program to open your first staffing tier.'
    : !gameState.purchasedResearchTech.seniorScientists
      ? 'Research Senior Scientists to open the second research staffing tier.'
      : !gameState.purchasedUpgrades.seniorRecruitment
        ? 'Push into Senior Recruitment once juniors are carrying the desk.'
        : !gameState.purchasedResearchTech.algorithmicTrading
          ? 'Build the scientist team on the Desk and unlock Algorithmic Trading with Research Points.'
          : !gameState.purchasedResearchTech.powerSystemsEngineering
            ? 'Use Research Points to unlock Infrastructure support systems.'
            : !gameState.purchasedResearchTech.dataCenterSystems
              ? 'Use Research Points to unlock Data Centres for heavier machine capacity.'
              : !gameState.purchasedResearchTech.tradingServers
                ? 'Research Trading Servers after Data Centre Systems to open the heavy machine tier.'
                : !gameState.purchasedResearchTech.regulatoryAffairs
                  ? 'Use Research Points to unlock Regulatory Affairs and late-game lobbying.'
                  : 'Use remaining research upgrades to multiply the full firm.'

  return (
    <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-[0.16em]">Research</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Unlocks and firm-wide systems</CardDescription>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-2">
        <div className="grid gap-2 md:grid-cols-3">
          <SummaryTile label="Research Points" value={Math.floor(researchPoints).toLocaleString()} icon={BrainCircuit} />
          <SummaryTile label="Research / Sec" value={formatPlainRate(researchPointsPerSecond)} icon={TrendingUp} />
          <SummaryTile label="Tech Unlocked" value={`${purchasedTechCount}/${RESEARCH_TECH.length}`} icon={Cpu} />
        </div>
        <div className="rounded-xl border border-primary/25 bg-primary/10 p-2 text-[11px] text-foreground">
          <span className="text-[10px] uppercase tracking-[0.18em] text-primary">Next research</span>
          <p className="mt-1 leading-4">{nextResearchTarget}</p>
        </div>
        <ScrollArea className="h-full min-h-0 pr-2">
          <div className="space-y-3">
            <div className="space-y-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-primary">Research tech</p>
                <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Spend Research Points to unlock advanced systems.</p>
              </div>
              {RESEARCH_TECH.map((tech) => {
                const isPurchased = selectors.isResearchTechPurchased(tech.id)(gameState)
                const visible = selectors.isResearchTechVisible(tech.id)(gameState)
                const shortfall = selectors.researchTechShortfall(tech.id)(gameState)
                const lockedReason = !visible && tech.id === 'algorithmicTrading'
                  ? `Requires 5 Senior Traders (${gameState.seniorTraderCount}/5).`
                  : !visible && tech.id === 'seniorScientists'
                    ? `Requires 5 Junior Scientists (${gameState.juniorResearchScientistCount}/5) or deeper research reserves.`
                    : !visible && tech.id === 'dataCenterSystems'
                      ? `Requires Power Systems Engineering and 5 Trading Bots (${gameState.tradingBotCount}/5).`
                      : !visible && tech.id === 'tradingServers'
                        ? `Requires Data Centre Systems and 5 Trading Bots (${gameState.tradingBotCount}/5).`
                  : undefined

                return (
                  <ActionRow
                    key={tech.id}
                    title={tech.name}
                    description={lockedReason ? `${tech.description} ${lockedReason}` : tech.description}
                    cost={`Cost ${tech.researchCost} RP`}
                    status={isPurchased ? 'Unlocked' : !visible ? 'Locked' : shortfall > 0 ? 'Need RP' : 'Ready'}
                    statusTone={isPurchased ? 'done' : !visible ? 'locked' : shortfall > 0 ? 'default' : 'ready'}
                    actionLabel={isPurchased ? 'Unlocked' : 'Research'}
                    disabled={!selectors.canAffordResearchTech(tech.id)(gameState)}
                    disabledReason={!isPurchased ? lockedReason ?? (shortfall > 0 ? `Need ${Math.ceil(shortfall)} more RP.` : undefined) : undefined}
                    onClick={() => buyResearchTech(tech.id)}
                  />
                )
              })}
            </div>

            <Separator className="bg-border/60" />

            <div className="space-y-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-primary">Cash research</p>
                <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Cash-funded research that supports the human desk and firm multipliers.</p>
              </div>
              {researchUnlocks.map((upgrade) => {
                const isPurchased = selectors.isUpgradePurchased(upgrade.id)(gameState)
                const visible = selectors.isUpgradeVisible(upgrade.id)(gameState)
                const shortfall = selectors.upgradeCashShortfall(upgrade.id)(gameState)
                const definition = getUpgradeDefinition(upgrade.id)
                const lockedReason = !visible && upgrade.id === 'seniorRecruitment'
                  ? `Requires 5 Junior Traders (${gameState.juniorTraderCount}/5).`
                  : !visible && upgrade.id === 'algorithmicTrading'
                    ? `Requires 5 Senior Traders (${gameState.seniorTraderCount}/5).`
                    : undefined
                const description = !visible && lockedReason
                  ? `${definition?.description} ${lockedReason}`
                  : upgrade.description

                return (
                  <ActionRow
                    key={upgrade.id}
                    title={upgrade.name}
                    description={description}
                    cost={`Cost ${formatCurrency(upgrade.cost)}`}
                    status={isPurchased ? 'Unlocked' : !visible ? 'Locked' : shortfall > 0 ? 'Need cash' : 'Ready'}
                    statusTone={isPurchased ? 'done' : !visible ? 'locked' : shortfall > 0 ? 'default' : 'ready'}
                    actionLabel={isPurchased ? 'Unlocked' : 'Research'}
                    disabled={!selectors.canAffordUpgrade(upgrade.id)(gameState)}
                    disabledReason={!isPurchased ? lockedReason ?? (shortfall > 0 ? `Need ${formatCurrency(shortfall)} more cash.` : undefined) : undefined}
                    onClick={() => buyUpgrade(upgrade.id)}
                  />
                )
              })}
            </div>
            <Separator className="bg-border/60" />
            <div className="space-y-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-primary">System upgrades</p>
                <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Firm-wide boosts that improve the whole economy.</p>
              </div>
              {researchSystems.map((upgrade) => {
                const isPurchased = selectors.isUpgradePurchased(upgrade.id)(gameState)
                const visible = selectors.isUpgradeVisible(upgrade.id)(gameState)
                const shortfall = selectors.upgradeCashShortfall(upgrade.id)(gameState)
                const lockedReason = !visible && upgrade.id === 'bullMarket'
                  ? 'Requires Trade Multiplier first.'
                  : undefined
                const description = lockedReason ? `${upgrade.description} ${lockedReason}` : upgrade.description

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
                    disabledReason={!isPurchased ? lockedReason ?? (shortfall > 0 ? `Need ${formatCurrency(shortfall)} more cash.` : undefined) : undefined}
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
