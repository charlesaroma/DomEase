/* House Help */
import { FileText, Flag, Lock } from "lucide-react";

import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import demo from "@/data/demo.json";
import pages from "@/data/pages.json";

const copy = pages.home.houseHelp;
const c = demo.candidate;

// The Premium module that sets DomEase apart: vetting House Help fairly.
export default function HouseHelp() {
  return (
    <section className="bg-paper">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 lg:grid-cols-2 lg:px-8">
        <Reveal className="order-2 mx-auto w-full max-w-md rounded-r-stage bg-white p-7 shadow-sh-2 lg:order-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-2">Fit score</p>
              <p className="font-display text-xl font-bold">{c.name}</p>
            </div>
            <p className="font-display text-5xl font-bold text-clay-700">
              {c.score}
              <span className="text-2xl">%</span>
            </p>
          </div>
          <div className="mt-6 space-y-4">
            {c.sections.map((s) => (
              <div key={s.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span>{s.label}</span>
                  <span className="font-mono text-ink-2">{s.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-paper-2">
                  <div className="h-full rounded-full bg-clay-700" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 flex items-center gap-2 rounded-r-md bg-clay-100 px-3 py-2.5 text-sm text-clay-800">
            <Flag className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
            Worth asking: {c.flag.toLowerCase()}
          </p>
        </Reveal>

        <div className="order-1 lg:order-2">
          <span className="inline-flex items-center gap-1.5 rounded-r-pill border border-amber-700 px-3 py-1 text-sm font-medium text-amber-700">
            <Lock className="size-3.5" strokeWidth={2} aria-hidden="true" /> {copy.badge}
          </span>
          <SectionHeading eyebrow={copy.eyebrow} title={copy.title} body={copy.body} className="mt-5" />
          <ul className="mt-8 space-y-3">
            {copy.guides.map((g) => (
              <li key={g} className="flex items-center gap-3 text-[15px]">
                <FileText className="size-5 text-clay-700" strokeWidth={1.75} aria-hidden="true" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
