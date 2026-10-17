# How the architecture was decided

This document records the process I followed before writing any application code, and every architecture question I answered along the way. The resulting specs live in the other docs in this folder; this one explains how I got there.

## The process

1. **Read the task.** I read [Home Task - FE.docx](../Home%20Task%20-%20FE.docx) and summarised it in the [root README](../../README.md).
2. **Made sure I understood it.** I built a small throwaway interactive demo of the flow (URL-driven modals, first-touch attribution with a simulated 30-day clock, the register request body) to check my reading of the requirements before designing anything.
3. **Chose the architecture with my own skill.** I ran **architecture-advisor**, a Claude Code skill I wrote, which walks through architecture decisions in a fixed order:
   - It first asks a batch of context questions (platform, team, scale, ops capacity, coupling, consistency, deadline, budget). The answers act as filters for everything after.
   - It then covers 21 architecture categories in four clusters: **Foundation → Access & interface → Runtime behaviour → Operations**. Each cluster builds on the one before, so a cluster is only opened after the previous one is approved.
   - Every decision is presented with its real alternatives, their trade-offs for *this* project, and a recommendation. I approve, reject or override each one.
   - Categories that don't apply are skipped explicitly, with a reason, instead of being forced in.
4. **Planned the workflow.** Before coding I set the git workflow and made these docs the source of truth (see [Workflow](#workflow) below).
5. **Then started building**, against the specs in this folder.

The tables below list every question exactly as it was asked, the options I was given, the skill's recommendation, and what I chose. Where I chose differently from the recommendation, the row is marked **Override**.

## Step 1: Context questions

| Question | Options | My answer |
| --- | --- | --- |
| Platform | Web SPA · Web SSR · Mobile · Desktop | **Web SPA** |
| Team size and ownership | Solo · Small team · Larger team | **Solo** |
| Expected scale | Demo only · Small production · Production at scale | **Demo only** |
| Ops / deployment capacity | Local only · Static hosting · Containerized | **Local only** |
| Domain coupling | Tightly coupled · Loosely coupled · Mixed | **Tightly coupled**: auth, attribution, modals and registration form one flow |
| Consistency requirements | Attribution only · Attribution + auth · Not critical | **Attribution + auth**: both must stay correct across reloads and tabs |
| Time to ship | 1–2 days · 3–7 days · No hard deadline | **1–2 hours**: the brief asks for a short assignment to discuss in the interview |
| Budget | Free only · Paid OK | **Free only** |

## Step 2: Cluster 1, Foundation

| Decision | Options | Recommended | My choice |
| --- | --- | --- | --- |
| Backend shape (the mocked `POST /register`) | MSW in the browser · In-app mock function · Separate local mock server | MSW | **MSW**: real requests visible in DevTools, production-shaped API code |
| Frontend shape | Single app with feature folders · Flat single app · Micro-frontends | Feature folders | **Feature folders** |
| Client-side persistence | `localStorage` · First-party cookie · `sessionStorage` / memory | `localStorage` | **`localStorage`**: survives 30 days, shared across tabs |
| Backup & DR, File storage, Scalability | Skip · Discuss | Skip | **Skipped**: no real data store, no uploads, local demo |

## Step 3: Cluster 2, Access & interface

| Decision | Options | Recommended | My choice |
| --- | --- | --- | --- |
| Authentication (mocked) | Session in `localStorage` · Mock JWT + `GET /me` · httpOnly cookie via MSW | Session in `localStorage` | **Session in `localStorage`** |
| Authorization model | Binary (signed in or not) · RBAC · ABAC | Binary | **Binary** |
| Where the auth check lives | Two central gates · Inside each component · React Router loaders | Two central gates | **Two central gates**: `<ProtectedRoute>` and the root modal gate |
| API design | REST `POST /register` · GraphQL · tRPC | REST | **REST** |
| Request body shape | Nested `attribution` object · Flat fields · Nested with metadata | Nested | **Nested** |
| Third-party integrations, AI integration | Skip · Discuss | Skip | **Skipped**: no external providers, no AI feature |

## Step 4: Cluster 3, Runtime behaviour

| Decision | Options | Recommended | My choice |
| --- | --- | --- | --- |
| Source of truth for open modals | URL only · Provider state synced with URL · Provider state, URL read once | URL only | **URL only** |
| Stack order with several modal params | URL order · Fixed priority · One at a time | URL order | **URL order** |
| When attribution is captured | Outside React (bootstrap + `router.subscribe`) · Root `useEffect` · Bootstrap only | Outside React | **Outside React**: guaranteed to run before any redirect |
| Redirect for signed-out users | `returnTo` query param · `sessionStorage` · Drop the destination | `returnTo` | **`returnTo`** |
| UI library | MUI · Tailwind | MUI | **MUI** |
| Auth / session state | React Context · Zustand · React Query query | React Context | **Override: Redux Toolkit**, to show RTK patterns (slices, listener middleware) |
| ↳ Follow-up: what goes in the store | Auth + attribution slices · Auth slice only · Auth + attribution + modals | Auth + attribution | **Auth + attribution**: modals stay in the URL |
| Registration success side effects | `useRegister` hook · In the form component · Global mutation cache | `useRegister` | **`useRegister`** |
| Failure handling for `POST /register` | No retry, keep attribution · Auto-retry with backoff | No retry | **No retry**: registration isn't idempotent |
| Messaging, Background jobs, Caching | Skip · Discuss | Skip | **Skipped**: one SPA, no deferred work, one mutation |

Choosing Redux Toolkit changed two decisions already approved, and the skill flagged both: the auth `Context` from Cluster 2 became `authSlice` with a selector, and the storage module is now called by listener middleware instead of by components.

## Step 5: Cluster 4, Operations

| Decision | Options | Recommended | My choice |
| --- | --- | --- | --- |
| Testing strategy | Unit + 1–2 integration · Unit only · Unit + integration + E2E | Unit + 1–2 integration | **Unit + 1–2 integration** |
| Input validation | `returnTo` + attribution · Form only · Full `zod` schemas | `returnTo` + attribution | **`returnTo` + attribution**: closes an open redirect |
| Stored data evolution | Version field + discard · No versioning · Migration functions | Version field + discard | **Version field + discard** |
| Delivery tooling | npm scripts + README · Add GitHub Actions CI · Add static deploy | npm scripts + README | **Override: GitHub Actions CI**: typecheck, lint, test and build on every PR that touches code |
| Observability, Environment & release, Networking | Skip · Discuss | Skip | **Skipped**: local demo, no environments, no network infra |

## Step 6: Stage 4 design questions

Asked before any UI was built, so the design was agreed up front. Result: [ui.md](ui.md).

| Decision | Options | Recommended | My choice |
| --- | --- | --- | --- |
| Visual direction | Clean & modern · Bold & playful · Minimal / MUI default | Clean & modern | **Clean & modern** |
| Accent colour | Deep indigo · Teal · Coral | Deep indigo | **Deep indigo**, later refined to RealPlay's brand violet `#4222B0` (below) |
| Light / dark mode | Light only · Follow system · Light + manual toggle | Light only | **Override: dark by default, with a toggle to switch to light** |
| Font | Inter · Roboto · System font stack | Inter | **Inter** |
| Header | Top bar, nav right · Top bar, centred nav · Side navigation | Top bar, nav right | **Top bar, nav right** |
| Register page | Centred card · Split screen · Plain full-width form | Centred card | **Override: split screen** |
| Modals | Centred dialog, full-screen on phones · Centred everywhere · Bottom sheet on phones | Centred, full-screen on phones | **Centred, full-screen on phones** |
| Home page | Hero + "Try it" panel · Hero only · Hero + Try it + debug panel | Hero + Try it | **Hero + Try it** |
| Remember theme choice | localStorage · Reset each load | localStorage | **localStorage** |
| Logo | Icon + wordmark · Wordmark only | Icon + wordmark | **Override: use RealPlay's own logo from realplayltd.com, adapted to our design** |
| Register side panel | Static benefits · Benefits + context line · Illustration | Static benefits | **Static benefits** |
| Shape and density | 12px comfortable · 8px compact · Pill buttons | 12px comfortable | **12px comfortable** |
| ↳ Accent after seeing the brand | Brand `#4222B0` · Keep earlier indigo | Brand `#4222B0` | **Brand `#4222B0`** |
| ↳ Wordmark font | Inter with wide spacing · Raleway for the logo only | Inter | **Inter** |
| ↳ Wordmark text | REALPLAY · REALPLAY TECH · Monogram only | REALPLAY | **REALPLAY** |
| Icons | `@mui/icons-material` · Hand-drawn inline SVGs | Not asked at first; raised by me | **`@mui/icons-material`**, imported per icon |

## Workflow

Decided before writing code:

- **`main` is never touched directly.** Every change goes on its own branch off `main` and reaches `main` through a pull request.
- **No `dev` branch.** Feature branches target `main` directly, to keep the workflow fast for a short project.
- **Branch names** describe the change: `feat/…`, `fix/…`, `docs/…`, `chore/…`, `test/…`.
- **Docs are the source of truth.** A PR that changes behaviour updates the matching doc in this folder in the same PR.
- **CI** checks every PR that touches code. PRs that change only docs, Markdown or other non-code files skip it (see [delivery.md](delivery.md#ci)).

## Still open

Decisions deferred until implementation, tracked in [README.md](README.md#open-questions):

1. ~~Whether attribution older than 30 days is still sent on registration when no newer params arrived.~~ Decided in Stage 5: **sent as-is**, following the spec literally (options: send it · drop it at registration · expire on app load).
2. Whether to add a "Sign out" control for re-testing the signed-out flow.
3. How the toast is implemented.
