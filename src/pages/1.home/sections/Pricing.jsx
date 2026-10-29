/* Pricing */
import { Check, Info } from "lucide-react";

import Reveal from "@/components/motion/Reveal";
import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import pages from "@/data/pages.json";
import { cn } from "@/utils/cn";

const copy = pages.home.pricing;

function Plan({ plan, featured }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-r-stage p-8",
        featured ? "bg-clay-900 text-white shadow-sh-3" : "border border-line bg-white",
      )}
    >
      <h3 className="text-2xl font-bold">{plan.name}</h3>
      <p className="mt-5 font-display text-4xl font-bold">{plan.price ?? plan.pricePending}</p>
      <p className={cn("mt-1 text-[15px]", featured ? "text-clay-200" : "text-ink-2")}>{plan.period}</p>
      <ul className="mt-8 flex-1 space-y-3">
        {plan.items.map((item) => (
          <li key={item} className="flex gap-3 text-[15px]">
            <Check
              className={cn("mt-0.5 size-4 shrink-0", featured ? "text-clay-400" : "text-clay-700")}
              strokeWidth={2.25}
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>
      <Button to="/#get-the-app" variant={featured ? "action" : "ghost"} size="lg" className={cn("mt-10 w-full", featured || "bg-white")}>
        {plan.cta}
      </Button>
      {plan.disclaimer && (
        <p className="mt-5 flex gap-2 text-sm text-clay-200/90">
          <Info className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
          {plan.disclaimer}
        </p>
      )}
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-16 bg-white">
      <div className="mx-auto max-w-5xl px-5 py-24 lg:px-8">
        <SectionHeading align="center" eyebrow={copy.eyebrow} title={copy.title} body={copy.body} />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <Reveal>
            <Plan plan={copy.free} />
          </Reveal>
          <Reveal delay={120}>
            <Plan plan={copy.premium} featured />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
