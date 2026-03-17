import { MILESTONES } from '../src/data/milestones'
import type { MilestoneId } from '../src/types/game'
import { getCashPerSecond, getInfluencePerSecond, getPowerCapacity, getPowerUsage, getResearchPointsPerSecond } from '../src/utils/economy'
import { getTotalDeskSlots, getUsedDeskSlots } from '../src/utils/capacity'
import { getFinalUnlockedCount } from '../src/sim/simMetrics'
import { runSimulation } from '../src/sim/simRunner'
import type { SimConfig, SimResult } from '../src/sim/simState'
import { DEFAULT_SIM_CONFIG, PRESTIGE_AWARE_SIM_CONFIG, ROI_SIM_CONFIG, getMilestoneDefinition } from '../src/sim/simState'
import { getPolicyBottleneckSummary } from '../src/sim/simActions'

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  return `${hours}h ${minutes}m ${remainingSeconds}s`
}

type NamedRun = {
  label: string
  config: SimConfig
}

function printReport(label: string, result: SimResult): void {
  console.log(`${label} Simulation Report`)
  console.log('===========================')
  console.log(`Total simulated time: ${formatDuration(result.state.timeSeconds)}`)
  console.log(`Runs completed: ${result.state.runIndex}`)
  console.log(`Unique milestones reached across runs: ${result.metrics.seenMilestoneIds.size}/${MILESTONES.length}`)
  console.log(`Unlocked in final state: ${getFinalUnlockedCount(result.state)}/${MILESTONES.length}`)
  console.log(`Stalled: ${result.stalled ? 'yes' : 'no'}`)
  if (result.metrics.stallReason) {
    console.log(`Stall reason: ${result.metrics.stallReason}`)
  }
  console.log('')
  console.log('Final economy snapshot')
  console.log('----------------------')
  console.log(`Cash: ${Math.floor(result.state.game.cash).toLocaleString()} | CPS: ${getCashPerSecond(result.state.game).toFixed(2)}`)
  console.log(`Research: ${Math.floor(result.state.game.researchPoints).toLocaleString()} | RPS: ${getResearchPointsPerSecond(result.state.game).toFixed(2)}`)
  console.log(`Influence: ${Math.floor(result.state.game.influence).toLocaleString()} | IPS: ${getInfluencePerSecond(result.state.game).toFixed(3)}`)
  console.log(`Reputation: ${result.state.game.reputation} | Spent: ${result.state.game.reputationSpent}`)
  console.log(`Prestige count: ${result.state.game.prestigeCount}`)
  console.log(`Desk slots: ${getUsedDeskSlots(result.state.game)}/${getTotalDeskSlots(result.state.game)}`)
  console.log(`Power: ${getPowerUsage(result.state.game).toFixed(1)}/${getPowerCapacity(result.state.game).toFixed(1)}`)
  console.log('')
  console.log('Key milestones')
  console.log('--------------')

  const keyMilestones: MilestoneId[] = [
    'unlockResearch',
    'firstExtraSector',
    'firstPropDesk',
    'unlockAutomation',
    'unlockLobbying',
    'unlockBoosts',
    'firstPrestige',
    'unlockOptimisations',
    'tenOptimisationRanks',
    'onyxLegacy',
  ]

  for (const milestoneId of keyMilestones) {
    const record = result.metrics.unlockRecords.find((entry) => entry.milestoneId === milestoneId)
    const labelText = getMilestoneDefinition(milestoneId)?.name ?? milestoneId
    console.log(`${labelText}: ${record ? `${formatDuration(record.elapsedSeconds)} (run ${record.run})` : 'not reached'}`)
  }

  console.log('')
  console.log('Remaining milestones')
  console.log('--------------------')
  if (result.remainingMilestones.length <= 0) {
    console.log('None')
  } else {
    for (const milestoneId of result.remainingMilestones) {
      console.log(`${milestoneId} - ${getMilestoneDefinition(milestoneId)?.name ?? milestoneId}`)
    }
  }

  console.log('')
  console.log('Bottlenecks')
  console.log('-----------')
  const bottlenecks = (result.metrics.stallReason?.split('; ').filter(Boolean) ?? []).length > 0
    ? result.metrics.stallReason?.split('; ').filter(Boolean) ?? []
    : getPolicyBottleneckSummary(result.state)
  if (bottlenecks.length <= 0) {
    console.log('No explicit bottleneck summary recorded')
  } else {
    for (const bottleneck of bottlenecks) {
      console.log(bottleneck)
    }
  }

  console.log('')
}

