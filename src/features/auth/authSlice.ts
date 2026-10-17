import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, Session } from './types';

// Mocked auth: registering is the only way to get a session.
// See docs/architecture/auth.md.

export const emptyAuthState: AuthState = { session: null };

const authSlice = createSlice({
  name: 'auth',
  initialState: emptyAuthState,
  reducers: {
    sessionStarted(state, action: PayloadAction<Session>) {
      state.session = action.payload;
    },
    /** Sign out: clears the session only. Attribution's `registered` flag stays. */
    sessionEnded(state) {
      state.session = null;
    },
    sessionHydrated(_state, action: PayloadAction<AuthState>) {
      return action.payload;
    },
  },
  selectors: {
    selectIsAuthenticated: (state) => state.session !== null,
    selectCurrentUser: (state) => state.session?.user ?? null,
  },
});

export const { sessionStarted, sessionEnded, sessionHydrated } = authSlice.actions;
export const { selectIsAuthenticated, selectCurrentUser } = authSlice.selectors;
export const authReducer = authSlice.reducer;
