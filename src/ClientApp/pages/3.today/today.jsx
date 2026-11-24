/* Today */
import { ArrowLeftRight, ArrowRight, Crown, HandHeart, Leaf, ShoppingBasket } from "lucide-react";
import { Link } from "react-router-dom";

import RecipePhoto from "@/components/recipes/RecipePhoto";
import { useMember } from "@/store/context/MemberAuthContext";
import { useAppNudges, useHousehold, useSaveZones, useZones } from "@/store/queries/app";
import { totalMinutes } from "@/utils/recipes";

import AdSlot from "../../components/AdSlot";
import Screen from "../../components/Screen";
import { money } from "../../lib/choices";
import { DAYS, isDue, todayIndex } from "../../lib/home";
import { useShoppingList, useWeek } from "../../lib/useHome";

/**
 * The day at a glance (FR-TD): a kind nudge, tonight's dinner, how the week is
 * going, what to clean today and what the shop will cost.
 */
export default function Today() {
  const { user } = useMember();
  const { data: household } = useHousehold();
  const { data: nudges = [] } = useAppNudges();
  const { data: zones = [] } = useZones();
  const saveZones = useSaveZones();
  const { days, byId } = useWeek();
  const { items, total, currency } = useShoppingList();
  const d = todayIndex();
  const now = new Date();
  const nudge = nudges.length ? nudges[Math.floor(now.getTime() / 864e5) % nudges.length] : null;
  const dinner = days?.dinner?.[d] && byId[days.dinner[d]];
  const premium = household?.tier === "premium";

  const due = zones.flatMap((z) => z.tasks.filter((t) => isDue(t, now)).map((t) => ({ ...t, zone: z })));
  const planned = days ? Object.values(days).reduce((n, ids) => n + ids.length, 0) : 0;
  const tasksDone = zones.reduce((n, z) => n + z.tasks.filter((t) => t.done).length, 0);
  const tasksAll = zones.reduce((n, z) => n + z.tasks.length, 0);
  const bought = items.filter((i) => i.checked).length;

  const tick = (zoneId, taskId) =>
    saveZones.mutate(zones.map((z) => (z.id !== zoneId ? z : { ...z, tasks: z.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) })));

  return (
    <Screen eyebrow={now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} title={`Hello, ${user?.name?.split(" ")[0] ?? "there"}`}>
      {nudge && (
        <p className="mb-6 flex items-start gap-3 rounded-r-card bg-sage-100 p-4 text-sage-800">
          <Leaf className="mt-0.5 size-5 shrink-0" aria-hidden="true" /> {nudge.text}
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tonight */}
        {dinner && (
          <Link to={`/app/meals/${dinner.id}`} className="group overflow-hidden rounded-r-stage bg-white shadow-sh-1 md:col-span-2 md:grid md:grid-cols-[1.2fr_1fr]">
            <RecipePhoto recipe={dinner} eager className="aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-[1.02] md:aspect-auto md:h-full" iconClassName="size-14" />
            <div className="p-5 md:p-7">
              <p className="text-xs font-semibold tracking-[0.18em] text-clay-700 uppercase">Tonight, {DAYS[d]}</p>
              <h2 className="mt-1.5 font-display text-2xl font-bold">{dinner.name}</h2>
              <p className="mt-1 text-ink-2">
                {dinner.cuisine}
                {totalMinutes(dinner) > 0 && ` · ${totalMinutes(dinner)} min`} · for {household?.size}
              </p>
              <span className="mt-5 inline-flex items-center gap-1 font-semibold text-clay-700">
                See the recipe <ArrowRight className="size-4" />
              </span>
            </div>
          </Link>
        )}

        {/* The week so far */}
        <section className="rounded-r-card bg-white p-5 shadow-sh-1">
          <h2 className="font-display text-lg font-semibold">This week</h2>
          <ul className="mt-4 space-y-4">
            <Bar label="Meals planned" value={planned} of={35} />
            <Bar label="Cleaning done" value={tasksDone} of={tasksAll} />
            <Bar label="Shopping bought" value={bought} of={items.length} />
          </ul>
        </section>

        {/* Due today */}
        <section className="rounded-r-card bg-white p-5 shadow-sh-1">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">To clean today</h2>
            <Link to="/app/clean" className="text-sm text-clay-700 hover:underline">
              All zones
            </Link>
          </div>
          {due.length ? (
            <ul className="mt-3 divide-y divide-line">
              {due.slice(0, 4).map((t) => (
                <li key={t.id}>
                  <label className="flex cursor-pointer items-center gap-3 py-2.5">
                    <input type="checkbox" checked={t.done} onChange={() => tick(t.zone.id, t.id)} className="size-5 accent-clay-700" />
                    <span className={t.done ? "text-ink-3 line-through" : ""}>{t.label}</span>
                    <span className="ml-auto text-xs text-ink-3">{t.zone.assignee ? `${t.zone.name} · ${t.zone.assignee}` : t.zone.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-ink-2">Nothing due. Enjoy the day.</p>
          )}
        </section>

        {/* Shop */}
        <Link to="/app/shop" className="flex items-center gap-4 rounded-r-card bg-white p-5 shadow-sh-1 hover:shadow-sh-2">
          <span className="grid size-12 place-items-center rounded-r-md bg-clay-100 text-clay-700">
            <ShoppingBasket className="size-6" aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block text-sm text-ink-2">Still to buy, estimated</span>
            <span className="block font-display text-2xl font-bold">{money(total, currency)}</span>
            {items.some((i) => i.low && !i.checked) && <span className="text-sm text-clay-700">{items.filter((i) => i.low && !i.checked).length} running low</span>}
          </span>
          <ArrowRight className="size-5 text-ink-3" />
        </Link>

        {/* Tools */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/app/convert" className="rounded-r-card bg-white p-5 shadow-sh-1 hover:shadow-sh-2">
            <ArrowLeftRight className="size-6 text-clay-700" aria-hidden="true" />
            <span className="mt-3 block font-semibold">Convert</span>
            <span className="text-sm text-ink-2">Between currencies</span>
          </Link>
          <Link to="/app/house-help" className="rounded-r-card bg-white p-5 shadow-sh-1 hover:shadow-sh-2">
            <HandHeart className="size-6 text-clay-700" aria-hidden="true" />
            <span className="mt-3 block font-semibold">House Help</span>
            <span className="text-sm text-ink-2">{premium ? "Vet and guides" : "Premium"}</span>
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <AdSlot screen="today" />
      </div>

      {!premium && (
        <Link to="/app/premium" className="mt-6 flex items-center gap-4 rounded-r-card bg-amber-200/50 p-5 hover:bg-amber-200/80">
          <Crown className="size-6 shrink-0 text-amber-800" aria-hidden="true" />
          <span className="flex-1">
            <span className="block font-semibold text-amber-800">Share DomEase with everyone at home</span>
            <span className="text-sm text-ink-2">Premium adds sharing, House Help, allergy profiles and no ads.</span>
          </span>
          <ArrowRight className="size-5 text-amber-800" />
        </Link>
      )}
    </Screen>
  );
}

function Bar({ label, value, of }) {
  const pct = of ? Math.min(100, Math.round((value / of) * 100)) : 0;
  return (
    <li>
      <div className="mb-1.5 flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-ink-2 tabular-nums">
          {value} of {of}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-paper-2" role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-clay-700 transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}
