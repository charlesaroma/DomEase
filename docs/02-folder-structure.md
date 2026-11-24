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
├── index.html  vite.config.js  eslint.config.js  .env.example  package.json
└── src/
    ├── main.jsx  App.jsx  AppProviders.jsx  index.css (the design tokens)
    ├── routes/              SiteRoutes, SiteLayout, pages.js (the lazy barrel), AdminRoutes
    ├── store/               all data access (03-data-layer.md): services/, queries/, context/, queryClient.js
    ├── data/                site.json (name, nav, CTA), pages.json (page copy), seed/ (the API's JSON),
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
    └── AdminDashboard/      /admin (06-admin.md): AdminLayout, AdminPages (lazy barrel)
        ├── components/      auth/RequireAdmin, sidebar/, header/, DataTable, Drawer, Field,
        │                    RecipeEditor, PageHeader, Panel, StatCard, StatusChip, Tabs, Toggle, Notice
        ├── lib/             constants.js (sidebar order, meal types, roles), format.js, recipes.js
        └── pages/           1.auth  2.overview  3.suggestions  4.recipes  5.households
                             6.subscriptions  7.house-help (sections/)  8.content (sections/)
                             9.team  10.settings
```

The `@` alias points at `src/` (`import Button from "@/components/ui/Button"`).
