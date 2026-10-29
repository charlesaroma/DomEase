/* At a Glance */
import Reveal from "@/components/motion/Reveal";
import pages from "@/data/pages.json";

// Four facts a visitor wants before reading anything.
export default function AtAGlance() {
  return (
    <section aria-label="DomEase at a glance" className="border-y border-line bg-paper-2">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-5 py-10 md:grid-cols-4 lg:px-8">
        {pages.home.glance.map((fact, i) => (
          <Reveal key={fact.label} delay={i * 80} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
            <dt className="font-display text-4xl font-bold text-clay-700">{fact.value}</dt>
            <dd className="text-[15px] leading-snug text-ink-2">{fact.label}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}
