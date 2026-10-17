import { combineReducers, configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import {
  ATTRIBUTION_STORAGE_KEY,
  attributionCaptured,
  attributionCleared,
  attributionHydrated,
  attributionReducer,
  loadAttributionState,
  saveAttributionState,
} from '../features/attribution';
import {
  authReducer,
  loadAuthState,
  saveAuthState,
  SESSION_STORAGE_KEY,
  sessionEnded,
  sessionHydrated,
  sessionStarted,
} from '../features/auth';

// Persistence and cross-tab sync: docs/architecture/data-storage.md.

const rootReducer = combineReducers({
  attribution: attributionReducer,
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function createAppStore() {
  const persistence = createListenerMiddleware();

  // Slices stay pure; these write a slice's new state after its persisting
  // actions, only when it changed. `*Hydrated` actions are never matched, so
  // tabs don't echo writes back to each other.
  persistence.startListening({
    matcher: isAnyOf(attributionCaptured, attributionCleared),
    effect: (_action, api) => {
      const next = (api.getState() as RootState).attribution;
      if (next !== (api.getOriginalState() as RootState).attribution) saveAttributionState(next);
    },
  });
  persistence.startListening({
    matcher: isAnyOf(sessionStarted, sessionEnded),
    effect: (_action, api) => {
      const next = (api.getState() as RootState).auth;
      if (next !== (api.getOriginalState() as RootState).auth) saveAuthState(next);
    },
  });

  return configureStore({
    reducer: rootReducer,
    preloadedState: { attribution: loadAttributionState(), auth: loadAuthState() },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(persistence.middleware),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore['dispatch'];

/** Re-reads storage when another tab changes it. Returns a cleanup function. */
export function startCrossTabSync(store: AppStore): () => void {
  const onStorage = ({ key }: StorageEvent) => {
    // `key` is null when another tab clears all storage.
    if (key === ATTRIBUTION_STORAGE_KEY || key === null) {
      store.dispatch(attributionHydrated(loadAttributionState()));
    }
    if (key === SESSION_STORAGE_KEY || key === null) {
      store.dispatch(sessionHydrated(loadAuthState()));
    }
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}
