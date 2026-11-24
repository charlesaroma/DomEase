/* Recipe Library */
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useDeleteRecipe, useRecipes, useSaveRecipe } from "@/store/queries/admin";

import DataTable from "../../components/DataTable";
import { useNotify } from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import RecipeEditor from "../../components/RecipeEditor";
import StatusChip from "../../components/StatusChip";
import Tabs from "../../components/Tabs";
import { MEAL_TYPES } from "../../lib/constants";

// Every recipe live in the app, editable without an app release (PRD 13.2).
export default function Recipes() {
  const { data: recipes = [], isLoading } = useRecipes();
  const save = useSaveRecipe();
  const remove = useDeleteRecipe();
  const notify = useNotify();
  const [tab, setTab] = useState("all");
  const [editing, setEditing] = useState(null); // null closed, {} new, recipe edit

  const rows = tab === "all" ? recipes : recipes.filter((r) => r.mealType === tab);
  const tabs = [{ id: "all", label: "All", count: recipes.length }, ...MEAL_TYPES.map((m) => ({ ...m, count: recipes.filter((r) => r.mealType === m.id).length }))];

  const columns = [
    {
      id: "name",
      label: "Recipe",
      render: (r) => (
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-sm text-ink-2">
            {r.cuisine} · serves {r.servings}
          </p>
        </div>
      ),
    },
    { id: "type", label: "Meal", render: (r) => MEAL_TYPES.find((m) => m.id === r.mealType)?.label },
    { id: "ing", label: "Ingredients", className: "hidden md:table-cell", render: (r) => r.ingredients.length },
    {
      id: "tags",
      label: "Premium content",
      className: "hidden lg:table-cell",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.dietary?.map((d) => (
            <StatusChip key={d} tone="premium">
              {d === "pcos" ? "PCOS" : "Diabetic"}
            </StatusChip>
          ))}
          {r.healthyVariant && <StatusChip tone="premium">Healthy swap</StatusChip>}
          {r.occasions?.length > 0 && <StatusChip tone="premium">Occasions</StatusChip>}
        </div>
      ),
    },
    {
      id: "del",
      label: "",
      className: "w-12",
      render: (r) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Delete ${r.name}? It leaves every household's plan.`)) {
              remove.mutate(r.id, { onSuccess: () => notify(`${r.name} deleted.`) });
            }
          }}
          className="grid size-9 place-items-center rounded-r-md text-ink-2 hover:bg-danger-100 hover:text-danger"
          aria-label={`Delete ${r.name}`}
        >
          <Trash2 className="size-4" />
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Recipe library"
        body="Every recipe households can be given. Changes reach the app straight away, with no store release."
        actions={
          <Button onClick={() => setEditing({})}>
            <Plus className="size-4" /> Add recipe
          </Button>
        }
      />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      <DataTable
        rows={rows}
        loading={isLoading}
        columns={columns}
        search={(r) => `${r.name} ${r.cuisine} ${r.ingredients.map((g) => g.name).join(" ")}`}
        onRowClick={setEditing}
      />
      {editing && (
        <RecipeEditor
          key={editing.id ?? "new"}
          open
          title={editing.id ? `Edit ${editing.name}` : "Add a recipe"}
          initial={editing.id ? editing : undefined}
          busy={save.isPending}
          onClose={() => setEditing(null)}
          onSave={(data) =>
            save.mutate(
              { ...data, id: editing.id },
              {
                onSuccess: () => {
                  notify(editing.id ? "Recipe saved." : "Recipe published to the app.");
                  setEditing(null);
                },
              },
            )
          }
        />
      )}
    </>
  );
}
