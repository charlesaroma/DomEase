/* Legal documents: the same JSON the app ships in assets/legal/ and the API serves at /legal/:id */
import health from "./health.json";
import premium from "./premium.json";
import privacy from "./privacy.json";
import terms from "./terms.json";

// Public paths, as linked from the stores and the footer.
export const legalPages = [
  { path: "terms", doc: terms },
  { path: "privacy", doc: privacy },
  { path: "premium-terms", doc: premium },
  { path: "health-notice", doc: health },
];
