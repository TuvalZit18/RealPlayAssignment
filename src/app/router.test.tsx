import { screen } from '@testing-library/react';
import { renderRoute } from '../test/renderRoute';

describe('routes', () => {
  it.each([
    ['/', 'Home'],
    ['/register', 'Create your account'],
    ['/account', 'Account'],
    ['/does-not-exist', 'Page not found'],
  ])('%s renders "%s"', (url, heading) => {
    renderRoute(url);
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
  });

  it('renders the main navigation on every page', () => {
    renderRoute('/account');
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(nav).toHaveTextContent('Home');
    expect(nav).toHaveTextContent('Register');
    expect(nav).toHaveTextContent('Account');
  });
});
