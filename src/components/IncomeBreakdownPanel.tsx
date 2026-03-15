import { useGameStore } from '../store/gameStore'
import { selectors } from '../store/selectors'
import { formatMultiplier, formatRate } from '../utils/formatting'

export function IncomeBreakdownPanel() {
  const breakdown = useGameStore(selectors.incomeBreakdown)
  const globalMultiplier = useGameStore(selectors.globalMultiplier)
  const prestigeMultiplier = useGameStore(selectors.prestigeMultiplier)

  return (
    <section className="panel-shell compact-panel">
      <div className="section-heading">
        <p className="panel-kicker">Income Breakdown</p>
        <h2>Live passive totals</h2>
      </div>

      <ul className="breakdown-list">
        <li>
          <span>Junior desk</span>
          <strong>{formatRate(breakdown.juniorIncome)}</strong>
        </li>
        <li>
          <span>Senior desk</span>
          <strong>{formatRate(breakdown.seniorIncome)}</strong>
        </li>
        <li>
          <span>Trading bots</span>
          <strong>{formatRate(breakdown.botIncome)}</strong>
        </li>
        <li>
          <span>Global multiplier</span>
          <strong>{formatMultiplier(globalMultiplier)}</strong>
        </li>
        <li>
          <span>Prestige multiplier</span>
          <strong>{formatMultiplier(prestigeMultiplier)}</strong>
        </li>
      </ul>
    </section>
  )
}
