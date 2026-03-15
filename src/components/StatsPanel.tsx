import { useGameStore } from '../store/gameStore'
import { formatCurrency } from '../utils/formatting'

export function StatsPanel() {
  const lifetimeCashEarned = useGameStore((state) => state.lifetimeCashEarned)
  const juniorTraderCount = useGameStore((state) => state.juniorTraderCount)
  const seniorTraderCount = useGameStore((state) => state.seniorTraderCount)
  const tradingBotCount = useGameStore((state) => state.tradingBotCount)

  return (
    <section className="panel-shell compact-panel">
      <div className="section-heading">
        <p className="panel-kicker">Firm Snapshot</p>
        <h2>Current structure</h2>
      </div>

      <dl className="definition-grid">
        <div>
          <dt>Junior Traders</dt>
          <dd>{juniorTraderCount}</dd>
        </div>
        <div>
          <dt>Senior Traders</dt>
          <dd>{seniorTraderCount}</dd>
        </div>
        <div>
          <dt>Trading Bots</dt>
          <dd>{tradingBotCount}</dd>
        </div>
        <div>
          <dt>Lifetime Cash</dt>
          <dd>{formatCurrency(lifetimeCashEarned, lifetimeCashEarned < 100 ? 1 : 0)}</dd>
        </div>
      </dl>
    </section>
  )
}
