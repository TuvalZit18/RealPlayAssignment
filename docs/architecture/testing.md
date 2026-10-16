# Testing

Status: approved · Related: [backend.md](backend.md), [delivery.md](delivery.md)

## Approach

Risk-based: test the logic most likely to be subtly wrong, plus the main flow once end to end. The time box rules out a browser E2E suite.

| Layer | Tools | Scope |
| --- | --- | --- |
| Unit | Vitest | Pure functions and reducers |
| Integration | Vitest, React Testing Library, MSW `setupServer` | The app rendered with a memory router, real store, mocked API |
| E2E | none | Out of scope for the time box |

Tests are written after the code they cover. Each test starts from a fresh store, cleared `localStorage` and reset MSW handlers.

## Unit cases

**Attribution reducer (`attributionCaptured`, `attributionCleared`)**

- No stored record → saves params and `firstTouchAt`.
- Record 5 days old + new params → unchanged.
- Record exactly 30 days old + new params → replaced, clock reset.
- Record 31 days old + new params → replaced, clock reset.
- `registered: true` + new params → unchanged.
- `attributionCleared` → `record: null`, `registered: true`.

**`extractAttributionParams`**

- Keeps `utm_*`, `ref`, `gclid`, `fbclid`; drops other keys.
- Trims values, drops empty ones, truncates to 256 chars, keeps at most 20 keys.

**`parseModals`**

- Returns modals in URL order.
- Ignores invalid values (`welcome=2`, empty `promo`, bad characters).
- Ignores non-modal params.

**`safeReturnTo`**

- Accepts `/`, `/?promo=X`, `/account`.
- Rejects `https://evil.example`, `//evil.example`, `/\evil.example`, `javascript:…`, and missing input; all return `/`.

**Storage**

- Unknown `v` or invalid JSON reads as empty.
- A throwing `localStorage` doesn't crash reads or writes.

## Integration cases

1. **Signed-out redirect keeps the destination and attribution.** Start at `/?promo=SUMMER25&utm_source=google`. Expect the register page, `returnTo=/?promo=SUMMER25`, and the stored attribution record.
2. **Registration sends attribution and returns.** From case 1, submit the form. Expect the request body to include `attribution.utm_source = "google"`, a success toast, attribution cleared, and the promo modal visible on `/`.

## Manual checks before submitting

- Back/forward reopens and closes modals.
- Closing one of two stacked modals leaves the other open.
- Registering in one tab signs in a second open tab.
- `fail@example.com` shows an error and keeps attribution.
