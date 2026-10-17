# RealPlay Assignment — Registration with Attribution + Redirect

A React app that captures marketing attribution on a visitor's first visit, keeps it through the registration flow, and sends it with a successful sign-up. Modals open from the URL, signed-out visitors are redirected to registration and returned to where they were going.

The task description is in [docs/Home Task - FE.docx](docs/Home%20Task%20-%20FE.docx).

## Quick start

Requires Node 24 (see `.nvmrc`).

```bash
npm ci          # install exact dependency versions
npm run dev     # start the app at http://localhost:5173
npm test        # run the test suite once (124 tests)
```

There is no backend: the API is mocked in the browser with [MSW](https://mswjs.io/), so `npm run dev` is all you need.

## Try it

The home page has a **Try it** panel with a link for every requirement. Each link works in the app, and its ↗ icon opens it in a new tab (a cold load, like arriving from an ad).

A full run through the flow:

1. Click **Arrive from a Google ad**. The `utm_*` and `gclid` params are stored as the first touch (DevTools → Application → Local Storage → `rp.attribution`).
2. Click **Arrive from a Facebook ad**. Nothing changes: the first touch is kept for 30 days.
3. Click **Promo modal**. You're signed out, so you land on `/register?returnTo=/?promo=SUMMER25`.
4. Register. DevTools → Network shows `POST /api/register` with the stored attribution in the body. You get a welcome toast, the attribution is cleared, and you're back on `/?promo=SUMMER25` with the promo modal open.
5. Try **Two modals stacked**, close the top one, then press Back.

Useful extras:

- Register with **`fail@example.com`** to see the error path (attribution is kept for the next attempt).
- **Sign out** from the user menu in the header, or **Reset demo** in the Try it panel to become a brand-new visitor again.
- The theme toggle in the header switches between dark (default) and light.

## How each requirement is met

| Requirement | Implementation | Details |
| --- | --- | --- |
| `/`, `/register`, `/account` (protected) | React Router 7 data router; `<ProtectedRoute>` around `/account` | [routing-and-modals.md](docs/architecture/routing-and-modals.md) |
| `?welcome`, `?promo`, `?invite`, `?signup` open modals on cold load, back/forward and in-app navigation | The URL is the only source of truth: `parseModals` derives the stack from the query string; `openModal` / `closeModal` only change the URL | [routing-and-modals.md](docs/architecture/routing-and-modals.md) |
| Closing a modal removes only its own param | `closeModal(type)` deletes that one param and keeps everything else | [routing-and-modals.md](docs/architecture/routing-and-modals.md) |
| One global modal renderer, modals only for signed-in users | `<ModalRenderer/>` in `AppLayout`, mounted only when signed in | [auth.md](docs/architecture/auth.md) |
| Signed-out users redirected to `/register` | Modal gate in `AppLayout`; redirect carries `returnTo` (validated against open redirects) so the user returns after sign-up | [auth.md](docs/architecture/auth.md), [security.md](docs/architecture/security.md) |
| Capture `utm_*`, `ref`, `gclid`, `fbclid` on first visit and persist | Captured **outside React**, at bootstrap and on every navigation, so no redirect can drop them; stored in `localStorage` | [attribution.md](docs/architecture/attribution.md) |
| Keep first touch for 30 days; overwrite and reset after | Pure Redux reducer with the five rules; the time is passed in, so every rule is unit-tested | [attribution.md](docs/architecture/attribution.md) |
| Form wired to a React Query mutation against a mocked endpoint | `useRegister` (`useMutation`) → `POST /api/register` mocked by MSW | [api.md](docs/architecture/api.md), [backend.md](docs/architecture/backend.md) |
| On success: toast, attribution in the payload, then clear | `useRegister` starts the session, clears attribution, shows the toast, returns to `returnTo` | [frontend.md](docs/architecture/frontend.md) |

## Stack

React 18 · TypeScript (strict) · Vite · MUI · Redux Toolkit (client state: attribution, session) · React Query (server state: the register mutation) · React Router 7 · MSW · Vitest + React Testing Library · ESLint · GitHub Actions.

## Project structure

```
src/
  app/          bootstrap, store, router, layout, header, theme
  features/
    attribution/    capture, first-touch rules, persistence
    auth/           session, gates, returnTo
    modals/         URL-driven modal stack
    registration/   form, useRegister, API call
  pages/        Home, Register, Account, Not found
  shared/       storage, API client, UI building blocks
  mocks/        MSW handlers (browser and tests)
```

Full layout and state ownership: [frontend.md](docs/architecture/frontend.md).

## Tests

124 tests across 18 files. Unit tests cover the attribution rules, param extraction, modal parsing, `returnTo` safety and storage. Integration tests render the whole app with the real store and the MSW mock and walk the full flow: redirect, register, attribution sent and cleared, return to the promo modal. CI runs typecheck, lint, tests and build on every pull request that touches code. See [testing.md](docs/architecture/testing.md).

## How I worked

Before writing code, I chose the architecture by running my own **architecture-advisor** Claude Code skill: context questions first, then every decision cluster by cluster, with real alternatives and my approval or override for each. I agreed the design the same way, planned the git workflow (a branch and pull request per change, `main` protected by a hook), and then built the app in nine reviewed stages. Decisions that came up while building were stopped and decided, not worked around.

- The full record of every question and answer: [architecture-decisions.md](docs/architecture/architecture-decisions.md)
- The docs that served as the source of truth while building: [docs/architecture/](docs/architecture/README.md)

## Known limits

Accepted for a take-home with a mocked backend:

- The session token lives in `localStorage`; in production it would be an httpOnly cookie set by the server.
- "Signed in" is enforced only on the client.
- The mock "database" of registered emails resets on page reload.
- A toast shown while a modal is open is visible but not announced by screen readers (MUI hides content behind a modal).

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Vite dev server (with the MSW mock) |
| `npm run build` | Type-check and production build |
| `npm run preview` | Serve the production build locally (with the MSW mock) |
| `npm run typecheck` | TypeScript check, no output |
| `npm run lint` | ESLint |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest, watch mode |
