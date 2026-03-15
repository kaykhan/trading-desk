import { BarChart3, BrainCircuit, Landmark, Settings2 } from 'lucide-react'
import { DeskTab } from '@/components/dashboard/DeskTab'
import { HeaderStats } from '@/components/dashboard/HeaderStats'
import { PrestigeTab } from '@/components/dashboard/PrestigeTab'
import { ResearchTab } from '@/components/dashboard/ResearchTab'
import { SettingsTab } from '@/components/dashboard/SettingsTab'
import { StatsTab } from '@/components/dashboard/StatsTab'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGameStore } from '@/store/gameStore'

const tabMetaById = {
  research: {
    label: 'Research',
    description: 'Review the full research list outside the main desk flow.',
  },
  prestige: {
    label: 'Prestige',
    description: 'Convert a strong run into permanent Reputation gains.',
  },
  stats: {
    label: 'Stats',
    description: 'Inspect income sources, counts, and permanent multipliers.',
  },
  settings: {
    label: 'Settings',
    description: 'Manage saves and utility controls.',
  },
} as const

export function GameShell() {
  const activeTab = useGameStore((state) => state.activeTab)
  const setActiveTab = useGameStore((state) => state.setActiveTab)
  const safeActiveTab = activeTab === 'desk' ? 'research' : activeTab
  const activeTabMeta = tabMetaById[safeActiveTab]

  return (
    <main className="dashboard-shell h-[100dvh] max-h-[100dvh] overflow-hidden">
      <HeaderStats />

      <section className="grid min-h-0 flex-1 gap-2 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <DeskTab />

        <Tabs value={safeActiveTab} onValueChange={(value) => setActiveTab(value as typeof safeActiveTab)} className="min-h-0 flex flex-col overflow-hidden">
          <Card className="terminal-panel shrink-0 rounded-xl border-border/80 bg-card/92">
            <CardContent className="space-y-2 p-2.5">
              <TabsList className="grid h-auto w-full grid-cols-4 gap-1 rounded-xl border border-border/80 bg-background/65 p-1">
                <TabsTrigger value="research" className="gap-1.5 py-2 text-[10px] uppercase tracking-[0.12em] data-active:bg-primary data-active:text-primary-foreground"><BrainCircuit className="size-3.5" />Research</TabsTrigger>
                <TabsTrigger value="prestige" className="gap-1.5 py-2 text-[10px] uppercase tracking-[0.12em] data-active:bg-primary data-active:text-primary-foreground"><BarChart3 className="size-3.5" />Prestige</TabsTrigger>
                <TabsTrigger value="stats" className="gap-1.5 py-2 text-[10px] uppercase tracking-[0.12em] data-active:bg-primary data-active:text-primary-foreground"><Landmark className="size-3.5" />Stats</TabsTrigger>
                <TabsTrigger value="settings" className="gap-1.5 py-2 text-[10px] uppercase tracking-[0.12em] data-active:bg-primary data-active:text-primary-foreground"><Settings2 className="size-3.5" />Settings</TabsTrigger>
              </TabsList>

              <p className="text-[11px] leading-4 text-muted-foreground">{activeTabMeta.description}</p>
            </CardContent>
          </Card>

          <TabsContent value="research" className="min-h-0 overflow-hidden"><ResearchTab /></TabsContent>
          <TabsContent value="prestige" className="min-h-0 overflow-hidden"><PrestigeTab /></TabsContent>
          <TabsContent value="stats" className="min-h-0 overflow-hidden"><StatsTab /></TabsContent>
          <TabsContent value="settings" className="min-h-0 overflow-hidden"><SettingsTab /></TabsContent>
        </Tabs>
      </section>
    </main>
  )
}
