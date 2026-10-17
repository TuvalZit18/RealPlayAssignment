import type { Dispatch } from '@reduxjs/toolkit';
import { attributionCaptured } from './attributionSlice';
import { extractAttributionParams } from './extractAttributionParams';

// Capture runs outside React, so no component can redirect before the params
// are read. See docs/architecture/attribution.md.

/** Reads campaign params from a query string and dispatches a capture. */
export function captureAttribution(dispatch: Dispatch, search: string, now: number = Date.now()): void {
  const params = extractAttributionParams(search);
  if (Object.keys(params).length > 0) dispatch(attributionCaptured({ params, now }));
}

interface NavigationLocation {
  key: string;
  search: string;
}

/** The part of a React Router data router this module needs. */
export interface NavigableRouter {
  state: { location: NavigationLocation };
  subscribe(listener: (state: { location: NavigationLocation }) => void): () => void;
}

/**
 * Captures on every navigation. `router.subscribe` doesn't fire for the
 * initial location, which the bootstrap captures separately.
 */
export function captureOnNavigation(
  router: NavigableRouter,
  dispatch: Dispatch,
  clock: () => number = Date.now,
): () => void {
  let lastKey = router.state.location.key;
  return router.subscribe(({ location }) => {
    if (location.key === lastKey) return; // ignore non-navigation state updates
    lastKey = location.key;
    captureAttribution(dispatch, location.search, clock());
  });
}
