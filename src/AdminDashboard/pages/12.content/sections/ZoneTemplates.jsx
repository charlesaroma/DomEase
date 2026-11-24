/* Starting Zones */
import { useDeleteZoneTemplate, useSaveZoneTemplate, useZoneTemplates } from "@/store/queries/admin";

import { useNotify } from "../../../components/Notice";
import ZoneCard from "./ZoneCard";

// The zones, tasks and supplies a new household starts with (FR-HM-1).
// Households can rename and edit their own copies in the app.
export default function ZoneTemplates() {
  const { data: zones = [] } = useZoneTemplates();
  const save = useSaveZoneTemplate();
  const remove = useDeleteZoneTemplate();
  const notify = useNotify();
  return (
    <>
      <p className="mb-5 max-w-3xl text-[15px] text-ink-2">Every new household begins with these. Changes apply to homes set up from now on; existing homes keep their own copies.</p>
      <div className="grid gap-6 xl:grid-cols-2">
        {[...zones]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((z) => (
            <ZoneCard
              key={z.id + (z.updatedAt ?? "")}
              zone={z}
              busy={save.isPending}
              onSave={(next) => save.mutate(next, { onSuccess: () => notify(`${next.name} saved.`) })}
              onDelete={
                zones.length > 1
                  ? () => window.confirm(`New homes will no longer start with ${z.name}. Continue?`) && remove.mutate(z.id, { onSuccess: () => notify(`${z.name} removed.`) })
                  : undefined
              }
            />
          ))}
      </div>
    </>
  );
}
