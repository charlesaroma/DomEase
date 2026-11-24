/* Household Columns */
import StatusChip from "../../../components/StatusChip";
import { HOUSEHOLD_TYPES } from "../../../lib/constants";
import { ago, date } from "../../../lib/format";

export const tierChip = (h) => (h.tier === "premium" ? <StatusChip tone="premium">Premium</StatusChip> : <StatusChip>Free</StatusChip>);

export const householdColumns = [
  {
    id: "owner",
    accessorFn: (h) => h.owner.name,
    header: "Household",
    meta: { card: "title" },
    cell: ({ row: { original: h } }) => (
      <div>
        <p className="font-medium">{h.owner.name}</p>
        <p className="text-sm text-ink-2">{h.owner.phone}</p>
      </div>
    ),
  },
  { id: "type", accessorKey: "type", header: "Type", cell: ({ row: { original: h } }) => `${HOUSEHOLD_TYPES[h.type]} of ${h.size}` },
  { id: "region", accessorKey: "region", header: "Region", cell: ({ row: { original: h } }) => `${h.region} · ${h.currency}` },
  { id: "members", accessorKey: "members", header: "Sharing", meta: { className: "tabular-nums" } },
  { id: "tier", accessorKey: "tier", header: "Plan", cell: ({ row: { original: h } }) => tierChip(h) },
  { id: "createdAt", accessorKey: "createdAt", header: "Joined", meta: { className: "text-ink-2 whitespace-nowrap" }, cell: ({ getValue }) => date(getValue()) },
  { id: "lastActiveAt", accessorKey: "lastActiveAt", header: "Last active", meta: { className: "text-ink-2 whitespace-nowrap" }, cell: ({ getValue }) => ago(getValue()) },
];

export const householdFilters = (regions) => [
  {
    id: "tier",
    label: "Plan",
    options: [
      { value: "premium", label: "Premium" },
      { value: "free", label: "Free" },
    ],
    test: (h, v) => h.tier === v,
  },
  { id: "type", label: "Type", options: Object.entries(HOUSEHOLD_TYPES).map(([value, label]) => ({ value, label })), test: (h, v) => h.type === v },
  { id: "region", label: "Region", options: regions.map((r) => ({ value: r, label: r })), test: (h, v) => h.region === v },
];

export const householdExport = (h) => ({
  id: h.id,
  owner: h.owner.name,
  phone: h.owner.phone,
  email: h.owner.email,
  type: h.type,
  size: h.size,
  region: h.region,
  currency: h.currency,
  plan: h.tier,
  sharing: h.members,
  zones: h.zones,
  mealsPlannedThisWeek: h.mealsPlannedThisWeek,
  joined: h.createdAt,
  lastActive: h.lastActiveAt,
});
