import Section from '../../components/Section.jsx'

export default function CalcParamsSection() {
  return (
    <Section
      id="calc-params"
      title="Параметры расчёта"
      description="Укажите сумму, которую вы можете направлять на погашение долгов каждый месяц."
    >
      <div className="placeholder">Поля параметров расчёта появятся в этом блоке.</div>
    </Section>
  )
}