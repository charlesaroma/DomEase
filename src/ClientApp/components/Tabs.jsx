/* Tabs */
import { useSearchParams } from "react-router-dom";

import { cn } from "@/utils/cn";

/**
 * Pill tabs kept in the address (?tab=), so a refresh or a shared link opens
 * the same tab. Returns the tab bar and the chosen id.
 *   tabs  [{ id, label }]   the first is the default
 */
export function useTabs(tabs) {
  const [params, setParams] = useSearchParams();
  const current = tabs.some((t) => t.id === params.get("tab")) ? params.get("tab") : tabs[0].id;
  const bar = (
    <div className="mb-6 inline-flex gap-1 rounded-r-pill bg-white p-1 shadow-sh-1" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={current === t.id}
          onClick={() => setParams(t.id === tabs[0].id ? {} : { tab: t.id }, { replace: true })}
          className={cn("h-9 rounded-r-pill px-4 text-[15px]", current === t.id ? "bg-clay-700 font-semibold text-white" : "text-ink-2 hover:text-ink")}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
  return [current, bar];
}
