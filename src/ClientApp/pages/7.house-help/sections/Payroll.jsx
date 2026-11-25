/* Payroll */
import { CalendarDays, FileText, Pencil, Plus, Wallet } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { useSaveStaff, useStaff } from "@/store/queries/app";
import { cn } from "@/utils/cn";

import { useToast } from "../../../components/Toast";
import { money } from "../../../lib/choices";
import { PAY_KINDS, daysOffThisYear, daysUntil, monthKey, monthName, nextPayday, payMonth } from "../../../lib/insights";

import { EntryForm, Payslip, StaffForm } from "./PayrollSheets";

const shortDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/**
 * A fair record of pay for whoever helps at home: salary and payday, advances,
 * deductions, bonuses and days off, what is still owed this month, and a
 * payslip both sides can keep.
 */
export default function Payroll({ household }) {
  const { data: staff = [], isLoading } = useStaff();
  const save = useSaveStaff();
  const toast = useToast();
  const [sheet, setSheet] = useState(null); // { kind: "add" | "edit" | "entry" | "slip", person }
  const currency = household?.currency ?? "UGX";
  const fmt = (v) => money(v, currency);
  const close = () => setSheet(null);

  const upsert = (person) => save.mutate(staff.some((p) => p.id === person.id) ? staff.map((p) => (p.id === person.id ? person : p)) : [...staff, person]);
  const remove = (person) => {
    const before = staff;
    save.mutate(staff.filter((p) => p.id !== person.id));
    toast(`${person.name} removed.`, { undo: () => save.mutate(before) });
  };
  const addEntry = (person, entry) => {
    upsert({ ...person, entries: [...(person.entries ?? []), entry] });
    toast(`${PAY_KINDS[entry.kind].label} saved for ${person.name}.`);
  };
  const removeEntry = (person, entry) => {
    const before = staff;
    upsert({ ...person, entries: person.entries.filter((e) => e.id !== entry.id) });
    toast("Entry removed.", { undo: () => save.mutate(before) });
  };

  if (isLoading) return <p className="text-ink-2">Loading</p>;

  const helpers = (household?.members ?? []).filter((m) => m.role === "house_help" && !staff.some((p) => p.name === m.name)).map((m) => m.name);

  return (
    <div className="space-y-6">
      {staff.length === 0 && (
        <section className="rounded-r-stage bg-white p-8 text-center shadow-sh-1">
          <Wallet className="mx-auto size-10 text-clay-700" aria-hidden="true" />
          <h2 className="mt-3 font-display text-xl font-semibold">Keep a fair record of pay</h2>
          <p className="mx-auto mt-1 max-w-sm text-ink-2">Salary, advances and days off in one place, with a payslip to send on WhatsApp. No more guessing what was paid.</p>
        </section>
      )}

      {staff.map((p) => (
        <Person
          key={p.id}
          person={p}
          fmt={fmt}
          onRecord={() => setSheet({ kind: "entry", person: p })}
          onSlip={() => setSheet({ kind: "slip", person: p })}
          onEdit={() => setSheet({ kind: "edit", person: p })}
          onRemoveEntry={(e) => removeEntry(p, e)}
        />
      ))}

      <Button variant={staff.length ? "ghost" : "primary"} onClick={() => setSheet({ kind: "add" })}>
        <Plus className="size-4" /> Add someone
      </Button>

      {(sheet?.kind === "add" || sheet?.kind === "edit") && (
        <StaffForm person={sheet.person} suggestions={helpers} currency={currency} onClose={close} onSave={upsert} onRemove={sheet.person ? () => remove(sheet.person) : null} />
      )}
      {sheet?.kind === "entry" && <EntryForm person={sheet.person} currency={currency} onClose={close} onSave={(e) => addEntry(sheet.person, e)} />}
      {sheet?.kind === "slip" && <Payslip person={sheet.person} home={household?.name ?? ""} fmt={fmt} onClose={close} />}
    </div>
  );
}

