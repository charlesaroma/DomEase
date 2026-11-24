/* API Routes */
// Every admin endpoint the Node.js API exposes (docs/05-api-contract.md).
export const routes = {
  auth: { signIn: "/admin/auth/sign-in", me: "/admin/auth/me" },
  overview: "/admin/overview",
  recipes: "/admin/recipes",
  suggestions: "/admin/recipe-suggestions",
  households: "/admin/households",
  subscriptions: "/admin/subscriptions",
  guides: "/admin/house-help/guides",
  questions: "/admin/house-help/questions",
  nudges: "/admin/nudges",
  currencies: "/admin/currencies",
  zoneTemplates: "/admin/zone-templates",
  team: "/admin/team",
  settings: "/admin/settings",
};
