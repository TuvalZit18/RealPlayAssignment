# Auth

Status: approved · Related: [routing-and-modals.md](routing-and-modals.md), [security.md](security.md), [data-storage.md](data-storage.md)

## Authentication (mocked)

There is no real backend and no login. A user becomes "signed in" by registering.

- `POST /api/register` returns `{ user, token }` (see [api.md](api.md)).
- `useRegister` dispatches `sessionStarted({ user, token })`.
- The listener middleware persists the session to `localStorage`, so it survives reloads.
- Other tabs pick it up through the `storage` event (see [data-storage.md](data-storage.md)).

```ts
interface Session {
  user: { id: string; name: string; email: string };
  token: string; // opaque mock token, never decoded
}

interface AuthState {
  session: Session | null;
}

const selectIsAuthenticated = (s: RootState) => s.auth.session !== null;
```

| Action | Effect |
| --- | --- |
| `sessionStarted` | Sets the session |
| `sessionEnded` | Sign out: clears the session only (attribution's `registered` flag stays) |
| `sessionHydrated` | Replaces the session with what another tab wrote |

Stored under `rp.session` as `{ v: 1, session }`; a session with a missing token or an empty user field is discarded.

## Authorization

Binary: signed in or not. There are no roles. The only rules are:

- Modals render only for signed-in users.
- `/account` is for signed-in users only.

## Enforcement: two central gates

All checks go through `selectIsAuthenticated`. No page or modal component checks auth on its own.

| Gate | Where | Condition | Action |
| --- | --- | --- | --- |
| Modal gate | `AppLayout` (`useModalGateRedirect`), wraps every route | Signed out and the URL has at least one valid modal param | Renders `<Navigate>` to `/register?returnTo=…` instead of the page, so the page never flashes |
| `<ProtectedRoute>` | Layout route around `/account` | Signed out | Redirect to `/register?returnTo=…` |

Both redirects use `replace`, so Back does not bounce the user into the redirect again. `AppLayout` also mounts `<ModalRenderer/>` only for signed-in users (it isn't imported by `features/auth`, which avoids a circular import).

Attribution is captured before either gate can run (see [attribution.md](attribution.md)), so a redirect never loses campaign params.

## Redirect with `returnTo`

The destination the user wanted is carried through registration in the URL.

1. Signed out user opens `/?promo=SUMMER25&utm_source=google`.
2. Attribution is captured.
3. The gate builds `returnTo` from the current path and query, **minus attribution params** (already stored, and they would be ignored after registration anyway): `/?promo=SUMMER25`.
4. Redirect to `/register?returnTo=%2F%3Fpromo%3DSUMMER25`.
5. After successful registration: `navigate(returnTo, { replace: true })`. The user is now signed in, so the promo modal opens.

Rules:

- `returnTo` is validated before use: it must be a same-origin path. Anything else becomes `/`. See [security.md](security.md).
- Missing `returnTo` means `/`, so a redirect whose destination is `/` leaves the param out.
- Any existing `returnTo` param is dropped when building a new one.
- If the user is already on `/register` with modal params, `returnTo` is `/` plus those modal params, so the user doesn't loop back to the form.

Helpers live in `features/auth/returnTo.ts`: `safeReturnTo`, `buildReturnTo`, `registerRedirectFor`.

## Header and signing out

- **Signed out:** the header shows "Sign up".
- **Signed in:** the header shows the user's initial and name; its menu has "Account" and "Sign out". On phones, "Sign out (name)" is in the main menu.
- **Sign out** first navigates to `/`, waits for the navigation to finish, then ends the session. Ending it while still on `/account` would make `<ProtectedRoute>` redirect to `/register` instead.
- `/register` for a signed-in user shows "You're already registered" with links to the account and home.

## Reset demo (reviewer helper)

The "Try it" panel on the home page has a **Reset demo** button (`app/useResetDemo.ts`). It removes `rp.session` and `rp.attribution` (keeping `rp.theme`), resets both slices and goes to `/`. The visitor is brand new again, so first-touch capture and the signed-out redirects can be re-tested. Other tabs follow through the `storage` event.

## Alternatives considered

- **Mock JWT plus `GET /me`:** closer to production, but adds an endpoint and a loading state the task doesn't need.
- **httpOnly cookie:** the production best practice, but a service worker can't really create one.
- **Checks inside each component:** repetitive, and the modals and the redirect could disagree.
- **React Router loaders for redirects:** split auth logic between loaders and components.
- **`returnTo` in `sessionStorage`:** a cleaner URL, but hidden state that is lost in a new tab.

## Decision: Sign out and Reset demo

The task has no sign-out. Without one, a reviewer who registers once can't see the signed-out redirect again, and the `registered` flag stops attribution capture. Decided in Stage 7: add both **Sign out** (header) and **Reset demo** (Try it panel). Alternative considered: neither, and clear storage in DevTools.
