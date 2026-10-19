import Section from '../../components/Section.jsx'
import { buildClosureList } from '../../utils/payoff.js'
import { formatDate, formatMoney, formatMonths } from '../../utils/format.js'

export default function ResultsSection({ debts = [], strategies = [], selectedStrategy = null, onSelectType }) {
  const hasCards = Array.isArray(strategies) && strategies.length > 0
  const hasSelected = hasCards && selectedStrategy !== null && selectedStrategy !== undefined
  const closureItems = hasSelected && !selectedStrategy.isEmpty
    ? buildClosureList(debts, selectedStrategy)
    : []

  return (
    <Section
      id="results"
      title="Результаты"
      description="Сравнение стратегий погашения: срок, дата полного погашения и переплата."
    >
      {hasCards ? (
        <>
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

          {hasSelected ? (
            selectedStrategy.stalled ? (
              <p className="form-warning">
                При минимальных платежах проценты превышают платежи — долги не закроются. Увеличьте свободную сумму.
              </p>
            ) : (
              <div className="payoff-details">
                <div className="payoff-metrics">
                  <div className="payoff-metric">
                    <span className="payoff-metric__label">Общая переплата</span>
                    <span className="payoff-metric__value">{formatMoney(selectedStrategy.totalInterest)}</span>
                  </div>
                  <div className="payoff-metric">
                    <span className="payoff-metric__label">Срок погашения</span>
                    <span className="payoff-metric__value">{formatMonths(selectedStrategy.months)}</span>
                  </div>
                  <div className="payoff-metric">
                    <span className="payoff-metric__label">Дата полного погашения</span>
                    <span className="payoff-metric__value">{formatDate(selectedStrategy.payoffDate)}</span>
                  </div>
                </div>

                <div className="payoff-order">
                  <h3 className="payoff-order__title">Порядок погашения</h3>
                  <ol className="payoff-order__list">
                    {closureItems.map((item) => (
                      <li key={item.id} className="payoff-order__item">
                        <span className="payoff-order__name">{item.name}</span>
                        <span className="payoff-order__date">
                          закрыт {item.closedAtIso ? formatDate(`${item.closedAtIso}-01`) : '—'}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )
          ) : null}
        </>
      ) : (
        <div className="empty-state">
          <span className="empty-state__title">План погашения появится здесь</span>
          <span>Добавьте долг — расчёт стратегий выполнится автоматически.</span>
        </div>
      )}
    </Section>
  )
}