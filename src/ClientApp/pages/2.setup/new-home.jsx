/* New Home */
import { ArrowLeft, Check, Crown, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "@/components/ui/Button";
import { useAppSettings, useCreateHousehold } from "@/store/queries/app";
import { cn } from "@/utils/cn";

import { CURRENCIES, DIETS, GOALS, MEALS, MOODS, WHO } from "../../lib/choices";

// One question a screen, in the app's order (ui/onboarding). `many` takes
// several answers; the last step shows every answer before the home is made.
const STEPS = [
  { id: "type", title: ["Who lives in your ", "home", "?"], choices: WHO },
  { id: "size", title: ["How many people ", "eat", " at home?"] },
  { id: "mood", title: ["How has running the ", "house", " felt lately?"], choices: MOODS },
  { id: "goals", title: ["What would make your ", "week", " easier?"], choices: GOALS, many: true },
  { id: "mealFocus", title: ["Which meals do you want ", "help", " with?"], choices: MEALS, many: true },
  { id: "currency", title: ["Where do you ", "shop", "?"], choices: CURRENCIES },
  { id: "diet", title: ["Any ", "dietary", " needs at home?"], choices: DIETS },
  { id: "ready", title: ["Your ", "home", " is ready"] },
];

/**
 * Setting up a home on the web, the same questions as the phone. A step can't
 * be passed until it is answered; Back keeps every answer.
 */
export default function NewHome() {
  const navigate = useNavigate();
  const create = useCreateHousehold();
  const { data: settings } = useAppSettings();
  const [step, setStep] = useState(0);
  const [a, setA] = useState({ type: null, size: 2, mood: null, goals: [], mealFocus: [], currency: "UGX", diet: "none" });
  const s = STEPS[step];
  const answered = s.id === "ready" || s.id === "size" || (s.many ? a[s.id].length > 0 : !!a[s.id]);
  const pct = ((step + 1) / STEPS.length) * 100;

  const pick = (id) => {
    if (s.many) setA({ ...a, [s.id]: a[s.id].includes(id) ? a[s.id].filter((x) => x !== id) : [...a[s.id], id] });
    else {
      setA({ ...a, [s.id]: id, ...(s.id === "type" && id === "bachelor" ? { size: 1 } : {}) });
    }
  };
  const label = (list, id) => list.find((c) => c.id === id);

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pt-5 pb-8">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => (step ? setStep(step - 1) : navigate("/app/setup"))}
          className="grid size-10 place-items-center rounded-r-pill hover:bg-white"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label={`Question ${step + 1} of ${STEPS.length}`}>
          <div className="h-full rounded-full bg-clay-700 transition-[width] duration-300" style={{ width: `${pct}%` }} />
        </div>
        <span className="w-12 text-right text-sm text-ink-2 tabular-nums">
          {step + 1}/{STEPS.length}
        </span>
      </div>

      <h1 className="mt-10 font-display text-3xl leading-tight font-bold">
        {s.title[0]}
        <span className="text-clay-700">{s.title[1]}</span>
        {s.title[2]}
      </h1>
      {s.many && <p className="mt-2 text-ink-2">Choose as many as you like.</p>}

      <div className="mt-8 flex-1">
        {s.choices && (
          <ul className="space-y-2.5">
            {s.choices.map((c) => {
              const on = s.many ? a[s.id].includes(c.id) : a[s.id] === c.id;
              const locked = c.premium;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => !locked && pick(c.id)}
                    aria-pressed={on}
                    disabled={locked}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-r-card border-2 bg-white px-4 py-3.5 text-left transition-colors",
                      on ? "border-clay-700 bg-clay-100/40" : "border-transparent shadow-sh-1 hover:border-line-2",
                      locked && "opacity-60",
                    )}
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {c.emoji}
                    </span>
                    <span className="flex-1 text-base">{c.label}</span>
                    {locked ? (
                      <span className="inline-flex items-center gap-1 rounded-r-pill bg-amber-200/60 px-2 py-0.5 text-xs text-amber-800">
                        <Crown className="size-3" /> Premium
                      </span>
                    ) : (
                      on && <Check className="size-5 text-clay-700" strokeWidth={3} aria-hidden="true" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {s.id === "size" && (
          <div className="flex items-center justify-center gap-8 py-10">
            <Round label="Fewer" disabled={a.size <= 1} onClick={() => setA({ ...a, size: a.size - 1 })}>
              <Minus className="size-6" />
            </Round>
            <span className="w-24 text-center font-display text-7xl font-bold tabular-nums" aria-live="polite">
              {a.size}
            </span>
            <Round label="More" disabled={a.size >= 20} onClick={() => setA({ ...a, size: a.size + 1 })}>
              <Plus className="size-6" />
            </Round>
          </div>
        )}

        {s.id === "ready" && (
          <div className="space-y-4">
            <ul className="divide-y divide-line rounded-r-card bg-white shadow-sh-1">
              {[
                ["Home", `${label(WHO, a.type)?.label}, ${a.size} eating`, 0],
                ["Week", a.goals.map((g) => label(GOALS, g)?.label).join(", "), 3],
                ["Meals", a.mealFocus.map((m) => label(MEALS, m)?.label).join(", "), 4],
                ["Money", label(CURRENCIES, a.currency)?.label, 5],
                ["Diet", label(DIETS, a.diet)?.label, 6],
              ].map(([k, v, i]) => (
                <li key={k} className="flex items-start gap-4 px-4 py-3">
                  <span className="w-16 shrink-0 text-sm text-ink-2">{k}</span>
                  <span className="flex-1">{v}</span>
                  <button type="button" onClick={() => setStep(i)} className="text-sm text-clay-700 hover:underline">
                    Change
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-ink-2">
              We'll plan 35 meals for your week, set up your cleaning zones and start one shopping list.
              {settings?.trialDays > 0 && ` Premium is yours free for ${settings.trialDays} days.`}
            </p>
            {create.error && (
              <p className="text-sm text-danger" role="alert">
                {create.error.message}
              </p>
            )}
          </div>
        )}
      </div>

      <Button
        size="lg"
        className="mt-8 w-full"
        disabled={!answered || create.isPending}
        onClick={() =>
          s.id === "ready" ? create.mutate(a, { onSuccess: () => navigate("/app", { replace: true }) }) : setStep(step === 0 && a.type === "bachelor" ? 2 : step + 1)
        }
      >
        {s.id === "ready" ? (create.isPending ? "Setting up" : "Open my home") : "Continue"}
      </Button>
    </main>
  );
}

function Round({ label, children, ...props }) {
  return (
    <button type="button" aria-label={label} className="grid size-14 place-items-center rounded-full border-2 border-line-2 bg-white hover:border-clay-700 disabled:opacity-40" {...props}>
      {children}
    </button>
  );
}
