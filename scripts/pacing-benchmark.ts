import { writeFileSync } from 'node:fs'
import { getCashPerSecond, getInfluencePerSecond, getPowerCapacity, getPowerUsage, getResearchPointsPerSecond } from '../src/utils/economy'
import { PRESTIGE_UPGRADES } from '../src/data/prestigeUpgrades'
import { getTotalDeskSlots, getUsedDeskSlots } from '../src/utils/capacity'
import { getTotalMetaMilestoneCount, getUnlockedMetaMilestoneCount, getUnlockedMilestoneCount } from '../src/utils/milestones'
import { runSimulationWithCheckpoints } from '../src/sim/simRunner'
import { DEFAULT_SIM_CONFIG, MILESTONE_GUIDED_SIM_CONFIG, PRESTIGE_AWARE_SIM_CONFIG, ROI_SIM_CONFIG } from '../src/sim/simState'
import type { SimCheckpointSnapshot, SimConfig } from '../src/sim/simState'
import type { PrestigeUpgradeId, ResearchTechId } from '../src/types/game'

type WindowId = 'run1' | 'run2' | 'midgame' | 'lategame' | 'softComplete'

type WindowPlan = {
  id: WindowId
  label: string
  targetHours: string
  targetSeconds: number
  progressionIntent: string
  expectedSignals: string[]
}

const PACING_WINDOWS: WindowPlan[] = [
  {
    id: 'run1',
    label: 'Run 1',
    targetHours: '0-0.5h',
    targetSeconds: 30 * 60,
    progressionIntent: 'Establish the desk, unlock research, preview one new branch, and make prestige attractive.',
    expectedSignals: [
      'Prestige should be reachable or very close.',
      'Research should be unlocked and producing.',
      'At least one branch preview should be visible: sectors, automation, or institutions.',
    ],
  },
  {
    id: 'run2',
    label: 'Run 2',
    targetHours: '0.5-2h',
    targetSeconds: 2 * 60 * 60,
    progressionIntent: 'Make research and prestige bonuses feel real, and turn the first preview systems into usable systems.',
    expectedSignals: [
      'Automation or institutions should be usable, not just visible.',
      'A second major branch should be introduced.',
      'The player should feel a strong post-prestige acceleration over run 1.',
    ],
  },
  {
    id: 'midgame',
    label: 'Midgame',
    targetHours: '2-5h',
    targetSeconds: 5 * 60 * 60,
    progressionIntent: 'Integrate automation, institutions, and lobbying so the build has a clear identity.',
    expectedSignals: [
      'Lobbying should be seen and usable.',
      'Automation should contribute meaningfully to income.',
      'Institution systems should no longer feel aspirational only.',
    ],
  },
  {
    id: 'lategame',
    label: 'Lategame',
    targetHours: '5-12h',
    targetSeconds: 12 * 60 * 60,
    progressionIntent: 'Bring deeper machine tiers, boosts, and broader prestige loops online.',
    expectedSignals: [
      'ML and deeper infrastructure should be available.',
      'Boosts should be part of the active build.',
      'Prestige choices should reshape builds rather than just accelerate them.',
    ],
  },
  {
    id: 'softComplete',
    label: 'Soft Complete',
    targetHours: '15-20h',
    targetSeconds: 20 * 60 * 60,
    progressionIntent: 'Every major system should have been seen and meaningfully used.',
    expectedSignals: [
      'All major branches should be online.',
      'Remaining goals should feel like mastery or long-tail completion, not missing fundamentals.',
      'The player should feel they have effectively seen the whole game.',
    ],
  },
]

type BenchmarkRun = {
  label: string
  config: SimConfig
}

const BENCHMARK_RUNS: BenchmarkRun[] = [
  { label: 'Milestone Guided', config: MILESTONE_GUIDED_SIM_CONFIG },
  { label: 'Unlock Chasing', config: DEFAULT_SIM_CONFIG },
  { label: 'ROI', config: ROI_SIM_CONFIG },
  { label: 'Prestige Aware', config: PRESTIGE_AWARE_SIM_CONFIG },
]

