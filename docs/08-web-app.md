# 08: Web App

`/app` is DomEase for households on the web: the same account, the same home and the same screens as the mobile app. Plan the week on a big screen, and everyone at home sees it on their phones.

| Screen | Path | What it does |
| --- | --- | --- |
| Sign in | `/app/sign-in` | Email and password, or make an account. Google, Apple and phone codes arrive with the API |
| Set up | `/app/setup`, `/new`, `/join` | Set up a new home in eight steps (one question a screen, a review at the end), or join one with an invite code |
| Today | `/app` | Nudge, tonight's dinner, the week's progress, cleaning due today, the shopping estimate, converter, House Help |
| Meals | `/app/meals`, `/app/meals/:id` | The week as photo cards per meal type, swap week; recipe pages scaled to the household; dietary and occasion menus; suggest a recipe |
| Clean | `/app/clean` | Zones with tasks, streaks and who looks after them; supplies running low; ready made zones |
| Shop | `/app/shop` | One list by aisle in the household's currency; add items; Done shopping saves what the trip cost and clears the ticks |
| Insights | `/app/insights` | Budget: a monthly food budget against every trip, six months of spending, the market against the estimate. Eating trends: most planned dishes, variety, vegetable forward share, cuisines, dishes on repeat (Premium) |
| House Help | `/app/house-help` | Vet a candidate; Pay: salary, payday, advances, deductions, bonuses, days off, what is still owed and a WhatsApp payslip; the guides (Premium). Today reminds of a payday three days ahead |
| Premium | `/app/premium` | What Premium includes, and paying by mobile money in three steps |
| You | `/app/you`, `/household`, `/settings`, `/help` | Profile, the home and its invite code, currency and reminders, help questions, report a problem, delete the account |

**The same rules as the phone.** The planning, shopping list, currency and House Help score are ported from the app's `domain/use_cases` into `src/ClientApp/lib/home.js`, budget, trends and pay into `src/ClientApp/lib/insights.js`, and recipe scaling into `src/utils/recipes.js`. Change one, change the other.

**Content comes from the admin.** Recipes, prices, nudges, help questions, the Premium list, occasions, ready made zones, ad placements and sponsored products are what the admin publishes. On demo data the web app reads the admin's demo database directly, and what a household sends (a payment, a suggestion, a report) appears in the admin straight away.

**Premium.** `household.tier` decides. Free homes see Premium recipes and features locked (`components/PremiumLock.jsx`) and are never planned a Premium recipe. Ads appear only where Ads → Placements turns them on, never for Premium, never full screen: a running sponsored product first, otherwise the AdSense slot (`VITE_ADSENSE_CLIENT`, the `ca-pub-…` id).

**Sign in is separate from the admin's.** The household token is kept in `localStorage` under its own key (`store/services/app`), the team's in `sessionStorage`, so one browser can be signed in to both.

**Demo.** With no API set, sign in as `you@domease.app` / `domease-demo`: a family of four with a house help, one child allergic to groundnuts, twelve weeks of market trips, four past weeks of meals and Grace's pay record. Or create an account and set up a home from scratch.

**Structure** mirrors the admin: `src/ClientApp/` with `ClientShell.jsx` (sign in, toasts), `ClientLayout.jsx` (tabs on phones, a rail on large screens), `ClientPages.jsx` (lazy barrel), `components/`, `lib/` and numbered `pages/`. Routes are in `src/routes/ClientRoutes.jsx`; data in `store/services/app`, `store/queries/app.js` and `store/context/MemberAuthContext.jsx`.
