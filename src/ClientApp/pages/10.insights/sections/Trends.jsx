/* Trends */
import { Repeat } from "lucide-react";
import { Link } from "react-router-dom";

import RecipePhoto from "@/components/recipes/RecipePhoto";
import { usePlanHistory } from "@/store/queries/app";

import { eatingTrends } from "../../../lib/insights";
import { useWeek } from "../../../lib/useHome";

/**
 * What the home eats, from this week and the weeks before it: the dishes
 * that come up most, how varied the week is, the vegetable forward share,
 * the cuisine mix and anything on repeat. Planned meals, not a food diary.
 */
export default function Trends() {
  const { days, byId, loading } = useWeek();
  const { data: history = [], isLoading } = usePlanHistory();
  if (loading || isLoading) return <p className="text-ink-2">Loading</p>;
  const t = eatingTrends({ history, current: days, byId });

  return (
    <div className="space-y-6">
      <p className="rounded-r-card bg-sage-100 p-4 text-sage-800">
        This week has <strong>{t.different} different dishes</strong>, and {t.vegForward}% of meals {t.weeks > 1 ? `over the last ${t.weeks} weeks ` : ""}are vegetable forward.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Variety this week" value={`${t.variety}%`} note="Different dishes out of every meal planned" />
        <Stat label="Vegetable forward" value={`${t.vegForward}%`} note="Of meals planned" />
        <Stat label="Weeks counted" value={t.weeks} note={`${t.meals} meals`} />
      </div>

      <section className="rounded-r-card bg-white p-5 shadow-sh-1">
        <h2 className="font-display text-lg font-semibold">Most planned lunches and dinners</h2>
        <ol className="mt-3 divide-y divide-line">
          {t.top.map(({ recipe, times }, i) => (
            <li key={recipe.id}>
              <Link to={`/app/meals/${recipe.id}`} className="flex items-center gap-3 py-2.5 hover:text-clay-700">
                <span className="w-5 text-sm text-ink-3 tabular-nums">{i + 1}</span>
                <RecipePhoto recipe={recipe} className="size-11 shrink-0 rounded-r-sm" iconClassName="size-5" />
                <span className="min-w-0 flex-1 truncate">{recipe.name}</span>
                <span className="text-sm text-ink-2 tabular-nums">{times} times</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-r-card bg-white p-5 shadow-sh-1">
        <h2 className="font-display text-lg font-semibold">Cuisines</h2>
        <ul className="mt-4 space-y-3">
          {t.cuisines.map((c) => (
            <li key={c.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{c.name}</span>
                <span className="text-ink-2 tabular-nums">{c.percent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-paper-2">
                <div className="h-full rounded-full bg-clay-700" style={{ width: `${c.percent}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {t.onRepeat.length > 0 && (
        <section className="rounded-r-card bg-white p-5 shadow-sh-1">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Repeat className="size-5 text-clay-700" aria-hidden="true" /> On repeat lately
          </h2>
          <p className="mt-1 text-sm text-ink-2">Lunches and dinners in at least three of the last four weeks. Swap the week on Meals for something new.</p>
          <p className="mt-3">{t.onRepeat.map((r) => r.name).join(", ")}</p>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, note }) {
  return (
    <div className="rounded-r-card bg-white p-5 shadow-sh-1">
      <p className="text-sm text-ink-2">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-ink-2">{note}</p>
    </div>
  );
}
