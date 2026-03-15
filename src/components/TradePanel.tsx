import { MILESTONES } from '../data/milestones'
import { useGameStore } from '../store/gameStore'
import { selectors } from '../store/selectors'
import { formatCurrency, formatRate } from '../utils/formatting'
import { getProgressionPhase } from '../utils/progression'

const MILESTONE_BY_PHASE = {
  'solo-trader': MILESTONES[0],
  'junior-desk': MILESTONES[1],
  'firm-growth': MILESTONES[2],
  'bot-era': MILESTONES[3],
  'prestige-decision': MILESTONES[4],
} as const

export function TradePanel() {
  const gameState = useGameStore((state) => state)
  const juniorTraderCount = useGameStore((state) => state.juniorTraderCount)
  const seniorTraderCount = useGameStore((state) => state.seniorTraderCount)
  const tradingBotCount = useGameStore((state) => state.tradingBotCount)
  const purchasedUpgrades = useGameStore((state) => state.purchasedUpgrades)
  const makeTrade = useGameStore((state) => state.makeTrade)
  const cashPerClick = useGameStore(selectors.cashPerClick)
  const cashPerSecond = useGameStore(selectors.cashPerSecond)
  const nextJuniorTraderCost = useGameStore(selectors.nextJuniorTraderCost)
  const promotionCost = useGameStore(selectors.promotionCost)
  const prestigePreview = useGameStore(selectors.prestigeGainPreview)
  const milestone = MILESTONE_BY_PHASE[getProgressionPhase(gameState)]

  let deskSummary = 'Solo desk active'
  let nextTarget = `Reach ${formatCurrency(nextJuniorTraderCost)} for your first Junior Trader.`

  if (juniorTraderCount > 0) {
    deskSummary = `${juniorTraderCount} Junior Trader${juniorTraderCount === 1 ? '' : 's'} on the desk`
    nextTarget = purchasedUpgrades.promotionProgram
      ? `Convert juniors into seniors for ${formatCurrency(promotionCost)} each.`
      : 'Build toward the $10,000 Promotion Program unlock.'
  }

  if (seniorTraderCount > 0 || purchasedUpgrades.promotionProgram) {
    deskSummary = `${seniorTraderCount} Senior Trader${seniorTraderCount === 1 ? '' : 's'} leading the firm`
    nextTarget = purchasedUpgrades.algorithmicTrading
      ? 'Scale human output and start deploying Trading Bots.'
      : 'Build a strong senior core, then bank cash toward the $100,000 Algorithmic Trading unlock.'
  }

  if (tradingBotCount > 0 || purchasedUpgrades.algorithmicTrading) {
    deskSummary = `${tradingBotCount} Trading Bot${tradingBotCount === 1 ? '' : 's'} supporting automation`
    nextTarget = prestigePreview > 0
      ? `Prestige is ready for ${prestigePreview} Reputation.`
      : 'Deploy your first bot and stack late-run scaling before resetting.'
  }

  return (
    <section className="panel-shell trade-panel">
      <div className="section-heading">
        <p className="panel-kicker">Trade Desk</p>
        <h2>Manual execution is live</h2>
      </div>

      <button type="button" className="trade-button live" onClick={makeTrade}>
        Make Trade
      </button>

      <div className="trade-panel-copy">
        <p className="panel-note">Each click executes a trade for {formatCurrency(cashPerClick, cashPerClick < 100 ? 1 : 0)}.</p>
        <div className="trade-summary-grid">
          <div className="summary-chip">
            <span>Desk Status</span>
            <strong>{deskSummary}</strong>
          </div>
          <div className="summary-chip">
            <span>Passive Rate</span>
            <strong>{formatRate(cashPerSecond)}</strong>
          </div>
        </div>
        <div className="milestone-chip">
          <span>{milestone.label}</span>
          <strong>{milestone.rangeLabel}</strong>
        </div>
        <p className="panel-note">{milestone.objective}</p>
        <p className="panel-note trade-target">Next target: {nextTarget}</p>
      </div>
    </section>
  )
}
