import { Landmark, Scale, TrendingUp, Vote } from 'lucide-react'
import { LOBBYING_POLICIES } from '@/data/lobbyingPolicies'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import type { LobbyingTrack } from '@/types/game'
import { formatNumber, formatPlainRate } from '@/utils/formatting'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ActionRow, SummaryTile } from './DashboardPrimitives'

const TRACK_ORDER: LobbyingTrack[] = ['labor', 'energy', 'market', 'technology']

const TRACK_LABELS: Record<LobbyingTrack, string> = {
  labor: 'Labor',
  energy: 'Energy',
  market: 'Market',
  technology: 'Technology',
}

const TRACK_DESCRIPTIONS: Record<LobbyingTrack, string> = {
  labor: 'Lower staffing costs and improve human output.',
  energy: 'Stabilize machine power costs, capacity, and usage.',
  market: 'Push wider profit and manual trade policy wins.',
  technology: 'Accelerate bot deployment and machine efficiency.',
}

export function LobbyingTab() {
  const gameState = useGameStore((state) => state)
  const buyLobbyingPolicy = useGameStore((state) => state.buyLobbyingPolicy)
  const influence = useGameStore(selectors.influence)
  const influencePerSecond = useGameStore(selectors.influencePerSecond)
  const purchasedPolicyCount = useGameStore(selectors.purchasedPolicyCount)

  const nextPolicy = LOBBYING_POLICIES.find((policy) => !gameState.purchasedPolicies[policy.id])
  const nextLobbyingTarget = nextPolicy
    ? `${nextPolicy.name} is the next available policy for ${nextPolicy.influenceCost} influence.`
    : 'Every current policy has been passed. Influence can bank for future revisions.'

  return (
    <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-[0.16em]">Lobbying</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Institutional policy strategy and influence spending</CardDescription>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-2">
        <div className="grid gap-2 md:grid-cols-3">
          <SummaryTile label="Influence" value={formatNumber(influence, { decimalsBelowThreshold: influence < 100 ? 1 : 0 })} icon={Landmark} />
          <SummaryTile label="Influence / Sec" value={formatPlainRate(influencePerSecond)} icon={TrendingUp} />
          <SummaryTile label="Policies Passed" value={`${purchasedPolicyCount}/${LOBBYING_POLICIES.length}`} icon={Vote} />
        </div>
        <div className="rounded-xl border border-primary/25 bg-primary/10 p-2 text-[11px] text-foreground">
          <span className="text-[10px] uppercase tracking-[0.18em] text-primary">Next policy</span>
          <p className="mt-1 leading-4">{nextLobbyingTarget}</p>
        </div>
        <ScrollArea className="h-full min-h-0 pr-2">
          <div className="space-y-3">
            {TRACK_ORDER.map((track, index) => (
              <div key={track} className="space-y-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Scale className="size-3.5 text-primary" />
                    <p className="text-[10px] uppercase tracking-[0.24em] text-primary">{TRACK_LABELS[track]}</p>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{TRACK_DESCRIPTIONS[track]}</p>
                </div>

                {LOBBYING_POLICIES.filter((policy) => policy.track === track).map((policy) => {
                  const isPurchased = selectors.isPolicyPurchased(policy.id)(gameState)
                  const shortfall = selectors.policyInfluenceShortfall(policy.id)(gameState)

                  return (
                    <ActionRow
                      key={policy.id}
                      title={policy.name}
                      description={policy.description}
                      cost={`Cost ${policy.influenceCost} influence`}
                      status={isPurchased ? 'Passed' : shortfall > 0 ? 'Need influence' : 'Ready'}
                      statusTone={isPurchased ? 'done' : shortfall > 0 ? 'default' : 'ready'}
                      actionLabel={isPurchased ? 'Passed' : 'Pass policy'}
                      disabled={!selectors.canAffordPolicy(policy.id)(gameState)}
                      disabledReason={!isPurchased && shortfall > 0 ? `Need ${formatNumber(shortfall, { decimalsBelowThreshold: shortfall < 10 ? 2 : 1 })} more influence.` : undefined}
                      onClick={() => buyLobbyingPolicy(policy.id)}
                    />
                  )
                })}

                {index < TRACK_ORDER.length - 1 ? <Separator className="bg-border/60" /> : null}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
