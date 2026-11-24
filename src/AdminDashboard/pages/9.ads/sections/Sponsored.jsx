/* Sponsored Products */
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useState } from "react";

import Media from "@/components/ui/Media";
import Button from "@/components/ui/Button";
import {
  useDeleteSponsored,
  useSaveSponsored,
  useSponsored,
} from "@/store/queries/admin";

import Drawer from "../../../components/Drawer";
import { ChipSelect, Field, Input } from "../../../components/Field";
import ImageUploader from "../../../components/ImageUploader";
import { useNotify } from "../../../components/Notice";
import StatusChip from "../../../components/StatusChip";
import Stepper from "../../../components/Stepper";
import Toggle from "../../../components/Toggle";
import { date } from "../../../lib/format";

const SCREENS = [
  { id: "shop", label: "Shop" },
  { id: "clean", label: "Clean" },
  { id: "today", label: "Today" },
  { id: "meals", label: "Meals" },
];

const STEPS = [
  { id: "product", label: "Product", hint: "Image and name" },
  { id: "where", label: "Where it shows", hint: "Screens and link" },
  { id: "when", label: "When", hint: "Dates" },
  { id: "review", label: "Review", hint: "As households see it" },
];

const blank = () => ({
  brand: "",
  product: "",
  headline: "",
  image: null,
  link: "",
  screens: ["shop"],
  matchItems: [],
  startsAt: "",
  endsAt: "",
  active: true,
});

/** Running, booked, ended or paused, from its dates and switch. */
function stateOf(s, now) {
  if (!s.active) return ["quiet", "Paused"];
  if (s.endsAt && Date.parse(s.endsAt) < now) return ["quiet", "Ended"];
  if (s.startsAt && Date.parse(s.startsAt) > now) return ["warn", "Booked"];
  return ["good", "Running"];
}

/**
 * Direct deals with local brands: a product card in the Shop list (or another
 * screen) for a set time. While one runs it takes the slot before AdMob does.
 * The apps report each view and tap to /ads/events, so a brand can be shown
 * what it got.
 */
