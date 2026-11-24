/* You */
import { ChevronRight, Crown, FileText, HandHeart, House, LifeBuoy, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "@/components/ui/Button";
import { useMember } from "@/store/context/MemberAuthContext";
import { useHousehold } from "@/store/queries/app";

import Screen from "../../components/Screen";
import Sheet, { TextField } from "../../components/Sheet";
import { useToast } from "../../components/Toast";

// The account, the home, and everything else: as You on the phone.
export default function You() {
  const { user, signOut, updateMe, deleteMe } = useMember();
  const { data: household } = useHousehold();
  const navigate = useNavigate();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const premium = household?.tier === "premium";

  const groups = [
    [
      ["Home", "/app/you/household", House, household?.name],
      ["Premium", "/app/premium", Crown, premium ? "Active" : "See what it adds"],
      ["House Help", "/app/house-help", HandHeart],
    ],
    [
      ["Settings", "/app/you/settings", Settings, "Currency, reminders"],
      ["Help", "/app/you/help", LifeBuoy, "Questions, report a problem"],
    ],
    [
      ["Terms of Use", "/terms", FileText],
      ["Privacy notice", "/privacy", FileText],
      ["Health notice", "/health-notice", FileText],
    ],
  ];

  return (
    <Screen title="You">
      <section className="flex items-center gap-4 rounded-r-stage bg-white p-5 shadow-sh-1">
        <span className="grid size-14 place-items-center rounded-full bg-sage-100 font-display text-2xl font-bold text-sage-800">{user?.name?.[0]}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl font-semibold">{user?.name}</p>
          <p className="truncate text-ink-2">{user?.email ?? user?.phone}</p>
        </div>
        <Button variant="ghost" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </section>

      {groups.map((g, i) => (
        <ul key={i} className="mt-5 divide-y divide-line rounded-r-card bg-white shadow-sh-1">
          {g.map(([label, to, Icon, note]) => (
            <li key={to}>
              <Link to={to} className="flex items-center gap-4 px-5 py-4 hover:bg-paper">
                <Icon className="size-5 text-clay-700" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {note && <span className="text-sm text-ink-2">{note}</span>}
                <ChevronRight className="size-4 text-ink-3" />
              </Link>
            </li>
          ))}
        </ul>
      ))}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => (signOut(), navigate("/app/sign-in"))}>
          <LogOut className="size-4" /> Sign out
        </Button>
        <button type="button" onClick={() => setDeleting(true)} className="text-sm text-danger hover:underline">
          Delete my account
        </button>
      </div>

      {editing && <EditProfile user={user} onClose={() => setEditing(false)} onSave={async (p) => (await updateMe(p), toast("Saved."), setEditing(false))} />}

      <DeleteAccount
        open={deleting}
        owner={household?.members?.find((m) => m.role === "owner")?.name === user?.name}
        onClose={() => setDeleting(false)}
        onDelete={async () => (await deleteMe(), navigate("/app/sign-in", { replace: true }))}
      />
    </Screen>
  );
}

function EditProfile({ user, onClose, onSave }) {
  const [f, setF] = useState({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" });
  return (
    <Sheet
      open
      onClose={onClose}
      title="Your details"
      footer={
        <Button className="w-full" disabled={!f.name.trim()} onClick={() => onSave({ ...f, name: f.name.trim() })}>
          Save
        </Button>
      }
    >
      <div className="space-y-4">
        <TextField label="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <TextField label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <TextField label="Phone" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      </div>
    </Sheet>
  );
}

function DeleteAccount({ open, owner, onClose, onDelete }) {
  const [sure, setSure] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Delete your account"
      footer={
        <Button
          className="w-full bg-danger hover:bg-danger/90"
          disabled={!sure || busy}
          onClick={async () => {
            setBusy(true);
            await onDelete();
          }}
        >
          Delete for good
        </Button>
      }
    >
      <p className="text-ink-2">
        {owner
          ? "Your account and the home you set up are deleted for good: its meal plans, zones and shopping list. Everyone who shares it loses it too."
          : "Your account is deleted for good. The home you share stays, for everyone else."}
      </p>
      <label className="mt-4 flex items-center gap-3">
        <input type="checkbox" checked={sure} onChange={(e) => setSure(e.target.checked)} className="size-5 accent-clay-700" />
        I understand this can't be undone
      </label>
    </Sheet>
  );
}
