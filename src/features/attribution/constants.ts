// See docs/architecture/attribution.md and security.md.

export const UTM_PREFIX = 'utm_';
export const EXACT_KEYS: ReadonlySet<string> = new Set(['ref', 'gclid', 'fbclid']);

export const MAX_VALUE_LENGTH = 256;
export const MAX_KEYS = 20;

export const FIRST_TOUCH_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export const STORAGE_KEY = 'rp.attribution';
export const STORAGE_VERSION = 1;
