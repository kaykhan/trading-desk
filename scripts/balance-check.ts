import { initialState } from '../src/data/initialState'
import { RESEARCH_TECH } from '../src/data/researchTech'
import { REPEATABLE_UPGRADES } from '../src/data/repeatableUpgrades'
import { UPGRADES } from '../src/data/upgrades'
import { getCashPerSecond, getInfluencePerSecond, getManualIncome, getPowerCapacity, getPowerUsage, getResearchPointsPerSecond } from '../src/utils/economy'
import { getReputationGainForNextPrestige } from '../src/utils/prestige'
import type { GameState, ResearchTechId, UnitId, UpgradeId } from '../src/types/game'
import { areResearchTechPrerequisitesMet, canBuyResearchTech, isResearchTechUnlocked } from '../src/utils/research'
import { getBulkUnitCost, isUnitUnlocked } from '../src/utils/economy'

type ProgressSnapshot = {
  elapsedSeconds: number
  cash: number
  researchPoints: number
  influence: number
  lifetimeCash: number
  counts: Record<UnitId, number>
  purchasedUpgrades: number
  purchasedResearch: number
}

function cloneState(state: GameState): GameState {
  return structuredClone(state)
}

function getUnitCount(state: GameState, unitId: UnitId): number {
  if (unitId === 'intern') return state.internCount
  if (unitId === 'juniorTrader') return state.juniorTraderCount
  if (unitId === 'seniorTrader') return state.seniorTraderCount
  if (unitId === 'quantTrader') return state.quantTraderCount
  if (unitId === 'propDesk') return state.propDeskCount
  if (unitId === 'institutionalDesk') return state.institutionalDeskCount
  if (unitId === 'hedgeFund') return state.hedgeFundCount
  if (unitId === 'investmentFirm') return state.investmentFirmCount
  if (unitId === 'ruleBasedBot') return state.ruleBasedBotCount
  if (unitId === 'mlTradingBot') return state.mlTradingBotCount
  if (unitId === 'aiTradingBot') return state.aiTradingBotCount
  if (unitId === 'internResearchScientist') return state.internResearchScientistCount
  if (unitId === 'juniorResearchScientist') return state.juniorResearchScientistCount
  if (unitId === 'seniorResearchScientist') return state.seniorResearchScientistCount
  return state.juniorPoliticianCount
}

function buyUpgradeIfAffordable(state: GameState, upgradeId: UpgradeId): boolean {
  const upgrade = UPGRADES.find((entry) => entry.id === upgradeId)

  if (!upgrade || state.purchasedUpgrades[upgradeId]) {
    return false
  }

  if (upgrade.visibleWhen && !upgrade.visibleWhen(state)) {
    return false
  }

  if (state.cash < upgrade.cost) {
    return false
  }

  state.cash -= upgrade.cost
  state.purchasedUpgrades[upgradeId] = true
  return true
}

function buyUnitIfAffordable(state: GameState, unitId: UnitId): boolean {
  if (!isUnitUnlocked(state, unitId)) {
    return false
  }

  const result = getBulkUnitCost(state, unitId, 1)
  if (result.quantity <= 0 || state.cash < result.totalCost) {
    return false
  }

  state.cash -= result.totalCost

  if (unitId === 'intern') state.internCount += 1
  if (unitId === 'juniorTrader') state.juniorTraderCount += 1
  if (unitId === 'seniorTrader') state.seniorTraderCount += 1
  if (unitId === 'quantTrader') state.quantTraderCount += 1
  if (unitId === 'propDesk') state.propDeskCount += 1
  if (unitId === 'institutionalDesk') state.institutionalDeskCount += 1
  if (unitId === 'hedgeFund') state.hedgeFundCount += 1
  if (unitId === 'investmentFirm') state.investmentFirmCount += 1
  if (unitId === 'ruleBasedBot') state.ruleBasedBotCount += 1
  if (unitId === 'mlTradingBot') state.mlTradingBotCount += 1
  if (unitId === 'aiTradingBot') state.aiTradingBotCount += 1
  if (unitId === 'internResearchScientist') state.internResearchScientistCount += 1
  if (unitId === 'juniorResearchScientist') state.juniorResearchScientistCount += 1
  if (unitId === 'seniorResearchScientist') state.seniorResearchScientistCount += 1
  if (unitId === 'juniorPolitician') state.juniorPoliticianCount += 1

  return true
}

