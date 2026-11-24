/* Recipe Columns */
import RecipePhoto from "@/components/recipes/RecipePhoto";
import { totalMinutes } from "@/utils/recipes";

import StatusChip from "../../../components/StatusChip";
import Toggle from "../../../components/Toggle";
import { DIETARY, MEAL_TYPES, OCCASIONS, RECIPE_STATUS } from "../../../lib/constants";

const mealLabel = (id) => MEAL_TYPES.find((m) => m.id === id)?.label ?? id;

/** The library table. `onPremium(recipe, on)` flips a recipe's Premium flag in place. */
export const recipeColumns = ({ onPremium }) => [
  {
    id: "name",
    accessorKey: "name",
    header: "Recipe",
    meta: { card: "title" },
    cell: ({ row: { original: r } }) => (
      <div className="flex items-center gap-3">
        <RecipePhoto recipe={r} className="size-12 shrink-0 rounded-r-md" iconClassName="size-5" />
        <div className="min-w-0">
          <p className="truncate font-medium">{r.name}</p>
          <p className="text-sm text-ink-2">
            {r.cuisine} · serves {r.servings}
            {totalMinutes(r) > 0 && ` · ${totalMinutes(r)} min`}
          </p>
        </div>
      </div>
    ),
  },
  { id: "mealType", accessorKey: "mealType", header: "Meal", cell: ({ getValue }) => mealLabel(getValue()) },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const s = RECIPE_STATUS[getValue()] ?? RECIPE_STATUS.published;
      return <StatusChip tone={s.tone}>{s.label}</StatusChip>;
    },
  },
  {
    id: "photo",
    accessorFn: (r) => (r.photo?.url ? 1 + (r.gallery?.length ?? 0) : 0),
    header: "Photos",
    meta: { className: "tabular-nums" },
    cell: ({ getValue }) => (getValue() ? getValue() : <StatusChip tone="warn">None yet</StatusChip>),
  },
  {
    id: "isPremium",
    accessorFn: (r) => !!r.isPremium,
    header: "Premium",
    cell: ({ row: { original: r } }) => <Toggle label={`Premium: ${r.name}`} checked={!!r.isPremium} onChange={(on) => onPremium(r, on)} />,
  },
  {
    id: "extras",
    header: "Premium extras",
    meta: { className: "hidden xl:table-cell", headClassName: "hidden xl:table-cell" },
    cell: ({ row: { original: r } }) => (
      <div className="flex flex-wrap gap-1">
        {r.dietary?.map((d) => (
          <StatusChip key={d} tone="premium">
            {DIETARY.find((x) => x.id === d)?.label.replace(" friendly", "")}
          </StatusChip>
        ))}
        {r.healthyVariant && <StatusChip tone="premium">Healthier version</StatusChip>}
        {r.occasions?.map((o) => (
          <StatusChip key={o} tone="premium">
            {OCCASIONS.find((x) => x.id === o)?.label}
          </StatusChip>
        ))}
      </div>
    ),
  },
];

/** Filters above the table: meal, status, Premium, photo, dietary and occasion. */
export const recipeFilters = [
  { id: "meal", label: "Meal", options: MEAL_TYPES.map((m) => ({ value: m.id, label: m.label })), test: (r, v) => r.mealType === v },
  {
    id: "status",
    label: "Status",
    options: Object.entries(RECIPE_STATUS).map(([value, s]) => ({ value, label: s.label })),
    test: (r, v) => (r.status ?? "published") === v,
  },
  {
    id: "access",
    label: "Access",
    options: [
      { value: "premium", label: "Premium" },
      { value: "free", label: "Free" },
    ],
    test: (r, v) => (v === "premium" ? !!r.isPremium : !r.isPremium),
  },
  {
    id: "photo",
    label: "Photo",
    options: [
      { value: "missing", label: "Missing a photo" },
      { value: "has", label: "Has a photo" },
    ],
    test: (r, v) => (v === "has" ? !!r.photo?.url : !r.photo?.url),
  },
  { id: "diet", label: "Dietary", options: DIETARY.map((d) => ({ value: d.id, label: d.label })), test: (r, v) => r.dietary?.includes(v) },
  { id: "occasion", label: "Occasion", options: OCCASIONS.map((o) => ({ value: o.id, label: o.label })), test: (r, v) => r.occasions?.includes(v) },
];

export const recipeSearch = (r) => `${r.name} ${r.cuisine} ${r.ingredients.map((g) => g.name).join(" ")} ${r.benefits?.join(" ") ?? ""}`;

export const recipeExport = (r) => ({
  id: r.id,
  name: r.name,
  meal: r.mealType,
  cuisine: r.cuisine,
  status: r.status,
  premium: r.isPremium ? "yes" : "no",
  serves: r.servings,
  minutes: totalMinutes(r),
  photos: r.photo?.url ? 1 + (r.gallery?.length ?? 0) : 0,
  ingredients: r.ingredients.map((g) => `${g.amount} ${g.unit} ${g.name}`),
  dietary: r.dietary,
  occasions: r.occasions,
});
