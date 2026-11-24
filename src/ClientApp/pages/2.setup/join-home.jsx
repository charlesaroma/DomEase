/* Join A Home */
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "@/components/ui/Button";
import { useJoinHousehold } from "@/store/queries/app";
import { DEMO_INVITE } from "@/store/services/app";
import { DEMO } from "@/store/services/mode";

import Screen from "../../components/Screen";
import { TextField } from "../../components/Sheet";

// The invite code from You → Household on the owner's phone (Premium sharing).
export default function JoinHome() {
  const join = useJoinHousehold();
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  return (
    <Screen back="/app/setup" title="Join a home">
      <form
        className="max-w-sm space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          join.mutate(code, { onSuccess: () => navigate("/app", { replace: true }) });
        }}
      >
        <p className="text-ink-2">Ask whoever set up the home for the six letter code in You → Household.</p>
        <TextField label="Invite code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={8} autoCapitalize="characters" className="font-mono tracking-[0.3em]" />
        {join.error && (
          <p className="text-sm text-danger" role="alert">
            {join.error.message}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={code.trim().length < 4 || join.isPending}>
          {join.isPending ? "Joining" : "Join"}
        </Button>
        {DEMO && <p className="text-sm text-ink-3">On demo data, the demo household's code is {DEMO_INVITE} (it needs Premium to share).</p>}
      </form>
    </Screen>
  );
}
