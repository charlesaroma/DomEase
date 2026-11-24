/* Settings */
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useSaveSettings, useSettings } from "@/store/queries/admin";

import { Field, Input, Textarea } from "../../components/Field";
import { useNotify } from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import Panel from "../../components/Panel";
import Toggle from "../../components/Toggle";

const AD_SCREENS = [
  ["today", "Today", "Banner"],
  ["meals", "Meals", "Banner"],
  ["clean", "Clean", "Banner"],
  ["shop", "Shop", "Sponsored product"],
];

export default function Settings() {
  const { data } = useSettings();
  return (
    <>
      <PageHeader title="Settings" body="Prices, ads and the rules the app runs on." />
      {data ? <Editor key={JSON.stringify(data)} initial={data} /> : <p className="text-ink-2">Loading</p>}
    </>
  );
}

function Editor({ initial }) {
  const save = useSaveSettings();
  const notify = useNotify();
  const [s, setS] = useState(initial);
  const dirty = JSON.stringify(s) !== JSON.stringify(initial);
  const num = (v) => (v === "" ? null : Number(v));

  return (
    <div className="space-y-6">
      <Panel title="Premium price">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Monthly, UGX" hint="Leave empty until the price is agreed">
            <Input
              type="number"
              min="0"
              value={s.premium.monthlyPrice ?? ""}
              onChange={(e) => setS({ ...s, premium: { ...s.premium, monthlyPrice: num(e.target.value) } })}
            />
          </Field>
          <Field label="Yearly, UGX">
            <Input
              type="number"
              min="0"
              value={s.premium.yearlyPrice ?? ""}
              onChange={(e) => setS({ ...s, premium: { ...s.premium, yearlyPrice: num(e.target.value) } })}
            />
          </Field>
        </div>
      </Panel>

      <Panel title="Ads on the free plan">
        <p className="mb-4 text-[15px] text-ink-2">AdMob banners and native units only, never full screen or video (FR-AD-2). Premium households never see ads.</p>
        <ul className="divide-y divide-line">
          {AD_SCREENS.map(([key, label, kind]) => (
            <li key={key} className="flex items-center justify-between py-3">
              <span>
                {label} <span className="text-sm text-ink-2">· {kind}</span>
              </span>
              <Toggle label={`Ads on ${label}`} checked={s.ads[key]} onChange={(v) => setS({ ...s, ads: { ...s.ads, [key]: v } })} />
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Free plan zones">
        <Field label="Limit on cleaning zones" hint="Empty means every zone is free, which is the current product decision (PRD section 10).">
          <Input
            type="number"
            min="1"
            className="max-w-40"
            value={s.freeTier.zoneLimit ?? ""}
            onChange={(e) => setS({ ...s, freeTier: { zoneLimit: num(e.target.value) } })}
          />
        </Field>
      </Panel>

      <Panel title="Dietary disclaimer">
        <Field label="Shown on every diabetic and PCOS friendly suggestion" hint="Always visible, on every plan (FR-MP-12).">
          <Textarea value={s.dietaryDisclaimer} onChange={(e) => setS({ ...s, dietaryDisclaimer: e.target.value })} />
        </Field>
      </Panel>

      <Panel title="Support">
        <Field label="Support email shown in the app">
          <Input type="email" value={s.supportEmail} onChange={(e) => setS({ ...s, supportEmail: e.target.value })} />
        </Field>
      </Panel>

      <div className="sticky bottom-4 flex justify-end">
        <Button className="shadow-sh-2" disabled={!dirty || save.isPending} onClick={() => save.mutate(s, { onSuccess: () => notify("Settings saved.") })}>
          Save settings
        </Button>
      </div>
    </div>
  );
}
