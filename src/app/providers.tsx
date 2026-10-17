import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { ToastProvider } from '../shared/ui';
import type { AppStore } from './store';
import { ThemeModeProvider } from './theme';

// Redux owns client state (attribution, auth). React Query owns server state
// only (the register mutation). The toast sits above the routes.
export function AppProviders({ store, children }: { store: AppStore; children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeModeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeModeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
