/* Admin Services */
import { http, tokenStore } from "./api/client";
import { routes } from "./api/routes";
import { crud } from "./crud";
import { db, newId, now, reply } from "./demo/db";
import { DEMO } from "./mode";

export const recipesApi = crud("recipes", routes.recipes, "rec");
export const householdsApi = crud("households", routes.households, "hh");
export const subscriptionsApi = crud("subscriptions", routes.subscriptions, "sub");
export const guidesApi = crud("guides", routes.guides, "guide");
export const nudgesApi = crud("nudges", routes.nudges, "nudge");
export const zoneTemplatesApi = crud("zoneTemplates", routes.zoneTemplates, "zone");
export const teamApi = crud("team", routes.team, "team");
export const usersApi = crud("users", routes.users, "usr");
export const sponsoredApi = crud("sponsored", routes.sponsored, "spon");
export const pricesApi = crud("prices", routes.prices, "price");
export const faqsApi = crud("faqs", routes.faqs, "faq");
export const premiumFeaturesApi = crud("premiumFeatures", routes.premiumFeatures, "feat");
export const occasionsApi = crud("occasions", routes.occasions, "occ");
export const zonePresetsApi = crud("zonePresets", routes.zonePresets, "preset");
export const legalApi = crud("legal", routes.legal, "legal");
export const supportApi = crud("supportReports", routes.support, "rep");
export const adPlacementsApi = crud("adPlacements", routes.adPlacements, "ad");

/**
 * Who did what, for the Activity log. The API writes these itself from the
 * signed-in moderator; on demo data the services below add them.
 */
function logAction(action, target, detail = "") {
  if (!DEMO) return;
  const actor = db.get("team").find((m) => `demo:${m.id}` === tokenStore.get());
  db.set("auditLog", [
    { id: newId("log"), at: now(), actorId: actor?.id ?? null, actorName: actor?.name ?? "Someone", action, target, detail },
    ...db.get("auditLog"),
  ]);
}

export const auditApi = {
  list: () => (DEMO ? reply(db.get("auditLog")) : http(routes.audit)),
};

/** Payments as the mobile money aggregator reported them. Refunds are owner only. */
export const paymentsApi = {
  list: () => (DEMO ? reply(db.get("payments")) : http(routes.payments)),
  refund(id, reason) {
    if (!DEMO) return http(`${routes.payments}/${id}/refund`, { method: "POST", body: { reason } });
    const next = db.get("payments").map((p) => (p.id === id ? { ...p, status: "refunded", refundReason: reason, refundedAt: now() } : p));
    db.set("payments", next);
    const p = next.find((x) => x.id === id);
    logAction("payment.refund", p.providerRef, reason);
    return reply(p);
  },
};

/**
 * Ad performance per day and placement. The API fills it from the AdMob
 * Reporting API (and AdSense for the web app); until AdMob is connected,
 * `source` is "demo" and the page says so.
 */
export const adStatsApi = {
  get: ({ from, to } = {}) => {
    if (!DEMO) return http(`${routes.adStats}?${new URLSearchParams({ ...(from && { from }), ...(to && { to }) })}`);
    // Example figures are moved so the newest is always yesterday, whenever the demo is opened.
    const all = db.get("adStats");
    const newest = all.rows.reduce((m, r) => (r.date > m ? r.date : m), "");
    const shift = newest ? Date.parse(new Date(Date.now() - 864e5).toISOString().slice(0, 10)) - Date.parse(newest) : 0;
    const rows = all.rows
      .map((r) => ({ ...r, date: new Date(Date.parse(r.date) + shift).toISOString().slice(0, 10) }))
      .filter((r) => (!from || r.date >= from) && (!to || r.date <= to));
    return reply({ ...all, rows });
  },
};

/** Premium by hand, for support cases: the reason goes in the Activity log. */
export async function setHouseholdTier(id, tier, reason) {
  if (!DEMO) return http(`${routes.households}/${id}`, { method: "PATCH", body: { tier, reason } });
  const h = await householdsApi.update(id, { tier });
  logAction("household.premium", h.owner.name, `${tier === "premium" ? "Gave Premium" : "Moved to free"}: ${reason}`);
  return h;
}

/** Turn an account off (it can no longer sign in) or back on. */
export async function setUserStatus(id, status, reason) {
  if (!DEMO) return http(`${routes.users}/${id}`, { method: "PATCH", body: { status, reason } });
  const u = await usersApi.update(id, { status });
  logAction(status === "disabled" ? "user.disable" : "user.enable", u.name, reason);
  return u;
}

/** Recipe suggestions: approving publishes the normalised recipe (PRD 13.2). */
export const suggestionsApi = {
  list: () => (DEMO ? reply(db.get("suggestions")) : http(routes.suggestions)),
  async approve(id, recipe) {
    if (!DEMO) return http(`${routes.suggestions}/${id}/approve`, { method: "POST", body: recipe });
    const published = { ...recipe, id: newId("rec"), status: "published", createdAt: now() };
    db.set("recipes", [published, ...db.get("recipes")]);
    logAction("recipe.publish", published.name, "Published from a suggestion");
    db.set(
      "suggestions",
      db.get("suggestions").map((s) => (s.id === id ? { ...s, status: "approved", publishedRecipeId: published.id, reviewedAt: now() } : s)),
    );
    return reply(published);
  },
  reject(id) {
    if (!DEMO) return http(`${routes.suggestions}/${id}/reject`, { method: "POST" });
    db.set("suggestions", db.get("suggestions").map((s) => (s.id === id ? { ...s, status: "rejected", reviewedAt: now() } : s)));
    return reply(null);
  },
};

