/* Legal Pages */
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useLegal, useSaveLegal } from "@/store/queries/admin";

import { Field, Input, Textarea } from "../../components/Field";
import { useNotify } from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import Tabs from "../../components/Tabs";
import { date } from "../../lib/format";

// Where each one is read on the website (src/data/legal/index.js).
const PUBLIC_PATH = { terms: "/terms", privacy: "/privacy", premium: "/premium-terms", health: "/health-notice" };

/**
 * The Terms, Privacy notice, Premium terms and Health notice. The app fetches
 * them from /legal/:id (keeping a bundled copy for when it is offline), and
 * so does the website. Saving stamps today as "last updated".
 */
export default function Legal() {
  const { data: docs = [], isLoading } = useLegal();
  const [tab, setTab] = useState("terms");
  const doc = docs.find((d) => d.id === tab);

  return (
    <>
      <PageHeader
        title="Legal pages"
        body="What households agree to. Have a lawyer read any change before it goes out: it reaches the app and the website as soon as it is saved."
      />
      <Tabs tabs={docs.map((d) => ({ id: d.id, label: d.title }))} value={tab} onChange={setTab} />
      {isLoading && <p className="text-ink-2">Loading</p>}
      {doc && <LegalEditor key={doc.id + doc.updated} doc={doc} />}
    </>
  );
}

function LegalEditor({ doc }) {
  const save = useSaveLegal();
  const notify = useNotify();
  const [d, setD] = useState(doc);
  const dirty = JSON.stringify(d) !== JSON.stringify(doc);
  const setSection = (i, patch) => setD({ ...d, sections: d.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-r-card border border-line bg-white px-5 py-4">
        <p className="text-sm text-ink-2">
          Last updated {date(doc.updated)} ·{" "}
          <a href={PUBLIC_PATH[doc.id]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-clay-700 hover:underline">
            See it on the website <ExternalLink className="size-3.5" />
          </a>
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" disabled={!dirty} onClick={() => setD(doc)}>
            Undo changes
          </Button>
          <Button
            disabled={!dirty || save.isPending}
            onClick={() =>
              window.confirm("Publish these changes to the app and the website now?") &&
              save.mutate({ ...d, updated: new Date().toISOString().slice(0, 10) }, { onSuccess: () => notify(`${d.title} published.`) })
            }
          >
            Publish
          </Button>
        </div>
      </div>

      <Field label="Title">
        <Input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} />
      </Field>
      <Field label="In short" hint="The plain summary shown first, above the sections">
        <Textarea rows={4} value={d.summary} onChange={(e) => setD({ ...d, summary: e.target.value })} />
      </Field>

      <ol className="space-y-4">
        {d.sections.map((s, i) => (
          <li key={i} className="rounded-r-card border border-line bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-paper-2 text-xs font-semibold">{i + 1}</span>
              <Input aria-label={`Section ${i + 1} heading`} value={s.heading} onChange={(e) => setSection(i, { heading: e.target.value })} className="font-semibold" />
              <button
                type="button"
                onClick={() => setD({ ...d, sections: d.sections.filter((_, j) => j !== i) })}
                className="grid size-10 shrink-0 place-items-center rounded-r-md text-ink-2 hover:bg-danger-100 hover:text-danger"
                aria-label={`Remove section ${i + 1}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <Textarea
              rows={Math.min(14, 3 + s.paragraphs.join("\n\n").length / 90)}
              className="mt-3"
              aria-label={`Section ${i + 1} text`}
              value={s.paragraphs.join("\n\n")}
              onChange={(e) => setSection(i, { paragraphs: e.target.value.split(/\n{2,}/) })}
            />
            <p className="mt-1 text-xs text-ink-2">Leave a blank line between paragraphs.</p>
          </li>
        ))}
      </ol>
      <Button variant="ghost" onClick={() => setD({ ...d, sections: [...d.sections, { heading: "", paragraphs: [""] }] })}>
        <Plus className="size-4" /> Add a section
      </Button>
    </div>
  );
}
