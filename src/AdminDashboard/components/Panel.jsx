/* Panel */
import { cn } from "@/utils/cn";

export default function Panel({ title, action, className, children, padded = true }) {
  return (
    <section className={cn("rounded-r-card border border-line bg-white", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          {action}
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}
