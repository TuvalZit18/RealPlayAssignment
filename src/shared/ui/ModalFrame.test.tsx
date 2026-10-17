import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalFrame } from './ModalFrame';

describe('ModalFrame', () => {
  it('renders an accessible dialog with title and body', () => {
    render(
      <ModalFrame open title="Promo" onClose={() => {}}>
        Your code SUMMER25 is ready.
      </ModalFrame>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Promo' });
    expect(dialog).toHaveTextContent('Your code SUMMER25 is ready.');
  });

  it('calls onClose from the close button and the default action', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ModalFrame open title="Welcome" onClose={onClose}>
        Hi
      </ModalFrame>,
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('runs a custom action instead of closing', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onAction = vi.fn();
    render(
      <ModalFrame open title="Invite" onClose={onClose} actionLabel="Accept" onAction={onAction}>
        Hi
      </ModalFrame>,
    );

    await user.click(screen.getByRole('button', { name: 'Accept' }));
    expect(onAction).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();
  });
});
