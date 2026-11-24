/* Premium Features */
import { useState } from "react";

import Button from "@/components/ui/Button";
import { usePremiumFeatures, useSavePremiumFeature } from "@/store/queries/admin";

import { Input } from "../../../components/Field";
import { useNotify } from "../../../components/Notice";
import Panel from "../../../components/Panel";
import Toggle from "../../../components/Toggle";

/**
 * The list on the Premium screen and in onboarding: what a household gets.
 * The feature itself is built into the app; this sets how it is described,
 * whether it is listed, and marks the ones not built yet as "coming soon" so
 * nobody pays for something they cannot use.
 */
export default function PremiumFeatures() {
  const { data: features = [] } = usePremiumFeatures();
  const sorted = [...features].sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <Panel title="What Premium includes" padded={false}>
      <ul>
        {sorted.map((f) => (
          <FeatureRow key={f.id + (f.updatedAt ?? "")} feature={f} />
        ))}
      </ul>
    </Panel>
  );
}

function FeatureRow({ feature }) {
  const save = useSaveFeature();
  const [f, setF] = useState(feature);
  const dirty = f.title !== feature.title || f.description !== feature.description;
  return (
    <li className="grid gap-3 border-b border-line px-5 py-4 last:border-0 md:grid-cols-[1fr_auto] md:items-center">
      <div className="grid gap-2 sm:grid-cols-[14rem_1fr]">
        <Input aria-label="Title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <Input aria-label="Description" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <Toggle label="Coming soon" checked={f.comingSoon} onChange={(comingSoon) => save({ ...f, comingSoon }, setF)} /> Coming soon
        </label>
        <label className="flex items-center gap-2">
          <Toggle label="Listed" checked={f.shown} onChange={(shown) => save({ ...f, shown }, setF)} /> Listed
        </label>
        <Button className="h-9 px-4 text-sm" disabled={!dirty || !f.title.trim()} onClick={() => save(f, setF)}>
          Save
        </Button>
      </div>
    </li>
  );
}

function useSaveFeature() {
  const save = useSavePremiumFeature();
  const notify = useNotify();
  return (next, set) => {
    set(next);
    save.mutate({ id: next.id, title: next.title.trim(), description: next.description.trim(), shown: next.shown, comingSoon: next.comingSoon }, { onSuccess: () => notify(`${next.title} saved.`) });
  };
}
