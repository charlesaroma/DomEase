/* Client Shell */
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import PageLoader from "@/components/ui/PageLoader";
import { MemberAuthProvider } from "@/store/context/MemberAuthContext";

import { ToastProvider } from "./components/Toast";

// Everything under /app: the household's sign in, kept apart from the admin's.
export default function ClientShell() {
  return (
    <MemberAuthProvider>
      <ToastProvider>
        <div className="min-h-dvh bg-paper text-ink">
          <Suspense fallback={<PageLoader className="min-h-dvh" />}>
            <Outlet />
          </Suspense>
        </div>
      </ToastProvider>
    </MemberAuthProvider>
  );
}
