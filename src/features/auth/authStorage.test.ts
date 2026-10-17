import { emptyAuthState } from './authSlice';
import { loadAuthState, SESSION_STORAGE_KEY } from './authStorage';

const setRaw = (value: unknown) => window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(value));
const user = { id: 'u1', name: 'Dana', email: 'dana@example.com' };

describe('session storage', () => {
  it('loads a valid stored session', () => {
    setRaw({ v: 1, session: { user, token: 't' } });
    expect(loadAuthState()).toEqual({ session: { user, token: 't' } });
  });

  it.each([
    ['wrong version', { v: 2, session: { user, token: 't' } }],
    ['missing token', { v: 1, session: { user } }],
    ['empty user name', { v: 1, session: { user: { ...user, name: '' }, token: 't' } }],
    ['missing session key', { v: 1 }],
  ])('discards a session with %s', (_label, raw) => {
    setRaw(raw);
    expect(loadAuthState()).toEqual(emptyAuthState);
  });
});
