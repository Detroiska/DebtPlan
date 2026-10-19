import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import AppFooter from './components/AppFooter.jsx'
import AppHeader from './components/AppHeader.jsx'
import { useCalcParams } from './hooks/useCalcParams.js'
import { useDebts } from './hooks/useDebts.js'
import { buildOrderIds } from './utils/payoff.js'
import { calculateStrategies, pickSelectedStrategy } from './utils/strategies.js'
import CalcParamsSection from './features/calc/CalcParamsSection.jsx'
import DebtsSection from './features/debts/DebtsSection.jsx'
import MethodologySection from './features/methodology/MethodologySection.jsx'
import ResultsSection from './features/results/ResultsSection.jsx'
import './App.css'

export default function App() {
  const { debts, addDebt, updateDebt, removeDebt } = useDebts()
  const { params, setParam } = useCalcParams()

  const deferredDebts = useDeferredValue(debts)
  const deferredParams = useDeferredValue(params)

  const [customOrder, setCustomOrder] = useState(null)
  const [selectedStrategyType, setSelectedStrategyType] = useState(null)

  const strategies = useMemo(
    () => calculateStrategies(deferredDebts, deferredParams, customOrder),
    [deferredDebts, deferredParams, customOrder],
  )
  const isRecalculating = deferredDebts !== debts || deferredParams !== params

  const selectedStrategy = pickSelectedStrategy(strategies, selectedStrategyType)

  const moveCustomOrder = useCallback(
    (from, to) => {
      setCustomOrder((prev) => {
        const base = buildOrderIds(prev ?? [], debts)
        const next = [...base]
        const [item] = next.splice(from, 1)
        if (item === undefined) return next
        next.splice(to, 0, item)
        return next
      })
    },
    [debts],
  )

  const resetCustomOrder = useCallback(() => {
    setCustomOrder(null)
  }, [])

  return (
    <div className="app">
      <AppHeader />

      <main className="app-main">
        <div className="app-main__inner">
          <DebtsSection
            debts={debts}
            onAddDebt={addDebt}
            onEditDebt={updateDebt}
            onDeleteDebt={removeDebt}
          />
          <CalcParamsSection debts={debts} params={params} onChange={setParam} />
          <ResultsSection
            debts={deferredDebts}
            strategies={strategies}
            selectedStrategy={selectedStrategy}
            isRecalculating={isRecalculating}
            customOrder={customOrder}
            onMoveCustomOrder={moveCustomOrder}
            onResetCustomOrder={resetCustomOrder}
            onSelectType={setSelectedStrategyType}
          />
          <MethodologySection />
        </div>
      </main>

      <AppFooter />
    </div>
  )
}