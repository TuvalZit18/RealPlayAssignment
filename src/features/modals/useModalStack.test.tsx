import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { useModalStack } from './useModalStack';

function setup(initialUrl: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialUrl]}>{children}</MemoryRouter>
  );
  return renderHook(() => ({ stack: useModalStack(), location: useLocation() }), { wrapper });
}

const url = (location: { pathname: string; search: string }) => location.pathname + location.search;

describe('useModalStack', () => {
  it('openModal appends the param and keeps the path and other params', () => {
    const { result } = setup('/account?utm_source=google');

    act(() => result.current.stack.openModal({ type: 'promo', params: { code: 'SUMMER25' } }));

    expect(url(result.current.location)).toBe('/account?utm_source=google&promo=SUMMER25');
    expect(result.current.stack.modals).toEqual([{ type: 'promo', params: { code: 'SUMMER25' } }]);
  });

  it('openModal for a modal without params', () => {
    const { result } = setup('/');
    act(() => result.current.stack.openModal({ type: 'welcome' }));
    expect(result.current.location.search).toBe('?welcome=1');
  });

  it('opening an already open modal updates it in place', () => {
    const { result } = setup('/?promo=OLD&welcome=1');
    act(() => result.current.stack.openModal({ type: 'promo', params: { code: 'NEW' } }));
    expect(result.current.location.search).toBe('?promo=NEW&welcome=1');
  });

  it('closeModal removes only its own param', () => {
    const { result } = setup('/?welcome=1&promo=SUMMER25&utm_source=google');

    act(() => result.current.stack.closeModal('welcome'));

    expect(result.current.location.search).toBe('?promo=SUMMER25&utm_source=google');
    expect(result.current.stack.modals.map((m) => m.type)).toEqual(['promo']);
  });

  it('pushes history entries', () => {
    const { result } = setup('/');
    const before = result.current.location.key;

    act(() => result.current.stack.openModal({ type: 'welcome' }));

    expect(result.current.location.key).not.toBe(before);
  });
});
