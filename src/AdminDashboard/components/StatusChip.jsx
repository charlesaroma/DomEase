/* Status Chip */
import { cn } from "@/utils/cn";

// Every status carries a word, never colour alone.
const TONES = {
  good: "bg-sage-100 text-sage-800",
  warn: "bg-clay-100 text-clay-800",
  bad: "bg-danger-100 text-danger",
  quiet: "bg-paper-2 text-ink-2",
  premium: "border border-amber-700 text-amber-800",
};

export default function StatusChip({ tone = "quiet", children, className }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-r-pill px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", TONES[tone], className)}>
      {children}
    </span>
  );
}
