/* Exchange Rates */
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useCurrencies, useSaveCurrencies } from "@/store/queries/admin";

import { Input } from "../../../components/Field";
import { useNotify } from "../../../components/Notice";
import Panel from "../../../components/Panel";
import { dateTime } from "../../../lib/format";

// v1 uses a fixed table kept here; the app shows when it was last updated
// (FR-CC-3). Live rates arrive in v1.5.
export default function Currencies() {
  const { data } = useCurrencies();
  if (!data) return <p className="text-ink-2">Loading</p>;
  return <Editor key={data.updatedAt} data={data} />;
}

function Editor({ data }) {
  const save = useSaveCurrencies();
  const notify = useNotify();
  const [rates, setRates] = useState(data.rates);
  const dirty = JSON.stringify(rates) !== JSON.stringify(data.rates);
  const ugx = rates.find((r) => r.code === "UGX")?.perUsd ?? 1;

  return (
    <Panel
      title="Units per 1 US Dollar"
      action={<span className="text-sm text-ink-2">Last updated {dateTime(data.updatedAt)}</span>}
      padded={false}
    >
      <table className="w-full text-[15px]">
        <thead>
          <tr className="border-b border-line text-left text-xs tracking-wide text-ink-2 uppercase">
            <th className="px-5 py-3 font-medium">Currency</th>
            <th className="px-5 py-3 font-medium">Per USD</th>
            <th className="hidden px-5 py-3 font-medium sm:table-cell">1 unit in UGX</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((r, i) => (
            <tr key={r.code} className="border-b border-line">
              <td className="px-5 py-2.5">
                <span className="font-mono font-medium">{r.code}</span> <span className="text-ink-2">{r.name}</span>
              </td>
              <td className="px-5 py-2.5">
                <Input
                  type="number"
                  step="any"
                  min="0"
                  aria-label={`${r.code} per US Dollar`}
                  className="max-w-36 font-mono"
                  value={r.perUsd}
                  disabled={r.code === "USD"}
                  onChange={(e) => setRates(rates.map((x, j) => (j === i ? { ...x, perUsd: Number(e.target.value) } : x)))}
                />
              </td>
              <td className="hidden px-5 py-2.5 font-mono text-ink-2 sm:table-cell">{(ugx / (r.perUsd || 1)).toLocaleString("en-GB", { maximumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end p-4">
        <Button disabled={!dirty || save.isPending} onClick={() => save.mutate(rates, { onSuccess: () => notify("Rates saved and stamped with today's date.") })}>
          Save rates
        </Button>
      </div>
    </Panel>
  );
}
