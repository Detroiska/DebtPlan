import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App.jsx'
import { formatMoney } from '../../src/utils/format.js'

const DEBTS_STORAGE_KEY = 'debtplan.debts.v1'

const money = (value) => formatMoney(value).replace(/\u00a0/g, ' ')

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

function seedDebts() {
  localStorage.setItem(DEBTS_STORAGE_KEY, JSON.stringify(DEBTS))
}

function getDebtRow(table, name) {
  return within(table).getByText(name).closest('tr')
}

beforeEach(() => {
  localStorage.clear()
})

describe('FE-009: удаление долга с подтверждением', () => {
  it('не удаляет долг, пока пользователь не подтвердил действие', async () => {
    const user = userEvent.setup()
    seedDebts()
    render(<App />)

    const table = await screen.findByRole('table', { name: 'Список долгов' })
    await user.click(within(getDebtRow(table, 'Первый кредит')).getByRole('button', { name: 'Удалить' }))

    const dialog = screen.getByRole('dialog', { name: 'Удаление долга' })
    expect(within(dialog).getByText(/Первый кредит/)).toBeInTheDocument()
    expect(within(table).getByText('Первый кредит')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(DEBTS_STORAGE_KEY))).toHaveLength(2)
  })

  it('при отмене закрывает диалог и сохраняет оба долга', async () => {
    const user = userEvent.setup()
    seedDebts()
    render(<App />)

    const table = await screen.findByRole('table', { name: 'Список долгов' })
    await user.click(within(getDebtRow(table, 'Первый кредит')).getByRole('button', { name: 'Удалить' }))
    const dialog = screen.getByRole('dialog', { name: 'Удаление долга' })

    await user.click(within(dialog).getByRole('button', { name: 'Отмена' }))

    expect(screen.queryByRole('dialog', { name: 'Удаление долга' })).not.toBeInTheDocument()
    expect(within(table).getByText('Первый кредит')).toBeInTheDocument()
    expect(within(table).getByText('Второй кредит')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(DEBTS_STORAGE_KEY))).toHaveLength(2)
  })

  it('после подтверждения удаляет долг, пересчитывает итоги и обновляет localStorage', async () => {
    const user = userEvent.setup()
    seedDebts()
    render(<App />)

    const table = await screen.findByRole('table', { name: 'Список долгов' })
    await user.click(within(getDebtRow(table, 'Первый кредит')).getByRole('button', { name: 'Удалить' }))
    const dialog = screen.getByRole('dialog', { name: 'Удаление долга' })

    await user.click(within(dialog).getByRole('button', { name: 'Удалить' }))

    await waitFor(() => {
      expect(within(table).queryByText('Первый кредит')).not.toBeInTheDocument()
    })
    expect(within(table).getByText('Второй кредит')).toBeInTheDocument()

    const totalsRow = within(table).getByText('Итого').closest('tr')
    expect(within(totalsRow).getByText(money(5000))).toBeInTheDocument()
    expect(within(totalsRow).getByText(money(500))).toBeInTheDocument()

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(DEBTS_STORAGE_KEY))
      expect(stored).toHaveLength(1)
      expect(stored[0].id).toBe('debt-2')
    })
  })
})
