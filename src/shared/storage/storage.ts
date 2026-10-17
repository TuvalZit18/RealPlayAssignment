// The only module that touches localStorage. See docs/architecture/data-storage.md.
//
// Records are stored as `{ v, ...value }`. A missing or unknown `v`, JSON that
// fails to parse, or a value that fails the optional guard reads as `null`.
// Storage can throw (private mode, quota, blocked site data); every access is
// wrapped so the app keeps working in memory.

type Guard<T> = (value: unknown) => value is T;

function getStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readVersioned<T extends object>(
  key: string,
  version: number,
  isValid?: Guard<T>,
): T | null {
  try {
    const raw = getStorage()?.getItem(key);
    if (raw == null) return null;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || !('v' in parsed) || parsed.v !== version) {
      return null;
    }

    const value: Record<string, unknown> = { ...parsed };
    delete value.v;
    if (isValid && !isValid(value)) return null;
    return value as T;
  } catch {
    return null;
  }
}

export function writeVersioned<T extends object>(key: string, version: number, value: T): void {
  try {
    getStorage()?.setItem(key, JSON.stringify({ v: version, ...value }));
  } catch {
    // Ignored: the app keeps working with in-memory state.
  }
}

export function removeKey(key: string): void {
  try {
    getStorage()?.removeItem(key);
  } catch {
    // Ignored, as above.
  }
}
