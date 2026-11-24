/* Legal page */
import useSeo from "@/seo/useSeo";

const formatDate = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

// One legal document: the short version first, then every section. Reads well
// from a small phone to a wide desktop: one column, at most about 70 characters a line.
export default function Legal({ doc }) {
  useSeo({ title: `${doc.title} | DomEase`, description: doc.summary });
  return (
    <article className="mx-auto max-w-3xl px-5 py-14 sm:py-20 lg:px-8">
      <p className="text-xs font-medium tracking-[0.18em] text-clay-700 uppercase">Legal</p>
      <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{doc.title}</h1>
      <p className="mt-3 text-sm text-ink-2">Last updated {formatDate(doc.updated)}</p>

      {doc.summary && (
        <div className="mt-10 rounded-2xl bg-clay-100 p-6">
          <p className="text-xs font-semibold tracking-[0.18em] text-clay-700 uppercase">In short</p>
          <p className="mt-2 text-lg leading-relaxed">{doc.summary}</p>
        </div>
      )}

      {doc.sections.map((s, i) => (
        <section key={s.heading} className="mt-12">
          <h2 className="text-2xl font-semibold">
            {i + 1}. {s.heading}
          </h2>
          {s.paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className="mt-4 text-[17px] leading-relaxed text-ink">
              {p}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
