import { readJson, writeJson, storageKey } from './storage.js'

const CUSTOM_ORDER_KEY = storageKey('custom-order')

export function normalizeCustomOrder(value) {
  if (!Array.isArray(value)) return null

  const ids = []
  for (const item of value) {
    if (typeof item !== 'string') continue
    const id = item.trim()
    if (id !== '' && !ids.includes(id)) ids.push(id)
  }

  return ids.length > 0 ? ids : null
}

export function getEffectiveCustomOrder(order, debts) {
  const normalized = normalizeCustomOrder(order)
  if (normalized === null) return null

  const known = new Set(
    (Array.isArray(debts) ? debts : [])
      .map((debt) => debt?.id)
      .filter((id) => typeof id === 'string' && id !== ''),
  )
  const ids = normalized.filter((id) => known.has(id))

  return ids.length > 0 ? ids : null
}

export function loadCustomOrder() {
  return normalizeCustomOrder(readJson(CUSTOM_ORDER_KEY))
}

export function saveCustomOrder(order) {
  return writeJson(CUSTOM_ORDER_KEY, normalizeCustomOrder(order))
}
