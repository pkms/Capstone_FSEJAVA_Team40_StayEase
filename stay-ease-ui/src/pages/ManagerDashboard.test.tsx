import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ManagerDashboard from './ManagerDashboard'
import { ToastProvider } from '../contexts/ToastContext'
import { AuthProvider } from '../contexts/AuthContext'

describe('ManagerDashboard guard', () => {
  it('redirects non-manager users and shows error toast', async () => {
    // seed a non-manager user in localStorage so AuthProvider picks it up
    localStorage.setItem('stayease_user', JSON.stringify({ id: 'u-guest', email: 'g@x.com', name: 'Guest', role: 'GUEST' }))
    // ensure initial hash is manager route
    window.location.hash = '#/manager'

    render(
      <AuthProvider>
        <ToastProvider>
          <ManagerDashboard />
        </ToastProvider>
      </AuthProvider>
    )

    // after render, the component should redirect to home
    expect(window.location.hash).toBe('#/')

    // and we should see the toast message
    const toast = await screen.findByText('Access denied: manager only')
    expect(toast).toBeTruthy()
  })
})
