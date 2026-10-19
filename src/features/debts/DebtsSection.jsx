import { useCallback, useState } from 'react'
import Section from '../../components/Section.jsx'
import DebtForm from './DebtForm.jsx'
import DebtsTable from './DebtsTable.jsx'
import { debtToFormValues } from '../../utils/debts.js'

export default function DebtsSection({ debts, onAddDebt, onEditDebt }) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState(null)

  const closeForm = useCallback(() => {
    setIsFormOpen(false)
    setEditingDebt(null)
  }, [])

  const openAddForm = useCallback(() => {
    setEditingDebt(null)
    setIsFormOpen(true)
  }, [])

  const openEditForm = useCallback((debt) => {
    setEditingDebt(debt)
    setIsFormOpen(true)
  }, [])

  const handleSubmit = useCallback(
    (input) => {
      try {
        if (editingDebt) {
          onEditDebt(editingDebt.id, input)
        } else {
          onAddDebt(input)
        }
        setIsFormOpen(false)
        setEditingDebt(null)
        return true
      } catch {
        return false
      }
    },
    [editingDebt, onAddDebt, onEditDebt],
  )

  const formTitle = editingDebt ? 'Изменение долга' : 'Добавление долга'
  const formValues = editingDebt ? debtToFormValues(editingDebt) : undefined

  return (
    <Section
      id="debts"
      title="Долги"
      description="Добавьте кредитные продукты, которые хотите закрыть. Данные сохраняются только в вашем браузере."
      actions={
        <button type="button" className="btn btn--primary" onClick={openAddForm}>
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
        <DebtsTable debts={debts} onEditDebt={openEditForm} />
      )}

      <DebtForm
        isOpen={isFormOpen}
        title={formTitle}
        submitLabel="Сохранить"
        initialValues={formValues}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />
    </Section>
  )
}