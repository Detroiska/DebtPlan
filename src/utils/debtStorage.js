import { readJson, writeJson, storageKey } from './storage.js'
import { normalizeDebtList } from './debts.js'

const DEBTS_KEY = storageKey('debts')

export function loadDebts() {
  const raw = readJson(DEBTS_KEY)
  return normalizeDebtList(raw)
}

export function saveDebts(debts) {
  return writeJson(DEBTS_KEY, normalizeDebtList(debts))
}

export function addDebtToStorage(debts, debt) {
  return saveDebts([...debts, debt])
}
