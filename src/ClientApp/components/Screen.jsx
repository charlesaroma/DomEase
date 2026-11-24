/* Screen */
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";

/**
 * One screen of the web app: an optional back link, the eyebrow and title,
 * actions on the right, then the content in a readable column (wider for
 * grids of photos).
 */
export default function Screen({ title, eyebrow, back, actions, children, wide = false, className }) {
  return (
    <div className={cn("mx-auto w-full px-4 pt-5 sm:px-6 lg:pt-10", wide ? "max-w-6xl" : "max-w-3xl", className)}>
      {back && (
        <Link to={back} className="-ml-2 mb-3 inline-flex items-center gap-1 rounded-r-pill px-2 py-1 text-[15px] text-ink-2 hover:text-ink">
          <ChevronLeft className="size-5" aria-hidden="true" /> Back
        </Link>
      )}
      {(title || actions) && (
        <header className="mb-6 flex items-end justify-between gap-4">
          <div className="min-w-0">
            {eyebrow && <p className="text-xs font-semibold tracking-[0.18em] text-clay-700 uppercase">{eyebrow}</p>}
            {title && <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>}
          </div>
          {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </div>
  );
}
