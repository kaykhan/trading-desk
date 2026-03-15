import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
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
    <DialogContent className="max-w-2xl border-border/80 bg-card/95 text-foreground">
      <DialogHeader>
        <DialogTitle>Save and import</DialogTitle>
        <DialogDescription>
          Autosave runs every 15 seconds and also saves on browser unload. Export gives you a portable backup string.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            saveGame()
            setMessage('Game saved locally.')
          }}
        >
          Save now
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const exportedSave = exportSave()
            setSaveText(exportedSave)
            void navigator.clipboard?.writeText(exportedSave).catch(() => undefined)
            setMessage('Save exported. Clipboard copy attempted.')
          }}
        >
          Export save
        </Button>
      </div>
      <label className="grid gap-2 text-sm text-muted-foreground">
        <span className="uppercase tracking-[0.2em] text-[11px]">Exported Save</span>
        <Textarea value={saveText} readOnly rows={5} className="font-mono text-xs" />
      </label>
      <label className="grid gap-2 text-sm text-muted-foreground">
        <span className="uppercase tracking-[0.2em] text-[11px]">Import Save</span>
        <Textarea value={importText} onChange={(event) => setImportText(event.target.value)} rows={5} className="font-mono text-xs" />
      </label>
      <DialogFooter className="border-border/70 bg-muted/20 sm:items-center sm:justify-between">
        <span className="text-sm text-muted-foreground">{message}</span>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
          type="button"
          onClick={() => {
            const success = importSave(importText)
            setMessage(success ? 'Save imported successfully.' : 'Import failed. Check the save string.')
          }}
        >
          Import save
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  )
}
