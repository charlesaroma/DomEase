# 05: API Contract

One contract for four parties: the mobile app (DomEase_MobileApp), this repo's web app (`/app`), its admin dashboard (`/admin`) and the Node.js server to come (PRD section 8.2). The seed files in `src/data/seed/` (the same files as the app's `assets/demo/`) are the exact JSON each endpoint returns; build the server to send the same shapes and both clients switch over with no code changes.

Base: `https://api.domease.app/api/v1` (staging: `https://staging-api.domease.app/api/v1`). JSON, camelCase fields, ISO 8601 dates, money in whole Ugandan Shillings. Errors: `{ "message": "…" }` with a 4xx or 5xx status.

## Sign in (no token needed)

Every sign in answers `{ token, user: { id, name, email, phone } }`. The token (JWT) goes on every later request as `Authorization: Bearer …`. Errors are `{ message }` written for the person ("That code has expired. Send a new one.").

| Method | Path | Body |
| --- | --- | --- |
| POST | `/auth/google` | `{ idToken }` from Google Sign In on the phone; the server verifies it with Google |
| POST | `/auth/apple` | `{ idToken, name? }` from Sign in with Apple (Apple sends the name only the first time) |
| POST | `/auth/email/sign-up` | `{ name, email, password }` |
| POST | `/auth/email/sign-in` | `{ email, password }` |
| POST | `/auth/password/forgot` | `{ email }`; always 204, so it never reveals who has an account |
| POST | `/auth/phone/start` | `{ phone }` in international form (`+256772123456`); texts a 6 digit code, valid 10 minutes |
| POST | `/auth/phone/verify` | `{ phone, code }` |

## Your account (signed in)

| Method | Path | Body or response |
| --- | --- | --- |
| PATCH | `/me` | `{ name?, email?, phone? }` → the user. A new email gets a confirmation link and a new phone a 6 digit code before either can be used to sign in |
| POST | `/me/password` | `{ current, next }`; 400 with a message if `current` is wrong. Email accounts only |
| DELETE | `/me` | Deletes the account. If the person owns a home, the home and everything in it goes too; if they joined one, only their membership. 204 |
| POST | `/households/me/leave` | Leave a home someone else set up. 204; the home carries on for the others |
| GET | `/legal/:id` | `terms`, `privacy`, `premium` or `health`: `{ id, title, updated, summary, sections: [{ heading, paragraphs }] }`. Same JSON as `assets/legal/` |
| POST | `/support/reports` | `{ topic: "problem" \| "idea", message, appVersion }`; listed for the team in the admin's Inbox |

Zones are the household's own: `PUT /households/me/zones` saves added, renamed, reordered and removed zones, tasks and supplies as one list.

## App endpoints (household token)

