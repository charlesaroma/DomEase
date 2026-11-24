/* Client Routes */
import { Route } from "react-router-dom";

import * as P from "@/ClientApp/ClientPages";
import { RequireHome, RequireMember } from "@/ClientApp/components/auth/RequireMember";

// The web app at /app: what households see in the mobile app. Sign in sits
// outside the guards; setting up a home needs an account; the tabs need both.
export default function clientRoutes() {
  return (
    <Route path="app" element={<P.ClientShell />}>
      <Route path="sign-in" element={<P.SignIn />} />

      {/* Set up */}
      <Route
        path="setup"
        element={
          <RequireMember>
            <P.Setup />
          </RequireMember>
        }
      />
      <Route
        path="setup/new"
        element={
          <RequireMember>
            <P.NewHome />
          </RequireMember>
        }
      />
      <Route
        path="setup/join"
        element={
          <RequireMember>
            <P.JoinHome />
          </RequireMember>
        }
      />

      {/* The home */}
      <Route
        element={
          <RequireMember>
            <RequireHome>
              <P.ClientLayout />
            </RequireHome>
          </RequireMember>
        }
      >
        <Route index element={<P.Today />} />
        <Route path="convert" element={<P.Convert />} />
        <Route path="meals" element={<P.Meals />} />
        <Route path="meals/:id" element={<P.Recipe />} />
        <Route path="clean" element={<P.Clean />} />
        <Route path="shop" element={<P.Shop />} />
        <Route path="house-help" element={<P.HouseHelp />} />
        <Route path="premium" element={<P.Premium />} />
        <Route path="you" element={<P.You />} />
        <Route path="you/household" element={<P.HouseholdPage />} />
        <Route path="you/settings" element={<P.SettingsPage />} />
        <Route path="you/help" element={<P.Help />} />
      </Route>
    </Route>
  );
}
