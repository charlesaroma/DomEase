# 03: Data Layer

**Rule:** pages never call `fetch`. They use the hooks in `src/store/queries/`, which call the services in `src/store/services/`, which talk to either the demo database or the API.

```text
page ──▶ store/queries/admin.js (TanStack Query hooks)
             ──▶ store/services/index.js (one object per area: recipesApi, suggestionsApi…)
                     ├─ demo: store/services/demo/db.js  (src/data/seed, saved in this browser)
                     └─ API:  store/services/api/client.js → VITE_API_URL/api/v1 (docs/05-api-contract.md)
```

- **One switch.** With `VITE_API_URL` empty (`.env.example`), everything runs on demo data. Set it and every service talks to the Node.js API. No page changes.
- **The seed is the contract.** `src/data/seed/*.json` is the exact JSON the API will send. The mobile app ships the same files in `assets/demo/`.
- **Demo data persists** in this browser (`localStorage`, key `domease:admin:demo:v1`). The Reset button in the admin header puts it back to the seed.
- **Writes refresh what they touch.** Every mutation hook invalidates its own list and the Overview, so sidebar counts stay true.
- **Plain collections** (recipes, households, guides, nudges, team) go through `crud()` in `store/services/crud.js`. Anything with its own rules (approving a suggestion, saving rates) has its own function in `store/services/index.js`.
