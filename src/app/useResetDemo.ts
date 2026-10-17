import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ATTRIBUTION_STORAGE_KEY, attributionHydrated, loadAttributionState } from '../features/attribution';
import { loadAuthState, SESSION_STORAGE_KEY, sessionHydrated } from '../features/auth';
import { announceDemoReset } from '../shared/demoReset';
import { removeKey } from '../shared/storage';
import { useAppDispatch } from './hooks';

/**
 * Reviewer helper: forget the session and attribution (including the
 * registered flag) so the next visit is a brand-new visitor. The theme choice
 * is kept. Other tabs follow through the storage event. The mock backend
 * hears the reset event and forgets registered emails, so the same email can
 * be registered again without a reload.
 */
export function useResetDemo(): () => void {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useCallback(() => {
    removeKey(SESSION_STORAGE_KEY);
    removeKey(ATTRIBUTION_STORAGE_KEY);
    dispatch(sessionHydrated(loadAuthState()));
    dispatch(attributionHydrated(loadAttributionState()));
    announceDemoReset();
    navigate('/', { replace: true });
  }, [dispatch, navigate]);
}
