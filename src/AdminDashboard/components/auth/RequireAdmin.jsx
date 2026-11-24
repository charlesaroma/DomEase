/* Require Admin */
import { Navigate, useLocation } from "react-router-dom";

import PageLoader from "@/components/ui/PageLoader";
import { useAdminAuth } from "@/store/context/AdminAuthContext";

// Sends anyone not signed in to the staff door, and back here after.
export default function RequireAdmin({ children }) {
  const { user, ready } = useAdminAuth();
  const location = useLocation();
  if (!ready) return <PageLoader className="min-h-dvh" />;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return children;
}
