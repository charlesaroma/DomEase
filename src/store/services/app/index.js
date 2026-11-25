/* App Services */
// What the web app reads and writes, as the mobile app does: the household's
// own data under /households/me, and the content the admin manages. On demo
// data the household lives in demo/home.js and content comes from the admin's
// demo database, so what the admin publishes is what the web app shows, and
// what a household sends (a payment, a suggestion, a report) reaches the admin.
import { planAll, scoreCandidate } from "@/ClientApp/lib/home";

import { http, makeTokenStore } from "../api/client";
import { db, newId, now, reply } from "../demo/db";
import { home } from "../demo/home";
import { DEMO } from "../mode";
import { appRoutes as R } from "./routes";

export const appToken = makeTokenStore("domease:app:token", "local");
const api = (path, opts = {}) => http(path, { ...opts, auth: appToken });

export const DEMO_EMAIL = "you@domease.app";
export const DEMO_PASSWORD = "domease-demo";
export const DEMO_INVITE = "DOM123";

// ── Demo helpers ──────────────────────────────────────────────

const me = () => home.get().accounts.find((a) => `demo:${a.id}` === appToken.get()) ?? null;
const myHome = () => {
  const a = me();
  return a?.householdId ? home.get().homes[a.householdId] : null;
};
const withHome = (fn) => {
  const id = me()?.householdId;
  if (!id) throw new Error("Set up your home first.");
  home.update((s) => (fn(s.homes[id]), s));
  return home.get().homes[id];
};
const publicUser = (a) => a && { id: a.id, name: a.name, email: a.email, phone: a.phone ?? null, householdId: a.householdId ?? null };
const publicHome = (h) => h && { ...h.household, inviteCode: h.inviteCode };

/** A new home's zones, from the admin's starting zones. */
const startingZones = () =>
  [...db.get("zoneTemplates")]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((z) => ({
      id: newId("zone"),
      name: z.name,
      assignee: null,
      streak: 0,
      tasks: z.tasks.map((t) => ({ ...t, id: newId("task"), done: false })),
      consumables: z.consumables.map((c) => ({ ...c, id: newId("sup"), low: false })),
    }));

function createHome(account, answers) {
  const settings = db.get("settings");
  const trialDays = Number(settings.trialDays) || 0;
  const id = newId("hh");
  const household = {
    id,
    name: answers.name?.trim() || `${account.name.split(" ")[0]}'s home`,
    type: answers.type,
    size: answers.size,
    currency: answers.currency,
    tier: trialDays ? "premium" : "free",
    trialEndsAt: trialDays ? new Date(Date.now() + trialDays * 864e5).toISOString() : null,
    goals: answers.goals ?? [],
    mealFocus: answers.mealFocus ?? [],
    diet: answers.diet ?? "none",
    members: answers.members ?? [{ id: newId("m"), name: account.name, role: "owner", ageGroup: "adults", allergies: [] }],
    createdAt: now(),
  };
  home.update((s) => {
    s.homes[id] = { household, inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(), plan: null, zones: startingZones(), shopping: { checked: [], manual: [] }, favourites: [] };
    s.accounts.find((a) => a.id === account.id).householdId = id;
    return s;
  });
  // The admin sees the new home, as it would on the server.
  db.set("households", [
    {
      id,
      owner: { name: account.name, phone: account.phone ?? "", email: account.email },
      type: household.type,
      size: household.size,
      currency: household.currency,
      region: "Kampala",
      tier: household.tier,
      members: household.members.length,
      zones: home.get().homes[id].zones.length,
      mealsPlannedThisWeek: 0,
      lastActiveAt: now(),
      createdAt: now(),
    },
    ...db.get("households"),
  ]);
  db.set("users", db.get("users").map((u) => (u.id === account.id ? { ...u, householdId: id, householdRole: "owner" } : u)));
  return household;
}

