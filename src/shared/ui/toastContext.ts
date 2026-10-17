import { createContext, useContext } from 'react';

export type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

export interface ToastApi {
  showToast: (message: string, severity?: ToastSeverity) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside <ToastProvider>');
  return value;
}
