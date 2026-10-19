import { useCallback, useEffect, useState } from 'react'
import { loadCalcParams, saveCalcParams } from '../utils/calcParams.js'

export function useCalcParams() {
  const [params, setParams] = useState(loadCalcParams)

  useEffect(() => {
    saveCalcParams(params)
  }, [params])

  const setParam = useCallback((name, value) => {
    setParams((prev) => ({ ...prev, [name]: value }))
  }, [])

  const resetParams = useCallback(() => {
    setParams(loadCalcParams())
  }, [])

  return { params, setParam, setParams, resetParams }
}