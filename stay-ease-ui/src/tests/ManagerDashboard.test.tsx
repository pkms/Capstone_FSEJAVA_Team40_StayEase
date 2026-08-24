import { screen, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ManagerDashboard from '../pages/ManagerDashboard';
import { ToastProvider } from '../contexts/ToastContext';
import { AuthProvider } from '../contexts/AuthContext';

vi.mock('../api/mockApi', () => ({
  listHotelsForManager: vi.fn().mockResolvedValue([]),
  listRoomsForManager: vi.fn().mockResolvedValue([]),
  listUpcomingBookingsForManager: vi.fn().mockResolvedValue([]),
  createRoom: vi.fn(),
}));

describe('ManagerDashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('redirects non-manager users and shows an access denied message', async () => {
    const payload = btoa(JSON.stringify({ sub: 'guest@example.com' }));
    localStorage.setItem('stayease_token', `header.${payload}.signature`);
    localStorage.setItem('stayease_role', 'GUEST');
    localStorage.setItem('stayease_user_id', 'guest-1');
    window.location.hash = '#/manager';

    render(
      <AuthProvider>
        <ToastProvider><ManagerDashboard /></ToastProvider>
      </AuthProvider>
    );

    expect(await screen.findByText('Access denied: manager only')).toBeTruthy();
    expect(window.location.hash).toBe('#/');
  });
});
