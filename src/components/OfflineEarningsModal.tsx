import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useGameStore } from '../store/gameStore'
import { formatCurrency } from '../utils/formatting'

type OfflineEarningsModalProps = {
  onClose: () => void
}

export function OfflineEarningsModal({ onClose }: OfflineEarningsModalProps) {
  const offlineSummary = useGameStore((state) => state.offlineSummary)

  return (
    <DialogContent className="max-w-lg border-border/80 bg-card/95 text-foreground">
      <DialogHeader>
        <DialogTitle>Offline earnings</DialogTitle>
        <DialogDescription>Your desk kept trading while you were away, up to the capped trading-hours limit.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-3 text-sm text-muted-foreground">
        <div className="rounded-2xl border border-border/60 bg-background/40 p-4">Time away: {offlineSummary ? `${offlineSummary.secondsAway.toLocaleString()} sec` : '0 sec'}</div>
        <div className="rounded-2xl border border-border/60 bg-background/40 p-4">Capped time counted: {offlineSummary ? `${offlineSummary.appliedSeconds.toLocaleString()} sec` : '0 sec'}</div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-foreground">Cash earned offline: {offlineSummary ? formatCurrency(offlineSummary.cashEarned, offlineSummary.cashEarned < 100 ? 1 : 0) : '$0'}</div>
      </div>
      <div className="flex justify-end">
        <Button type="button" variant="outline" onClick={onClose}>Close</Button>
      </div>
    </DialogContent>
  )
}
