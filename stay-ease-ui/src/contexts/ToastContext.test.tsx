import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from './ToastContext'
import { describe, it, expect } from 'vitest'

function TestComponent() {
  const { show } = useToast();
  return <button onClick={() => show('Hello Toast', 'success', 1000)}>Show Toast</button>
}

describe('ToastContext', () => {
  it('shows a toast message when show is called', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const btn = screen.getByText('Show Toast')
    await userEvent.click(btn)

    const toast = await screen.findByText('Hello Toast')
    expect(toast).toBeTruthy()
  })
})
