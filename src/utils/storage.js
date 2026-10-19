const STORAGE_PREFIX = 'debtplan'

export function storageKey(name) {
  return `${STORAGE_PREFIX}.${name}.v1`
}

function getStorage() {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage
  } catch {
    return null
  }
}

export function readJson(key) {
  const storage = getStorage()
  if (!storage) return null

  try {
    const raw = storage.getItem(key)
    if (raw === null || raw === '') return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function writeJson(key, value) {
  const storage = getStorage()
  if (!storage) return false

  try {
    storage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
