/* Root Application */
import { Suspense } from "react";
import { BrowserRouter, Routes } from "react-router-dom";

import AppProviders from "./AppProviders";
import ScrollToTop from "./components/layout/ScrollToTop";
import PageLoader from "./components/ui/PageLoader";
import adminRoutes from "./routes/AdminRoutes";
import siteRoutes from "./routes/SiteRoutes";

// App shell: the public site and the admin (/admin) share one router.
function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader className="min-h-dvh" />}>
          <Routes>
            {adminRoutes()}
            {siteRoutes()}
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
