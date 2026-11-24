/* Households */
import { Crown } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useHouseholds, useUpdateHousehold } from "@/store/queries/admin";

import DataTable from "../../components/DataTable";
import Drawer from "../../components/Drawer";
import { useNotify } from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import StatusChip from "../../components/StatusChip";
import Tabs from "../../components/Tabs";
import { HOUSEHOLD_TYPES } from "../../lib/constants";
import { ago, date } from "../../lib/format";

const tierChip = (h) => (h.tier === "premium" ? <StatusChip tone="premium">Premium</StatusChip> : <StatusChip>Free</StatusChip>);

export default function Households() {
  const { data: households = [], isLoading } = useHouseholds();
  const update = useUpdateHousehold();
  const notify = useNotify();
  const [tab, setTab] = useState("all");
  const [open, setOpen] = useState(null);

  const rows = tab === "all" ? households : households.filter((h) => h.tier === tab);
  const columns = [
    {
      id: "owner",
      label: "Household",
      render: (h) => (
        <div>
          <p className="font-medium">{h.owner.name}</p>
          <p className="text-sm text-ink-2">{h.owner.phone}</p>
        </div>
      ),
    },
    { id: "type", label: "Type", render: (h) => `${HOUSEHOLD_TYPES[h.type]} of ${h.size}` },
    { id: "region", label: "Region", className: "hidden md:table-cell", render: (h) => `${h.region} · ${h.currency}` },
    { id: "tier", label: "Plan", render: tierChip },
    { id: "active", label: "Last active", className: "hidden lg:table-cell text-ink-2", render: (h) => ago(h.lastActiveAt) },
  ];

  return (
    <>
      <PageHeader title="Households" body="Every home using DomEase. Open one to see its details or change its plan by hand." />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "all", label: "All", count: households.length },
          { id: "premium", label: "Premium", count: households.filter((h) => h.tier === "premium").length },
          { id: "free", label: "Free", count: households.filter((h) => h.tier === "free").length },
        ]}
      />
      <DataTable
        rows={rows}
        loading={isLoading}
        columns={columns}
        onRowClick={setOpen}
        search={(h) => `${h.owner.name} ${h.owner.phone} ${h.owner.email} ${h.region}`}
      />

      <Drawer
        open={!!open}
        title={open?.owner.name ?? ""}
        onClose={() => setOpen(null)}
        footer={
          open && (
            <Button
              variant={open.tier === "premium" ? "ghost" : "primary"}
              disabled={update.isPending}
              onClick={() => {
                const tier = open.tier === "premium" ? "free" : "premium";
                update.mutate(
                  { id: open.id, tier },
                  {
                    onSuccess: (h) => {
                      setOpen(h);
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
          <dl className="divide-y divide-line text-[15px]">
            {[
              ["Plan", tierChip(open)],
              ["Household", `${HOUSEHOLD_TYPES[open.type]} of ${open.size}`],
              ["People sharing", open.members],
              ["Phone", open.owner.phone],
              ["Email", open.owner.email],
              ["Region", open.region],
              ["Currency", open.currency],
              ["Zones set up", open.zones],
              ["Meals planned this week", open.mealsPlannedThisWeek],
              ["Joined", date(open.createdAt)],
              ["Last active", ago(open.lastActiveAt)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-3">
                <dt className="text-ink-2">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="mt-6 text-sm text-ink-2">
          Giving Premium by hand is for support cases. Normal upgrades come through mobile money and the server decides the plan (FR-MZ-1).
        </p>
      </Drawer>
    </>
  );
}
