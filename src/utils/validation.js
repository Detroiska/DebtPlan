import { MIN_DEBT_AMOUNT, parseNumber } from './debts.js'

const isBlank = (value) => typeof value !== 'string' || value.trim() === ''

function round2(value) {
  return Math.round(value * 100) / 100
}

export function getFreeAmountWarning(debts, freeAmount) {
  let minTotal = 0
  if (Array.isArray(debts)) {
    for (const debt of debts) {
      const value = parseNumber(debt?.minPayment)
      if (value !== null) minTotal += value
    }
  }

  const amount = parseNumber(freeAmount) ?? 0
  if (minTotal > 0 && amount < minTotal) {
    return {
      minTotal: round2(minTotal),
      freeAmount: amount,
      shortfall: round2(minTotal - amount),
    }
  }

  return null
}

export function validateDebtForm(values) {
  const errors = {}

  if (isBlank(values.balance)) {
    errors.balance = 'Заполните поле'
  } else {
    const balance = parseNumber(values.balance)
    if (balance === null) errors.balance = 'Введите корректное число'
    else if (balance <= 0) errors.balance = 'Остаток долга должен быть больше 0'
    else if (balance < MIN_DEBT_AMOUNT) errors.balance = 'Остаток долга должен быть не меньше 0,01 ₽'
  }

  if (isBlank(values.apr)) {
    errors.apr = 'Заполните поле'
  } else {
    const apr = parseNumber(values.apr)
    if (apr === null) errors.apr = 'Введите корректное число'
    else if (apr < 0 || apr > 100) errors.apr = 'Годовая ставка должна быть от 0 до 100'
  }

  if (isBlank(values.minPayment)) {
    errors.minPayment = 'Заполните поле'
  } else {
    const minPayment = parseNumber(values.minPayment)
    if (minPayment === null) errors.minPayment = 'Введите корректное число'
    else if (minPayment <= 0) errors.minPayment = 'Минимальный платёж должен быть больше 0'
    else if (minPayment < MIN_DEBT_AMOUNT) {
      errors.minPayment = 'Минимальный платёж должен быть не меньше 0,01 ₽'
    }
  }

  return errors
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}