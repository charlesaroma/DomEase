/* Premium */
import { ArrowLeft, Check, Crown, LoaderCircle, Smartphone } from "lucide-react";
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

  return (
    <Screen back="/app" eyebrow="DomEase Premium" title="Get the whole of DomEase">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <FeatureList features={features} />

        <section className="h-fit rounded-r-stage bg-white p-5 shadow-sh-2 lg:sticky lg:top-8">
          {/* Steps */}
          <ol className="mb-5 flex items-center gap-2 text-xs" aria-label="Steps">
            {STEPS.map((s, i) => (
              <li key={s} className="flex flex-1 items-center gap-2" aria-current={i === step ? "step" : undefined}>
                <span className={cn("grid size-6 shrink-0 place-items-center rounded-full font-semibold", i < step ? "bg-clay-700 text-white" : i === step ? "bg-clay-700 text-white ring-4 ring-clay-100" : "bg-paper-2 text-ink-2")}>
                  {i < step ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span className={cn("hidden truncate sm:inline", i === step ? "font-semibold" : "text-ink-2")}>{s}</span>
                {i < STEPS.length - 1 && <span className={cn("h-0.5 flex-1 rounded-full", i < step ? "bg-clay-700" : "bg-line")} />}
              </li>
            ))}
          </ol>

          {step === 0 && (
            <div className="space-y-3">
              {[
                ["yearly", "Yearly", "Best value"],
                ["monthly", "Monthly", "Stop any time"],
              ].map(([id, label, note]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPlan(id)}
                  aria-pressed={plan === id}
                  className={cn("flex w-full items-center justify-between rounded-r-card border-2 p-4 text-left", plan === id ? "border-clay-700 bg-clay-100/40" : "border-line")}
                >
                  <span>
                    <span className="block font-semibold">{label}</span>
                    <span className="text-sm text-ink-2">{note}</span>
                  </span>
                  <span className="font-display text-lg font-bold">{prices[id] != null ? money(prices[id]) : "Price at launch"}</span>
                </button>
              ))}
              <Button className="w-full" onClick={() => setStep(1)}>
                Continue
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProvider(p.id)}
                    aria-pressed={provider === p.id}
                    className={cn("rounded-r-md border-2 px-3 py-3 text-sm font-medium", provider === p.id ? "border-clay-700 bg-clay-100/40" : "border-line")}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">Mobile money number</span>
                <span className="flex items-center rounded-r-md border border-line focus-within:border-clay-700">
                  <span className="pl-3.5 text-ink-2">+256</span>
                  <input
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="7XX XXX XXX"
                    className="h-12 min-w-0 flex-1 bg-transparent px-2 text-base outline-none"
                  />
                </span>
                {validPhone && !PROVIDERS.find((p) => p.id === provider).prefix.some((x) => digits.startsWith(x)) && (
                  <span className="mt-1 block text-xs text-amber-800">That looks like a different network. Check it is your {PROVIDERS.find((p) => p.id === provider).label} number.</span>
                )}
              </label>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep(0)} aria-label="Back">
                  <ArrowLeft className="size-4" />
                </Button>
                <Button className="flex-1" disabled={!validPhone} onClick={() => (setStep(2), checkout.mutate({ plan, provider, phone: `+256${digits}` }))}>
                  Pay {prices[plan] != null ? money(prices[plan]) : ""}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-4 text-center">
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
                  <p className="mt-1 text-sm text-ink-2">Approve the {PROVIDERS.find((p) => p.id === provider).label} prompt on +256 {digits} with your PIN. DomEase never sees it.</p>
                </>
              )}
            </div>
          )}
          <p className="mt-5 text-xs text-ink-3">
            See the{" "}
            <Link to="/premium-terms" className="underline">
              Premium terms
            </Link>
            . Stop any time from You → Premium.
          </p>
        </section>
      </div>
    </Screen>
  );
}

function FeatureList({ features }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {features.map((f) => (
        <li key={f.id} className="flex gap-3 rounded-r-card bg-white p-4 shadow-sh-1">
          <Crown className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden="true" />
          <span>
            <span className="block font-semibold">
              {f.title}
              {f.comingSoon && <span className="ml-2 rounded-r-pill bg-paper-2 px-2 py-0.5 text-xs font-normal text-ink-2">Coming soon</span>}
            </span>
            <span className="text-sm text-ink-2">{f.description}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
