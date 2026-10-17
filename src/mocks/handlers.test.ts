import { apiRequest, ApiError } from '../shared/api';
import { FAILING_EMAIL } from './handlers';

interface RegisterResponse {
  user: { id: string; name: string; email: string };
  token: string;
}

function register(body: unknown) {
  return apiRequest<RegisterResponse>('/register', { method: 'POST', body });
}

async function expectApiError(promise: Promise<unknown>) {
  const error = await promise.then(
    () => {
      throw new Error('Expected the request to fail');
    },
    (caught: unknown) => caught,
  );
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
}

describe('mock POST /api/register', () => {
  it('returns 201 with a user and token', async () => {
    const response = await register({
      name: 'Dana Levi',
      email: 'dana@example.com',
      attribution: { utm_source: 'google' },
    });

    expect(response.user).toMatchObject({ name: 'Dana Levi', email: 'dana@example.com' });
    expect(response.user.id).toEqual(expect.any(String));
    expect(response.token).toEqual(expect.any(String));
  });

  it('returns 400 with field errors for invalid input', async () => {
    const error = await expectApiError(register({ name: '', email: 'not-an-email' }));
    expect(error.status).toBe(400);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.fields).toEqual({ name: expect.any(String), email: expect.any(String) });
  });

  it('rejects attribution values that are not strings', async () => {
    const error = await expectApiError(
      register({ name: 'Dana', email: 'dana@example.com', attribution: { utm_source: 1 } }),
    );
    expect(error.fields).toHaveProperty('attribution');
  });

  it('returns 409 when the email was already registered', async () => {
    await register({ name: 'Dana', email: 'dana@example.com' });
    const error = await expectApiError(register({ name: 'Dana', email: 'DANA@example.com' }));
    expect(error.status).toBe(409);
    expect(error.code).toBe('EMAIL_TAKEN');
  });

  it(`returns 500 for ${FAILING_EMAIL}`, async () => {
    const error = await expectApiError(register({ name: 'Dana', email: FAILING_EMAIL }));
    expect(error.status).toBe(500);
    expect(error.code).toBe('SERVER_ERROR');
  });
});
