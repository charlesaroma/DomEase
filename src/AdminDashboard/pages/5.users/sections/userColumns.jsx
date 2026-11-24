/* User Columns */
import StatusChip from "../../../components/StatusChip";
import { SIGN_IN } from "../../../lib/constants";
import { ago, date } from "../../../lib/format";

const DAY = 864e5;
export const STATUS = { active: ["good", "Active"], disabled: ["bad", "Disabled"], deleted: ["quiet", "Deleted"] };

/** Contact shown in lists: the email, or the phone with the middle hidden. */
export const contactOf = (u) => u.email ?? (u.phone ? `${u.phone.slice(0, 7)}•••${u.phone.slice(-3)}` : "No contact");

/** The account's plan comes from its household; no household means it never finished setting up. */
export const planOf = (u, households) => {
  if (!u.householdId) return "none";
  return households[u.householdId]?.tier ?? "free";
};

export const userColumns = (households) => [
  {
    id: "name",
    accessorKey: "name",
    header: "Account",
    meta: { card: "title" },
    cell: ({ row: { original: u } }) => (
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sage-100 font-display font-semibold text-sage-800">{u.name[0]}</span>
        <div className="min-w-0">
          <p className="truncate font-medium">{u.name}</p>
          <p className="truncate text-sm text-ink-2">{contactOf(u)}</p>
        </div>
      </div>
    ),
  },
  { id: "signIn", accessorKey: "signInMethod", header: "Signs in with", cell: ({ getValue }) => SIGN_IN[getValue()] },
  {
    id: "household",
    accessorFn: (u) => households[u.householdId]?.owner.name ?? "",
    header: "Household",
    cell: ({ row: { original: u } }) =>
      u.householdId ? (
        <span>
          {households[u.householdId]?.owner.name ?? "Unknown"}
          <span className="text-ink-3">{u.householdRole === "owner" ? ", owner" : ", member"}</span>
        </span>
      ) : (
        <span className="text-ink-3">Not set up</span>
      ),
  },
  {
    id: "plan",
    accessorFn: (u) => planOf(u, households),
    header: "Plan",
    cell: ({ getValue }) =>
      getValue() === "premium" ? <StatusChip tone="premium">Premium</StatusChip> : getValue() === "free" ? <StatusChip>Free</StatusChip> : <span className="text-ink-3">None</span>,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => <StatusChip tone={STATUS[getValue()][0]}>{STATUS[getValue()][1]}</StatusChip>,
  },
  { id: "createdAt", accessorKey: "createdAt", header: "Joined", meta: { className: "text-ink-2 whitespace-nowrap" }, cell: ({ getValue }) => date(getValue()) },
  { id: "lastActiveAt", accessorKey: "lastActiveAt", header: "Last active", meta: { className: "text-ink-2 whitespace-nowrap" }, cell: ({ getValue }) => ago(getValue()) },
];

export const userFilters = (households) => [
  {
    id: "plan",
    label: "Plan",
    options: [
      { value: "premium", label: "Premium" },
      { value: "free", label: "Free" },
      { value: "none", label: "No household yet" },
    ],
    test: (u, v) => planOf(u, households) === v,
  },
  {
    id: "seen",
    label: "Activity",
    options: [
      { value: "week", label: "Active this week" },
      { value: "quiet", label: "Quiet 30 days or more" },
      { value: "new", label: "Joined this week" },
    ],
    test: (u, v) =>
      v === "week" ? Date.now() - Date.parse(u.lastActiveAt) < 7 * DAY : v === "quiet" ? Date.now() - Date.parse(u.lastActiveAt) >= 30 * DAY : Date.now() - Date.parse(u.createdAt) < 7 * DAY,
  },
  { id: "via", label: "Signs in with", options: Object.entries(SIGN_IN).map(([value, label]) => ({ value, label })), test: (u, v) => u.signInMethod === v },
  { id: "status", label: "Status", options: Object.entries(STATUS).map(([value, [, label]]) => ({ value, label })), test: (u, v) => u.status === v },
];

export const userExport = (households) => (u) => ({
  id: u.id,
  name: u.name,
  email: u.email ?? "",
  phone: u.phone ?? "",
  signsInWith: SIGN_IN[u.signInMethod],
  household: households[u.householdId]?.owner.name ?? "",
  role: u.householdRole ?? "",
  plan: planOf(u, households),
  status: u.status,
  joined: u.createdAt,
  lastActive: u.lastActiveAt,
});
