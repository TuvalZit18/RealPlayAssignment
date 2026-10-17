import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ToastContext, type ToastSeverity } from './toastContext';

interface Toast {
  id: number;
  message: string;
  severity: ToastSeverity;
}

const AUTO_HIDE_MS = 5000;

// One toast at a time; a new one replaces the current one. Mounted above the
// routes, so a toast survives the navigation that often follows it.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [open, setOpen] = useState(false);

  const showToast = useCallback((message: string, severity: ToastSeverity = 'success') => {
    setToast({ id: Date.now(), message, severity });
    setOpen(true);
  }, []);

  const api = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Snackbar
        key={toast?.id}
        open={open}
        autoHideDuration={AUTO_HIDE_MS}
        onClose={(_event, reason) => {
          if (reason !== 'clickaway') setOpen(false);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} variant="filled" onClose={() => setOpen(false)} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  );
}
