import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import type { AppStore } from './store';
import { ThemeModeProvider } from './theme';

// Redux owns client state (attribution, later auth). React Query owns server
// state only (the register mutation). The toast provider joins in Stage 8.
export function AppProviders({ store, children }: { store: AppStore; children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeModeProvider>{children}</ThemeModeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
