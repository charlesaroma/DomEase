/* Admin Sign In */
import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import Button from "@/components/ui/Button";
import useSeo from "@/seo/useSeo";
import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { DEMO_PASSWORD } from "@/store/services";
import { DEMO } from "@/store/services/mode";

import { Field, Input } from "../../components/Field";

// The staff door. Moderators sign in separately from households (PRD 7.2).
export default function AdminLogin() {
  useSeo({ title: "Sign in | DomEase admin" });
  const { user, signIn } = useAdminAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [email, setEmail] = useState(DEMO ? "pearl@domease.app" : "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={state?.from ?? "/admin"} replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(email, password);
      navigate(state?.from ?? "/admin", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-clay-900 p-12 text-white lg:flex">
        <img src="/logo/domease-logo-compact-reversed.svg" alt="DomEase" width="1600" height="472" className="h-10 w-auto self-start" />
        <div>
          <img src="/logo/domease-mark-reversed.svg" alt="" width="905" height="790" className="h-28 w-auto" />
          <h1 className="mt-8 text-4xl leading-tight font-bold">Run DomEase from one place.</h1>
          <p className="mt-4 max-w-md text-lg text-clay-200">
            Recipes and suggestions, households and subscriptions, House Help and everything the app shows.
          </p>
        </div>
        <p className="text-sm text-clay-200/70">Staff only. Households sign in through the app.</p>
      </div>

      <div className="flex items-center justify-center px-5 py-16">
        <form onSubmit={submit} className="w-full max-w-sm">
          <img src="/logo/domease-mark.svg" alt="" width="905" height="790" className="h-14 w-auto lg:hidden" />
          <h2 className="mt-6 text-3xl font-bold lg:mt-0">Sign in to the admin</h2>
          <p className="mt-2 text-ink-2">Use your DomEase team email.</p>

          <div className="mt-8 space-y-5">
            <Field label="Email">
              <Input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Password">
              <Input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
          </div>

          {error && <p className="mt-4 rounded-r-md bg-danger-100 px-3 py-2.5 text-sm text-danger">{error}</p>}

          <Button type="submit" variant="primary" size="lg" className="mt-7 w-full" disabled={busy}>
            <LockKeyhole className="size-4" aria-hidden="true" /> {busy ? "Signing in" : "Sign in"}
          </Button>

          {DEMO && (
            <p className="mt-6 rounded-r-md border border-line bg-paper px-4 py-3 text-sm text-ink-2">
              Demo mode: sign in as pearl@domease.app (owner), charles@raijintechhub.com (admin) or moderator@domease.app, with the password{" "}
              <code className="font-mono text-ink">{DEMO_PASSWORD}</code>.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
