import {
  attributionCaptured,
  attributionCleared,
  attributionHydrated,
  attributionReducer,
  emptyAttributionState,
} from './attributionSlice';
import { FIRST_TOUCH_WINDOW_MS } from './constants';
import type { AttributionState } from './types';

const DAY = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 9, 1);
const google = { utm_source: 'google', gclid: 'G1' };
const facebook = { utm_source: 'facebook', fbclid: 'F1' };

const withRecord = (firstTouchAt: number, registered = false): AttributionState => ({
  record: { params: google, firstTouchAt },
  registered,
});

const capture = (state: AttributionState, params: Record<string, string>, now: number) =>
  attributionReducer(state, attributionCaptured({ params, now }));

describe('attribution rules', () => {
  it('saves the first touch when nothing is stored', () => {
    expect(capture(emptyAttributionState, google, T0)).toEqual(withRecord(T0));
  });

  it('ignores an empty capture', () => {
    expect(capture(emptyAttributionState, {}, T0)).toBe(emptyAttributionState);
  });

  it('keeps the first touch when it is 5 days old', () => {
    const state = withRecord(T0);
    expect(capture(state, facebook, T0 + 5 * DAY)).toBe(state);
  });

  it('keeps the first touch one millisecond before 30 days', () => {
    const state = withRecord(T0);
    expect(capture(state, facebook, T0 + FIRST_TOUCH_WINDOW_MS - 1)).toBe(state);
  });

  it('replaces the record and resets the clock at exactly 30 days', () => {
    const now = T0 + 30 * DAY;
    expect(capture(withRecord(T0), facebook, now)).toEqual({
      record: { params: facebook, firstTouchAt: now },
      registered: false,
    });
  });

  it('replaces the record at 31 days', () => {
    const now = T0 + 31 * DAY;
    expect(capture(withRecord(T0), facebook, now).record).toEqual({ params: facebook, firstTouchAt: now });
  });

  it('ignores new params once the user is registered', () => {
    const registered: AttributionState = { record: null, registered: true };
    expect(capture(registered, facebook, T0)).toBe(registered);
  });

  it('keeps an expired record when no new params arrive (sent as-is at registration)', () => {
    const state = withRecord(T0);
    expect(capture(state, {}, T0 + 45 * DAY)).toBe(state);
  });

  it('clears the record and sets registered on attributionCleared', () => {
    expect(attributionReducer(withRecord(T0), attributionCleared())).toEqual({ record: null, registered: true });
  });

  it('replaces state on attributionHydrated', () => {
    const fromOtherTab = withRecord(T0 - DAY, true);
    expect(attributionReducer(emptyAttributionState, attributionHydrated(fromOtherTab))).toEqual(fromOtherTab);
  });
});
