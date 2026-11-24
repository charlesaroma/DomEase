/* Overview */
import { ArrowRight, BookOpen, Crown, House, ImageOff, Inbox, LifeBuoy, MonitorPlay, UsersRound, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useHouseholds, useOverview, useSuggestions } from "@/store/queries/admin";

import BarChart from "../../components/BarChart";
import PageHeader from "../../components/PageHeader";
import Panel from "../../components/Panel";
import StatCard from "../../components/StatCard";
import StatusChip from "../../components/StatusChip";
import { HOUSEHOLD_TYPES, MEAL_TYPES } from "../../lib/constants";
import { ago, money } from "../../lib/format";

const mealLabel = (id) => MEAL_TYPES.find((m) => m.id === id)?.label ?? id;

export default function Overview() {
  const { user } = useAdminAuth();
  const { data: o } = useOverview();
  const { data: suggestions = [] } = useSuggestions();
  const { data: households = [] } = useHouseholds();
  const pending = suggestions.filter((s) => s.status === "pending").slice(0, 4);
  const recent = [...households].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 5);
  const price = o?.settings?.premium?.monthlyPrice;
  const yearly = o?.settings?.premium?.yearlyPrice;
  const revenue = price == null ? null : (o?.monthly ?? 0) * price + ((o?.yearly ?? 0) * (yearly ?? 0)) / 12;
  const premiumShare = o ? Math.round((o.premium / Math.max(o.households, 1)) * 100) : 0;
  const maxType = Math.max(1, ...(o?.byType ?? []).map((t) => t.count));
  const day = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  const signups = (o?.daily ?? []).map((d) => ({ key: d.date, label: day(d.date), value: d.signups }));
  const takings = (o?.daily ?? []).map((d) => ({ key: d.date, label: day(d.date), value: d.revenue }));
  const usd = (n) => `$${n.toFixed(2)}`;

  return (
    <>
      <PageHeader title={`Hello, ${user?.name?.split(" ")[0] ?? "there"}`} body="How DomEase is doing today, and what is waiting for you." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Households" value={o?.households ?? "…"} note={o ? `${o.newThisWeek} joined this week` : " "} icon={House} />
        <StatCard label="On Premium" value={o?.premium ?? "…"} note={`${premiumShare}% of households`} icon={Crown} />
        <StatCard label="Suggestions waiting" value={o?.pendingSuggestions ?? "…"} note="Recipes sent in by households" icon={Inbox} tone="sage" />
        <StatCard label="Recipes live" value={o?.recipes ?? "…"} note={o ? `${o.premiumRecipes} of them Premium` : " "} icon={BookOpen} tone="sage" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link to="/admin/users">
          <StatCard label="Accounts" value={o?.users ?? "…"} note={o ? `${o.newUsersThisWeek} new this week` : " "} icon={UsersRound} />
        </Link>
        <Link to="/admin/transactions">
          <StatCard
            label="Paid this month"
            value={o ? money(o.revenueThisMonth) : "…"}
            note={o?.failedPayments ? `${o.failedPayments} failed this week` : "No failed payments this week"}
            icon={Wallet}
            tone="good"
          />
        </Link>
        <Link to="/admin/ads?tab=performance">
          <StatCard
            label="Ads, last 30 days"
            value={o ? usd(o.adEarnings30) : "…"}
            note={o?.adSource === "demo" ? "Example figures until AdMob is connected" : "From AdMob"}
            icon={MonitorPlay}
            tone="sage"
          />
        </Link>
        <Link to={o?.missingPhotos ? "/admin/recipes?photo=missing" : "/admin/inbox"}>
          {o?.missingPhotos ? (
            <StatCard label="Recipes without a photo" value={o.missingPhotos} note="Add one: photos get dishes cooked" icon={ImageOff} tone="warn" />
          ) : (
            <StatCard label="Open in the inbox" value={o?.openReports ?? "…"} note="Problems and ideas from the app" icon={LifeBuoy} />
          )}
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="New accounts a day, last 30 days">
          <BarChart data={signups} format={(n) => Math.round(n).toLocaleString("en-GB")} title="New accounts a day, last 30 days" height={160} />
        </Panel>
        <Panel title="Money in a day, last 30 days (UGX)">
          <BarChart
            data={takings}
            format={(n) => (n >= 1000 ? `${Math.round(n / 1000)}k` : String(Math.round(n)))}
            title="Premium payments a day in shillings, last 30 days"
            height={160}
          />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Suggestions to review"
          action={
            <Link to="/admin/suggestions" className="inline-flex items-center gap-1 text-sm text-clay-700 hover:underline">
              Open inbox <ArrowRight className="size-4" />
            </Link>
          }
          padded={false}
        >
          {pending.length ? (
            <ul>
              {pending.map((s) => (
                <li key={s.id} className="flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{s.name}</p>
                    <p className="text-sm text-ink-2">
                      From {s.submittedBy}, {ago(s.createdAt)}
                    </p>
                  </div>
                  <StatusChip>{mealLabel(s.suggestedMealType)}</StatusChip>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-ink-2">The inbox is clear.</p>
          )}
        </Panel>

        <Panel title="Subscriptions">
          <dl className="space-y-3 text-[15px]">
            {[
              ["Active", o?.activeSubscriptions, "good"],
              ["Payment overdue", o?.pastDue, "bad"],
              ["Cancelled", o?.cancelled, "quiet"],
            ].map(([label, n, tone]) => (
              <div key={label} className="flex items-center justify-between">
                <dt>
                  <StatusChip tone={tone}>{label}</StatusChip>
                </dt>
                <dd className="font-mono">{n ?? 0}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 rounded-r-md bg-paper p-4">
            <p className="text-sm text-ink-2">Monthly revenue, estimated</p>
            {revenue == null ? (
              <p className="mt-1 text-[15px]">
                Set the Premium price in{" "}
                <Link to="/admin/settings" className="text-clay-700 underline">
                  Settings
                </Link>{" "}
                to see this.
              </p>
            ) : (
              <p className="mt-1 font-display text-2xl font-bold">{money(revenue)}</p>
            )}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Panel title="Who uses DomEase">
          <ul className="space-y-4">
            {(o?.byType ?? []).map((t) => (
              <li key={t.type}>
                <div className="mb-1.5 flex justify-between text-[15px]">
                  <span>{HOUSEHOLD_TYPES[t.type]}</span>
                  <span className="font-mono text-ink-2">{t.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-paper-2">
                  <div className="h-full rounded-full bg-clay-700" style={{ width: `${(t.count / maxType) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Newest households"
          action={
            <Link to="/admin/households" className="inline-flex items-center gap-1 text-sm text-clay-700 hover:underline">
              All households <ArrowRight className="size-4" />
            </Link>
          }
          padded={false}
        >
          <ul>
            {recent.map((h) => (
              <li key={h.id} className="flex items-center gap-4 border-b border-line px-5 py-3.5 last:border-0">
                <span className="grid size-9 place-items-center rounded-full bg-clay-100 font-display font-semibold text-clay-800">{h.owner.name[0]}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{h.owner.name}</p>
                  <p className="text-sm text-ink-2">
                    {HOUSEHOLD_TYPES[h.type]} of {h.size}, {h.region}
                  </p>
                </div>
                {h.tier === "premium" ? <StatusChip tone="premium">Premium</StatusChip> : <StatusChip>Free</StatusChip>}
                <span className="hidden w-24 text-right text-sm text-ink-2 sm:block">{ago(h.createdAt)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
