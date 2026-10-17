import { MAX_KEYS, MAX_VALUE_LENGTH } from './constants';
import { extractAttributionParams } from './extractAttributionParams';

describe('extractAttributionParams', () => {
  it('keeps utm_*, ref, gclid and fbclid and drops everything else', () => {
    const params = extractAttributionParams(
      '?utm_source=google&utm_medium=cpc&utm_custom=x&ref=partner&gclid=G1&fbclid=F1&promo=SUMMER25&welcome=1&other=y',
    );
    expect(params).toEqual({
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_custom: 'x',
      ref: 'partner',
      gclid: 'G1',
      fbclid: 'F1',
    });
  });

  it('ignores a bare "utm_" key', () => {
    expect(extractAttributionParams('?utm_=x')).toEqual({});
  });

  it('trims values and drops empty ones', () => {
    expect(extractAttributionParams('?utm_source=%20google%20&ref=&gclid=%20%20')).toEqual({ utm_source: 'google' });
  });

  it(`truncates values to ${MAX_VALUE_LENGTH} characters`, () => {
    const params = extractAttributionParams(`?utm_campaign=${'a'.repeat(MAX_VALUE_LENGTH + 50)}`);
    expect(params.utm_campaign).toHaveLength(MAX_VALUE_LENGTH);
  });

  it(`keeps at most ${MAX_KEYS} keys`, () => {
    const search = Array.from({ length: MAX_KEYS + 5 }, (_, i) => `utm_k${i}=v`).join('&');
    expect(Object.keys(extractAttributionParams(search))).toHaveLength(MAX_KEYS);
  });

  it('keeps the first occurrence of a repeated key', () => {
    expect(extractAttributionParams('?utm_source=first&utm_source=second')).toEqual({ utm_source: 'first' });
  });

  it('accepts URLSearchParams', () => {
    expect(extractAttributionParams(new URLSearchParams({ gclid: 'G1' }))).toEqual({ gclid: 'G1' });
  });
});
