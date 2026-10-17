import { RouterProvider, type createBrowserRouter } from 'react-router';
import { AppProviders } from './providers';
import type { AppStore } from './store';

type AppRouter = ReturnType<typeof createBrowserRouter>;

export function App({ router, store }: { router: AppRouter; store: AppStore }) {
  return (
    <AppProviders store={store}>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
