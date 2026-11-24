/* Stepper */
import { Check, CircleAlert } from "lucide-react";

import { cn } from "@/utils/cn";

/**
 * Progress through a long form, one step at a time: numbered steps joined by
 * a line, each done (tick), current, waiting, or needing attention (a step
 * already passed that is missing something). On a phone it folds to
 * "Step 2 of 6 · Photos" over a progress bar.
 *
 *   steps     [{ id, label, hint?, invalid? }]
 *   current   index of the step on screen
 *   reached   the furthest step visited; steps up to it can be clicked
 *   onSelect  (index) => void; with `free`, any step can be clicked (editing
 *             something that already exists)
 */
export default function Stepper({ steps, current, reached = current, onSelect, free = false }) {
  const pct = Math.round(((current + 1) / steps.length) * 100);
  return (
    <nav aria-label="Steps">
      {/* Phone */}
      <div className="sm:hidden">
        <p className="text-sm">
          <span className="text-ink-2">
            Step {current + 1} of {steps.length} ·{" "}
          </span>
          <span className="font-semibold">{steps[current].label}</span>
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-clay-700 transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Wider */}
      <ol className="hidden items-start sm:flex">
        {steps.map((s, i) => {
          const done = i < current || (free && i !== current && !s.invalid && i <= reached);
          const attention = s.invalid && i !== current && (i < reached || free);
          const clickable = onSelect && i !== current && (free || i <= reached);
          const Tag = clickable ? "button" : "div";
          return (
            <li key={s.id} className="relative flex flex-1 flex-col items-center">
              {/* The line to the next step: filled once this step is behind */}
              {i < steps.length - 1 && (
                <span className={cn("absolute top-4 left-[calc(50%+20px)] h-0.5 w-[calc(100%-40px)] rounded-full", i < current ? "bg-clay-700" : "bg-line")} aria-hidden="true" />
              )}
              <Tag
                {...(clickable ? { type: "button", onClick: () => onSelect(i) } : {})}
                aria-current={i === current ? "step" : undefined}
                className={cn("group flex flex-col items-center gap-1.5 px-1 text-center", clickable && "cursor-pointer")}
              >
                <span
                  className={cn(
                    "relative z-10 grid size-8 place-items-center rounded-full border-2 text-sm font-semibold transition-colors",
                    attention && "border-danger bg-danger-100 text-danger",
                    !attention && i === current && "border-clay-700 bg-clay-700 text-white shadow-[0_0_0_4px_var(--color-clay-100)]",
                    !attention && i !== current && done && "border-clay-700 bg-clay-700 text-white",
                    !attention && i !== current && !done && "border-line-2 bg-white text-ink-2",
                    clickable && "group-hover:border-clay-800",
                  )}
                >
                  {attention ? <CircleAlert className="size-4" aria-hidden="true" /> : done ? <Check className="size-4" strokeWidth={3} aria-hidden="true" /> : i + 1}
                </span>
                <span className={cn("text-[13px] leading-tight", i === current ? "font-semibold text-ink" : "text-ink-2", clickable && "group-hover:text-ink")}>
                  {s.label}
                  <span className="sr-only">{attention ? ", needs attention" : done ? ", done" : i === current ? ", current step" : ""}</span>
                </span>
                {s.hint && <span className="hidden text-[11px] text-ink-3 lg:block">{s.hint}</span>}
              </Tag>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
