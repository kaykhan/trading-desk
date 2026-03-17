import { AlertTriangle, Receipt, Scale, TimerReset } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'
import {
  getComplianceActionSummary,
  getBaseComplianceBurden,
  getBaseComplianceCostBreakdown,
  getComplianceBurden,
  getComplianceCategoryDriverSummary,
  getComplianceCategoryOutstandingDue,
  getCompliancePaymentPenaltyHint,
  getCompliancePaymentStatusLabel,
  getComplianceCostBreakdown,
  getComplianceEfficiencyMultiplier,
  getComplianceReviewDueAmount,
  getComplianceReviewLabel,
  getComplianceRevealBurdenThreshold,
  getTotalComplianceSavingsFromLobbying,
  getComplianceStatusCopy,
  getTopComplianceSources,
} from '@/utils/compliance'
import { getComplianceBurdenRelief } from '@/utils/lobbying'
import { formatCurrency, formatMultiplier, formatNumber } from '@/utils/formatting'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { SummaryTile } from './DashboardPrimitives'

const COMPLIANCE_CATEGORY_CONFIG = [
  { id: 'staff', title: 'Staff Compliance' },
  { id: 'energy', title: 'Energy Compliance' },
  { id: 'automation', title: 'Automation Compliance' },
  { id: 'institutional', title: 'Institutional Compliance' },
] as const

function getStatusToneClasses(statusLabel: string): string {
  if (statusLabel === 'Overdue') {
    return 'border-red-400/45 bg-red-500/10 text-red-200'
  }

  if (statusLabel === 'Due now') {
    return 'border-amber-400/45 bg-amber-500/10 text-amber-100'
  }

  return 'border-emerald-400/35 bg-emerald-500/8 text-emerald-200'
}

