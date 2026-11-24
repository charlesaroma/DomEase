/* Admin Shell */
import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import PageLoader from "@/components/ui/PageLoader";
import useSeo from "@/seo/useSeo";

import { NoticeProvider } from "./components/Notice";
import AdminHeader from "./components/header/AdminHeader";
import AdminSidebar from "./components/sidebar/AdminSidebar";
import { activeNavItem } from "./lib/navMatch";

// The admin's own app: no site chrome, the same tokens and type.
export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const active = activeNavItem(pathname);
  useSeo({ title: `${active?.label ?? "Admin"} | DomEase admin` });

  return (
    <NoticeProvider>
      <div className="flex min-h-dvh bg-paper">
        <AdminSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="min-w-0 flex-1">
          <AdminHeader title={active?.label ?? "Admin"} onMenu={() => setMenuOpen(true)} />
          <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
            <Suspense fallback={<PageLoader className="min-h-[50vh]" />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </NoticeProvider>
  );
}
