/* Home Rules */
// The household's own logic, ported from the app's domain/use_cases so the web
// app and the phone agree: plan_week, build_shopping_list, convert_currency,
// score_candidate. Pure functions, no storage.

/** A small seeded random, so the same seed always gives the same week. */
function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack", "pastry"];
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Does a recipe use anything this household is allergic to? (Premium, FR-MP-11) */
export const containsAllergen = (recipe, allergies) =>
  allergies.length > 0 && recipe.ingredients.some((g) => allergies.some((a) => g.name.toLowerCase().includes(a.toLowerCase())));

/**
 * Seven days of one meal type (FR-MP-1). Occasion recipes never go in the
 * week; Premium recipes only for Premium homes; allergens filtered for
 * Premium homes. The pool is spread across the week before anything repeats.
 */
export function planWeek(recipes, type, { seed, premium, allergies = [] }) {
  const options = recipes
    .filter((r) => r.status === "published" && r.mealType === type && !r.occasions?.length && (premium || !r.isPremium))
    .filter((r) => !premium || !containsAllergen(r, allergies))
    .map((r) => r.id);
  const rand = seeded(seed + MEAL_ORDER.indexOf(type) * 7919);
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  if (!options.length) return [];
  return DAYS.map((_, d) => options[d % options.length]);
}

export const planAll = (recipes, opts) => Object.fromEntries(MEAL_ORDER.map((t) => [t, planWeek(recipes, t, opts)]));

/** Monday is 0. */
export const todayIndex = () => (new Date().getDay() + 6) % 7;

const itemId = (name) => `item_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;

/**
 * One list from the week's meals and the zones' low supplies, plus what the
 * household added by hand (FR-SL-1, FR-HM-4). Each item once, priced from the
 * market table; anything with no market price stays off the list.
 */
export function buildShoppingList({ plan, recipes, zones, prices, state }) {
  const priceOf = Object.fromEntries(prices.map((p) => [p.name.toLowerCase(), p]));
  const byId = Object.fromEntries(recipes.map((r) => [r.id, r]));
  const items = new Map();
  const add = (name, source, low = false) => {
    const p = priceOf[name.toLowerCase()];
    if (!p) return;
    const id = itemId(name);
    const was = items.get(id);
    items.set(id, { id, name: p.name, category: p.category, source: was?.source ?? source, quantity: p.pack, price: p.price, low: low || !!was?.low, checked: state.checked.includes(id) });
  };
  for (const ids of Object.values(plan ?? {})) for (const id of ids) for (const g of byId[id]?.ingredients ?? []) add(g.name, "meal");
  for (const z of zones) for (const c of z.consumables) if (c.low) add(c.name, "zone", true);
  const manual = state.manual.map((m) => ({ ...m, checked: state.checked.includes(m.id) }));
  return [...items.values(), ...manual].sort((a, b) => a.category.localeCompare(b.category));
}

export const estimateTotal = (items) => items.filter((i) => !i.checked).reduce((n, i) => n + (i.price ?? 0), 0);

/** Through the US dollar, with the fixed table (FR-CC-1, FR-CC-3). */
export function convert(amount, from, to, rates) {
  const r = Object.fromEntries(rates.map((x) => [x.code, x.perUsd]));
  if (!r[from] || !r[to]) return null;
  return (amount / r[from]) * r[to];
}

/** Shillings to the household's currency, for prices kept in UGX. */
export const fromUgx = (amount, currency, rates) => (currency === "UGX" ? amount : convert(amount, "UGX", currency, rates));

/** Each answer weighs 0 to 3; the score is the share of the best total; any answer of 1 or less is flagged (FR-HH-4). */
export function scoreCandidate(questions, answers) {
  let total = 0;
  const flags = [];
  const sections = {};
  for (const q of questions) {
    const i = answers[q.id];
    if (i == null || i < 0 || i >= q.options.length) continue;
    const w = q.options[i].weight;
    total += w;
    (sections[q.section] ??= []).push(w);
    if (w <= 1) flags.push(q.text);
  }
  const max = questions.length * 3;
  return {
    percent: max ? Math.round((total * 100) / max) : 0,
    flags,
    bySection: Object.fromEntries(Object.entries(sections).map(([k, ws]) => [k, Math.round((ws.reduce((a, b) => a + b, 0) * 100) / (ws.length * 3))])),
  };
}

/** Is a zone due today? Daily tasks always; weekly on its day; monthly on the 1st. */
export const isDue = (task, date = new Date()) => task.frequency === "daily" || (task.frequency === "weekly" && date.getDay() === 6) || (task.frequency === "monthly" && date.getDate() === 1);
