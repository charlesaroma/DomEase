/* Phone Frame */
import { BatteryFull, Signal, Wifi } from "lucide-react";

import { cn } from "@/utils/cn";

/**
 * A modern iPhone drawn in CSS: rounded titanium edge, side buttons, the
 * Dynamic Island and a status bar, so the app screens read as the real thing.
 * tone="dark" puts the screen in evening mode.
 */
export default function PhoneFrame({ tone = "light", className, children }) {
  const dark = tone === "dark";
  return (
    <div className={cn("relative w-[290px] shrink-0", className)} role="img" aria-label="The DomEase app on a phone">
      {/* Side buttons */}
      <span aria-hidden="true" className="absolute top-[120px] -left-[3px] h-8 w-[4px] rounded-l bg-[#3a3634]" />
      <span aria-hidden="true" className="absolute top-[170px] -left-[3px] h-14 w-[4px] rounded-l bg-[#3a3634]" />
      <span aria-hidden="true" className="absolute top-[236px] -left-[3px] h-14 w-[4px] rounded-l bg-[#3a3634]" />
      <span aria-hidden="true" className="absolute top-[190px] -right-[3px] h-20 w-[4px] rounded-r bg-[#3a3634]" />

      <div className="rounded-[50px] bg-gradient-to-b from-[#4a4644] to-[#2b2826] p-[3px] shadow-sh-3">
        <div className="rounded-[47px] bg-[#0d0c0b] p-[9px]">
          <div
            className={cn(
              "relative h-[600px] overflow-hidden rounded-[39px]",
              dark ? "bg-night text-night-text" : "bg-paper text-ink",
            )}
          >
            {/* Status bar and Dynamic Island */}
            <div className="relative z-10 flex h-12 items-center justify-between px-7 pt-1 text-[13px] font-semibold">
              <span>9:41</span>
              <span className="flex items-center gap-1">
                <Signal className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                <Wifi className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                <BatteryFull className="size-4" strokeWidth={2} aria-hidden="true" />
              </span>
            </div>
            <span aria-hidden="true" className="absolute top-[11px] left-1/2 h-[26px] w-[92px] -translate-x-1/2 rounded-full bg-black" />

            <div className="h-[calc(100%-3rem)]">{children}</div>

            {/* Home indicator */}
            <span
              aria-hidden="true"
              className={cn("absolute bottom-2 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full", dark ? "bg-white/70" : "bg-ink/80")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
