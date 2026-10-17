import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderRoute } from '../../test/renderRoute';

// Lower modals in a stack are aria-hidden by MUI, so query with hidden: true
// to see the whole stack.
const allDialogs = () => screen.queryAllByRole('dialog', { hidden: true });

describe('modals in the app', () => {
  it('opens a modal on cold load from the URL', () => {
    renderRoute('/?promo=SUMMER25');
    const dialog = screen.getByRole('dialog', { name: 'Promo unlocked' });
    expect(dialog).toHaveTextContent('SUMMER25');
  });

  it('opens a modal on any page', () => {
    renderRoute('/register?invite=friend_42');
    expect(screen.getByRole('dialog', { name: "You've been invited" })).toHaveTextContent('friend_42');
  });

  it('ignores an invalid modal param', () => {
    renderRoute('/?welcome=2');
    expect(allDialogs()).toHaveLength(0);
  });

  it('stacks modals in URL order with the last on top', () => {
    renderRoute('/?welcome=1&promo=SUMMER25');
    const [bottom, top] = allDialogs();
    expect(bottom).toHaveAccessibleName('Welcome to RealPlay');
    expect(top).toHaveAccessibleName('Promo unlocked');
    // Only the top modal is exposed to assistive tech.
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Promo unlocked');
  });

  it('closing a modal removes only its own param', async () => {
    const user = userEvent.setup();
    const { router } = renderRoute('/?welcome=1&promo=SUMMER25&utm_source=google');

    const promo = screen.getByRole('dialog', { name: 'Promo unlocked' });
    await user.click(within(promo).getByRole('button', { name: 'Close' }));

    expect(router.state.location.search).toBe('?welcome=1&utm_source=google');
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Welcome to RealPlay');
  });

  it('reopens on Back and closes again on Forward', async () => {
    const user = userEvent.setup();
    const { router } = renderRoute('/?promo=SUMMER25');

    await user.click(screen.getByRole('button', { name: 'Got it' }));
    expect(allDialogs()).toHaveLength(0);

    await act(() => router.navigate(-1));
    expect(screen.getByRole('dialog', { name: 'Promo unlocked' })).toBeInTheDocument();

    await act(() => router.navigate(1));
    expect(allDialogs()).toHaveLength(0);
  });

  it('opens on in-app navigation', async () => {
    const user = userEvent.setup();
    renderRoute('/');

    await user.click(screen.getByRole('link', { name: 'Welcome modal' }));

    expect(screen.getByRole('dialog', { name: 'Welcome to RealPlay' })).toBeInTheDocument();
  });
});
