import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http } from 'msw/http';
import { FAILING_EMAIL } from '../../mocks/handlers';
import { server } from '../../mocks/server';
import { API_BASE_URL } from '../../shared/api';
import { renderRoute } from '../../test/renderRoute';

// Records every POST /register body, then lets the real mock handler answer.
function recordRegisterRequests() {
  const bodies: unknown[] = [];
  server.use(
    http.post(`${API_BASE_URL}/register`, async ({ request }) => {
      bodies.push(await request.clone().json());
      return undefined; // fall through to the default handler
    }),
  );
  return bodies;
}

async function fillAndSubmit(name: string, email: string) {
  const user = userEvent.setup();
  await user.type(screen.getByRole('textbox', { name: 'Name' }), name);
  await user.type(screen.getByRole('textbox', { name: 'Email' }), email);
  await user.click(screen.getByRole('button', { name: 'Create account' }));
}

describe('registration end to end', () => {
  it('sends attribution, signs in, clears attribution, shows a toast and returns to the destination', async () => {
    const bodies = recordRegisterRequests();
    // Signed-out visitor from a Google ad opens a promo link: redirected to /register.
    const { router, store } = renderRoute('/?promo=SUMMER25&utm_source=google&gclid=G1');
    expect(router.state.location.pathname).toBe('/register');

    await fillAndSubmit('Dana Levi', 'dana@example.com');

    expect(await screen.findByRole('dialog', { name: 'Promo unlocked' })).toBeInTheDocument();
    expect(bodies).toEqual([
      { name: 'Dana Levi', email: 'dana@example.com', attribution: { utm_source: 'google', gclid: 'G1' } },
    ]);
    expect(router.state.location.pathname + router.state.location.search).toBe('/?promo=SUMMER25');
    // The open promo dialog makes MUI mark the rest of the page (toast included)
    // aria-hidden, so look for the toast with hidden: true.
    expect(screen.getByRole('alert', { hidden: true })).toHaveTextContent('Welcome, Dana Levi! Your account is ready.');
    expect(store.getState().auth.session?.user.email).toBe('dana@example.com');
    expect(store.getState().attribution).toEqual({ record: null, registered: true });
  });

  it('omits attribution when none is stored and goes home without returnTo', async () => {
    const bodies = recordRegisterRequests();
    const { router } = renderRoute('/register');

    await fillAndSubmit('Dana', 'dana@example.com');

    expect(await screen.findByRole('heading', { level: 1, name: 'Play for real.' })).toBeInTheDocument();
    expect(bodies).toEqual([{ name: 'Dana', email: 'dana@example.com' }]);
    expect(router.state.location.pathname).toBe('/');
  });

  it('ignores an unsafe returnTo', async () => {
    const { router } = renderRoute('/register?returnTo=https%3A%2F%2Fevil.example');
    await fillAndSubmit('Dana', 'dana@example.com');
    expect(await screen.findByRole('heading', { level: 1, name: 'Play for real.' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });

  it('shows the error and keeps attribution when the request fails', async () => {
    const bodies = recordRegisterRequests();
    const { store } = renderRoute('/register?utm_source=newsletter');

    await fillAndSubmit('Dana', FAILING_EMAIL);

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong on our side');
    expect(bodies).toHaveLength(1); // no automatic retry
    expect(store.getState().auth.session).toBeNull();
    expect(store.getState().attribution.record?.params).toEqual({ utm_source: 'newsletter' });
    expect(screen.getByRole('button', { name: 'Create account' })).toBeEnabled();
  });

  it('shows the server message when the email is taken', async () => {
    server.use(
      http.post(`${API_BASE_URL}/register`, () =>
        Response.json({ error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' } }, { status: 409 }),
      ),
    );
    renderRoute('/register');

    await fillAndSubmit('Dana', 'dana@example.com');

    expect(await screen.findByRole('alert')).toHaveTextContent('An account with this email already exists.');
  });

  it('validates on the client and sends nothing when invalid', async () => {
    const bodies = recordRegisterRequests();
    const user = userEvent.setup();
    renderRoute('/register');

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(screen.getByText('Enter your name.')).toBeInTheDocument();
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument();
    expect(bodies).toHaveLength(0);

    // Errors update as the user fixes them.
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Dana');
    expect(screen.queryByText('Enter your name.')).not.toBeInTheDocument();
  });
});
