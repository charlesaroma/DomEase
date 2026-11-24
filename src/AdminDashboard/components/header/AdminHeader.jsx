/* Admin Header */
import { Database, Menu, RotateCcw } from "lucide-react";

import { resetDemo } from "@/store/services";
import { DEMO } from "@/store/services/mode";

export default function AdminHeader({ title, onMenu }) {
  return (
    <header className="sticky top-0 z-30 flex h-18 items-center gap-3 border-b border-line bg-paper/90 px-5 backdrop-blur lg:px-8">
      <button type="button" onClick={onMenu} className="grid size-10 place-items-center rounded-r-pill hover:bg-paper-2 lg:hidden" aria-label="Open menu">
        <Menu className="size-5" />
      </button>
      <p className="flex-1 truncate font-display text-lg font-semibold">{title}</p>
      {DEMO && (
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-r-pill bg-sage-100 px-3 py-1 text-sm text-sage-800 sm:inline-flex">
            <Database className="size-3.5" strokeWidth={2} aria-hidden="true" /> Demo data
          </span>
          <button
            type="button"
            onClick={() => {
              resetDemo();
              window.location.reload();
            }}
            className="inline-flex items-center gap-1.5 rounded-r-pill px-3 py-1 text-sm text-ink-2 hover:bg-paper-2"
            title="Put the demo data back to how it started"
          >
            <RotateCcw className="size-3.5" strokeWidth={2} aria-hidden="true" /> Reset
          </button>
        </div>
      )}
    </header>
  );
}
