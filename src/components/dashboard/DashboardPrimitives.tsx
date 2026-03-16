import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ActionRowProps = {
  title: string
  description: string
  cost?: string
  status: string
  statusTone?: 'default' | 'ready' | 'locked' | 'done'
  actionLabel: string
  disabled: boolean
  disabledReason?: string
  onClick?: () => void
}

export type PurchaseCardProps = {
  title: string
  description: string
  cost?: string
  infoTooltip?: string
  status: string
  statusTone?: 'default' | 'ready' | 'locked' | 'done'
  actionLabel: string
  disabled: boolean
  disabledReason?: string
  badges?: string[]
  onClick?: () => void
  footer?: ReactNode
  compact?: boolean
}

export function SummaryTile({ label, value, icon: Icon, infoTooltip }: { label: string; value: string; icon: LucideIcon; infoTooltip?: string }) {
  return (
    <div className="rounded-xl border border-border/80 bg-background/70 p-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="size-3.5" />
        <span>{label}</span>
        {infoTooltip ? (
          <button
            type="button"
            title={infoTooltip}
            aria-label={`More info about ${label}`}
            className="inline-flex size-4 items-center justify-center rounded-sm border border-border/60 bg-background/50 text-muted-foreground transition hover:text-foreground"
          >
            <Info className="size-3" />
          </button>
        ) : null}
      </div>
      <p className="mt-1 font-mono text-[13px] font-semibold text-foreground xl:text-sm">{value}</p>
    </div>
  )
}

const statusToneClasses = {
  default: 'border-border/80 bg-card/70 text-primary',
  ready: 'border-primary/40 bg-primary/10 text-primary',
  locked: 'border-border/70 bg-background/50 text-muted-foreground',
  done: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
} as const

export function PurchaseCard({
  title,
  description,
  cost,
  infoTooltip,
  status,
  statusTone = 'default',
  actionLabel,
  disabled,
  disabledReason,
  badges,
  onClick,
  footer,
  compact = false,
}: PurchaseCardProps) {
  return (
    <div className={cn('rounded-xl border border-border/80 bg-background/65', compact ? 'p-1.5' : 'p-2')}>
      <div className={cn('grid lg:grid-cols-[1fr_auto] lg:items-center', compact ? 'gap-1.5' : 'gap-2')}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[13px] font-semibold leading-none text-foreground xl:text-sm">{title}</h3>
            {infoTooltip ? (
              <button
                type="button"
                title={infoTooltip}
                aria-label={`More info about ${title}`}
                className="inline-flex size-4 items-center justify-center rounded-sm border border-border/60 bg-background/50 text-muted-foreground transition hover:text-foreground"
              >
                <Info className="size-3" />
              </button>
            ) : null}
            <Badge
              variant="outline"
              className={cn(
                'h-5 rounded-md px-1.5 text-[10px] uppercase tracking-[0.12em]',
                statusToneClasses[statusTone],
              )}
            >
              {status}
            </Badge>
            {badges?.map((badge) => (
              <Badge key={badge} variant="outline" className="h-5 rounded-md border-border/80 bg-background/60 px-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {badge}
              </Badge>
            ))}
          </div>
          {!infoTooltip ? <p className="mt-1 text-[11px] leading-4 text-muted-foreground xl:text-xs">{description}</p> : null}
          {!infoTooltip && cost ? <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-primary">{cost}</p> : null}
          {disabled && disabledReason ? <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{disabledReason}</p> : null}
        </div>
        <Button size="xs" variant={disabled ? 'outline' : 'default'} className="w-full rounded-md uppercase tracking-[0.08em] lg:w-auto" disabled={disabled} onClick={onClick}>
          {actionLabel}
        </Button>
      </div>
      {footer ? <div className={cn('border-t border-border/60', compact ? 'mt-1.5 pt-1.5' : 'mt-2 pt-2')}>{footer}</div> : null}
    </div>
  )
}

export function ActionRow({ title, description, cost, status, statusTone = 'default', actionLabel, disabled, disabledReason, onClick }: ActionRowProps) {
  return <PurchaseCard title={title} description={description} cost={cost} status={status} statusTone={statusTone} actionLabel={actionLabel} disabled={disabled} disabledReason={disabledReason} onClick={onClick} />
}
