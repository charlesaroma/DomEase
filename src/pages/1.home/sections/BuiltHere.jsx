/* Built Here */
import { Circle, CircleCheck, Smartphone, TriangleAlert } from "lucide-react";

import Reveal from "@/components/motion/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import demo from "@/data/demo.json";
import pages from "@/data/pages.json";

const copy = pages.home.builtHere;
const items = demo.shop.items.filter((i) => i.name !== "Sukuma wiki" && i.name !== "Soap, 3 bars");

// Local prices, local staples, local payments.
export default function BuiltHere() {
  return (
    <section id="shop-list" className="bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionHeading eyebrow={copy.eyebrow} title={copy.title} body={copy.body} />
          <p className="mt-8 inline-flex items-center gap-2.5 rounded-r-pill border border-line px-4 py-2 text-[15px] text-ink-2">
            <Smartphone className="size-4 text-clay-700" strokeWidth={1.75} aria-hidden="true" />
            {copy.payments}
          </p>
        </div>

        <Reveal className="mx-auto w-full max-w-md rounded-r-stage border border-line bg-white p-7 shadow-sh-2">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-bold">Saturday list</h3>
            <span className="font-mono text-clay-700">{demo.shop.total}</span>
          </div>
          <ul className="mt-4">
            {items.map((i) => (
              <li key={i.name} className="flex items-center gap-3 border-b border-line py-3 text-[15px]">
                {i.done ? (
                  <CircleCheck className="size-5 text-clay-700" strokeWidth={1.75} aria-label="Bought" />
                ) : (
                  <Circle className="size-5 text-line-2" strokeWidth={1.5} aria-label="Not bought" />
                )}
                <span className="flex-1">{i.name}</span>
                {i.low && (
                  <span className="inline-flex items-center gap-1 rounded-r-pill bg-danger-100 px-2 py-0.5 text-xs font-medium text-danger">
                    <TriangleAlert className="size-3" strokeWidth={2} aria-hidden="true" /> Low
                  </span>
                )}
                <span className="w-16 text-right font-mono text-sm">{i.price}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
