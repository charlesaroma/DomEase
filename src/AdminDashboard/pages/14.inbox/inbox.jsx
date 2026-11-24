/* Support Inbox */
import { Bug, Lightbulb, Mail } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useSupportReports, useUpdateReport } from "@/store/queries/admin";

import DataTable from "../../components/DataTable";
import DetailList from "../../components/DetailList";
import Drawer from "../../components/Drawer";
import { useNotify } from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import StatusChip from "../../components/StatusChip";
import { ago, dateTime } from "../../lib/format";

const STATUS = { open: ["warn", "Open"], answered: ["good", "Answered"], closed: ["quiet", "Closed"] };
const TOPIC = { problem: ["Problem", Bug], idea: ["Idea", Lightbulb] };

const columns = [
  {
    id: "message",
    accessorKey: "message",
    header: "Message",
    meta: { card: "title" },
    cell: ({ row: { original: r } }) => {
      const [label, Icon] = TOPIC[r.topic];
      return (
        <div className="flex max-w-xl gap-3">
          <Icon className="mt-0.5 size-4 shrink-0 text-ink-3" aria-label={label} />
          <p className="line-clamp-2">{r.message}</p>
        </div>
      );
    },
  },
  { id: "userName", accessorKey: "userName", header: "From" },
  { id: "app", accessorFn: (r) => `${r.platform} ${r.appVersion}`, header: "App", meta: { className: "text-ink-2 whitespace-nowrap" }, cell: ({ row: { original: r } }) => `${r.platform === "ios" ? "iOS" : "Android"} ${r.appVersion}` },
  { id: "status", accessorKey: "status", header: "Status", cell: ({ getValue }) => <StatusChip tone={STATUS[getValue()][0]}>{STATUS[getValue()][1]}</StatusChip> },
  { id: "createdAt", accessorKey: "createdAt", header: "Sent", meta: { className: "text-ink-2 whitespace-nowrap" }, cell: ({ getValue }) => ago(getValue()) },
];

/**
 * What households send from You → Help: "Report a problem" and "Share an
 * idea" (POST /support/reports). Reply by email, then mark it answered.
 */
export default function Inbox() {
  const { data: reports = [], isLoading } = useSupportReports();
  const update = useUpdateReport();
  const notify = useNotify();
  const [openId, setOpenId] = useState(null);
  const open = reports.find((r) => r.id === openId);
  const mark = (status) => update.mutate({ id: open.id, status }, { onSuccess: () => notify(`Marked ${STATUS[status][1].toLowerCase()}.`) });

  return (
    <>
      <PageHeader title="Inbox" body="Problems and ideas sent from the app. The newest open ones first." />
      <DataTable
        rows={reports}
        loading={isLoading}
        columns={columns}
        filters={[
          { id: "status", label: "Status", options: Object.entries(STATUS).map(([value, [, label]]) => ({ value, label })), test: (r, v) => r.status === v },
          { id: "topic", label: "Kind", options: Object.entries(TOPIC).map(([value, [label]]) => ({ value, label })), test: (r, v) => r.topic === v },
        ]}
        search={(r) => `${r.message} ${r.userName} ${r.email ?? ""}`}
        onRowClick={(r) => setOpenId(r.id)}
        initialSort={{ id: "createdAt", desc: true }}
        empty="Nothing has been sent yet."
      />

      <Drawer
        open={!!open}
        title={open ? `${TOPIC[open.topic][0]} from ${open.userName}` : ""}
        onClose={() => setOpenId(null)}
        footer={
          open && (
            <>
              {open.status !== "closed" && (
                <Button variant="ghost" onClick={() => mark("closed")}>
                  Close
                </Button>
              )}
              {open.status === "open" && <Button onClick={() => mark("answered")}>Mark answered</Button>}
              {open.status !== "open" && (
                <Button variant="ghost" onClick={() => mark("open")}>
                  Reopen
                </Button>
              )}
            </>
          )
        }
      >
        {open && (
          <div className="space-y-6">
            <blockquote className="rounded-r-card bg-paper p-5 text-[17px] leading-relaxed">{open.message}</blockquote>
            <DetailList
              items={[
                ["Status", <StatusChip key="s" tone={STATUS[open.status][0]}>{STATUS[open.status][1]}</StatusChip>],
                ["From", open.userName],
                ["Email", open.email],
                ["App", `${open.platform === "ios" ? "iOS" : "Android"}, version ${open.appVersion}`],
                ["Sent", dateTime(open.createdAt)],
              ]}
            />
            {open.email && (
              <a
                href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: your DomEase ${open.topic === "idea" ? "idea" : "report"}`)}&body=${encodeURIComponent(`Hello ${open.userName.split(" ")[0]},\n\nThank you for writing to us.\n\n> ${open.message}\n\n`)}`}
                className="inline-flex items-center gap-2 rounded-r-pill bg-clay-700 px-5 py-2.5 font-display font-semibold text-white hover:bg-clay-800"
              >
                <Mail className="size-4" /> Reply by email
              </a>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
