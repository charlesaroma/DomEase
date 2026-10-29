# 02: Folder Structure

**Rule:** if you have to ask where something goes, the answer is here.

- **Every page folder is numbered** in nav order (`1.home`, then the next page as `2.<name>`).
- **The page file sits in its folder** (`1.home/home.jsx`), next to its page-level helpers.
- **Sections are flat and plainly named:** one file per section in `sections/` (`Hero.jsx`), without the page's name in front. No folders inside `sections/`.
- `pages/not-found.jsx` sits at the root of `pages/`.
- **Copy lives in `src/data/`**, not in components (`pages.json`, `site.json`).
- **No raw hex values in components.** Every colour is a token from `src/index.css`.

```
DomEase/
├── docs/                    every .md doc
├── scripts/                 check-dashes.mjs (run by npm run lint)
├── public/                  favicons, icons/, site.webmanifest, browserconfig.xml,
│                            robots.txt, og-image.png,
│                            logo/ (the DomEase logo files: see 04-design-system.md, Logo)
├── index.html  vite.config.js  eslint.config.js  package.json
└── src/
    ├── main.jsx  App.jsx  AppProviders.jsx  index.css (the design tokens)
    ├── routes/              SiteRoutes, SiteLayout, pages.js (the lazy barrel)
    ├── data/                site.json (name, nav, CTA), pages.json (page copy),
    │                        demo.json (the sample household shown in the phone screens)
    ├── seo/                 useSeo.js
    ├── utils/               cn.js
    ├── components/
    │   ├── layout/          Footer, ScrollToTop · navbar/index.jsx + Logo.jsx, MobileMenu (mobileMenu/)
    │   ├── motion/          Reveal (fade up on scroll, off for reduced motion)
    │   ├── product/         the app drawn in code: PhoneFrame, TodayScreen, CleanScreen,
    │   │                    ShopScreen, TabBar, ProgressBar, screenTone (day and evening)
    │   └── ui/              Button, AppIcon, SectionHeading, PageLoader
    └── pages/
        ├── 1.home/          home.jsx · sections/ Hero, AtAGlance, Habits, Sharing,
        │                    BuiltHere, HouseHelp, Pricing, ClosingCta
        └── not-found.jsx
```

The `@` alias points at `src/` (`import Button from "@/components/ui/Button"`).
