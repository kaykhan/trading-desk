import { useGameStore } from '../store/gameStore'
import { OfflineEarningsModal } from './OfflineEarningsModal'
import { PrestigeConfirmModal } from './PrestigeConfirmModal'
import { SaveImportModal } from './SaveImportModal'

export function ModalLayer() {
  const activeModal = useGameStore((state) => state.activeModal)
  const closeModal = useGameStore((state) => state.closeModal)

  if (!activeModal) {
    return null
  }

  return (
    <div className="modal-layer" role="presentation">
      <div className="modal-backdrop" onClick={closeModal} aria-hidden="true" />
      <div className="modal-frame" role="dialog" aria-modal="true">
        {activeModal === 'saveImport' && <SaveImportModal onClose={closeModal} />}
        {activeModal === 'prestigeConfirm' && <PrestigeConfirmModal onClose={closeModal} />}
        {activeModal === 'offlineEarnings' && <OfflineEarningsModal onClose={closeModal} />}
      </div>
    </div>
  )
}
