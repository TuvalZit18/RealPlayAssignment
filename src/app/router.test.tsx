import { screen, within } from '@testing-library/react';
import { renderRoute } from '../test/renderRoute';
import { seedSession } from '../test/session';

describe('routes', () => {
  it.each([
    ['/', 'Play for real.'],
    ['/register', 'Create your account'],
    ['/does-not-exist', 'Page not found'],
  ])('%s renders "%s"', (url, heading) => {
    renderRoute(url);
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('/account renders for a signed-in user', () => {
    seedSession();
    renderRoute('/account');
    expect(screen.getByRole('heading', { level: 1, name: 'Account' })).toBeInTheDocument();
    expect(screen.getByText('dana@example.com')).toBeInTheDocument();
  });

  it('renders the header with logo, navigation and sign-up when signed out', () => {
    renderRoute('/');
    expect(screen.getByRole('img', { name: 'RealPlay' })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toHaveTextContent('Home');
    expect(nav).toHaveTextContent('Account');
    const header = screen.getByRole('banner');
    expect(within(header).getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/register');
  });

  it('renders the footer with author and contact links on every page', () => {
    renderRoute('/register');
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveTextContent('Built by Tuval Zitelbach for RealPlay');
    expect(within(footer).getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/tuval-zitelbach/',
    );
    const github = within(footer).getByRole('link', { name: 'GitHub' });
    expect(github).toHaveAttribute('href', 'https://github.com/TuvalZit18');
    expect(github).toHaveAttribute('target', '_blank');
  });

  it('lists ready-made test links on the home page', () => {
    renderRoute('/');
    expect(screen.getByRole('link', { name: 'Promo modal' })).toHaveAttribute('href', '/?promo=SUMMER25');
    expect(screen.getByRole('link', { name: 'Open "Promo modal" in a new tab' })).toHaveAttribute('target', '_blank');
  });

  it('shows the registration form fields when signed out', () => {
    renderRoute('/register');
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  it('shows "already registered" on /register when signed in', () => {
    seedSession();
    renderRoute('/register');
    expect(screen.getByRole('heading', { level: 1, name: "You're already registered" })).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeInTheDocument();
  });
});
