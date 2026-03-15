import { useEffect } from 'react'
import { GameShell } from '@/components/GameShell'
import { ModalLayer } from './components/ModalLayer'
import { useGameStore } from './store/gameStore'

function App() {
  const setAppInfo = useGameStore((state) => state.setAppInfo)
  const loadGame = useGameStore((state) => state.loadGame)
  const saveGame = useGameStore((state) => state.saveGame)

  useEffect(() => {
    loadGame()
  }, [loadGame])

  useEffect(() => {
    let lastTickAt = performance.now()

    const intervalId = window.setInterval(() => {
      const now = performance.now()
      const deltaSeconds = (now - lastTickAt) / 1000
      lastTickAt = now

      useGameStore.getState().tick(deltaSeconds)
    }, 100)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    const autosaveIntervalId = window.setInterval(() => {
      const state = useGameStore.getState()

      if (state.settings.autosaveEnabled) {
        state.saveGame()
      }
    }, 15_000)

    const handleBeforeUnload = () => {
      useGameStore.getState().saveGame()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.clearInterval(autosaveIntervalId)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [saveGame])

  useEffect(() => {
    const loadAppInfo = async (): Promise<void> => {
      if (!window.game?.getAppInfo) {
        return
      }

      const info = await window.game.getAppInfo()
      setAppInfo(info)
    }

    void loadAppInfo()
  }, [setAppInfo])

  return (
    <>
      <GameShell />
      <ModalLayer />
    </>
  )
}

export default App
