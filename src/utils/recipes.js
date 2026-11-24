/* Recipe Maths */
// Ported from the app's domain/use_cases/scale_recipe.dart, so the web app,
// the admin preview and the phone show the same amounts.

const COUNTABLE = new Set(["pcs", "bunch", "tsp", "tbsp", "cup"]);

/** Ingredients sized for `people`, metric only: 1000 g or more becomes kg, 1000 ml becomes l. */
export function scaleIngredients(recipe, people) {
  const from = Number(recipe.servings) || 0;
  const factor = from <= 0 ? 1 : (Number(people) || from) / from;
  return (recipe.ingredients ?? []).map((g) => {
    const amount = (Number(g.amount) || 0) * factor;
    if (g.unit === "g" && amount >= 1000) return { ...g, amount: amount / 1000, unit: "kg" };
    if (g.unit === "ml" && amount >= 1000) return { ...g, amount: amount / 1000, unit: "l" };
    return { ...g, amount };
  });
}

/** "1.5 kg", "300 g", "2 pcs": whole numbers stay whole, the rest one decimal; counted things to the half. */
export function formatAmount({ amount, unit }) {
  const a = COUNTABLE.has(unit) ? Math.round(amount * 2) / 2 : amount;
  const n = a === Math.round(a) ? a.toFixed(0) : a.toFixed(1);
  return `${n} ${unit}`;
}

export const totalMinutes = (r) => (Number(r.prepMinutes) || 0) + (Number(r.cookMinutes) || 0);

export const AGE_LABEL = { kids: "Kids", adults: "Adults", elderly: "Elders" };
export const MEAL_LABEL = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack", pastry: "Pastry" };
