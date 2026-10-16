# API

Status: approved · Related: [backend.md](backend.md), [attribution.md](attribution.md)

One REST endpoint. No versioning: the only client is this app, and both ship together.

## Base URL

All calls go to `${VITE_API_BASE_URL}` (default `/api`). The task's `POST /register` is therefore `POST /api/register`. The `/api` prefix keeps API paths separate from the `/register` page route.

## `POST /api/register`

### Request

```json
{
  "name": "Dana Levi",
  "email": "dana@example.com",
  "attribution": {
    "utm_source": "google",
    "utm_campaign": "fall_launch",
    "gclid": "Cj0KCQ-123"
  }
}
```

| Field | Type | Rules |
| --- | --- | --- |
| `name` | string | Required, 1–100 chars after trim |
| `email` | string | Required, valid email format |
| `attribution` | object of string → string | Optional. Omitted when no record is stored. Contains only the params, not `firstTouchAt` |

Attribution is nested rather than spread at the top level, so marketing data can't collide with form fields (for example a future form field called `ref`).

### Responses

| Status | Body | When |
| --- | --- | --- |
| `201` | `{ "user": { "id", "name", "email" }, "token": "…" }` | Success |
| `400` | `{ "error": { "code": "VALIDATION_ERROR", "message": "…", "fields": { "email": "…" } } }` | Invalid input |
| `409` | `{ "error": { "code": "EMAIL_TAKEN", "message": "…" } }` | Email already registered in this mock session |
| `500` | `{ "error": { "code": "SERVER_ERROR", "message": "…" } }` | Simulated failure (see [backend.md](backend.md)) |

## Client code

| File | Responsibility |
| --- | --- |
| `shared/api/http.ts` | `fetch` wrapper: JSON in and out, throws `ApiError { status, code, message, fields? }` for non-2xx responses |
| `features/registration/api.ts` | `registerUser(body): Promise<RegisterResponse>`, typed request and response |
| `features/registration/useRegister.ts` | `useMutation` around `registerUser`, plus the success side effects (see [frontend.md](frontend.md)) |

Components never call `fetch` directly. Replacing MSW with a real backend means changing only `VITE_API_BASE_URL`.

## Failure handling

- **No automatic retry.** Registration isn't idempotent; a retry after a lost response could create a duplicate account. This is React Query's default for mutations; we don't override it.
- Attribution is cleared only on `201`. On any error it stays stored.
- The form shows `error.message`, and field errors next to their inputs when `fields` is present.
