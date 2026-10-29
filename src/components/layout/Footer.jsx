/* Footer */
import { Link } from "react-router-dom";

import site from "@/data/site.json";

import Logo from "./navbar/Logo";

// The dark footer: Night ground, the reversed logo, the links, and who built it.
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-night text-night-text">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pt-14 pb-10 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <Logo tone="dark" />
          <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-night-text/70">{site.tagline} Meals, cleaning and one shared shopping list, for Ugandan homes.</p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-clay-400 uppercase">Product</p>
          <ul className="mt-4 space-y-2.5">
            {site.nav.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="text-[15px] text-night-text/80 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-clay-400 uppercase">The app</p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link to={site.cta.to} className="text-[15px] text-night-text/80 hover:text-white">
                {site.cta.label}
              </Link>
            </li>
            <li className="text-[15px] text-night-text/60">Android first, iPhone to follow</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-night-line">
        <p className="mx-auto max-w-7xl px-5 py-6 text-sm text-night-text/60 lg:px-8">
          © {year} {site.name}. Built by{" "}
          <a href={site.builtBy.url} className="text-clay-400 hover:text-clay-200">
            {site.builtBy.name}
          </a>
          , Kampala.
        </p>
      </div>
    </footer>
  );
}
