/* Households */
import { Crown } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import Button from "@/components/ui/Button";
import { useHouseholds, usePayments, useSetHouseholdTier, useUsers } from "@/store/queries/admin";

import DataTable from "../../components/DataTable";
import DetailList from "../../components/DetailList";
import Drawer from "../../components/Drawer";
import { Field, Textarea } from "../../components/Field";
import { useNotify } from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import StatusChip from "../../components/StatusChip";
import { HOUSEHOLD_TYPES } from "../../lib/constants";
import { ago, date, money } from "../../lib/format";
import { PAYMENT_STATUS } from "../8.transactions/sections/paymentColumns";
import { householdColumns, householdExport, householdFilters, tierChip } from "./sections/householdColumns";

// Every home using DomEase. ?open=<id> opens one, so other pages can link here.
export default function Households() {
  const { data: households = [], isLoading } = useHouseholds();
  const { data: users = [] } = useUsers();
  const { data: payments = [] } = usePayments();
  const setTier = useSetHouseholdTier();
  const notify = useNotify();
  const [params, setParams] = useSearchParams();
  const [reason, setReason] = useState("");
  const openId = params.get("open");
  const open = households.find((h) => h.id === openId);

  const regions = useMemo(() => [...new Set(households.map((h) => h.region))].sort(), [households]);
  const filters = useMemo(() => householdFilters(regions), [regions]);
  const people = open ? users.filter((u) => u.householdId === open.id) : [];
  const paid = open ? payments.filter((p) => p.householdId === open.id) : [];

  const show = (id) => {
    setReason("");
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id) next.set("open", id);
        else next.delete("open");
        return next;
      },
      { replace: true },
    );
  };

  return (
    <>
      <PageHeader title="Households" body="Every home using DomEase. Open one to see who is in it, what they paid, or to change its plan by hand." />
      <DataTable
        rows={households}
        loading={isLoading}
        columns={householdColumns}
        filters={filters}
        onRowClick={(h) => show(h.id)}
        search={(h) => `${h.owner.name} ${h.owner.phone} ${h.owner.email} ${h.region}`}
        searchLabel="Search name, phone or region"
        exportName="domease-households"
        exportRow={householdExport}
        initialSort={{ id: "createdAt", desc: true }}
      />

      <Drawer
        open={!!open}
        title={open ? `${open.owner.name}'s home` : ""}
        onClose={() => show(null)}
        footer={
          open && (
            <Button
              variant={open.tier === "premium" ? "ghost" : "primary"}
              disabled={setTier.isPending || !reason.trim()}
              onClick={() => {
                const tier = open.tier === "premium" ? "free" : "premium";
                setTier.mutate(
                  { id: open.id, tier, reason: reason.trim() },
                  {
                    onSuccess: () => {
                      setReason("");
                      notify(tier === "premium" ? "Premium switched on for this household." : "Moved back to the free plan.");
                    },
                  },
                );
              }}
            >
              <Crown className="size-4" /> {open.tier === "premium" ? "Move to free" : "Give Premium"}
            </Button>
          )
        }
      >
        {open && (
          <div className="space-y-8">
            <DetailList
              items={[
                ["Plan", tierChip(open)],
                ["Household", `${HOUSEHOLD_TYPES[open.type]} of ${open.size}`],
                ["Phone", open.owner.phone],
                ["Email", open.owner.email],
                ["Region", open.region],
                ["Currency", open.currency],
                ["Zones set up", open.zones],
                ["Meals planned this week", open.mealsPlannedThisWeek],
                ["Joined", date(open.createdAt)],
                ["Last active", ago(open.lastActiveAt)],
              ]}
            />

            <section>
              <h3 className="mb-2 text-sm font-semibold">People ({people.length})</h3>
              <ul className="divide-y divide-line rounded-r-md border border-line">
                {people.map((u) => (
                  <li key={u.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <Link to={`/admin/users?q=${encodeURIComponent(u.name)}`} className="font-medium hover:text-clay-700">
                      {u.name}
                    </Link>
                    <span className="text-ink-2">{u.householdRole === "owner" ? "Owner" : "Member"}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-sm font-semibold">Payments ({paid.length})</h3>
              {paid.length ? (
                <ul className="divide-y divide-line rounded-r-md border border-line">
                  {paid.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <span>
                        <span className="font-mono">{money(p.amount, p.currency)}</span>
                        <span className="text-ink-2"> · {date(p.createdAt)}</span>
                      </span>
                      <StatusChip tone={PAYMENT_STATUS[p.status][0]}>{PAYMENT_STATUS[p.status][1]}</StatusChip>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-2">None. This home has never paid.</p>
              )}
            </section>

            <Field
              label={open.tier === "premium" ? "Why move this home to free?" : "Why give this home Premium?"}
              hint="Required, and saved in the Activity log. Normal upgrades come through mobile money and the server decides the plan (FR-MZ-1); this is for support cases."
            >
              <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Paid, but the aggregator missed the callback" />
            </Field>
          </div>
        )}
      </Drawer>
    </>
  );
}
