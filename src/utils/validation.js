import { parseNumber } from './debts.js'

const isBlank = (value) => typeof value !== 'string' || value.trim() === ''

export function validateDebtForm(values) {
  const errors = {}

  if (isBlank(values.balance)) {
    errors.balance = 'Заполните поле'
  } else {
    const balance = parseNumber(values.balance)
    if (balance === null) errors.balance = 'Введите корректное число'
    else if (balance <= 0) errors.balance = 'Остаток долга должен быть больше 0'
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
  }

  return errors
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}