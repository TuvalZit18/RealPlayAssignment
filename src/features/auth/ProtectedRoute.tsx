import { Navigate, Outlet, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from './authSlice';
import { registerRedirectFor } from './returnTo';

/** Route wrapper: signed-out users go to /register?returnTo=<this page>. */
export function ProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) return <Navigate replace to={registerRedirectFor(location)} />;
  return <Outlet />;
}
