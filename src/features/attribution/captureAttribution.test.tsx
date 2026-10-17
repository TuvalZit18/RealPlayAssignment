import { act } from '@testing-library/react';
import { renderRoute } from '../../test/renderRoute';

describe('attribution capture in the app', () => {
  it('captures from the landing URL before anything renders', () => {
    const { store } = renderRoute('/?utm_source=google&gclid=G1&promo=SUMMER25');
    expect(store.getState().attribution.record?.params).toEqual({ utm_source: 'google', gclid: 'G1' });
  });

  it('captures on in-app navigation', async () => {
    const { store, router } = renderRoute('/');
    expect(store.getState().attribution.record).toBeNull();

    await act(() => router.navigate('/register?ref=newsletter'));

    expect(store.getState().attribution.record?.params).toEqual({ ref: 'newsletter' });
  });

  it('keeps the first touch when a second campaign arrives within 30 days', async () => {
    const { store, router } = renderRoute('/?utm_source=google');

    await act(() => router.navigate('/?utm_source=facebook&fbclid=F1'));

    expect(store.getState().attribution.record?.params).toEqual({ utm_source: 'google' });
  });

  it('persists the capture to localStorage', () => {
    renderRoute('/?utm_campaign=fall_launch');
    const stored = JSON.parse(window.localStorage.getItem('rp.attribution') ?? 'null');
    expect(stored.record.params).toEqual({ utm_campaign: 'fall_launch' });
  });
});
