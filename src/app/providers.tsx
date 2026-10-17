import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ThemeModeProvider } from './theme';

// React Query owns server state only (the register mutation). Redux and the
// toast provider join here in later stages.
export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>{children}</ThemeModeProvider>
    </QueryClientProvider>
  );
}
