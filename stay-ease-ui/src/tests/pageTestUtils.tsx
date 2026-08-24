import type { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';

export function renderWithProviders(ui: ReactNode) {
  return render(
    <AuthProvider>
      <ToastProvider>{ui}</ToastProvider>
    </AuthProvider>
  );
}
