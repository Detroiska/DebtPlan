import Section from '../../components/Section.jsx'

export default function MethodologySection() {
  return (
    <Section
      id="methodology"
      title="Методология"
      description="Допущения и ограничения, принятые в расчёте."
    >
      <details className="methodology-block">
        <summary className="methodology-block__summary">Допущения расчёта</summary>
        <ul className="methodology-block__list">
          <li>Проценты начисляются раз в месяц по ставке из договора.</li>
          <li>Комиссии, страховки и штрафы не учитываются.</li>
          <li>Суммы указываются только в рублях.</li>
          <li>Минимальные платежи берутся из договора без изменений.</li>
          <li>
            При заданной безрисковой ставке долги дешевле накоплений гасятся только минимальными
            платежами.
          </li>
          <li>Стратегии сравниваются по переплате; оптимальная помечается автоматически.</li>
        </ul>
      </details>
    </Section>
  )
}