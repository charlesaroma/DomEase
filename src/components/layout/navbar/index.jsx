/* Navbar */
import { Link } from "react-router-dom";

import Button from "@/components/ui/Button";
import site from "@/data/site.json";

import Logo from "./Logo";
import MobileMenu from "./mobileMenu";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur">
      <nav className="relative mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8" aria-label="Main">
        <Logo />
        <ul className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => (
            <li key={item.label}>
              <Link to={item.to} className="font-display text-[15px] text-ink-2 transition-colors hover:text-clay-700">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1">
          <Button to={site.cta.to} variant="action" className="h-10 px-4 text-sm sm:h-11 sm:px-6 sm:text-[15px]">
            {site.cta.label}
          </Button>
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
}
