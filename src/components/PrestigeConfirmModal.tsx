import { useGameStore } from '../store/gameStore'
import { selectors } from '../store/selectors'
import { formatCurrency } from '../utils/formatting'

type PrestigeConfirmModalProps = {
  onClose: () => void
}

export function PrestigeConfirmModal({ onClose }: PrestigeConfirmModalProps) {
  const prestigeReset = useGameStore((state) => state.prestigeReset)
  const lifetimeCashEarned = useGameStore((state) => state.lifetimeCashEarned)
  const prestigePreview = useGameStore(selectors.prestigeGainPreview)
  const canPrestigeNow = useGameStore(selectors.canPrestige)

  return (
    <section className="modal-card" aria-labelledby="prestige-modal-title">
      <div className="modal-header">
        <div>
          <p className="panel-kicker">Prestige Reset</p>
          <h2 id="prestige-modal-title">Confirm Reputation reset</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="modal-copy">
        <p className="panel-note">This resets cash, units, and standard upgrades, but keeps Reputation and prestige upgrades.</p>
        <p className="panel-note">Lifetime cash this run: {formatCurrency(lifetimeCashEarned, lifetimeCashEarned < 100 ? 1 : 0)}</p>
        <p className="panel-note">Projected Reputation gain: {prestigePreview}</p>
        {!canPrestigeNow ? <p className="panel-note">Prestige stays locked until you have at least one Trading Bot on the desk.</p> : null}
      </div>
      <div className="modal-actions">
        <button type="button" className="ghost-button" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="card-action"
          disabled={!canPrestigeNow}
          onClick={() => {
            prestigeReset()
            onClose()
          }}
        >
          Confirm Prestige
        </button>
      </div>
    </section>
  )
}
