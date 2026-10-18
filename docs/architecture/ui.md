# UI

Status: approved · Related: [frontend.md](frontend.md), [routing-and-modals.md](routing-and-modals.md)

The look and feel was agreed question by question before any UI was built (see [architecture-decisions.md](architecture-decisions.md#step-6-stage-4-design-questions)).

## Direction

Clean and modern: neutral surfaces, one accent colour, generous spacing, soft rounded corners. The UI should look like a polished product without distracting from the flows reviewers are testing.

## Brand

The brand is taken from [realplayltd.com](https://www.realplayltd.com/) and adapted:

| Element | Source | In this app |
| --- | --- | --- |
| Monogram | White "RP" on a violet square (site icon) | Inline SVG in `shared/ui/Logo.tsx`, 8px corner radius; also `public/favicon.svg` |
| Wordmark | "RealPlay TECH", 0.3em letter spacing, Raleway | "REALPLAY", same 0.3em spacing, in Inter so only one font family loads |
| Brand violet | `#4222B0`, sampled from the site icon | `BRAND_VIOLET` in `shared/ui/brand.ts`; used by the logo, the light-mode accent and the register panel gradient |

The logo is rebuilt, not copied, so it stays sharp at any size and works on both dark and light backgrounds.

## Theme

Defined in `app/theme/theme.ts` (`createAppTheme(mode)`).

| Token | Dark (default) | Light |
| --- | --- | --- |
| Primary | `#8B73F0`, dark text on it | `#4222B0`, white text on it |
| Background | `#110F1A` | `#F6F6F8` |
| Surface (paper) | `#1A1726` | `#FFFFFF` |
| Text | `#ECEAF4` | `#281A39` (RealPlay's site text colour) |
| Secondary text | `#A9A5BC` | `#5B5670` |

In dark mode the accent is a lighter tint of the brand violet, because `#4222B0` is too dark to read on a dark background.

- **Font:** Inter (variable), bundled with `@fontsource-variable/inter`; no external font request.
- **Shape:** 12px radius on cards and dialogs, 10px on buttons. Spacing unit 8px, used generously.
- **Buttons:** no uppercase, semibold, no elevation.
- **Icons:** `@mui/icons-material`, imported per icon (`@mui/icons-material/Close`) to keep the dev server and tests fast. Only imported icons end up in the build.

## Dark and light mode

- Dark by default.
- A toggle in the header switches modes (`app/ThemeToggle.tsx`).
- The choice is stored under `rp.theme` as `{ v: 1, mode }` through the shared storage module. An invalid or missing value falls back to dark.
- `ThemeModeProvider` owns the mode; components read it with `useThemeMode()`.

## Layout

| Area | Design |
| --- | --- |
| Header | Sticky top bar. Logo left; Home and Account links, theme toggle and "Sign up" right. When signed in, "Sign up" becomes the user's initial and name with a menu (Account, Sign out). Under 600px the links and Sign up / Sign out move into a menu (☰); the toggle stays visible |
| Content | Centred container, max width `lg` |
| Home | Hero (overline, "Play for real.", one line of copy, Sign up button) and a **Try it** card listing ready-made URLs for every requirement. Each has an in-app link and a "new tab" button for testing a cold load. Below the links, two reviewer tools: "Age first touch by 30 days" and "Reset demo" |
| Register | Split screen: violet gradient panel ("Join RealPlay." and three benefits) beside the form card. Stacks on phones |
| Account | Single card with the user's name and email |
| Not found | Centred message with a link home |

## Modals

`shared/ui/ModalFrame.tsx` gives every modal the same frame: title, close (✕), body, one primary action (default "Got it", which closes). Centred `xs`-width dialog, full-screen under 600px. Modal content and stacking come with the modal stack in [routing-and-modals.md](routing-and-modals.md).

## Accessibility

- Visible focus outline in the accent colour on every focusable element.
- Icon-only buttons have labels ("Switch to light mode", "Open menu", "Close").
- The logo is exposed as one image named "RealPlay".
- Dialogs are labelled by their title.
- Form errors are shown under their fields (`helperText`) and general errors in an `Alert` with `role="alert"`.
- Known limit: while a modal is open, MUI marks the rest of the page `aria-hidden`, so a toast shown at the same time (for example the sign-up toast when returning to a promo link) is visible but not announced by screen readers.
- Text colours chosen for readable contrast on both backgrounds.
