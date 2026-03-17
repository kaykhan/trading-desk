import { UPGRADES } from './upgrades'
import { PRESTIGE_UPGRADES } from './prestigeUpgrades'
import { UNITS } from './units'

export const OPERATIONS_UPGRADES = UPGRADES.filter((upgrade) => upgrade.category === 'operations')

export const RESEARCH_UPGRADES = UPGRADES.filter((upgrade) => upgrade.category === 'research')

export const TRADING_UPGRADES = UPGRADES.filter((upgrade) => upgrade.category === 'trading')

export const TRADING_DESK_UPGRADES = UPGRADES.filter((upgrade) => upgrade.group === 'tradingDesk')

export const RESEARCH_SYSTEM_UPGRADES = UPGRADES.filter((upgrade) => upgrade.group === 'research')

export const INSTITUTION_UPGRADES = UPGRADES.filter((upgrade) => upgrade.group === 'institutions')

export const AUTOMATION_UPGRADES = UPGRADES.filter((upgrade) => upgrade.group === 'automation')

export const INFRASTRUCTURE_UPGRADES = UPGRADES.filter((upgrade) => upgrade.group === 'infrastructure')

export const COMPLIANCE_LOBBYING_UPGRADES = UPGRADES.filter((upgrade) => upgrade.group === 'complianceLobbying')

export const OPERATIONS_UNITS = [UNITS.intern, UNITS.juniorTrader, UNITS.seniorTrader, UNITS.quantTrader]

export const PRESTIGE_TAB_UPGRADES = PRESTIGE_UPGRADES
