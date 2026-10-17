import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { FIRST_TOUCH_WINDOW_MS } from './constants';
import type { AttributionParams, AttributionState } from './types';

export const emptyAttributionState: AttributionState = { record: null, registered: false };

const attributionSlice = createSlice({
  name: 'attribution',
  initialState: emptyAttributionState,
  reducers: {
    // The rules from docs/architecture/attribution.md, in order. `now` comes in
    // with the action so the reducer stays pure and testable with any clock.
    attributionCaptured(state, action: PayloadAction<{ params: AttributionParams; now: number }>) {
      const { params, now } = action.payload;

      if (Object.keys(params).length === 0) return; // 1. nothing to capture
      if (state.registered) return; // 2. already registered
      if (state.record && now - state.record.firstTouchAt < FIRST_TOUCH_WINDOW_MS) return; // 4. keep first touch

      state.record = { params, firstTouchAt: now }; // 3. first touch, or 5. 30+ days old: replace
    },
    attributionCleared(state) {
      state.record = null;
      state.registered = true;
    },
    attributionHydrated(_state, action: PayloadAction<AttributionState>) {
      return action.payload;
    },
  },
  selectors: {
    selectAttributionRecord: (state) => state.record,
    selectAttributionParams: (state) => state.record?.params ?? null,
    selectIsRegistered: (state) => state.registered,
  },
});

export const { attributionCaptured, attributionCleared, attributionHydrated } = attributionSlice.actions;
export const { selectAttributionRecord, selectAttributionParams, selectIsRegistered } = attributionSlice.selectors;
export const attributionReducer = attributionSlice.reducer;
