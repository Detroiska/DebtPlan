import Section from '../../components/Section.jsx'

export default function ResultsSection() {
  return (
    <Section
      id="results"
      title="Результаты"
      description="Здесь будут переплата, срок погашения, дата полного погашения, сравнение стратегий и график платежей."
    >
      <div className="placeholder">Результаты расчёта появятся в этом блоке.</div>
    </Section>
  )
}