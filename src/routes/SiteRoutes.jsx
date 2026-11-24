/* Site Routes */
import { Route } from "react-router-dom";

import SiteLayout from "./SiteLayout";
import { legalPages } from "@/data/legal";

import { DeleteAccount, Home, Legal, NotFound } from "./pages";

export default function siteRoutes() {
  return (
    <Route element={<SiteLayout />}>
      <Route index element={<Home />} />
      {legalPages.map(({ path, doc }) => (
        <Route key={path} path={path} element={<Legal doc={doc} />} />
      ))}
      <Route path="delete-account" element={<DeleteAccount />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  );
}
