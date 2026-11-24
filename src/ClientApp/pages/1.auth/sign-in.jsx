/* Sign In */
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import AnimatedLogo from "@/components/brand/AnimatedLogo";
import Button from "@/components/ui/Button";
import { useMember } from "@/store/context/MemberAuthContext";
import { appAuthApi, DEMO_EMAIL, DEMO_PASSWORD } from "@/store/services/app";
import { DEMO } from "@/store/services/mode";
import { cn } from "@/utils/cn";

import { TextField } from "../../components/Sheet";

/**
 * Sign in to the web app with the same account as the phone, or make one.
 * Google, Apple and phone codes come with the API; until then, email.
 */
export default function SignIn() {
  const { user, ready, signIn, signUp } = useMember();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("signin"); // signin | signup | forgot
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  if (ready && user) return <Navigate to={location.state?.from ?? "/app"} replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = form.email.includes("@") && (mode === "forgot" || form.password.length >= 8 || (mode === "signin" && form.password)) && (mode !== "signup" || form.name.trim());

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "forgot") {
        await appAuthApi.forgot(form.email);
        setSent(true);
      } else if (mode === "signin") {
        await signIn(form.email, form.password);
        navigate(location.state?.from ?? "/app", { replace: true });
      } else {
        await signUp(form);
        navigate("/app/setup", { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-clay-700 p-12 text-white lg:flex">
        <Link to="/" aria-label="DomEase home">
          <AnimatedLogo layout="compact" tone="dark" state="draw" title="DomEase" className="h-12 w-auto" />
        </Link>
        <div>
          <p className="font-display text-4xl leading-tight font-bold">Meals planned, cleaning shared, one shopping list.</p>
          <p className="mt-4 max-w-md text-lg text-clay-100">The same home as on your phone. Plan the week on a big screen, and everyone at home sees it.</p>
        </div>
        <p className="text-sm text-clay-200">Made in Kampala</p>
      </section>

      <section className="flex flex-col justify-center px-5 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="lg:hidden" aria-label="DomEase home">
            <AnimatedLogo layout="compact" title="DomEase" className="h-10 w-auto" />
          </Link>
          <h1 className="mt-8 font-display text-3xl font-bold lg:mt-0">
            {mode === "signin" ? "Welcome back" : mode === "signup" ? "Make your account" : "Reset your password"}
          </h1>
          <p className="mt-2 text-ink-2">
            {mode === "signin" ? "Sign in with the account you use on your phone." : mode === "signup" ? "Then set up your home in about a minute." : "We'll email you a link to choose a new one."}
          </p>

          {mode !== "forgot" && (
            <div className="mt-6 grid grid-cols-2 rounded-r-pill bg-paper-2 p-1" role="tablist">
              {[
                ["signin", "Sign in"],
                ["signup", "Create account"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={mode === id}
                  onClick={() => (setMode(id), setError(""))}
                  className={cn("rounded-r-pill py-2 text-sm font-medium", mode === id ? "bg-white shadow-sh-1" : "text-ink-2")}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {sent ? (
            <p className="mt-6 rounded-r-card bg-sage-100 p-4 text-sage-800">If there's an account for {form.email}, a reset link is on its way.</p>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === "signup" && <TextField label="Your name" autoComplete="name" value={form.name} onChange={set("name")} />}
              <TextField label="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} />
              {mode !== "forgot" && (
                <TextField
                  label="Password"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  hint={mode === "signup" ? "At least 8 characters" : undefined}
                  value={form.password}
                  onChange={set("password")}
                />
              )}
              {error && (
                <p className="text-sm text-danger" role="alert">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={!valid || busy}>
                {busy ? "One moment" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send the link"}
              </Button>
            </form>
          )}

          <p className="mt-4 text-center text-sm">
            {mode === "signin" ? (
              <button type="button" onClick={() => (setMode("forgot"), setError(""))} className="text-clay-700 hover:underline">
                Forgot your password?
              </button>
            ) : mode === "forgot" ? (
              <button type="button" onClick={() => (setMode("signin"), setSent(false))} className="text-clay-700 hover:underline">
                Back to sign in
              </button>
            ) : null}
          </p>

          {DEMO && mode === "signin" && (
            <div className="mt-8 rounded-r-card border border-dashed border-line-2 p-4 text-sm">
              <p className="font-medium">Running on demo data</p>
              <p className="mt-1 text-ink-2">Try a family of four with a house help, or create an account to set up a home from scratch.</p>
              <button type="button" onClick={() => setForm({ ...form, email: DEMO_EMAIL, password: DEMO_PASSWORD })} className="mt-2 font-semibold text-clay-700 hover:underline">
                Fill in the demo household
              </button>
            </div>
          )}
          <p className="mt-8 text-center text-xs text-ink-3">
            By continuing you agree to the{" "}
            <Link to="/terms" className="underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline">
              Privacy notice
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
