/* Insights Rules */
// Premium's budget, eating trends and house help pay, as pure functions so the
// web app and the phone agree (the app's domain/use_cases/budget.dart and
// payroll.dart). Amounts are in the household's own currency throughout.

/** "2026-11" for a date, in local time. */
export const monthKey = (date = new Date()) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const monthLabel = (key, style = "short") => new Date(`${key}-01T12:00:00`).toLocaleDateString("en-GB", { month: style, ...(style === "long" ? { year: "numeric" } : {}) });
export const monthName = (key) => monthLabel(key, "long");

/** The last n month keys, oldest first, ending with this one. */
export function lastMonths(n, today = new Date()) {
  return Array.from({ length: n }, (_, i) => monthKey(new Date(today.getFullYear(), today.getMonth() - (n - 1 - i), 1)));
}

const sum = (rows, pick) => rows.reduce((n, r) => n + (Number(pick(r)) || 0), 0);

// ── Budget ────────────────────────────────────────────────────

/**
 * The month so far against the budget: what was spent, what is left, what is
 * left a day, how the market compared with the estimate, and six months of
 * spending for the chart.
 */
export function budgetSummary({ monthly, trips = [] }, today = new Date()) {
  const key = monthKey(today);
  const mine = trips.filter((t) => monthKey(t.date) === key);
  const spent = sum(mine, (t) => t.actual);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - today.getDate() + 1;
  const left = monthly ? monthly - spent : null;
  const priced = trips.filter((t) => t.estimate > 0);
  const estimated = sum(priced, (t) => t.estimate);
  return {
    spent,
    trips: mine.length,
    budget: monthly || null,
    left,
    perDay: left != null && left > 0 ? left / daysLeft : 0,
    percent: monthly ? Math.round((spent * 100) / monthly) : null,
    // Positive: the market cost more than the list said.
    vsEstimate: estimated ? Math.round(((sum(priced, (t) => t.actual) - estimated) * 100) / estimated) : null,
    byMonth: lastMonths(6, today).map((k) => ({ key: k, label: monthLabel(k), value: sum(trips.filter((t) => monthKey(t.date) === k), (t) => t.actual) })),
  };
}

// ── Eating trends ─────────────────────────────────────────────

const MAIN = ["lunch", "dinner"];

/**
 * What the home eats, from the saved weeks (oldest first) and this week:
 * the dishes that come up most, how varied this week is, the share that is
 * vegetable forward, the cuisine mix, and dishes on repeat lately.
 */
export function eatingTrends({ history = [], current, byId }) {
  const weeks = [...history.map((h) => h.days), ...(current ? [current] : [])].slice(-8);
  const ids = (days) => Object.values(days ?? {}).flat().filter((id) => byId[id]);
  const all = weeks.flatMap(ids);
  const count = (list) => list.reduce((m, id) => m.set(id, (m.get(id) ?? 0) + 1), new Map());

  // Lunches and dinners for the top list and repeats: breakfasts and snacks come from short lists and repeat by design.
  const main = (id) => MAIN.includes(byId[id].mealType);
  const top = [...count(all.filter(main))].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n]) => ({ recipe: byId[id], times: n }));
  const thisWeek = current ? ids(current) : [];
  const cuisines = [...all.reduce((m, id) => m.set(byId[id].cuisine, (m.get(byId[id].cuisine) ?? 0) + 1), new Map())]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, n]) => ({ name, percent: Math.round((n * 100) / all.length) }));
  const recent = weeks.slice(-4).map((w) => new Set(ids(w).filter(main)));
  const onRepeat =
    recent.length >= 3
      ? [...new Set(recent.flatMap((s) => [...s]))]
          .filter((id) => recent.filter((s) => s.has(id)).length >= 3)
          .slice(0, 6)
          .map((id) => byId[id])
      : [];

  return {
    weeks: weeks.length,
    meals: all.length,
    variety: thisWeek.length ? Math.round((new Set(thisWeek).size * 100) / thisWeek.length) : 0,
    different: new Set(thisWeek).size,
    vegForward: all.length ? Math.round((all.filter((id) => byId[id].vegForward).length * 100) / all.length) : 0,
    top,
    cuisines,
    onRepeat,
  };
}

// ── House help pay ────────────────────────────────────────────

export const PAY_KINDS = {
  pay: { label: "Salary paid", sign: -1 },
  advance: { label: "Advance", sign: -1 },
  deduction: { label: "Deduction", sign: -1 },
  bonus: { label: "Bonus", sign: 1 },
  leave: { label: "Days off", sign: 0 },
};

/**
 * A month for one person: salary, plus bonuses, less advances, deductions and
 * what was already paid, gives what is still owed (below zero: paid ahead).
 */
export function payMonth(staff, key = monthKey()) {
  const rows = (staff.entries ?? []).filter((e) => monthKey(e.date) === key);
  const of = (kind) => sum(rows.filter((e) => e.kind === kind), (e) => e.amount);
  const salary = Number(staff.salary) || 0;
  const bonus = of("bonus");
  const advances = of("advance");
  const deductions = of("deduction");
  const paid = of("pay");
  return {
    key,
    salary,
    bonus,
    advances,
    deductions,
    paid,
    owed: salary + bonus - advances - deductions - paid,
    daysOff: sum(rows.filter((e) => e.kind === "leave"), (e) => e.days),
    rows: [...rows].sort((a, b) => b.date.localeCompare(a.date)),
  };
}

/** The next payday on or after today; a payday of 31 in a 30 day month falls on the 30th. */
export function nextPayday(staff, today = new Date()) {
  const on = (y, m) => new Date(y, m, Math.min(staff.payday || 28, new Date(y, m + 1, 0).getDate()));
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const here = on(today.getFullYear(), today.getMonth());
  return here >= start ? here : on(today.getFullYear(), today.getMonth() + 1);
}

export const daysUntil = (date, today = new Date()) => Math.round((new Date(date).setHours(0, 0, 0, 0) - new Date(today).setHours(0, 0, 0, 0)) / 864e5);

/** Days off this year, for the record both sides keep. */
export const daysOffThisYear = (staff, today = new Date()) => sum((staff.entries ?? []).filter((e) => e.kind === "leave" && new Date(e.date).getFullYear() === today.getFullYear()), (e) => e.days);

/** A plain text payslip for WhatsApp or print. `money` formats an amount. */
export function payslipText({ staff, month, home, money }) {
  const line = (label, amount, minus = false) => `${label}: ${minus ? "minus " : ""}${money(amount)}`;
  return [
    `Payslip, ${monthName(month.key)}`,
    `${staff.name}${staff.role ? `, ${staff.role}` : ""}`,
    home,
    "",
    line("Salary", month.salary),
    month.bonus ? line("Bonus", month.bonus) : null,
    month.advances ? line("Advances", month.advances, true) : null,
    month.deductions ? line("Deductions", month.deductions, true) : null,
    line("Paid", month.paid),
    month.owed >= 0 ? line("Still to pay", month.owed) : line("Paid ahead", -month.owed),
    month.daysOff ? `Days off: ${month.daysOff}` : null,
    "",
    "Kept with DomEase",
  ]
    .filter((x) => x != null)
    .join("\n");
}
