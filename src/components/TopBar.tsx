import { useGameStore } from '../store/gameStore'
import { selectors } from '../store/selectors'
import { formatCurrency, formatRate } from '../utils/formatting'
import { getProgressionPhase } from '../utils/progression'

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-cell">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
    </div>
  )
}

export function TopBar() {
  const gameState = useGameStore((state) => state)
  const cash = useGameStore((state) => state.cash)
  const reputation = useGameStore((state) => state.reputation)
  const appInfo = useGameStore((state) => state.appInfo)
  const cashPerClick = useGameStore(selectors.cashPerClick)
  const cashPerSecond = useGameStore(selectors.cashPerSecond)
  const prestigePreview = useGameStore(selectors.prestigeGainPreview)

  const phaseLabels = {
    'solo-trader': 'Solo Trader',
    'junior-desk': 'Junior Trader Desk',
    'firm-growth': 'Senior Trader Growth',
    'bot-era': 'Trading Bot Era',
    'prestige-decision': 'Prestige Decision',
  } as const

  const phaseLabel = phaseLabels[getProgressionPhase(gameState)]

  return (
    <header className="top-bar panel-shell">
      <div className="brand-block">
        <p className="panel-kicker">Stock Incremental</p>
        <h1 className="brand-title">Terminal Desk</h1>
        <p className="panel-note">
          Bloomberg-style firm builder scaffold with a Zustand-backed state core.
        </p>
        <div className="brand-phase-pill">Active phase: {phaseLabel}</div>
      </div>

      <div className="top-bar-grid">
        <StatCell label="Cash" value={formatCurrency(cash, cash < 100 ? 1 : 0)} />
        <StatCell label="Cash / Sec" value={formatRate(cashPerSecond)} />
        <StatCell label="Cash / Click" value={formatCurrency(cashPerClick, cashPerClick < 100 ? 1 : 0)} />
        <StatCell label="Reputation" value={reputation.toLocaleString()} />
        <StatCell label="Prestige Preview" value={`${prestigePreview} rep`} />
        <StatCell label="Runtime" value={appInfo ? `${appInfo.name} ${appInfo.version}` : 'Browser preview'} />
      </div>
    </header>
  )
}
