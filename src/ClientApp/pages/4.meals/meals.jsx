/* Meals */
import { Crown, Lightbulb, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import RecipePhoto from "@/components/recipes/RecipePhoto";
import Button from "@/components/ui/Button";
import { useAppOccasions, useAppSettings, useHousehold, useSendSuggestion } from "@/store/queries/app";
import { cn } from "@/utils/cn";
import { totalMinutes } from "@/utils/recipes";

import AdSlot from "../../components/AdSlot";
import PremiumLock from "../../components/PremiumLock";
import Screen from "../../components/Screen";
import Sheet, { TextField } from "../../components/Sheet";
import { useToast } from "../../components/Toast";
import { MEAL_LABEL } from "../../lib/choices";
import { DAYS, MEAL_ORDER, todayIndex } from "../../lib/home";
import { useWeek } from "../../lib/useHome";

/**
 * The week by meal type: seven dishes with their photos, today first in
 * view. Swap the week for fresh ideas; Premium adds dietary picks and
 * occasion menus (FR-MP).
 */
export default function Meals() {
  const { data: household } = useHousehold();
  const { data: settings } = useAppSettings();
  const { data: occasions = [] } = useAppOccasions();
  const { days, recipes, loading, swap, swapping } = useWeek();
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const [suggesting, setSuggesting] = useState(false);
  const type = MEAL_ORDER.includes(params.get("type")) ? params.get("type") : household?.mealFocus?.[0] ?? "dinner";
  const premium = household?.tier === "premium";
  const today = todayIndex();
  const week = days?.[type] ?? [];
  const byId = Object.fromEntries(recipes.map((r) => [r.id, r]));

  const dietary = recipes.filter((r) => r.dietary?.length).slice(0, 4);

  return (
    <Screen
      wide
      eyebrow="This week"
      title="Meals"
      actions={
        <Button variant="ghost" onClick={() => (swap(), toast("A fresh week, planned."))} disabled={swapping || loading}>
          <RefreshCw className={cn("size-4", swapping && "animate-spin")} /> <span className="hidden sm:inline">Swap week</span>
        </Button>
      }
    >
      {/* Meal types */}
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="tablist" aria-label="Meal">
        {MEAL_ORDER.map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={type === m}
            onClick={() => setParams({ type: m }, { replace: true })}
            className={cn("shrink-0 rounded-r-pill px-4 py-2 text-[15px] transition-colors", type === m ? "bg-clay-700 font-semibold text-white" : "bg-white text-ink-2 shadow-sh-1 hover:text-ink")}
          >
            {MEAL_LABEL[m]}
          </button>
        ))}
      </div>

      {/* The week */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-r-card bg-paper-2" />
          ))}
        </div>
      ) : week.length ? (
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {week.map((id, d) => {
            const r = byId[id];
            if (!r) return null;
            return (
              <li key={d}>
                <Link to={`/app/meals/${r.id}`} className={cn("group block overflow-hidden rounded-r-card bg-white shadow-sh-1 hover:shadow-sh-2", d === today && "ring-2 ring-clay-700")}>
                  <div className="relative overflow-hidden">
                    <RecipePhoto recipe={r} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.03]" iconClassName="size-10" eager={d < 4} />
                    <span className={cn("absolute top-2.5 left-2.5 rounded-r-pill px-2.5 py-0.5 text-xs font-semibold", d === today ? "bg-clay-700 text-white" : "bg-white/90 text-ink")}>
                      {d === today ? "Today" : DAYS[d]}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-2 font-display text-lg leading-snug font-semibold">{r.name}</p>
                    <p className="mt-1 text-sm text-ink-2">
                      {r.cuisine}
                      {totalMinutes(r) > 0 && ` · ${totalMinutes(r)} min`}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="rounded-r-card bg-white p-8 text-center text-ink-2 shadow-sh-1">No {MEAL_LABEL[type].toLowerCase()} recipes yet. New ones arrive without an app update.</p>
      )}

      <div className="mt-8">
        <AdSlot screen="meals" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Dietary support (Premium) */}
        <section>
          <h2 className="mb-1 font-display text-xl font-semibold">Special dietary support</h2>
          <p className="mb-3 text-sm text-ink-2">{settings?.dietaryDisclaimer}</p>
          <PremiumLock locked={!premium} title="Diabetic and PCOS friendly ideas" body="Meal ideas with care for blood sugar, with Premium.">
            <ul className="grid grid-cols-2 gap-3 rounded-r-card bg-white p-3">
              {dietary.map((r) => (
                <li key={r.id}>
                  <Link to={`/app/meals/${r.id}`} className="block">
                    <RecipePhoto recipe={r} className="aspect-[4/3] w-full rounded-r-md" iconClassName="size-8" />
                    <p className="mt-1.5 line-clamp-1 text-sm font-medium">{r.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </PremiumLock>
        </section>

        {/* Occasions (Premium) */}
        <section>
          <h2 className="mb-1 font-display text-xl font-semibold">Occasions</h2>
          <p className="mb-3 text-sm text-ink-2">Menus for the days that matter.</p>
          <PremiumLock locked={!premium} title="Occasion menus" body="Birthday, Christmas, Easter and Eid, with Premium.">
            <ul className="grid grid-cols-2 gap-3 rounded-r-card bg-white p-3">
              {occasions.map((o) => {
                const first = recipes.find((r) => r.occasions?.includes(o.id));
                return (
                  <li key={o.id}>
                    <Link to={first ? `/app/meals/${first.id}` : "#"} className="block">
                      <RecipePhoto recipe={first ?? { mealType: "pastry", name: o.name }} className="aspect-[4/3] w-full rounded-r-md" iconClassName="size-8" />
                      <p className="mt-1.5 text-sm font-medium">{o.name}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </PremiumLock>
        </section>
      </div>

      <button
        type="button"
        onClick={() => setSuggesting(true)}
        className="mt-8 flex w-full items-center gap-4 rounded-r-card border border-dashed border-line-2 bg-white p-5 text-left hover:border-clay-700"
      >
        <Lightbulb className="size-6 shrink-0 text-amber-700" aria-hidden="true" />
        <span>
          <span className="block font-semibold">Suggest a recipe</span>
          <span className="text-sm text-ink-2">A dish your home loves. We'll tidy it up and may add it for everyone.</span>
        </span>
      </button>
      {!premium && (
        <p className="mt-4 flex items-center gap-2 text-sm text-ink-2">
          <Crown className="size-4 text-amber-700" aria-hidden="true" /> Some recipes are Premium and never planned on the free plan.
        </p>
      )}

      <SuggestSheet open={suggesting} onClose={() => setSuggesting(false)} type={type} />
    </Screen>
  );
}

function SuggestSheet({ open, onClose, type }) {
  const send = useSendSuggestion();
  const toast = useToast();
  const [f, setF] = useState({ name: "", ingredientsRaw: "", methodRaw: "" });
  const valid = f.name.trim() && f.ingredientsRaw.trim() && f.methodRaw.trim();
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Suggest a recipe"
      footer={
        <Button
          className="w-full"
          disabled={!valid || send.isPending}
          onClick={() =>
            send.mutate(
              { ...f, suggestedMealType: type },
              {
                onSuccess: () => {
                  toast("Thank you. We'll have a look.");
                  setF({ name: "", ingredientsRaw: "", methodRaw: "" });
                  onClose();
                },
              },
            )
          }
        >
          {send.isPending ? "Sending" : "Send"}
        </Button>
      }
    >
      <div className="space-y-4">
        <TextField label="The dish" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Mum's beef pilau" />
        <TextField label="What goes in" multiline value={f.ingredientsRaw} onChange={(e) => setF({ ...f, ingredientsRaw: e.target.value })} hint="However you like: rice, beef, pilau masala…" />
        <TextField label="How you make it" multiline value={f.methodRaw} onChange={(e) => setF({ ...f, methodRaw: e.target.value })} />
      </div>
    </Sheet>
  );
}
