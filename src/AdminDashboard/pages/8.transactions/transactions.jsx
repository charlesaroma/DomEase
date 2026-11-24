/* Transactions */
import { CircleAlert, RotateCcw, TrendingUp, Wallet } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import Button from "@/components/ui/Button";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { usePayments, useRefundPayment } from "@/store/queries/admin";

import DataTable from "../../components/DataTable";
import DetailList from "../../components/DetailList";
import Drawer from "../../components/Drawer";
import { Field, Textarea } from "../../components/Field";
import { useNotify } from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import StatusChip from "../../components/StatusChip";
import { PROVIDERS } from "../../lib/constants";
import { dateTime, money } from "../../lib/format";
import { KIND, PAYMENT_STATUS, paymentColumns, paymentExport, paymentFilters, paymentSearch } from "./sections/paymentColumns";

/**
 * Every mobile money charge for Premium, as the payment aggregator reported
 * it: paid, waiting for the customer to approve the prompt, failed, or
 * refunded. DomEase never sees a PIN; only the masked number and reference.
 */
export default function Transactions() {
  const { data: payments = [], isLoading } = usePayments();
  const { canDo } = useAdminAuth();
  const refund = useRefundPayment();
  const notify = useNotify();
  const [openId, setOpenId] = useState(null);
  const [reason, setReason] = useState("");
  const open = payments.find((p) => p.id === openId);

  const month = new Date().toISOString().slice(0, 7);
  const thisMonth = payments.filter((p) => p.createdAt.startsWith(month));
  const paid = thisMonth.filter((p) => p.status === "successful");
  const settled = thisMonth.filter((p) => p.status === "successful" || p.status === "failed");
  const successRate = settled.length ? Math.round((paid.length / settled.length) * 100) : null;
  const refunded = payments.filter((p) => p.status === "refunded");

  return (
    <>
      <PageHeader
        title="Transactions"
        body="Every Premium payment by mobile money, newest first. Filter, open one for its full record, or export for the accountant."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Paid this month" value={money(paid.reduce((n, p) => n + p.amount, 0))} note={`${paid.length} payments`} icon={Wallet} tone="good" />
        <StatCard
          label="Payments that went through"
          value={successRate == null ? "None yet" : `${successRate}%`}
          note="This month, of those finished"
          icon={TrendingUp}
        />
        <StatCard
          label="Failed this month"
          value={thisMonth.filter((p) => p.status === "failed").length}
          note="Usually a prompt not approved"
          icon={CircleAlert}
          tone="bad"
        />
        <StatCard label="Refunded" value={money(refunded.reduce((n, p) => n + p.amount, 0))} note={`${refunded.length} in all`} icon={RotateCcw} tone="warn" />
      </div>

      <DataTable
        rows={payments}
        loading={isLoading}
        columns={paymentColumns}
        filters={paymentFilters}
        search={paymentSearch}
        searchLabel="Search household, reference or number"
        onRowClick={(p) => {
          setReason("");
          setOpenId(p.id);
        }}
        exportName="domease-transactions"
        exportRow={paymentExport}
        initialSort={{ id: "createdAt", desc: true }}
        empty="No payments yet. They appear here as soon as the first household upgrades."
      />

      <Drawer
        open={!!open}
        title={open ? `${money(open.amount, open.currency)} from ${open.ownerName}` : ""}
        onClose={() => setOpenId(null)}
        footer={
          open?.status === "successful" &&
          canDo("refund") && (
            <Button
              variant="ghost"
              disabled={!reason.trim() || refund.isPending}
              onClick={() =>
                window.confirm(`Mark ${money(open.amount)} to ${open.ownerName} as refunded? Send the money back through the aggregator first.`) &&
                refund.mutate({ id: open.id, reason: reason.trim() }, { onSuccess: () => notify("Marked as refunded.") })
              }
            >
              <RotateCcw className="size-4" /> Mark refunded
            </Button>
          )
        }
      >
        {open && (
          <div className="space-y-8">
            <DetailList
              items={[
                ["Status", <StatusChip key="s" tone={PAYMENT_STATUS[open.status][0]}>{PAYMENT_STATUS[open.status][1]}</StatusChip>],
                open.failureReason && ["Why it failed", open.failureReason],
                ["Amount", <span key="a" className="font-mono">{money(open.amount, open.currency)}</span>],
                ["Plan", `${open.plan === "yearly" ? "Yearly" : "Monthly"}, ${KIND[open.kind].toLowerCase()}`],
                ["Paid with", PROVIDERS[open.provider]],
                ["Number", <span key="n" className="font-mono">{open.msisdnMasked}</span>],
                ["Reference", <span key="r" className="font-mono">{open.providerRef}</span>],
                ["Started", dateTime(open.createdAt)],
                ["Settled", open.settledAt ? dateTime(open.settledAt) : "Not settled"],
                open.refundedAt && ["Refunded", `${dateTime(open.refundedAt)}: ${open.refundReason}`],
              ]}
            />
            <Link to={`/admin/households?open=${open.householdId}`} className="inline-block text-sm text-clay-700 hover:underline">
              Open {open.ownerName}'s household
            </Link>
            {open.status === "successful" && canDo("refund") && (
              <Field label="Reason for a refund" hint="Required. It goes in the Activity log. The money itself is returned through the aggregator's dashboard.">
                <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Charged twice on 12 November" />
              </Field>
            )}
            {open.status === "pending" && (
              <p className="rounded-r-md bg-paper p-4 text-sm text-ink-2">
                The customer has a prompt on their phone. If they don't approve it within a few minutes, the aggregator marks it failed.
              </p>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
