/* Toggle */
import { cn } from "@/utils/cn";

export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-clay-700" : "bg-line-2")}
    >
      <span className={cn("absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sh-1 transition-transform", checked && "translate-x-5")} />
    </button>
  );
}
