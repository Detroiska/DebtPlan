import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App.jsx'
import { formatMoney } from '../../src/utils/format.js'

const DEBTS_STORAGE_KEY = 'debtplan.debts.v1'

const money = (value) => formatMoney(value).replace(/\u00a0/g, ' ')

beforeEach(() => {
  localStorage.clear()
})

describe('FE-006: добавление долга', () => {
  it('после сохранения показывает долг в списке, обновляет итоги и localStorage', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByText('Добавьте первый долг')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Добавить долг' }))
    const dialog = screen.getByRole('dialog', { name: 'Добавление долга' })

    // Дожидаемся перевода фокуса на первое поле формы.
    await waitFor(() => {
      expect(within(dialog).getByLabelText('Тип продукта')).toHaveFocus()
    })

    await user.type(within(dialog).getByLabelText('Название, опционально'), 'Тестовый кредит')
    await user.type(within(dialog).getByLabelText('Остаток долга, ₽'), '12000')
    await user.type(within(dialog).getByLabelText('Годовая ставка, %'), '12.5')
    await user.type(within(dialog).getByLabelText('Минимальный платёж, ₽'), '1500')
    await user.click(within(dialog).getByRole('button', { name: 'Сохранить' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Добавление долга' })).not.toBeInTheDocument()
    })

    const table = screen.getByRole('table', { name: 'Список долгов' })
    expect(within(table).getByText('Тестовый кредит')).toBeInTheDocument()
    expect(within(table).getByText('12,5 %')).toBeInTheDocument()
    expect(screen.queryByText('Добавьте первый долг')).not.toBeInTheDocument()

    const totalsRow = within(table).getByText('Итого').closest('tr')
    expect(within(totalsRow).getByText(money(12000))).toBeInTheDocument()
    expect(within(totalsRow).getByText(money(1500))).toBeInTheDocument()

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(DEBTS_STORAGE_KEY))
      expect(stored).toHaveLength(1)
      expect(stored[0]).toMatchObject({
        name: 'Тестовый кредит',
        type: 'credit',
        balance: 12000,
        apr: 12.5,
        minPayment: 1500,
      })
    })
  })
})
