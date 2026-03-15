import { useGameStore } from '../store/gameStore'

export function FooterBar() {
  const appInfo = useGameStore((state) => state.appInfo)
  const openModal = useGameStore((state) => state.openModal)
  const autosaveEnabled = useGameStore((state) => state.settings.autosaveEnabled)

  return (
    <footer className="footer-bar panel-shell">
      <div>
        <p className="panel-kicker">Persistence Status</p>
        <p className="panel-note">
          Local saves, export/import, and offline progress are wired in for long-run play.
        </p>
      </div>

      <div className="footer-actions">
        <span className="footer-runtime">Autosave {autosaveEnabled ? 'on' : 'off'}</span>
        <span className="footer-runtime">{appInfo ? `${appInfo.platform}` : 'Renderer preview mode'}</span>
        <button type="button" className="ghost-button" onClick={() => openModal('saveImport')}>
          Open Save Modal
        </button>
      </div>
    </footer>
  )
}
