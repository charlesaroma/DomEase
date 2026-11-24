/* Admin Auth */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "../services";

/**
 * Who is signed in to the admin, and what their role may do. Roles (PRD 7.2):
 *   owner      everything, including team and settings
 *   admin      everything but removing the owner
 *   moderator  recipes, suggestions, app content, prices and the support inbox
 * Some actions inside a page are narrower still: see `canDo`.
 */
const MODERATOR = new Set(["overview", "suggestions", "recipes", "house-help", "content", "prices", "inbox"]);
// Actions only the owner may take, wherever they appear.
const OWNER_ONLY = new Set(["refund"]);

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    authApi.me().then((u) => {
      if (!live) return;
      setUser(u);
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const u = await authApi.signIn(email, password);
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(() => {
    authApi.signOut();
    setUser(null);
  }, []);

  const can = useCallback((module) => !!user && (user.role !== "moderator" || MODERATOR.has(module)), [user]);
  const canDo = useCallback((action) => !!user && (!OWNER_ONLY.has(action) || user.role === "owner"), [user]);

  const value = useMemo(() => ({ user, ready, signIn, signOut, can, canDo }), [user, ready, signIn, signOut, can, canDo]);
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