export default function Sponsored() {
  const { data: deals = [], isLoading } = useSponsored();
  const save = useSaveSponsored();
  const remove = useDeleteSponsored();
  const notify = useNotify();
  const [form, setFormState] = useState(null);
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [now] = useState(() => Date.now());
  const setForm = setFormState;
  const open = (f, existing) => {
    setFormState(f);
    setStep(0);
    setReached(existing ? STEPS.length - 1 : 0);
  };
  const go = (i) => {
    setStep(i);
    setReached((n) => Math.max(n, i));
  };

  // What each step still needs.
  const missing = form && {
    product:
      !form.brand.trim() || !form.product.trim()
        ? "Add the brand and the product."
        : null,
    where: !/^https?:\/\//.test(form.link.trim())
      ? "Add the link a tap opens, starting https://"
      : !form.screens.length
        ? "Choose at least one screen."
        : null,
    when:
      !form.startsAt || !form.endsAt
        ? "Set both dates."
        : form.endsAt < form.startsAt
          ? "The end comes before the start."
          : null,
  };
  const valid = form && !Object.values(missing).some(Boolean);
  const at = STEPS[step].id;

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-3xl text-[15px] text-ink-2">
          Products from brands you work with directly. A running deal is shown
          before any AdMob ad in that place, and only to free households.
        </p>
        <Button onClick={() => open(blank(), false)}>
          <Plus className="size-4" /> Add a deal
        </Button>
      </div>
      {isLoading && <p className="text-ink-2">Loading</p>}
      {!isLoading && !deals.length && (
        <p className="rounded-r-card border border-dashed border-line-2 px-6 py-12 text-center text-ink-2">
          No deals yet.
        </p>
      )}

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {deals.map((s) => {
          const [tone, label] = stateOf(s, now);
          const tapRate = s.views
            ? ((s.taps / s.views) * 100).toFixed(1)
            : "0.0";
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() =>
                  open(
                    {
                      ...s,
                      startsAt: s.startsAt.slice(0, 10),
                      endsAt: s.endsAt.slice(0, 10),
                    },
                    true,
                  )
                }
                className="block w-full overflow-hidden rounded-r-card border border-line bg-white text-left hover:shadow-sh-2"
              >
                <div className="flex gap-4 p-4">
                  <Media
                    src={s.image?.url}
                    alt={s.image?.alt}
                    className="size-20 shrink-0 rounded-r-md"
                    fallback={
                      <div className="grid size-20 shrink-0 place-items-center rounded-r-md bg-paper-2 text-xs text-ink-3">
                        No image
                      </div>
                    }
                  />
                  <div className="min-w-0">
                    <StatusChip tone={tone}>{label}</StatusChip>
                    <p className="mt-1.5 truncate font-semibold">{s.product}</p>
                    <p className="text-sm text-ink-2">{s.brand}</p>
                  </div>
                </div>
                <dl className="grid grid-cols-3 border-t border-line text-center text-sm">
                  <div className="p-3">
                    <dt className="text-ink-2">Seen</dt>
                    <dd className="font-semibold tabular-nums">
                      {s.views.toLocaleString("en-GB")}
                    </dd>
                  </div>
                  <div className="border-x border-line p-3">
                    <dt className="text-ink-2">Taps</dt>
                    <dd className="font-semibold tabular-nums">{s.taps}</dd>
                  </div>
                  <div className="p-3">
                    <dt className="text-ink-2">Tap rate</dt>
                    <dd className="font-semibold tabular-nums">{tapRate}%</dd>
                  </div>
                </dl>
                <p className="border-t border-line px-4 py-2.5 text-xs text-ink-2">
                  {date(s.startsAt.slice(0, 10))} to {date(s.endsAt.slice(0, 10))} ·{" "}
                  {s.screens
                    .map((x) => SCREENS.find((y) => y.id === x)?.label)
                    .join(", ")}
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      <Drawer
        open={!!form}
        title={
          form?.id
            ? `${form.brand}: ${form.product}`
            : "A new sponsored product"
        }
        onClose={() => setForm(null)}
        wide
        footer={
          <>
            {form?.id && (
              <Button
                variant="ghost"
                className="mr-auto text-danger"
                onClick={() =>
                  window.confirm("Delete this deal and its figures?") &&
                  remove.mutate(form.id, {
                    onSuccess: () => (notify("Deal deleted."), setForm(null)),
                  })
                }
              >
                Delete
              </Button>
            )}
            {step > 0 ? (
              <Button variant="ghost" onClick={() => go(step - 1)}>
                <ArrowLeft className="size-4" /> Back
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setForm(null)}>
                Cancel
              </Button>
            )}
            {at !== "review" && (
              <Button
                onClick={() => go(step + 1)}
                disabled={!form?.id && !!missing?.[at]}
              >
                Next <ArrowRight className="size-4" />
              </Button>
            )}
            <Button
              className={at === "review" || form?.id ? "" : "hidden"}
              disabled={!valid || save.isPending}
              onClick={() =>
                save.mutate(
                  {
                    ...form,
                    brand: form.brand.trim(),
                    product: form.product.trim(),
                    link: form.link.trim(),
                    startsAt: `${form.startsAt}T00:00:00Z`,
                    endsAt: `${form.endsAt}T23:59:00Z`,
                  },
                  { onSuccess: () => (notify("Saved."), setForm(null)) },
                )
              }
            >
              Save
            </Button>
          </>
        }
      >
        {form && (
          <div className="space-y-5">
            <div className="-mx-6 -mt-6 mb-6 border-b border-line px-6 py-4">
              <Stepper
                steps={STEPS.map((x) => ({ ...x, invalid: !!missing[x.id] }))}
                current={step}
                reached={reached}
                onSelect={go}
                free={!!form.id}
              />
            </div>
            {missing[at] && step < reached && (
              <p
                className="rounded-r-md bg-danger-100 px-4 py-3 text-sm text-danger"
                role="alert"
              >
                {missing[at]}
              </p>
            )}
            {at === "product" && (
              <>
                <ImageUploader
                  label="Product image"
                  folder="sponsored"
                  aspect="aspect-square"
                  altFrom={form.product}
                  value={form.image ? [form.image] : []}
                  onChange={(list) =>
                    setForm({ ...form, image: list[0] ?? null })
                  }
                  hint="A square photo of the product on a plain background."
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Brand">
                    <Input
                      value={form.brand}
                      onChange={(e) =>
                        setForm({ ...form, brand: e.target.value })
                      }
                      placeholder="Mukwano"
                    />
                  </Field>
                  <Field label="Product">
                    <Input
                      value={form.product}
                      onChange={(e) =>
                        setForm({ ...form, product: e.target.value })
                      }
                      placeholder="Roki cooking oil, 1 litre"
                    />
                  </Field>
                </div>
                <Field
                  label="Line above the product"
                  hint="Short. Shown in small text."
                >
                  <Input
                    value={form.headline}
                    maxLength={48}
                    onChange={(e) =>
                      setForm({ ...form, headline: e.target.value })
                    }
                    placeholder="Cooking oil for the week"
                  />
                </Field>
              </>
            )}
            {at === "where" && (
              <>
                <Field
                  label="Where a tap goes"
                  hint="The brand's page or shop. Starts with https://"
                >
                  <Input
                    type="url"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="https://"
                  />
                </Field>
                <Field label="Show on">
                  <ChipSelect
                    options={SCREENS}
                    value={form.screens}
                    onChange={(screens) => setForm({ ...form, screens })}
                  />
                </Field>
                <Field
                  label="Show when the list has"
                  hint="Optional. Separate with commas. On Shop, the card appears only beside these items."
                >
                  <Input
                    defaultValue={form.matchItems.join(", ")}
                    onBlur={(e) =>
                      setForm({
                        ...form,
                        matchItems: e.target.value
                          .split(",")
                          .map((s) => s.trim().toLowerCase())
                          .filter(Boolean),
                      })
                    }
                  />
                </Field>
              </>
            )}
            {at === "when" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Starts">
                    <Input
                      type="date"
                      value={form.startsAt}
                      onChange={(e) =>
                        setForm({ ...form, startsAt: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="Ends">
                    <Input
                      type="date"
                      value={form.endsAt}
                      min={form.startsAt}
                      onChange={(e) =>
                        setForm({ ...form, endsAt: e.target.value })
                      }
                    />
                  </Field>
                </div>
                <div className="flex items-center justify-between rounded-r-md border border-line px-4 py-3">
                  <span className="text-[15px]">Running</span>
                  <Toggle
                    label="Running"
                    checked={form.active}
                    onChange={(active) => setForm({ ...form, active })}
                  />
                </div>
              </>
            )}
            {at === "review" && <SponsoredPreview deal={form} />}
          </div>
        )}
      </Drawer>
    </>
  );
}

/** The card as a free household meets it in the Shop list. */
function SponsoredPreview({ deal }) {
  return (
    <div className="space-y-4">
      <p className="text-[15px] text-ink-2">
        How it appears in the list, between the household's own items:
      </p>
      <div className="mx-auto max-w-sm rounded-r-card bg-paper p-4">
        <div className="rounded-r-md border border-line bg-white p-3">
          <p className="text-[11px] font-medium tracking-wide text-ink-3 uppercase">
            Sponsored · {deal.headline || deal.brand}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <Media
              src={deal.image?.url}
              alt={deal.image?.alt}
              className="size-14 shrink-0 rounded-r-sm"
              fallback={
                <div className="size-14 shrink-0 rounded-r-sm bg-paper-2" />
              }
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {deal.product || "Product"}
              </p>
              <p className="text-sm text-ink-2">{deal.brand}</p>
            </div>
            <span className="rounded-r-pill border border-clay-700 px-3 py-1 text-sm text-clay-700">
              View
            </span>
          </div>
        </div>
      </div>
      <dl className="divide-y divide-line rounded-r-card border border-line text-[15px]">
        {[
          [
            "Shows on",
            deal.screens
              .map((x) => SCREENS.find((y) => y.id === x)?.label)
              .join(", "),
          ],
          [
            "Beside",
            deal.matchItems.length ? deal.matchItems.join(", ") : "Any list",
          ],
          [
            "Runs",
            `${date(deal.startsAt)} to ${date(deal.endsAt)}${deal.active ? "" : ", paused"}`,
          ],
          ["A tap opens", deal.link],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-6 px-4 py-3">
            <dt className="text-ink-2">{k}</dt>
            <dd className="min-w-0 truncate text-right">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
