/* Zone Card */
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";

import { Input, Select } from "../../../components/Field";
import Panel from "../../../components/Panel";

const FREQ = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

const uid = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 8)}`;

/**
 * One zone: its name, tasks with how often, and the supplies it uses up.
 * Used for the zones every new household starts with and for the ready made
 * zones a household can add later. Saves only when something changed.
 */
export default function ZoneCard({ zone, onSave, onDelete, busy }) {
  const [z, setZ] = useState(zone);
  const dirty = JSON.stringify(z) !== JSON.stringify(zone);
  const setTask = (i, patch) => setZ({ ...z, tasks: z.tasks.map((t, j) => (j === i ? { ...t, ...patch } : t)) });
  const setSupply = (i, patch) => setZ({ ...z, consumables: z.consumables.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  const clean = () => ({
    ...z,
    name: z.name.trim(),
    tasks: z.tasks.filter((t) => t.label.trim()).map((t) => ({ ...t, label: t.label.trim() })),
    consumables: z.consumables.filter((c) => c.name.trim()).map((c) => ({ ...c, name: c.name.trim() })),
  });

  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          <Sparkles className="size-4 shrink-0 text-sage-700" aria-hidden="true" />
          <input
            value={z.name}
            onChange={(e) => setZ({ ...z, name: e.target.value })}
            aria-label="Zone name"
            className="min-w-0 rounded-r-sm bg-transparent px-1 font-semibold outline-none focus:bg-paper"
          />
        </span>
      }
      action={
        <div className="flex gap-1">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="grid size-9 place-items-center rounded-r-md text-ink-2 hover:bg-danger-100 hover:text-danger"
              aria-label={`Delete ${z.name}`}
            >
              <Trash2 className="size-4" />
            </button>
          )}
          <Button className="h-9 px-4 text-sm" disabled={!dirty || !z.name.trim() || busy} onClick={() => onSave(clean())}>
            Save
          </Button>
        </div>
      }
    >
      <p className="mb-2 text-xs font-medium tracking-wide text-ink-2 uppercase">Tasks</p>
      <div className="space-y-2">
        {z.tasks.map((t, i) => (
          <div key={t.id} className="grid grid-cols-[1fr_7.5rem_auto] gap-2">
            <Input aria-label="Task" value={t.label} onChange={(e) => setTask(i, { label: e.target.value })} />
            <Select aria-label="How often" options={FREQ} value={t.frequency} onChange={(e) => setTask(i, { frequency: e.target.value })} />
            <RemoveButton label="Remove task" onClick={() => setZ({ ...z, tasks: z.tasks.filter((_, j) => j !== i) })} />
          </div>
        ))}
      </div>
      <AddLink onClick={() => setZ({ ...z, tasks: [...z.tasks, { id: uid(`${z.id ?? "zone"}_t`), label: "", frequency: "weekly" }] })}>Add task</AddLink>

      <p className="mt-5 mb-2 text-xs font-medium tracking-wide text-ink-2 uppercase">Supplies</p>
      <div className="space-y-2">
        {z.consumables.map((c, i) => (
          <div key={c.id} className="grid grid-cols-[1fr_7.5rem_auto] gap-2">
            <Input aria-label="Supply" value={c.name} onChange={(e) => setSupply(i, { name: e.target.value })} />
            <Select aria-label="Bought every" options={FREQ} value={c.replenishmentCycle} onChange={(e) => setSupply(i, { replenishmentCycle: e.target.value })} />
            <RemoveButton label="Remove supply" onClick={() => setZ({ ...z, consumables: z.consumables.filter((_, j) => j !== i) })} />
          </div>
        ))}
      </div>
      <AddLink onClick={() => setZ({ ...z, consumables: [...z.consumables, { id: uid(`${z.id ?? "zone"}_c`), name: "", replenishmentCycle: "monthly" }] })}>
        Add supply
      </AddLink>
      <p className="mt-2 text-sm text-ink-2">When a household marks a supply low, it goes on their shopping list (FR-HM-4).</p>
    </Panel>
  );
}

function RemoveButton({ label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="grid size-11 place-items-center rounded-r-md text-ink-2 hover:bg-danger-100 hover:text-danger" aria-label={label}>
      <Trash2 className="size-4" />
    </button>
  );
}

function AddLink({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="mt-2 inline-flex items-center gap-1 text-sm text-clay-700 hover:underline">
      <Plus className="size-4" /> {children}
    </button>
  );
}
