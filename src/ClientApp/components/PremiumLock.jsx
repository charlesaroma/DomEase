/* Premium Lock */
import { Crown } from "lucide-react";
import { Link } from "react-router-dom";

import { cn } from "@/utils/cn";

/**
 * A Premium section on a free plan: the content shows blurred and cannot be
 * used, with a way to see Premium. On Premium it is just the content.
 */
export default function PremiumLock({ locked, title, body, children, className }) {
  if (!locked) return children;
  return (
    <section className={cn("relative min-h-64 overflow-hidden rounded-r-card border border-amber-200 bg-white", className)} aria-label={`${title}, Premium`}>
      <div className="pointer-events-none max-h-[26rem] overflow-hidden select-none blur-[3px]" aria-hidden="true" inert>
        {children}
      </div>
      <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-white/50 via-white/75 to-white/95 p-6 text-center">
        <div className="max-w-xs">
          <span className="mx-auto grid size-11 place-items-center rounded-full bg-amber-200/70 text-amber-800">
            <Crown className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-3 font-display text-lg font-semibold">{title}</p>
          {body && <p className="mt-1 text-sm text-ink-2">{body}</p>}
          <Link to="/app/premium" className="mt-4 inline-flex h-10 items-center rounded-r-pill bg-amber-700 px-5 font-display font-semibold text-white hover:bg-amber-800">
            See Premium
          </Link>
        </div>
      </div>
    </section>
  );
}
