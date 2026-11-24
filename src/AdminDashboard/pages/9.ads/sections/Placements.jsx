/* Ad Placements */
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useAdPlacements, useSaveAdPlacement } from "@/store/queries/admin";

import Drawer from "../../../components/Drawer";
import { Field, Input, Select } from "../../../components/Field";
import { useNotify } from "../../../components/Notice";
import StatusChip from "../../../components/StatusChip";
import Toggle from "../../../components/Toggle";

const FORMATS = [
  { id: "banner", label: "Banner" },
  { id: "native", label: "Native (looks like the list)" },
];
// Never full screen or video (PRD FR-AD-2): ads sit inside the page, never over it.
const formatLabel = (id) => FORMATS.find((f) => f.id === id)?.label.split(" (")[0] ?? id;

// AdMob unit ids look like ca-app-pub-1234567890123456/1234567890.
const UNIT = /^ca-app-pub-\d{16}\/\d{10}$/;

/**
 * Where ads may appear, and which AdMob (apps) or AdSense (web app) unit fills
 * each place. The apps read these from /settings/app, so a unit id can change
 * without a store release. Premium households never see any of them.
 */
export default function Placements() {
  const { data: placements = [], isLoading } = useAdPlacements();
  const save = useSaveAdPlacement();
  const notify = useNotify();
  const [form, setForm] = useState(null);

  const ready = (p) => p.admobAndroid && p.admobIos;
  const badUnit = form && [form.admobAndroid, form.admobIos].some((u) => u && !UNIT.test(u.trim()));

  return (
    <>
      <p className="mb-5 max-w-3xl text-[15px] text-ink-2">
        Each place in the app that can show an ad. Turn one off and it disappears from every free household's screen within a minute. A place with no
        unit id shows nothing in the live app (Google's test ads in development builds).
      </p>
      {isLoading && <p className="text-ink-2">Loading</p>}
      <ul className="grid gap-4 md:grid-cols-2">
        {placements.map((p) => (
          <li key={p.id} className="flex flex-col rounded-r-card border border-line bg-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{p.label}</h3>
                <p className="text-sm text-ink-2">{p.note}</p>
              </div>
              <Toggle
                label={`Ads on ${p.label}`}
                checked={p.enabled}
                onChange={(enabled) => save.mutate({ id: p.id, enabled }, { onSuccess: () => notify(enabled ? `Ads on ${p.label} switched on.` : `No ads on ${p.label}.`) })}
              />
            </div>
            <dl className="mt-4 grid flex-1 grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-ink-2">Format</dt>
              <dd>{formatLabel(p.format)}</dd>
              <dt className="text-ink-2">Apps (AdMob)</dt>
              <dd>{ready(p) ? <StatusChip tone="good">Android and iOS set</StatusChip> : <StatusChip tone="warn">Unit ids missing</StatusChip>}</dd>
              <dt className="text-ink-2">Web app (AdSense)</dt>
              <dd>{p.adsenseSlot ? <StatusChip tone="good">Slot set</StatusChip> : <StatusChip>Not set</StatusChip>}</dd>
              <dt className="text-ink-2">Most a day</dt>
              <dd>{p.frequencyCapPerDay ? `${p.frequencyCapPerDay} per person` : "No limit"}</dd>
            </dl>
            <Button variant="ghost" className="mt-4 h-9 self-start px-4 text-sm" onClick={() => setForm({ ...p })}>
              Set up
            </Button>
          </li>
        ))}
      </ul>

      <Drawer
        open={!!form}
        title={form ? `Ads on ${form.label}` : ""}
        onClose={() => setForm(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Button>
            <Button
              disabled={badUnit || save.isPending}
              onClick={() => {
                const { id, ...rest } = form;
                save.mutate(
                  {
                    id,
                    ...rest,
                    admobAndroid: rest.admobAndroid.trim(),
                    admobIos: rest.admobIos.trim(),
                    adsenseSlot: rest.adsenseSlot.trim(),
                    frequencyCapPerDay: Number(rest.frequencyCapPerDay) || null,
                  },
                  { onSuccess: () => (notify("Saved. The apps pick it up on their next start."), setForm(null)) },
                );
              }}
            >
              Save
            </Button>
          </>
        }
      >
        {form && (
          <div className="space-y-5">
            <Field label="Format">
              <Select options={FORMATS} value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} />
            </Field>
            <Field label="AdMob unit id, Android" hint="From AdMob → Apps → DomEase (Android) → Ad units. Looks like ca-app-pub-…/…">
              <Input className="font-mono text-sm" value={form.admobAndroid} onChange={(e) => setForm({ ...form, admobAndroid: e.target.value })} placeholder="ca-app-pub-0000000000000000/0000000000" />
            </Field>
            <Field label="AdMob unit id, iOS">
              <Input className="font-mono text-sm" value={form.admobIos} onChange={(e) => setForm({ ...form, admobIos: e.target.value })} placeholder="ca-app-pub-0000000000000000/0000000000" />
            </Field>
            {badUnit && (
              <p className="text-sm text-danger" role="alert">
                An AdMob unit id looks like ca-app-pub- then 16 digits, a slash and 10 digits.
              </p>
            )}
            <Field label="AdSense slot, web app" hint="The data-ad-slot number from AdSense → Ads → By ad unit.">
              <Input className="font-mono text-sm" inputMode="numeric" value={form.adsenseSlot} onChange={(e) => setForm({ ...form, adsenseSlot: e.target.value })} />
            </Field>
            <Field label="Most a person sees in a day" hint="Leave empty for no limit">
              <Input type="number" min="1" value={form.frequencyCapPerDay ?? ""} onChange={(e) => setForm({ ...form, frequencyCapPerDay: e.target.value })} />
            </Field>
          </div>
        )}
      </Drawer>
    </>
  );
}
