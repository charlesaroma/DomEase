/* Done Shopping */
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useBudget, useSaveBudget, useSaveShopping } from "@/store/queries/app";

import Sheet, { TextField } from "../../../components/Sheet";
import { useToast } from "../../../components/Toast";
import { money } from "../../../lib/choices";

/**
 * The end of a market trip: what it really cost, saved as a trip, then the
 * ticks cleared for next time. Every home keeps the record; Premium shows it
 * against a monthly budget (Insights).
 */
export default function DoneShopping({ open, onClose, items, state, currency, premium }) {
  if (!open) return null;
  return <Finish onClose={onClose} items={items} state={state} currency={currency} premium={premium} />;
}

function Finish({ onClose, items, state, currency, premium }) {
  const { data: budget = { monthly: null, trips: [] } } = useBudget();
  const saveBudget = useSaveBudget();
  const saveShopping = useSaveShopping();
  const toast = useToast();
  const bought = items.filter((i) => i.checked);
  const estimate = Math.round(bought.reduce((n, i) => n + (i.price ?? 0), 0));
  const [paid, setPaid] = useState(estimate ? String(estimate) : "");
  const amount = Number(paid) || 0;

  // Ticked items come off; anything added by hand and bought goes too.
  const cleared = { checked: [], manual: state.manual.filter((m) => !state.checked.includes(m.id)) };
  const finish = (record) => {
    const before = { shopping: state, budget };
    saveShopping.mutate(cleared);
    if (record) saveBudget.mutate({ ...budget, trips: [{ id: `trip_${Date.now()}`, date: new Date().toISOString(), estimate, actual: amount, items: bought.length }, ...budget.trips] });
    toast(record ? `Trip saved: ${money(amount, currency)}.` : "Ticks cleared for the next trip.", {
      undo: () => (saveShopping.mutate(before.shopping), record && saveBudget.mutate(before.budget)),
    });
    onClose();
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title="Done shopping"
      footer={
        <>
          <Button variant="ghost" className="flex-1" onClick={() => finish(false)}>
            Just clear ticks
          </Button>
          <Button className="flex-1" disabled={!amount} onClick={() => finish(true)}>
            Save the trip
          </Button>
        </>
      }
    >
      <p className="text-ink-2">
        {bought.length} {bought.length === 1 ? "item" : "items"} bought, estimated at <strong className="text-ink">{money(estimate, currency)}</strong>.
      </p>
      <div className="mt-5">
        <TextField
          label={`What did it cost? (${currency})`}
          inputMode="numeric"
          value={paid}
          onChange={(e) => setPaid(e.target.value.replace(/[^\d]/g, ""))}
          hint="Include anything bought that wasn't on the list."
          autoFocus
        />
      </div>
      {amount > 0 && estimate > 0 && (
        <p className="mt-3 text-sm text-ink-2">
          {amount > estimate ? `${money(amount - estimate, currency)} more than the estimate.` : amount < estimate ? `${money(estimate - amount, currency)} under the estimate.` : "Right on the estimate."}
        </p>
      )}
      {!premium && <p className="mt-5 rounded-r-md bg-amber-200/40 p-3 text-sm text-ink-2">Premium keeps every trip against a monthly food budget, so you see where the money goes.</p>}
    </Sheet>
  );
}
