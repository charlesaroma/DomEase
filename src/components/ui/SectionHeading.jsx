/* Section Heading */
import { cn } from "@/utils/cn";

// The eyebrow, title and lead that open every home section.
export default function SectionHeading({ eyebrow, title, body, tone = "light", align = "left", className }) {
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn("text-xs font-medium tracking-[0.18em] uppercase", dark ? "text-clay-400" : "text-clay-700")}>
          {eyebrow}
        </p>
      )}
      <h2 className={cn("mt-3 text-4xl leading-tight font-bold md:text-5xl", dark ? "text-white" : "text-ink")}>{title}</h2>
      {body && <p className={cn("mt-5 text-lg leading-relaxed", dark ? "text-night-text/80" : "text-ink-2")}>{body}</p>}
    </div>
  );
}
