import { readJson, writeJson, storageKey } from './storage.js'
import { parseNumber } from './debts.js'

const CALC_PARAMS_KEY = storageKey('calc-params')

export const DEFAULT_CALC_PARAMS = Object.freeze({
  freeAmount: 0,
  riskFreeRate: null,
  startDate: null,
})

function parseRate(value) {
  const parsed = parseNumber(value)
  if (parsed === null || parsed < 0 || parsed > 100) return null
  return parsed
}

function parseIsoDate(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null

  const [year, month, day] = trimmed.split('-').map(Number)
  const date = new Date(`${trimmed}T00:00:00`)
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return trimmed
}

export function isValidIsoDate(value) {
  return parseIsoDate(value) !== null
}

export function normalizeCalcParams(raw) {
  if (typeof raw !== 'object' || raw === null) {
    return { ...DEFAULT_CALC_PARAMS }
  }

  const freeAmount = parseNumber(raw.freeAmount)
  const riskFreeRate = parseRate(raw.riskFreeRate)
  const startDate = parseIsoDate(raw.startDate)

  return {
    freeAmount: freeAmount !== null && freeAmount >= 0 ? freeAmount : DEFAULT_CALC_PARAMS.freeAmount,
    riskFreeRate,
    startDate,
  }
}

export function loadCalcParams() {
  return normalizeCalcParams(readJson(CALC_PARAMS_KEY))
}

export function saveCalcParams(params) {
  return writeJson(CALC_PARAMS_KEY, normalizeCalcParams(params))
}