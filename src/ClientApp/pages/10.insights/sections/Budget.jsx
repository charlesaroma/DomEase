/* Budget */
import { Pencil, ShoppingBasket, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import BarChart from "@/components/charts/BarChart";
import Button from "@/components/ui/Button";
import { useBudget, useSaveBudget } from "@/store/queries/app";
import { cn } from "@/utils/cn";

import Sheet, { TextField } from "../../../components/Sheet";
import { useToast } from "../../../components/Toast";
import { money } from "../../../lib/choices";
import { budgetSummary } from "../../../lib/insights";

const short = (date) => new Date(date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

/**
 * The month against the food budget, six months of spending, how the market
 * compares with the list's estimate, and every trip (Done shopping on Shop).
 */
export default function Budget({ currency }) {
  const { data: budget = { monthly: null, trips: [] }, isLoading } = useBudget();
  const save = useSaveBudget();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const s = budgetSummary(budget);
  const fmt = (v) => money(v, currency);
  const over = s.left != null && s.left < 0;

  const remove = (trip) => {
    const before = budget;
    save.mutate({ ...budget, trips: budget.trips.filter((t) => t.id !== trip.id) });
    toast("Trip removed.", { undo: () => save.mutate(before) });
  };

  if (isLoading) return <p className="text-ink-2">Loading</p>;

  return (
    <div className="space-y-6">
      {/* This month */}
      <section className={cn("rounded-r-stage p-6 text-white", over ? "bg-danger" : "bg-sage-800")}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-white/80">Spent on food this month</p>
            <p className="mt-1 font-display text-4xl font-bold tabular-nums">{fmt(s.spent)}</p>
          </div>
          <button type="button" onClick={() => setEditing(true)} className="inline-flex h-9 items-center gap-1.5 rounded-r-pill border border-white/40 px-3 text-sm hover:bg-white/10">
            <Pencil className="size-3.5" aria-hidden="true" /> {s.budget ? "Budget" : "Set a budget"}
          </button>
        </div>
        {s.budget ? (
          <>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/25" role="progressbar" aria-label="Budget used" aria-valuenow={s.percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, s.percent)}%` }} />
            </div>
            <p className="mt-3 text-sm text-white/90">
              {over ? `${fmt(-s.left)} over a budget of ${fmt(s.budget)}.` : `${fmt(s.left)} left of ${fmt(s.budget)}, about ${fmt(Math.floor(s.perDay))} a day to the end of the month.`}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-white/90">Set a monthly budget to see what is left as the month goes.</p>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Trips this month" value={s.trips} />
        <Stat
          label="The market against the list"
          value={s.vsEstimate == null ? "No trips yet" : s.vsEstimate === 0 ? "Right on it" : `${Math.abs(s.vsEstimate)}% ${s.vsEstimate > 0 ? "above" : "under"}`}
          note={s.vsEstimate > 5 ? "Prices may have gone up. The estimate uses the market table." : null}
        />
      </div>

      <section className="rounded-r-card bg-white p-5 shadow-sh-1">
        <h2 className="font-display text-lg font-semibold">Six months of food shopping</h2>
        <div className="mt-4">
          <BarChart data={s.byMonth} format={fmt} title="Food shopping by month" />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Trips</h2>
        {budget.trips.length ? (
          <ul className="divide-y divide-line rounded-r-card bg-white shadow-sh-1">
            {budget.trips.slice(0, 12).map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                <ShoppingBasket className="size-5 shrink-0 text-clay-700" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block">{short(t.date)}</span>
                  <span className="text-xs text-ink-3">
                    {t.items} items{t.estimate ? ` · estimate ${fmt(t.estimate)}` : ""}
                  </span>
                </span>
                <span className="font-semibold tabular-nums">{fmt(t.actual)}</span>
                <button type="button" onClick={() => remove(t)} className="grid size-8 place-items-center rounded-r-pill text-ink-3 hover:bg-paper hover:text-danger" aria-label={`Remove the trip on ${short(t.date)}`}>
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-r-card bg-white p-6 text-center text-ink-2 shadow-sh-1">
            No trips yet. Tick things off on{" "}
            <Link to="/app/shop" className="font-semibold text-clay-700 hover:underline">
              Shop
            </Link>
            , then press Done shopping.
          </p>
        )}
      </section>

      {editing && <SetBudget budget={budget} currency={currency} onClose={() => setEditing(false)} onSave={(monthly) => save.mutate({ ...budget, monthly })} />}
    </div>
  );
}

function Stat({ label, value, note }) {
  return (
    <div className="rounded-r-card bg-white p-5 shadow-sh-1">
      <p className="text-sm text-ink-2">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      {note && <p className="mt-1 text-xs text-ink-2">{note}</p>}
    </div>
  );
}

function SetBudget({ budget, currency, onClose, onSave }) {
  const [value, setValue] = useState(budget.monthly ? String(budget.monthly) : "");
  return (
    <Sheet
      open
      onClose={onClose}
      title="Monthly food budget"
      footer={
        <>
          {budget.monthly && (
            <Button variant="ghost" className="flex-1" onClick={() => (onSave(null), onClose())}>
              Remove
            </Button>
          )}
          <Button className="flex-1" disabled={!Number(value)} onClick={() => (onSave(Number(value)), onClose())}>
            Save
          </Button>
        </>
      }
    >
      <TextField
        label={`A month of food and household shopping (${currency})`}
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))}
        hint="A guide for the family, not a limit. Change it any time."
        autoFocus
      />
    </Sheet>
  );
}
