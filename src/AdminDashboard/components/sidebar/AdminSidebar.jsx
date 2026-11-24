/* Admin Sidebar */
import { LogOut, X } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAdminAuth } from "@/store/context/AdminAuthContext";
import { useOverview } from "@/store/queries/admin";
import { cn } from "@/utils/cn";

import { ADMIN_NAV, ROLES } from "../../lib/constants";

export default function AdminSidebar({ open, onClose }) {
  const { user, can, signOut } = useAdminAuth();
  const { data: overview } = useOverview();

  return (
    <>
      {open && <button type="button" aria-label="Close menu" onClick={onClose} className="fixed inset-0 z-40 bg-ink/30 lg:hidden" />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-white transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-18 items-center justify-between px-6">
          <img src="/logo/domease-logo-compact.svg" alt="DomEase" width="1600" height="472" className="h-9 w-auto" />
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-r-pill lg:hidden" aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <p className="mx-6 -mt-2 mb-3 text-xs font-medium tracking-[0.16em] text-clay-700 uppercase">Admin</p>

        <nav className="flex-1 overflow-y-auto px-3 pb-6" aria-label="Admin">
          {ADMIN_NAV.map((group) => {
            const items = group.items.filter((i) => can(i.perm));
            if (!items.length) return null;
            return (
              <div key={group.id} className="mt-4 first:mt-0">
                {group.label && <p className="px-3 pb-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase">{group.label}</p>}
                {items.map((item) => {
                  const count = item.badge ? overview?.[item.badge] : 0;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-r-md px-3 py-2.5 text-[15px] transition-colors",
                          isActive ? "bg-clay-100 font-medium text-clay-800" : "text-ink-2 hover:bg-paper hover:text-ink",
                        )
                      }
                    >
                      <item.icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
                      <span className="flex-1">{item.label}</span>
                      {count > 0 && (
                        <span
                          className={cn(
                            "rounded-r-pill px-2 py-0.5 text-xs font-semibold",
                            item.badgeTone === "quiet" ? "bg-paper-2 text-ink-2" : "bg-clay-700 text-white",
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 border-t border-line px-5 py-4">
          <span className="grid size-9 place-items-center rounded-full bg-sage-100 font-display font-semibold text-sage-800">
            {user?.name?.[0] ?? "?"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-ink-2">{ROLES[user?.role]}</p>
          </div>
          <button type="button" onClick={signOut} className="grid size-9 place-items-center rounded-r-pill text-ink-2 hover:bg-paper" aria-label="Sign out">
            <LogOut className="size-[18px]" strokeWidth={1.75} />
          </button>
        </div>
      </aside>
    </>
  );
}
