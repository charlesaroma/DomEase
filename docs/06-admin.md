# 06: Admin Dashboard

`/admin` manages the whole DomEase ecosystem: everything the mobile app and the web app (`/app`) show comes from here.

| Page | What it does | PRD |
| --- | --- | --- |
| Sign in | Team email and password, separate from household sign in | 7.2 |
| Overview | Households, Premium, accounts, money in this month, ad earnings, recipes missing a photo, 30 day sign up and payment charts | |
| Suggestions | Dishes households sent in. Review tidies the free text into a recipe (photos included), then publishes it; or reject | 13.1, 13.2 |
| Recipe library | Photo grid or table. Filters (meal, status, Premium, photo, dietary, occasion), bulk publish, archive and Premium. The editor is a six step form with a phone preview | 13.2, FR-CP-4 |
| Users | Every account: how they sign in, their household and plan. Turn an account off (with a reason) | |
| Households | Every home, its people and payments. Give or remove Premium by hand, with a reason | FR-MZ-1 |
| Subscriptions | Premium plans, amount and last payment | FR-MZ-3 |
| Transactions | Every mobile money charge: paid, waiting, failed, refunded. Filters, CSV export, refunds (owner only) | FR-MZ-3 |
| Ads | Placements (AdMob unit ids for Android and iOS, AdSense slot for the web, on or off per screen), Performance (earnings, impressions, taps, eCPM), Sponsored products from brands | FR-AD-2 |
| Market prices | The price table behind the shopping estimate, CSV import; lists recipe ingredients with no price | FR-SL |
| House Help | The questionnaire with each answer's weight, and the guides (PDF upload, cover) | 12 |
| App content | Health nudges, starting zones, ready made zones, occasions, the Premium list, help questions, exchange rates | FR-TD-3, FR-HM-1, FR-CC-3 |
| Legal pages | Terms, Privacy, Premium terms, Health notice | |
| Inbox | Problems and ideas sent from the apps; reply by email, mark answered | |
| Team | Who can sign in: owner, admin, moderator | 7.2 |
| Activity log | Who changed what and why: plans changed by hand, refunds, accounts turned off, publishing, settings | |
| Settings | Premium prices, free trial, free plan zone limit, the dietary disclaimer, support email, minimum app version, maintenance mode | 10, FR-MP-12 |

**Roles.** Owner sees everything and alone can refund. Admin sees everything else. Moderators see Overview, Suggestions, Recipe library, House Help, App content, Market prices and the Inbox (`store/context/AdminAuthContext.jsx`).

**Tables** are one component, `components/DataTable.jsx`, on TanStack Table: sorting, search, filters kept in the address (a filtered view can be shared), paging, row selection with bulk actions, a row menu, CSV export of what is on screen, and cards on phones. Each page keeps its columns in `pages/<n>.<page>/sections/<thing>Columns.jsx`. A link can arrive searched (`/admin/users?q=Sarah`) or open a record (`/admin/households?open=hh_001`).

**Long forms are steps.** A form that takes a lot of detail (a recipe, a sponsored product) uses `components/Stepper.jsx`: numbered steps, Back and Next, a step that is missing something marked, and a Review step at the end. A new record goes in order; an existing one can jump to any step and save from anywhere.

**Photos and files.** `components/ImageUploader.jsx` resizes photos in the browser (WebP, 1600px) and uploads them through `POST /admin/uploads`; the first photo is the cover. `components/FileUploader.jsx` does the same for PDFs. On demo data files are kept in this browser's IndexedDB; `components/ui/Media.jsx` shows either kind.

**Ads, the plan.** The mobile apps use Google AdMob, the web app Google AdSense ("Google Ads" is where advertisers buy ads, not where an app shows them). Unit ids live in Ads → Placements and reach the apps through `/settings/app`, so they change without a store release. Until the API reads the AdMob Reporting API, Performance shows example figures and says so.

**Demo sign in.** With no API set, sign in as `pearl@domease.app` (owner), `charles@raijintechhub.com` (admin) or `moderator@domease.app`, password `domease-demo`. The login page says so in demo mode only. Reset in the header puts the demo data back.

**Structure** follows QVFITS: `src/AdminDashboard/` with `AdminLayout.jsx`, `AdminPages.jsx` (lazy barrel), `components/`, `lib/` (sidebar order in `constants.js`, formatting, CSV, photo resizing) and numbered `pages/`. Routes are in `src/routes/AdminRoutes.jsx`.
