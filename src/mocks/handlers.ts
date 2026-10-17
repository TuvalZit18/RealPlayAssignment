// Mock backend. The single definition of mock behaviour, used by the browser
// worker and by Vitest. See docs/architecture/backend.md and api.md.

import { delay } from 'msw';
import { http, HttpResponse } from 'msw/http';
import { API_BASE_URL } from '../shared/api';
import { DEMO_RESET_EVENT } from '../shared/demoReset';

// Hard-coded on purpose: lets reviewers see the error path and confirm that
// attribution survives a failed registration.
export const FAILING_EMAIL = 'fail@example.com';

const RESPONSE_DELAY_MS = import.meta.env.MODE === 'test' ? 0 : 600;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "Database" of registered emails. Resets on every page load and on "Reset demo".
const registeredEmails = new Set<string>();

export function resetMockDb(): void {
  registeredEmails.clear();
}

window.addEventListener(DEMO_RESET_EVENT, resetMockDb);

function errorResponse(status: number, code: string, message: string, fields?: Record<string, string>) {
  return HttpResponse.json({ error: { code, message, ...(fields && { fields }) } }, { status });
}

type ValidationResult =
  | { ok: true; name: string; email: string }
  | { ok: false; fields: Record<string, string> };

function validate(body: unknown): ValidationResult {
  const fields: Record<string, string> = {};
  const input = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>;

  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (name.length < 1 || name.length > 100) fields.name = 'Name must be 1–100 characters.';

  const email = typeof input.email === 'string' ? input.email.trim() : '';
  if (!EMAIL_PATTERN.test(email)) fields.email = 'Enter a valid email address.';

  const { attribution } = input;
  if (attribution !== undefined) {
    const valid =
      typeof attribution === 'object' &&
      attribution !== null &&
      !Array.isArray(attribution) &&
      Object.values(attribution).every((value) => typeof value === 'string');
    if (!valid) fields.attribution = 'Attribution must be an object of string values.';
  }

  return Object.keys(fields).length > 0 ? { ok: false, fields } : { ok: true, name, email };
}

export const handlers = [
  http.post(`${API_BASE_URL}/register`, async ({ request }) => {
    await delay(RESPONSE_DELAY_MS);

    const body: unknown = await request.json().catch(() => null);
    const result = validate(body);
    if (!result.ok) {
      return errorResponse(400, 'VALIDATION_ERROR', 'Some fields are invalid.', result.fields);
    }

    const email = result.email.toLowerCase();
    if (email === FAILING_EMAIL) {
      return errorResponse(500, 'SERVER_ERROR', 'Something went wrong on our side. Please try again.');
    }
    if (registeredEmails.has(email)) {
      return errorResponse(409, 'EMAIL_TAKEN', 'An account with this email already exists.');
    }

    registeredEmails.add(email);
    return HttpResponse.json(
      {
        user: { id: crypto.randomUUID(), name: result.name, email: result.email },
        token: crypto.randomUUID(),
      },
      { status: 201 },
    );
  }),
];
