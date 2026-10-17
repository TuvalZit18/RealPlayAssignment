import { isAttributionKey } from '../attribution';
import { parseModals } from '../modals';

// Carries the destination a signed-out user wanted through registration.
// See docs/architecture/auth.md and security.md.

export const RETURN_TO_PARAM = 'returnTo';
const REGISTER_PATH = '/register';
const FALLBACK = '/';

/**
 * Accepts only same-origin paths; anything else becomes "/". Blocks open
 * redirects such as `https://evil.example`, `//evil.example` or `/\evil.example`.
 */
export function safeReturnTo(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return FALLBACK;
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return FALLBACK;
    return url.pathname + url.search + url.hash;
  } catch {
    return FALLBACK;
  }
}

interface LocationLike {
  pathname: string;
  search: string;
}

/**
 * Where to send the user after registering: the current path and query minus
 * attribution params (already stored, and ignored after registration). On
 * /register itself, only the modal params are kept and sent to "/", so the
 * user doesn't land back on the form.
 */
export function buildReturnTo({ pathname, search }: LocationLike): string {
  const params = new URLSearchParams(search);

  if (pathname === REGISTER_PATH) {
    const modalParams = new URLSearchParams();
    for (const [key, value] of params) {
      if (parseModals(new URLSearchParams([[key, value]])).length > 0) modalParams.append(key, value);
    }
    const query = modalParams.toString();
    return query ? `${FALLBACK}?${query}` : FALLBACK;
  }

  for (const key of [...params.keys()]) {
    if (isAttributionKey(key)) params.delete(key);
  }
  params.delete(RETURN_TO_PARAM);

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** `/register?returnTo=…` for the current location ("/" is left implicit). */
export function registerRedirectFor(location: LocationLike): string {
  const returnTo = buildReturnTo(location);
  return returnTo === FALLBACK
    ? REGISTER_PATH
    : `${REGISTER_PATH}?${new URLSearchParams({ [RETURN_TO_PARAM]: returnTo })}`;
}
