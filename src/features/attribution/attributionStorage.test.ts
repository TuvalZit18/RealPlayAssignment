import { emptyAttributionState } from './attributionSlice';
import { loadAttributionState, saveAttributionState } from './attributionStorage';
import { STORAGE_KEY } from './constants';

const setRaw = (value: unknown) => window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));

describe('attribution storage', () => {
  it('round-trips state as a versioned record', () => {
    const state = { record: { params: { utm_source: 'google' }, firstTouchAt: 1000 }, registered: false };
    saveAttributionState(state);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '')).toEqual({ v: 1, ...state });
    expect(loadAttributionState()).toEqual(state);
  });

  it('returns the empty state when nothing is stored', () => {
    expect(loadAttributionState()).toEqual(emptyAttributionState);
  });

  it.each([
    ['wrong version', { v: 2, record: null, registered: false }],
    ['missing registered flag', { v: 1, record: null }],
    ['non-string param value', { v: 1, record: { params: { utm_source: 1 }, firstTouchAt: 1 }, registered: false }],
    ['missing timestamp', { v: 1, record: { params: {} }, registered: false }],
  ])('discards a record with %s', (_label, raw) => {
    setRaw(raw);
    expect(loadAttributionState()).toEqual(emptyAttributionState);
  });
});