| Method | Path | Body or response | Seed |
| --- | --- | --- | --- |
| GET | `/households/me` | Household, 404 if none yet | `household.json` |
| PUT | `/households/me` | Household in, Household out | |
| POST | `/households/me/invite` | `{ code }`, the code a person types on Join a home. Same code until it is reset | |
| POST | `/households/join` | `{ code }` in, Household out; adds the signed in person as a member. 404 for an unknown code | |
| POST | `/subscriptions/checkout` | `{ plan: "monthly" \| "yearly", provider: "mtn" \| "airtel", phone }`. The server asks the aggregator to send a prompt to `phone`, records a Payment (below) and returns the Household once paid | |
| GET | `/recipes` | Published recipes only, with `photo`, `gallery` and `isPremium` (below) | `recipes.json` |
| GET / PUT | `/households/me/meal-plan` | `{ seed, premium, days: { breakfast: [recipeId × 7], lunch: […], … }, createdAt }`. Premium recipes are only planned for Premium homes | |
| GET / PUT | `/households/me/favourites` | `[recipeId]`. Premium only | |
| GET | `/households/me/meal-plan/history` | `[{ weekOf, days }]`, oldest first. Each time the plan is replaced the server keeps the old week (the last 12), for Eating trends | |
| GET / PUT | `/households/me/budget` | `{ monthly, trips: [Trip] }`. Every home can record trips; the Insights screen is Premium | |
| GET / PUT | `/households/me/staff` | `[Staff]`, who helps at home and their pay. Premium only | |
| POST | `/recipe-suggestions` | `{ name, ingredientsRaw, methodRaw, suggestedMealType? }` | |
| GET / PUT | `/households/me/zones` | Zones with tasks and consumables | `zone_templates.json` |
| GET / PUT | `/households/me/shopping` | `{ checked: [itemId], manual: [{ id, name, category, quantity, price }] }` | |
| GET | `/prices` | Market prices `{ name, pack, price, category }` | `prices.json` |
| GET | `/currencies` | `{ base, updatedAt, rates: [{ code, name, perUsd }] }` | `currencies.json` |
| GET | `/nudges` | Active nudges | `nudges.json` |
| GET | `/settings/app` | `settings.json` plus `ads` (every placement, `ad_placements.json`) and `sponsored` (the deals running now). Also `trialDays`, `minAppVersion` (older apps must update) and `maintenance: { on, message }` | `settings.json` |
| GET | `/faqs` | Active help questions, in order | `faqs.json` |
| GET | `/premium-features` | Listed features, in order; `comingSoon` ones are shown as such | `premium_features.json` |
| GET | `/occasions` | Active occasion menus | `occasions.json` |
| GET | `/zone-presets` | The ready made zones offered in Add a zone | `zone_presets.json` |
| POST | `/ads/events` | `{ sponsoredId, type: "view" \| "tap", platform }`. Sponsored products only; AdMob and AdSense count their own. 204 | |
| GET | `/house-help/questions` | Premium only | `vetting_questions.json` |
| GET | `/house-help/guides` | Premium only | `house_help_guides.json` |
| POST | `/house-help/score` | `{ answers: { questionId: optionIndex } }` → `{ fitScore, flaggedConcerns, bySection }` | |

The server is the source of truth for the plan (FR-MZ-1) and the fit score (FR-HH-4). The fit score is the sum of answer weights over the best possible total, as a whole percent; any answer weighted 1 or less is flagged. `domain/use_cases/score_candidate.dart` is the reference.

## Records added for photos, money and ads

**Recipe** gains (all optional for older clients):

```json
{
  "photo": { "url": "https://media.domease.app/recipes/ab12.webp", "alt": "Chicken stew in a clay pot", "width": 1600, "height": 1200 },
  "gallery": [{ "url": "…", "alt": "…" }],
  "isPremium": false,
  "status": "published",
  "prepMinutes": 15,
  "cookMinutes": 45,
  "publishedAt": "2026-11-18T08:05:00Z"
}
```

`status` is `draft`, `published` or `archived`; the app endpoints return `published` only. A recipe without a photo is shown with a placeholder tinted by meal type, never a broken image.

**Payment** (`payments.json`), one per charge the aggregator reports:

```json
{
  "id": "pay_0013", "householdId": "hh_001", "userId": "usr_001", "ownerName": "Sarah Namukasa",
  "subscriptionId": "sub_001", "plan": "monthly", "kind": "new | renewal",
  "amount": 15000, "currency": "UGX", "provider": "mtn | airtel", "msisdnMasked": "+25678•••696",
  "providerRef": "FLW-205907", "status": "pending | successful | failed | refunded",
  "failureReason": null, "createdAt": "…", "settledAt": null, "refundedAt": null, "refundReason": null
}
```

Never store the full number or a PIN. **User** (`users.json`) is one per account: `{ id, name, email, phone, signInMethod, householdId, householdRole, status: active | disabled | deleted, createdAt, lastActiveAt }`.

**Ad placement** (`ad_placements.json`): `{ id: today | meals | clean | shop, label, format: banner | native, enabled, admobAndroid, admobIos, adsenseSlot, frequencyCapPerDay }`. Never full screen or video (FR-AD-2). **Sponsored product** (`sponsored.json`): `{ id, brand, product, headline, image, link, screens, matchItems, startsAt, endsAt, active, views, taps }`. **Ad stats** (`ad_stats.json`): `{ source: "admob" | "demo", currency: "USD", rows: [{ date, placement, impressions, clicks, earningsUsd }] }`, filled by the server from the AdMob Reporting API.

**Trip** (Done shopping on Shop): `{ id, date, estimate, actual, items }`. `estimate` is what the ticked items came to on the price table, `actual` what was paid, both in the household's currency.

