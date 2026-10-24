import { beforeEach, describe, expect, it } from 'vitest'
import {
  getEffectiveCustomOrder,
  loadCustomOrder,
  normalizeCustomOrder,
  saveCustomOrder,
} from '../src/utils/customOrder.js'

describe('customOrder', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('normalizeCustomOrder отбрасывает мусор и дубликаты', () => {
    expect(normalizeCustomOrder(null)).toBeNull()
    expect(normalizeCustomOrder([])).toBeNull()
    expect(normalizeCustomOrder(['a', '', 42, 'a', ' b '])).toEqual(['a', 'b'])
  })

  it('getEffectiveCustomOrder оставляет только текущие долги', () => {
    const debts = [{ id: 'a' }, { id: 'b' }]

    expect(getEffectiveCustomOrder(['b', 'ghost', 'a'], debts)).toEqual(['b', 'a'])
    expect(getEffectiveCustomOrder(['ghost'], debts)).toBeNull()
    expect(getEffectiveCustomOrder(['a'], [])).toBeNull()
  })

  it('loadCustomOrder и saveCustomOrder сохраняют порядок', () => {
    expect(loadCustomOrder()).toBeNull()

    saveCustomOrder(['b', 'a'])
    expect(loadCustomOrder()).toEqual(['b', 'a'])

    saveCustomOrder(null)
    expect(loadCustomOrder()).toBeNull()
  })
})
