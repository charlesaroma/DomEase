/* Demo Database */
import health from "@/data/legal/health.json";
import premiumTerms from "@/data/legal/premium.json";
import privacy from "@/data/legal/privacy.json";
import terms from "@/data/legal/terms.json";
import adPlacements from "@/data/seed/ad_placements.json";
import adStats from "@/data/seed/ad_stats.json";
import auditLog from "@/data/seed/audit_log.json";
import currencies from "@/data/seed/currencies.json";
import faqs from "@/data/seed/faqs.json";
import guides from "@/data/seed/house_help_guides.json";
import households from "@/data/seed/households.json";
import nudges from "@/data/seed/nudges.json";
import occasions from "@/data/seed/occasions.json";
import payments from "@/data/seed/payments.json";
import premiumFeatures from "@/data/seed/premium_features.json";
import prices from "@/data/seed/prices.json";
import suggestions from "@/data/seed/recipe_suggestions.json";
import recipes from "@/data/seed/recipes.json";
import settings from "@/data/seed/settings.json";
import sponsored from "@/data/seed/sponsored.json";
import subscriptions from "@/data/seed/subscriptions.json";
import supportReports from "@/data/seed/support_reports.json";
import team from "@/data/seed/team.json";
import users from "@/data/seed/users.json";
import questions from "@/data/seed/vetting_questions.json";
import zonePresets from "@/data/seed/zone_presets.json";
import zoneTemplates from "@/data/seed/zone_templates.json";

/**
 * The admin's demo backend: the seed data in memory, saved to this browser so
 * edits survive a reload. It behaves like the API (ids, timestamps, a short
 * delay) so the pages are written once and work against either.
 */
// v2: recipe photos and Premium flags, payments, users, ads and app content.
const KEY = "domease:admin:demo:v2";
const SEED = {
  adPlacements,
  adStats,
  auditLog,
  currencies,
  faqs,
  guides,
  households,
  legal: [terms, privacy, premiumTerms, health],
  nudges,
  occasions,
  payments,
  premiumFeatures,
  prices: prices.map((p, i) => ({ id: `price_${i + 1}`, ...p })),
  suggestions,
  recipes,
  settings,
  sponsored,
  subscriptions,
  supportReports,
  team,
  users,
  questions,
  zonePresets,
  zoneTemplates,
};

const clone = (v) => JSON.parse(JSON.stringify(v));

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (saved) return { ...clone(SEED), ...saved };
  } catch {
    /* storage unavailable: start from the seed */
  }
  return clone(SEED);
}

let state = load();
// Saved data from the first demo version is left behind, so the new seeds load.
try {
  localStorage.removeItem("domease:admin:demo:v1");
} catch {
  /* nothing to tidy */
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: the edits last until the tab closes */
  }
}

/** Wait a moment, as a network call would, then return a copy. */
export const reply = (value, ms = 180) => new Promise((resolve) => setTimeout(() => resolve(clone(value)), ms));

export const db = {
  get: (name) => state[name],
  set(name, value) {
    state = { ...state, [name]: value };
    persist();
    return value;
  },
  reset() {
    state = clone(SEED);
    persist();
  },
};

export const newId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
export const now = () => new Date().toISOString();