function printComparisonSummary(results: NamedRunResult[]): void {
  console.log('Policy Comparison')
  console.log('=================')

  const sortedByProgress = [...results].sort((left, right) => right.result.metrics.seenMilestoneIds.size - left.result.metrics.seenMilestoneIds.size)
  console.log(`Best total milestone progress: ${sortedByProgress[0]?.label ?? 'n/a'} (${sortedByProgress[0]?.result.metrics.seenMilestoneIds.size ?? 0}/${MILESTONES.length})`)

  const keyMilestones: MilestoneId[] = [
    'unlockResearch',
    'firstExtraSector',
    'firstPropDesk',
    'unlockAutomation',
    'unlockLobbying',
    'firstPrestige',
    'unlockOptimisations',
  ]

  for (const milestoneId of keyMilestones) {
    const label = getMilestoneDefinition(milestoneId)?.name ?? milestoneId
    const ranked = results
      .map((entry) => ({
        label: entry.label,
        record: entry.result.metrics.unlockRecords.find((unlock) => unlock.milestoneId === milestoneId),
      }))
      .sort((left, right) => {
        if (left.record && right.record) return left.record.elapsedSeconds - right.record.elapsedSeconds
        if (left.record) return -1
        if (right.record) return 1
        return 0
      })

    const winner = ranked[0]
    console.log(`${label}: ${winner?.record ? `${winner.label} at ${formatDuration(winner.record.elapsedSeconds)}` : 'not reached by any policy'}`)
  }

  console.log('')
  console.log('Order Anomalies')
  console.log('---------------')
  for (const entry of results) {
    const anomalies: string[] = []
    const firstSenior = entry.result.metrics.unlockRecords.find((record) => record.milestoneId === 'firstSeniorScientist')
    const firstJunior = entry.result.metrics.unlockRecords.find((record) => record.milestoneId === 'firstJuniorScientist')
    if (firstSenior && !firstJunior) {
      anomalies.push('reached senior scientist milestone before junior scientist milestone')
    }

    const firstPropDesk = entry.result.metrics.unlockRecords.find((record) => record.milestoneId === 'firstPropDesk')
    const firstInstitutionalDesk = entry.result.metrics.unlockRecords.find((record) => record.milestoneId === 'firstInstitutionalDesk')
    if (firstInstitutionalDesk && !firstPropDesk) {
      anomalies.push('reached institutional desk milestone before prop desk milestone')
    }

    const unlockAutomation = entry.result.metrics.unlockRecords.find((record) => record.milestoneId === 'unlockAutomation')
    console.log(`${entry.label}: ${anomalies.length > 0 ? anomalies.join('; ') : 'none detected in current checks'}`)
  }

  console.log('')
}

type NamedRunResult = {
  label: string
  result: SimResult
}

const runs: NamedRun[] = [
  { label: 'Unlock Chasing', config: DEFAULT_SIM_CONFIG },
  { label: 'ROI', config: ROI_SIM_CONFIG },
  { label: 'Prestige Aware', config: PRESTIGE_AWARE_SIM_CONFIG },
]

const results: NamedRunResult[] = runs.map((entry) => ({
  label: entry.label,
  result: runSimulation(entry.config),
}))

for (const entry of results) {
  printReport(entry.label, entry.result)
}

printComparisonSummary(results)
