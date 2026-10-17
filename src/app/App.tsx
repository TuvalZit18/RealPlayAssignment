import { RouterProvider, type createBrowserRouter } from 'react-router';
import { AppProviders } from './providers';

type AppRouter = ReturnType<typeof createBrowserRouter>;

export function App({ router }: { router: AppRouter }) {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
