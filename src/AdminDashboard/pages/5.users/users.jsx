/* Users */
import { Clock, UserPlus, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Button from "@/components/ui/Button";
import { useHouseholds, usePayments, useSetUserStatus, useUsers } from "@/store/queries/admin";

import DataTable from "../../components/DataTable";
import DetailList from "../../components/DetailList";
import Drawer from "../../components/Drawer";
import { useNotify } from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import StatCard from "../../components/StatCard";
import StatusChip from "../../components/StatusChip";
import { PROVIDERS, SIGN_IN } from "../../lib/constants";
import { ago, date, money } from "../../lib/format";
import { PAYMENT_STATUS } from "../8.transactions/sections/paymentColumns";
import { planOf, STATUS, userColumns, userExport, userFilters } from "./sections/userColumns";

/**
 * Every account, one per person: household owners, the people they share
 * with, and those who signed up but never set up a home. The plan belongs to
 * the household, so an account shows the plan of the home it is in.
 */
export default function Users() {
  const { data: users = [], isLoading } = useUsers();
  const { data: householdList = [] } = useHouseholds();
  const { data: payments = [] } = usePayments();
  const setStatus = useSetUserStatus();
  const notify = useNotify();
  const [openId, setOpenId] = useState(null);

  const households = useMemo(() => Object.fromEntries(householdList.map((h) => [h.id, h])), [householdList]);
  const columns = useMemo(() => userColumns(households), [households]);
  const filters = useMemo(() => userFilters(households), [households]);
  const open = users.find((u) => u.id === openId);
  const home = open && households[open.householdId];
  const theirPayments = open ? payments.filter((p) => p.householdId === open.householdId && open.householdRole === "owner") : [];

  const [weekAgo] = useState(() => Date.now() - 7 * 864e5);
  const subscribed = users.filter((u) => planOf(u, households) === "premium").length;

  function toggleStatus() {
    const disabling = open.status !== "disabled";
    const reason = window.prompt(disabling ? `Why is ${open.name}'s account being turned off? This goes in the Activity log.` : `Why turn ${open.name}'s account back on?`);
    if (!reason?.trim()) return;
    setStatus.mutate(
      { id: open.id, status: disabling ? "disabled" : "active", reason: reason.trim() },
      { onSuccess: () => notify(disabling ? `${open.name} can no longer sign in.` : `${open.name} can sign in again.`) },
    );
  }

  return (
    <>
      <PageHeader title="Users" body="Everyone with a DomEase account. Their plan comes from the household they are in." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Accounts" value={users.length} note={`${users.filter((u) => Date.parse(u.createdAt) > weekAgo).length} joined this week`} icon={UsersRound} />
        <StatCard label="On Premium" value={subscribed} note="Through their household" tone="warn" icon={UserPlus} />
        <StatCard label="No household yet" value={users.filter((u) => !u.householdId).length} note="Signed up, never set up a home" icon={Clock} tone="sage" />
      </div>

      <DataTable
        rows={users}
        loading={isLoading}
        columns={columns}
        filters={filters}
        search={(u) => `${u.name} ${u.email ?? ""} ${u.phone ?? ""} ${households[u.householdId]?.owner.name ?? ""}`}
        searchLabel="Search name, email or phone"
        onRowClick={(u) => setOpenId(u.id)}
        exportName="domease-users"
        exportRow={userExport(households)}
        initialSort={{ id: "createdAt", desc: true }}
      />

      <Drawer
        open={!!open}
        title={open?.name ?? ""}
        onClose={() => setOpenId(null)}
        footer={
          open && (
            <>
              <Button variant="ghost" disabled title="Sends a reset link once the API is connected">
                Send password reset
              </Button>
              <Button variant={open.status === "disabled" ? "primary" : "ghost"} onClick={toggleStatus} disabled={setStatus.isPending}>
                {open.status === "disabled" ? "Turn account back on" : "Turn account off"}
              </Button>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-8">
            <DetailList
              items={[
                ["Status", <StatusChip key="s" tone={STATUS[open.status][0]}>{STATUS[open.status][1]}</StatusChip>],
                ["Email", open.email],
                ["Phone", open.phone],
                ["Signs in with", SIGN_IN[open.signInMethod]],
                ["Joined", date(open.createdAt)],
                ["Last active", ago(open.lastActiveAt)],
              ]}
            />

            <section>
              <h3 className="mb-2 text-sm font-semibold">Household</h3>
              {home ? (
                <Link to={`/admin/households?open=${home.id}`} className="block rounded-r-md border border-line p-4 hover:border-clay-700">
                  <p className="font-medium">{home.owner.name}'s home</p>
                  <p className="text-sm text-ink-2">
                    {open.householdRole === "owner" ? "Owner" : "Member"} · {home.size} people · {home.region} ·{" "}
                    {home.tier === "premium" ? "Premium" : "Free"}
                  </p>
                </Link>
              ) : (
                <p className="text-ink-2">Has not set up or joined a home yet.</p>
              )}
            </section>

            {open.householdRole === "owner" && (
              <section>
                <h3 className="mb-2 text-sm font-semibold">Payments</h3>
                {theirPayments.length ? (
                  <ul className="divide-y divide-line rounded-r-md border border-line">
                    {theirPayments.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium">{money(p.amount, p.currency)}</p>
                          <p className="text-ink-2">
                            {date(p.createdAt)} · {PROVIDERS[p.provider]}
                          </p>
                        </div>
                        <StatusChip tone={PAYMENT_STATUS[p.status][0]}>{PAYMENT_STATUS[p.status][1]}</StatusChip>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-ink-2">No payments.</p>
                )}
              </section>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
