import { useCallback } from 'react';
import {
  attributionHydrated,
  FIRST_TOUCH_WINDOW_MS,
  saveAttributionState,
  type AttributionState,
} from '../features/attribution';
import { useToast } from '../shared/ui';
import { useAppDispatch, useAppSelector } from './hooks';

/**
 * Reviewer helper: moves the stored first touch 30 days into the past, as if
 * that much time had passed, so the "after 30 days, overwrite" rule can be
 * tried in the browser. The rules themselves are untouched.
 */
export function useAgeFirstTouch() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.attribution);
  const { showToast } = useToast();

  const ageFirstTouch = useCallback(() => {
    if (!state.record) return;
    const next: AttributionState = {
      ...state,
      record: { ...state.record, firstTouchAt: state.record.firstTouchAt - FIRST_TOUCH_WINDOW_MS },
    };
    // Hydrated actions don't persist on their own, so save explicitly
    // (other tabs follow through the storage event).
    saveAttributionState(next);
    dispatch(attributionHydrated(next));
    showToast('First touch moved 30 days into the past. The next ad link replaces it.', 'info');
  }, [dispatch, showToast, state]);

  return { ageFirstTouch, canAge: state.record !== null };
}
