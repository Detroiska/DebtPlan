import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_CALC_PARAMS,
  loadCalcParams,
  saveCalcParams,
} from '../utils/calcParams.js'

export function useCalcParams() {
  const [params, setParams] = useState(loadCalcParams)

  useEffect(() => {
    saveCalcParams(params)
  }, [params])

  const setParam = useCallback((name, value) => {
    setParams((prev) => ({ ...prev, [name]: value }))
  }, [])

  const resetParams = useCallback(() => {
    setParams({ ...DEFAULT_CALC_PARAMS })
  }, [])

  return { params, setParam, setParams, resetParams }
}