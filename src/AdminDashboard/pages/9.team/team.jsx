/* Team */
import { Plus, Trash2 } from "lucide-react";
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
  moderator: "Recipes, suggestions, House Help and app content.",
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
      label: "Name",
      render: (m) => (
        <div>
          <p className="font-medium">{m.name}</p>
          <p className="text-sm text-ink-2">{m.email}</p>
        </div>
      ),
    },
    { id: "role", label: "Role", render: (m) => <StatusChip tone={m.role === "owner" ? "warn" : "quiet"}>{ROLES[m.role]}</StatusChip> },
    { id: "seen", label: "Last active", className: "hidden md:table-cell text-ink-2", render: (m) => ago(m.lastActiveAt) },
    {
      id: "del",
      label: "",
      className: "w-12",
      render: (m) =>
        m.role !== "owner" &&
        m.id !== user?.id && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Remove ${m.name} from the team?`)) remove.mutate(m.id, { onSuccess: () => notify(`${m.name} removed.`) });
            }}
            className="grid size-9 place-items-center rounded-r-md text-ink-2 hover:bg-danger-100 hover:text-danger"
            aria-label={`Remove ${m.name}`}
          >
            <Trash2 className="size-4" />
          </button>
        ),
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
      <DataTable rows={team} loading={isLoading} columns={columns} onRowClick={(m) => m.role !== "owner" && setForm(m)} />
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
