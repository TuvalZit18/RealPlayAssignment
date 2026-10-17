import { screen } from '@testing-library/react';
import { renderRoute } from '../test/renderRoute';

describe('routes', () => {
  it.each([
    ['/', 'Play for real.'],
    ['/register', 'Create your account'],
    ['/account', 'Account'],
    ['/does-not-exist', 'Page not found'],
  ])('%s renders "%s"', (url, heading) => {
    renderRoute(url);
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('renders the header with logo, navigation and sign-up on every page', () => {
    renderRoute('/account');
    expect(screen.getByRole('img', { name: 'RealPlay' })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toHaveTextContent('Home');
    expect(nav).toHaveTextContent('Account');
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/register');
  });

  it('lists ready-made test links on the home page', () => {
    renderRoute('/');
    expect(screen.getByRole('link', { name: 'Promo modal' })).toHaveAttribute('href', '/?promo=SUMMER25');
    expect(screen.getByRole('link', { name: 'Open "Promo modal" in a new tab' })).toHaveAttribute('target', '_blank');
  });

  it('shows the registration form fields', () => {
    renderRoute('/register');
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });
});
