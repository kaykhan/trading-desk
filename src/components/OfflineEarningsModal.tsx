import { useGameStore } from '../store/gameStore'
import { formatCurrency } from '../utils/formatting'

type OfflineEarningsModalProps = {
  onClose: () => void
}

export function OfflineEarningsModal({ onClose }: OfflineEarningsModalProps) {
  const offlineSummary = useGameStore((state) => state.offlineSummary)

  return (
    <section className="modal-card" aria-labelledby="offline-modal-title">
      <div className="modal-header">
        <div>
          <p className="panel-kicker">Trading Hours</p>
          <h2 id="offline-modal-title">Offline earnings scaffold</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="modal-copy">
        <p className="panel-note">Time away: {offlineSummary ? `${offlineSummary.secondsAway.toLocaleString()} sec` : '0 sec'}</p>
        <p className="panel-note">Capped time counted: {offlineSummary ? `${offlineSummary.appliedSeconds.toLocaleString()} sec` : '0 sec'}</p>
        <p className="panel-note">Cash earned offline: {offlineSummary ? formatCurrency(offlineSummary.cashEarned, offlineSummary.cashEarned < 100 ? 1 : 0) : '$0'}</p>
      </div>
    </section>
  )
}
