import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGameStore } from '../store/gameStore'

type ResetConfirmModalProps = {
  onClose: () => void
}

export function ResetConfirmModal({ onClose }: ResetConfirmModalProps) {
  const resetFoundation = useGameStore((state) => state.resetFoundation)
  const prestigeCount = useGameStore((state) => state.prestigeCount)
  const reputation = useGameStore((state) => state.reputation)
  const reputationSpent = useGameStore((state) => state.reputationSpent)

  return (
    <DialogContent className="max-w-lg border-border/80 bg-card/95 text-foreground">
      <DialogHeader>
        <DialogTitle>Confirm full reset</DialogTitle>
        <DialogDescription>
          This clears your current save, including cash, upgrades, research, prestige progress, and settings. This cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3 text-sm text-muted-foreground">
        <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
          Current profile: {prestigeCount} prestige, {reputation + reputationSpent} total reputation earned.
        </div>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-foreground">
          Use this only if you want to wipe the entire foundation and start from a fresh save slot.
        </div>
      </div>
      <DialogFooter className="border-border/70 bg-muted/20">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={() => {
            resetFoundation()
            onClose()
          }}
        >
          Delete save
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
