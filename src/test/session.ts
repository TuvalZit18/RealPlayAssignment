import { saveAuthState, type Session } from '../features/auth';

export const TEST_SESSION: Session = {
  user: { id: 'user-1', name: 'Dana Levi', email: 'dana@example.com' },
  token: 'test-token',
};

/** Signs the next rendered app in, by seeding the stored session. */
export function seedSession(session: Session = TEST_SESSION): void {
  saveAuthState({ session });
}
