/* Recipe Helpers */

/** An empty recipe in the structured format (PRD section 9, Recipe). */
export const blankRecipe = () => ({
  name: "",
  mealType: "dinner",
  cuisine: "Ugandan",
  servings: 4,
  prepMinutes: 10,
  cookMinutes: 30,
  ageGroups: ["kids", "adults", "elderly"],
  benefits: [],
  dietary: [],
  occasions: [],
  vegForward: false,
  isPremium: false,
  status: "draft",
  photo: null,
  gallery: [],
  ingredients: [{ amount: 1, unit: "pcs", name: "" }],
  steps: [""],
});

export const blankVariant = () => ({ isPremium: true, summary: "", ingredients: [{ amount: 1, unit: "pcs", name: "" }], steps: [""] });

export const UNITS = ["g", "kg", "ml", "l", "pcs", "tsp", "tbsp", "bunch", "cup"].map((u) => ({ id: u, label: u }));

/** Trim a list of ingredients: drop empty rows, numbers as numbers. */
export const cleanIngredients = (list = []) =>
  list
    .filter((g) => g.name?.trim())
    .map((g) => ({ ...g, amount: Number(g.amount) || 1, name: g.name.trim(), substitute: g.substitute?.trim() || undefined }));

export const cleanSteps = (list = []) => list.map((s) => s.trim()).filter(Boolean);

/** What is still missing before a recipe can go live. */
export function recipeGaps(r) {
  const gaps = [];
  if (!r.name?.trim()) gaps.push("a name");
  if (!r.ingredients?.some((g) => g.name?.trim())) gaps.push("ingredients");
  if (!r.steps?.some((s) => s.trim())) gaps.push("a method");
  return gaps;
}