function Person({ person: p, fmt, onRecord, onSlip, onEdit, onRemoveEntry }) {
  const month = payMonth(p);
  const payday = nextPayday(p);
  const inDays = daysUntil(payday);
  const earlier = [...new Set((p.entries ?? []).map((e) => monthKey(e.date)))].filter((k) => k < month.key).sort().reverse().slice(0, 3);

  return (
    <section className="overflow-hidden rounded-r-stage bg-white shadow-sh-1">
      <header className="flex items-start justify-between gap-3 p-5 sm:p-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-sage-100 font-display text-xl font-bold text-sage-800">{p.name[0]}</span>
          <div className="min-w-0">
            <h2 className="truncate font-display text-xl font-semibold">{p.name}</h2>
            <p className="text-sm text-ink-2">
              {p.role} · {fmt(p.salary)} a month
            </p>
          </div>
        </div>
        <button type="button" onClick={onEdit} className="grid size-9 shrink-0 place-items-center rounded-r-pill text-ink-2 hover:bg-paper" aria-label={`Edit ${p.name}`}>
          <Pencil className="size-4" />
        </button>
      </header>

      <div className="grid gap-px bg-line sm:grid-cols-2">
        <div className="bg-white p-5 sm:px-6">
          <p className="text-sm text-ink-2">{month.owed >= 0 ? `Still to pay for ${monthName(month.key)}` : "Paid ahead this month"}</p>
          <p className={cn("mt-1 font-display text-3xl font-bold tabular-nums", month.owed <= 0 && "text-sage-800")}>{fmt(Math.abs(month.owed))}</p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-2">
            <CalendarDays className="size-4" aria-hidden="true" />
            Payday {inDays === 0 ? "is today" : inDays === 1 ? "is tomorrow" : `${shortDate(payday)}, in ${inDays} days`}
          </p>
        </div>
        <dl className="space-y-1.5 bg-white p-5 text-sm sm:px-6">
          <Row label="Salary" value={fmt(month.salary)} />
          {month.bonus > 0 && <Row label="Bonus" value={`+ ${fmt(month.bonus)}`} />}
          {month.advances > 0 && <Row label="Advances" value={`- ${fmt(month.advances)}`} />}
          {month.deductions > 0 && <Row label="Deductions" value={`- ${fmt(month.deductions)}`} />}
          <Row label="Paid" value={month.paid ? `- ${fmt(month.paid)}` : "Nothing yet"} />
          <Row label="Days off this year" value={daysOffThisYear(p)} />
        </dl>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line p-4 sm:px-6">
        <Button onClick={onRecord}>
          <Plus className="size-4" /> Record
        </Button>
        <Button variant="ghost" onClick={onSlip}>
          <FileText className="size-4" /> Payslip
        </Button>
      </div>

      <div className="border-t border-line p-5 sm:px-6">
        <h3 className="text-xs font-semibold tracking-[0.16em] text-ink-2 uppercase">{monthName(month.key)}</h3>
        <Entries rows={month.rows} fmt={fmt} onRemove={onRemoveEntry} empty="Nothing recorded yet this month." />
        {earlier.map((k) => (
          <details key={k} className="mt-4">
            <summary className="cursor-pointer text-xs font-semibold tracking-[0.16em] text-ink-2 uppercase">{monthName(k)}</summary>
            <Entries rows={payMonth(p, k).rows} fmt={fmt} onRemove={onRemoveEntry} />
          </details>
        ))}
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-2">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

function Entries({ rows, fmt, onRemove, empty }) {
  if (!rows.length) return empty ? <p className="mt-2 text-sm text-ink-3">{empty}</p> : null;
  return (
    <ul className="mt-2 divide-y divide-line">
      {rows.map((e) => (
        <li key={e.id} className="flex items-center gap-3 py-2 text-sm">
          <span className="w-14 shrink-0 text-ink-3">{shortDate(e.date)}</span>
          <span className="min-w-0 flex-1">
            {PAY_KINDS[e.kind].label}
            {e.note && <span className="block truncate text-xs text-ink-3">{e.note}</span>}
          </span>
          <span className="tabular-nums">{e.kind === "leave" ? `${e.days} ${e.days === 1 ? "day" : "days"}` : fmt(e.amount)}</span>
          <button type="button" onClick={() => onRemove(e)} className="rounded-r-pill px-2 py-1 text-xs text-ink-3 hover:bg-paper hover:text-danger" aria-label={`Remove ${PAY_KINDS[e.kind].label} on ${shortDate(e.date)}`}>
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
