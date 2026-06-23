import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Toast {
  id: number;
  message: string;
  variant: 'default' | 'error' | 'success';
}

interface ToastContextValue {
  showToast: (message: string, variant?: Toast['variant']) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, variant: Toast['variant'] = 'default') => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed inset-x-0 bottom-28 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'w-full max-w-sm rounded-card px-4 py-3 text-sm font-medium shadow-floating',
              t.variant === 'error' && 'bg-danger text-accent-contrast',
              t.variant === 'success' && 'bg-success text-accent-contrast',
              t.variant === 'default' && 'bg-surface text-primary',
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
