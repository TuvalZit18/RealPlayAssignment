# Routing and modals

Status: approved · Related: [auth.md](auth.md), [frontend.md](frontend.md)

## Routes

| Path | Page | Access |
| --- | --- | --- |
| `/` | Home | Public |
| `/register` | Registration form | Public. A signed-in visitor sees "You're already registered" and links onward |
| `/account` | Account | Signed in only, via `<ProtectedRoute>` |
| `*` | Not found | Public |

All routes render inside `AppLayout`, which hosts the header, the modal gate and the single `<ModalRenderer/>`.

## Core rule: the URL decides which modals are open

The query string is the only source of truth for modals. Nothing else (Redux, React state, refs) records whether a modal is open.

- Opening a modal adds its param to the URL. The modal appears because the param is present.
- Closing a modal removes its param. The modal disappears because the param is gone.

This makes all required entry points work without special cases:

| Entry point | Why it works |
| --- | --- |
| Cold load (link, refresh, typed URL) | The renderer reads the URL on first render |
| In-app navigation | The URL changes, so the renderer re-derives the stack |
| Back / forward | The browser restores the URL, so the stack is restored |

## Modal registry

| Type | Param | Valid value | `params` passed to the modal |
| --- | --- | --- | --- |
| `welcome` | `welcome` | exactly `1` | none |
| `promo` | `promo` | 1–32 chars, `[A-Za-z0-9_-]` | `{ code }` |
| `invite` | `invite` | 1–64 chars, `[A-Za-z0-9_-]` | `{ friendId }` |
| `signup` | `signup` | exactly `1` | none |

A param with an invalid value opens nothing and is left in the URL untouched.

## Stack order

Modals stack in the order their params appear in the query string. The last one is on top.

- `openModal` appends a new param, so the newest modal is on top.
- Opening a type that is already open updates its value in place (`URLSearchParams.set`) and keeps its position.
- A shared link reproduces the same stack.

## API: `useModalStack()`

The task's "modal-stack provider" is a thin layer over the URL.

```ts
type ModalType = 'welcome' | 'promo' | 'invite' | 'signup';

openModal({ type: 'promo', params: { code: 'SUMMER25' } }); // adds ?promo=SUMMER25
closeModal('promo');                                         // removes only ?promo
```

- Both push a history entry, so Back undoes the last open or close.
- Both keep the current path and every other query param.
- `closeModal` removes only that type's param. Other modal params and attribution params stay.

## Rendering

- `parseModals(searchParams)` returns the ordered, validated list of open modals. It is a pure function and unit-tested.
- `<ModalRenderer/>` maps that list to the modal components, each built on the shared `ModalFrame` (see [ui.md](ui.md#modals)).
- **Stacking:** every open modal is rendered; later ones sit on top. Only the bottom modal dims the page (`hideBackdrop` on the rest), so a stack doesn't get darker with each modal. MUI marks lower modals `aria-hidden`, so assistive tech only sees the top one.
- The renderer returns nothing for signed-out users. The modal gate (see [auth.md](auth.md)) redirects them before they would see anything.

| Modal | Title | Content | Action |
| --- | --- | --- | --- |
| `welcome` | Welcome to RealPlay | Account ready, enjoy the welcome bonus | Let's go |
| `promo` | Promo unlocked | Shows the promo code | Got it |
| `invite` | You've been invited | Shows the friend ID | Got it |
| `signup` | Registration | Already registered and signed in | Got it |

Every action and the ✕ call `closeModal` for that modal.

Files: `features/modals/modalRegistry.ts` (params and validation), `parseModals.ts`, `useModalStack.ts`, `ModalContents.tsx` (the four modals), `ModalRenderer.tsx`.

## `?signup=1` for signed-in users

The task maps `?signup=1` to a Registration modal and also says modals only show to signed-in users. We follow the spec literally: a signed-in user sees the Registration modal, whose content states they are already registered. A signed-out user is redirected to `/register` like any other modal param.
