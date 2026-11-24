/* Recipe Editor */
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  ImageOff,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import RecipeView from "@/components/recipes/RecipeView";
import Button from "@/components/ui/Button";
import { useSettings } from "@/store/queries/admin";
import { cn } from "@/utils/cn";

import {
  AGE_GROUPS,
  DIETARY,
  MEAL_TYPES,
  OCCASIONS,
  RECIPE_STATUS,
} from "../lib/constants";
import {
  blankRecipe,
  blankVariant,
  cleanIngredients,
  cleanSteps,
  recipeGaps,
  UNITS,
} from "../lib/recipes";
import Drawer from "./Drawer";
import { ChipSelect, Field, Input, Select, Textarea } from "./Field";
import ImageUploader from "./ImageUploader";
import Stepper from "./Stepper";
import Toggle from "./Toggle";

const STEPS = [
  { id: "details", label: "Details", hint: "Name, meal, time" },
  { id: "photos", label: "Photos", hint: "Cover and gallery" },
  { id: "ingredients", label: "Ingredients", hint: "With market swaps" },
  { id: "method", label: "Method", hint: "Step by step" },
  { id: "healthy", label: "Healthier version", hint: "Optional, Premium" },
  { id: "review", label: "Review", hint: "Who sees it" },
];

/**
 * The structured recipe form (PRD section 9, Recipe), one step at a time,
 * with a phone-sized preview of what households will see beside it. A new
 * recipe goes through the steps in order; an existing one can jump to any
 * step and be saved from anywhere. Used to add or edit a
 * recipe in the library, and to tidy a household's suggestion before it is
 * published. Recipes are metric only (PRD 7.3).
 */
