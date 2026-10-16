# Security

Status: approved · Related: [auth.md](auth.md), [attribution.md](attribution.md), [routing-and-modals.md](routing-and-modals.md)

The app has no real backend and stores nothing sensitive, so most security categories don't apply. These are the parts that do.

## Validated inputs

Everything that comes from the URL or the user is untrusted.

| Input | Rule | On failure |
| --- | --- | --- |
| `returnTo` | Must start with `/`, must not start with `//` or `/\`, and `new URL(returnTo, location.origin).origin` must equal `location.origin` | Use `/` |
| Attribution keys | Only `utm_*`, `ref`, `gclid`, `fbclid` | Key ignored |
| Attribution values | Trimmed, non-empty, at most 256 chars; at most 20 keys kept | Dropped or truncated |
| Modal params | Per-type pattern (see [routing-and-modals.md](routing-and-modals.md)) | Modal not opened |
| Form `name`, `email` | Required; email format; name 1–100 chars | Inline field error, no request sent |

### Why `returnTo` matters

Without the check, a crafted link such as `/register?returnTo=https://evil.example` would send a freshly registered user to an attacker's page. That is an open redirect. The validator lives in `features/auth` and is unit-tested.

## Rendering

All URL-derived values (promo code, friend ID) are rendered through React, which escapes them. No `dangerouslySetInnerHTML`.

## Known limits (accepted for a demo)

- The session token is in `localStorage`, so any script running on the page could read it. In production the session would be an httpOnly cookie set by the server.
- The token is an opaque mock value and is never verified.
- Being "signed in" is purely client-side; there is no server enforcement.

These are good discussion points for how the design would change with a real backend.
