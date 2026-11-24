/* Market Prices */
import { Plus, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import { useDeletePrice, useImportPrices, usePrices, useRecipes, useSavePrice } from "@/store/queries/admin";

import DataTable from "../../components/DataTable";
import Drawer from "../../components/Drawer";
import { Field, Input, Select } from "../../components/Field";
import { useNotify } from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import StatusChip from "../../components/StatusChip";
import { readCsv } from "../../lib/csv";
import { date, money, plural } from "../../lib/format";

const CATEGORIES = ["Produce", "Grains and staples", "Meat and fish", "Dairy", "Bakery", "Household"].map((c) => ({ id: c, label: c }));
const norm = (s) => s.toLowerCase().replace(/[^a-z]/g, "");

/**
 * The market price table behind the Shop tab: every item on a household's
 * list is matched to a row here by name to estimate what the trip will cost.
 * An ingredient with no price is left off the estimate, so the gaps are shown.
 * Prices are in shillings and converted for households in other currencies.
 */
export default function Prices() {
  const { data: prices = [], isLoading } = usePrices();
  const { data: recipes = [] } = useRecipes();
  const save = useSavePrice();
  const remove = useDeletePrice();
  const importRows = useImportPrices();
  const notify = useNotify();
  const file = useRef(null);
  const [form, setForm] = useState(null);

  // Ingredients used by live recipes that have no price: their cost is missing from every estimate.
  const unpriced = useMemo(() => {
    const known = prices.map((p) => norm(p.name));
    const names = new Map();
    for (const r of recipes.filter((x) => x.status === "published"))
      for (const g of r.ingredients) if (!known.some((k) => k && (norm(g.name).includes(k) || k.includes(norm(g.name))))) names.set(norm(g.name), g.name);
    return [...names.values()].sort();
  }, [prices, recipes]);

  const columns = useMemo(
    () => [
      { id: "name", accessorKey: "name", header: "Item", meta: { card: "title" }, cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
      { id: "pack", accessorKey: "pack", header: "Sold as" },
      { id: "price", accessorKey: "price", header: "Price", meta: { align: "right", className: "font-mono" }, cell: ({ getValue }) => money(getValue()) },
      { id: "category", accessorKey: "category", header: "Aisle", cell: ({ getValue }) => <StatusChip>{getValue()}</StatusChip> },
      {
        id: "updatedAt",
        accessorFn: (p) => p.updatedAt ?? p.createdAt ?? "",
        header: "Changed",
        meta: { className: "text-ink-2 whitespace-nowrap" },
        cell: ({ getValue }) => (getValue() ? date(getValue()) : "At launch"),
      },
    ],
    [],
  );

  async function onImport(f) {
    if (!f) return;
    try {
      const rows = await readCsv(f);
      const byName = Object.fromEntries(prices.map((p) => [norm(p.name), p.id]));
      const clean = rows
        .map((r) => ({ name: (r.name ?? r.item ?? "").trim(), pack: (r.pack ?? r["sold as"] ?? "each").trim(), price: Number(String(r.price).replace(/[^\d.]/g, "")), category: (r.category ?? r.aisle ?? "Produce").trim() }))
        .filter((r) => r.name && r.price > 0)
        .map((r) => ({ ...r, id: byName[norm(r.name)] }));
      if (!clean.length) return notify("No rows found. The file needs name, pack, price and category columns.", "bad");
      const updated = clean.filter((r) => r.id).length;
      importRows.mutate(clean, { onSuccess: () => notify(`${plural(updated, "price")} updated, ${clean.length - updated} added.`) });
    } catch {
      notify("That file could not be read as CSV.", "bad");
    }
  }

  return (
    <>
      <PageHeader
        title="Market prices"
        body="What things cost at the market, in shillings. The Shop tab uses these to estimate each household's trip, so keep them close to today's prices."
        actions={
          <>
            <Button variant="ghost" onClick={() => file.current?.click()} disabled={importRows.isPending}>
              <Upload className="size-4" /> Import CSV
            </Button>
            <Button onClick={() => setForm({ name: "", pack: "each", price: "", category: "Produce" })}>
              <Plus className="size-4" /> Add item
            </Button>
          </>
        }
      />
      <input ref={file} type="file" accept=".csv,text/csv" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={(e) => (onImport(e.target.files?.[0]), (e.target.value = ""))} />

      {unpriced.length > 0 && (
        <div className="mb-6 rounded-r-card border border-amber-400 bg-amber-200/30 p-4">
          <p className="font-medium">{plural(unpriced.length, "ingredient")} in live recipes {unpriced.length === 1 ? "has" : "have"} no price, so they are left off shopping estimates:</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {unpriced.slice(0, 24).map((n) => (
              <button key={n} type="button" onClick={() => setForm({ name: n, pack: "each", price: "", category: "Produce" })} className="rounded-r-pill bg-white px-2.5 py-1 text-sm hover:text-clay-700">
                + {n}
              </button>
            ))}
            {unpriced.length > 24 && <span className="px-2 py-1 text-sm text-ink-2">and {unpriced.length - 24} more</span>}
          </div>
        </div>
      )}

      <DataTable
        rows={prices}
        loading={isLoading}
        columns={columns}
        filters={[{ id: "aisle", label: "Aisle", options: CATEGORIES.map((c) => ({ value: c.id, label: c.label })), test: (p, v) => p.category === v }]}
        search={(p) => `${p.name} ${p.category}`}
        searchLabel="Search items"
        onRowClick={(p) => setForm({ ...p })}
        rowActions={(p) => [
          { label: "Edit", onClick: () => setForm({ ...p }) },
          { label: "Delete", danger: true, onClick: () => window.confirm(`Delete ${p.name}?`) && remove.mutate(p.id, { onSuccess: () => notify(`${p.name} deleted.`) }) },
        ]}
        exportName="domease-prices"
        exportRow={({ name, pack, price, category }) => ({ name, pack, price, category })}
        initialSort={{ id: "name" }}
      />
      <p className="mt-3 text-sm text-ink-2">Import takes a CSV with the columns name, pack, price and category. Rows whose name already exists update that price.</p>

      <Drawer
        open={!!form}
        title={form?.id ? `Edit ${form.name}` : "Add an item"}
        onClose={() => setForm(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Button>
            <Button
              disabled={!form?.name?.trim() || !(Number(form?.price) > 0) || save.isPending}
              onClick={() =>
                save.mutate({ ...form, name: form.name.trim(), pack: form.pack.trim() || "each", price: Math.round(Number(form.price)) }, { onSuccess: () => (notify("Price saved."), setForm(null)) })
              }
            >
              Save
            </Button>
          </>
        }
      >
        {form && (
          <div className="space-y-5">
            <Field label="Item" hint="As it appears in recipes, so the list can match it: Tomatoes, Cooking oil">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Sold as" hint="1 kg, bunch, tray of 30">
                <Input value={form.pack} onChange={(e) => setForm({ ...form, pack: e.target.value })} />
              </Field>
              <Field label="Price, UGX">
                <Input type="number" min="0" step="100" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </Field>
            </div>
            <Field label="Aisle" hint="Groups the shopping list">
              <Select options={CATEGORIES} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </Field>
          </div>
        )}
      </Drawer>
    </>
  );
}
