/* Setup */
import { House, KeyRound } from "lucide-react";
import { Link, Navigate } from "react-router-dom";

import PageLoader from "@/components/ui/PageLoader";
import { useMember } from "@/store/context/MemberAuthContext";
import { useHousehold } from "@/store/queries/app";

// A new account chooses: set up a home, or join one someone shared.
export default function Setup() {
  const { user, signOut } = useMember();
  const { data: household, isLoading } = useHousehold();
  if (isLoading) return <PageLoader className="min-h-dvh" />;
  if (household) return <Navigate to="/app" replace />;

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-5 py-10">
      <p className="text-xs font-semibold tracking-[0.18em] text-clay-700 uppercase">Hello, {user?.name?.split(" ")[0]}</p>
      <h1 className="mt-2 font-display text-3xl font-bold">Let's get your home ready</h1>
      <div className="mt-8 space-y-3">
        {[
          ["/app/setup/new", House, "Set up a new home", "Answer a few questions. About a minute."],
          ["/app/setup/join", KeyRound, "Join a home", "Someone at home shared a code with you."],
        ].map(([to, Icon, title, body]) => (
          <Link key={to} to={to} className="flex items-center gap-4 rounded-r-card border border-line bg-white p-5 hover:border-clay-700">
            <span className="grid size-12 shrink-0 place-items-center rounded-r-md bg-clay-100 text-clay-700">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold">{title}</span>
              <span className="text-ink-2">{body}</span>
            </span>
          </Link>
        ))}
      </div>
      <button type="button" onClick={signOut} className="mt-8 self-center text-sm text-ink-2 hover:text-ink">
        Sign out
      </button>
    </main>
  );
}
