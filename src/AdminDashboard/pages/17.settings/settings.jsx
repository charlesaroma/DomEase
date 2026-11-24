/* Settings */
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import Button from "@/components/ui/Button";
import { useSaveSettings, useSettings } from "@/store/queries/admin";

import { Field, Input, Textarea } from "../../components/Field";
import { useNotify } from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import Panel from "../../components/Panel";
import Toggle from "../../components/Toggle";

export default function Settings() {
  const { data } = useSettings();
  return (
    <>
      <PageHeader title="Settings" body="Prices and the rules the app runs on." />
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

      <Panel title="Free trial">
        <Field label="Days of Premium free for a new household" hint="0 for no trial. The trial starts when a home is set up, and the app says how many days are left.">
          <Input type="number" min="0" max="90" className="max-w-40" value={s.trialDays ?? 0} onChange={(e) => setS({ ...s, trialDays: Number(e.target.value) || 0 })} />
        </Field>
      </Panel>

      <Link to="/admin/ads" className="flex items-center justify-between rounded-r-card border border-line bg-white px-5 py-4 hover:border-clay-700">
        <span>
          <span className="block font-semibold">Ads on the free plan</span>
          <span className="text-[15px] text-ink-2">Where they appear, AdMob and AdSense units, sponsored products and earnings.</span>
        </span>
        <ArrowRight className="size-5 text-clay-700" />
      </Link>

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

      <Panel title="App versions and maintenance">
        <div className="space-y-5">
          <Field label="Oldest app version allowed" hint="Anyone on an older version is asked to update before carrying on. Raise it only when an old version would break.">
            <Input className="max-w-40 font-mono" value={s.minAppVersion ?? ""} onChange={(e) => setS({ ...s, minAppVersion: e.target.value.trim() })} placeholder="1.0.0" />
          </Field>
          <div className="flex items-center justify-between gap-6 rounded-r-md border border-line px-4 py-3">
            <span>
              <span className="block text-[15px]">Maintenance mode</span>
              <span className="block text-xs text-ink-2">The apps and the web app show the message below instead of the household's screens.</span>
            </span>
            <Toggle label="Maintenance mode" checked={!!s.maintenance?.on} onChange={(on) => setS({ ...s, maintenance: { ...s.maintenance, on } })} />
          </div>
          <Field label="Message while in maintenance">
            <Textarea rows={2} value={s.maintenance?.message ?? ""} onChange={(e) => setS({ ...s, maintenance: { ...s.maintenance, message: e.target.value } })} />
          </Field>
        </div>
      </Panel>

      <div className="sticky bottom-4 flex justify-end">
        <Button
          className="shadow-sh-2"
          disabled={!dirty || save.isPending || (s.minAppVersion && !/^\d+\.\d+\.\d+$/.test(s.minAppVersion))}
          onClick={() =>
            (!s.maintenance?.on || initial.maintenance?.on || window.confirm("Turn on maintenance mode? Every household is locked out until you turn it off.")) &&
            save.mutate(s, { onSuccess: () => notify("Settings saved.") })
          }
        >
          Save settings
        </Button>
      </div>
    </div>
  );
}
