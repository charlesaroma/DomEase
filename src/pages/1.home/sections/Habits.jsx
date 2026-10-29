/* Habits */
import { Check } from "lucide-react";

import Reveal from "@/components/motion/Reveal";
import AppIcon from "@/components/ui/AppIcon";
import SectionHeading from "@/components/ui/SectionHeading";
import pages from "@/data/pages.json";

const copy = pages.home.habits;

// Meals, Clean and Shop: one card each. Each card is a nav anchor.
export default function Habits() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} body={copy.body} />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {copy.items.map((item, i) => (
            <Reveal
              as="article"
              key={item.id}
              id={item.id}
              delay={i * 100}
              className="scroll-mt-28 rounded-r-card border border-line bg-paper p-7"
            >
              <span className={item.id === "clean" ? "grid size-12 place-items-center rounded-r-md bg-sage-100 text-sage-800" : "grid size-12 place-items-center rounded-r-md bg-clay-100 text-clay-700"}>
                <AppIcon name={item.icon} className="size-6" />
              </span>
              <h3 className="mt-6 text-2xl font-bold">{item.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-2">{item.body}</p>
              <ul className="mt-6 space-y-2.5">
                {item.points.map((point) => (
                  <li key={point} className="flex gap-2.5 text-[15px]">
                    <Check className="mt-0.5 size-4 shrink-0 text-clay-700" strokeWidth={2.25} aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
