/* House Help */
import { FileText, TriangleAlert } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import Media, { useMediaUrl } from "@/components/ui/Media";
import { useAppGuides, useAppQuestions, useHousehold, useScoreCandidate } from "@/store/queries/app";
import { cn } from "@/utils/cn";

import PremiumLock from "../../components/PremiumLock";
import Screen from "../../components/Screen";
import { TextField } from "../../components/Sheet";

/**
 * Hiring help at home, with care (PRD 12): a vetting questionnaire that
 * gives a fit score and flags concerns, and guides to read. Premium.
 */
export default function HouseHelp() {
  const { data: household } = useHousehold();
  const { data: questions = [] } = useAppQuestions();
  const { data: guides = [] } = useAppGuides();
  const score = useScoreCandidate();
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState({});
  const premium = household?.tier === "premium";
  const sections = [...new Set(questions.map((q) => q.section))];
  const answered = Object.keys(answers).length;
  const result = score.data;

  return (
    <Screen eyebrow="Premium" title="House Help">
      <PremiumLock locked={!premium} title="House Help comes with Premium" body="Vet a candidate with eleven careful questions, and read the four guides.">
        <div className="space-y-8">
          <section className="rounded-r-stage bg-white p-5 shadow-sh-1 sm:p-6">
            <h2 className="font-display text-xl font-semibold">Vet a candidate</h2>
            <p className="mt-1 text-ink-2">
              {questions.length} questions in {sections.length} areas. Ask them in person; choose the answer closest to theirs.
            </p>
            {result ? (
              <Result result={result} name={name} onAgain={() => (score.reset(), setAnswers({}), setName(""))} />
            ) : (
              <>
                <div className="mt-5 max-w-sm">
                  <TextField label="Their name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                {sections.map((sec) => (
                  <fieldset key={sec} className="mt-6">
                    <legend className="mb-3 text-xs font-semibold tracking-[0.16em] text-clay-700 uppercase">{sec}</legend>
                    <ol className="space-y-5">
                      {questions
                        .filter((q) => q.section === sec)
                        .map((q) => (
                          <li key={q.id}>
                            <p className="font-medium">{q.text}</p>
                            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={q.text}>
                              {q.options.map((o, i) => (
                                <button
                                  key={o.label}
                                  type="button"
                                  role="radio"
                                  aria-checked={answers[q.id] === i}
                                  onClick={() => setAnswers({ ...answers, [q.id]: i })}
                                  className={cn(
                                    "rounded-r-pill border px-3.5 py-1.5 text-sm",
                                    answers[q.id] === i ? "border-clay-700 bg-clay-100 text-clay-800" : "border-line text-ink-2 hover:border-line-2",
                                  )}
                                >
                                  {o.label}
                                </button>
                              ))}
                            </div>
                          </li>
                        ))}
                    </ol>
                  </fieldset>
                ))}
                <div className="mt-8 flex items-center gap-4">
                  <Button onClick={() => score.mutate(answers)} disabled={answered < questions.length || score.isPending}>
                    See the result
                  </Button>
                  <span className="text-sm text-ink-2">
                    {answered} of {questions.length} answered
                  </span>
                </div>
              </>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-display text-xl font-semibold">Guides</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {guides.map((g) => (
                <Guide key={g.id} guide={g} />
              ))}
            </ul>
          </section>
        </div>
      </PremiumLock>
    </Screen>
  );
}

function Guide({ guide: g }) {
  const href = useMediaUrl(g.fileUrl);
  return (
    <li>
      <a
        href={href ?? undefined}
        target="_blank"
        rel="noreferrer"
        aria-disabled={!href}
        className={cn("flex gap-4 rounded-r-card bg-white p-4 shadow-sh-1", href ? "hover:shadow-sh-2" : "pointer-events-none opacity-60")}
      >
        <Media
          src={g.cover?.url}
          alt=""
          className="h-16 w-12 shrink-0 rounded-r-sm"
          fallback={
            <span className="grid size-12 shrink-0 place-items-center rounded-r-md bg-clay-100 text-clay-700">
              <FileText className="size-6" aria-hidden="true" />
            </span>
          }
        />
        <span>
          <span className="block font-semibold">{g.title}</span>
          <span className="block text-sm text-ink-2">{g.summary}</span>
          <span className="mt-1 block text-xs text-ink-3">{href ? `${g.pages} pages · PDF` : "Coming soon"}</span>
        </span>
      </a>
    </li>
  );
}

function Result({ result, name, onAgain }) {
  const tone = result.percent >= 75 ? "text-sage-800 bg-sage-100" : result.percent >= 50 ? "text-amber-800 bg-amber-200/60" : "text-danger bg-danger-100";
  return (
    <div className="mt-6 space-y-5">
      <div className={cn("rounded-r-card p-5", tone)}>
        <p className="text-sm">{name || "The candidate"}'s fit</p>
        <p className="font-display text-5xl font-bold">{result.percent}%</p>
      </div>
      <ul className="space-y-3">
        {Object.entries(result.bySection).map(([sec, pct]) => (
          <li key={sec}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{sec}</span>
              <span className="tabular-nums">{pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-paper-2">
              <div className="h-full rounded-full bg-clay-700" style={{ width: `${pct}%` }} />
            </div>
          </li>
        ))}
      </ul>
      {result.flags.length > 0 && (
        <div className="rounded-r-card border border-danger/30 p-4">
          <p className="flex items-center gap-2 font-semibold text-danger">
            <TriangleAlert className="size-4" aria-hidden="true" /> Talk these through before deciding
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px]">
            {result.flags.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-sm text-ink-2">A guide to help you decide, not a judgement of anyone.</p>
      <Button variant="ghost" onClick={onAgain}>
        Vet someone else
      </Button>
    </div>
  );
}
