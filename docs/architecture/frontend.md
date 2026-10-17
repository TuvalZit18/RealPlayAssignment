# Frontend

Status: approved · Related: [routing-and-modals.md](routing-and-modals.md), [attribution.md](attribution.md), [auth.md](auth.md)

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | React 18 + TypeScript (strict) | Required by the task |
| Build | Vite | Required by the task; static SPA, no server rendering needed |
| Rendering | Client-side only | No SEO need; everything after the home page is behind sign-up |
| UI | MUI, `@mui/icons-material`, Inter | `Dialog`, `Snackbar`, `TextField` cover modals, toast and form out of the box. Design in [ui.md](ui.md) |
| Routing | React Router 7, data router (`createBrowserRouter`) | `router.subscribe()` is needed for attribution capture outside React. Pinned to v7 because v8 requires React 19 |
| Client state | Redux Toolkit | Holds `auth` and `attribution`; chosen to show RTK patterns (slices, listener middleware) |
| Server state | React Query | Required by the task; owns the register mutation only |
| Mock API | MSW | See [backend.md](backend.md) |

## Who owns which state

Each piece of state has exactly one owner. Nothing is mirrored between owners.

| State | Owner | Notes |
| --- | --- | --- |
| Which modals are open | URL query string | Never copied into Redux or React state. See [routing-and-modals.md](routing-and-modals.md) |
| Session (user, token) | Redux `auth` slice | Persisted to `localStorage` by listener middleware |
| Attribution record, registered flag | Redux `attribution` slice | Persisted to `localStorage` by listener middleware |
| Register request status, error | React Query `useMutation` | Not stored in Redux |
| Form field values | Local component state | |

## Folder structure

Organised by feature. A feature exposes its public API through `index.ts`; other code imports from there, not from files inside the feature.

```
src/
  app/
    main.tsx              Bootstrap (see below)
    store.ts              configureStore, listener middleware, cross-tab sync
    hooks.ts              Typed useAppDispatch / useAppSelector
    router.tsx            createBrowserRouter, route tree
    providers.tsx         Redux, React Query, MUI theme, toast
    AppLayout.tsx         Header/nav, <Outlet/>, modal gate, <ModalRenderer/>
    ThemeToggle.tsx       Dark/light switch in the header
    theme/                createAppTheme, ThemeModeProvider, useThemeMode
  features/
    attribution/          Slice, capture function, constants, selectors
    auth/                 Slice, selectors, <ProtectedRoute>, returnTo helpers
    modals/               Modal registry, URL parsing, useModalStack, <ModalRenderer/>, modal components
    registration/         <RegisterForm>, useRegister, register API call
  pages/
    HomePage.tsx
    RegisterPage.tsx
    AccountPage.tsx
    NotFoundPage.tsx
  shared/
    api/                  fetch wrapper, ApiError
    storage/              Versioned, failure-safe localStorage read/write
    ui/                   Logo, ModalFrame, brand colour
  mocks/
    handlers.ts           MSW handlers (shared by browser and tests)
    browser.ts            setupWorker for dev
    server.ts             setupServer for Vitest
  test/
    setup.ts
```

Pages compose features and hold no business logic.

## Bootstrap order (`main.tsx`)

The order matters. Attribution must be captured before any component can redirect.

1. Start the MSW worker and wait for it.
2. Create the store. Slices initialise from `localStorage` (see [data-storage.md](data-storage.md)).
3. Capture attribution from `window.location.search` (dispatch).
4. Create the router and subscribe: every navigation dispatches a capture for the new location.
5. Render `<App/>`.

`router.subscribe()` does not fire for the initial location, which is why step 3 exists.

## Registration flow (`useRegister`)

`features/registration/useRegister.ts` wraps `useMutation`. The form component only collects input and calls `register(values)`.

- **Request:** builds the body from form values plus the current attribution record (see [api.md](api.md)).
- **On success, in this order:**
  1. `sessionStarted({ user, token })`
  2. `attributionCleared()` (sets the registered flag)
  3. Show the success toast
  4. `navigate(returnTo, { replace: true })`, where `returnTo` is validated (see [auth.md](auth.md))
- **On error:** no retry. Attribution is kept. The form shows the error message.

## Alternatives considered

- **React Context for auth** instead of Redux: less code; rejected in favour of RTK to demonstrate slices and listener middleware.
- **Mirroring modals in Redux:** rejected; two sources of truth break back/forward.
- **Flat `components/ hooks/ pages/` structure:** quicker to start, but mixes attribution, modal and auth logic.
- **Tailwind:** would need extra libraries for accessible dialogs and toasts.

## Open questions

- Toast implementation: MUI `Snackbar` behind a small helper, or `notistack`.
