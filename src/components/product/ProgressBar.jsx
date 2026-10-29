/* Progress Bar */
import { cn } from "@/utils/cn";

import screenTone from "./screenTone";

export default function ProgressBar({ pct, tone, className }) {
  const t = screenTone(tone);
  return (
    <div className={cn("h-[5px] overflow-hidden rounded-full", t.track, className)}>
      <div className={cn("h-full rounded-full", t.brandBg)} style={{ width: `${pct}%` }} />
    </div>
  );
}
