/* Today Screen */
import { Bell, CookingPot, Lock, ShieldCheck, ShoppingBasket, TriangleAlert, Users } from "lucide-react";

import demo from "@/data/demo.json";
import { cn } from "@/utils/cn";

import ProgressBar from "./ProgressBar";
import TabBar from "./TabBar";
import screenTone from "./screenTone";

const d = demo.today;

// What the household opens on: tonight's meal, the week, the list.
export default function TodayScreen({ tone = "light" }) {
  const t = screenTone(tone);
  return (
    <div className="relative h-full px-4">
      <div className="flex items-center justify-between pt-1">
        <img src={t.logo} alt="DomEase" width="1600" height="472" className="h-[22px] w-auto" />
        <span className="flex items-center gap-2">
          <Bell className={cn("size-4", t.muted)} strokeWidth={1.75} aria-hidden="true" />
          <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", t.tint)}>
            <Users className="size-3" strokeWidth={2} aria-hidden="true" /> {d.household}
          </span>
        </span>
      </div>

      <p className="mt-3 font-display text-[28px] leading-none font-bold">Today</p>
      <p className={cn("mt-1 text-[11px]", t.muted)}>{d.date}</p>

      <div className={cn("mt-3 rounded-r-md border-l-[3px] border-clay-600 p-3 shadow-sh-1", t.card)}>
        <p className={cn("flex items-center gap-1.5 text-[9px] font-semibold tracking-[0.16em]", t.brand)}>
          <CookingPot className="size-3" strokeWidth={2} aria-hidden="true" /> TONIGHT
        </p>
        <p className="mt-1 font-display text-[15px] font-semibold">{d.tonight.name}</p>
        <p className={cn("text-[10.5px]", t.muted)}>{d.tonight.side}</p>
        <span className={cn("mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-medium", t.sagePill)}>
          <ShieldCheck className="size-3" strokeWidth={2} aria-hidden="true" /> Allergy safe
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        <span className={cn("flex h-9 flex-1 items-center justify-center rounded-full text-[11.5px] font-semibold", t.brandBg, t.onBrand)}>
          Plan the week
        </span>
        <span className={cn("flex h-9 items-center gap-1 rounded-full border-[1.5px] px-3 text-[11px] font-semibold", t.amber)}>
          <Lock className="size-3" strokeWidth={2.25} aria-hidden="true" /> Premium
        </span>
      </div>

      <div className="mt-4 flex justify-between text-[9.5px] font-semibold tracking-[0.14em]">
        <span className={t.muted}>THIS WEEK</span>
        <span className={cn("font-mono font-normal tracking-normal", t.muted)}>26 of 36</span>
      </div>
      {d.week.map((row) => (
        <div key={row.label} className="mt-2.5">
          <div className="mb-1 flex justify-between text-[11px]">
            <span>{row.label}</span>
            <span className="font-mono text-[10.5px]">
              {row.done} of {row.of}
            </span>
          </div>
          <ProgressBar pct={(row.done / row.of) * 100} tone={tone} />
        </div>
      ))}

      <div className={cn("mt-3.5 flex items-center gap-2 border-t pt-3", t.line)}>
        <ShoppingBasket className={cn("size-4", t.muted)} strokeWidth={1.75} aria-hidden="true" />
        <span className="flex-1">
          <span className="block text-[11px] font-semibold">Shopping list</span>
          <span className={cn("font-mono text-[10px]", t.muted)}>{d.list.total}</span>
        </span>
        <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-medium", t.dangerPill)}>
          <TriangleAlert className="size-3" strokeWidth={2} aria-hidden="true" /> {d.list.low} low
        </span>
      </div>

      <TabBar active="today" tone={tone} />
    </div>
  );
}
