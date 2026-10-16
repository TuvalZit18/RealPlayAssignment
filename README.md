# RealPlay Assignment — Registration with Attribution + Redirect

A front-end home task focused on capturing and preserving marketing attribution across the registration flow, from first visit through to a successful sign-up.

The full task description is in [docs/Home Task - FE.docx](docs/Home%20Task%20-%20FE.docx).

## Tech Stack

- React 18 + TypeScript + Vite
- MUI or Tailwind
- React Query
- React Router
- A small modal-stack provider (`openModal({ type, params })`)

## Requirements

### Routes

| Route       | Description             |
| ----------- | ----------------------- |
| `/`         | Home                    |
| `/register` | Registration form       |
| `/account`  | Account page (protected) |

A single global modal renderer lives at the app root. Modals are rendered only for authenticated users.

### 1. URL → Modal

These query params open a modal on any page: on cold load, on back/forward, and on in-app navigation. Unauthenticated users are redirected to `/register`. Closing a modal removes only its own param.

| Query param          | Opens modal  |
| -------------------- | ------------ |
| `?welcome=1`         | Welcome      |
| `?promo=<code>`      | Promo        |
| `?invite=<friendId>` | Invite       |
| `?signup=1`          | Registration |

### 2. Attribution

On first visit, capture `utm_*`, `ref`, `gclid` and `fbclid`, then persist them.

- Same user within 30 days who hasn't registered yet: keep the first touch and ignore new params.
- After 30 days and still not registered: overwrite and reset the clock.

### 3. Registration

A minimal form at `/register`, wired to a React Query mutation against a mocked endpoint.

On success:

- Show a toast.
- Include the persisted attribution params in the `POST /register` payload, then clear them.

## Architecture

Design decisions, specs and the reasoning behind them live in [docs/architecture/](docs/architecture/README.md). Start with the index there.

Before writing code, I chose the architecture by running my own architecture-advisor skill, answered every decision cluster by cluster, and planned the git workflow. The full record is in [docs/architecture/architecture-decisions.md](docs/architecture/architecture-decisions.md).

## Getting Started

_To be added once the project is scaffolded._