function addAccount({ name, email, password, phone = null }) {
  const account = { id: newId("usr"), name: name.trim(), email: email.trim().toLowerCase(), password, phone, householdId: null, createdAt: now() };
  home.update((s) => (s.accounts.push(account), s));
  db.set("users", [
    { id: account.id, name: account.name, email: account.email, phone, signInMethod: "email", householdId: null, householdRole: null, status: "active", createdAt: now(), lastActiveAt: now() },
    ...db.get("users"),
  ]);
  return account;
}

// ── Sign in ───────────────────────────────────────────────────

export const appAuthApi = {
  async signIn(email, password) {
    if (!DEMO) {
      const res = await api(R.auth.signIn, { method: "POST", body: { email, password } });
      appToken.set(res.token);
      return res.user;
    }
    let a = home.get().accounts.find((x) => x.email === email.trim().toLowerCase());
    // The demo household signs in with the demo password, set up on first use.
    if (!a && email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) a = demoHousehold();
    const disabled = a && db.get("users").find((u) => u.id === a.id)?.status === "disabled";
    if (!a || a.password !== password) throw new Error("That email and password don't match an account.");
    if (disabled) throw new Error("This account has been turned off. Write to us if you think that's a mistake.");
    appToken.set(`demo:${a.id}`);
    return reply(publicUser(a));
  },
  async signUp({ name, email, password }) {
    if (!DEMO) {
      const res = await api(R.auth.signUp, { method: "POST", body: { name, email, password } });
      appToken.set(res.token);
      return res.user;
    }
    if (home.get().accounts.some((x) => x.email === email.trim().toLowerCase())) throw new Error("There is already an account with that email. Sign in instead.");
    const a = addAccount({ name, email, password });
    appToken.set(`demo:${a.id}`);
    return reply(publicUser(a));
  },
  forgot: (email) => (DEMO ? reply({ sent: true }, 400) : api(R.auth.forgot, { method: "POST", body: { email } })),
  async me() {
    if (!appToken.get()) return null;
    if (!DEMO) return api(R.me).catch(() => null);
    return reply(publicUser(me()), 0);
  },
  updateMe(patch) {
    if (!DEMO) return api(R.me, { method: "PATCH", body: patch });
    home.update((s) => (Object.assign(s.accounts.find((a) => a.id === me().id), patch), s));
    return reply(publicUser(me()));
  },
  async deleteMe() {
    if (!DEMO) return api(R.me, { method: "DELETE" });
    const a = me();
    home.update((s) => {
      s.accounts = s.accounts.filter((x) => x.id !== a.id);
      if (a.householdId && s.homes[a.householdId]?.household.members.find((m) => m.role === "owner")?.name === a.name) delete s.homes[a.householdId];
      return s;
    });
    db.set("users", db.get("users").map((u) => (u.id === a.id ? { ...u, status: "deleted" } : u)));
    appToken.set(null);
    return reply(null);
  },
  signOut: () => appToken.set(null),
};

/** The demo family from the app's assets/demo/household.json, set up on first sign in. */
function demoHousehold() {
  const a = addAccount({ name: "Demo household", email: DEMO_EMAIL, password: DEMO_PASSWORD, phone: "+256 700 000 000" });
  createHome(a, {
    name: "Our home",
    type: "family",
    size: 4,
    currency: "UGX",
    goals: ["plan_ahead", "one_list"],
    mealFocus: ["breakfast", "dinner"],
    diet: "none",
    members: [
      { id: "m1", name: "You", role: "owner", ageGroup: "adults", allergies: [] },
      { id: "m2", name: "Joy", role: "member", ageGroup: "adults", allergies: [] },
      { id: "m3", name: "Tendo", role: "member", ageGroup: "kids", allergies: ["Groundnuts"] },
      { id: "m4", name: "Grace", role: "house_help", ageGroup: "adults", allergies: [] },
    ],
  });
  const h = myHomeOf(a.id);
  home.update((s) => {
    const z = s.homes[h].zones;
    if (z[0]) z[0].assignee = "Grace";
    if (z[1]) z[1].assignee = "Joy";
    if (z[0]?.consumables[0]) z[0].consumables[0].low = true;
    s.homes[h].inviteCode = DEMO_INVITE;
    return s;
  });
  return home.get().accounts.find((x) => x.id === a.id);
}
/**
 * The demo home's history, so budget, trends and pay have something to show:
 * twelve weeks of market trips, four past weeks of meals, and Grace's pay.
 * Added once, also to a demo home made before these existed.
 */
