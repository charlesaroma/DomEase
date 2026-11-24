/* Admin Routes */
import { Route } from "react-router-dom";

import * as P from "@/AdminDashboard/AdminPages";
import RequireAdmin from "@/AdminDashboard/components/auth/RequireAdmin";
import PermissionGate from "@/AdminDashboard/components/PermissionGate";

// Path, permission module and page, in sidebar order.
const MODULES = [
  ["suggestions", "suggestions", P.Suggestions],
  ["recipes", "recipes", P.Recipes],
  ["households", "households", P.Households],
  ["subscriptions", "subscriptions", P.Subscriptions],
  ["house-help", "house-help", P.HouseHelp],
  ["content", "content", P.Content],
  ["team", "team", P.Team],
  ["settings", "settings", P.Settings],
];

export default function adminRoutes() {
  return (
    <>
      {/* The staff door: full screen, outside the guard */}
      <Route path="admin/login" element={<P.AdminLogin />} />
      <Route
        path="admin"
        element={
          <RequireAdmin>
            <P.AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<P.Overview />} />
        {MODULES.map(([path, perm, Page]) => (
          <Route
            key={path}
            path={path}
            element={
              <PermissionGate perm={perm}>
                <Page />
              </PermissionGate>
            }
          />
        ))}
      </Route>
    </>
  );
}
