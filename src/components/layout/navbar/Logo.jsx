/* Logo */
import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";

/**
 * The DomEase logo: the house in bloom with the name beside it (the compact
 * horizontal lockup; the tagline is too small to read at header size). The files in public/logo are the approved artwork with
 * the lettering in outlines, so they look the same everywhere. Never retype
 * the name in a web font (docs/04-design-system.md, Logo).
 *
 * tone="dark" is for dark grounds (the clay band, the footer).
 */
export default function Logo({ to = "/", tone = "light", className }) {
  return (
    <Link to={to} className={cn("inline-flex shrink-0 items-center", className)} aria-label="DomEase, home">
      <img
        src={tone === "dark" ? "/logo/domease-logo-compact-reversed.svg" : "/logo/domease-logo-compact.svg"}
        alt=""
        width="1600"
        height="472"
        decoding="async"
        className="block h-10 w-auto lg:h-12"
      />
    </Link>
  );
}
