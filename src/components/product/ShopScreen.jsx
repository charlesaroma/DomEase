/* Shop Screen */
import { Circle, CircleCheck, TriangleAlert } from "lucide-react";

import demo from "@/data/demo.json";
import { cn } from "@/utils/cn";

import TabBar from "./TabBar";
import screenTone from "./screenTone";

const d = demo.shop;

// One list, filled from meals and zones, priced in Shillings.
export default function ShopScreen({ tone = "light" }) {
  const t = screenTone(tone);
  const low = d.items.filter((i) => i.low).length;
  return (
    <div className="relative h-full px-4">
      <p className="pt-2 font-display text-[28px] leading-none font-bold">Shop</p>
      <p className={cn("mt-1 text-[11px]", t.muted)}>One list, everyone sees it</p>

      <div className={cn("mt-3 flex items-start justify-between rounded-r-md p-3 shadow-sh-1", t.card)}>
        <div>
          <p className={cn("text-[10px]", t.muted)}>Estimated total</p>
          <p className="font-display text-[22px] leading-tight font-bold">{d.total}</p>
        </div>
        <div className="text-right">
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-medium", t.dangerPill)}>
            <TriangleAlert className="size-3" strokeWidth={2} aria-hidden="true" /> {low} low
          </span>
          <p className={cn("mt-1 font-mono text-[10px]", t.muted)}>{d.count} items</p>
        </div>
      </div>

      <ul className="mt-2">
        {d.items.map((i) => (
          <li key={i.name} className={cn("flex items-center gap-2.5 border-b py-2.5 text-[11.5px]", t.line)}>
            {i.done ? (
              <CircleCheck className={cn("size-4", t.brand)} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Circle className={cn("size-4", t.muted)} strokeWidth={1.5} aria-hidden="true" />
            )}
            <span className={cn("flex-1", i.done && "line-through opacity-60")}>{i.name}</span>
            {i.low && <span className={cn("rounded-full px-1.5 py-px text-[9px] font-medium", t.dangerPill)}>Low</span>}
            <span className="w-12 text-right font-mono text-[10.5px]">{i.price}</span>
          </li>
        ))}
      </ul>

      <TabBar active="shop" tone={tone} />
    </div>
  );
}
