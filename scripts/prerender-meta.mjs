/* Prerender meta: one index.html per public page, with its own share card */
// Link previews (WhatsApp, Facebook, LinkedIn, X) do not run JavaScript, so a
// single-page app shows the home card for every link. After `vite build`, this
// writes dist/<page>/index.html with that page's title, description and card.
// Static hosts serve these files first and fall back to index.html for the rest.
//
// Share cards need absolute links, so the site address comes from the build:
// SITE_URL if set, else Netlify's own URL (set on every Netlify build), else
// domease.app. A card pointing at a domain that is not live shows no preview.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DEFAULT_SITE = "https://domease.app";
const SITE = (process.env.SITE_URL || process.env.URL || DEFAULT_SITE).replace(/\/+$/, "");
const PAGES = [
  { path: "terms", title: "Terms of Use", description: "How DomEase works for your home, in plain words.", image: "og-terms.png" },
  { path: "privacy", title: "Privacy Policy", description: "What DomEase collects, why, and the control you keep over it.", image: "og-privacy.png" },
  { path: "premium-terms", title: "Premium and payments", description: "Monthly or yearly, by MTN or Airtel Money. Stop any time.", image: "og-premium-terms.png" },
  { path: "health-notice", title: "Health and dietary notice", description: "Meal ideas are general guidance, not medical advice.", image: "og-health-notice.png" },
  { path: "delete-account", title: "Delete your account", description: "How to delete your DomEase account and what goes with it.", image: "og-delete-account.png" },
  { path: "brand", title: "Brand kit", description: "DomEase logo motion, share cards and icons.", image: "og-image.png", noindex: true },
  { path: "app", title: "Web app", description: "Your meals, cleaning and shopping list, in the browser.", image: "og-image.png" },
  { path: "app/sign-in", title: "Sign in", description: "Sign in to DomEase on the web. Same home, same lists as on your phone.", image: "og-image.png" },
  { path: "admin", title: "Admin", description: "The DomEase team dashboard.", image: "og-image.png", noindex: true },
  { path: "admin/login", title: "Admin sign in", description: "Sign in to the DomEase team dashboard.", image: "og-image.png", noindex: true },
];

// The home page itself is built with the default domain baked in; point it at SITE.
const html = readFileSync("dist/index.html", "utf8").replaceAll(DEFAULT_SITE, SITE);
writeFileSync("dist/index.html", html);
const set = (doc, pattern, value) => doc.replace(pattern, (_, before, after) => `${before}${value}${after}`);

for (const p of PAGES) {
  const title = `${p.title} | DomEase`;
  const url = `${SITE}/${p.path}`;
  const image = `${SITE}/${p.image}`;
  let doc = html;
  doc = set(doc, /(<title>)[^<]*(<\/title>)/, title);
  doc = set(doc, /(<meta name="description" content=")[^"]*(")/, p.description);
  doc = set(doc, /(<link rel="canonical" href=")[^"]*(")/, url);
  doc = set(doc, /(<meta property="og:title" content=")[^"]*(")/, title);
  doc = set(doc, /(<meta property="og:description" content=")[^"]*(")/, p.description);
  doc = set(doc, /(<meta property="og:url" content=")[^"]*(")/, url);
  doc = set(doc, /(<meta property="og:image" content=")[^"]*(")/, image);
  doc = set(doc, /(<meta property="og:image:alt" content=")[^"]*(")/, `${p.title}, DomEase`);
  doc = set(doc, /(<meta name="twitter:title" content=")[^"]*(")/, title);
  doc = set(doc, /(<meta name="twitter:description" content=")[^"]*(")/, p.description);
  doc = set(doc, /(<meta name="twitter:image" content=")[^"]*(")/, image);
  doc = set(doc, /(<meta name="twitter:image:alt" content=")[^"]*(")/, `${p.title}, DomEase`);
  if (p.noindex) doc = set(doc, /(<meta name="robots" content=")[^"]*(")/, "noindex, nofollow");
  mkdirSync(`dist/${p.path}`, { recursive: true });
  writeFileSync(`dist/${p.path}/index.html`, doc);
}
console.log(`Prerendered meta for ${PAGES.length} pages at ${SITE}.`);
