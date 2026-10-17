import { readVersioned, writeVersioned } from '../../shared/storage';
import { emptyAuthState } from './authSlice';
import type { AuthState } from './types';

export const SESSION_STORAGE_KEY = 'rp.session';
const STORAGE_VERSION = 1;

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

function isAuthState(value: unknown): value is AuthState {
  const { session } = value as Partial<AuthState>;
  if (session === null) return true;
  if (typeof session !== 'object' || session === undefined) return false;
  const { user, token } = session;
  return (
    isNonEmptyString(token) &&
    typeof user === 'object' &&
    user !== null &&
    isNonEmptyString(user.id) &&
    isNonEmptyString(user.name) &&
    isNonEmptyString(user.email)
  );
}

export function loadAuthState(): AuthState {
  return readVersioned(SESSION_STORAGE_KEY, STORAGE_VERSION, isAuthState) ?? emptyAuthState;
}

export function saveAuthState(state: AuthState): void {
  writeVersioned(SESSION_STORAGE_KEY, STORAGE_VERSION, state);
}
