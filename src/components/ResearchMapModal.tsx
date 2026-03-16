import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ResearchTreeContent } from '@/components/dashboard/ResearchTab'

export function ResearchMapModal() {
  return (
    <DialogContent className="flex max-h-[92vh] max-w-[96vw] flex-col border-border/80 bg-card/95 text-foreground sm:max-w-[94vw]">
      <DialogHeader>
        <DialogTitle>Research branches</DialogTitle>
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
        <ResearchTreeContent expanded />
      </div>
    </DialogContent>
  )
}
