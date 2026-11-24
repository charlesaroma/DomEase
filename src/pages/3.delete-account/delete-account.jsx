/* Delete account */
import { Link } from "react-router-dom";

import useSeo from "@/seo/useSeo";

const steps = ["Open DomEase and tap your initials at the top of Today.", "Tap your name to open your profile.", "Tap Delete account, read what is deleted, tick the box and confirm."];

// The public page Google Play asks for: how to delete a DomEase account and
// its data, including for someone who no longer has the app installed.
export default function DeleteAccount() {
  useSeo({ title: "Delete your account | DomEase", description: "How to delete your DomEase account and the data that goes with it." });
  return (
    <article className="mx-auto max-w-3xl px-5 py-14 sm:py-20 lg:px-8">
      <p className="text-xs font-medium tracking-[0.18em] text-clay-700 uppercase">Your account</p>
      <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Delete your DomEase account</h1>

      <h2 className="mt-12 text-2xl font-semibold">In the app</h2>
      <ol className="mt-4 list-decimal space-y-3 pl-6 text-[17px] leading-relaxed">
        {steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>

      <h2 className="mt-12 text-2xl font-semibold">Without the app</h2>
      <p className="mt-4 text-[17px] leading-relaxed">
        Email{" "}
        <a href="mailto:hello@domease.app?subject=Delete%20my%20DomEase%20account" className="font-medium text-clay-700 underline">
          hello@domease.app
        </a>{" "}
        from the email address or with the phone number on your account, and ask us to delete it. We confirm it is you, then delete it within 30 days.
      </p>

      <h2 className="mt-12 text-2xl font-semibold">What is deleted</h2>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-[17px] leading-relaxed">
        <li>Your profile and sign in details.</li>
        <li>The home you set up, for everyone in it: meal plans, cleaning zones, the shopping list and members. If you joined someone else's home, only your place in it.</li>
        <li>Your settings, favourites and messages to us.</li>
      </ul>
      <p className="mt-4 text-[17px] leading-relaxed">
        Payment records are kept for as long as tax law requires, and backups are overwritten within 90 days. The{" "}
        <Link to="/privacy" className="font-medium text-clay-700 underline">
          Privacy Policy
        </Link>{" "}
        explains this in full.
      </p>
    </article>
  );
}
