import { UPGRADES } from './upgrades'
import { PRESTIGE_UPGRADES } from './prestigeUpgrades'
import { UNITS } from './units'

export const OPERATIONS_UPGRADES = UPGRADES.filter((upgrade) => upgrade.category === 'operations')

export const RESEARCH_UPGRADES = UPGRADES.filter((upgrade) => upgrade.category === 'research')

export const TRADING_UPGRADES = UPGRADES.filter((upgrade) => upgrade.category === 'trading')

export const TRADING_DESK_UPGRADES = UPGRADES.filter((upgrade) => upgrade.group === 'tradingDesk')

export const SCIENTIST_UPGRADES = UPGRADES.filter((upgrade) => upgrade.group === 'scientists')

export const POLITICS_UPGRADES = UPGRADES.filter((upgrade) => upgrade.group === 'politics')

export const ALGORITHMIC_UPGRADES = UPGRADES.filter((upgrade) => upgrade.group === 'algorithmic')

export const INFRASTRUCTURE_UPGRADES = UPGRADES.filter((upgrade) => upgrade.group === 'infrastructure')

export const OPERATIONS_UNITS = [UNITS.intern, UNITS.juniorTrader, UNITS.seniorTrader, UNITS.quantTrader]

export const PRESTIGE_TAB_UPGRADES = PRESTIGE_UPGRADES
