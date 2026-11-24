/* Shop */
import { Plus, RotateCcw, X } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useSaveShopping } from "@/store/queries/app";
import { cn } from "@/utils/cn";

import AdSlot from "../../components/AdSlot";
import Screen from "../../components/Screen";
import Sheet, { TextField } from "../../components/Sheet";
import { useToast } from "../../components/Toast";
import { money } from "../../lib/choices";
import { useShoppingList } from "../../lib/useHome";

const SOURCE = { meal: "For meals", zone: "Running low", manual: "Added by you" };

/**
 * One list for the whole home (FR-SL): ingredients for the week's meals,
 * supplies marked low in Clean, and anything added by hand, grouped by aisle
 * and priced from the market table in the household's currency.
 */
export default function Shop() {
  const { items, state, total, currency, loading } = useShoppingList();
  const save = useSaveShopping();
  const toast = useToast();
  const [adding, setAdding] = useState(false);

  const toggle = (id) => save.mutate({ ...state, checked: state.checked.includes(id) ? state.checked.filter((x) => x !== id) : [...state.checked, id] });
  const removeManual = (item) => {
    const before = state;
    save.mutate({ checked: state.checked.filter((x) => x !== item.id), manual: state.manual.filter((m) => m.id !== item.id) });
    toast(`${item.name} removed.`, { undo: () => save.mutate(before) });
  };
  const newTrip = () => {
    const before = state;
    save.mutate({ ...state, checked: [] });
    toast("A fresh trip: every tick cleared.", { undo: () => save.mutate(before) });
  };

  const groups = items.reduce((g, i) => ((g[i.category] ??= []).push(i), g), {});
  const done = items.filter((i) => i.checked).length;
  const low = items.filter((i) => i.low && !i.checked).length;

  return (
    <Screen
      eyebrow="One list"
      title="Shop"
      actions={
        <>
          <Button variant="ghost" onClick={newTrip} disabled={!done} aria-label="New trip">
            <RotateCcw className="size-4" /> <span className="hidden sm:inline">New trip</span>
          </Button>
          <Button onClick={() => setAdding(true)} aria-label="Add item">
            <Plus className="size-4" /> <span className="hidden sm:inline">Add item</span>
          </Button>
        </>
      }
    >
      <section className="mb-6 rounded-r-stage bg-clay-700 p-6 text-white">
        <p className="text-clay-100">Still to buy, estimated</p>
        <p className="mt-1 font-display text-4xl font-bold">{money(total, currency)}</p>
        <p className="mt-2 text-sm text-clay-100">
          {done} of {items.length} items
          {low > 0 && ` · ${low} running low`}
        </p>
      </section>

      {loading && <p className="text-ink-2">Loading</p>}
      {!loading && !items.length && <p className="rounded-r-card bg-white p-8 text-center text-ink-2 shadow-sh-1">Nothing to buy yet.</p>}

      <div className="space-y-6">
        {Object.entries(groups).map(([aisle, list], gi) => (
          <section key={aisle}>
            <h2 className="mb-2 text-xs font-semibold tracking-[0.16em] text-ink-2 uppercase">{aisle}</h2>
            <ul className="divide-y divide-line rounded-r-card bg-white shadow-sh-1">
              {list.map((i) => (
                <li key={i.id} className="flex items-center gap-3 px-4">
                  <label className="flex flex-1 cursor-pointer items-center gap-3 py-3">
                    <input type="checkbox" checked={i.checked} onChange={() => toggle(i.id)} className="size-5 accent-clay-700" />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block", i.checked && "text-ink-3 line-through")}>{i.name}</span>
                      <span className="text-xs text-ink-3">
                        {i.quantity} · {i.low ? <span className="text-clay-700">Running low</span> : SOURCE[i.source]}
                      </span>
                    </span>
                    <span className={cn("text-sm tabular-nums", i.checked ? "text-ink-3" : "text-ink-2")}>{i.price != null ? money(i.price, currency) : ""}</span>
                  </label>
                  {i.source === "manual" && (
                    <button type="button" onClick={() => removeManual(i)} className="grid size-8 place-items-center rounded-r-pill text-ink-3 hover:bg-paper hover:text-danger" aria-label={`Remove ${i.name}`}>
                      <X className="size-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {gi === 0 && (
              <div className="mt-4">
                <AdSlot screen="shop" items={items.map((x) => x.name)} />
              </div>
            )}
          </section>
        ))}
      </div>

      <AddItem
        open={adding}
        onClose={() => setAdding(false)}
        onAdd={(item) => (save.mutate({ ...state, manual: [...state.manual, item] }), toast(`${item.name} added.`))}
      />
    </Screen>
  );
}

function AddItem({ open, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add to the list"
      footer={
        <Button
          className="w-full"
          disabled={!name.trim()}
          onClick={() => {
            onAdd({ id: `manual_${Date.now()}`, name: name.trim(), category: "Added by you", source: "manual", quantity: quantity.trim() || "1", price: null, low: false });
            setName("");
            setQuantity("");
            onClose();
          }}
        >
          Add
        </Button>
      }
    >
      <div className="space-y-4">
        <TextField label="What" value={name} onChange={(e) => setName(e.target.value)} placeholder="Birthday candles" autoFocus />
        <TextField label="How much" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1 pack" />
      </div>
    </Sheet>
  );
}
