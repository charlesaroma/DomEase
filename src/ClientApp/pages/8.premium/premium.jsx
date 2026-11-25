/* Premium */
import { ArrowLeft, Check, Clock, Crown, LoaderCircle, Smartphone } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import Button from "@/components/ui/Button";
import { useAppPremiumFeatures, useAppSettings, useCheckout, useHousehold } from "@/store/queries/app";
import { cn } from "@/utils/cn";

import Screen from "../../components/Screen";
import { money } from "../../lib/choices";

const PROVIDERS = [
  { id: "mtn", label: "MTN Mobile Money", prefix: ["77", "78", "76", "39"] },
  { id: "airtel", label: "Airtel Money", prefix: ["70", "75", "74", "20"] },
];
const STEPS = ["Choose a plan", "Your number", "Approve"];

/**
 * What Premium includes (the list comes from the admin), and paying for it
 * with mobile money in three steps: plan, number, approve the prompt on the
 * phone. DomEase never sees the PIN; the server decides the plan once paid.
 */
export default function Premium() {
  const { data: household } = useHousehold();
  const { data: features = [] } = useAppPremiumFeatures();
  const { data: settings } = useAppSettings();
  const checkout = useCheckout();
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState("yearly");
  const [provider, setProvider] = useState("mtn");
  const [phone, setPhone] = useState("");
  const digits = phone.replace(/\D/g, "").replace(/^256/, "").replace(/^0/, "");
  const validPhone = digits.length === 9;
  const prices = { monthly: settings?.premium?.monthlyPrice, yearly: settings?.premium?.yearlyPrice };
  const premium = household?.tier === "premium";

  if (premium && !checkout.isSuccess) {
    return (
      <Screen back="/app/you" eyebrow="Your plan" title="You have Premium">
        {household?.trialEndsAt && <p className="mb-4 rounded-r-card bg-amber-200/50 p-4">Your free trial ends {new Date(household.trialEndsAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}.</p>}
        <FeatureList features={features} />
      </Screen>
    );
  }

  if (checkout.isSuccess) {
    return (
      <Screen title="Welcome to Premium">
        <div className="rounded-r-stage bg-sage-100 p-8 text-center text-sage-800">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-white">
            <Check className="size-8" strokeWidth={3} />
          </span>
          <p className="mt-4 font-display text-2xl font-bold">Payment received</p>
          <p className="mt-1">Everything below is open for your whole home now.</p>
          <Link to="/app" className="mt-6 inline-flex h-11 items-center rounded-r-pill bg-clay-700 px-6 font-display font-semibold text-white">
            Back to Today
          </Link>
        </div>
      </Screen>
    );
  }

  const providerLabel = PROVIDERS.find((p) => p.id === provider).label;
  const wrongNetwork = validPhone && !PROVIDERS.find((p) => p.id === provider).prefix.some((x) => digits.startsWith(x));

  return (
    <Screen wide back="/app" eyebrow="DomEase Premium" title="Get the whole of DomEase">
      <p className="-mt-3 mb-8 max-w-xl text-ink-2 md:text-lg">One plan covers everyone at home. Pay with MTN or Airtel Mobile Money and stop any time.</p>

      {/* Checkout first on a phone; on the right from a tablet up, beside what you get */}
      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,1fr)_340px] lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-12">
        <section aria-label="Pay for Premium" className="rounded-r-stage bg-white p-5 shadow-sh-2 sm:p-6 md:sticky md:top-8 md:order-last">
          {/* Steps */}
          <ol className="mb-6 flex items-center gap-2 text-xs" aria-label="Steps">
            {STEPS.map((s, i) => (
              <li key={s} className={cn("flex items-center gap-2", i < STEPS.length - 1 && "flex-1")} aria-current={i === step ? "step" : undefined}>
                <span className={cn("grid size-6 shrink-0 place-items-center rounded-full font-semibold", i <= step ? "bg-clay-700 text-white" : "bg-paper-2 text-ink-2", i === step && "ring-4 ring-clay-100")}>
                  {i < step ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span className={cn("font-semibold whitespace-nowrap", i !== step && "sr-only")}>{s}</span>
                {i < STEPS.length - 1 && <span className={cn("h-0.5 min-w-3 flex-1 rounded-full", i < step ? "bg-clay-700" : "bg-line")} />}
              </li>
            ))}
          </ol>

          {step === 0 && (
            <div className="space-y-3">
              {[
                ["yearly", "Yearly", "Billed once a year", "Best value"],
                ["monthly", "Monthly", "Stop any time"],
              ].map(([id, label, note, badge]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPlan(id)}
                  aria-pressed={plan === id}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-r-card border-2 p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-700",
                    plan === id ? "border-clay-700 bg-clay-100/40" : "border-line hover:border-line-2",
                  )}
                >
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2", plan === id ? "border-clay-700" : "border-line-2")} aria-hidden="true">
                    {plan === id && <span className="size-2.5 rounded-full bg-clay-700" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-semibold">{label}</span>
                      {badge && <span className="rounded-r-pill bg-amber-200/70 px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap text-amber-800">{badge}</span>}
                    </span>
                    <span className="block text-sm text-ink-2">{note}</span>
                  </span>
                  {prices[id] != null ? (
                    <span className="shrink-0 font-display text-lg font-bold">{money(prices[id])}</span>
                  ) : (
                    <span className="shrink-0 text-right text-xs leading-tight text-ink-3">
                      Price
                      <br />
                      at launch
                    </span>
                  )}
                </button>
              ))}
              <Button className="mt-2 w-full" onClick={() => setStep(1)}>
                Continue
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium">Pay with</legend>
                <div className="grid grid-cols-2 gap-2">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProvider(p.id)}
                      aria-pressed={provider === p.id}
                      className={cn(
                        "min-h-12 rounded-r-md border-2 px-3 py-2 text-sm leading-tight font-medium transition-colors",
                        provider === p.id ? "border-clay-700 bg-clay-100/40 text-clay-800" : "border-line hover:border-line-2",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Mobile money number</span>
                <span className="flex items-center rounded-r-md border border-line bg-white transition-shadow focus-within:border-clay-700 focus-within:ring-2 focus-within:ring-clay-100">
                  <span className="border-r border-line py-1 pr-3 pl-3.5 text-ink-2">+256</span>
                  <input
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="7XX XXX XXX"
                    className="h-12 min-w-0 flex-1 bg-transparent px-3 text-base outline-none"
                  />
                </span>
                {wrongNetwork && <span className="mt-1.5 block text-xs text-amber-800">That looks like a different network. Check it is your {providerLabel} number.</span>}
              </label>
              <div className="flex gap-2">
                <Button variant="ghost" className="w-11 shrink-0 px-0" onClick={() => setStep(0)} aria-label="Back to plans">
                  <ArrowLeft className="size-4" />
                </Button>
                <Button className="flex-1" disabled={!validPhone} onClick={() => (setStep(2), checkout.mutate({ plan, provider, phone: `+256${digits}` }))}>
                  {prices[plan] != null ? `Pay ${money(prices[plan])}` : "Pay now"}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-4 text-center" aria-live="polite">
              {checkout.isError ? (
                <>
                  <p className="font-semibold text-danger">That didn't go through.</p>
                  <p className="mt-1 text-sm text-ink-2">{checkout.error.message}</p>
                  <Button className="mt-4" onClick={() => setStep(1)}>
                    Try again
                  </Button>
                </>
              ) : (
                <>
                  <span className="relative mx-auto grid size-16 place-items-center rounded-full bg-clay-100 text-clay-700">
                    <Smartphone className="size-7" />
                    <LoaderCircle className="absolute size-16 animate-spin text-clay-400" strokeWidth={1} />
                  </span>
                  <p className="mt-4 font-semibold">Check your phone</p>
                  <p className="mx-auto mt-1 max-w-xs text-sm text-ink-2">
                    Approve the {providerLabel} prompt on <span className="whitespace-nowrap">+256 {digits}</span> with your PIN. DomEase never sees it.
                  </p>
                </>
              )}
            </div>
          )}

          <p className="mt-5 border-t border-line pt-4 text-xs text-ink-3">
            See the{" "}
            <Link to="/premium-terms" className="underline hover:text-ink-2">
              Premium terms
            </Link>
            . Stop any time from You → Premium.
          </p>
        </section>

        <FeatureList features={features} />
      </div>
    </Screen>
  );
}

/** What Premium includes, then what is on the way, as one list each. */
function FeatureList({ features }) {
  const groups = [
    ["What's included", features.filter((f) => !f.comingSoon)],
    ["On the way", features.filter((f) => f.comingSoon)],
  ].filter(([, list]) => list.length);
  return (
    <div className="space-y-6">
      {groups.map(([heading, list], g) => (
        <section key={heading} aria-label={heading}>
          <h2 className="mb-3 font-display text-lg font-semibold">{heading}</h2>
          <ul className="grid rounded-r-card bg-white px-4 shadow-sh-1 sm:px-5">
            {list.map((f) => (
              <li key={f.id} className="flex gap-3 border-b border-line py-4 last:border-b-0">
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", g === 0 ? "bg-amber-200/60 text-amber-800" : "bg-paper-2 text-ink-2")}>
                  {g === 0 ? <Crown className="size-4" aria-hidden="true" /> : <Clock className="size-4" aria-hidden="true" />}
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className="block font-semibold leading-snug">{f.title}</span>
                  <span className="mt-0.5 block text-sm text-ink-2">{f.description}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
