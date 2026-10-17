import { buildReturnTo, registerRedirectFor, safeReturnTo } from './returnTo';

describe('safeReturnTo', () => {
  it.each(['/', '/?promo=X', '/account', '/account?invite=friend_42#top'])('accepts %s', (path) => {
    expect(safeReturnTo(path)).toBe(path);
  });

  it.each([
    ['an absolute URL', 'https://evil.example'],
    ['a protocol-relative URL', '//evil.example'],
    ['a backslash trick', '/\\evil.example'],
    ['a javascript: URL', 'javascript:alert(1)'],
    ['a relative path', 'account'],
    ['an empty string', ''],
    ['null', null],
    ['undefined', undefined],
  ])('rejects %s', (_label, value) => {
    expect(safeReturnTo(value)).toBe('/');
  });
});

describe('buildReturnTo', () => {
  it('keeps the path and modal params', () => {
    expect(buildReturnTo({ pathname: '/', search: '?promo=SUMMER25' })).toBe('/?promo=SUMMER25');
    expect(buildReturnTo({ pathname: '/account', search: '' })).toBe('/account');
  });

  it('strips attribution params, including empty ones', () => {
    expect(
      buildReturnTo({ pathname: '/', search: '?promo=X&utm_source=google&gclid=G1&ref=&fbclid=F1&other=1' }),
    ).toBe('/?promo=X&other=1');
  });

  it('on /register, keeps only modal params and targets "/"', () => {
    expect(buildReturnTo({ pathname: '/register', search: '?promo=X&utm_source=g&returnTo=%2Faccount' })).toBe(
      '/?promo=X',
    );
    expect(buildReturnTo({ pathname: '/register', search: '' })).toBe('/');
  });
});

describe('registerRedirectFor', () => {
  it('encodes returnTo', () => {
    expect(registerRedirectFor({ pathname: '/', search: '?promo=SUMMER25' })).toBe(
      '/register?returnTo=%2F%3Fpromo%3DSUMMER25',
    );
  });

  it('leaves "/" implicit', () => {
    expect(registerRedirectFor({ pathname: '/', search: '?utm_source=google' })).toBe('/register');
  });
});