function buyResearchIfAffordable(state: GameState, techId: ResearchTechId): boolean {
  const tech = RESEARCH_TECH.find((entry) => entry.id === techId)

  if (!tech || state.purchasedResearchTech[techId]) {
    return false
  }

  if (!isResearchTechUnlocked(state, techId) || !areResearchTechPrerequisitesMet(state, techId) || !canBuyResearchTech(state, techId)) {
    return false
  }

  if (tech.currency === 'cash') {
    state.cash -= tech.researchCost
  } else {
    state.researchPoints -= tech.researchCost
  }

  state.purchasedResearchTech[techId] = true
  return true
}

function stepEconomy(state: GameState): void {
  const manual = getManualIncome(state)
  const cash = getCashPerSecond(state)
  const research = getResearchPointsPerSecond(state)
  const influence = getInfluencePerSecond(state)

  state.cash += manual + cash
  state.researchPoints += research
  state.influence += influence
  state.lifetimeManualTrades += 1
  state.lifetimeCashEarned += manual + cash
  state.lifetimeResearchPointsEarned += research
}

function simulateOpeningWindow(): ProgressSnapshot {
  const state = cloneState(initialState)
  const upgradePlan: UpgradeId[] = ['betterTerminal', 'tradeShortcuts']
  const unitPlan: UnitId[] = ['intern', 'internResearchScientist', 'juniorTrader', 'seniorTrader', 'quantTrader', 'ruleBasedBot']
  const researchPlan: ResearchTechId[] = ['foundationsOfFinanceTraining', 'juniorTraderProgram', 'juniorScientists', 'seniorRecruitment', 'algorithmicTrading', 'ruleBasedAutomation']

  for (let elapsedSeconds = 1; elapsedSeconds <= 300; elapsedSeconds += 1) {
    stepEconomy(state)

    for (const techId of researchPlan) {
      buyResearchIfAffordable(state, techId)
    }

    for (const upgradeId of upgradePlan) {
      buyUpgradeIfAffordable(state, upgradeId)
    }

    for (const unitId of unitPlan) {
      buyUnitIfAffordable(state, unitId)
    }
  }

  return {
    elapsedSeconds: 300,
    cash: state.cash,
    researchPoints: state.researchPoints,
    influence: state.influence,
    lifetimeCash: state.lifetimeCashEarned,
    counts: {
      intern: state.internCount,
      juniorTrader: state.juniorTraderCount,
      seniorTrader: state.seniorTraderCount,
      quantTrader: state.quantTraderCount,
      propDesk: state.propDeskCount,
      institutionalDesk: state.institutionalDeskCount,
      hedgeFund: state.hedgeFundCount,
      investmentFirm: state.investmentFirmCount,
      ruleBasedBot: state.ruleBasedBotCount,
      mlTradingBot: state.mlTradingBotCount,
      aiTradingBot: state.aiTradingBotCount,
      internResearchScientist: state.internResearchScientistCount,
      juniorResearchScientist: state.juniorResearchScientistCount,
      seniorResearchScientist: state.seniorResearchScientistCount,
      juniorPolitician: state.juniorPoliticianCount,
    },
    purchasedUpgrades: Object.values(state.purchasedUpgrades).filter(Boolean).length,
    purchasedResearch: Object.values(state.purchasedResearchTech).filter(Boolean).length,
  }
}

const snapshot = simulateOpeningWindow()

console.log('Balance smoke check')
console.log(`- 5-minute cash: ${snapshot.cash.toFixed(2)}`)
console.log(`- 5-minute lifetime cash: ${snapshot.lifetimeCash.toFixed(2)}`)
console.log(`- 5-minute research points: ${snapshot.researchPoints.toFixed(2)}`)
console.log(`- 5-minute influence: ${snapshot.influence.toFixed(2)}`)
console.log(`- Purchased upgrades in opening window: ${snapshot.purchasedUpgrades}`)
console.log(`- Purchased research techs in opening window: ${snapshot.purchasedResearch}`)
console.log(`- Interns / Junior Traders / Senior Traders: ${snapshot.counts.intern}/${snapshot.counts.juniorTrader}/${snapshot.counts.seniorTrader}`)
console.log(`- Scientists: ${snapshot.counts.internResearchScientist}/${snapshot.counts.juniorResearchScientist}/${snapshot.counts.seniorResearchScientist}`)
console.log(`- Automation units: ${snapshot.counts.quantTrader}/${snapshot.counts.ruleBasedBot}/${snapshot.counts.mlTradingBot}/${snapshot.counts.aiTradingBot}`)
console.log(`- Power headroom: ${(getPowerCapacity(initialState) - getPowerUsage(initialState)).toFixed(2)} at initial state`)
console.log(`- Repeatable upgrade catalog count: ${REPEATABLE_UPGRADES.length}`)
console.log(`- Prestige gain at initial state: ${getReputationGainForNextPrestige(initialState)}`)
