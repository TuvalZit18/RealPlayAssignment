import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderRoute } from '../test/renderRoute';
import { seedSession } from '../test/session';

const status = () => within(screen.getByRole('region', { name: 'Try it' })).getByRole('status');

describe('Try it panel', () => {
  it('has an info button for every link', () => {
    renderRoute('/');
    expect(screen.getAllByRole('button', { name: /^What to expect: / })).toHaveLength(8);
  });

  it('shows signed-in and signed-out behaviour on hover', async () => {
    const user = userEvent.setup();
    renderRoute('/');

    await user.hover(screen.getByRole('button', { name: 'What to expect: Promo modal' }));

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Signed in: The Promo modal opens with code SUMMER25.');
    expect(tooltip).toHaveTextContent('Signed out: Redirected to /register, then back here with the modal open after sign-up.');
  });

  it('shows a signed-out visitor with nothing stored', () => {
    renderRoute('/');
    expect(status()).toHaveTextContent('Signed out');
    expect(status()).toHaveTextContent('No first touch stored');
  });

  it('updates the status right after an ad link is clicked', async () => {
    const user = userEvent.setup();
    renderRoute('/');

    await user.click(screen.getByRole('link', { name: 'Arrive from a Google ad' }));

    expect(status()).toHaveTextContent('First touch: google, 0 days ago');
  });

  it('shows the age after "Age first touch by 30 days"', async () => {
    const user = userEvent.setup();
    const { router } = renderRoute('/?utm_source=google');

    await user.click(screen.getByRole('button', { name: 'Age first touch by 30 days' }));
    expect(status()).toHaveTextContent('First touch: google, 30 days ago');

    await act(() => router.navigate('/?utm_source=facebook'));
    expect(status()).toHaveTextContent('First touch: facebook, 0 days ago');
  });

  it('shows the signed-in user and that registered users are no longer captured', () => {
    seedSession();
    window.localStorage.setItem('rp.attribution', JSON.stringify({ v: 1, record: null, registered: true }));
    renderRoute('/');
    expect(status()).toHaveTextContent('Signed in as Dana Levi');
    expect(status()).toHaveTextContent('Registered: attribution is no longer captured');
  });
});
