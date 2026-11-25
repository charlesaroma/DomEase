/* Ad Performance */
import { Info, MousePointerClick, Percent, Wallet, Eye } from "lucide-react";
import { useMemo, useState } from "react";

import { useAdPlacements, useAdStats } from "@/store/queries/admin";
import { cn } from "@/utils/cn";

import BarChart from "@/components/charts/BarChart";
import Panel from "../../../components/Panel";
import StatCard from "../../../components/StatCard";

const RANGES = [
  { id: 7, label: "7 days" },
  { id: 30, label: "30 days" },
];
const usd = (n) => `$${n.toFixed(n < 10 ? 2 : 0)}`;
const count = (n) => Math.round(n).toLocaleString("en-GB");
const shortDate = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/**
 * What the ads earn: impressions, clicks and money per day and per place.
 * The API pulls these from the AdMob Reporting API (and AdSense for the web);
 * until AdMob is connected, demo figures show the layout.
 */
export default function Performance() {
  const [days, setDays] = useState(30);
  const [range] = useState(() => {
    const iso = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
    return { 7: { from: iso(7), to: iso(1) }, 30: { from: iso(30), to: iso(1) } };
  });
  const { data } = useAdStats(range[days]);
  const { data: placements = [] } = useAdPlacements();
  const rows = useMemo(() => data?.rows ?? [], [data]);

  const totals = rows.reduce((t, r) => ({ imp: t.imp + r.impressions, clicks: t.clicks + r.clicks, earn: t.earn + r.earningsUsd }), { imp: 0, clicks: 0, earn: 0 });
  const ctr = totals.imp ? (totals.clicks / totals.imp) * 100 : 0;
  const ecpm = totals.imp ? (totals.earn / totals.imp) * 1000 : 0;

  const daily = useMemo(() => {
    const by = {};
    for (const r of rows) by[r.date] = (by[r.date] ?? 0) + r.earningsUsd;
    return Object.keys(by)
      .sort()
      .map((d) => ({ key: d, label: shortDate(d), value: Math.round(by[d] * 100) / 100 }));
  }, [rows]);

  const byPlace = placements.map((p) => {
    const mine = rows.filter((r) => r.placement === p.id);
    const imp = mine.reduce((n, r) => n + r.impressions, 0);
    const clicks = mine.reduce((n, r) => n + r.clicks, 0);
    const earn = mine.reduce((n, r) => n + r.earningsUsd, 0);
    return { ...p, imp, clicks, earn, ctr: imp ? (clicks / imp) * 100 : 0, ecpm: imp ? (earn / imp) * 1000 : 0 };
  });
  const maxEarn = Math.max(1, ...byPlace.map((p) => p.earn));

  return (
    <div className="space-y-6">
      {data?.source === "demo" && (
        <div className="flex gap-3 rounded-r-card border border-amber-400 bg-amber-200/30 p-4 text-[15px]">
          <Info className="mt-0.5 size-5 shrink-0 text-amber-800" aria-hidden="true" />
          <div>
            <p className="font-medium">AdMob is not connected yet. These are example figures.</p>
            <p className="mt-1 text-ink-2">
              Once the API is linked to the DomEase AdMob account (Reporting API, read only), real impressions and earnings replace these, refreshed
              every few hours. AdMob reports in US dollars.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <div className="inline-flex rounded-r-pill border border-line bg-white p-0.5" role="group" aria-label="Period">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={days === r.id}
              onClick={() => setDays(r.id)}
              className={cn("h-9 rounded-r-pill px-4 text-sm", days === r.id ? "bg-clay-700 text-white" : "text-ink-2 hover:text-ink")}
            >
              Last {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Earned" value={usd(totals.earn)} note={`Last ${days} days`} icon={Wallet} tone="good" />
        <StatCard label="Ads seen" value={count(totals.imp)} note="Impressions" icon={Eye} />
        <StatCard label="Taps" value={count(totals.clicks)} note={`${ctr.toFixed(2)}% of ads seen`} icon={MousePointerClick} />
        <StatCard label="Per 1,000 seen" value={usd(ecpm)} note="eCPM" icon={Percent} tone="sage" />
      </div>

      <Panel title={`Earned a day, last ${days} days (US dollars)`}>
        <BarChart data={daily} format={usd} title={`Ad earnings a day, last ${days} days`} />
      </Panel>

      <Panel title="By place in the app" padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="border-b border-line text-xs tracking-wide text-ink-2 uppercase">
                <th className="px-5 py-3 font-medium">Place</th>
                <th className="px-5 py-3 text-right font-medium">Seen</th>
                <th className="px-5 py-3 text-right font-medium">Taps</th>
                <th className="px-5 py-3 text-right font-medium">Tap rate</th>
                <th className="px-5 py-3 text-right font-medium">eCPM</th>
                <th className="w-1/4 px-5 py-3 font-medium">Earned</th>
              </tr>
            </thead>
            <tbody>
              {byPlace.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3">
                    <span className="font-medium">{p.label}</span>
                    {!p.enabled && <span className="ml-2 text-xs text-ink-3">switched off</span>}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{count(p.imp)}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{count(p.clicks)}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{p.ctr.toFixed(2)}%</td>
                  <td className="px-5 py-3 text-right tabular-nums">{usd(p.ecpm)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
                        <div className="h-full rounded-full bg-clay-700" style={{ width: `${(p.earn / maxEarn) * 100}%` }} />
                      </div>
                      <span className="w-16 text-right font-mono text-sm">{usd(p.earn)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
