import { useEffect, useRef, useState } from 'react'
import { DEBT_TYPES } from '../../utils/debts.js'

const EMPTY_VALUES = Object.freeze({
  type: 'credit',
  name: '',
  balance: '',
  apr: '',
  minPayment: '',
})

const GENERIC_ERROR =
  'Проверьте введённые данные: остаток, ставка и минимальный платёж должны быть корректными.'

export default function DebtForm({
  isOpen,
  title = 'Добавление долга',
  submitLabel = 'Сохранить',
  initialValues,
  onClose,
  onSubmit,
}) {
  const [values, setValues] = useState(EMPTY_VALUES)
  const [error, setError] = useState('')
  const firstFieldRef = useRef(null)
  const initialValuesRef = useRef(initialValues)

  initialValuesRef.current = initialValues

  useEffect(() => {
    if (!isOpen) return
    setValues(initialValuesRef.current ?? EMPTY_VALUES)
    setError('')

    const frame = requestAnimationFrame(() => {
      firstFieldRef.current?.focus()
    })

    return () => cancelAnimationFrame(frame)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget) onClose()
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const result = onSubmit({
      type: values.type,
      name: values.name.trim(),
      balance: values.balance,
      apr: values.apr,
      minPayment: values.minPayment,
    })

    if (result === false) {
      setError(GENERIC_ERROR)
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="debt-form-title"
        aria-describedby={error ? 'debt-form-error' : undefined}
      >
        <h3 className="modal__title" id="debt-form-title">
          {title}
        </h3>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="debt-type">
              Тип продукта
            </label>
            <select
              className="form-input"
              id="debt-type"
              name="type"
              required
              ref={firstFieldRef}
              value={values.type}
              onChange={handleChange}
            >
              {DEBT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="debt-name">
              Название, опционально
            </label>
            <input
              className="form-input"
              id="debt-name"
              name="name"
              type="text"
              maxLength={80}
              autoComplete="off"
              value={values.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="debt-balance">
              Остаток долга, ₽
            </label>
            <input
              className="form-input"
              id="debt-balance"
              name="balance"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              required
              value={values.balance}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="debt-apr">
              Годовая ставка, %
            </label>
            <input
              className="form-input"
              id="debt-apr"
              name="apr"
              type="number"
              min="0"
              max="100"
              step="0.1"
              inputMode="decimal"
              required
              aria-describedby="debt-apr-hint"
              value={values.apr}
              onChange={handleChange}
            />
            <small className="form-hint" id="debt-apr-hint">
              Вводите ставку из договора, не ПСК.
            </small>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="debt-min-payment">
              Минимальный платёж, ₽
            </label>
            <input
              className="form-input"
              id="debt-min-payment"
              name="minPayment"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              required
              value={values.minPayment}
              onChange={handleChange}
            />
          </div>

          {error ? (
            <p className="form-error" id="debt-form-error" role="alert">
              {error}
            </p>
          ) : null}

          <div className="modal__actions">
            <button type="button" className="btn btn--secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn--primary">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}