/* Button */
import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";

/**
 * The site's buttons, all pills.
 *   action  : amber, the one thing you want pressed (Start free, Get the app)
 *   primary : clay, for brand actions inside the product
 *   ghost   : outline, the quiet second choice
 * Amber is used once or twice per screen at most (docs/04-design-system.md).
 */
const VARIANTS = {
  action: "bg-amber-700 text-white hover:bg-amber-800",
  primary: "bg-clay-700 text-white hover:bg-clay-800",
  ghost: "border border-line-2 text-ink hover:border-clay-700 hover:text-clay-700",
};
const SIZES = { md: "h-11 px-6 text-[15px]", lg: "h-14 px-8 text-base" };

export default function Button({ to, variant = "primary", size = "md", className, children, ...props }) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-r-pill font-display font-semibold transition-colors duration-200",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-700",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}
