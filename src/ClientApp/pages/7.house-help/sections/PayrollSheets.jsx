/* Payroll Sheets */
import { Copy, MessageCircle } from "lucide-react";
import { useState } from "react";

import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";

import Sheet, { TextField } from "../../../components/Sheet";
import { PAY_KINDS, monthKey, monthName, payMonth, payslipText } from "../../../lib/insights";

const ROLES = ["House help", "Nanny", "Cook", "Driver", "Gardener", "Askari"];
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
// Noon local time, so the day never shifts across time zones.
const atNoon = (day) => new Date(`${day}T12:00:00`).toISOString();
const digits = (v) => v.replace(/[^\d]/g, "");

function Chips({ label, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map(([id, text]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={value === id}
            onClick={() => onChange(id)}
            className={cn("rounded-r-pill border px-3.5 py-1.5 text-sm", value === id ? "border-clay-700 bg-clay-100 text-clay-800" : "border-line text-ink-2 hover:border-line-2")}
          >
            {text}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Add someone, or change their salary and payday. */
export function StaffForm({ person, suggestions, currency, onClose, onSave, onRemove }) {
  const [name, setName] = useState(person?.name ?? suggestions[0] ?? "");
  const [role, setRole] = useState(person?.role ?? ROLES[0]);
  const [salary, setSalary] = useState(person?.salary ? String(person.salary) : "");
  const [payday, setPayday] = useState(String(person?.payday ?? 28));
  const day = Number(payday);
  const ok = name.trim() && Number(salary) > 0 && day >= 1 && day <= 31;

  return (
    <Sheet
      open
      onClose={onClose}
      title={person ? `Edit ${person.name}` : "Add someone who helps at home"}
      footer={
        <>
          {onRemove && (
            <Button variant="ghost" className="flex-1" onClick={() => (onRemove(), onClose())}>
              Remove
            </Button>
          )}
          <Button
            className="flex-1"
            disabled={!ok}
            onClick={() => {
              onSave({ id: person?.id ?? `staff_${Date.now()}`, startedOn: person?.startedOn ?? new Date().toISOString(), entries: person?.entries ?? [], name: name.trim(), role, salary: Number(salary), payday: day });
              onClose();
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} autoFocus={!person} />
        <Chips label="Role" options={ROLES.map((r) => [r, r])} value={role} onChange={setRole} />
        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <TextField label={`Monthly salary (${currency})`} inputMode="numeric" value={salary} onChange={(e) => setSalary(digits(e.target.value))} />
          <TextField label="Payday" inputMode="numeric" value={payday} onChange={(e) => setPayday(digits(e.target.value).slice(0, 2))} hint="Day of the month" />
        </div>
      </div>
    </Sheet>
  );
}

/** Record a payment, advance, deduction, bonus or days off. */
export function EntryForm({ person, currency, onClose, onSave }) {
  const [kind, setKind] = useState("pay");
  const [amount, setAmount] = useState(kind === "pay" ? String(Math.max(0, payMonth(person).owed)) : "");
  const [days, setDays] = useState("1");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const leave = kind === "leave";
  const ok = date && (leave ? Number(days) > 0 : Number(amount) > 0);

  const choose = (k) => {
    setKind(k);
    setAmount(k === "pay" ? String(Math.max(0, payMonth(person).owed)) : "");
  };

  return (
    <Sheet
      open
      onClose={onClose}
      title={`Record for ${person.name}`}
      footer={
        <Button
          className="w-full"
          disabled={!ok}
          onClick={() => {
            onSave({ id: `pay_${Date.now()}`, date: atNoon(date), kind, ...(leave ? { days: Number(days) } : { amount: Number(amount) }), note: note.trim() });
            onClose();
          }}
        >
          Save
        </Button>
      }
    >
      <div className="space-y-5">
        <Chips label="What" options={Object.entries(PAY_KINDS).map(([id, k]) => [id, k.label])} value={kind} onChange={choose} />
        <div className="grid grid-cols-2 gap-3">
          {leave ? (
            <TextField label="Days" inputMode="numeric" value={days} onChange={(e) => setDays(digits(e.target.value).slice(0, 2))} />
          ) : (
            <TextField label={`Amount (${currency})`} inputMode="numeric" value={amount} onChange={(e) => setAmount(digits(e.target.value))} />
          )}
          <TextField label="Date" type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} />
        </div>
        <TextField label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder={leave ? "Visiting family" : kind === "advance" ? "School fees" : ""} />
        {kind === "advance" && <p className="text-sm text-ink-2">An advance comes off this month's salary.</p>}
      </div>
    </Sheet>
  );
}

/** A month's payslip as plain text, to send on WhatsApp or copy. */
export function Payslip({ person, home, fmt, onClose }) {
  const months = [...new Set([monthKey(), ...(person.entries ?? []).map((e) => monthKey(e.date))])].sort().reverse().slice(0, 6);
  const [key, setKey] = useState(months[0]);
  const [copied, setCopied] = useState(false);
  const text = payslipText({ staff: person, month: payMonth(person, key), home, money: fmt });

  return (
    <Sheet
      open
      onClose={onClose}
      title={`Payslip for ${person.name}`}
      footer={
        <>
          <Button variant="ghost" className="flex-1" onClick={() => navigator.clipboard?.writeText(text).then(() => setCopied(true))}>
            <Copy className="size-4" /> {copied ? "Copied" : "Copy"}
          </Button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-r-pill bg-[#1f7a4d] px-6 text-[15px] font-semibold text-white hover:bg-[#186640]"
          >
            <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
          </a>
        </>
      }
    >
      <Chips label="Month" options={months.map((k) => [k, monthName(k)])} value={key} onChange={(k) => (setKey(k), setCopied(false))} />
      <pre className="mt-5 rounded-r-md bg-paper p-4 font-sans text-[15px] leading-relaxed whitespace-pre-wrap">{text}</pre>
    </Sheet>
  );
}
