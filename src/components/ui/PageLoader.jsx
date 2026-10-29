/* Page Loader */
import { cn } from "@/utils/cn";

// Shown while a page chunk loads: the mark, breathing.
export default function PageLoader({ className }) {
  return (
    <div className={cn("grid place-items-center", className)} role="status" aria-label="Loading">
      <img src="/logo/domease-mark.svg" alt="" width="905" height="790" className="h-12 w-auto animate-pulse" />
    </div>
  );
}
