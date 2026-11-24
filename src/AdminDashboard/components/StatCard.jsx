/* Stat Card */
import { cn } from "@/utils/cn";

export default function StatCard({ label, value, note, icon: Icon, tone = "clay" }) {
  return (
    <div className="rounded-r-card border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-2">{label}</p>
        {Icon && (
          <span className={cn("grid size-9 place-items-center rounded-r-md", tone === "sage" ? "bg-sage-100 text-sage-800" : "bg-clay-100 text-clay-700")}>
            <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
      {note && <p className="mt-1 text-sm text-ink-2">{note}</p>}
    </div>
  );
}
