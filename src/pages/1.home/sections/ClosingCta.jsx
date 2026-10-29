/* Closing Call to Action */
import { Smartphone } from "lucide-react";

import pages from "@/data/pages.json";

const copy = pages.home.closing;

// The closing invitation, and nothing else on the band.
export default function ClosingCta() {
  return (
    <section id="get-the-app" className="scroll-mt-16 bg-paper-2">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center">
        <img src="/logo/domease-mark.svg" alt="" width="905" height="790" className="h-20 w-auto" />
        <h2 className="mt-8 text-4xl font-bold md:text-5xl">{copy.title}</h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">{copy.body}</p>
        <span className="mt-9 inline-flex h-14 items-center gap-3 rounded-r-pill bg-amber-700 px-8 font-display text-base font-semibold text-white">
          <Smartphone className="size-5" strokeWidth={1.75} aria-hidden="true" />
          {copy.cta}
        </span>
        <p className="mt-4 text-[15px] text-ink-2">{copy.note}</p>
      </div>
    </section>
  );
}
