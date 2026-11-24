/* Recipe Editor */
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";

import { AGE_GROUPS, DIETARY, MEAL_TYPES, OCCASIONS } from "../lib/constants";
import { blankRecipe } from "../lib/recipes";
import Drawer from "./Drawer";
import { ChipSelect, Field, Input, Select, Textarea } from "./Field";
import Toggle from "./Toggle";

const UNITS = ["g", "kg", "ml", "l", "pcs", "tsp", "tbsp", "bunch", "cup"].map((u) => ({ id: u, label: u }));

/**
 * The structured recipe form (PRD section 9, Recipe). Used to add or edit a
 * recipe in the library, and to normalise a household's suggestion before it
 * is published. Recipes are metric only (PRD 7.3).
 */
export default function RecipeEditor({ open, title, initial, saveLabel = "Save recipe", onSave, onClose, busy }) {
  const [r, setR] = useState(initial ?? blankRecipe());
  const set = (patch) => setR((x) => ({ ...x, ...patch }));
  const setIng = (i, patch) => set({ ingredients: r.ingredients.map((g, j) => (j === i ? { ...g, ...patch } : g)) });
  const valid = r.name.trim() && r.ingredients.some((g) => g.name.trim()) && r.steps.some((s) => s.trim());

  function save() {
    onSave({
      ...r,
      name: r.name.trim(),
      servings: Number(r.servings) || 4,
      ingredients: r.ingredients
        .filter((g) => g.name.trim())
        .map((g) => ({ ...g, amount: Number(g.amount) || 1, name: g.name.trim(), substitute: g.substitute?.trim() || undefined })),
      steps: r.steps.map((s) => s.trim()).filter(Boolean),
    });
  }

  return (
    <Drawer
      open={open}
      title={title}
      onClose={onClose}
      wide
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!valid || busy}>
            {busy ? "Saving" : saveLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <Field label="Name">
          <Input value={r.name} onChange={(e) => set({ name: e.target.value })} placeholder="Groundnut stew" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Meal type">
            <Select options={MEAL_TYPES} value={r.mealType} onChange={(e) => set({ mealType: e.target.value })} />
          </Field>
          <Field label="Cuisine">
            <Input value={r.cuisine} onChange={(e) => set({ cuisine: e.target.value })} />
          </Field>
          <Field label="Serves" hint="Scaled to each household">
            <Input type="number" min="1" value={r.servings} onChange={(e) => set({ servings: e.target.value })} />
          </Field>
        </div>
        <Field label="Suitable for">
          <ChipSelect options={AGE_GROUPS} value={r.ageGroups} onChange={(ageGroups) => set({ ageGroups })} />
        </Field>
        <Field label="Benefits" hint="Separate with commas: Fibre, Plant protein">
          <Input value={r.benefits.join(", ")} onChange={(e) => set({ benefits: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
        </Field>

        <div>
          <p className="mb-2 text-sm font-medium">Ingredients</p>
          <div className="space-y-2">
            {r.ingredients.map((g, i) => (
              <div key={i} className="grid grid-cols-[4.5rem_6.5rem_1fr_auto] gap-2 sm:grid-cols-[4.5rem_6.5rem_1fr_1fr_auto]">
                <Input type="number" min="0" step="any" aria-label="Amount" value={g.amount} onChange={(e) => setIng(i, { amount: e.target.value })} />
                <Select aria-label="Unit" options={UNITS} value={g.unit} onChange={(e) => setIng(i, { unit: e.target.value })} />
                <Input aria-label="Ingredient" placeholder="Ingredient" value={g.name} onChange={(e) => setIng(i, { name: e.target.value })} />
                <Input
                  aria-label="Market swap"
                  placeholder="Can't find it? Try"
                  className="col-span-3 sm:col-span-1"
                  value={g.substitute ?? ""}
                  onChange={(e) => setIng(i, { substitute: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => set({ ingredients: r.ingredients.filter((_, j) => j !== i) })}
                  className="grid size-11 place-items-center rounded-r-md text-ink-2 hover:bg-danger-100 hover:text-danger"
                  aria-label="Remove ingredient"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="mt-3 h-9 px-4 text-sm" onClick={() => set({ ingredients: [...r.ingredients, { amount: 1, unit: "pcs", name: "" }] })}>
            <Plus className="size-4" /> Add ingredient
          </Button>
        </div>

        <Field label="Method" hint="One step per line">
          <Textarea rows={6} value={r.steps.join("\n")} onChange={(e) => set({ steps: e.target.value.split("\n") })} />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Dietary support (Premium)" hint="Shown with the medical disclaimer">
            <ChipSelect options={DIETARY} value={r.dietary} onChange={(dietary) => set({ dietary })} />
          </Field>
          <Field label="Special occasions (Premium)">
            <ChipSelect options={OCCASIONS} value={r.occasions} onChange={(occasions) => set({ occasions })} />
          </Field>
        </div>
        <div className="flex items-center justify-between rounded-r-md border border-line px-4 py-3">
          <span className="text-[15px]">Vegetable forward</span>
          <Toggle label="Vegetable forward" checked={!!r.vegForward} onChange={(vegForward) => set({ vegForward })} />
        </div>
      </div>
    </Drawer>
  );
}
