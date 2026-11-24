/* Ready Made Zones */
import { Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import { useDeleteZonePreset, useSaveZonePreset, useZonePresets } from "@/store/queries/admin";

import { useNotify } from "../../../components/Notice";
import ZoneCard from "./ZoneCard";

// The zones a household can add from Clean → Add a zone: Compound, Laundry,
// Animals… Until now these were written into the app; now they come from here.
export default function ZonePresets() {
  const { data: presets = [] } = useZonePresets();
  const save = useSaveZonePreset();
  const remove = useDeleteZonePreset();
  const notify = useNotify();
  const sorted = [...presets].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-3xl text-[15px] text-ink-2">Offered in Add a zone, in this order. A household can still type a zone of its own.</p>
        <Button
          onClick={() =>
            save.mutate(
              { name: "New zone", sortOrder: (sorted.at(-1)?.sortOrder ?? 0) + 1, tasks: [{ id: `t_${Date.now()}`, label: "", frequency: "weekly" }], consumables: [] },
              { onSuccess: () => notify("Zone added at the end. Name it and save.") },
            )
          }
        >
          <Plus className="size-4" /> Add a zone
        </Button>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {sorted.map((z) => (
          <ZoneCard
            key={z.id + (z.updatedAt ?? "")}
            zone={z}
            busy={save.isPending}
            onSave={(next) => save.mutate(next, { onSuccess: () => notify(`${next.name} saved.`) })}
            onDelete={() => window.confirm(`Stop offering ${z.name}?`) && remove.mutate(z.id, { onSuccess: () => notify(`${z.name} removed.`) })}
          />
        ))}
      </div>
    </>
  );
}
