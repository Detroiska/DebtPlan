import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../src/components/ErrorBoundary.jsx'

function Broken() {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('показывает запасной экран вместо пустой страницы', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Не удалось построить план')
    expect(screen.getByRole('button', { name: 'Перезагрузить' })).toBeInTheDocument()

    consoleError.mockRestore()
  })
})
