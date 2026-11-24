/* Suggestions Inbox */
import { Check, X } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useApproveSuggestion, useRejectSuggestion, useSuggestions } from "@/store/queries/admin";

import { useNotify } from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import RecipeEditor from "../../components/RecipeEditor";
import StatusChip from "../../components/StatusChip";
import Tabs from "../../components/Tabs";
import { MEAL_TYPES } from "../../lib/constants";
import { ago } from "../../lib/format";
import { blankRecipe } from "../../lib/recipes";

// Turn a household's free text into a first draft of a structured recipe.
function draftFrom(s) {
  return {
    ...blankRecipe(),
    name: s.name,
    mealType: s.suggestedMealType ?? "dinner",
    ingredients: s.ingredientsRaw
      .split(/,|\n/)
      .map((x) => x.trim())
      .filter(Boolean)
      .map((name) => ({ amount: 1, unit: "pcs", name: name[0].toUpperCase() + name.slice(1) })),
    steps: s.methodRaw
      .split(/\.\s+|\n/)
      .map((x) => x.trim().replace(/\.$/, ""))
      .filter(Boolean)
      .map((x) => `${x}.`),
  };
}

/**
 * Recipes households send in wait here, unseen by anyone else, until a
 * moderator approves (after tidying them into the structured format) or
 * rejects them (PRD 13.1 and 13.2).
 */
export default function Suggestions() {
  const { data: all = [], isLoading } = useSuggestions();
  const approve = useApproveSuggestion();
  const reject = useRejectSuggestion();
  const notify = useNotify();
  const [tab, setTab] = useState("pending");
  const [reviewing, setReviewing] = useState(null);

  const rows = all.filter((s) => s.status === tab);
  const count = (st) => all.filter((s) => s.status === st).length;

  return (
    <>
      <PageHeader title="Suggestions" body="Dishes households have sent in. Tidy each one into a proper recipe and publish it, or reject it." />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "pending", label: "Waiting", count: count("pending") },
          { id: "approved", label: "Published", count: count("approved") },
          { id: "rejected", label: "Rejected", count: count("rejected") },
        ]}
      />
      {isLoading && <p className="text-ink-2">Loading</p>}
      {!isLoading && !rows.length && (
        <p className="rounded-r-card border border-dashed border-line-2 px-6 py-12 text-center text-ink-2">
          {tab === "pending" ? "Nothing waiting. The inbox is clear." : "None yet."}
        </p>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((s) => (
          <article key={s.id} className="flex flex-col rounded-r-card border border-line bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{s.name}</h3>
                <p className="text-sm text-ink-2">
                  From {s.submittedBy}, {ago(s.createdAt)}
                </p>
              </div>
              <StatusChip>{MEAL_TYPES.find((m) => m.id === s.suggestedMealType)?.label ?? "No meal type"}</StatusChip>
            </div>
            <dl className="mt-4 flex-1 space-y-3 text-[15px]">
              <div>
                <dt className="text-xs font-medium tracking-wide text-ink-2 uppercase">Ingredients</dt>
                <dd className="mt-1">{s.ingredientsRaw}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-wide text-ink-2 uppercase">Method</dt>
                <dd className="mt-1">{s.methodRaw}</dd>
              </div>
            </dl>
            {s.status === "pending" && (
              <div className="mt-5 flex gap-2">
                <Button onClick={() => setReviewing(s)}>
                  <Check className="size-4" /> Review and publish
                </Button>
                <Button
                  variant="ghost"
                  disabled={reject.isPending}
                  onClick={() => reject.mutate(s.id, { onSuccess: () => notify(`${s.name} rejected.`) })}
                >
                  <X className="size-4" /> Reject
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>

      {reviewing && (
        <RecipeEditor
          key={reviewing.id}
          open
          title={`Publish ${reviewing.name}`}
          initial={draftFrom(reviewing)}
          saveLabel="Publish to the app"
          busy={approve.isPending}
          onClose={() => setReviewing(null)}
          onSave={(recipe) =>
            approve.mutate(
              { id: reviewing.id, recipe },
              {
                onSuccess: () => {
                  notify(`${recipe.name} is now live in the app.`);
                  setReviewing(null);
                },
              },
            )
          }
        />
      )}
    </>
  );
}
