/* Tab Bar */
import AppIcon from "@/components/ui/AppIcon";
import { cn } from "@/utils/cn";

import screenTone from "./screenTone";

const TABS = [
  { id: "today", label: "Today" },
  { id: "meals", label: "Meals" },
  { id: "clean", label: "Clean" },
  { id: "shop", label: "Shop" },
];

// The app's four tabs. Active in clay, the rest muted.
export default function TabBar({ active, tone }) {
  const t = screenTone(tone);
  return (
    <div className={cn("absolute inset-x-0 bottom-0 flex h-[74px] justify-around border-t px-2 pt-2.5", t.tabBar)}>
      {TABS.map((tab) => {
        const on = tab.id === active;
        return (
          <span key={tab.id} className={cn("flex w-14 flex-col items-center gap-1", on ? t.brand : t.muted)}>
            <AppIcon name={tab.id} className="size-[20px]" />
            <span className={cn("text-[10px]", on && "font-semibold")}>{tab.label}</span>
          </span>
        );
      })}
    </div>
  );
}
