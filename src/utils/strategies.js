import { normalizeDebtList, parseNumber } from './debts.js'
import { getEffectiveCustomOrder } from './customOrder.js'
import { calculatePayoff } from './payoff.js'

export const STRATEGY_META = Object.freeze({
  avalanche: {
    title: 'Дорогие долги первыми',
    description: 'Свободные деньги идут в долг с наибольшей ставкой — переплата обычно минимальна.',
  },
  snowball: {
    title: 'Снежный ком: малые остатки',
    description: 'Сначала закрываем самые маленькие долги — быстрые победы, переплата может быть выше.',
  },
  custom: {
    title: 'Своя стратегия',
    description: 'Порядок погашения задан вами.',
  },
})

export function buildStrategyOrder(type, debts, riskFreeRate = null) {
  const list = normalizeDebtList(debts)
  if (list.length === 0) return []

  const decorated = list.map((debt, index) => ({
    id: debt.id,
    apr: debt.apr,
    balance: debt.balance,
    index,
  }))

  if (type === 'snowball') {
    decorated.sort((a, b) => a.balance - b.balance || b.apr - a.apr || a.index - b.index)
    return decorated.map((item) => item.id)
  }

  const rate = typeof riskFreeRate === 'number' && riskFreeRate > 0 ? riskFreeRate : 0
  const groupOf = (item) => (item.apr < rate ? 1 : 0)

  decorated.sort(
    (a, b) => groupOf(a) - groupOf(b) || b.apr - a.apr || b.balance - a.balance || a.index - b.index,
  )

  return decorated.map((item) => item.id)
}

export function pickOptimalStrategy(results) {
  let best = null

  for (const result of results) {
    if (!result || result.isEmpty || result.stalled || result.limitReached || result.months === null) continue

    if (best === null) {
      best = result
      continue
    }

    if (
      result.totalInterest < best.totalInterest ||
      (result.totalInterest === best.totalInterest && result.months < best.months)
    ) {
      best = result
    }
  }

  return best
}

export function calculateStrategies(debts, params, customOrder = null) {
  const list = normalizeDebtList(debts)
  if (list.length === 0) return []

  const riskFreeRate = parseNumber(params?.riskFreeRate)
  const hasRiskFree = riskFreeRate !== null && riskFreeRate > 0

  const avalancheOrder = buildStrategyOrder('avalanche', list, riskFreeRate)

  const extraExemptIds = hasRiskFree
    ? list.filter((debt) => debt.apr < riskFreeRate).map((debt) => debt.id)
    : []
  const exemptOptions = extraExemptIds.length > 0 ? { extraExemptIds } : {}

  const entries = [
    {
      type: 'avalanche',
      order: avalancheOrder,
      options: exemptOptions,
    },
    { type: 'snowball', order: buildStrategyOrder('snowball', list), options: exemptOptions },
  ]

  const effectiveCustomOrder = getEffectiveCustomOrder(customOrder, list)
  if (effectiveCustomOrder) {
    entries.push({
      type: 'custom',
      order: effectiveCustomOrder,
      options: exemptOptions,
    })
  }

  const results = entries.map((entry) => {
    const payoff = calculatePayoff(list, params, entry.order, entry.options)

    return {
      ...payoff,
      type: entry.type,
      order: payoff.order,
      title: STRATEGY_META[entry.type].title,
      description: STRATEGY_META[entry.type].description,
      isOptimal: false,
    }
  })

  const optimal = pickOptimalStrategy(results)
  if (optimal) {
    optimal.isOptimal = true
  }

  return results
}

export function pickSelectedStrategy(strategies, selectedType) {
  if (!Array.isArray(strategies) || strategies.length === 0) return null

  const found = strategies.find((strategy) => strategy && strategy.type === selectedType)
  if (found) return found

  return pickOptimalStrategy(strategies) ?? strategies[0]
}