function demoExtras() {
  const a = me();
  const h = myHome();
  if (a?.email !== DEMO_EMAIL || !h || h.extras) return;
  const day = (n) => new Date(Date.now() - n * 864e5).toISOString();
  const onDay = (monthsAgo, date) => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() - monthsAgo, date, 10).toISOString();
  };
  const recipes = db.get("recipes").filter((r) => r.status === "published");
  withHome((x) => {
    x.extras = 1;
    x.budget = {
      monthly: 650000,
      trips: Array.from({ length: 12 }, (_, i) => {
        const estimate = 118000 + ((i * 7919) % 41) * 1000;
        return { id: newId("trip"), date: day(i * 7 + 2), estimate, actual: Math.round((estimate * (94 + ((i * 37) % 17))) / 100 / 500) * 500, items: 14 + (i % 6) };
      }),
    };
    x.planHistory = [4, 3, 2, 1].map((w) => ({ weekOf: day(w * 7), days: planAll(recipes, { seed: 1000 + w, premium: false, allergies: [] }) }));
    x.staff = [
      {
        id: newId("staff"),
        name: "Grace",
        role: "House help",
        salary: 250000,
        payday: 28,
        startedOn: onDay(8, 1),
        entries: [
          { id: newId("pay"), date: onDay(2, 28), kind: "pay", amount: 250000, note: "" },
          { id: newId("pay"), date: onDay(1, 12), kind: "leave", days: 2, note: "Visiting family in Masaka" },
          { id: newId("pay"), date: onDay(1, 18), kind: "advance", amount: 40000, note: "School fees" },
          { id: newId("pay"), date: onDay(1, 28), kind: "pay", amount: 210000, note: "" },
          { id: newId("pay"), date: onDay(0, 6), kind: "advance", amount: 50000, note: "Transport home" },
        ],
      },
    ];
  });
}

const myHomeOf = (accountId) => home.get().accounts.find((a) => a.id === accountId)?.householdId;

// ── The household ─────────────────────────────────────────────

