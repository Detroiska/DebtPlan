import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import CalcParamsSection from '../../src/features/calc/CalcParamsSection.jsx'
import { DEFAULT_CALC_PARAMS } from '../../src/utils/calcParams.js'

function Harness({ debts = [], initialParams = DEFAULT_CALC_PARAMS }) {
  const [params, setParams] = useState(initialParams)

  return (
    <CalcParamsSection
      debts={debts}
      params={params}
      onChange={(name, value) => setParams((prev) => ({ ...prev, [name]: value }))}
    />
  )
}

describe('CalcParamsSection: ограничения ввода', () => {
  it('не пропускает отрицательную свободную сумму', () => {
    render(<Harness />)
    const input = screen.getByLabelText('Свободная сумма в месяц, ₽')

    fireEvent.change(input, { target: { value: '-100' } })

    expect(input).toHaveValue(0)
  })

  it('ограничивает безрисковую ставку диапазоном 0–100', () => {
    render(<Harness />)
    const input = screen.getByLabelText('Безрисковая ставка, %')

    fireEvent.change(input, { target: { value: '150' } })
    expect(input).toHaveValue(100)

    fireEvent.change(input, { target: { value: '-5' } })
    expect(input).toHaveValue(0)
  })

  it('предупреждает, что минимальные платежи не покрываются', () => {
    render(
      <Harness
        debts={[{ id: 'a', minPayment: 1000 }]}
        initialParams={{ ...DEFAULT_CALC_PARAMS, freeAmount: 500 }}
      />,
    )

    const warning = screen.getByRole('alert')
    expect(warning).toHaveTextContent('часть долгов получит меньше минимального платежа')
  })
})
