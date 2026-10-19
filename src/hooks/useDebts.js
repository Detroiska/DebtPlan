import { useCallback, useEffect, useRef, useState } from 'react'
import { createDebt, normalizeDebtList } from '../utils/debts.js'
import { loadDebts, saveDebts } from '../utils/debtStorage.js'

export function useDebts() {
  const [debts, setDebts] = useState(loadDebts)
  const isHydrated = useRef(false)

  useEffect(() => {
    if (!isHydrated.current) {
      isHydrated.current = true
      return
    }
    saveDebts(debts)
  }, [debts])

  const addDebt = useCallback((input) => {
    const debt = createDebt(input)
    setDebts((prev) => [...normalizeDebtList(prev), debt])
    return debt
  }, [])

  const updateDebt = useCallback((id, input) => {
    const next = createDebt({ ...input, id })

    setDebts((prev) =>
      normalizeDebtList(prev).map((debt) => (debt.id === id ? next : debt)),
    )
    return next
  }, [])

  const removeDebt = useCallback((id) => {
    setDebts((prev) => normalizeDebtList(prev).filter((debt) => debt.id !== id))
  }, [])

  return { debts, addDebt, updateDebt, removeDebt }
}