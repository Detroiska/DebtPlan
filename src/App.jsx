import AppFooter from './components/AppFooter.jsx'
import AppHeader from './components/AppHeader.jsx'
import { useCalcParams } from './hooks/useCalcParams.js'
import { useDebts } from './hooks/useDebts.js'
import CalcParamsSection from './features/calc/CalcParamsSection.jsx'
import DebtsSection from './features/debts/DebtsSection.jsx'
import MethodologySection from './features/methodology/MethodologySection.jsx'
import ResultsSection from './features/results/ResultsSection.jsx'
import './App.css'

export default function App() {
  const { debts, addDebt, updateDebt, removeDebt } = useDebts()
  const { params, setParam } = useCalcParams()

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
          <ResultsSection />
          <MethodologySection />
        </div>
      </main>

      <AppFooter />
    </div>
  )
}