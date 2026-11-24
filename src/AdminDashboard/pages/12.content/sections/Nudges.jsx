/* Health Nudges */
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useDeleteNudge, useNudges, useSaveNudge } from "@/store/queries/admin";

import { Input } from "../../../components/Field";
import { useNotify } from "../../../components/Notice";
import Panel from "../../../components/Panel";
import Toggle from "../../../components/Toggle";

// The light, rotating tips on Today (FR-TD-3): hydration, vegetables, movement.
export default function Nudges() {
  const { data: nudges = [] } = useNudges();
  const save = useSaveNudge();
  const remove = useDeleteNudge();
  const notify = useNotify();
  const [text, setText] = useState("");

  return (
    <Panel padded={false}>
      <form
        className="flex gap-2 border-b border-line p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          save.mutate({ text: text.trim(), active: true }, { onSuccess: () => (setText(""), notify("Nudge added.")) });
        }}
      >
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="A short, kind tip. One sentence." aria-label="New nudge" />
        <Button type="submit" disabled={!text.trim()}>
          <Plus className="size-4" /> Add
        </Button>
      </form>
      <ul>
        {nudges.map((n) => (
          <li key={n.id} className="flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-0">
            <p className={`flex-1 text-[15px] ${n.active ? "" : "text-ink-3 line-through"}`}>{n.text}</p>
            <Toggle label="Show in the app" checked={n.active} onChange={(active) => save.mutate({ id: n.id, active })} />
            <button
              type="button"
              onClick={() => remove.mutate(n.id)}
              className="grid size-9 place-items-center rounded-r-md text-ink-2 hover:bg-danger-100 hover:text-danger"
              aria-label="Delete nudge"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
