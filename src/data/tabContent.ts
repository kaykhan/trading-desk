import { PRESTIGE_UPGRADES } from './prestigeUpgrades'
import { UNITS } from './units'
import { UPGRADES } from './upgrades'

export const OPERATIONS_UPGRADES = UPGRADES.filter((upgrade) => upgrade.category === 'operations')

export const RESEARCH_UPGRADES = UPGRADES.filter((upgrade) => upgrade.category === 'research')

export const TRADING_UPGRADES = UPGRADES.filter((upgrade) => upgrade.category === 'trading')

export const OPERATIONS_UNITS = [UNITS.juniorTrader, UNITS.seniorTrader, UNITS.tradingBot]

export const PRESTIGE_TAB_UPGRADES = PRESTIGE_UPGRADES
