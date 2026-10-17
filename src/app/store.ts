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

// Persistence and cross-tab sync: docs/architecture/data-storage.md.

const rootReducer = combineReducers({
  attribution: attributionReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function createAppStore() {
  const persistence = createListenerMiddleware();

  // Slices stay pure; this writes the new slice state after persisting actions.
  // `*Hydrated` actions are never matched, so tabs don't echo writes back.
  persistence.startListening({
    matcher: isAnyOf(attributionCaptured, attributionCleared),
    effect: (_action, api) => {
      const next = (api.getState() as RootState).attribution;
      const previous = (api.getOriginalState() as RootState).attribution;
      if (next !== previous) saveAttributionState(next);
    },
  });

  return configureStore({
    reducer: rootReducer,
    preloadedState: { attribution: loadAttributionState() },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(persistence.middleware),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore['dispatch'];

/** Re-reads storage when another tab changes it. Returns a cleanup function. */
export function startCrossTabSync(store: AppStore): () => void {
  const onStorage = (event: StorageEvent) => {
    // `key` is null when another tab clears all storage.
    if (event.key === ATTRIBUTION_STORAGE_KEY || event.key === null) {
      store.dispatch(attributionHydrated(loadAttributionState()));
    }
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}
