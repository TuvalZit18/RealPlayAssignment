import { readVersioned, removeKey, writeVersioned } from './storage';

const KEY = 'rp.test';

describe('versioned storage', () => {
  it('round-trips a record and stores the version alongside it', () => {
    writeVersioned(KEY, 1, { name: 'Dana' });
    expect(JSON.parse(window.localStorage.getItem(KEY) ?? '')).toEqual({ v: 1, name: 'Dana' });
    expect(readVersioned(KEY, 1)).toEqual({ name: 'Dana' });
  });

  it('returns null for a missing key', () => {
    expect(readVersioned(KEY, 1)).toBeNull();
  });

  it('discards an unknown or missing version', () => {
    window.localStorage.setItem(KEY, JSON.stringify({ v: 2, name: 'Dana' }));
    expect(readVersioned(KEY, 1)).toBeNull();

    window.localStorage.setItem(KEY, JSON.stringify({ name: 'Dana' }));
    expect(readVersioned(KEY, 1)).toBeNull();
  });

  it('discards JSON that fails to parse or is not an object', () => {
    window.localStorage.setItem(KEY, '{not json');
    expect(readVersioned(KEY, 1)).toBeNull();

    window.localStorage.setItem(KEY, '42');
    expect(readVersioned(KEY, 1)).toBeNull();
  });

  it('discards a value that fails the guard', () => {
    writeVersioned(KEY, 1, { name: 42 });
    const isNamed = (value: unknown): value is { name: string } =>
      typeof (value as { name?: unknown }).name === 'string';
    expect(readVersioned(KEY, 1, isNamed)).toBeNull();
  });

  it('removes a key', () => {
    writeVersioned(KEY, 1, { name: 'Dana' });
    removeKey(KEY);
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });

  it('does not throw when localStorage throws', () => {
    const fail = () => {
      throw new Error('blocked');
    };
    const spies = [
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(fail),
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(fail),
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(fail),
    ];

    expect(() => writeVersioned(KEY, 1, { name: 'Dana' })).not.toThrow();
    expect(readVersioned(KEY, 1)).toBeNull();
    expect(() => removeKey(KEY)).not.toThrow();

    spies.forEach((spy) => spy.mockRestore());
  });
});
