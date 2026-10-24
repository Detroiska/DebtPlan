import { describe, expect, it } from 'vitest'
import { isValidIsoDate, normalizeCalcParams } from '../src/utils/calcParams.js'

describe('calcParams: дата старта', () => {
  it('принимает существующие календарные даты', () => {
    expect(isValidIsoDate('2024-02-29')).toBe(true)
    expect(normalizeCalcParams({ startDate: '2024-02-29' }).startDate).toBe('2024-02-29')
    expect(normalizeCalcParams({ startDate: '2026-12-31' }).startDate).toBe('2026-12-31')
  })

  it('отклоняет несуществующие даты', () => {
    expect(isValidIsoDate('2026-02-31')).toBe(false)
    expect(isValidIsoDate('2025-02-29')).toBe(false)
    expect(isValidIsoDate('2026-13-01')).toBe(false)
    expect(isValidIsoDate('2026-00-10')).toBe(false)

    expect(normalizeCalcParams({ startDate: '2026-02-31' }).startDate).toBeNull()
    expect(normalizeCalcParams({ startDate: '2026-13-01' }).startDate).toBeNull()
  })
})
