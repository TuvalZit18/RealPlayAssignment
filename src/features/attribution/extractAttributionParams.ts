import { EXACT_KEYS, MAX_KEYS, MAX_VALUE_LENGTH, UTM_PREFIX } from './constants';
import type { AttributionParams } from './types';

function isAttributionKey(key: string): boolean {
  return EXACT_KEYS.has(key) || (key.startsWith(UTM_PREFIX) && key.length > UTM_PREFIX.length);
}

// Pulls allowlisted campaign params out of a query string. Values are trimmed,
// empty ones dropped, long ones truncated; the first occurrence of a key wins
// and at most MAX_KEYS keys are kept.
export function extractAttributionParams(search: string | URLSearchParams): AttributionParams {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search;
  const result: AttributionParams = {};
  let count = 0;

  for (const [key, rawValue] of params) {
    if (count >= MAX_KEYS) break;
    if (!isAttributionKey(key) || key in result) continue;

    const value = rawValue.trim().slice(0, MAX_VALUE_LENGTH);
    if (!value) continue;

    result[key] = value;
    count += 1;
  }

  return result;
}
