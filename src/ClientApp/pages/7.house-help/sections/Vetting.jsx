/* Vetting */
import { TriangleAlert } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useAppQuestions, useScoreCandidate } from "@/store/queries/app";
import { cn } from "@/utils/cn";

import { TextField } from "../../../components/Sheet";

/** Eleven careful questions, asked in person, giving a fit score and flagging concerns (PRD 12). */
export default function Vetting() {
  const { data: questions = [] } = useAppQuestions();
  const score = useScoreCandidate();
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState({});
  const sections = [...new Set(questions.map((q) => q.section))];
  const answered = Object.keys(answers).length;
  const result = score.data;

  return (
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
    </section>  );
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
