import Section from '../../components/Section.jsx'
import { todayIso } from '../../utils/format.js'
import { parseNumber } from '../../utils/debts.js'

export default function CalcParamsSection({ params, onChange }) {
  const startDate = params.startDate ?? todayIso()

  const handleFreeAmount = (event) => {
    onChange('freeAmount', parseNumber(event.target.value) ?? 0)
  }

  const handleRiskFreeRate = (event) => {
    const raw = event.target.value
    if (raw.trim() === '') {
      onChange('riskFreeRate', null)
      return
    }
    onChange('riskFreeRate', parseNumber(raw) ?? null)
  }

  const handleStartDate = (event) => {
    const raw = event.target.value
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      onChange('startDate', null)
      return
    }
    onChange('startDate', raw)
  }

  return (
    <Section
      id="calc-params"
      title="Параметры расчёта"
      description="Укажите, сколько вы готовы направлять на погашение долгов каждый месяц. Параметры сохраняются автоматически."
    >
      <form className="form" onSubmit={(event) => event.preventDefault()}>
        <div className="form-field">
          <label className="form-label" htmlFor="params-free-amount">
            Свободная сумма в месяц, ₽
          </label>
          <input
            className="form-input"
            id="params-free-amount"
            name="freeAmount"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            required
            value={params.freeAmount}
            onChange={handleFreeAmount}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="params-risk-free-rate">
            Безрисковая ставка, %
          </label>
          <input
            className="form-input"
            id="params-risk-free-rate"
            name="riskFreeRate"
            type="number"
            min="0"
            max="100"
            step="0.1"
            inputMode="decimal"
            aria-describedby="params-risk-free-rate-hint"
            value={params.riskFreeRate ?? ''}
            onChange={handleRiskFreeRate}
          />
          <small className="form-hint" id="params-risk-free-rate-hint">
            Ставка по накопительному счёту. Необязательно: пустое поле или 0 — часть свободных
            денег пойдёт только на долги.
          </small>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="params-start-date">
            Дата старта
          </label>
          <input
            className="form-input"
            id="params-start-date"
            name="startDate"
            type="date"
            value={startDate}
            onChange={handleStartDate}
          />
          <small className="form-hint">Первый месяц, для которого считаем план. По умолчанию — сегодня.</small>
        </div>
      </form>
    </Section>
  )
}