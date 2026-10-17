import { hasModalParams, parseModals } from './parseModals';

const parse = (search: string) => parseModals(new URLSearchParams(search));

describe('parseModals', () => {
  it('maps each param to its modal', () => {
    expect(parse('?welcome=1')).toEqual([{ type: 'welcome', params: {} }]);
    expect(parse('?promo=SUMMER25')).toEqual([{ type: 'promo', params: { code: 'SUMMER25' } }]);
    expect(parse('?invite=friend_42')).toEqual([{ type: 'invite', params: { friendId: 'friend_42' } }]);
    expect(parse('?signup=1')).toEqual([{ type: 'signup', params: {} }]);
  });

  it('returns modals in URL order', () => {
    expect(parse('?promo=X&welcome=1').map((m) => m.type)).toEqual(['promo', 'welcome']);
    expect(parse('?welcome=1&promo=X').map((m) => m.type)).toEqual(['welcome', 'promo']);
  });

  it.each([
    ['welcome=2', '?welcome=2'],
    ['signup=true', '?signup=true'],
    ['empty promo', '?promo='],
    ['promo with spaces', '?promo=SUMMER%2025'],
    ['promo longer than 32 chars', `?promo=${'A'.repeat(33)}`],
    ['invite with symbols', '?invite=<script>'],
  ])('ignores an invalid value: %s', (_label, search) => {
    expect(parse(search)).toEqual([]);
  });

  it('ignores non-modal params', () => {
    expect(parse('?utm_source=google&gclid=G1&foo=bar')).toEqual([]);
  });

  it('uses the first occurrence of a repeated param', () => {
    expect(parse('?promo=FIRST&promo=SECOND')).toEqual([{ type: 'promo', params: { code: 'FIRST' } }]);
  });

  it('reports whether any valid modal param is present', () => {
    expect(hasModalParams(new URLSearchParams('?promo=X'))).toBe(true);
    expect(hasModalParams(new URLSearchParams('?promo=&utm_source=g'))).toBe(false);
  });
});
