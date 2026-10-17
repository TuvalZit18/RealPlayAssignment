import { act } from '@testing-library/react';
import { attributionCaptured, attributionCleared, ATTRIBUTION_STORAGE_KEY } from '../features/attribution';
import { sessionEnded, sessionStarted, SESSION_STORAGE_KEY } from '../features/auth';
import { createAppStore, startCrossTabSync } from './store';

const stored = () => JSON.parse(window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY) ?? 'null');

describe('store persistence', () => {
  it('starts from the state saved in localStorage', () => {
    window.localStorage.setItem(
      ATTRIBUTION_STORAGE_KEY,
      JSON.stringify({ v: 1, record: { params: { ref: 'blog' }, firstTouchAt: 5 }, registered: false }),
    );
    expect(createAppStore().getState().attribution.record).toEqual({ params: { ref: 'blog' }, firstTouchAt: 5 });
  });

  it('saves after a capture and after clearing', () => {
    const store = createAppStore();

    store.dispatch(attributionCaptured({ params: { utm_source: 'google' }, now: 100 }));
    expect(stored()).toEqual({ v: 1, record: { params: { utm_source: 'google' }, firstTouchAt: 100 }, registered: false });

    store.dispatch(attributionCleared());
    expect(stored()).toEqual({ v: 1, record: null, registered: true });
  });

  it('does not write when a capture is ignored', () => {
    const store = createAppStore();
    store.dispatch(attributionCaptured({ params: { utm_source: 'google' }, now: 100 }));

    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    store.dispatch(attributionCaptured({ params: { utm_source: 'facebook' }, now: 200 })); // within 30 days
    expect(setItem).not.toHaveBeenCalled();
    setItem.mockRestore();
  });
});

describe('session persistence', () => {
  it('saves when a session starts and ends', () => {
    const store = createAppStore();
    const session = { user: { id: 'u1', name: 'Dana', email: 'dana@example.com' }, token: 't' };
    const storedSession = () => JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEY) ?? 'null');

    store.dispatch(sessionStarted(session));
    expect(storedSession()).toEqual({ v: 1, session });

    store.dispatch(sessionEnded());
    expect(storedSession()).toEqual({ v: 1, session: null });
  });
});

describe('cross-tab sync', () => {
  it('re-reads attribution when another tab changes it', () => {
    const store = createAppStore();
    const stop = startCrossTabSync(store);

    // Simulate another tab: write storage directly, then fire the storage event.
    window.localStorage.setItem(
      ATTRIBUTION_STORAGE_KEY,
      JSON.stringify({ v: 1, record: null, registered: true }),
    );
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: ATTRIBUTION_STORAGE_KEY }));
    });

    expect(store.getState().attribution).toEqual({ record: null, registered: true });
    stop();
  });

  it('signs this tab in when another tab registers', () => {
    const store = createAppStore();
    const stop = startCrossTabSync(store);
    const session = { user: { id: 'u1', name: 'Dana', email: 'dana@example.com' }, token: 't' };

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ v: 1, session }));
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: SESSION_STORAGE_KEY }));
    });

    expect(store.getState().auth.session).toEqual(session);
    stop();
  });

  it('ignores changes to other keys', () => {
    const store = createAppStore();
    const stop = startCrossTabSync(store);
    const before = store.getState().attribution;

    window.dispatchEvent(new StorageEvent('storage', { key: 'rp.theme' }));

    expect(store.getState().attribution).toBe(before);
    stop();
  });
});
