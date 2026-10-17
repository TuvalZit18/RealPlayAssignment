import type { RouteObject } from 'react-router';
import { ProtectedRoute } from '../features/auth';
import { AccountPage } from '../pages/AccountPage';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AppLayout } from './AppLayout';

// Shared by the browser router (main.tsx) and memory routers in tests.
export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/register', element: <RegisterPage /> },
      { element: <ProtectedRoute />, children: [{ path: '/account', element: <AccountPage /> }] },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
