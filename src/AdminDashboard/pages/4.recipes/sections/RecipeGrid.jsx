/* Recipe Grid */
import { Crown, ImageOff } from "lucide-react";

import RecipePhoto from "@/components/recipes/RecipePhoto";
import { totalMinutes } from "@/utils/recipes";

import StatusChip from "../../../components/StatusChip";
import { MEAL_TYPES, RECIPE_STATUS } from "../../../lib/constants";

/**
 * The library as photo cards, the way households meet recipes. Makes the
 * dishes still without a photo easy to spot.
 */
export default function RecipeGrid({ recipes, onOpen, loading }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-r-card bg-paper-2" />
        ))}
      </div>
    );
  }
  if (!recipes.length) return <p className="rounded-r-card border border-dashed border-line-2 px-6 py-12 text-center text-ink-2">No recipes match.</p>;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {recipes.map((r) => {
        const status = RECIPE_STATUS[r.status] ?? RECIPE_STATUS.published;
        return (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onOpen(r)}
              className="group block w-full overflow-hidden rounded-r-card border border-line bg-white text-left transition-shadow hover:shadow-sh-2 focus-visible:outline-2 focus-visible:outline-clay-700"
            >
              <div className="relative">
                <RecipePhoto recipe={r} className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-[1.02]" iconClassName="size-10" />
                <div className="absolute top-2 left-2 flex gap-1">
                  {r.status !== "published" && <StatusChip tone={status.tone} className="bg-white/90">{status.label}</StatusChip>}
                  {r.isPremium && (
                    <span className="inline-flex items-center gap-1 rounded-r-pill bg-amber-700 px-2 py-0.5 text-xs font-medium text-white">
                      <Crown className="size-3" aria-hidden="true" /> Premium
                    </span>
                  )}
                </div>
                {!r.photo?.url && (
                  <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-r-pill bg-white/90 px-2 py-0.5 text-xs text-ink-2">
                    <ImageOff className="size-3" aria-hidden="true" /> Add a photo
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs font-semibold tracking-[0.14em] text-clay-700 uppercase">{MEAL_TYPES.find((m) => m.id === r.mealType)?.label}</p>
                <p className="mt-1 line-clamp-2 font-display text-lg leading-snug font-semibold">{r.name}</p>
                <p className="mt-1 text-sm text-ink-2">
                  {r.cuisine}
                  {totalMinutes(r) > 0 && ` · ${totalMinutes(r)} min`}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
