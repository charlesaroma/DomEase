/* Site Routes */
import { Route } from "react-router-dom";

import SiteLayout from "./SiteLayout";
import { Home, NotFound } from "./pages";

export default function siteRoutes() {
  return (
    <Route element={<SiteLayout />}>
      <Route index element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  );
}
