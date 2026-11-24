# 06: Admin Dashboard

`/admin` manages the whole DomEase ecosystem: everything the mobile app shows comes from here.

| Page | What it does | PRD |
| --- | --- | --- |
| Sign in | Team email and password, separate from household sign in | 7.2 |
| Overview | Households, Premium share, suggestions waiting, recipes live, subscription health, newest households | |
| Suggestions | Dishes households sent in. Review tidies the free text into a structured recipe, then publishes it; or reject | 13.1, 13.2 |
| Recipe library | Every live recipe by meal type: add, edit (ingredients with market swaps, steps, Premium tags), delete | 13.2, FR-CP-4 |
| Households | Every home, its plan and activity; give or remove Premium by hand for support cases | FR-MZ-1 |
| Subscriptions | Premium plans paid by mobile money, with status and reference | FR-MZ-3 |
| House Help | The 11 question vetting questionnaire with each answer's weight, and the four guides | 12 |
| Nudges, zones and rates | Health nudges, the zones a new household starts with, the exchange rate table | FR-TD-3, FR-HM-1, FR-CC-3 |
| Team | Who can sign in: owner, admin, moderator | 7.2 |
| Settings | Premium prices, ads per screen, free plan zone limit, the dietary disclaimer, support email | 10, FR-AD-2, FR-MP-12 |

**Roles.** Owner and admin see everything. Moderators see Overview, Suggestions, Recipe library, House Help and app content only (`store/context/AdminAuthContext.jsx`).

**Demo sign in.** With no API set, sign in as `pearl@domease.app` (owner), `charles@raijintechhub.com` (admin) or `moderator@domease.app`, password `domease-demo`. The login page says so in demo mode only.

**Structure** follows QVFITS: `src/AdminDashboard/` with `AdminLayout.jsx`, `AdminPages.jsx` (lazy barrel), `components/` (sidebar, header, auth, DataTable, Drawer, RecipeEditor…), `lib/` (sidebar order in `constants.js`, formatting) and numbered `pages/`. Routes are in `src/routes/AdminRoutes.jsx`.