const MILESTONE_GUIDED_ASSUMPTION = 'Milestone-guided simulation assumes active manual clicking at roughly 3 clicks/sec until 3 Senior Traders are owned.'

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${hours}h ${minutes}m ${remainingSeconds}s`
}

function hasResearch(snapshot: SimCheckpointSnapshot, techId: ResearchTechId): boolean {
  return snapshot.game.purchasedResearchTech[techId] === true
}

function getRunSignals(snapshot: SimCheckpointSnapshot): string[] {
  const signals: string[] = []

  if (snapshot.game.prestigeCount >= 1) signals.push('prestiged')
  if (snapshot.game.lifetimeCashEarned >= 500_000) signals.push('500k lifetime cash reached')
  if (hasResearch(snapshot, 'foundationsOfFinanceTraining')) signals.push('research unlocked')
  if (snapshot.game.internResearchScientistCount > 0) signals.push('intern scientists active')
  if (snapshot.game.juniorResearchScientistCount > 0) signals.push('junior scientists active')
  if (snapshot.game.seniorResearchScientistCount > 0) signals.push('senior scientists active')
  if (snapshot.game.unlockedSectors.technology || snapshot.game.unlockedSectors.energy) signals.push('extra sector unlocked')
  if (hasResearch(snapshot, 'algorithmicTrading')) signals.push('automation branch seen')
  if (snapshot.game.quantTraderCount > 0) signals.push('quant trader active')
  if (snapshot.game.ruleBasedBotCount > 0) signals.push('rule bot active')
  if (snapshot.game.propDeskCount > 0) signals.push('prop desk active')
  if (snapshot.game.institutionalDeskCount > 0) signals.push('institutional desk active')
  if (snapshot.game.hedgeFundCount > 0) signals.push('hedge fund active')
  if (snapshot.game.investmentFirmCount > 0) signals.push('investment firm active')
  if (hasResearch(snapshot, 'regulatoryAffairs')) signals.push('lobbying seen')
  if (snapshot.game.juniorPoliticianCount > 0) signals.push('politicians active')
  if (Object.values(snapshot.game.globalBoostsOwned).some(Boolean) || Object.values(snapshot.game.timedBoosts).some((boost) => boost.autoEnabled || boost.isActive || boost.remainingCooldownSeconds > 0)) signals.push('boost systems touched')
  if (snapshot.game.mlTradingBotCount > 0 || snapshot.game.aiTradingBotCount > 0) signals.push('deep automation active')

  return signals
}

function getPrestigeUpgradeSummary(snapshot: SimCheckpointSnapshot): string {
  const purchasedRanks = snapshot.game.purchasedPrestigeUpgrades
  const purchasedSummaries = PRESTIGE_UPGRADES
    .map((upgrade) => {
      const rank = purchasedRanks[upgrade.id as PrestigeUpgradeId] ?? 0
      return rank > 0 ? `${upgrade.name} ${rank}` : null
    })
    .filter((summary): summary is string => summary !== null)

  return purchasedSummaries.join(', ') || 'none'
}

function describeCheckpoint(snapshot: SimCheckpointSnapshot): string[] {
  const lastMilestone = snapshot.lastUnlockedMilestone
  return [
    `captured at ${formatDuration(snapshot.capturedAtSeconds)} on run ${snapshot.run}`,
    `cash ${Math.floor(snapshot.game.cash).toLocaleString()} | cps ${getCashPerSecond(snapshot.game).toFixed(2)}`,
    `research ${Math.floor(snapshot.game.researchPoints).toLocaleString()} | rps ${getResearchPointsPerSecond(snapshot.game).toFixed(2)}`,
    `influence ${Math.floor(snapshot.game.influence).toLocaleString()} | ips ${getInfluencePerSecond(snapshot.game).toFixed(3)}`,
    `lifetime cash ${Math.floor(snapshot.game.lifetimeCashEarned).toLocaleString()} | prestige ${snapshot.game.prestigeCount}`,
    `reputation ${Math.floor(snapshot.game.reputation).toLocaleString()} | spent ${Math.floor(snapshot.game.reputationSpent).toLocaleString()} | prestige upgrades ${getPrestigeUpgradeSummary(snapshot)}`,
    `desk ${getUsedDeskSlots(snapshot.game)}/${getTotalDeskSlots(snapshot.game)} | power ${getPowerUsage(snapshot.game).toFixed(1)}/${getPowerCapacity(snapshot.game).toFixed(1)}`,
    `interns ${snapshot.game.internCount} | juniors ${snapshot.game.juniorTraderCount} | seniors ${snapshot.game.seniorTraderCount}`,
    `intern scientists ${snapshot.game.internResearchScientistCount} | junior scientists ${snapshot.game.juniorResearchScientistCount} | senior scientists ${snapshot.game.seniorResearchScientistCount}`,
    `prop desks ${snapshot.game.propDeskCount} | institutional desks ${snapshot.game.institutionalDeskCount} | hedge funds ${snapshot.game.hedgeFundCount} | investment firms ${snapshot.game.investmentFirmCount}`,
    `quant traders ${snapshot.game.quantTraderCount} | rule bots ${snapshot.game.ruleBasedBotCount} | ml bots ${snapshot.game.mlTradingBotCount} | ai bots ${snapshot.game.aiTradingBotCount}`,
    `run milestones ${getUnlockedMilestoneCount(snapshot.game)} | meta milestones ${getUnlockedMetaMilestoneCount(snapshot.game)}/${getTotalMetaMilestoneCount()} | signals: ${getRunSignals(snapshot).join(', ') || 'none'}`,
    `current run target: ${snapshot.currentRunTarget ? `${snapshot.currentRunTarget.name} (#${snapshot.currentRunTarget.displayOrder}) | blocked ${formatDuration(snapshot.currentRunTarget.blockedSeconds)} | progress ${snapshot.currentRunTarget.progressLabel ?? 'n/a'}` : 'none'}`,
    `next meta target: ${snapshot.nextMetaTarget ? `${snapshot.nextMetaTarget.name} (#${snapshot.nextMetaTarget.displayOrder}) | blocked ${formatDuration(snapshot.nextMetaTarget.blockedSeconds)} | progress ${snapshot.nextMetaTarget.progressLabel ?? 'n/a'}` : 'none'}`,
    `last milestone: ${lastMilestone ? `${lastMilestone.name} [${lastMilestone.scope}] at ${formatDuration(lastMilestone.elapsedSeconds)} on run ${lastMilestone.run}` : 'none'}${snapshot.blockedSinceLastUnlockSeconds !== null ? ` | blocked since then ${formatDuration(snapshot.blockedSinceLastUnlockSeconds)}` : ''}`,
    snapshot.stalled ? `stalled: ${snapshot.stallReason ?? 'yes'}` : 'stalled: no',
  ]
}

function buildMarkdownReport(): string {
  const lines: string[] = []

  lines.push('# Pacing Plan')
  lines.push('')
  lines.push('This file defines the intended pacing model and checkpoint benchmark for the current game balance targets.')
  lines.push('')
  lines.push(MILESTONE_GUIDED_ASSUMPTION)
  lines.push('')
  lines.push('## Target Windows')
  lines.push('')

  for (const window of PACING_WINDOWS) {
    lines.push(`### ${window.label} (${window.targetHours})`)
    lines.push('')
    lines.push(`- Goal: ${window.progressionIntent}`)
    for (const signal of window.expectedSignals) {
      lines.push(`- ${signal}`)
    }
    lines.push('')
  }

  lines.push('## Benchmark Runs')
  lines.push('')

  for (const benchmark of BENCHMARK_RUNS) {
      const checkpointResult = runSimulationWithCheckpoints({ ...benchmark.config, maxSeconds: PACING_WINDOWS[PACING_WINDOWS.length - 1].targetSeconds }, PACING_WINDOWS.map((window) => window.targetSeconds))
    lines.push(`### ${benchmark.label}`)
    lines.push('')

    for (const [index, snapshot] of checkpointResult.checkpoints.entries()) {
      const window = PACING_WINDOWS[index]
      lines.push(`#### ${window.label} checkpoint (${window.targetHours})`)
      for (const detail of describeCheckpoint(snapshot)) {
        lines.push(`- ${detail}`)
      }
      lines.push('')
    }

    lines.push('- Final result')
    lines.push(`- time ${formatDuration(checkpointResult.result.state.timeSeconds)}`)
    lines.push(`- final run ${checkpointResult.result.state.runIndex}`)
    lines.push(`- milestones seen ${checkpointResult.result.metrics.seenMilestoneIds.size}`)
    lines.push(`- stalled ${checkpointResult.result.stalled ? 'yes' : 'no'}`)
    if (checkpointResult.result.metrics.stallReason) {
      lines.push(`- stall reason ${checkpointResult.result.metrics.stallReason}`)
    }
    lines.push('')

    if (benchmark.label === 'Milestone Guided') {
      lines.push('#### Milestone Timing Breakdown')
      lines.push('')
      for (const [index, record] of checkpointResult.result.metrics.unlockRecords.entries()) {
        const previousTime = index > 0 ? checkpointResult.result.metrics.unlockRecords[index - 1].elapsedSeconds : 0
        const delta = record.elapsedSeconds - previousTime
        lines.push(`- ${record.name}: ${formatDuration(record.elapsedSeconds)} total, ${formatDuration(delta)} since prior milestone`)
        lines.push(`- counts: interns ${record.internCount}, juniors ${record.juniorTraderCount}, seniors ${record.seniorTraderCount}, intern scientists ${record.internResearchScientistCount}, junior scientists ${record.juniorResearchScientistCount}, senior scientists ${record.seniorResearchScientistCount}, prop desks ${record.propDeskCount}, quant traders ${record.quantTraderCount}`)
        lines.push(`- resources: cash ${Math.floor(record.cash).toLocaleString()}, RP ${Math.floor(record.researchPoints).toLocaleString()}, influence ${Math.floor(record.influence).toLocaleString()}, lifetime cash ${Math.floor(record.lifetimeCash).toLocaleString()}`)
      }
      lines.push('')
    }
  }

  return `${lines.join('\n')}\n`
}

const output = buildMarkdownReport()

writeFileSync(new URL('../docs/pacing-plan.md', import.meta.url), output)
console.log(output)
