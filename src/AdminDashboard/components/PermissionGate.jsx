/* Permission Gate */
import { Lock } from "lucide-react";

import { useAdminAuth } from "@/store/context/AdminAuthContext";

// A page the signed in role may not open shows why, rather than a blank screen.
export default function PermissionGate({ perm, children }) {
  const { can } = useAdminAuth();
  if (can(perm)) return children;
  return (
    <div className="grid min-h-[50vh] place-items-center text-center">
      <div>
        <Lock className="mx-auto size-8 text-ink-3" strokeWidth={1.5} aria-hidden="true" />
        <p className="mt-4 font-display text-xl font-semibold">Not part of your role</p>
        <p className="mt-2 text-ink-2">Ask the owner if you need access to this page.</p>
      </div>
    </div>
  );
}
