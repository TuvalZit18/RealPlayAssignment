import { apiRequest } from '../../shared/api';
import type { AttributionParams } from '../attribution';
import type { Session } from '../auth';

// Contract: docs/architecture/api.md.

export interface RegisterRequest {
  name: string;
  email: string;
  /** Omitted when no attribution is stored. */
  attribution?: AttributionParams;
}

export type RegisterResponse = Session;

export function registerUser(body: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/register', { method: 'POST', body });
}
