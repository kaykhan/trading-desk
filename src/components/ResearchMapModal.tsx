import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ResearchTreeContent } from '@/components/dashboard/ResearchTab'

export function ResearchMapModal() {
  return (
    <DialogContent className="max-w-[96vw] border-border/80 bg-card/95 text-foreground sm:max-w-[94vw]">
      <DialogHeader>
        <DialogTitle>Research map</DialogTitle>
      </DialogHeader>
      <div className="max-h-[88vh] overflow-hidden">
        <ResearchTreeContent expanded />
      </div>
    </DialogContent>
  )
}
