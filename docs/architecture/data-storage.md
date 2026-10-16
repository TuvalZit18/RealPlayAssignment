# Data storage

Status: approved · Related: [attribution.md](attribution.md), [auth.md](auth.md), [security.md](security.md)

All persisted data lives in the browser's `localStorage`. It survives reloads and the 30-day attribution window, and it is shared across tabs of the same origin.

## Keys and shapes

| Key | Written by | Value |
| --- | --- | --- |
| `rp.attribution` | Listener middleware on attribution actions | `{ "v": 1, "record": { "params": {…}, "firstTouchAt": 1792100000000 } \| null, "registered": false }` |
| `rp.session` | Listener middleware on auth actions | `{ "v": 1, "session": { "user": {…}, "token": "…" } \| null }` |

The `rp.` prefix avoids clashes with anything else on the origin.

## Access rules

- Only `shared/storage` touches `localStorage`. Slices and components never call it directly.
- Every read and write is wrapped in `try/catch`. Storage can throw (private mode, quota, disabled site data). A failed read returns `null`; a failed write is ignored and the app keeps working in memory.
- **Versioning:** each record carries `v`. On read, a missing or unknown `v`, or JSON that fails to parse, is discarded and treated as empty. If the shape changes later, bump `v`; old data is dropped instead of crashing the app.

## Write path

Slices stay pure. A listener middleware in `app/store.ts` watches the persisting actions and writes the new slice state:

| Actions | Writes |
| --- | --- |
| `attributionCaptured`, `attributionCleared` | `rp.attribution` |
| `sessionStarted` | `rp.session` |

`*Hydrated` actions never trigger a write, which prevents an echo loop between tabs.

## Read path

- **Startup:** each slice's initial state comes from `shared/storage` (falls back to the empty state).
- **Other tabs:** `app/store.ts` listens to `window`'s `storage` event. When `rp.attribution` or `rp.session` changes, it re-reads that key and dispatches `attributionHydrated` or `sessionHydrated`.

So registering in one tab signs in every open tab, and their modals appear without a reload.

## Alternatives considered

- **Cookie:** what real attribution setups use, because a server can read it. There is no server here, and cookies have no change event across tabs.
- **`sessionStorage` / memory only:** lost when the tab closes, which breaks the 30-day rule and the session surviving a reload.
