import { useEffect } from 'react'
import './App.css'
import { FooterBar } from './components/FooterBar'
import { IncomeBreakdownPanel } from './components/IncomeBreakdownPanel'
import { ModalLayer } from './components/ModalLayer'
import { PrestigePanel } from './components/PrestigePanel'
import { ShopPanel } from './components/ShopPanel'
import { StatsPanel } from './components/StatsPanel'
import { TopBar } from './components/TopBar'
import { TradePanel } from './components/TradePanel'
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
    <main className="app-shell">
      <TopBar />

      <section className="dashboard-grid">
        <div className="dashboard-main">
          <TradePanel />
          <ShopPanel />
        </div>

        <aside className="dashboard-side">
          <StatsPanel />
          <IncomeBreakdownPanel />
          <PrestigePanel />
        </aside>
      </section>

      <FooterBar />
      <ModalLayer />
    </main>
  )
}

export default App
