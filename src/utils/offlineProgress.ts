import { GAME_CONSTANTS } from '../data/constants'

export function getOfflineSecondsApplied(lastSaveTimestamp: number, now: number = Date.now()): number {
  const elapsedSeconds = Math.max(0, Math.floor((now - lastSaveTimestamp) / 1000))
  return Math.min(elapsedSeconds, GAME_CONSTANTS.offlineProgressCapSeconds)
}

export function getElapsedOfflineSeconds(lastSaveTimestamp: number, now: number = Date.now()): number {
  return Math.max(0, Math.floor((now - lastSaveTimestamp) / 1000))
}
