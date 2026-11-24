/* Recipe View */
import { Clock, Crown, Globe, Info, Leaf, Lock, Sprout, Users } from "lucide-react";
import { useState } from "react";

import RecipePhoto from "@/components/recipes/RecipePhoto";
import Media from "@/components/ui/Media";
import { cn } from "@/utils/cn";
import { AGE_LABEL, formatAmount, MEAL_LABEL, scaleIngredients, totalMinutes } from "@/utils/recipes";

/**
 * One recipe as a household sees it: the photo first, then the name, tags,
 * the dietary disclaimer, ingredients scaled to the household, the method
 * and (Premium) the healthier version. The web app shows it full page; the
 * admin shows it as a live preview while a recipe is edited.
 *
 *   people      household size; amounts are scaled to it
 *   premium     whether this household has Premium
 *   onUpgrade   where "See Premium" goes
 */
export default function RecipeView({ recipe: r, people, premium = false, disclaimer, onUpgrade, compact = false, actions }) {
  const [shot, setShot] = useState(0);
  const photos = [r.photo, ...(r.gallery ?? [])].filter((p) => p?.url);
  const serves = people ?? r.servings;
  const ingredients = scaleIngredients(r, serves);
  const minutes = totalMinutes(r);
  const locked = r.isPremium && !premium;
  const showDisclaimer = r.dietary?.length > 0 || r.healthyVariant;

  return (
    <article className={cn("bg-paper text-ink", compact ? "text-[14px]" : "text-[15px]")}>
      {/* Photo */}
      <div className="relative">
        {photos.length && photos[shot] ? (
          <Media src={photos[shot].url} alt={photos[shot].alt || r.name} className={cn("w-full", compact ? "aspect-[4/3]" : "aspect-[4/3] md:aspect-[16/9] md:rounded-r-stage")} />
        ) : (
          <RecipePhoto recipe={r} className={cn("w-full", compact ? "aspect-[4/3]" : "aspect-[4/3] md:aspect-[16/9] md:rounded-r-stage")} iconClassName="size-14" />
        )}
        {photos.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {photos.map((p, i) => (
              <button
                key={p.url}
                type="button"
                onClick={() => setShot(i)}
                aria-label={`Photo ${i + 1} of ${photos.length}`}
                aria-current={i === shot}
                className={cn("h-2 rounded-full bg-white/70 transition-all", i === shot ? "w-6 bg-white" : "w-2")}
              />
            ))}
          </div>
        )}
        {actions && <div className="absolute top-3 right-3 flex gap-2">{actions}</div>}
      </div>

      <div className={cn(compact ? "p-4" : "px-4 py-6 md:px-0")}>
        <p className="text-xs font-semibold tracking-[0.18em] text-clay-700 uppercase">{MEAL_LABEL[r.mealType]}</p>
        <h1 className={cn("mt-1.5 font-display font-bold tracking-tight", compact ? "text-2xl" : "text-3xl md:text-4xl")}>{r.name || "Untitled recipe"}</h1>

        <ul className="mt-3 flex flex-wrap gap-2">
          {r.cuisine && <Chip icon={Globe}>{r.cuisine}</Chip>}
          {minutes > 0 && <Chip icon={Clock}>{minutes} min</Chip>}
          {r.ageGroups?.map((a) => (
            <Chip key={a} icon={Users}>
              {AGE_LABEL[a]}
            </Chip>
          ))}
          {r.vegForward && (
            <Chip icon={Leaf} tone="sage">
              Veg forward
            </Chip>
          )}
          {r.benefits?.map((b) => (
            <Chip key={b} icon={Sprout} tone="sage">
              {b}
            </Chip>
          ))}
          {r.isPremium && (
            <Chip icon={Crown} tone="amber">
              Premium
            </Chip>
          )}
        </ul>

        {showDisclaimer && disclaimer && (
          <p className="mt-4 flex gap-2.5 text-ink-2">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {disclaimer}
          </p>
        )}

        {locked ? (
          <Locked onUpgrade={onUpgrade} text="This recipe comes with Premium." />
        ) : (
          <>
            <div className="mt-7 flex items-baseline justify-between">
              <h2 className="text-xs font-semibold tracking-[0.16em] text-ink-2 uppercase">Ingredients for {serves}</h2>
              <span className="text-ink-2">Serves {r.servings} as written</span>
            </div>
            <ul className="mt-2 divide-y divide-line">
              {ingredients.map((g, i) => (
                <li key={i} className="py-3">
                  <div className="flex justify-between gap-4">
                    <span>{g.name}</span>
                    <span className="whitespace-nowrap tabular-nums">{formatAmount(g)}</span>
                  </div>
                  {g.substitute && <p className="mt-0.5 text-sm text-ink-2">Can't find it? Try {g.substitute}</p>}
                </li>
              ))}
            </ul>

            <h2 className="mt-7 text-xs font-semibold tracking-[0.16em] text-ink-2 uppercase">Method</h2>
            <ol className="mt-3 space-y-3">
              {r.steps?.filter(Boolean).map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-clay-700 text-xs font-semibold text-white">{i + 1}</span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>

            {r.healthyVariant && (
              <section className="mt-8 rounded-r-card border border-sage-200 bg-sage-100/50 p-4">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-sage-800">
                  <Leaf className="size-5" aria-hidden="true" /> Healthier version
                </h2>
                {premium ? (
                  <>
                    <p className="mt-1 text-ink-2">{r.healthyVariant.summary}</p>
                    <ul className="mt-3 list-disc space-y-1 pl-5">
                      {r.healthyVariant.ingredients?.map((g, i) => (
                        <li key={i}>
                          {formatAmount(g)} {g.name}
                        </li>
                      ))}
                    </ul>
                    <ol className="mt-3 list-decimal space-y-1 pl-5">
                      {r.healthyVariant.steps?.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  </>
                ) : (
                  <Locked onUpgrade={onUpgrade} text="Healthier swaps come with Premium." inline />
                )}
              </section>
            )}
          </>
        )}
      </div>
    </article>
  );
}

const TONES = {
  plain: "bg-paper-2 text-ink-2",
  sage: "bg-sage-100 text-sage-800",
  amber: "bg-amber-200/60 text-amber-800",
};

function Chip({ icon: Icon, tone = "plain", children }) {
  return (
    <li className={cn("inline-flex items-center gap-1.5 rounded-r-pill px-3 py-1 text-sm", TONES[tone])}>
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
    </li>
  );
}

function Locked({ text, onUpgrade, inline }) {
  return (
    <div className={cn("flex flex-col items-center gap-3 rounded-r-card border border-dashed border-amber-400 bg-white p-6 text-center", inline ? "mt-3" : "mt-8")}>
      <Lock className="size-6 text-amber-700" aria-hidden="true" />
      <p className="font-medium">{text}</p>
      {onUpgrade && (
        <button type="button" onClick={onUpgrade} className="rounded-r-pill bg-amber-700 px-5 py-2 font-display font-semibold text-white hover:bg-amber-800">
          See Premium
        </button>
      )}
    </div>
  );
}
