import { getDebtLabel, normalizeDebtList, parseNumber } from './debts.js'

const MAX_MONTHS = 600

const EMPTY_RESULT = Object.freeze({
  isEmpty: true,
  months: 0,
  payoffDate: null,
  startMonthIso: null,
  totalInterest: 0,
  totalPayment: 0,
  freeAmount: 0,
  minimumsTotal: 0,
  schedule: Object.freeze([]),
  closedOrder: Object.freeze([]),
  order: Object.freeze([]),
  stalled: false,
  limitReached: false,
})

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function parseMonthParts(isoDate) {
  if (typeof isoDate === 'string') {
    const trimmed = isoDate.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [y, m] = trimmed.split('-').map(Number)
      if (y >= 1000 && m >= 1 && m <= 12) return { y, m }
    }
  }
  const now = new Date()
  return { y: now.getFullYear(), m: now.getMonth() + 1 }
}

function monthIso({ y, m }, monthIndex) {
  const total = y * 12 + (m - 1) + (monthIndex - 1)
  const year = Math.floor(total / 12)
  const month = (total % 12) + 1
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`
}

export function buildOrderIds(order, list) {
  const known = new Set(list.map((debt) => debt.id))
  const result = []

  if (Array.isArray(order)) {
    for (const id of order) {
      if (typeof id === 'string' && known.has(id) && !result.includes(id)) {
        result.push(id)
      }
    }
  }

  for (const debt of list) {
    if (!result.includes(debt.id)) result.push(debt.id)
  }

  return result
}

function createClosedResult({ startMonthIso, freeAmount, minimumsTotal, order }) {
  return {
    ...EMPTY_RESULT,
    isEmpty: false,
    startMonthIso,
    freeAmount,
    minimumsTotal,
    order,
  }
}

export function calculatePayoff(debts, params, order, options = {}) {
  const list = normalizeDebtList(debts)

  if (list.length === 0) {
    return { ...EMPTY_RESULT }
  }

  const opts = options ?? {}
  const freeAmount = Math.max(0, parseNumber(params?.freeAmount) ?? 0)
  const minimumsTotal = round2(
    list.reduce((sum, debt) => sum + Math.max(0, parseNumber(debt.minPayment) ?? 0), 0),
  )

  const extraExemptIds = new Set(
    Array.isArray(opts.extraExemptIds) ? opts.extraExemptIds : [],
  )

  const balances = new Map()
  const monthlyRates = new Map()
  const minimumPayments = new Map()
  for (const debt of list) {
    balances.set(debt.id, round2(debt.balance))
    monthlyRates.set(debt.id, (parseNumber(debt.apr) ?? 0) / 1200)
    minimumPayments.set(debt.id, round2(Math.max(0, parseNumber(debt.minPayment) ?? 0)))
  }

  const effectiveOrder = buildOrderIds(order, list)
  const startMonth = parseMonthParts(params?.startDate)
  const startMonthIso = monthIso({ y: startMonth.y, m: startMonth.m }, 1)

  if (!effectiveOrder.some((id) => balances.get(id) > 0)) {
    return createClosedResult({ startMonthIso, freeAmount, minimumsTotal, order: effectiveOrder })
  }

  const schedule = []
  const closedOrder = []
  const closedSet = new Set()
  let totalInterest = 0
  let totalPayment = 0

  for (let monthIndex = 1; monthIndex <= MAX_MONTHS; monthIndex++) {
    const openIds = effectiveOrder.filter((id) => balances.get(id) > 0)
    if (openIds.length === 0) break

    const rows = openIds.map((id) => ({
      debtId: id,
      startBalance: balances.get(id),
      interest: 0,
      payment: 0,
      principal: 0,
      endBalance: balances.get(id),
    }))

    let monthInterest = 0
    for (const row of rows) {
      const interest = round2(row.startBalance * monthlyRates.get(row.debtId))
      if (interest !== 0) {
        row.interest = interest
        balances.set(row.debtId, round2(row.startBalance + interest))
        monthInterest = round2(monthInterest + interest)
      }
    }

    let budget = freeAmount

    for (const row of rows) {
      if (budget <= 0) break
      const id = row.debtId
      const minimum = minimumPayments.get(id)
      if (minimum <= 0) continue

      const balance = balances.get(id)
      const payment = round2(Math.min(minimum, balance, budget))
      if (payment <= 0) continue

      balances.set(id, round2(balance - payment))
      budget = round2(budget - payment)
      row.payment = round2(row.payment + payment)
    }

    for (const row of rows) {
      if (budget <= 0) break
      const id = row.debtId
      if (extraExemptIds.has(id)) continue

      const balance = balances.get(id)
      if (balance <= 0) continue

      const payment = Math.min(balance, budget)
      balances.set(id, round2(balance - payment))
      budget = round2(budget - payment)
      row.payment = round2(row.payment + payment)
    }

    for (const row of rows) {
      row.endBalance = balances.get(row.debtId)
      row.principal = round2(row.payment - row.interest)

      if (row.endBalance <= 0 && !closedSet.has(row.debtId)) {
        closedSet.add(row.debtId)
        closedOrder.push(row.debtId)
      }
    }

    schedule.push({
      month: monthIndex,
      monthIso: monthIso(startMonth, monthIndex),
      payment: round2(rows.reduce((sum, row) => sum + row.payment, 0)),
      interest: monthInterest,
      rows,
    })

    totalInterest = round2(totalInterest + monthInterest)
    totalPayment = round2(totalPayment + schedule[schedule.length - 1].payment)
  }

  const hasOpenBalance = [...balances.values()].some((balance) => balance > 0)
  const lastEntry = schedule[schedule.length - 1]
  const isProgressing = lastEntry
    ? lastEntry.rows.some((row) => row.endBalance < row.startBalance)
    : false
  const limitReached = hasOpenBalance
  const stalled = hasOpenBalance && !isProgressing

  if (hasOpenBalance) {
    return {
      isEmpty: false,
      months: null,
      payoffDate: null,
      startMonthIso,
      totalInterest,
      totalPayment,
      freeAmount,
      minimumsTotal,
      schedule: [],
      closedOrder,
      order: effectiveOrder,
      stalled,
      limitReached,
    }
  }

  if (schedule.length === 0) {
    return createClosedResult({ startMonthIso, freeAmount, minimumsTotal, order: effectiveOrder })
  }

  const lastMonth = schedule[schedule.length - 1]

  return {
    isEmpty: false,
    months: schedule.length,
    payoffDate: `${lastMonth.monthIso}-01`,
    startMonthIso,
    totalInterest,
    totalPayment,
    freeAmount,
    minimumsTotal,
    schedule,
    closedOrder,
    order: effectiveOrder,
    stalled: false,
    limitReached: false,
  }
}

export function buildClosureList(debts, result) {
  if (!result || result.isEmpty) return []

  const byId = new Map(normalizeDebtList(debts).map((debt) => [debt.id, debt]))
  const closedIds = Array.isArray(result.closedOrder) ? result.closedOrder : []
  if (closedIds.length === 0) return []

  const closedMonthIso = new Map()
  const schedule = Array.isArray(result.schedule) ? result.schedule : []
  for (const entry of schedule) {
    if (!entry || !Array.isArray(entry.rows)) continue
    for (const row of entry.rows) {
      if (row && row.endBalance <= 0 && !closedMonthIso.has(row.debtId)) {
        closedMonthIso.set(row.debtId, entry.monthIso)
      }
    }
  }

  const closure = []
  for (const id of closedIds) {
    const debt = byId.get(id)
    if (!debt) continue
    closure.push({
      id,
      name: getDebtLabel(debt),
      type: debt.type,
      closedAtIso: closedMonthIso.get(id) ?? null,
    })
  }

  return closure
}

export { MAX_MONTHS as PAYOFF_MAX_MONTHS }