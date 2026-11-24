/* Subscriptions */
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { usePayments, useSubscriptions } from "@/store/queries/admin";

import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import StatusChip from "../../components/StatusChip";
import { date, money } from "../../lib/format";
import { PAYMENT_STATUS } from "../8.transactions/sections/paymentColumns";

const STATUS = {
  active: ["good", "Active"],
  past_due: ["bad", "Payment overdue"],
  cancelled: ["quiet", "Cancelled"],
};

// Premium plans paid by mobile money, as the payment aggregator reports them.
export default function Subscriptions() {
  const { data: subs = [], isLoading } = useSubscriptions();
  const { data: payments = [] } = usePayments();
  const navigate = useNavigate();

  // The newest charge for each subscription: what they pay, and whether it went through.
  const lastPayment = useMemo(() => {
    const out = {};
    for (const p of payments) if (!out[p.subscriptionId] || p.createdAt > out[p.subscriptionId].createdAt) out[p.subscriptionId] = p;
    return out;
  }, [payments]);

  const columns = useMemo(
    () => [
      { id: "ownerName", accessorKey: "ownerName", header: "Household", meta: { card: "title" }, cell: ({ getValue }) => <span className="font-medium">{getValue()}</span> },
      { id: "plan", accessorKey: "plan", header: "Plan", cell: ({ getValue }) => (getValue() === "yearly" ? "Yearly" : "Monthly") },
      {
        id: "amount",
        accessorFn: (s) => lastPayment[s.id]?.amount ?? null,
        header: "Amount",
        meta: { align: "right", className: "font-mono" },
        cell: ({ getValue }) => money(getValue()),
      },
      { id: "provider", accessorKey: "provider", header: "Paid with" },
      { id: "status", accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusChip tone={STATUS[getValue()][0]}>{STATUS[getValue()][1]}</StatusChip> },
      {
        id: "last",
        accessorFn: (s) => lastPayment[s.id]?.createdAt ?? "",
        header: "Last payment",
        cell: ({ row: { original: s } }) => {
          const p = lastPayment[s.id];
          return p ? (
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <span className="text-ink-2">{date(p.createdAt)}</span>
              <StatusChip tone={PAYMENT_STATUS[p.status][0]}>{PAYMENT_STATUS[p.status][1]}</StatusChip>
            </span>
          ) : (
            "None"
          );
        },
      },
      {
        id: "renewsAt",
        accessorKey: "renewsAt",
        header: "Renews",
        meta: { className: "text-ink-2 whitespace-nowrap" },
        cell: ({ row: { original: s } }) => (s.status === "cancelled" ? `Ends ${date(s.renewsAt)}` : date(s.renewsAt)),
      },
    ],
    [lastPayment],
  );

  return (
    <>
      <PageHeader
        title="Subscriptions"
        body="Premium households and how they pay. Card details never reach DomEase; payments run through the mobile money aggregator (PRD 7.2)."
      />
      <DataTable
        rows={subs}
        loading={isLoading}
        columns={columns}
        filters={[
          { id: "status", label: "Status", options: Object.entries(STATUS).map(([value, [, label]]) => ({ value, label })), test: (s, v) => s.status === v },
          {
            id: "plan",
            label: "Plan",
            options: [
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ],
            test: (s, v) => s.plan === v,
          },
        ]}
        search={(s) => `${s.ownerName} ${s.providerRef} ${s.provider}`}
        onRowClick={(s) => navigate(`/admin/households?open=${s.householdId}`)}
        exportName="domease-subscriptions"
        exportRow={(s) => ({ ...s, lastPayment: lastPayment[s.id]?.createdAt ?? "", lastPaymentStatus: lastPayment[s.id]?.status ?? "" })}
        initialSort={{ id: "renewsAt" }}
      />
    </>
  );
}
