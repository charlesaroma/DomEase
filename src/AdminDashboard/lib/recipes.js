/* Recipe Helpers */

/** An empty recipe in the structured format (PRD section 9, Recipe). */
export const blankRecipe = () => ({
  name: "",
  mealType: "dinner",
  cuisine: "Ugandan",
  servings: 4,
  ageGroups: ["kids", "adults", "elderly"],
  benefits: [],
  dietary: [],
  occasions: [],
  vegForward: false,
  ingredients: [{ amount: 1, unit: "pcs", name: "" }],
  steps: [""],
});

