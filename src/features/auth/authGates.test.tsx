import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderRoute } from '../../test/renderRoute';
import { seedSession } from '../../test/session';

const pathAndSearch = (router: { state: { location: { pathname: string; search: string } } }) =>
  router.state.location.pathname + router.state.location.search;

describe('signed-out gates', () => {
  it('redirects a modal link to /register, keeps the destination and the attribution', () => {
    const { router, store } = renderRoute('/?promo=SUMMER25&utm_source=google');

    expect(pathAndSearch(router)).toBe('/register?returnTo=%2F%3Fpromo%3DSUMMER25');
    expect(screen.getByRole('heading', { level: 1, name: 'Create your account' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
    expect(store.getState().attribution.record?.params).toEqual({ utm_source: 'google' });
  });

  it('redirects a modal link on any page', () => {
    const { router } = renderRoute('/account?invite=friend_42');
    expect(pathAndSearch(router)).toBe('/register?returnTo=%2Faccount%3Finvite%3Dfriend_42');
  });

  it('does not redirect for an invalid modal param', () => {
    const { router } = renderRoute('/?welcome=2');
    expect(pathAndSearch(router)).toBe('/?welcome=2');
  });

  it('protects /account', () => {
    const { router } = renderRoute('/account');
    expect(pathAndSearch(router)).toBe('/register?returnTo=%2Faccount');
  });

  it('uses replace, so Back does not return to the redirecting URL', () => {
    const { router } = renderRoute('/?promo=SUMMER25');
    expect(router.state.historyAction).toBe('REPLACE');
  });
});

describe('signed in', () => {
  beforeEach(() => seedSession());

  it('opens modals instead of redirecting', () => {
    const { router } = renderRoute('/?promo=SUMMER25');
    expect(pathAndSearch(router)).toBe('/?promo=SUMMER25');
    expect(screen.getByRole('dialog', { name: 'Promo unlocked' })).toBeInTheDocument();
  });

  it('shows the user in the header and signs out', async () => {
    const user = userEvent.setup();
    const { router, store } = renderRoute('/account');

    await user.click(screen.getByRole('button', { name: 'D Dana Levi' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));

    expect(store.getState().auth.session).toBeNull();
    expect(pathAndSearch(router)).toBe('/');
    expect(within(screen.getByRole('banner')).getByRole('link', { name: 'Sign up' })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('rp.session') ?? '')).toEqual({ v: 1, session: null });
  });

  it('keeps the registered flag after signing out', async () => {
    window.localStorage.setItem('rp.attribution', JSON.stringify({ v: 1, record: null, registered: true }));
    const user = userEvent.setup();
    const { store } = renderRoute('/');

    await user.click(screen.getByRole('button', { name: 'D Dana Levi' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));

    expect(store.getState().attribution.registered).toBe(true);
  });
});

describe('reset demo', () => {
  it('forgets session and attribution but keeps the theme', async () => {
    seedSession();
    window.localStorage.setItem('rp.attribution', JSON.stringify({ v: 1, record: null, registered: true }));
    window.localStorage.setItem('rp.theme', JSON.stringify({ v: 1, mode: 'light' }));
    const user = userEvent.setup();
    const { store } = renderRoute('/');

    const tryIt = screen.getByRole('region', { name: 'Try it' });
    await user.click(within(tryIt).getByRole('button', { name: 'Reset demo' }));

    expect(store.getState().auth.session).toBeNull();
    expect(store.getState().attribution).toEqual({ record: null, registered: false });
    expect(window.localStorage.getItem('rp.session')).toBeNull();
    expect(window.localStorage.getItem('rp.attribution')).toBeNull();
    expect(window.localStorage.getItem('rp.theme')).not.toBeNull();
  });
});
