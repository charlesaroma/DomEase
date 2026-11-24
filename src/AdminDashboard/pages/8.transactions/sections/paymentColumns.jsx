/* Payment Columns */
import StatusChip from "../../../components/StatusChip";
import { PROVIDERS } from "../../../lib/constants";
import { dateTime, money } from "../../../lib/format";

export const PAYMENT_STATUS = {
  successful: ["good", "Paid"],
  pending: ["warn", "Waiting"],
  failed: ["bad", "Failed"],
  refunded: ["quiet", "Refunded"],
};
export const KIND = { new: "First payment", renewal: "Renewal" };

export const paymentColumns = [
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Date",
    meta: { className: "whitespace-nowrap text-ink-2" },
    cell: ({ getValue }) => dateTime(getValue()),
  },
  {
    id: "ownerName",
    accessorKey: "ownerName",
    header: "Household",
    meta: { card: "title" },
    cell: ({ row: { original: p } }) => (
      <div>
        <p className="font-medium">{p.ownerName}</p>
        <p className="text-sm text-ink-2">
          {p.plan === "yearly" ? "Yearly" : "Monthly"} · {KIND[p.kind]}
        </p>
      </div>
    ),
  },
  {
    id: "amount",
    accessorKey: "amount",
    header: "Amount",
    meta: { align: "right", className: "font-mono" },
    cell: ({ row: { original: p } }) => <span className={p.status === "successful" ? "" : "text-ink-3"}>{money(p.amount, p.currency)}</span>,
  },
  {
    id: "provider",
    accessorKey: "provider",
    header: "Paid with",
    cell: ({ row: { original: p } }) => (
      <div>
        <p>{PROVIDERS[p.provider]}</p>
        <p className="font-mono text-xs text-ink-2">{p.msisdnMasked}</p>
      </div>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row: { original: p } }) => (
      <div>
        <StatusChip tone={PAYMENT_STATUS[p.status][0]}>{PAYMENT_STATUS[p.status][1]}</StatusChip>
        {p.failureReason && <p className="mt-1 text-xs text-ink-2">{p.failureReason}</p>}
      </div>
    ),
  },
  { id: "providerRef", accessorKey: "providerRef", header: "Reference", meta: { className: "font-mono text-sm text-ink-2" } },
];

const inRange = (iso, range) => {
  const days = { today: 1, week: 7, month: 30, quarter: 90 }[range];
  return Date.now() - Date.parse(iso) < days * 864e5;
};

export const paymentFilters = [
  { id: "status", label: "Status", options: Object.entries(PAYMENT_STATUS).map(([value, [, label]]) => ({ value, label })), test: (p, v) => p.status === v },
  { id: "provider", label: "Paid with", options: Object.entries(PROVIDERS).map(([value, label]) => ({ value, label })), test: (p, v) => p.provider === v },
  {
    id: "plan",
    label: "Plan",
    options: [
      { value: "monthly", label: "Monthly" },
      { value: "yearly", label: "Yearly" },
    ],
    test: (p, v) => p.plan === v,
  },
  {
    id: "when",
    label: "When",
    options: [
      { value: "today", label: "Last 24 hours" },
      { value: "week", label: "Last 7 days" },
      { value: "month", label: "Last 30 days" },
      { value: "quarter", label: "Last 90 days" },
    ],
    test: (p, v) => inRange(p.createdAt, v),
  },
];

export const paymentSearch = (p) => `${p.ownerName} ${p.providerRef} ${p.msisdnMasked} ${p.id}`;

export const paymentExport = (p) => ({
  id: p.id,
  date: p.createdAt,
  household: p.ownerName,
  householdId: p.householdId,
  plan: p.plan,
  kind: p.kind,
  amount: p.amount,
  currency: p.currency,
  provider: PROVIDERS[p.provider],
  number: p.msisdnMasked,
  reference: p.providerRef,
  status: p.status,
  failureReason: p.failureReason ?? "",
  settledAt: p.settledAt ?? "",
});
