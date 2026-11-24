/* Drawer */
import { X } from "lucide-react";
import { useEffect } from "react";

const WIDTHS = { false: "max-w-lg", true: "max-w-2xl", xl: "max-w-6xl" };

// A panel from the right for editing one record; Escape closes it.
// `wide`: true for a long form, "xl" for a form with a preview beside it.
export default function Drawer({ open, title, onClose, footer, children, wide = false, flush = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/30" />
      <div className={`relative flex h-full w-full flex-col bg-white shadow-sh-3 ${WIDTHS[wide]}`}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-r-pill hover:bg-paper" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className={flush ? "min-h-0 flex-1" : "flex-1 overflow-y-auto px-6 py-6"}>{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}