export const householdApi = {
  get: () => (DEMO ? reply(publicHome(myHome()) ?? null) : api(R.household).catch((e) => (e.status === 404 ? null : Promise.reject(e)))),
  create(answers) {
    if (!DEMO) return api(R.household, { method: "POST", body: answers });
    return reply(createHome(me(), answers));
  },
  update(patch) {
    if (!DEMO) return api(R.household, { method: "PUT", body: patch });
    const h = withHome((x) => Object.assign(x.household, patch));
    db.set("households", db.get("households").map((x) => (x.id === h.household.id ? { ...x, size: h.household.size, currency: h.household.currency, type: h.household.type } : x)));
    return reply(publicHome(h));
  },
  join(code) {
    if (!DEMO) return api(R.join, { method: "POST", body: { code } });
    const entry = Object.values(home.get().homes).find((h) => h.inviteCode === code.trim().toUpperCase());
    if (!entry) return Promise.reject(new Error("That code doesn't match a home. Check it with whoever shared it."));
    if (entry.household.tier !== "premium") return Promise.reject(new Error("Sharing a home comes with Premium. Ask the owner to upgrade."));
    const a = me();
    home.update((s) => {
      s.accounts.find((x) => x.id === a.id).householdId = entry.household.id;
      s.homes[entry.household.id].household.members.push({ id: newId("m"), name: a.name, role: "member", ageGroup: "adults", allergies: [] });
      return s;
    });
    return reply(publicHome(myHome()));
  },
  leave() {
    if (!DEMO) return api(R.leave, { method: "POST" });
    home.update((s) => ((s.accounts.find((x) => x.id === me().id).householdId = null), s));
    return reply(null);
  },
  /** Premium by mobile money: the aggregator sends a prompt to the phone; the server decides the plan once paid. */
  async checkout({ plan, provider, phone }) {
    if (!DEMO) return api(R.checkout, { method: "POST", body: { plan, provider, phone } });
    const h = myHome().household;
    const a = me();
    const settings = db.get("settings");
    const amount = settings.premium?.[plan === "yearly" ? "yearlyPrice" : "monthlyPrice"] ?? (plan === "yearly" ? 150000 : 15000);
    const subId = newId("sub");
    const ref = `FLW-${Math.floor(100000 + Math.random() * 900000)}`;
    const digits = phone.replace(/\s/g, "");
    db.set("subscriptions", [
      {
        id: subId,
        householdId: h.id,
        ownerName: a.name,
        plan,
        status: "active",
        provider: provider === "mtn" ? "MTN Mobile Money" : "Airtel Money",
        providerRef: ref,
        startedAt: now(),
        renewsAt: new Date(Date.now() + (plan === "yearly" ? 365 : 30) * 864e5).toISOString(),
      },
      ...db.get("subscriptions"),
    ]);
    db.set("payments", [
      {
        id: newId("pay"),
        householdId: h.id,
        userId: a.id,
        ownerName: a.name,
        subscriptionId: subId,
        plan,
        kind: "new",
        amount,
        currency: "UGX",
        provider,
        msisdnMasked: `${digits.slice(0, 6)}•••${digits.slice(-3)}`,
        providerRef: ref,
        status: "successful",
        failureReason: null,
        createdAt: now(),
        settledAt: now(),
      },
      ...db.get("payments"),
    ]);
    db.set("households", db.get("households").map((x) => (x.id === h.id ? { ...x, tier: "premium" } : x)));
    const next = withHome((x) => Object.assign(x.household, { tier: "premium", trialEndsAt: null, plan }));
    return reply(publicHome(next), 2200); // the time it takes to approve a prompt
  },
};

// ── Meals, zones, shopping ────────────────────────────────────

export const planApi = {
  get: () => (DEMO ? reply(myHome()?.plan ?? null) : api(R.mealPlan)),
  save(plan) {
    if (!DEMO) return api(R.mealPlan, { method: "PUT", body: plan });
    // The week being replaced is kept (the last 12), for eating trends. The server does the same.
    return reply(
      withHome((x) => {
        if (x.plan?.days) x.planHistory = [...(x.planHistory ?? []), { weekOf: x.plan.createdAt, days: x.plan.days }].slice(-12);
        x.plan = plan;
      }).plan,
    );
  },
};

/** Past weeks, oldest first: [{ weekOf, days }]. */
export const planHistoryApi = {
  get: () => (DEMO ? (demoExtras(), reply(myHome()?.planHistory ?? [])) : api(R.planHistory)),
};

/** The food budget and market trips: { monthly, trips: [{ id, date, estimate, actual, items }] }. */
export const budgetApi = {
  get: () => (DEMO ? (demoExtras(), reply(myHome()?.budget ?? { monthly: null, trips: [] })) : api(R.budget)),
  save(budget) {
    if (!DEMO) return api(R.budget, { method: "PUT", body: budget });
    return reply(withHome((x) => (x.budget = budget)).budget, 60);
  },
};

/** Who helps at home and their pay: [{ id, name, role, salary, payday, startedOn, entries: [{ id, date, kind, amount, days, note }] }]. */
export const staffApi = {
  get: () => (DEMO ? (demoExtras(), reply(myHome()?.staff ?? [])) : api(R.staff)),
  save(staff) {
    if (!DEMO) return api(R.staff, { method: "PUT", body: staff });
    return reply(withHome((x) => (x.staff = staff)).staff, 60);
  },
};

