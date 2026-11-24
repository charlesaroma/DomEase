/* Household */
import { Copy, Minus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "@/components/ui/Button";
import { useHousehold, useLeaveHousehold, useUpdateHousehold } from "@/store/queries/app";

import PremiumLock from "../../components/PremiumLock";
import Screen from "../../components/Screen";
import { useToast } from "../../components/Toast";
import { HOUSEHOLD_LABEL } from "../../lib/choices";

const ROLE = { owner: "Set up the home", member: "Shares the home", house_help: "House help" };

// The home: how many eat, who shares it, and the code to invite them (Premium).
export default function HouseholdPage() {
  const { data: h } = useHousehold();
  const update = useUpdateHousehold();
  const leave = useLeaveHousehold();
  const toast = useToast();
  const navigate = useNavigate();
  if (!h) return null;
  const premium = h.tier === "premium";

  return (
    <Screen back="/app/you" eyebrow={HOUSEHOLD_LABEL[h.type]} title={h.name}>
      <section className="flex items-center justify-between rounded-r-card bg-white p-5 shadow-sh-1">
        <span>
          <span className="block font-semibold">People eating at home</span>
          <span className="text-sm text-ink-2">Every recipe is scaled to this</span>
        </span>
        <span className="flex items-center gap-3">
          <button type="button" aria-label="Fewer" disabled={h.size <= 1} onClick={() => update.mutate({ size: h.size - 1 })} className="grid size-10 place-items-center rounded-full border border-line disabled:opacity-40">
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center font-display text-2xl font-bold tabular-nums">{h.size}</span>
          <button type="button" aria-label="More" disabled={h.size >= 20} onClick={() => update.mutate({ size: h.size + 1 })} className="grid size-10 place-items-center rounded-full border border-line disabled:opacity-40">
            <Plus className="size-4" />
          </button>
        </span>
      </section>

      <h2 className="mt-8 mb-3 font-display text-xl font-semibold">Sharing</h2>
      <PremiumLock locked={!premium} title="Share your home with Premium" body="Everyone at home sees the same plan, zones and list.">
        <div className="space-y-4 rounded-r-card bg-white p-5 shadow-sh-1">
          <ul className="divide-y divide-line">
            {h.members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-3">
                <span className="grid size-9 place-items-center rounded-full bg-clay-100 font-semibold text-clay-800">{m.name[0]}</span>
                <span className="flex-1">
                  <span className="block font-medium">{m.name}</span>
                  <span className="text-sm text-ink-2">
                    {ROLE[m.role]}
                    {m.allergies?.length > 0 && ` · allergic to ${m.allergies.join(", ").toLowerCase()}`}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between rounded-r-md bg-paper p-4">
            <span>
              <span className="block text-sm text-ink-2">Invite code</span>
              <span className="font-mono text-2xl font-bold tracking-[0.25em]">{h.inviteCode}</span>
            </span>
            <Button
              variant="ghost"
              onClick={() =>
                navigator.clipboard
                  ?.writeText(`Join our home on DomEase with the code ${h.inviteCode}`)
                  .then(() => toast("Copied. Send it to them."))
                  .catch(() => toast("Couldn't copy. Read the code out instead.", { tone: "bad" }))
              }
            >
              <Copy className="size-4" /> Copy
            </Button>
          </div>
        </div>
      </PremiumLock>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="ghost" onClick={() => navigate("/app/you/settings")}>
          Currency and reminders
        </Button>
        <Button
          variant="ghost"
          className="text-danger"
          onClick={() => window.confirm("Leave this home? Your account stays; you can set up or join another.") && leave.mutate(undefined, { onSuccess: () => navigate("/app/setup", { replace: true }) })}
        >
          Leave this home
        </Button>
      </div>
    </Screen>
  );
}
