/* Clean Screen */
import { CircleCheck, Plus, Sparkles } from "lucide-react";

import demo from "@/data/demo.json";
import { cn } from "@/utils/cn";

import ProgressBar from "./ProgressBar";
import TabBar from "./TabBar";
import screenTone from "./screenTone";

// The rota: every zone with the person responsible and how far along it is.
export default function CleanScreen({ tone = "light" }) {
  const t = screenTone(tone);
  return (
    <div className="relative h-full px-4">
      <div className="flex items-start justify-between pt-2">
        <div>
          <p className="font-display text-[28px] leading-none font-bold">Clean</p>
          <p className={cn("mt-1 text-[11px]", t.muted)}>Five zones, one rota</p>
        </div>
        <span className={cn("grid size-8 place-items-center rounded-full", t.tint)}>
          <Plus className="size-4" strokeWidth={2.25} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {demo.zones.map((z) => (
          <div key={z.name} className={cn("rounded-r-md p-3 shadow-sh-1", t.card)}>
            <div className="flex items-center gap-2 text-[12px]">
              <Sparkles className={cn("size-3.5", t.sage)} strokeWidth={1.75} aria-hidden="true" />
              <span className="font-semibold">{z.name}</span>
              {z.who && <span className={cn("text-[10.5px]", t.muted)}>· {z.who}</span>}
              <span className="ml-auto">
                {z.pct === 100 ? (
                  <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-medium", t.sagePill)}>
                    <CircleCheck className="size-3" strokeWidth={2} aria-hidden="true" /> Clear
                  </span>
                ) : (
                  <span className="font-mono text-[10.5px]">{z.pct}%</span>
                )}
              </span>
            </div>
            <ProgressBar pct={z.pct} tone={tone} className="mt-2.5" />
          </div>
        ))}
      </div>

      <TabBar active="clean" tone={tone} />
    </div>
  );
}
