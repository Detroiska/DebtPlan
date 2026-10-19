import { useCallback, useState } from 'react'
import Section from '../../components/Section.jsx'
import DebtForm from './DebtForm.jsx'
import DebtsTable from './DebtsTable.jsx'

export default function DebtsSection({ debts, onAddDebt }) {
  const [isFormOpen, setIsFormOpen] = useState(false)

  const openForm = useCallback(() => setIsFormOpen(true), [])
  const closeForm = useCallback(() => setIsFormOpen(false), [])

  const handleAddDebt = useCallback(
    (input) => {
      try {
        onAddDebt(input)
        setIsFormOpen(false)
        return true
      } catch {
        return false
      }
    },
    [onAddDebt],
  )

  return (
    <Section
      id="debts"
      title="Долги"
      description="Добавьте кредитные продукты, которые хотите закрыть. Данные сохраняются только в вашем браузере."
      actions={
        <button type="button" className="btn btn--primary" onClick={openForm}>
          Добавить долг
        </button>
      }
    >
      {debts.length === 0 ? (
        <p className="empty-state">
          <span className="empty-state__title">Добавьте первый долг</span>
          <span className="empty-state__hint">
            Укажите остаток, годовую ставку и минимальный платёж из договора.
          </span>
        </p>
      ) : (
        <DebtsTable debts={debts} />
      )}

      <DebtForm isOpen={isFormOpen} onClose={closeForm} onSubmit={handleAddDebt} />
    </Section>
  )
}