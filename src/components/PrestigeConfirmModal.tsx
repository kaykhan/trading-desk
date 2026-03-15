import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useGameStore } from '../store/gameStore'
import { selectors } from '../store/selectors'
import { formatCurrency } from '../utils/formatting'
import { PRESTIGE_UPGRADES } from '@/data/prestigeUpgrades'

type PrestigeConfirmModalProps = {
  onClose: () => void
}

export function PrestigeConfirmModal({ onClose }: PrestigeConfirmModalProps) {
  const prestigeReset = useGameStore((state) => state.prestigeReset)
  const lifetimeCashEarned = useGameStore((state) => state.lifetimeCashEarned)
  const prestigePreview = useGameStore(selectors.prestigeGainPreview)
  const canPrestigeNow = useGameStore(selectors.canPrestige)
  const gameState = useGameStore((state) => state)
  const plannedPrestigeCost = useGameStore(selectors.plannedPrestigeCost)
  const plannedPrestigeAvailable = useGameStore(selectors.plannedPrestigeAvailable)
  const plannedPrestigeRemaining = useGameStore(selectors.plannedPrestigeRemaining)
  const plannedUpgrades = PRESTIGE_UPGRADES
    .map((upgrade) => ({
      name: upgrade.name,
      quantity: gameState.ui.prestigePurchasePlan[upgrade.id] ?? 0,
    }))
    .filter((upgrade) => upgrade.quantity > 0)

  return (
    <DialogContent className="max-w-lg border-border/80 bg-card/95 text-foreground">
      <DialogHeader>
        <DialogTitle>Confirm prestige reset</DialogTitle>
        <DialogDescription>
          This resets cash, units, and standard upgrades, but keeps Reputation and all prestige upgrades.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-3 text-sm text-muted-foreground">
        <div className="rounded-2xl border border-border/60 bg-background/40 p-4">Lifetime cash this run: {formatCurrency(lifetimeCashEarned, lifetimeCashEarned < 100 ? 1 : 0)}</div>
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-foreground">Projected Reputation gain: {prestigePreview}</div>
        <div className="rounded-2xl border border-border/60 bg-background/40 p-4">Reputation after reset: {plannedPrestigeAvailable}</div>
        <div className="rounded-2xl border border-border/60 bg-background/40 p-4">Planned spend: {plannedPrestigeCost} | Remaining: {plannedPrestigeRemaining}</div>
        <div className="rounded-2xl border border-border/60 bg-background/40 p-4">Planned purchases: {plannedUpgrades.length > 0 ? plannedUpgrades.map((upgrade) => `${upgrade.name} x${upgrade.quantity}`).join(', ') : 'none'}</div>
        {!canPrestigeNow ? <div className="rounded-2xl border border-border/60 bg-background/40 p-4">Prestige stays locked until you have at least one Rule-Based Bot on the desk.</div> : null}
      </div>
      <DialogFooter className="border-border/70 bg-muted/20">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={!canPrestigeNow}
          onClick={() => {
            prestigeReset()
            onClose()
          }}
        >
          Confirm Prestige
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
