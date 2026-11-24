/* Sheet */
import { X } from "lucide-react";
import { useEffect } from "react";

/**
 * A panel for one task (suggest a recipe, add an item, add a zone): from the
 * bottom on a phone, centred on a large screen. Escape or a tap outside closes it.
 */
export default function Sheet({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <div className="relative flex max-h-[90dvh] w-full flex-col rounded-t-r-stage bg-white shadow-sh-3 sm:max-w-lg sm:rounded-r-stage">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-r-pill hover:bg-paper" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && <div className="flex gap-2 border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </div>
  );
}

/** A labelled text field in the app's style. */
export function TextField({ label, hint, multiline = false, ...props }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <Tag
        className="w-full rounded-r-md border border-line bg-white px-3.5 py-3 text-base outline-none focus:border-clay-700 focus:ring-2 focus:ring-clay-100"
        rows={multiline ? 4 : undefined}
        {...props}
      />
      {hint && <span className="mt-1 block text-xs text-ink-2">{hint}</span>}
    </label>
  );
}
