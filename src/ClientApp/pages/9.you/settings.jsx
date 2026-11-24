/* Settings */
import { useState } from "react";

import { useHousehold, useUpdateHousehold } from "@/store/queries/app";

import Screen from "../../components/Screen";
import { useToast } from "../../components/Toast";
import { CURRENCIES } from "../../lib/choices";

const PREFS = "domease:app:prefs";
const REMINDERS = [
  ["cleaning", "Cleaning due today", "A morning nudge for the day's tasks"],
  ["supplies", "Supplies running low", "When something is marked low"],
  ["plan", "Next week's meals", "Sunday evening"],
];
const readPrefs = () => {
  try {
    return JSON.parse(localStorage.getItem(PREFS) ?? "{}");
  } catch {
    return {};
  }
};

/**
 * The household's currency (prices, the list and the converter follow it)
 * and reminders. Reminders are sent by email on the web once the API sends
 * them; the switches are kept on this device, as on the phone.
 */
export default function SettingsPage() {
  const { data: h } = useHousehold();
  const update = useUpdateHousehold();
  const toast = useToast();
  const [prefs, setPrefs] = useState(readPrefs);
  const flip = (k) => {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next);
    try {
      localStorage.setItem(PREFS, JSON.stringify(next));
    } catch {
      /* not remembered on this device */
    }
  };

  return (
    <Screen back="/app/you" title="Settings">
      <section className="rounded-r-card bg-white p-5 shadow-sh-1">
        <label className="block">
          <span className="block font-semibold">Currency</span>
          <span className="mb-3 block text-sm text-ink-2">Prices, the shopping list and the converter all follow it.</span>
          <select
            value={h?.currency ?? "UGX"}
            onChange={(e) => update.mutate({ currency: e.target.value }, { onSuccess: () => toast("Currency changed.") })}
            className="h-12 w-full rounded-r-md border border-line bg-white px-3 text-base"
          >
            {CURRENCIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-4 text-sm text-ink-2">Measurements are metric: grams, kilograms, millilitres and litres.</p>
      </section>

      <section className="mt-5 rounded-r-card bg-white p-5 shadow-sh-1">
        <h2 className="font-semibold">Reminders</h2>
        <ul className="mt-2 divide-y divide-line">
          {REMINDERS.map(([k, label, note]) => (
            <li key={k} className="flex items-center justify-between gap-4 py-3">
              <span>
                <span className="block">{label}</span>
                <span className="text-sm text-ink-2">{note}</span>
              </span>
              <input type="checkbox" role="switch" checked={!!prefs[k]} onChange={() => flip(k)} className="size-5 accent-clay-700" aria-label={label} />
            </li>
          ))}
        </ul>
      </section>
    </Screen>
  );
}
