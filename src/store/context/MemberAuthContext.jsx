/* Member Auth */
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { appAuthApi } from "../services/app";

/**
 * Who is signed in to the web app: a household member, never a team member.
 * Its token is kept apart from the admin's (store/services/app), so the same
 * browser can be signed in to both.
 */
const MemberAuthContext = createContext(null);

export function MemberAuthProvider({ children }) {
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    appAuthApi.me().then((u) => {
      if (!live) return;
      setUser(u);
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);

  // A new person: nothing cached from whoever was signed in before.
  const fresh = useCallback(
    (u) => {
      qc.removeQueries({ queryKey: ["app"] });
      setUser(u);
      return u;
    },
    [qc],
  );

  const signIn = useCallback(async (email, password) => fresh(await appAuthApi.signIn(email, password)), [fresh]);
  const signUp = useCallback(async (data) => fresh(await appAuthApi.signUp(data)), [fresh]);
  const updateMe = useCallback(async (patch) => setUser(await appAuthApi.updateMe(patch)), []);
  const signOut = useCallback(() => {
    appAuthApi.signOut();
    fresh(null);
  }, [fresh]);
  const deleteMe = useCallback(async () => {
    await appAuthApi.deleteMe();
    fresh(null);
  }, [fresh]);

  const value = useMemo(() => ({ user, ready, signIn, signUp, signOut, updateMe, deleteMe }), [user, ready, signIn, signUp, signOut, updateMe, deleteMe]);
  return <MemberAuthContext.Provider value={value}>{children}</MemberAuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMember() {
  const ctx = useContext(MemberAuthContext);
  if (!ctx) throw new Error("useMember must be used inside MemberAuthProvider");
  return ctx;
}
