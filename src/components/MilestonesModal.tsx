import { useState } from 'react'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import { MILESTONE_CATEGORY_LABELS } from '@/data/milestones'
import { getNextRecommendedMilestoneSummary } from '@/utils/milestones'

function getCardTone(unlocked: boolean) {
  return unlocked
    ? 'border-emerald-500/45 bg-[linear-gradient(180deg,rgba(18,64,46,0.95),rgba(10,36,26,0.98))] shadow-[0_10px_30px_rgba(0,0,0,0.25)]'
    : 'border-border/80 bg-[linear-gradient(180deg,rgba(24,24,24,0.92),rgba(16,16,16,0.98))]'
}

export function MilestonesModal() {
  const gameState = useGameStore((state) => state)
  const unlockedMilestoneCount = useGameStore(selectors.unlockedMilestoneCount)
  const totalMilestoneCount = useGameStore(selectors.totalMilestoneCount)
  const nextRecommendedMilestoneSummary = getNextRecommendedMilestoneSummary(gameState)
  const pageCount = useGameStore(selectors.milestonePageCount)
  const [page, setPage] = useState(0)
  const safePage = Math.min(page, Math.max(0, pageCount - 1))
  const milestones = selectors.milestonesForPage(safePage)(gameState)

  return (
    <DialogContent className="max-w-[min(1440px,calc(100%-1.5rem))] rounded-2xl border border-border/90 bg-[rgba(18,18,18,0.98)] p-0 text-foreground shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:max-w-[min(1440px,calc(100%-1.5rem))]">
      <DialogHeader className="border-b border-border/80 p-4 pb-3">
        <DialogTitle className="text-base uppercase tracking-[0.16em]">Milestones</DialogTitle>
        <DialogDescription className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {unlockedMilestoneCount} / {totalMilestoneCount} unlocked
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-[min(84vh,860px)] overflow-y-auto bg-[linear-gradient(180deg,rgba(24,24,24,0.98),rgba(16,16,16,1))] p-4">
        <div className="mb-3 space-y-3">
          <div className="flex items-center justify-end gap-2">
            <Button size="xs" variant="outline" className="rounded-md uppercase tracking-[0.12em]" disabled={page <= 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>
              Prev
            </Button>
            <Badge variant="outline" className="rounded-md border-primary/40 bg-primary/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-primary">
              Page {safePage + 1} / {pageCount}
            </Badge>
            <Button size="xs" variant="outline" className="rounded-md uppercase tracking-[0.12em]" disabled={safePage >= pageCount - 1} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}>
              Next
            </Button>
          </div>
          <div className="rounded-xl border border-emerald-500/15 bg-[linear-gradient(180deg,rgba(20,32,24,0.95),rgba(12,18,14,0.98))] p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Recommended next target</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{nextRecommendedMilestoneSummary ? nextRecommendedMilestoneSummary.name : 'All milestones unlocked.'}</p>
            {nextRecommendedMilestoneSummary ? <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{nextRecommendedMilestoneSummary.description}</p> : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {nextRecommendedMilestoneSummary ? <Badge variant="outline" className="rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary">{nextRecommendedMilestoneSummary.categoryLabel}</Badge> : null}
              {nextRecommendedMilestoneSummary?.progressLabel ? <Badge variant="outline" className="rounded-md border-emerald-500/40 bg-emerald-500/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-emerald-300">{nextRecommendedMilestoneSummary.progressLabel}</Badge> : null}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {milestones.map((milestone) => {
            const unlocked = gameState.unlockedMilestones[milestone.id] === true
            const rewardSummary = selectors.milestoneRewardSummary(milestone.id)(gameState)
            const progressLabel = selectors.milestoneProgressLabel(milestone.id)(gameState)
            const recommended = nextRecommendedMilestoneSummary?.name === milestone.name

            return (
              <div key={milestone.id} className={`rounded-xl border p-3 ${getCardTone(unlocked)} ${recommended ? 'ring-1 ring-primary/40' : ''}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={`rounded-md px-1.5 text-[10px] uppercase tracking-[0.12em] ${unlocked ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300' : 'border-border/80 bg-background/60 text-muted-foreground'}`}>
                      {unlocked ? 'Unlocked' : 'Locked'}
                    </Badge>
                    <Badge variant="outline" className="rounded-md border-primary/40 bg-primary/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-primary">
                      {MILESTONE_CATEGORY_LABELS[milestone.category]}
                    </Badge>
                  </div>
                  {recommended ? <Badge variant="outline" className="rounded-md border-amber-400/40 bg-amber-400/10 px-1.5 text-[10px] uppercase tracking-[0.12em] text-amber-200">Recommended</Badge> : null}
                </div>
                <div className="mt-2">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">#{milestone.displayOrder}</p>
                  <p className="mt-1 text-[13px] font-semibold text-foreground">{milestone.name}</p>
                </div>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{milestone.description}</p>
                <div className="mt-3 space-y-2 border-t border-border/60 pt-2">
                  {progressLabel ? (
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Progress</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-primary/85">{progressLabel}</p>
                    </div>
                  ) : null}
                  {rewardSummary ? (
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground">Reward</p>
                      <p className="mt-1 text-[10px] leading-4 text-foreground/85">{rewardSummary}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DialogContent>
  )
}
