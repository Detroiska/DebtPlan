import Section from '../../components/Section.jsx'
import { formatDate, formatMoney, formatMonths } from '../../utils/format.js'

export default function ResultsSection({ strategies = [], selectedStrategy = null, onSelectType }) {
  const hasCards = Array.isArray(strategies) && strategies.length > 0

  return (
    <Section
      id="results"
      title="Результаты"
      description="Сравнение стратегий погашения: срок, дата полного погашения и переплата."
    >
      {hasCards ? (
        <ul className="strategy-list">
          {strategies.map((strategy) => {
            const selected = selectedStrategy?.type === strategy.type

            return (
              <li key={strategy.type}>
                <button
                  type="button"
                  className={`strategy-card${selected ? ' strategy-card--selected' : ''}`}
                  aria-pressed={selected}
                  onClick={() => onSelectType(strategy.type)}
                >
                  <span className="strategy-card__head">
                    <span className="strategy-card__title">{strategy.title}</span>
                    {strategy.isOptimal ? <span className="badge badge--optimal">Оптимальная</span> : null}
                    {strategy.stalled ? <span className="badge badge--warning">Платежей не хватает</span> : null}
                  </span>
                  <span className="strategy-card__metrics">
                    <span className="strategy-card__metric">
                      <span className="strategy-card__metric-label">Срок</span>
                      <span className="strategy-card__metric-value">
                        {strategy.stalled ? '—' : formatMonths(strategy.months)}
                      </span>
                    </span>
                    <span className="strategy-card__metric">
                      <span className="strategy-card__metric-label">Дата погашения</span>
                      <span className="strategy-card__metric-value">
                        {strategy.stalled ? '—' : formatDate(strategy.payoffDate)}
                      </span>
                    </span>
                    <span className="strategy-card__metric">
                      <span className="strategy-card__metric-label">Переплата</span>
                      <span className="strategy-card__metric-value">
                        {strategy.stalled ? '—' : formatMoney(strategy.totalInterest)}
                      </span>
                    </span>
                  </span>
                  <span className="strategy-card__description">{strategy.description}</span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="empty-state">
          <span className="empty-state__title">План погашения появится здесь</span>
          <span>Добавьте долг — расчёт стратегий выполнится автоматически.</span>
        </div>
      )}
    </Section>
  )
}