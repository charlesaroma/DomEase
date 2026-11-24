/* Questionnaire */
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useQuestions, useSaveQuestions } from "@/store/queries/admin";

import { Input } from "../../../components/Field";
import { useNotify } from "../../../components/Notice";
import Panel from "../../../components/Panel";

/**
 * Eleven questions in four sections. Each answer carries a weight from 0 to 3;
 * the server turns the answers into a fit score and flags any answer weighted
 * 1 or less (FR-HH-3, FR-HH-4).
 */
export default function Questionnaire() {
  const { data: questions } = useQuestions();
  if (!questions) return <p className="text-ink-2">Loading</p>;
  return <Editor key={questions.map((q) => q.id).join()} initial={questions} />;
}

function Editor({ initial }) {
  const save = useSaveQuestions();
  const notify = useNotify();
  const [qs, setQs] = useState(initial);
  const dirty = JSON.stringify(qs) !== JSON.stringify(initial);
  const sections = [...new Set(qs.map((q) => q.section))];

  const setQ = (id, patch) => setQs((xs) => xs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  const setOpt = (id, i, patch) =>
    setQs((xs) => xs.map((q) => (q.id === id ? { ...q, options: q.options.map((o, j) => (j === i ? { ...o, ...patch } : o)) } : q)));

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <Panel key={section} title={section}>
          <div className="space-y-6">
            {qs
              .filter((q) => q.section === section)
              .map((q) => (
                <div key={q.id}>
                  <Input aria-label="Question" value={q.text} onChange={(e) => setQ(q.id, { text: e.target.value })} className="font-medium" />
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {q.options.map((o, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input aria-label="Answer" value={o.label} onChange={(e) => setOpt(q.id, i, { label: e.target.value })} />
                        <select
                          aria-label="Weight"
                          value={o.weight}
                          onChange={(e) => setOpt(q.id, i, { weight: Number(e.target.value) })}
                          className={`h-11 w-16 rounded-r-md border text-center font-mono ${o.weight <= 1 ? "border-clay-400 bg-clay-100 text-clay-800" : "border-line"}`}
                        >
                          {[0, 1, 2, 3].map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </Panel>
      ))}
      <div className="sticky bottom-4 flex items-center justify-between rounded-r-card border border-line bg-white px-5 py-3 shadow-sh-2">
        <p className="text-sm text-ink-2">Weights of 1 or less are flagged to the household as worth a second conversation.</p>
        <Button disabled={!dirty || save.isPending} onClick={() => save.mutate(qs, { onSuccess: () => notify("Questionnaire saved.") })}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
