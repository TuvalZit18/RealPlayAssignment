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

These render the whole app with `renderRoute(url)` (wired exactly like `main.tsx`) and talk to the MSW mock. The two cases planned originally are the first two rows; the rest were added as each stage was built.

| Area | File | Covers |
| --- | --- | --- |
| Redirect | `features/auth/authGates.test.tsx` | Signed-out modal link goes to `/register?returnTo=…`, attribution kept, no modal shown, `replace` used; `/account` protected; invalid modal param doesn't redirect |
| Registration | `features/registration/registration.test.tsx` | Body includes attribution; session started; attribution cleared; toast; back at `/?promo=SUMMER25` with the promo modal open. Also: no attribution stored, unsafe `returnTo`, failure keeps attribution and isn't retried, 409, client validation |
| Modals | `features/modals/ModalRenderer.test.tsx` | Cold load, any page, invalid values, stacking order, closing one of several, Back/Forward, in-app links |
| Attribution | `features/attribution/captureAttribution.test.tsx` | Capture from the landing URL, on in-app navigation, first touch kept, persisted |
| Auth | `features/auth/authGates.test.tsx` | Header user menu, sign out (and that `registered` survives it), reset demo |
| Store | `app/store.test.ts` | Persistence for both slices, no write when nothing changed, cross-tab sync |
| Theme | `app/theme/ThemeModeProvider.test.tsx` | Dark by default, toggle, remembered, invalid value |
| Pages | `app/router.test.tsx` | Every route, header, Try it links, register form and "already registered" |
| Mock API | `mocks/handlers.test.ts` | 201, 400 with fields, 409, 500 |

Total: 124 tests in 18 files, all run in CI.

## Manual checks before submitting

Things jsdom can't show, to check in a real browser with `npm run dev`:

- The service worker intercepts `POST /api/register` (visible in DevTools → Network, with the attribution in the body).
- Back/forward reopens and closes modals.
- Closing one of two stacked modals leaves the other open.
- Registering in one tab signs in a second open tab.
- `fail@example.com` shows an error and keeps attribution.
- Dark/light toggle looks right in both modes and is remembered after a reload.
- At phone width (under 600px): header menu, stacked register page, full-screen modals.
