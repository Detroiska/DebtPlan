import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useCalcParams } from '../src/hooks/useCalcParams.js'
import { DEFAULT_CALC_PARAMS } from '../src/utils/calcParams.js'

const CALC_PARAMS_KEY = 'debtplan.calc-params.v1'

describe('useCalcParams', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('resetParams возвращает значения по умолчанию, а не сохранённые', () => {
    localStorage.setItem(
      CALC_PARAMS_KEY,
      JSON.stringify({ freeAmount: 500, riskFreeRate: 10, startDate: '2026-01-01' }),
    )
    const { result } = renderHook(() => useCalcParams())

    expect(result.current.params).toMatchObject({
      freeAmount: 500,
      riskFreeRate: 10,
      startDate: '2026-01-01',
    })

    act(() => result.current.resetParams())

    expect(result.current.params).toEqual(DEFAULT_CALC_PARAMS)
  })
})
