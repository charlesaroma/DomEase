/* Demo Database */
import currencies from "@/data/seed/currencies.json";
import guides from "@/data/seed/house_help_guides.json";
import households from "@/data/seed/households.json";
import nudges from "@/data/seed/nudges.json";
import prices from "@/data/seed/prices.json";
import suggestions from "@/data/seed/recipe_suggestions.json";
import recipes from "@/data/seed/recipes.json";
import settings from "@/data/seed/settings.json";
import subscriptions from "@/data/seed/subscriptions.json";
import team from "@/data/seed/team.json";
import questions from "@/data/seed/vetting_questions.json";
import zoneTemplates from "@/data/seed/zone_templates.json";

/**
 * The admin's demo backend: the seed data in memory, saved to this browser so
 * edits survive a reload. It behaves like the API (ids, timestamps, a short
 * delay) so the pages are written once and work against either.
 */
const KEY = "domease:admin:demo:v1";
const SEED = {
  currencies,
  guides,
  households,
  nudges,
  prices,
  suggestions,
  recipes,
  settings,
  subscriptions,
  team,
  questions,
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
