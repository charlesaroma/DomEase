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
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 w-full min-w-0 rounded-r-md border border-line bg-white px-3 text-base outline-none focus:border-clay-700 focus:ring-2 focus:ring-clay-100"
    >
      {rates.map((r) => (
        <option key={r.code} value={r.code}>
          {r.code} · {r.name}
        </option>
      ))}
    </select>
  );

  return (
    <Screen back="/app" title="Convert">
      <div className="rounded-r-stage bg-white p-5 shadow-sh-1 sm:p-6">
        <div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="space-y-2">
            <span className="block text-sm font-medium text-ink-2">From</span>
            <input
              inputMode="decimal"
              aria-label="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              className="h-14 w-full min-w-0 rounded-r-md border border-line px-4 font-display text-2xl font-semibold tabular-nums outline-none focus:border-clay-700 focus:ring-2 focus:ring-clay-100"
            />
            {select(from, setFrom, "From")}
          </div>
          <button
            type="button"
            onClick={() => (setFrom(to), setTo(from))}
            className="mx-auto grid size-11 place-items-center rounded-full border border-line bg-white transition-colors hover:border-clay-700 hover:text-clay-700 sm:mb-14"
            aria-label="Swap currencies"
          >
            <ArrowDownUp className="size-4 sm:-rotate-90" />
          </button>
          <div className="space-y-2">
            <span className="block text-sm font-medium text-ink-2">To</span>
            <output className="flex h-14 items-center overflow-x-auto rounded-r-md bg-clay-100/50 px-4 font-display text-2xl font-bold whitespace-nowrap tabular-nums text-clay-800" aria-live="polite">
              {out == null ? <span className="text-base font-medium text-ink-2">Choose two currencies</span> : money(out, to)}
            </output>
            {select(to, setTo, "To")}
          </div>
        </div>
      </div>
      {data?.updatedAt && <p className="mt-3 text-sm text-ink-2">Rates last updated {new Date(data.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. A guide, not a bank rate.</p>}
    </Screen>
  );
}
