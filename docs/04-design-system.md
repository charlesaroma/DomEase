# 04: Design System

The DomEase brand: **Terracotta and Sage**, chosen by the client. Sources: the Colour and Interface Direction (RTH-DOM-2026-BRAND-01) and the logo (RTH-DOM-2026-LOGO-01). Every token lives in `src/index.css`; the Flutter app mirrors the same names in `lib/ui/core/themes/tokens.dart`.

## Logo

The house in bloom: a line drawn house with a plant growing up through it and a tulip opening above the roof. The name **DomEase** is set in Lustria and the tagline **HOMELIFE, EASED.** in Inter, spaced. This is the approved artwork; it is not redrawn or retyped.

| Part | Colour |
| --- | --- |
| House | Clay 700 `#874628` |
| Leaves and stems | Sage 700 `#53815F` |
| Tulip | Clay 600 `#A85E3D` |
| DomEase | Ink `#2D2520` |
| Tagline | Ink 2 `#635953` |

Files in `public/logo/` (SVG for the site, PNG for everything else):

| File | Use |
| --- | --- |
| `domease-logo-compact.svg` / `-reversed` | Horizontal without the tagline. The header and footer. |
| `domease-logo.svg` | Horizontal with tagline, light grounds. Documents, email. |
| `domease-logo-reversed.svg` | Horizontal with tagline, dark grounds. The clay band. |
| `domease-logo-white.svg` | One colour white, over photos. |
| `domease-logo-stacked.svg` | Stacked with tagline. Hero, splash, posters. |
| `domease-logo-stacked-reversed.svg` | Stacked, dark grounds. |
| `domease-mark.svg` / `-reversed` | The mark alone. Loaders, avatars, watermarks. |
| `domease-wordmark.svg` | The name alone. |
| `domease-icon.svg` | The app icon tile. |

Rules: keep clear space equal to the height of the D on every side; never stretch, rotate, recolour, outline, add shadows or rearrange the parts. Below 48 px tall use the mark alone; below 64 px use the icon (the heavier line cut).

## Colour

| Family | Role | Tokens |
| --- | --- | --- |
| Clay | The brand: logo, headings accent, primary buttons, progress, the dark band | `clay-950` to `clay-100` |
| Sage | Beside it: cleaning, success. Small marks only, never a whole panel | `sage-800` to `sage-100` |
| Amber | Only for action: Start free, Get the app, Premium | `amber-800` to `amber-200` |
| Ink and paper | Everything else: every background, border and word | `ink`, `ink-2`, `ink-3`, `paper`, `paper-2`, `line`, `night` |

Proportion: about four fifths of any screen is paper, white or warm grey. Clay carries the structure. Amber appears once or twice per screen at most. Red (`danger`) appears only on low stock and always with an icon and a word.

## Type

| Face | Use | Token |
| --- | --- | --- |
| Outfit | Headings, nav, buttons | `font-display` |
| Inter | Body and interface text | `font-body` |
| IBM Plex Mono | Shillings, quantities, counts | `font-mono` |
| Lustria | The logo name only (in the files as outlines) | none |

## Copy

No em or en dashes anywhere. `npm run lint` runs `scripts/check-dashes.mjs` and fails on any. Use a comma, colon or full stop. Prices are `UGX 46,500`.
