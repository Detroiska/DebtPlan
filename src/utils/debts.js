export const DEBT_TYPES = Object.freeze([
  { value: 'credit', label: 'Кредит' },
  { value: 'credit-card', label: 'Кредитная карта' },
  { value: 'microloan', label: 'Микрозайм' },
  { value: 'installment', label: 'Рассрочка' },
])

const DEBT_TYPE_VALUES = DEBT_TYPES.map((type) => type.value)
const DEBT_TYPE_LABELS = new Map(DEBT_TYPES.map((type) => [type.value, type.label]))

export function getDebtTypeLabel(type) {
  return DEBT_TYPE_LABELS.get(type) ?? 'Кредит'
}

export function getDebtLabel(debt) {
  if (typeof debt?.name === 'string' && debt.name.trim() !== '') {
    return debt.name.trim()
  }
  return getDebtTypeLabel(debt?.type)
}

export const DEBT_FIELDS = Object.freeze(['id', 'name', 'type', 'balance', 'apr', 'minPayment'])

export function createDebtId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
  } catch {
    // fallback ниже
  }
  return `debt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function parseNumber(value) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string') {
    const normalized = value
      .replace(/[\s\u00a0\u202f]/g, '')
      .replace(',', '.')
    if (normalized === '') return null
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function parseNonNegativeNumber(value) {
  const parsed = parseNumber(value)
  if (parsed === null || parsed < 0) return null
  return parsed
}

function normalizeDebtType(value) {
  return DEBT_TYPE_VALUES.includes(value) ? value : 'credit'
}

function normalizeDebtName(value) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export function normalizeDebt(input) {
  if (typeof input !== 'object' || input === null) return null

  const balance = parseNonNegativeNumber(input.balance)
  const apr = parseNonNegativeNumber(input.apr)
  const minPayment = parseNonNegativeNumber(input.minPayment)

  if (balance === null || balance <= 0) return null
  if (apr === null || apr > 100) return null
  if (minPayment === null || minPayment <= 0) return null

  const rawId = typeof input.id === 'string' ? input.id.trim() : ''

  return {
    id: rawId || createDebtId(),
    name: normalizeDebtName(input.name),
    type: normalizeDebtType(input.type),
    balance,
    apr,
    minPayment,
  }
}

export function createDebt(input) {
  const debt = normalizeDebt({ id: '', ...input })
  if (debt === null) {
    throw new Error('Некорректные данные долга')
  }
  return debt
}

export function isValidDebt(value) {
  return normalizeDebt(value) !== null
}

export function normalizeDebtList(value) {
  if (!Array.isArray(value)) return []
  return value.map((item) => normalizeDebt(item)).filter((item) => item !== null)
}
