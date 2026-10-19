import { useEffect, useRef } from 'react'
import { useModalDialog } from '../hooks/useModalDialog.js'

export default function ConfirmDialog({
  isOpen,
  title = 'Подтверждение',
  message,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null)

  useModalDialog(isOpen, onCancel)

  useEffect(() => {
    if (!isOpen) return

    const frame = requestAnimationFrame(() => {
      cancelRef.current?.focus()
    })

    return () => cancelAnimationFrame(frame)
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget) onCancel()
  }

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        className="modal modal--confirm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <h3 className="modal__title" id="confirm-title">
          {title}
        </h3>
        <p className="modal__message" id="confirm-message">
          {message}
        </p>
        <div className="modal__actions">
          <button ref={cancelRef} type="button" className="btn btn--secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}