/* Team */
import { Plus } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useRemoveMember, useSaveMember, useTeam } from "@/store/queries/admin";

import DataTable from "../../components/DataTable";
import Drawer from "../../components/Drawer";
import { Field, Input, Select } from "../../components/Field";
import { useNotify } from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import StatusChip from "../../components/StatusChip";
import { ROLES } from "../../lib/constants";
import { ago } from "../../lib/format";

const ROLE_HELP = {
  owner: "Everything, including the team and settings.",
  admin: "Everything except removing the owner.",
  moderator: "Recipes, suggestions, House Help, app content, market prices and the support inbox.",
};

// DomEase staff who can sign in here, separate from households (PRD 7.2).
export default function Team() {
  const { user } = useAdminAuth();
  const { data: team = [], isLoading } = useTeam();
  const save = useSaveMember();
  const remove = useRemoveMember();
  const notify = useNotify();
  const [form, setForm] = useState(null);

  const columns = [
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      meta: { card: "title" },
      cell: ({ row: { original: m } }) => (
        <div>
          <p className="font-medium">{m.name}</p>
          <p className="text-sm text-ink-2">{m.email}</p>
        </div>
      ),
    },
    { id: "role", accessorKey: "role", header: "Role", cell: ({ getValue }) => <StatusChip tone={getValue() === "owner" ? "warn" : "quiet"}>{ROLES[getValue()]}</StatusChip> },
    { id: "lastActiveAt", accessorKey: "lastActiveAt", header: "Last active", meta: { className: "text-ink-2" }, cell: ({ getValue }) => ago(getValue()) },
  ];
  const rowActions = (m) => [
    { label: "Edit", onClick: () => setForm(m), hidden: m.role === "owner" },
    {
      label: "Remove from the team",
      danger: true,
      hidden: m.role === "owner" || m.id === user?.id,
      onClick: () => window.confirm(`Remove ${m.name} from the team?`) && remove.mutate(m.id, { onSuccess: () => notify(`${m.name} removed.`) }),
    },
  ];

  return (
    <>
      <PageHeader
        title="Team"
        body="Who can sign in to this admin, and what they may do."
        actions={
          <Button onClick={() => setForm({ name: "", email: "", role: "moderator" })}>
            <Plus className="size-4" /> Add someone
          </Button>
        }
      />
      <DataTable rows={team} loading={isLoading} columns={columns} rowActions={rowActions} onRowClick={(m) => m.role !== "owner" && setForm(m)} />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {Object.entries(ROLE_HELP).map(([r, t]) => (
          <div key={r} className="rounded-r-card border border-line bg-white p-4">
            <p className="font-medium">{ROLES[r]}</p>
            <p className="mt-1 text-sm text-ink-2">{t}</p>
          </div>
        ))}
      </div>

      <Drawer
        open={!!form}
        title={form?.id ? `Edit ${form.name}` : "Add someone to the team"}
        onClose={() => setForm(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setForm(null)}>
              Cancel
            </Button>
            <Button
              disabled={!form?.name?.trim() || !form?.email?.includes("@") || save.isPending}
              onClick={() =>
                save.mutate(form, {
                  onSuccess: () => {
                    notify(form.id ? "Saved." : `${form.name} can now sign in.`);
                    setForm(null);
                  },
                })
              }
            >
              Save
            </Button>
          </>
        }
      >
        {form && (
          <div className="space-y-5">
            <Field label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Role" hint={ROLE_HELP[form.role]}>
              <Select
                options={[
                  { id: "moderator", label: "Moderator" },
                  { id: "admin", label: "Admin" },
                ]}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </Field>
          </div>
        )}
      </Drawer>
    </>
  );
}
