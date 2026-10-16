# Attribution

Status: approved · Related: [data-storage.md](data-storage.md), [api.md](api.md), [security.md](security.md)

Attribution tells the business which campaign brought a user who later registered. This is the core of the task.

## What we capture

| Param | Meaning |
| --- | --- |
| `utm_*` (any key starting with `utm_`) | Campaign tags added by marketers: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, … |
| `ref` | Referrer or affiliate tag |
| `gclid` | Google Ads click ID, added automatically by Google |
| `fbclid` | Meta (Facebook / Instagram) click ID, added automatically by Meta |

Anything else in the URL is ignored. Values are trimmed, empty values dropped, and each value is capped at 256 characters. At most 20 keys are kept. See [security.md](security.md).

## Rules

Evaluated on every capture, in this order:

1. No attribution params in the URL: do nothing.
2. User has already registered: do nothing.
3. No stored record: save the params as the first touch, with `firstTouchAt = now`.
4. Stored record is younger than 30 days: keep it, ignore the new params.
5. Stored record is 30 days or older: replace it with the new params and set `firstTouchAt = now`.

"30 days" means `now - firstTouchAt >= 30 * 24 * 60 * 60 * 1000`.

When registration succeeds, the record is sent in the request body and then cleared, and the `registered` flag is set so later visits are not captured.

## When capture runs

Outside React, so no component can redirect before the params are read:

1. **Bootstrap:** `main.tsx` captures from `window.location` before the first render.
2. **Every navigation:** `router.subscribe()` captures from the new location.

React effects were rejected for this: child effects run before parent effects, so a `<Navigate>` in a child (for example `<ProtectedRoute>`) could redirect and drop the params before a root effect read them.

## Redux slice

```ts
type AttributionParams = Record<string, string>;

interface AttributionRecord {
  params: AttributionParams;
  firstTouchAt: number; // epoch ms
}

interface AttributionState {
  record: AttributionRecord | null;
  registered: boolean;
}
```

| Action | Payload | Effect |
| --- | --- | --- |
| `attributionCaptured` | `{ params, now }` | Applies the rules above. `now` is passed in, so the reducer is pure and testable with any clock |
| `attributionCleared` | none | `record = null`, `registered = true` |
| `attributionHydrated` | `AttributionState` | Replaces state with what another tab wrote (see [data-storage.md](data-storage.md)) |

Extracting params from a URL (`extractAttributionParams(search)`) is a separate pure function. The reducer only receives already-filtered params.

## Example timeline

| Day | URL | Result |
| --- | --- | --- |
| 0 | `/?utm_source=google&gclid=abc` | Saved as first touch |
| 5 | `/?utm_source=facebook&fbclid=xyz` | Ignored, first touch is 5 days old |
| 12 | `/` | Nothing to capture |
| 31 | `/?utm_source=newsletter` | Replaced, clock reset to day 31 |
| 33 | Registers | Body includes `{ utm_source: "newsletter" }`, then cleared |
| 40 | `/?utm_source=google` | Ignored, user is registered |

## Open questions

- A record older than 30 days with no newer params is still sent on registration. The task only says to overwrite after 30 days, not to expire. Keep this literal reading, or drop expired records when registering?
