import { useGameStore } from '@/store/gameStore'
import { selectors } from '@/store/selectors'
import { formatCurrency, formatRate } from '@/utils/formatting'
import { Card, CardContent } from '@/components/ui/card'

export function HeaderStats() {
  const cash = useGameStore((state) => state.cash)
  const reputation = useGameStore((state) => state.reputation)
  const cashPerClick = useGameStore(selectors.cashPerClick)
  const cashPerSecond = useGameStore(selectors.cashPerSecond)
  const prestigePreview = useGameStore(selectors.prestigeGainPreview)

  const stats = [
    { label: 'Cash', value: formatCurrency(cash, cash < 100 ? 1 : 0) },
    { label: 'Per Click', value: formatCurrency(cashPerClick, cashPerClick < 100 ? 1 : 0) },
    { label: 'Per Sec', value: formatRate(cashPerSecond) },
    { label: 'Reputation', value: reputation.toLocaleString() },
    { label: 'Reset Yield', value: `${prestigePreview} rep` },
  ]

  return (
    <div className="rounded-xl border border-border/80 bg-card/92 p-2 xl:self-end">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-primary">Economy Snapshot</p>
          <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">Core run numbers stay visible while you trade and manage the desk.</p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.label} className="terminal-panel rounded-lg border-border/80 bg-card/90 py-0.5">
          <CardContent className="px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
            <p className="mt-0.5 font-mono text-[12px] font-semibold text-foreground xl:text-[13px]">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
      </div>
    </div>
  )
}
