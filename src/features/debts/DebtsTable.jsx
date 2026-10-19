import { formatMoney, formatPercent } from '../../utils/format.js'
import { getDebtLabel, getDebtTypeLabel } from '../../utils/debts.js'

export default function DebtsTable({ debts, onEditDebt }) {
  const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0)
  const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minPayment, 0)

  return (
    <div className="table-scroll">
      <table className="debts-table">
        <caption className="visually-hidden">Список долгов</caption>
        <thead>
          <tr>
            <th scope="col">Название</th>
            <th scope="col">Тип</th>
            <th scope="col" className="num">
              Остаток
            </th>
            <th scope="col" className="num">
              Ставка
            </th>
            <th scope="col" className="num">
              Мин. платёж
            </th>
            <th scope="col">Действия</th>
          </tr>
        </thead>
        <tbody>
          {debts.map((debt) => (
            <tr key={debt.id}>
              <td data-label="Название">{getDebtLabel(debt)}</td>
              <td data-label="Тип">{getDebtTypeLabel(debt.type)}</td>
              <td data-label="Остаток" className="num">
                {formatMoney(debt.balance)}
              </td>
              <td data-label="Ставка" className="num">
                {formatPercent(debt.apr)}
              </td>
              <td data-label="Мин. платёж" className="num">
                {formatMoney(debt.minPayment)}
              </td>
              <td data-label="Действия">
                <button
                  type="button"
                  className="btn btn--secondary btn--small"
                  onClick={() => onEditDebt(debt)}
                >
                  Изменить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={2}>
              Итого
            </th>
            <td className="num">{formatMoney(totalBalance)}</td>
            <td className="num" aria-hidden="true"></td>
            <td className="num">{formatMoney(totalMinPayment)}</td>
            <td aria-hidden="true"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}