/** House Help questionnaire: the questions and the weight of every answer. */
export const questionsApi = {
  list: () => (DEMO ? reply(db.get("questions")) : http(routes.questions)),
  save(questions) {
    if (!DEMO) return http(routes.questions, { method: "PUT", body: questions });
    return reply(db.set("questions", questions));
  },
};

/** The fixed exchange rate table (FR-CC-3); saving stamps "last updated". */
export const currenciesApi = {
  get: () => (DEMO ? reply(db.get("currencies")) : http(routes.currencies)),
  save(rates) {
    if (!DEMO) return http(routes.currencies, { method: "PUT", body: { rates } });
    return reply(db.set("currencies", { ...db.get("currencies"), rates, updatedAt: now() }));
  },
};

export const settingsApi = {
  get: () => (DEMO ? reply(db.get("settings")) : http(routes.settings)),
  save(settings) {
    if (!DEMO) return http(routes.settings, { method: "PUT", body: settings });
    logAction("settings.update", "Settings");
    return reply(db.set("settings", settings));
  },
};

/** The figures on the Overview, worked out from the records. */
export const overviewApi = {
  get() {
    if (!DEMO) return http(routes.overview);
    const households = db.get("households");
    const subs = db.get("subscriptions");
    const users = db.get("users");
    const paid = db.get("payments").filter((p) => p.status === "successful");
    const recipes = db.get("recipes");
    const weekAgo = Date.now() - 7 * 864e5;
    const month = new Date().toISOString().slice(0, 7);
    const ads = db.get("adStats").rows; // all 30 example days
    // The last 30 days, one point a day: sign ups and money in.
    const days = Array.from({ length: 30 }, (_, i) => new Date(Date.now() - (29 - i) * 864e5).toISOString().slice(0, 10));
    const daily = days.map((d) => ({
      date: d,
      signups: users.filter((u) => u.createdAt.slice(0, 10) === d).length,
      revenue: paid.filter((p) => p.createdAt.slice(0, 10) === d).reduce((n, p) => n + p.amount, 0),
    }));
    return reply({
      users: users.filter((u) => u.status !== "deleted").length,
      newUsersThisWeek: users.filter((u) => Date.parse(u.createdAt) > weekAgo).length,
      revenueThisMonth: paid.filter((p) => p.createdAt.startsWith(month)).reduce((n, p) => n + p.amount, 0),
      failedPayments: db.get("payments").filter((p) => p.status === "failed" && Date.parse(p.createdAt) > weekAgo).length,
      adEarnings30: Math.round(ads.reduce((n, r) => n + r.earningsUsd, 0) * 100) / 100,
      adSource: db.get("adStats").source,
      missingPhotos: recipes.filter((r) => r.status === "published" && !r.photo?.url).length,
      openReports: db.get("supportReports").filter((r) => r.status === "open").length,
      daily,
      households: households.length,
      newThisWeek: households.filter((h) => Date.parse(h.createdAt) > weekAgo).length,
      premium: households.filter((h) => h.tier === "premium").length,
      activeSubscriptions: subs.filter((s) => s.status === "active").length,
      pastDue: subs.filter((s) => s.status === "past_due").length,
      cancelled: subs.filter((s) => s.status === "cancelled").length,
      monthly: subs.filter((s) => s.status === "active" && s.plan === "monthly").length,
      yearly: subs.filter((s) => s.status === "active" && s.plan === "yearly").length,
      pendingSuggestions: db.get("suggestions").filter((s) => s.status === "pending").length,
      recipes: recipes.filter((r) => r.status === "published").length,
      premiumRecipes: recipes.filter((r) => r.status === "published" && r.isPremium).length,
      byType: ["family", "couple", "single_parent", "bachelor"].map((t) => ({ type: t, count: households.filter((h) => h.type === t).length })),
      settings: db.get("settings"),
    });
  },
};

/** Moderator sign in. Demo: any team email with the demo password. */
export const DEMO_PASSWORD = "domease-demo";
export const authApi = {
  async signIn(email, password) {
    if (!DEMO) {
      const res = await http(routes.auth.signIn, { method: "POST", body: { email, password } });
      tokenStore.set(res.token);
      return res.user;
    }
    const user = db.get("team").find((m) => m.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || password !== DEMO_PASSWORD) throw new Error("That email and password do not match a team member.");
    tokenStore.set(`demo:${user.id}`);
    return reply(user);
  },
  async me() {
    const token = tokenStore.get();
    if (!token) return null;
    if (!DEMO) return http(routes.auth.me).catch(() => null);
    return reply(db.get("team").find((m) => `demo:${m.id}` === token) ?? null, 0);
  },
  signOut: () => tokenStore.set(null),
};

export const resetDemo = () => db.reset();
