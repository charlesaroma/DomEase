/* Reveal */
import { useEffect, useRef, useState } from "react";

import { cn } from "@/utils/cn";

/**
 * Fades its children up the first time they scroll into view. No motion at
 * all for visitors who ask their system for reduced motion.
 */
export default function Reveal({ as: Tag = "div", delay = 0, className, children, ...props }) {
  const ref = useRef(null);
  // Shown from the start when motion is unwanted or the browser cannot observe.
  const [shown, setShown] = useState(
    () =>
      typeof window === "undefined" ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || shown) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        "transition-[opacity,translate] duration-700 ease-out motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
