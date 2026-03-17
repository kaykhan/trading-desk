import { Dialog } from '@/components/ui/dialog'
import { useGameStore } from '../store/gameStore'
import { MarketEventsModal } from './MarketEventsModal'
import { MilestonesModal } from './MilestonesModal'
import { OfflineEarningsModal } from './OfflineEarningsModal'
import { PrestigeConfirmModal } from './PrestigeConfirmModal'
import { ResetConfirmModal } from './ResetConfirmModal'
import { ResearchMapModal } from './ResearchMapModal'
import { SaveImportModal } from './SaveImportModal'

export function ModalLayer() {
  const activeModal = useGameStore((state) => state.activeModal)
  const closeModal = useGameStore((state) => state.closeModal)

  if (!activeModal) {
    return null
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) closeModal() }}>
      {activeModal === 'saveImport' && <SaveImportModal onClose={closeModal} />}
      {activeModal === 'prestigeConfirm' && <PrestigeConfirmModal onClose={closeModal} />}
      {activeModal === 'resetConfirm' && <ResetConfirmModal onClose={closeModal} />}
      {activeModal === 'offlineEarnings' && <OfflineEarningsModal onClose={closeModal} />}
      {activeModal === 'researchMap' && <ResearchMapModal />}
      {activeModal === 'marketEvents' && <MarketEventsModal />}
      {activeModal === 'milestones' && <MilestonesModal />}
    </Dialog>
  )
}
