# 07: Logo Motion, Share Cards and Icons

Review everything live at **/brand** (not linked from the site, not indexed).

## Logo motion

`src/components/brand/AnimatedLogo.jsx` draws the logo from the approved artwork (`logoArt.js`, generated from `public/logo`), so it can move without ever being redrawn by hand.

| State | What happens | Where |
| --- | --- | --- |
| `draw` | The house goes up, the plant grows from the ground, the leaves open, the tulip blooms, then the name and tagline rise in. About 3 seconds, once. | Site header (once per visit), app splash |
| `loading` | The same drawing at double speed, a pause, a fade, on a 2.6 second loop. | `PageLoader`, waits in the app |
| `idle` + `hover` | Still. On hover or keyboard focus the tulip nods and the plant sways. | Site header and footer logo |

Timing lives in `logoMotion.js`; the keyframes in `animatedLogo.css`. Reduced motion (a device setting) shows the finished logo with no movement. `layout` is `mark`, `compact` or `stacked`; `tone` is `light` or `dark` (the reversed colours for clay and night grounds). Pass `title=""` when the word DomEase is already next to it.

The Flutter app uses the same story and timings (`lib/ui/core/ui/brand/animated_logo.dart`).

## Share cards

1200 x 630 PNGs in `public/`: `og-image.png` (home) and one per page (`og-terms.png`, `og-privacy.png`, `og-premium-terms.png`, `og-health-notice.png`, `og-delete-account.png`). The logo and title sit in the centre because WhatsApp crops its small preview to a centre square.

Link previews do not run JavaScript, so `npm run build` runs `scripts/prerender-meta.mjs` after Vite: it writes `dist/<page>/index.html` with each page's title, description and card. Add a page there when you add a public route.

## Icons

| File | Size | Notes |
| --- | --- | --- |
| `favicon.svg`, `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png` | 16 to 48 | Simplified cut: no veins or smallest leaves, heavier lines, so it reads in a tab |
| `apple-touch-icon.png` | 180 | Square with no transparency; iOS rounds it |
| `icons/icon-192.png`, `icons/icon-512.png` | 192, 512 | Rounded, for installs |
| `icons/icon-maskable-*.png` | 192, 512 | Mark inside the 80% safe circle |
| `icons/mstile-150x150.png` | 150 | Windows tile |
| `safari-pinned-tab.svg` | any | One colour; Safari fills it with clay |
| `splash/splash-*.png` | 13 sizes | iPhone and iPad launch screens, linked in `index.html` |
