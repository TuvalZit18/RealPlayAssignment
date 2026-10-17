import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { hasModalParams } from '../modals';
import { selectIsAuthenticated } from './authSlice';
import { registerRedirectFor } from './returnTo';

/**
 * The modal gate. Returns where to redirect when a signed-out user's URL has a
 * valid modal param, otherwise null. AppLayout renders the redirect instead of
 * the page, so the page never flashes.
 */
export function useModalGateRedirect(): string | null {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (isAuthenticated || !hasModalParams(new URLSearchParams(location.search))) return null;
  return registerRedirectFor(location);
}
