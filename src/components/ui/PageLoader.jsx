/* Page Loader */
import AnimatedLogo from "@/components/brand/AnimatedLogo";
import { cn } from "@/utils/cn";

// Shown while a page chunk loads: the mark drawing itself, on a loop.
export default function PageLoader({ className }) {
  return (
    <div className={cn("grid place-items-center", className)} role="status" aria-label="Loading">
      <AnimatedLogo layout="mark" state="loading" title="" className="h-14 w-auto" />
    </div>
  );
}
