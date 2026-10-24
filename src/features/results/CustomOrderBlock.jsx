import { buildOrderIds } from '../../utils/payoff.js'
import { getDebtLabel } from '../../utils/debts.js'

export default function CustomOrderBlock({ debts, customOrder, onMove, onReset, hasCustom }) {
  const effectiveOrder = buildOrderIds(customOrder ?? [], debts)
  const items = effectiveOrder
    .map((id) => debts.find((debt) => debt.id === id))
    .filter(Boolean)

  return (
    <details className="custom-order-block">
      <summary className="custom-order-block__summary">Своя стратегия: порядок погашения</summary>
      <ol className="custom-order__list">
        {items.map((debt, index) => {
          const label = getDebtLabel(debt)

          return (
            <li key={debt.id} className="custom-order__item">
              <span className="custom-order__name">{label}</span>
              <span className="custom-order__actions">
                <button
                  type="button"
                  className="btn btn--secondary btn--small"
                  aria-label={`Поднять: ${label}`}
                  disabled={index === 0}
                  onClick={() => onMove(index, index - 1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="btn btn--secondary btn--small"
                  aria-label={`Опустить: ${label}`}
                  disabled={index === items.length - 1}
                  onClick={() => onMove(index, index + 1)}
                >
                  ↓
                </button>
              </span>
            </li>
          )
        })}
      </ol>
      {hasCustom ? (
        <button type="button" className="btn btn--secondary btn--small custom-order__reset" onClick={onReset}>
          Сбросить: вернуться к оптимальной
        </button>
      ) : (
        <p className="form-hint">Измените порядок стрелками — стратегия «Своя стратегия» появится в сравнении выше.</p>
      )}
    </details>
  )
}