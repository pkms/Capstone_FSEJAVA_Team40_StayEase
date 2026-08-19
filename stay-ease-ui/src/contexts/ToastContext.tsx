import { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'info' | 'success' | 'error' | 'warning';
interface Toast { id: string; message: string; type?: ToastType }

interface ToastContextValue { show: (message: string, type?: ToastType, ttl?: number) => void }

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = 'info', ttl = 4000) => {
    const id = 't-' + Math.random().toString(36).slice(2, 9);
    setToasts((s) => [...s, { id, message, type }]);
    setTimeout(() => {
      setToasts((s) => s.filter((t) => t.id !== id));
    }, ttl);
  }, []);

  const remove = (id: string) => setToasts((s) => s.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="toast-viewport" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type || 'info'}`} onClick={() => remove(t.id)}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
