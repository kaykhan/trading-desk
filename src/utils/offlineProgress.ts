import { mechanics } from '../lib/mechanics'

export function getOfflineSecondsApplied(lastSaveTimestamp: number, now: number = Date.now()): number {
  const elapsedSeconds = Math.max(0, Math.floor((now - lastSaveTimestamp) / 1000))
  return Math.min(elapsedSeconds, mechanics.runtime.offline.capSeconds)
}

export function getElapsedOfflineSeconds(lastSaveTimestamp: number, now: number = Date.now()): number {
  return Math.max(0, Math.floor((now - lastSaveTimestamp) / 1000))
}