export function ComplianceTab() {
  const gameState = useGameStore((state) => state)
  const burden = getComplianceBurden(gameState)
  const baseBurden = getBaseComplianceBurden(gameState)
  const burdenRelief = getComplianceBurdenRelief(gameState)
  const efficiencyMultiplier = getComplianceEfficiencyMultiplier(gameState)
  const reviewLabel = getComplianceReviewLabel(gameState)
  const baseBreakdown = getBaseComplianceCostBreakdown(gameState)
  const breakdown = getComplianceCostBreakdown(gameState)
  const projectedBill = getComplianceReviewDueAmount(gameState)
  const totalSavings = getTotalComplianceSavingsFromLobbying(gameState)
  const lastPayment = gameState.lastCompliancePayment
  const topSources = getTopComplianceSources(gameState)
  const statusCopy = getComplianceStatusCopy(gameState)
  const actionSummary = getComplianceActionSummary(gameState)
  const revealThreshold = getComplianceRevealBurdenThreshold()
  const efficiencyPercent = efficiencyMultiplier * 100
  const dragPercent = Math.max(0, (1 - efficiencyMultiplier) * 100)
  const payComplianceCategory = useGameStore((state) => state.payComplianceCategory)
  const setComplianceAutoPayEnabled = useGameStore((state) => state.setComplianceAutoPayEnabled)

  return (
    <Card className="terminal-panel h-full rounded-2xl border-border/80 bg-card/92">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-[0.16em]">Compliance</CardTitle>
        <CardDescription className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Regulatory drag, recurring oversight costs, and operating pressure</CardDescription>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-2">
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          <SummaryTile label="Compliance Burden" value={formatNumber(burden, { decimalsBelowThreshold: burden < 100 ? 1 : 0 })} icon={Scale} infoTooltip={`Compliance becomes materially noticeable around burden ${revealThreshold}.`} />
          <SummaryTile label="Effective Efficiency" value={formatMultiplier(efficiencyMultiplier)} icon={AlertTriangle} infoTooltip="Applies to human, institutional, and automation output." />
          <SummaryTile label="Next Review" value={reviewLabel} icon={TimerReset} infoTooltip="Compliance reviews deduct the current projected bill every 60 seconds." />
          <SummaryTile label="Projected Bill" value={formatCurrency(projectedBill, projectedBill < 100 ? 1 : 0)} icon={Receipt} infoTooltip="Estimate based on your current staff, infrastructure energy footprint, automation, and institutions." />
        </div>

        <div className="rounded-xl border border-primary/25 bg-primary/10 p-2 text-[11px] text-foreground">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] uppercase tracking-[0.18em] text-primary">Compliance readout</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-primary">Drag -{formatNumber(dragPercent, { decimalsBelowThreshold: 1 })}%</span>
          </div>
          <p className="mt-1 leading-4">{actionSummary}</p>
          <p className="mt-2 text-[10px] leading-4 text-primary/90">{statusCopy}</p>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <div className="rounded-xl border border-border/80 bg-background/65 p-2 text-[11px]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Burden mitigation</p>
            <p className="mt-1 font-mono text-foreground">{formatNumber(baseBurden, { decimalsBelowThreshold: 1 })} {'->'} {formatNumber(burden, { decimalsBelowThreshold: 1 })}</p>
            <p className="mt-1 text-[10px] text-primary">Lobbying relief: -{formatNumber(burdenRelief, { decimalsBelowThreshold: 1 })}</p>
          </div>
          <div className="rounded-xl border border-border/80 bg-background/65 p-2 text-[11px]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Review cost mitigation</p>
            <p className="mt-1 font-mono text-foreground">{formatCurrency(baseBreakdown.total, baseBreakdown.total < 100 ? 1 : 0)} {'->'} {formatCurrency(breakdown.total, breakdown.total < 100 ? 1 : 0)}</p>
            <p className="mt-1 text-[10px] text-primary">Lobbying savings: -{formatCurrency(totalSavings, totalSavings < 100 ? 1 : 0)}</p>
          </div>
          <div className="rounded-xl border border-border/80 bg-background/65 p-2 text-[11px]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Review cadence</p>
            <p className="mt-1 font-mono text-foreground">{reviewLabel}</p>
            <p className="mt-1 text-[10px] text-primary">Projected due: {formatCurrency(projectedBill, projectedBill < 100 ? 1 : 0)}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-background/65 p-3 text-[11px]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.18em] text-primary">Compliance Review</p>
            <span className="text-[10px] leading-4 text-muted-foreground">Pay categories individually. Auto-pay applies per category and settles current overdue amounts when enabled.</span>
          </div>
        </div>

        <ScrollArea className="h-full min-h-0 pr-2">
          <div className="space-y-3">
            <div className="rounded-xl border border-border/80 bg-background/65 p-3 text-[11px]">
              <div className="space-y-2">
                {COMPLIANCE_CATEGORY_CONFIG.map((category) => {
                  const dueAmount = getComplianceCategoryOutstandingDue(gameState, category.id)
                  const statusLabel = getCompliancePaymentStatusLabel(gameState, category.id)
                  const penaltyHint = getCompliancePaymentPenaltyHint(category.id)
                  const driverSummary = getComplianceCategoryDriverSummary(gameState, category.id)
                  const autoPayEnabled = gameState.settings.complianceAutoPayEnabled[category.id]

                  return (
                    <div key={category.id} className={`rounded-lg border p-2.5 ${getStatusToneClasses(statusLabel)}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.14em] text-primary">{category.title}</p>
                          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{penaltyHint}</p>
                          <p className="mt-1 text-[10px] leading-4 text-primary/85">{driverSummary}</p>
                          <p className="mt-1 text-[10px] leading-4 text-primary/85">
                            Base {formatCurrency(baseBreakdown[category.id], baseBreakdown[category.id] < 100 ? 1 : 0)} {'->'} Effective {formatCurrency(breakdown[category.id], breakdown[category.id] < 100 ? 1 : 0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm text-foreground">{formatCurrency(dueAmount, dueAmount < 100 ? 1 : 0)}</p>
                          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{statusLabel}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap justify-end gap-2">
                        <Button
                          size="xs"
                          variant={autoPayEnabled ? 'default' : 'outline'}
                          className="rounded-md uppercase tracking-[0.12em]"
                          onClick={() => setComplianceAutoPayEnabled(category.id, !autoPayEnabled)}
                        >
                          Auto-Pay: {autoPayEnabled ? 'On' : 'Off'}
                        </Button>
                        <Button size="xs" className="rounded-md uppercase tracking-[0.12em]" onClick={() => payComplianceCategory(category.id)}>
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Separator className="my-3 bg-border/60" />
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Last review payment</span>
                <span className="font-mono text-primary">{formatCurrency(lastPayment, lastPayment < 100 ? 1 : 0)}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Effective efficiency</span>
                <span className="font-mono text-primary">{formatNumber(efficiencyPercent, { decimalsBelowThreshold: 1 })}%</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Compliance drag</span>
                <span className="font-mono text-primary">-{formatNumber(dragPercent, { decimalsBelowThreshold: 1 })}%</span>
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-background/65 p-3 text-[11px]">
              <div className="flex items-center gap-2">
                <Scale className="size-3.5 text-primary" />
                <p className="text-[10px] uppercase tracking-[0.18em] text-primary">Top burden sources</p>
              </div>
              <div className="mt-2 space-y-2">
                {topSources.length > 0 ? topSources.map((source) => (
                  <div key={source.label} className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{source.label}</span>
                    <span className="font-mono text-primary">{formatNumber(source.value, { decimalsBelowThreshold: source.value < 100 ? 1 : 0 })}</span>
                  </div>
                )) : (
                  <p className="text-muted-foreground">Compliance is still negligible. The desk remains under light oversight.</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border/80 bg-background/65 p-3 text-[11px] text-muted-foreground">
              Lobbying relief is not active yet, but this system is now structured so future policies can reduce compliance burden, efficiency drag, and category costs.
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
