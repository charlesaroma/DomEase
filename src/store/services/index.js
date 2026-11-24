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

/** Recipe suggestions: approving publishes the normalised recipe (PRD 13.2). */
export const suggestionsApi = {
  list: () => (DEMO ? reply(db.get("suggestions")) : http(routes.suggestions)),
  async approve(id, recipe) {
    if (!DEMO) return http(`${routes.suggestions}/${id}/approve`, { method: "POST", body: recipe });
    const published = { ...recipe, id: newId("rec"), status: "published", createdAt: now() };
    db.set("recipes", [published, ...db.get("recipes")]);
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
    return reply(db.set("settings", settings));
  },
};

/** The figures on the Overview, worked out from the records. */
export const overviewApi = {
  get() {
    if (!DEMO) return http(routes.overview);
    const households = db.get("households");
    const subs = db.get("subscriptions");
    const weekAgo = Date.now() - 7 * 864e5;
    return reply({
      households: households.length,
      newThisWeek: households.filter((h) => Date.parse(h.createdAt) > weekAgo).length,
      premium: households.filter((h) => h.tier === "premium").length,
      activeSubscriptions: subs.filter((s) => s.status === "active").length,
      pastDue: subs.filter((s) => s.status === "past_due").length,
      cancelled: subs.filter((s) => s.status === "cancelled").length,
      monthly: subs.filter((s) => s.status === "active" && s.plan === "monthly").length,
      yearly: subs.filter((s) => s.status === "active" && s.plan === "yearly").length,
      pendingSuggestions: db.get("suggestions").filter((s) => s.status === "pending").length,
      recipes: db.get("recipes").filter((r) => r.status === "published").length,
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
