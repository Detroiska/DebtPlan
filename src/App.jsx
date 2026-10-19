import AppFooter from './components/AppFooter.jsx'
import AppHeader from './components/AppHeader.jsx'
import { useDebts } from './hooks/useDebts.js'
import CalcParamsSection from './features/calc/CalcParamsSection.jsx'
import DebtsSection from './features/debts/DebtsSection.jsx'
import MethodologySection from './features/methodology/MethodologySection.jsx'
import ResultsSection from './features/results/ResultsSection.jsx'
import './App.css'

export default function App() {
  const { debts, addDebt, updateDebt } = useDebts()

  return (
    <div className="app">
      <AppHeader />

      <main className="app-main">
        <div className="app-main__inner">
          <DebtsSection debts={debts} onAddDebt={addDebt} onEditDebt={updateDebt} />
          <CalcParamsSection />
          <ResultsSection />
          <MethodologySection />
        </div>
      </main>

      <AppFooter />
    </div>
  )
}