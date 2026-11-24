/* Fields */
import { cn } from "@/utils/cn";

const control =
  "w-full rounded-r-md border border-line bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition focus:border-clay-700 focus:ring-2 focus:ring-clay-100";

export function Field({ label, hint, children, className }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-2">{hint}</span>}
    </label>
  );
}

export const Input = ({ className, ...props }) => <input className={cn(control, className)} {...props} />;
export const Textarea = ({ className, ...props }) => <textarea className={cn(control, "min-h-24", className)} {...props} />;
export function Select({ options, className, ...props }) {
  return (
    <select className={cn(control, "pr-8", className)} {...props}>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Pick several from a short list, as chips. */
export function ChipSelect({ options, value = [], onChange }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => toggle(o.id)}
            aria-pressed={on}
            className={cn(
              "rounded-r-pill border px-3.5 py-1.5 text-sm transition-colors",
              on ? "border-clay-700 bg-clay-100 text-clay-800" : "border-line text-ink-2 hover:border-line-2",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
