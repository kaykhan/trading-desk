import { BarChart3, BrainCircuit, Gauge, Landmark, Settings2, TrendingUp } from 'lucide-react'
import { DeskTab } from '@/components/dashboard/DeskTab'
import { HeaderStats } from '@/components/dashboard/HeaderStats'
import { LobbyingTab } from '@/components/dashboard/LobbyingTab'
import { OptimizationsTab } from '@/components/dashboard/OptimizationsTab'
import { PrestigeTab } from '@/components/dashboard/PrestigeTab'
import { ResearchTab } from '@/components/dashboard/ResearchTab'
import { SettingsTab } from '@/components/dashboard/SettingsTab'
import { StatsTab } from '@/components/dashboard/StatsTab'
import { UpgradesTab } from '@/components/dashboard/UpgradesTab'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'

export function GameShell() {
  const activeTab = useGameStore((state) => state.activeTab)
  const setActiveTab = useGameStore((state) => state.setActiveTab)
  const lobbyingUnlocked = useGameStore(selectors.lobbyingUnlocked)
  const safeActiveTab = activeTab === 'desk' ? 'upgrades' : activeTab

  return (
    <main className="dashboard-shell h-[100dvh] max-h-[100dvh] overflow-hidden">
      <HeaderStats />

      <section className="grid min-h-0 flex-1 gap-2 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <DeskTab />

          <Tabs value={safeActiveTab} onValueChange={(value) => setActiveTab(value as typeof safeActiveTab)} className="min-h-0 flex flex-col overflow-hidden">
            <TabsList className="grid h-auto w-full shrink-0 grid-cols-7 gap-1 rounded-xl border border-border/80 bg-card/92 p-1">
              <TabsTrigger value="upgrades" className="gap-1.5 py-2 text-[10px] uppercase tracking-[0.12em] aria-selected:bg-primary aria-selected:text-primary-foreground"><TrendingUp className="size-3.5" />Upgrades</TabsTrigger>
              <TabsTrigger value="optimizations" className="gap-1.5 py-2 text-[10px] uppercase tracking-[0.12em] aria-selected:bg-primary aria-selected:text-primary-foreground"><Gauge className="size-3.5" />Optimizations</TabsTrigger>
              <TabsTrigger value="research" className="gap-1.5 py-2 text-[10px] uppercase tracking-[0.12em] aria-selected:bg-primary aria-selected:text-primary-foreground"><BrainCircuit className="size-3.5" />Research</TabsTrigger>
            <TabsTrigger value="lobbying" title={lobbyingUnlocked ? 'Lobbying unlocked' : 'Unlock with Regulatory Affairs in Research'} className={`gap-1.5 py-2 text-[10px] uppercase tracking-[0.12em] aria-selected:bg-primary aria-selected:text-primary-foreground ${!lobbyingUnlocked ? 'bg-background/45 text-muted-foreground' : ''}`}><Landmark className="size-3.5" />Lobbying</TabsTrigger>
            <TabsTrigger value="prestige" className="gap-1.5 py-2 text-[10px] uppercase tracking-[0.12em] aria-selected:bg-primary aria-selected:text-primary-foreground"><BarChart3 className="size-3.5" />Prestige</TabsTrigger>
            <TabsTrigger value="stats" className="gap-1.5 py-2 text-[10px] uppercase tracking-[0.12em] aria-selected:bg-primary aria-selected:text-primary-foreground"><Landmark className="size-3.5" />Stats</TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 py-2 text-[10px] uppercase tracking-[0.12em] aria-selected:bg-primary aria-selected:text-primary-foreground"><Settings2 className="size-3.5" />Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="upgrades" className="min-h-0 overflow-hidden"><UpgradesTab /></TabsContent>
          <TabsContent value="optimizations" className="min-h-0 overflow-hidden"><OptimizationsTab /></TabsContent>
          <TabsContent value="research" className="min-h-0 overflow-hidden"><ResearchTab /></TabsContent>
          <TabsContent value="lobbying" className="min-h-0 overflow-hidden">
            {lobbyingUnlocked ? (
              <LobbyingTab />
            ) : (
              <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
                <CardHeader>
                  <CardTitle className="text-base uppercase tracking-[0.16em]">Lobbying</CardTitle>
                  <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Locked system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-[11px] text-muted-foreground">
                  <div className="rounded-xl border border-border/80 bg-background/65 p-3">
                    Unlock lobbying by researching `Regulatory Affairs` in the `Research` tab.
                  </div>
                  <div className="rounded-xl border border-border/80 bg-background/65 p-3">
                    Once unlocked, influence lets you pass labor, energy, market, and technology policies.
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="prestige" className="min-h-0 overflow-hidden"><PrestigeTab /></TabsContent>
          <TabsContent value="stats" className="min-h-0 overflow-hidden"><StatsTab /></TabsContent>
          <TabsContent value="settings" className="min-h-0 overflow-hidden"><SettingsTab /></TabsContent>
        </Tabs>
      </section>
    </main>
  )
}
