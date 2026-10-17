import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { writeVersioned } from '../../shared/storage';
import { renderRoute } from '../../test/renderRoute';

describe('theme mode', () => {
  it('starts in dark mode by default', () => {
    renderRoute('/');
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
  });

  it('toggles and remembers the choice', async () => {
    const user = userEvent.setup();
    renderRoute('/');

    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));

    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('rp.theme') ?? '')).toEqual({ v: 1, mode: 'light' });
  });

  it('restores a stored choice', () => {
    writeVersioned('rp.theme', 1, { mode: 'light' });
    renderRoute('/');
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
  });

  it('falls back to dark for an invalid stored value', () => {
    writeVersioned('rp.theme', 1, { mode: 'purple' });
    renderRoute('/');
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
  });
});
