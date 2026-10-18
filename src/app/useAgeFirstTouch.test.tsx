import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FIRST_TOUCH_WINDOW_MS } from '../features/attribution';
import { renderRoute } from '../test/renderRoute';

const ageButton = () => screen.getByRole('button', { name: 'Age first touch by 30 days' });

describe('Age first touch (reviewer helper)', () => {
  it('is disabled when no first touch is stored', () => {
    renderRoute('/');
    expect(ageButton()).toBeDisabled();
  });

  it('lets a later ad replace the first touch, as if 30 days had passed', async () => {
    const user = userEvent.setup();
    const { router, store } = renderRoute('/?utm_source=google&gclid=G1');
    const firstTouchAt = store.getState().attribution.record?.firstTouchAt ?? 0;

    // Within 30 days, a second ad is ignored.
    await act(() => router.navigate('/?utm_source=facebook&fbclid=F1'));
    expect(store.getState().attribution.record?.params).toEqual({ utm_source: 'google', gclid: 'G1' });

    await user.click(ageButton());

    const aged = store.getState().attribution.record;
    expect(aged?.firstTouchAt).toBe(firstTouchAt - FIRST_TOUCH_WINDOW_MS);
    expect(JSON.parse(window.localStorage.getItem('rp.attribution') ?? '').record.firstTouchAt).toBe(
      aged?.firstTouchAt,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('First touch moved 30 days into the past');

    // Now the next ad replaces it and the clock resets.
    await act(() => router.navigate('/?utm_source=newsletter'));
    const replaced = store.getState().attribution.record;
    expect(replaced?.params).toEqual({ utm_source: 'newsletter' });
    expect(replaced?.firstTouchAt).toBeGreaterThan(firstTouchAt - FIRST_TOUCH_WINDOW_MS);
  });
});
