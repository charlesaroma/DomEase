/* Tabs */
import { cn } from "@/utils/cn";

export default function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "-mb-px border-b-2 px-4 py-2.5 text-[15px] whitespace-nowrap transition-colors",
            value === t.id ? "border-clay-700 font-medium text-clay-800" : "border-transparent text-ink-2 hover:text-ink",
          )}
        >
          {t.label}
          {t.count != null && <span className="ml-2 rounded-r-pill bg-paper-2 px-2 py-0.5 text-xs">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
