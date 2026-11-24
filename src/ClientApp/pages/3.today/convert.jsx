/* Convert */
import { ArrowDownUp } from "lucide-react";
import { useState } from "react";

import { useAppCurrencies, useHousehold } from "@/store/queries/app";

import Screen from "../../components/Screen";
import { money } from "../../lib/choices";
import { convert } from "../../lib/home";

// A quick converter with the fixed rate table (FR-CC-1, FR-CC-3).
export default function Convert() {
  const { data: household } = useHousehold();
  const { data } = useAppCurrencies();
  const rates = data?.rates ?? [];
  const [amount, setAmount] = useState("10000");
  const [from, setFrom] = useState(household?.currency ?? "UGX");
  const [to, setTo] = useState(household?.currency === "USD" ? "UGX" : "USD");
  const out = convert(Number(amount) || 0, from, to, rates);

  const select = (value, onChange, label) => (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="h-12 rounded-r-md border border-line bg-white px-3 text-base">
      {rates.map((r) => (
        <option key={r.code} value={r.code}>
          {r.code} · {r.name}
        </option>
      ))}
    </select>
  );

  return (
    <Screen back="/app" title="Convert">
      <div className="space-y-3 rounded-r-stage bg-white p-5 shadow-sh-1">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input
            inputMode="decimal"
            aria-label="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
            className="h-12 min-w-0 rounded-r-md border border-line px-3 font-display text-xl font-semibold outline-none focus:border-clay-700"
          />
          {select(from, setFrom, "From")}
        </div>
        <button
          type="button"
          onClick={() => (setFrom(to), setTo(from))}
          className="mx-auto grid size-10 place-items-center rounded-full border border-line hover:border-clay-700"
          aria-label="Swap currencies"
        >
          <ArrowDownUp className="size-4" />
        </button>
        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
          <output className="font-display text-3xl font-bold" aria-live="polite">
            {out == null ? "—" : money(out, to)}
          </output>
          {select(to, setTo, "To")}
        </div>
      </div>
      {data?.updatedAt && <p className="mt-3 text-sm text-ink-2">Rates last updated {new Date(data.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. A guide, not a bank rate.</p>}
    </Screen>
  );
}
