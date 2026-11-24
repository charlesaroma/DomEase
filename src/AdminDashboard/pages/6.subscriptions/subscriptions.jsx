/* Subscriptions */
import { useState } from "react";

import { useSettings, useSubscriptions } from "@/store/queries/admin";

import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import StatusChip from "../../components/StatusChip";
import Tabs from "../../components/Tabs";
import { date, money } from "../../lib/format";

const STATUS = {
  active: ["good", "Active"],
  past_due: ["bad", "Payment overdue"],
  cancelled: ["quiet", "Cancelled"],
};

// Premium plans paid by mobile money, as the payment aggregator reports them.
export default function Subscriptions() {
  const { data: subs = [], isLoading } = useSubscriptions();
  const { data: settings } = useSettings();
  const [tab, setTab] = useState("all");
  const rows = tab === "all" ? subs : subs.filter((s) => s.status === tab);
  const price = (plan) => settings?.premium?.[plan === "yearly" ? "yearlyPrice" : "monthlyPrice"];

  const columns = [
    { id: "owner", label: "Household", render: (s) => <span className="font-medium">{s.ownerName}</span> },
    { id: "plan", label: "Plan", render: (s) => (s.plan === "yearly" ? "Yearly" : "Monthly") },
    { id: "amount", label: "Amount", className: "font-mono", render: (s) => money(price(s.plan)) },
    { id: "provider", label: "Paid with", className: "hidden md:table-cell", render: (s) => s.provider },
    {
      id: "status",
      label: "Status",
      render: (s) => <StatusChip tone={STATUS[s.status][0]}>{STATUS[s.status][1]}</StatusChip>,
    },
    { id: "renews", label: "Renews", className: "hidden lg:table-cell text-ink-2", render: (s) => (s.status === "cancelled" ? `Ends ${date(s.renewsAt)}` : date(s.renewsAt)) },
    { id: "ref", label: "Reference", className: "hidden xl:table-cell font-mono text-sm text-ink-2", render: (s) => s.providerRef },
  ];

  return (
    <>
      <PageHeader
        title="Subscriptions"
        body="Premium households and how they pay. Card details never reach DomEase; payments run through the mobile money aggregator (PRD 7.2)."
      />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "all", label: "All", count: subs.length },
          ...Object.entries(STATUS).map(([id, [, label]]) => ({ id, label, count: subs.filter((s) => s.status === id).length })),
        ]}
      />
      <DataTable rows={rows} loading={isLoading} columns={columns} search={(s) => `${s.ownerName} ${s.providerRef} ${s.provider}`} />
    </>
  );
}
