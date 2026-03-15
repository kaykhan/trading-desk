import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

type SaveImportModalProps = {
  onClose: () => void
}

export function SaveImportModal({ onClose }: SaveImportModalProps) {
  const saveGame = useGameStore((state) => state.saveGame)
  const exportSave = useGameStore((state) => state.exportSave)
  const importSave = useGameStore((state) => state.importSave)
  const [saveText, setSaveText] = useState('')
  const [importText, setImportText] = useState('')
  const [message, setMessage] = useState('')

  return (
    <section className="modal-card" aria-labelledby="save-modal-title">
      <div className="modal-header">
        <div>
          <p className="panel-kicker">Save System</p>
          <h2 id="save-modal-title">Import and export scaffold</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="modal-copy">
        <p className="panel-note">Autosave runs every 15 seconds and also saves on browser unload.</p>
        <p className="panel-note">Use export for a portable backup string or import to restore a run.</p>
      </div>
      <div className="modal-actions modal-actions-start">
        <button
          type="button"
          className="ghost-button"
          onClick={() => {
            saveGame()
            setMessage('Game saved locally.')
          }}
        >
          Save now
        </button>
        <button
          type="button"
          className="ghost-button"
          onClick={() => {
            const exportedSave = exportSave()
            setSaveText(exportedSave)
            void navigator.clipboard?.writeText(exportedSave).catch(() => undefined)
            setMessage('Save exported. Clipboard copy attempted.')
          }}
        >
          Export save
        </button>
      </div>
      <label className="modal-field">
        <span className="panel-kicker">Exported Save</span>
        <textarea value={saveText} readOnly rows={5} />
      </label>
      <label className="modal-field">
        <span className="panel-kicker">Import Save</span>
        <textarea value={importText} onChange={(event) => setImportText(event.target.value)} rows={5} />
      </label>
      <div className="modal-actions">
        <span className="modal-message">{message}</span>
        <button
          type="button"
          className="card-action"
          onClick={() => {
            const success = importSave(importText)
            setMessage(success ? 'Save imported successfully.' : 'Import failed. Check the save string.')
          }}
        >
          Import save
        </button>
      </div>
    </section>
  )
}
