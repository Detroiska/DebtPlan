import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DebtForm from '../../src/features/debts/DebtForm.jsx'

async function renderDebtForm(onSubmit = vi.fn()) {
  render(
    <DebtForm
      isOpen
      title="Добавление долга"
      submitLabel="Сохранить"
      onClose={vi.fn()}
      onSubmit={onSubmit}
    />,
  )

  // Форма переводит фокус на первое поле через requestAnimationFrame.
  // Ждём, чтобы фокус не перехватил ввод user-event.
  await waitFor(() => {
    expect(screen.getByLabelText('Тип продукта')).toHaveFocus()
  })

  return { onSubmit }
}

describe('FE-007: валидация формы добавления долга', () => {
  it('не отправляет пустую форму и показывает ошибки у обязательных полей', async () => {
    const user = userEvent.setup()
    const { onSubmit } = await renderDebtForm()

    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(screen.getAllByText('Заполните поле')).toHaveLength(3)
    expect(screen.getByLabelText('Остаток долга, ₽')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Годовая ставка, %')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Минимальный платёж, ₽')).toHaveAttribute('aria-invalid', 'true')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('не принимает остаток 0, ставку больше 100 и платёж 0', async () => {
    const user = userEvent.setup()
    const { onSubmit } = await renderDebtForm()

    await user.type(screen.getByLabelText('Остаток долга, ₽'), '0')
    await user.type(screen.getByLabelText('Годовая ставка, %'), '101')
    await user.type(screen.getByLabelText('Минимальный платёж, ₽'), '0')
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(screen.getByText('Остаток долга должен быть больше 0')).toBeInTheDocument()
    expect(screen.getByText('Годовая ставка должна быть от 0 до 100')).toBeInTheDocument()
    expect(screen.getByText('Минимальный платёж должен быть больше 0')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('передаёт корректные данные, обрезая пробелы в названии', async () => {
    const user = userEvent.setup()
    const { onSubmit } = await renderDebtForm()

    await fireEvent.change(screen.getByLabelText('Название, опционально'), {
      target: { value: '  Тестовый кредит  ' },
    })
    await user.type(screen.getByLabelText('Остаток долга, ₽'), '12000')
    await user.type(screen.getByLabelText('Годовая ставка, %'), '12.5')
    await user.type(screen.getByLabelText('Минимальный платёж, ₽'), '1500')
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      type: 'credit',
      name: 'Тестовый кредит',
      balance: '12000',
      apr: '12.5',
      minPayment: '1500',
    })
  })

  it('не принимает остаток и минимальный платёж меньше 0,01', async () => {
    const user = userEvent.setup()
    const { onSubmit } = await renderDebtForm()

    await user.type(screen.getByLabelText('Остаток долга, ₽'), '0.001')
    await user.type(screen.getByLabelText('Годовая ставка, %'), '10')
    await user.type(screen.getByLabelText('Минимальный платёж, ₽'), '0.001')
    await user.click(screen.getByRole('button', { name: 'Сохранить' }))

    expect(screen.getByText('Остаток долга должен быть не меньше 0,01 ₽')).toBeInTheDocument()
    expect(screen.getByText('Минимальный платёж должен быть не меньше 0,01 ₽')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('убирает сообщение об ошибке после исправления поля', async () => {
    const user = userEvent.setup()
    await renderDebtForm()

    await user.click(screen.getByRole('button', { name: 'Сохранить' }))
    expect(screen.getAllByText('Заполните поле')).toHaveLength(3)

    await user.type(screen.getByLabelText('Остаток долга, ₽'), '1000')

    expect(screen.getByLabelText('Остаток долга, ₽')).not.toHaveAttribute('aria-invalid')
    expect(screen.getAllByText('Заполните поле')).toHaveLength(2)
  })
})
