import { useEffect } from 'react'
import { Trophy } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import { playMilestoneChime } from '@/utils/audio'
import { getMilestoneNotificationLabel } from '@/utils/milestones'

export function MilestoneNotifications() {
  const milestoneUnlockQueue = useGameStore((state) => state.milestoneUnlockQueue)
  const dismissMilestoneNotification = useGameStore((state) => state.dismissMilestoneNotification)
  const gameState = useGameStore((state) => state)
  const currentMilestoneId = milestoneUnlockQueue[0] ?? null

  useEffect(() => {
    if (!currentMilestoneId) {
      return
    }

    playMilestoneChime()

    const timeout = window.setTimeout(() => {
      dismissMilestoneNotification()
    }, 3200)

    return () => window.clearTimeout(timeout)
  }, [currentMilestoneId, dismissMilestoneNotification])

  if (!currentMilestoneId) {
    return null
  }

  const rewardSummary = selectors.milestoneRewardSummary(currentMilestoneId)(gameState)

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[70] w-[min(360px,calc(100%-2rem))] rounded-xl border border-emerald-500/50 bg-[linear-gradient(180deg,rgba(6,78,59,0.96),rgba(6,46,29,0.96))] p-3 text-emerald-50 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
      <div className="flex items-start gap-2">
        <div className="rounded-lg border border-emerald-400/40 bg-emerald-400/10 p-2">
          <Trophy className="size-4 text-emerald-200" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-200/85">Milestone Unlocked</p>
          <p className="mt-1 text-sm font-semibold text-emerald-50">{getMilestoneNotificationLabel(currentMilestoneId)}</p>
          {rewardSummary ? <p className="mt-1 text-[11px] leading-4 text-emerald-100/80">Reward: {rewardSummary}</p> : null}
        </div>
      </div>
    </div>
  )
}