export default function RecipeEditor({
  open,
  title,
  initial,
  saveLabel = "Save recipe",
  onSave,
  onClose,
  busy,
}) {
  const { data: settings } = useSettings();
  const [r, setR] = useState(() => ({ ...blankRecipe(), ...initial }));
  const editing = !!initial?.id;
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(editing ? STEPS.length - 1 : 0);
  const [preview, setPreview] = useState(true);
  const set = (patch) => setR((x) => ({ ...x, ...patch }));
  const gaps = recipeGaps(r);
  const photos = [r.photo, ...(r.gallery ?? [])].filter((p) => p?.url);
  const at = STEPS[step].id;

  // What each step still needs before the recipe can go live.
  const missing = {
    details: !r.name.trim() ? "Give the recipe a name." : null,
    ingredients: !r.ingredients.some((g) => g.name?.trim())
      ? "Add at least one ingredient."
      : null,
    method: !r.steps.some((x) => x.trim()) ? "Add at least one step." : null,
  };
  const steps = STEPS.map((x) => ({
    ...x,
    invalid: !!missing[x.id],
    label:
      x.id === "photos" && photos.length
        ? `Photos (${photos.length})`
        : x.label,
  }));
  const go = (i) => {
    setStep(i);
    setReached((n) => Math.max(n, i));
  };

  function save() {
    const variant = r.healthyVariant;
    onSave({
      ...r,
      name: r.name.trim(),
      servings: Number(r.servings) || 4,
      prepMinutes: Number(r.prepMinutes) || 0,
      cookMinutes: Number(r.cookMinutes) || 0,
      photo: photos[0] ?? null,
      gallery: photos.slice(1),
      ingredients: cleanIngredients(r.ingredients),
      steps: cleanSteps(r.steps),
      healthyVariant:
        variant &&
        (variant.summary?.trim() ||
          variant.ingredients?.some((g) => g.name?.trim()))
          ? {
              ...variant,
              summary: variant.summary.trim(),
              ingredients: cleanIngredients(variant.ingredients),
              steps: cleanSteps(variant.steps),
            }
          : undefined,
    });
  }

  return (
    <Drawer
      open={open}
      title={title}
      onClose={onClose}
      wide="xl"
      flush
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-2">
            {at === "review"
              ? gaps.length
                ? `Still needs ${gaps.join(", ")}.`
                : !photos.length
                  ? "Ready. A photo makes it far more likely to be cooked."
                  : "Ready."
              : `Step ${step + 1} of ${STEPS.length}`}
          </p>
          <div className="flex gap-2">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => go(step - 1)}>
                <ArrowLeft className="size-4" /> Back
              </Button>
            ) : (
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            )}
            {editing && at !== "review" && (
              <Button
                variant="ghost"
                onClick={save}
                disabled={gaps.length > 0 || busy}
              >
                {busy ? "Saving" : "Save changes"}
              </Button>
            )}
            {at === "review" ? (
              <Button onClick={save} disabled={gaps.length > 0 || busy}>
                {busy ? "Saving" : saveLabel}
              </Button>
            ) : (
              <Button
                onClick={() => go(step + 1)}
                disabled={!editing && !!missing[at]}
              >
                Next <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="grid h-full lg:grid-cols-[1fr_380px]">
        {/* Form */}
        <div className="overflow-y-auto px-6 pt-2 pb-8">
          <div className="sticky top-0 z-10 -mx-6 mb-6 border-b border-line bg-white px-6 pt-4 pb-4">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <Stepper
                  steps={steps}
                  current={step}
                  reached={reached}
                  onSelect={go}
                  free={editing}
                />
              </div>
              <button
                type="button"
                onClick={() => setPreview((p) => !p)}
                className="hidden shrink-0 items-center gap-1.5 pt-1.5 text-sm text-ink-2 hover:text-ink lg:inline-flex"
                aria-pressed={preview}
              >
                {preview ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}{" "}
                Preview
              </button>
            </div>
          </div>

          {missing[at] && step < reached && (
            <p
              className="mb-5 rounded-r-md bg-danger-100 px-4 py-3 text-sm text-danger"
              role="alert"
            >
              {missing[at]}
            </p>
          )}

          {at === "details" && (
            <div className="space-y-6">
              <Field label="Name">
                <Input
                  value={r.name}
                  onChange={(e) => set({ name: e.target.value })}
                  placeholder="Groundnut stew"
                  autoFocus
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Meal type">
                  <Select
                    options={MEAL_TYPES}
                    value={r.mealType}
                    onChange={(e) => set({ mealType: e.target.value })}
                  />
                </Field>
                <Field label="Cuisine">
                  <Input
                    value={r.cuisine}
                    onChange={(e) => set({ cuisine: e.target.value })}
                  />
                </Field>
                <Field label="Serves" hint="Scaled to each household">
                  <Input
                    type="number"
                    min="1"
                    value={r.servings}
                    onChange={(e) => set({ servings: e.target.value })}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Preparation, minutes">
                  <Input
                    type="number"
                    min="0"
                    value={r.prepMinutes ?? ""}
                    onChange={(e) => set({ prepMinutes: e.target.value })}
                  />
                </Field>
                <Field label="Cooking, minutes">
                  <Input
                    type="number"
                    min="0"
                    value={r.cookMinutes ?? ""}
                    onChange={(e) => set({ cookMinutes: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Suitable for">
                <ChipSelect
                  options={AGE_GROUPS}
                  value={r.ageGroups}
                  onChange={(ageGroups) => set({ ageGroups })}
                />
              </Field>
              <Field
                label="Benefits"
                hint="Separate with commas: Fibre, Plant protein"
              >
                <Input
                  defaultValue={r.benefits.join(", ")}
                  onBlur={(e) =>
                    set({
                      benefits: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </Field>
              <Row
                label="Vegetable forward"
                hint="Counts towards the household's vegetable goal"
              >
                <Toggle
                  label="Vegetable forward"
                  checked={!!r.vegForward}
                  onChange={(vegForward) => set({ vegForward })}
                />
              </Row>
            </div>
          )}

          {at === "photos" && (
            <div className="space-y-4">
              <ImageUploader
                label="Photos"
                folder="recipes"
                max={7}
                aspect="aspect-[4/3]"
                altFrom={r.name}
                value={photos}
                onChange={(list) =>
                  set({ photo: list[0] ?? null, gallery: list.slice(1) })
                }
                hint="The first is the cover on the meal plan and at the top of the recipe. Up to six more show as a gallery. Shoot in daylight, the finished dish, from slightly above."
              />
            </div>
          )}

          {at === "ingredients" && (
            <IngredientList
              list={r.ingredients}
              onChange={(ingredients) => set({ ingredients })}
            />
          )}

          {at === "method" && (
            <StepList list={r.steps} onChange={(steps) => set({ steps })} />
          )}

          {at === "healthy" && (
            <div className="space-y-6">
              <p className="text-[15px] text-ink-2">
                A lighter way to make the same dish, shown under the recipe to
                Premium households. Used most for pastries (PRD FR-MP-10).
              </p>
              {r.healthyVariant ? (
                <>
                  <Field label="What changes" hint="One or two sentences">
                    <Textarea
                      rows={3}
                      value={r.healthyVariant.summary}
                      onChange={(e) =>
                        set({
                          healthyVariant: {
                            ...r.healthyVariant,
                            summary: e.target.value,
                          },
                        })
                      }
                    />
                  </Field>
                  <IngredientList
                    list={r.healthyVariant.ingredients}
                    onChange={(ingredients) =>
                      set({
                        healthyVariant: { ...r.healthyVariant, ingredients },
                      })
                    }
                  />
                  <StepList
                    list={r.healthyVariant.steps}
                    onChange={(steps) =>
                      set({ healthyVariant: { ...r.healthyVariant, steps } })
                    }
                  />
                  <Button
                    variant="ghost"
                    className="h-9 px-4 text-sm"
                    onClick={() => set({ healthyVariant: undefined })}
                  >
                    <Trash2 className="size-4" /> Remove the healthier version
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => set({ healthyVariant: blankVariant() })}
                >
                  <Plus className="size-4" /> Add a healthier version
                </Button>
              )}
            </div>
          )}

          {at === "review" && (
            <div className="space-y-6">
              <ul className="divide-y divide-line rounded-r-card border border-line">
                {[
                  [!missing.details, r.name.trim() || "No name yet", "details"],
                  [
                    photos.length > 0,
                    photos.length
                      ? `${photos.length} photo${photos.length === 1 ? "" : "s"}`
                      : "No photo: households see a plain placeholder",
                    "photos",
                    true,
                  ],
                  [
                    !missing.ingredients,
                    `${r.ingredients.filter((g) => g.name?.trim()).length} ingredients`,
                    "ingredients",
                  ],
                  [
                    !missing.method,
                    `${r.steps.filter((x) => x.trim()).length} steps`,
                    "method",
                  ],
                  [
                    true,
                    r.healthyVariant
                      ? "Has a healthier version"
                      : "No healthier version (optional)",
                    "healthy",
                  ],
                ].map(([ok, text, id, soft]) => (
                  <li
                    key={id}
                    className="flex items-center gap-3 px-4 py-3 text-[15px]"
                  >
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full ${ok ? "bg-sage-100 text-sage-800" : soft ? "bg-amber-200/60 text-amber-800" : "bg-danger-100 text-danger"}`}
                    >
                      {ok ? (
                        <Check className="size-3.5" strokeWidth={3} />
                      ) : soft ? (
                        <ImageOff className="size-3.5" />
                      ) : (
                        "!"
                      )}
                    </span>
                    <span className="flex-1">{text}</span>
                    <button
                      type="button"
                      onClick={() => go(STEPS.findIndex((x) => x.id === id))}
                      className="text-sm text-clay-700 hover:underline"
                    >
                      Change
                    </button>
                  </li>
                ))}
              </ul>
              <Field label="Status">
                <div className="grid gap-2 sm:grid-cols-3">
                  {Object.entries(RECIPE_STATUS).map(([id, s]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => set({ status: id })}
                      aria-pressed={r.status === id}
                      className={cn(
                        "rounded-r-md border px-4 py-3 text-left",
                        r.status === id
                          ? "border-clay-700 bg-clay-100/60"
                          : "border-line hover:border-line-2",
                      )}
                    >
                      <span className="block font-medium">{s.label}</span>
                      <span className="text-sm text-ink-2">
                        {
                          {
                            published: "In the app now",
                            draft: "Only you can see it",
                            archived: "Taken out of the app",
                          }[id]
                        }
                      </span>
                    </button>
                  ))}
                </div>
              </Field>
              <Row
                label="Premium recipe"
                hint="Free households see the photo and name with a lock, and the plan never gives it to them."
              >
                <Toggle
                  label="Premium recipe"
                  checked={!!r.isPremium}
                  onChange={(isPremium) => set({ isPremium })}
                />
              </Row>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="Dietary support (Premium)"
                  hint="Shown with the medical disclaimer"
                >
                  <ChipSelect
                    options={DIETARY}
                    value={r.dietary}
                    onChange={(dietary) => set({ dietary })}
                  />
                </Field>
                <Field
                  label="Special occasions (Premium)"
                  hint="Occasion recipes stay out of the weekly plan"
                >
                  <ChipSelect
                    options={OCCASIONS}
                    value={r.occasions}
                    onChange={(occasions) => set({ occasions })}
                  />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <aside
            className="hidden overflow-y-auto border-l border-line bg-paper-2/60 p-5 lg:block"
            aria-label="Preview"
          >
            <p className="mb-3 text-xs font-medium tracking-wide text-ink-2 uppercase">
              As a household of 4 sees it
            </p>
            <div className="overflow-hidden rounded-[28px] border-[6px] border-ink bg-paper shadow-sh-2">
              <RecipeView
                recipe={r}
                people={4}
                premium
                disclaimer={settings?.dietaryDisclaimer}
                compact
              />
            </div>
          </aside>
        )}
      </div>
    </Drawer>
  );
}

function Row({ label, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-6 rounded-r-md border border-line px-4 py-3">
      <span>
        <span className="block text-[15px]">{label}</span>
        {hint && <span className="block text-xs text-ink-2">{hint}</span>}
      </span>
      {children}
    </div>
  );
}

/** Amount, unit, name and a market swap, one row each. */
function IngredientList({ list, onChange }) {
  const setRow = (i, patch) =>
    onChange(list.map((g, j) => (j === i ? { ...g, ...patch } : g)));
  return (
    <div>
      <p className="mb-2 text-sm font-medium">Ingredients</p>
      <div className="space-y-2">
        {list.map((g, i) => (
          <div
            key={i}
            className="grid grid-cols-[4.5rem_6.5rem_1fr_auto] gap-2 sm:grid-cols-[4.5rem_6.5rem_1fr_1fr_auto]"
          >
            <Input
              type="number"
              min="0"
              step="any"
              aria-label="Amount"
              value={g.amount}
              onChange={(e) => setRow(i, { amount: e.target.value })}
            />
            <Select
              aria-label="Unit"
              options={UNITS}
              value={g.unit}
              onChange={(e) => setRow(i, { unit: e.target.value })}
            />
            <Input
              aria-label="Ingredient"
              placeholder="Ingredient"
              value={g.name}
              onChange={(e) => setRow(i, { name: e.target.value })}
            />
            <Input
              aria-label="Market swap"
              placeholder="Can't find it? Try"
              className="col-span-3 sm:col-span-1"
              value={g.substitute ?? ""}
              onChange={(e) => setRow(i, { substitute: e.target.value })}
            />
            <button
              type="button"
              onClick={() => onChange(list.filter((_, j) => j !== i))}
              className="grid size-11 place-items-center rounded-r-md text-ink-2 hover:bg-danger-100 hover:text-danger"
              aria-label="Remove ingredient"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        className="mt-3 h-9 px-4 text-sm"
        onClick={() =>
          onChange([...list, { amount: 1, unit: "pcs", name: "" }])
        }
      >
        <Plus className="size-4" /> Add ingredient
      </Button>
    </div>
  );
}

/** Numbered steps, one box each. */
function StepList({ list, onChange }) {
  const setRow = (i, v) => onChange(list.map((s, j) => (j === i ? v : s)));
  return (
    <div>
      <p className="mb-2 text-sm font-medium">Method</p>
      <ol className="space-y-2">
        {list.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2.5 grid size-7 shrink-0 place-items-center rounded-full bg-clay-700 text-xs font-semibold text-white">
              {i + 1}
            </span>
            <Textarea
              rows={2}
              className="min-h-0"
              aria-label={`Step ${i + 1}`}
              value={s}
              onChange={(e) => setRow(i, e.target.value)}
            />
            <button
              type="button"
              onClick={() => onChange(list.filter((_, j) => j !== i))}
              className="grid size-11 shrink-0 place-items-center rounded-r-md text-ink-2 hover:bg-danger-100 hover:text-danger"
              aria-label={`Remove step ${i + 1}`}
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ol>
      <Button
        variant="ghost"
        className="mt-3 h-9 px-4 text-sm"
        onClick={() => onChange([...list, ""])}
      >
        <Plus className="size-4" /> Add step
      </Button>
    </div>
  );
}
