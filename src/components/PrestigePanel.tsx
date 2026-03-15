import { PRESTIGE_UPGRADES } from '../data/prestigeUpgrades'
import { useGameStore } from '../store/gameStore'
import { selectors } from '../store/selectors'
import { formatCurrency, formatMultiplier } from '../utils/formatting'
import { UpgradeCard } from './UpgradeCard'

export function PrestigePanel() {
  const gameState = useGameStore((state) => state)
  const reputation = useGameStore((state) => state.reputation)
  const reputationSpent = useGameStore((state) => state.reputationSpent)
  const prestigeCount = useGameStore((state) => state.prestigeCount)
  const lifetimeCashEarned = useGameStore((state) => state.lifetimeCashEarned)
  const openModal = useGameStore((state) => state.openModal)
  const buyPrestigeUpgrade = useGameStore((state) => state.buyPrestigeUpgrade)
  const prestigePreview = useGameStore(selectors.prestigeGainPreview)
  const prestigeReady = useGameStore(selectors.canPrestige)
  const prestigeMultiplier = useGameStore(selectors.prestigeMultiplier)
  const seedCapitalBonus = useGameStore(selectors.seedCapitalBonus)

  return (
    <section className="panel-shell compact-panel">
      <div className="section-heading">
        <p className="panel-kicker">Meta Progression</p>
        <h2>Reputation desk</h2>
      </div>

      <dl className="definition-grid prestige-grid">
        <div>
          <dt>Current Reputation</dt>
          <dd>{reputation}</dd>
        </div>
        <div>
          <dt>Spent Reputation</dt>
          <dd>{reputationSpent}</dd>
        </div>
        <div>
          <dt>Next Reset Gain</dt>
          <dd>{prestigePreview} rep</dd>
        </div>
        <div>
          <dt>Prestige Count</dt>
          <dd>{prestigeCount}</dd>
        </div>
      </dl>

      <div className="prestige-summary">
        <p className="panel-note">Lifetime cash: {formatCurrency(lifetimeCashEarned, lifetimeCashEarned < 100 ? 1 : 0)}</p>
        <p className="panel-note">Permanent money multiplier: {formatMultiplier(prestigeMultiplier)}</p>
        <p className="panel-note">Current Seed Capital bonus: {formatCurrency(seedCapitalBonus)}</p>
      </div>

      <button type="button" className="card-action prestige-trigger" disabled={!prestigeReady} onClick={() => openModal('prestigeConfirm')}>
        {prestigeReady ? `Prestige for ${prestigePreview} Reputation` : 'Prestige requires $1.0M lifetime cash and at least 1 Trading Bot'}
      </button>

      <div className="shop-stack">
        {PRESTIGE_UPGRADES.map((upgrade) => (
          <UpgradeCard
            key={upgrade.id}
            title={upgrade.name}
            description={upgrade.description}
            cost={upgrade.baseCost}
            stateLabel={`Rank ${gameState.purchasedPrestigeUpgrades[upgrade.id] ?? 0}/${upgrade.maxRank}`}
            actionLabel={(gameState.purchasedPrestigeUpgrades[upgrade.id] ?? 0) >= upgrade.maxRank ? 'Maxed' : 'Buy rank'}
            actionDisabled={!selectors.canAffordPrestigeUpgrade(upgrade.id)(gameState)}
            onAction={() => buyPrestigeUpgrade(upgrade.id)}
          />
        ))}
      </div>
    </section>
  )
}
