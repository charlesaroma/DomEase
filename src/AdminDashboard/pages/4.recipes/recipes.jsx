/* Recipe Library */
import { Crown, ImageOff, LayoutGrid, List, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Button from "@/components/ui/Button";
import { useBulkUpdateRecipes, useDeleteRecipe, useRecipes, useSaveRecipe } from "@/store/queries/admin";
import { cn } from "@/utils/cn";

import DataTable from "../../components/DataTable";
import { useNotify } from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import RecipeEditor from "../../components/RecipeEditor";
import StatCard from "../../components/StatCard";
import { plural } from "../../lib/format";
import RecipeGrid from "./sections/RecipeGrid";
import { recipeColumns, recipeExport, recipeFilters, recipeSearch } from "./sections/recipeColumns";

const VIEW_KEY = "domease:admin:recipe-view";
const savedView = () => {
  try {
    return localStorage.getItem(VIEW_KEY) === "table" ? "table" : "grid";
  } catch {
    return "grid";
  }
};

// Every recipe households can be given, editable without an app release (PRD 13.2).
export default function Recipes() {
  const { data: recipes = [], isLoading } = useRecipes();
  const save = useSaveRecipe();
  const bulk = useBulkUpdateRecipes();
  const remove = useDeleteRecipe();
  const notify = useNotify();
  const [, setParams] = useSearchParams();
  const [view, setView] = useState(savedView);
  const [editing, setEditing] = useState(null); // null closed, {} new, a recipe to edit

  const live = recipes.filter((r) => r.status === "published");
  const missing = live.filter((r) => !r.photo?.url).length;
  const premium = live.filter((r) => r.isPremium).length;

  const chooseView = (v) => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* not remembered */
    }
  };

  const columns = useMemo(
    () =>
      recipeColumns({
        onPremium: (r, on) =>
          save.mutate({ id: r.id, isPremium: on }, { onSuccess: () => notify(on ? `${r.name} is now Premium.` : `${r.name} is free for everyone.`) }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const bulkActions = (ids, clear) => {
    const apply = (patch, message) => bulk.mutate({ ids, patch }, { onSuccess: () => (notify(message(plural(ids.length, "recipe"))), clear()) });
    return (
      <>
        <BulkButton onClick={() => apply({ status: "published", publishedAt: new Date().toISOString() }, (n) => `${n} published.`)}>Publish</BulkButton>
        <BulkButton onClick={() => apply({ status: "archived" }, (n) => `${n} archived.`)}>Archive</BulkButton>
        <BulkButton onClick={() => apply({ isPremium: true }, (n) => `${n} made Premium.`)}>Make Premium</BulkButton>
        <BulkButton onClick={() => apply({ isPremium: false }, (n) => `${n} made free.`)}>Make free</BulkButton>
      </>
    );
  };

  const rowActions = (r) => [
    { label: "Edit", onClick: () => setEditing(r) },
    { label: "Duplicate", onClick: () => setEditing({ ...r, id: undefined, name: `${r.name} (copy)`, status: "draft" }) },
    r.status === "published"
      ? { label: "Archive", onClick: () => save.mutate({ id: r.id, status: "archived" }, { onSuccess: () => notify(`${r.name} archived.`) }) }
      : { label: "Publish", onClick: () => save.mutate({ id: r.id, status: "published" }, { onSuccess: () => notify(`${r.name} is live.`) }) },
    {
      label: "Delete",
      danger: true,
      onClick: () => {
        if (window.confirm(`Delete ${r.name}? It leaves every household's plan. Archiving keeps it.`)) {
          remove.mutate(r.id, { onSuccess: () => notify(`${r.name} deleted.`) });
        }
      },
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

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Live recipes" value={live.length} note={`${recipes.length - live.length} draft or archived`} />
        <StatCard label="Premium" value={premium} note="Locked for free households" icon={Crown} />
        <button type="button" onClick={() => setParams({ photo: "missing" }, { replace: true })} className="text-left">
          <StatCard label="Missing a photo" value={missing} note={missing ? "Show them" : "Every live recipe has one"} icon={ImageOff} tone={missing ? "warn" : "good"} />
        </button>
      </div>

      <DataTable
        rows={recipes}
        loading={isLoading}
        columns={columns}
        filters={recipeFilters}
        search={recipeSearch}
        searchLabel="Search recipes or ingredients"
        onRowClick={setEditing}
        bulkActions={view === "table" ? bulkActions : undefined}
        rowActions={rowActions}
        rowLabel={(r) => r.name}
        exportName="domease-recipes"
        exportRow={recipeExport}
        initialSort={{ id: "name" }}
        renderBody={view === "grid" ? (rows, loading) => <RecipeGrid recipes={rows} loading={loading} onOpen={setEditing} /> : undefined}
        primaryAction={
          <div className="inline-flex rounded-r-pill border border-line p-0.5" role="group" aria-label="View">
            {[
              ["grid", LayoutGrid, "Photos"],
              ["table", List, "Table"],
            ].map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => chooseView(id)}
                aria-pressed={view === id}
                className={cn("inline-flex h-9 items-center gap-1.5 rounded-r-pill px-3 text-sm", view === id ? "bg-clay-700 text-white" : "text-ink-2 hover:text-ink")}
              >
                <Icon className="size-4" aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
        }
      />

      {editing && (
        <RecipeEditor
          key={editing.id ?? "new"}
          open
          title={editing.id ? `Edit ${editing.name}` : editing.name ? `Add ${editing.name}` : "Add a recipe"}
          initial={editing.name ? editing : undefined}
          busy={save.isPending}
          onClose={() => setEditing(null)}
          onSave={(data) =>
            save.mutate(
              { ...data, id: editing.id },
              {
                onSuccess: () => {
                  notify(data.status === "published" ? `${data.name} is live in the app.` : `${data.name} saved.`);
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

function BulkButton(props) {
  return <button type="button" className="h-8 rounded-r-pill border border-line-2 bg-white px-3 text-sm font-medium hover:border-clay-700 hover:text-clay-700" {...props} />;
}
