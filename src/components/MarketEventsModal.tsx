import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EventsTab } from './dashboard/EventsTab'

export function MarketEventsModal() {
  return (
    <DialogContent className="max-w-[min(1360px,calc(100%-1.5rem))] rounded-2xl border border-border/90 bg-[rgba(18,18,18,0.98)] p-0 text-foreground shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:max-w-[min(1360px,calc(100%-1.5rem))]">
      <DialogHeader className="border-b border-border/80 p-4 pb-3">
        <DialogTitle className="text-base uppercase tracking-[0.16em]">Market Events</DialogTitle>
        <DialogDescription className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Live market conditions, timers, and the recent event tape.
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-[min(82vh,820px)] overflow-y-auto bg-[linear-gradient(180deg,rgba(24,24,24,0.98),rgba(16,16,16,1))] p-4">
        <EventsTab />
      </div>
    </DialogContent>
  )
}
