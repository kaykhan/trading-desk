import { PRESTIGE_UPGRADES } from '../data/prestigeUpgrades'
import { UNITS } from '../data/units'
import { UPGRADES } from '../data/upgrades'
import { useGameStore } from '../store/gameStore'
import { selectors } from '../store/selectors'
import type { ShopTabId, UpgradeId } from '../types/game'
import { formatCurrency } from '../utils/formatting'
import { UnitCard } from './UnitCard'
import { UpgradeCard } from './UpgradeCard'

const SHOP_TABS: { id: ShopTabId; label: string }[] = [
  { id: 'manual', label: 'Manual' },
  { id: 'staff', label: 'Staff' },
  { id: 'automation', label: 'Automation' },
  { id: 'global', label: 'Global' },
  { id: 'prestige', label: 'Prestige' },
]

export function ShopPanel() {
  const activeShopTab = useGameStore((state) => state.activeShopTab)
  const setActiveShopTab = useGameStore((state) => state.setActiveShopTab)
  const buyJuniorTrader = useGameStore((state) => state.buyJuniorTrader)
  const buyTradingBot = useGameStore((state) => state.buyTradingBot)
  const buyUpgrade = useGameStore((state) => state.buyUpgrade)
  const buyPrestigeUpgrade = useGameStore((state) => state.buyPrestigeUpgrade)
  const promoteJuniorToSenior = useGameStore((state) => state.promoteJuniorToSenior)
  const openModal = useGameStore((state) => state.openModal)
  const gameState = useGameStore((state) => state)
  const nextJuniorTraderCost = useGameStore(selectors.nextJuniorTraderCost)
  const promotionCost = useGameStore(selectors.promotionCost)
  const nextTradingBotCost = useGameStore(selectors.nextTradingBotCost)
  const canAffordJuniorTrader = useGameStore(selectors.canAffordJuniorTrader)
  const canAffordTradingBot = useGameStore(selectors.canAffordTradingBot)
  const canPromoteJunior = useGameStore(selectors.canPromoteJunior)
  const isTradingBotUnlocked = useGameStore(selectors.isTradingBotUnlocked)
  const prestigePreview = useGameStore(selectors.prestigeGainPreview)
  const canPrestige = useGameStore(selectors.canPrestige)

  const tabUpgrades = UPGRADES.filter((upgrade) => upgrade.category === activeShopTab)
  const visibleUpgrades = tabUpgrades.filter((upgrade) => (upgrade.visibleWhen ? upgrade.visibleWhen(gameState) : true))

  const getUpgradeStateLabel = (upgradeId: UpgradeId) => {
    if (selectors.isUpgradePurchased(upgradeId)(gameState)) {
      return 'Purchased'
    }

    return selectors.canAffordUpgrade(upgradeId)(gameState) ? 'Affordable' : 'Need cash'
  }

  return (
    <section className="panel-shell shop-panel">
      <div className="section-heading">
        <p className="panel-kicker">Capital Allocation</p>
        <h2>Shop architecture</h2>
      </div>

      <div className="shop-tabs" role="tablist" aria-label="Shop categories">
        {SHOP_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeShopTab ? 'shop-tab active' : 'shop-tab'}
            onClick={() => setActiveShopTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeShopTab === 'staff' && (
        <div className="shop-stack">
          <UnitCard
            title={UNITS.juniorTrader.name}
            description={UNITS.juniorTrader.description}
            meta={`Next cost ${formatCurrency(nextJuniorTraderCost)} | Base output ${formatCurrency(UNITS.juniorTrader.baseIncomePerSecond)}/sec`}
            status={canAffordJuniorTrader ? 'Affordable' : 'Need cash'}
            actionLabel="Hire Junior"
            actionDisabled={!canAffordJuniorTrader}
            onAction={buyJuniorTrader}
          />
          <UnitCard
            title={UNITS.seniorTrader.name}
            description={UNITS.seniorTrader.description}
            meta={`Promotion cost ${formatCurrency(promotionCost)} | Base output ${formatCurrency(UNITS.seniorTrader.baseIncomePerSecond)}/sec`}
            status={gameState.purchasedUpgrades.promotionProgram ? 'Promotion live' : 'Promotion locked'}
            actionLabel="Promote Junior"
            actionDisabled={!canPromoteJunior}
            onAction={promoteJuniorToSenior}
          />
          {visibleUpgrades.map((upgrade) => (
            <UpgradeCard
              key={upgrade.id}
              title={upgrade.name}
              description={upgrade.description}
              cost={upgrade.cost}
              stateLabel={getUpgradeStateLabel(upgrade.id)}
              actionLabel={selectors.isUpgradePurchased(upgrade.id)(gameState) ? 'Purchased' : 'Buy upgrade'}
              actionDisabled={!selectors.canAffordUpgrade(upgrade.id)(gameState)}
              onAction={() => buyUpgrade(upgrade.id)}
            />
          ))}
        </div>
      )}

      {activeShopTab === 'automation' && (
        <div className="shop-stack">
          <UnitCard
            title={UNITS.tradingBot.name}
            description={UNITS.tradingBot.description}
            meta={`Next cost ${formatCurrency(nextTradingBotCost)} | Base output ${formatCurrency(UNITS.tradingBot.baseIncomePerSecond)}/sec`}
            status={isTradingBotUnlocked ? (canAffordTradingBot ? 'Affordable' : 'Need cash') : 'Unlock Algorithmic Trading'}
            actionLabel="Deploy Bot"
            actionDisabled={!canAffordTradingBot}
            onAction={buyTradingBot}
          />
          {visibleUpgrades.map((upgrade) => (
            <UpgradeCard
              key={upgrade.id}
              title={upgrade.name}
              description={upgrade.description}
              cost={upgrade.cost}
              stateLabel={getUpgradeStateLabel(upgrade.id)}
              actionLabel={selectors.isUpgradePurchased(upgrade.id)(gameState) ? 'Purchased' : 'Buy upgrade'}
              actionDisabled={!selectors.canAffordUpgrade(upgrade.id)(gameState)}
              onAction={() => buyUpgrade(upgrade.id)}
            />
          ))}
        </div>
      )}

      {activeShopTab === 'prestige' && (
        <div className="shop-stack">
          <div className="shop-callout">
            <p className="panel-note">
              Resetting now grants <strong>{prestigePreview} Reputation</strong> and preserves your permanent upgrades.
            </p>
            <button type="button" className="card-action" disabled={!canPrestige} onClick={() => openModal('prestigeConfirm')}>
              {canPrestige ? 'Open prestige confirmation' : 'Prestige still locked'}
            </button>
          </div>
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
      )}

      {(activeShopTab === 'manual' || activeShopTab === 'global') && (
        <div className="shop-stack">
          {visibleUpgrades.map((upgrade) => (
            <UpgradeCard
              key={upgrade.id}
              title={upgrade.name}
              description={upgrade.description}
              cost={upgrade.cost}
              stateLabel={getUpgradeStateLabel(upgrade.id)}
              actionLabel={selectors.isUpgradePurchased(upgrade.id)(gameState) ? 'Purchased' : 'Buy upgrade'}
              actionDisabled={!selectors.canAffordUpgrade(upgrade.id)(gameState)}
              onAction={() => buyUpgrade(upgrade.id)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
