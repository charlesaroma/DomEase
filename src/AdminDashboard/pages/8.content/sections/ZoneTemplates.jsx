/* Starting Zones */
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useSaveZoneTemplate, useZoneTemplates } from "@/store/queries/admin";

import { Input, Select } from "../../../components/Field";
import { useNotify } from "../../../components/Notice";
import Panel from "../../../components/Panel";

const FREQ = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

// The zones, tasks and consumables a new household starts with (FR-HM-1).
// Households can rename and edit their own copies in the app.
export default function ZoneTemplates() {
  const { data: zones = [] } = useZoneTemplates();
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {[...zones]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((z) => (
          <ZoneCard key={z.id + (z.updatedAt ?? "")} zone={z} />
        ))}
    </div>
  );
}

function ZoneCard({ zone }) {
  const save = useSaveZoneTemplate();
  const notify = useNotify();
  const [z, setZ] = useState(zone);
  const dirty = JSON.stringify(z) !== JSON.stringify(zone);
  const setTask = (i, patch) => setZ({ ...z, tasks: z.tasks.map((t, j) => (j === i ? { ...t, ...patch } : t)) });

  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          <Sparkles className="size-4 text-sage-700" aria-hidden="true" /> {z.name}
        </span>
      }
      action={
        <Button className="h-9 px-4 text-sm" disabled={!dirty || save.isPending} onClick={() => save.mutate(z, { onSuccess: () => notify(`${z.name} saved.`) })}>
          Save
        </Button>
      }
    >
      <p className="mb-2 text-xs font-medium tracking-wide text-ink-2 uppercase">Tasks</p>
      <div className="space-y-2">
        {z.tasks.map((t, i) => (
          <div key={t.id} className="grid grid-cols-[1fr_7.5rem_auto] gap-2">
            <Input aria-label="Task" value={t.label} onChange={(e) => setTask(i, { label: e.target.value })} />
            <Select aria-label="How often" options={FREQ} value={t.frequency} onChange={(e) => setTask(i, { frequency: e.target.value })} />
            <button
              type="button"
              onClick={() => setZ({ ...z, tasks: z.tasks.filter((_, j) => j !== i) })}
              className="grid size-11 place-items-center rounded-r-md text-ink-2 hover:bg-danger-100 hover:text-danger"
              aria-label="Remove task"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setZ({ ...z, tasks: [...z.tasks, { id: `${z.id}_t${Date.now()}`, label: "", frequency: "weekly" }] })}
        className="mt-2 inline-flex items-center gap-1 text-sm text-clay-700 hover:underline"
      >
        <Plus className="size-4" /> Add task
      </button>
      <p className="mt-5 mb-2 text-xs font-medium tracking-wide text-ink-2 uppercase">Consumables</p>
      <p className="text-[15px]">{z.consumables.map((c) => c.name).join(", ")}</p>
      <p className="mt-1 text-sm text-ink-2">When a household marks one low, it goes on their shopping list (FR-HM-4).</p>
    </Panel>
  );
}
