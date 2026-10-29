/* Site Layout */
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import PageLoader from "@/components/ui/PageLoader";

// The navbar and footer wrap every public page.
export default function SiteLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader className="min-h-[60vh]" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
