/* Clean */
import { Check, MoreHorizontal, Plus, Sparkles } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useAppZonePresets, useHousehold, useSaveZones, useZones } from "@/store/queries/app";
import { cn } from "@/utils/cn";

import AdSlot from "../../components/AdSlot";
import Screen from "../../components/Screen";
import Sheet, { TextField } from "../../components/Sheet";
import { useToast } from "../../components/Toast";
import { FREQ_LABEL } from "../../lib/choices";

const uid = (p) => `${p}_${Math.random().toString(36).slice(2, 9)}`;

/**
 * Cleaning by zone (FR-HM): tick tasks off, see who looks after each zone,
 * and mark supplies running low so they land on the shopping list.
 */
export default function Clean() {
  const { data: zones = [], isLoading } = useZones();
  const { data: household } = useHousehold();
  const save = useSaveZones();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);

  const put = (next) => save.mutate(next);
  const patchZone = (id, fn) => put(zones.map((z) => (z.id === id ? fn(z) : z)));
  const toggleTask = (z, t) =>
    patchZone(z.id, (x) => {
      const tasks = x.tasks.map((y) => (y.id === t.id ? { ...y, done: !y.done } : y));
      const cleared = tasks.every((y) => y.done) && !x.tasks.every((y) => y.done);
      if (cleared) toast(`${x.name} is clear.`);
      return { ...x, tasks, streak: cleared ? x.streak + 1 : x.streak };
    });
  const toggleLow = (z, c) => {
    patchZone(z.id, (x) => ({ ...x, consumables: x.consumables.map((y) => (y.id === c.id ? { ...y, low: !y.low } : y)) }));
    if (!c.low) toast(`${c.name} added to the shopping list.`);
  };
  const people = (household?.members ?? []).map((m) => m.name);

  return (
    <Screen
      wide
      eyebrow="Zones"
      title="Clean"
      actions={
        <Button variant="ghost" onClick={() => setAdding(true)}>
          <Plus className="size-4" /> <span className="hidden sm:inline">Add a zone</span>
        </Button>
      }
    >
      {isLoading && <p className="text-ink-2">Loading</p>}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {zones.map((z) => {
          const done = z.tasks.filter((t) => t.done).length;
          const pct = z.tasks.length ? Math.round((done / z.tasks.length) * 100) : 0;
          return (
            <section key={z.id} className="rounded-r-card bg-white p-5 shadow-sh-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                    <Sparkles className="size-5 text-sage-700" aria-hidden="true" /> {z.name}
                  </h2>
                  <p className="text-sm text-ink-2">
                    {z.assignee ? `${z.assignee} looks after it` : "Nobody assigned"}
                    {z.streak > 0 && ` · ${z.streak} day streak`}
                  </p>
                </div>
                <button type="button" onClick={() => setEditing(z)} className="grid size-9 place-items-center rounded-r-pill text-ink-2 hover:bg-paper" aria-label={`Change ${z.name}`}>
                  <MoreHorizontal className="size-5" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
                  <div className={cn("h-full rounded-full transition-[width]", pct === 100 ? "bg-sage-700" : "bg-clay-700")} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm text-ink-2 tabular-nums">{pct === 100 ? "Clear" : `${pct}%`}</span>
              </div>
              <ul className="mt-3 divide-y divide-line">
                {z.tasks.map((t) => (
                  <li key={t.id}>
                    <label className="flex cursor-pointer items-center gap-3 py-2.5">
                      <input type="checkbox" checked={t.done} onChange={() => toggleTask(z, t)} className="size-5 accent-clay-700" />
                      <span className={cn("flex-1", t.done && "text-ink-3 line-through")}>{t.label}</span>
                      <span className="text-xs text-ink-3">{FREQ_LABEL[t.frequency]}</span>
                    </label>
                  </li>
                ))}
              </ul>
              {z.consumables.length > 0 && (
                <div className="mt-3 border-t border-line pt-3">
                  <p className="mb-2 text-xs font-medium tracking-wide text-ink-2 uppercase">Running low?</p>
                  <div className="flex flex-wrap gap-2">
                    {z.consumables.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleLow(z, c)}
                        aria-pressed={c.low}
                        className={cn("inline-flex items-center gap-1 rounded-r-pill border px-3 py-1 text-sm", c.low ? "border-clay-700 bg-clay-100 text-clay-800" : "border-line text-ink-2 hover:border-line-2")}
                      >
                        {c.low && <Check className="size-3.5" aria-hidden="true" />} {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-8">
        <AdSlot screen="clean" />
      </div>

      <AddZone open={adding} onClose={() => setAdding(false)} onAdd={(z) => (put([...zones, z]), toast(`${z.name} added.`))} />
      {editing && (
        <EditZone
          key={editing.id}
          zone={editing}
          people={people}
          onClose={() => setEditing(null)}
          onSave={(z) => (patchZone(z.id, () => z), setEditing(null))}
          onRemove={() => (put(zones.filter((x) => x.id !== editing.id)), setEditing(null), toast(`${editing.name} removed.`))}
        />
      )}
    </Screen>
  );
}

function AddZone({ open, onClose, onAdd }) {
  const { data: presets = [] } = useAppZonePresets();
  const [name, setName] = useState("");
  const build = (p) => ({
    id: uid("zone"),
    name: p.name,
    assignee: null,
    streak: 0,
    tasks: p.tasks.map((t) => ({ ...t, id: uid("task"), done: false })),
    consumables: p.consumables.map((c) => ({ ...c, id: uid("sup"), low: false })),
  });
  return (
    <Sheet open={open} onClose={onClose} title="Add a zone">
      <p className="mb-3 text-sm text-ink-2">Ready made, with tasks to start from:</p>
      <ul className="grid grid-cols-2 gap-2">
        {presets.map((p) => (
          <li key={p.id}>
            <button type="button" onClick={() => (onAdd(build(p)), onClose())} className="w-full rounded-r-md border border-line px-3 py-3 text-left hover:border-clay-700">
              <span className="block font-medium">{p.name}</span>
              <span className="text-xs text-ink-2">{p.tasks.length} tasks</span>
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-5 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onAdd(build({ name: name.trim(), tasks: [], consumables: [] }));
          setName("");
          onClose();
        }}
      >
        <div className="flex-1">
          <TextField label="Or a zone of your own" value={name} onChange={(e) => setName(e.target.value)} placeholder="Boys' quarters" />
        </div>
        <Button type="submit" disabled={!name.trim()}>
          Add
        </Button>
      </form>
    </Sheet>
  );
}

function EditZone({ zone, people, onClose, onSave, onRemove }) {
  const [z, setZ] = useState(zone);
  const [task, setTask] = useState("");
  return (
    <Sheet
      open
      onClose={onClose}
      title={`Change ${zone.name}`}
      footer={
        <>
          <Button variant="ghost" className="text-danger" onClick={() => window.confirm(`Remove ${zone.name}?`) && onRemove()}>
            Remove
          </Button>
          <Button className="ml-auto" onClick={() => onSave({ ...z, name: z.name.trim() || zone.name })}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField label="Name" value={z.name} onChange={(e) => setZ({ ...z, name: e.target.value })} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Who looks after it</span>
          <select value={z.assignee ?? ""} onChange={(e) => setZ({ ...z, assignee: e.target.value || null })} className="h-12 w-full rounded-r-md border border-line bg-white px-3">
            <option value="">Nobody</option>
            {people.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <div>
          <p className="mb-1.5 text-sm font-medium">Tasks</p>
          <ul className="space-y-1">
            {z.tasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 rounded-r-md bg-paper px-3 py-2">
                <span>{t.label}</span>
                <select
                  aria-label="How often"
                  value={t.frequency}
                  onChange={(e) => setZ({ ...z, tasks: z.tasks.map((x) => (x.id === t.id ? { ...x, frequency: e.target.value } : x)) })}
                  className="rounded-r-sm bg-transparent text-sm"
                >
                  {Object.entries(FREQ_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => setZ({ ...z, tasks: z.tasks.filter((x) => x.id !== t.id) })} className="text-sm text-danger" aria-label={`Remove ${t.label}`}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex gap-2">
            <input
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="A new task"
              aria-label="New task"
              className="h-11 flex-1 rounded-r-md border border-line px-3 outline-none focus:border-clay-700"
            />
            <Button
              variant="ghost"
              disabled={!task.trim()}
              onClick={() => (setZ({ ...z, tasks: [...z.tasks, { id: uid("task"), label: task.trim(), frequency: "weekly", done: false }] }), setTask(""))}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
