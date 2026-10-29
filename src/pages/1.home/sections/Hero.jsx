/* Hero */
import { CircleCheck } from "lucide-react";

import PhoneFrame from "@/components/product/PhoneFrame";
import TodayScreen from "@/components/product/TodayScreen";
import Button from "@/components/ui/Button";
import pages from "@/data/pages.json";

const copy = pages.home.hero;

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pt-14 pb-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:pt-20 lg:pb-28">
        <div>
          <h1 className="text-[2.75rem] leading-[1.04] font-bold text-ink sm:text-6xl lg:text-7xl">
            {copy.title} <span className="text-clay-700">{copy.accent}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">{copy.body}</p>
          <div className="mt-9 flex flex-wrap gap-3 sm:gap-4">
            <Button to="/#get-the-app" variant="action" size="lg">
              {copy.primary}
            </Button>
            <Button to="/#meals" variant="ghost" size="lg">
              {copy.secondary}
            </Button>
          </div>
          <p className="mt-6 flex items-start gap-2 text-[15px] text-ink-2">
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-sage-700" aria-hidden="true" />
            {copy.note}
          </p>
        </div>

        {/* The app, in the soft clay circle */}
        <div className="relative flex justify-center">
          <div aria-hidden="true" className="absolute top-1/2 left-1/2 size-[30rem] -translate-1/2 rounded-full bg-clay-100 sm:size-[38rem]" />
          <div aria-hidden="true" className="absolute right-[-6rem] bottom-[-2rem] size-64 rounded-full bg-sage-100/80" />
          <PhoneFrame className="relative">
            <TodayScreen />
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}
