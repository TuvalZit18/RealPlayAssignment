export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Session {
  user: User;
  /** Opaque mock token, never decoded. */
  token: string;
}

export interface AuthState {
  session: Session | null;
}
