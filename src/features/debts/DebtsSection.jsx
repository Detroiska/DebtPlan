import Section from '../../components/Section.jsx'

export default function DebtsSection() {
  return (
    <Section
      id="debts"
      title="Ввод долгов"
      description="Добавьте кредитные продукты, которые хотите закрыть: остаток, ставка и минимальный платёж."
    >
      <div className="placeholder">Список долгов появится в этом блоке.</div>
    </Section>
  )
}