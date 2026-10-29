/* Root Application */
import { Suspense } from "react";
import { BrowserRouter, Routes } from "react-router-dom";

import AppProviders from "./AppProviders";
import ScrollToTop from "./components/layout/ScrollToTop";
import PageLoader from "./components/ui/PageLoader";
import siteRoutes from "./routes/SiteRoutes";

// App shell
function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader className="min-h-dvh" />}>
          <Routes>{siteRoutes()}</Routes>
        </Suspense>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
