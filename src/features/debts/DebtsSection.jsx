import Section from '../../components/Section.jsx'
import DebtsTable from './DebtsTable.jsx'

export default function DebtsSection({ debts }) {
  const isEmpty = debts.length === 0

  return (
    <Section
      id="debts"
      title="Долги"
      description="Добавьте кредитные продукты, которые хотите закрыть. Данные сохраняются только в вашем браузере."
    >
      {isEmpty ? (
        <p className="empty-state">
          <span className="empty-state__title">Добавьте первый долг</span>
          <span className="empty-state__hint">
            Укажите остаток, годовую ставку и минимальный платёж из договора.
          </span>
        </p>
      ) : (
        <DebtsTable debts={debts} />
      )}
    </Section>
  )
}