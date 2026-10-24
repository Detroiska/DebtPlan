import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App.jsx'

const DEBTS_KEY = 'debtplan.debts.v1'
const CUSTOM_ORDER_KEY = 'debtplan.custom-order.v1'

const DEBTS = [
  {
    id: 'debt-1',
    name: 'Первый кредит',
    type: 'credit',
    balance: 10000,
    apr: 12,
    minPayment: 1000,
  },
  {
    id: 'debt-2',
    name: 'Второй кредит',
    type: 'credit-card',
    balance: 5000,
    apr: 24,
    minPayment: 500,
  },
]

const customStrategyTitle = () =>
  screen.queryByText('Своя стратегия', { selector: '.strategy-card__title' })

beforeEach(() => {
  localStorage.clear()
})

describe('своя стратегия: порядок погашения', () => {
  it('сохраняет порядок и восстанавливает его после повторного открытия', async () => {
    localStorage.setItem(DEBTS_KEY, JSON.stringify(DEBTS))
    const user = userEvent.setup()
    const firstRender = render(<App />)

    expect(customStrategyTitle()).not.toBeInTheDocument()

    await user.click(screen.getByLabelText('Опустить: Первый кредит'))

    expect(await screen.findByText('Своя стратегия', { selector: '.strategy-card__title' })).toBeInTheDocument()
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(CUSTOM_ORDER_KEY))).toEqual(['debt-2', 'debt-1'])
    })

    firstRender.unmount()
    render(<App />)

    expect(customStrategyTitle()).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Сбросить: вернуться к оптимальной' })).toBeInTheDocument()
  })

  it('игнорирует сохранённый порядок, если все его долги удалены', async () => {
    localStorage.setItem(DEBTS_KEY, JSON.stringify(DEBTS))
    localStorage.setItem(CUSTOM_ORDER_KEY, JSON.stringify(['ghost']))

    render(<App />)

    expect(customStrategyTitle()).not.toBeInTheDocument()
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(CUSTOM_ORDER_KEY))).toBeNull()
    })
  })
})
