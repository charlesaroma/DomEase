/* Member Route Guards */
import { Navigate, useLocation } from "react-router-dom";

import PageLoader from "@/components/ui/PageLoader";
import { useMember } from "@/store/context/MemberAuthContext";
import { useHousehold } from "@/store/queries/app";

/** Signed in, or off to sign in (and back here after). */
export function RequireMember({ children }) {
  const { user, ready } = useMember();
  const location = useLocation();
  if (!ready) return <PageLoader className="min-h-dvh" />;
  if (!user) return <Navigate to="/app/sign-in" replace state={{ from: location.pathname }} />;
  return children;
}

/** Signed in with a home; someone with no home yet goes to set one up. */
export function RequireHome({ children }) {
  const { data: household, isLoading } = useHousehold();
  if (isLoading) return <PageLoader className="min-h-dvh" />;
  if (!household) return <Navigate to="/app/setup" replace />;
  return children;
}