export const zonesApi = {
  get: () => (DEMO ? reply(myHome()?.zones ?? []) : api(R.zones)),
  save(zones) {
    if (!DEMO) return api(R.zones, { method: "PUT", body: zones });
    return reply(withHome((x) => (x.zones = zones)).zones, 60);
  },
};

export const shoppingApi = {
  get: () => (DEMO ? reply(myHome()?.shopping ?? { checked: [], manual: [] }) : api(R.shopping)),
  save(state) {
    if (!DEMO) return api(R.shopping, { method: "PUT", body: state });
    return reply(withHome((x) => (x.shopping = state)).shopping, 60);
  },
};

export const favouritesApi = {
  get: () => (DEMO ? reply(myHome()?.favourites ?? []) : api(R.favourites)),
  save(ids) {
    if (!DEMO) return api(R.favourites, { method: "PUT", body: ids });
    return reply(withHome((x) => (x.favourites = ids)).favourites, 60);
  },
};

// ── Content the admin manages ─────────────────────────────────

const live = (rows, flag = "active") => rows.filter((r) => r[flag] !== false);
const read = (route, fromDb) => () => (DEMO ? reply(fromDb()) : api(route));

export const contentApi = {
  recipes: read(R.recipes, () => db.get("recipes").filter((r) => r.status === "published")),
  prices: read(R.prices, () => db.get("prices")),
  currencies: read(R.currencies, () => db.get("currencies")),
  nudges: read(R.nudges, () => live(db.get("nudges"))),
  faqs: read(R.faqs, () => live(db.get("faqs")).sort((a, b) => a.sortOrder - b.sortOrder)),
  premiumFeatures: read(R.premiumFeatures, () => live(db.get("premiumFeatures"), "shown").sort((a, b) => a.sortOrder - b.sortOrder)),
  occasions: read(R.occasions, () => live(db.get("occasions")).sort((a, b) => a.sortOrder - b.sortOrder)),
  zonePresets: read(R.zonePresets, () => [...db.get("zonePresets")].sort((a, b) => a.sortOrder - b.sortOrder)),
  questions: read(R.questions, () => db.get("questions")),
  guides: read(R.guides, () => db.get("guides")),
  /** Everything the app needs to know at start: prices, rules, maintenance, and where ads go. */
  settings: read(R.settings, () => {
    const s = db.get("settings");
    const t = Date.now();
    return {
      ...s,
      ads: db.get("adPlacements"),
      sponsored: db.get("sponsored").filter((x) => x.active && Date.parse(x.startsAt) <= t && Date.parse(x.endsAt) >= t),
    };
  }),
};

// ── Things a household sends ──────────────────────────────────

export const sendApi = {
  suggestion(data) {
    if (!DEMO) return api(R.suggestions, { method: "POST", body: data });
    db.set("suggestions", [{ id: newId("sug"), ...data, submittedBy: me()?.name ?? "A household", status: "pending", createdAt: now() }, ...db.get("suggestions")]);
    return reply({ ok: true });
  },
  report(data) {
    if (!DEMO) return api(R.support, { method: "POST", body: data });
    const a = me();
    db.set("supportReports", [{ id: newId("rep"), ...data, platform: "web", appVersion: "web", userId: a?.id, userName: a?.name, email: a?.email, status: "open", createdAt: now() }, ...db.get("supportReports")]);
    return reply({ ok: true });
  },
  score(answers) {
    if (!DEMO) return api(R.score, { method: "POST", body: { answers } });
    return reply(scoreCandidate(db.get("questions"), answers));
  },
  /** A sponsored product was seen or tapped (AdMob and AdSense count their own). */
  adEvent(sponsoredId, type) {
    if (!DEMO) return api(R.adEvents, { method: "POST", body: { sponsoredId, type, platform: "web" } }).catch(() => null);
    db.set("sponsored", db.get("sponsored").map((s) => (s.id === sponsoredId ? { ...s, [type === "tap" ? "taps" : "views"]: (s[type === "tap" ? "taps" : "views"] ?? 0) + 1 } : s)));
    return Promise.resolve(null);
  },
};
