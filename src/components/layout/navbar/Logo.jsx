/* Logo */
import { useState } from "react";
import { Link } from "react-router-dom";

import AnimatedLogo from "@/components/brand/AnimatedLogo";
import { cn } from "@/utils/cn";

const SEEN = "domease.logoDrawn";

// The logo draws itself once per visit, then stays still. Storage can be
// blocked (private windows); the logo then simply appears.
function firstTimeThisVisit() {
  try {
    if (sessionStorage.getItem(SEEN)) return false;
    sessionStorage.setItem(SEEN, "1");
    return true;
  } catch {
    return false;
  }
}

/**
 * The DomEase logo: the house in bloom with the name beside it (the compact
 * horizontal lockup; the tagline is too small to read at header size). It is
 * drawn from the approved artwork's paths (components/brand/logoArt.js), never
 * retyped in a web font (docs/04-design-system.md, Logo). On hover or keyboard
 * focus the tulip nods.
 *
 * tone="dark" is for dark grounds (the clay band, the footer).
 */
export default function Logo({ to = "/", tone = "light", className, intro = false }) {
  const [state] = useState(() => (intro && firstTimeThisVisit() ? "draw" : "idle"));
  return (
    <Link to={to} className={cn("inline-flex shrink-0 items-center", className)} aria-label="DomEase, home">
      <AnimatedLogo layout="compact" tone={tone} state={state} hover title="DomEase" className="h-9 w-auto min-[360px]:h-10 lg:h-12" />
    </Link>
  );
}
