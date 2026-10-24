import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../src/App.jsx'

beforeEach(() => {
  localStorage.clear()
})

describe('модальные диалоги: фокус', () => {
  it('возвращает фокус на кнопку открытия после отмены', async () => {
    const user = userEvent.setup()
    render(<App />)

    const trigger = screen.getByRole('button', { name: 'Добавить долг' })
    await user.click(trigger)

    const dialog = screen.getByRole('dialog', { name: 'Добавление долга' })
    await waitFor(() => {
      expect(within(dialog).getByLabelText('Тип продукта')).toHaveFocus()
    })

    await user.click(within(dialog).getByRole('button', { name: 'Отмена' }))

    await waitFor(() => {
      expect(trigger).toHaveFocus()
    })
  })

  it('удерживает Tab внутри диалога', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Добавить долг' }))
    const dialog = screen.getByRole('dialog', { name: 'Добавление долга' })
    const firstField = within(dialog).getByLabelText('Тип продукта')
    const submit = within(dialog).getByRole('button', { name: 'Сохранить' })

    await waitFor(() => {
      expect(firstField).toHaveFocus()
    })

    await user.tab({ shift: true })
    expect(submit).toHaveFocus()

    await user.tab()
    expect(firstField).toHaveFocus()
  })
})