**Staff** (House Help, Pay): `{ id, name, role, salary, payday (1 to 31; later than the month's last day means the last day), startedOn, entries: [{ id, date, kind: pay | advance | deduction | bonus | leave, amount, days, note }] }`. `amount` for money entries, `days` for leave. What is still owed for a month is salary plus bonuses less advances, deductions and pay in that month; `src/ClientApp/lib/insights.js` (`payMonth`) is the reference. This is private to the household: never shown in the admin beyond counts.

**Activity log** (`audit_log.json`): `{ id, at, actorId, actorName, action, target, detail }`, written by the server, never edited.

## Uploads

`POST /admin/uploads`, multipart: `file` and `folder` (`recipes`, `sponsored`, `guides`, `content`). Answers `{ url, width, height }`. Photos arrive already resized to WebP (JPEG from Safari) at most 1600px wide; PDFs up to 20 MB. Store them in object storage behind a CDN and return the public address; the records keep only the address.

## Admin endpoints (moderator token, separate auth, PRD 7.2)

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/admin/auth/sign-in` | `{ email, password }` → `{ token, user }` |
| GET | `/admin/auth/me` | The signed in team member |
| GET | `/admin/overview` | Counts for the dashboard |
| GET, POST, PATCH, DELETE | `/admin/recipes[/:id]` | The library |
| GET | `/admin/recipe-suggestions` | Pending, approved and rejected |
| POST | `/admin/recipe-suggestions/:id/approve` | Body: the normalised recipe; publishes it |
| POST | `/admin/recipe-suggestions/:id/reject` | |
| GET, PATCH | `/admin/households[/:id]` | `households.json`; PATCH `{ tier, reason }` for support cases; the reason goes in the activity log |
| GET, PATCH | `/admin/users[/:id]` | `users.json`; PATCH `{ status: "active" \| "disabled", reason }` |
| GET | `/admin/subscriptions` | `subscriptions.json` |
| GET | `/admin/payments` | `payments.json`, newest first |
| POST | `/admin/payments/:id/refund` | `{ reason }`. Owner only; marks it refunded after the money is returned through the aggregator |
| GET, PATCH | `/admin/ads/placements[/:id]` | `ad_placements.json` |
| GET | `/admin/ads/stats?from=&to=` | `ad_stats.json`, dates as `YYYY-MM-DD` |
| GET, POST, PATCH, DELETE | `/admin/ads/sponsored[/:id]` | `sponsored.json` |
| GET, POST, PATCH, DELETE | `/admin/prices[/:id]` | `prices.json`, each with an `id` |
| GET, POST, PATCH, DELETE | `/admin/faqs[/:id]` | `faqs.json` |
| GET, POST, PATCH, DELETE | `/admin/premium-features[/:id]` | `premium_features.json` |
| GET, PATCH | `/admin/occasions[/:id]` | `occasions.json` |
| GET, POST, PATCH, DELETE | `/admin/zone-presets[/:id]` | `zone_presets.json` |
| GET, PATCH | `/admin/legal[/:id]` | The four documents served at `/legal/:id` |
| GET, PATCH | `/admin/support/reports[/:id]` | `support_reports.json`; PATCH `{ status: open \| answered \| closed }` |
| GET | `/admin/audit-log` | `audit_log.json` |
| POST | `/admin/uploads` | See Uploads |
| GET, POST, PATCH, DELETE | `/admin/house-help/guides[/:id]` | |
| GET, PUT | `/admin/house-help/questions` | The whole questionnaire |
| GET, POST, PATCH, DELETE | `/admin/nudges[/:id]` | |
| GET, PUT | `/admin/currencies` | PUT `{ rates }`; the server stamps `updatedAt` |
| GET, POST, PATCH, DELETE | `/admin/zone-templates[/:id]` | The zones a new household starts with |
| GET, POST, PATCH, DELETE | `/admin/team[/:id]` | Roles: owner, admin, moderator |
| GET, PUT | `/admin/settings` | The document the app reads at `/settings/app`, without `ads` and `sponsored` (those have their own endpoints) |

**Roles.** Owner: everything; only the owner refunds. Admin: everything else. Moderator: overview, suggestions, recipes, House Help, app content, prices and the support inbox.
