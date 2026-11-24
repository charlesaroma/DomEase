/* FAQs */
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useDeleteFaq, useFaqs, useSaveFaq } from "@/store/queries/admin";

import Drawer from "../../../components/Drawer";
import { Field, Input, Textarea } from "../../../components/Field";
import { useNotify } from "../../../components/Notice";
import Panel from "../../../components/Panel";
import Toggle from "../../../components/Toggle";

// The questions in You → Help, in this order. Answer in a sentence or two.
export default function Faqs() {
  const { data: faqs = [] } = useFaqs();
  const save = useSaveFaq();
  const remove = useDeleteFaq();
  const notify = useNotify();
  const [form, setForm] = useState(null);
  const sorted = [...faqs].sort((a, b) => a.sortOrder - b.sortOrder);

  // Swap places with the neighbour: two small saves, so order survives either way.
  const move = (i, by) => {
    const a = sorted[i];
    const b = sorted[i + by];
    save.mutate({ id: a.id, sortOrder: b.sortOrder });
    save.mutate({ id: b.id, sortOrder: a.sortOrder });
  };

  return (
    <>
      <Panel
        title="Help questions"
        action={
          <Button className="h-9 px-4 text-sm" onClick={() => setForm({ question: "", answer: "", sortOrder: (sorted.at(-1)?.sortOrder ?? 0) + 1 })}>
            <Plus className="size-4" /> Add
          </Button>
        }
        padded={false}
      >
        <ul>
          {sorted.map((f, i) => (
            <li key={f.id} className="flex items-start gap-3 border-b border-line px-5 py-4 last:border-0">
              <div className="flex flex-col">
                <MoveButton label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp className="size-4" />
                </MoveButton>
                <MoveButton label="Move down" disabled={i === sorted.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown className="size-4" />
                </MoveButton>
              </div>
              <button type="button" onClick={() => setForm({ ...f })} className={`min-w-0 flex-1 text-left ${f.active ? "" : "opacity-50"}`}>
                <p className="font-medium">{f.question}</p>
                <p className="mt-1 line-clamp-2 text-[15px] text-ink-2">{f.answer}</p>
              </button>
              <Toggle label="Show in the app" checked={f.active} onChange={(active) => save.mutate({ id: f.id, active })} />
            </li>
          ))}
        </ul>
      </Panel>

      <Drawer
        open={!!form}
        title={form?.id ? "Edit question" : "Add a question"}
        onClose={() => setForm(null)}
        footer={
          <>
            {form?.id && (
              <Button variant="ghost" className="mr-auto text-danger" onClick={() => window.confirm("Delete this question?") && remove.mutate(form.id, { onSuccess: () => setForm(null) })}>
                <Trash2 className="size-4" /> Delete
              </Button>
            )}
            <Button variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Button>
            <Button
              disabled={!form?.question?.trim() || !form?.answer?.trim() || save.isPending}
              onClick={() => save.mutate({ ...form, question: form.question.trim(), answer: form.answer.trim() }, { onSuccess: () => (notify("Saved."), setForm(null)) })}
            >
              Save
            </Button>
          </>
        }
      >
        {form && (
          <div className="space-y-5">
            <Field label="Question">
              <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="How do I…?" />
            </Field>
            <Field label="Answer" hint="Plain words. Say where to tap: Open You, then Settings.">
              <Textarea rows={6} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
            </Field>
          </div>
        )}
      </Drawer>
    </>
  );
}

function MoveButton({ label, children, ...props }) {
  return (
    <button type="button" aria-label={label} className="grid size-7 place-items-center rounded-r-sm text-ink-3 hover:bg-paper hover:text-ink disabled:opacity-30" {...props}>
      {children}
    </button>
  );
}
