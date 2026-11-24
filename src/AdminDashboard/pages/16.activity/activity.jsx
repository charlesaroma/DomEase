/* Activity Log */
import { useAuditLog } from "@/store/queries/admin";

import DataTable from "../../components/DataTable";
import PageHeader from "../../components/PageHeader";
import StatusChip from "../../components/StatusChip";
import { dateTime } from "../../lib/format";

// What each kind of entry means, in words.
const ACTIONS = {
  "household.premium": ["warn", "Plan changed by hand"],
  "payment.refund": ["bad", "Refund"],
  "recipe.publish": ["good", "Recipe published"],
  "settings.update": ["quiet", "Settings changed"],
  "team.add": ["quiet", "Team member added"],
  "user.disable": ["bad", "Account turned off"],
  "user.enable": ["good", "Account turned on"],
};
const actionOf = (a) => ACTIONS[a] ?? ["quiet", a];

const columns = [
  { id: "at", accessorKey: "at", header: "When", meta: { className: "whitespace-nowrap text-ink-2" }, cell: ({ getValue }) => dateTime(getValue()) },
  { id: "actorName", accessorKey: "actorName", header: "Who", meta: { card: "title", className: "font-medium" } },
  { id: "action", accessorKey: "action", header: "What", cell: ({ getValue }) => <StatusChip tone={actionOf(getValue())[0]}>{actionOf(getValue())[1]}</StatusChip> },
  { id: "target", accessorKey: "target", header: "On" },
  { id: "detail", accessorKey: "detail", header: "Why", meta: { className: "text-ink-2" } },
];

/**
 * A record that cannot be edited of the changes that matter: plans changed by
 * hand, refunds, accounts turned off, publishing and settings. The API writes
 * each entry from the signed-in team member; nobody can remove one.
 */
export default function Activity() {
  const { data: log = [], isLoading } = useAuditLog();
  return (
    <>
      <PageHeader title="Activity log" body="Who changed what, and why. Entries are written automatically and cannot be edited." />
      <DataTable
        rows={log}
        loading={isLoading}
        columns={columns}
        filters={[{ id: "action", label: "What", options: Object.entries(ACTIONS).map(([value, [, label]]) => ({ value, label })), test: (e, v) => e.action === v }]}
        search={(e) => `${e.actorName} ${e.target} ${e.detail}`}
        exportName="domease-activity"
        exportRow={(e) => ({ when: e.at, who: e.actorName, what: actionOf(e.action)[1], on: e.target, why: e.detail })}
        initialSort={{ id: "at", desc: true }}
      />
    </>
  );
}
