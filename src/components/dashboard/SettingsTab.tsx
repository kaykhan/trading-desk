import { RotateCcw, Save } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SettingsTab() {
  const openModal = useGameStore((state) => state.openModal)
  const autosaveEnabled = useGameStore((state) => state.settings.autosaveEnabled)
  const appInfo = useGameStore((state) => state.appInfo)

  return (
    <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-[0.16em]">Settings</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Save management and utility controls</CardDescription>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-3">
        <div className="rounded-xl border border-border/80 bg-background/65 p-2.5 text-[11px] text-muted-foreground">
          Autosave is currently <span className="font-semibold text-primary">{autosaveEnabled ? 'enabled' : 'disabled'}</span>.
        </div>
        <div className="rounded-xl border border-border/80 bg-background/65 p-2.5 text-[11px] text-muted-foreground">
          Build version: <span className="font-mono text-primary">{appInfo?.version ?? 'dev'}</span>
        </div>
        <Button variant="outline" size="xs" className="justify-start rounded-md uppercase tracking-[0.12em]" onClick={() => openModal('saveImport')}>
          <Save className="mr-2 size-4" /> Save and import
        </Button>
        <Button variant="outline" size="xs" className="justify-start rounded-md border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive uppercase tracking-[0.12em]" onClick={() => openModal('resetConfirm')}>
          <RotateCcw className="mr-2 size-4" /> Reset save
        </Button>
      </CardContent>
    </Card>
  )
}
