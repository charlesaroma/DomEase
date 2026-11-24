/* Client Layout */
import { Crown, HandHeart, Sparkles, Sun, CookingPot, ShoppingBasket, UserRound, Wrench } from "lucide-react";
import { Outlet, NavLink, Link } from "react-router-dom";

import AnimatedLogo from "@/components/brand/AnimatedLogo";
import { useMember } from "@/store/context/MemberAuthContext";
import { useAppSettings, useHousehold } from "@/store/queries/app";
import { cn } from "@/utils/cn";

const TABS = [
  { to: "/app", label: "Today", icon: Sun, end: true },
  { to: "/app/meals", label: "Meals", icon: CookingPot },
  { to: "/app/clean", label: "Clean", icon: Sparkles },
  { to: "/app/shop", label: "Shop", icon: ShoppingBasket },
];
const MORE = [
  { to: "/app/house-help", label: "House Help", icon: HandHeart },
  { to: "/app/you", label: "You", icon: UserRound },
];

/**
 * The web app's frame, as on the phone: four tabs along the bottom on a small
 * screen, a rail down the side on a large one. Maintenance mode (Settings in
 * the admin) replaces everything with its message.
 */
export default function ClientLayout() {
  const { user } = useMember();
  const { data: household } = useHousehold();
  const { data: settings } = useAppSettings();
  const premium = household?.tier === "premium";

  if (settings?.maintenance?.on) {
    return (
      <main className="grid min-h-dvh place-items-center p-6 text-center">
        <div className="max-w-sm">
          <Wrench className="mx-auto size-10 text-clay-700" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl font-bold">Back in a few minutes</h1>
          <p className="mt-2 text-ink-2">{settings.maintenance.message}</p>
        </div>
      </main>
    );
  }

  return (
    <div className="lg:flex">
      {/* Rail, large screens */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-white px-4 py-6 lg:flex">
        <Link to="/app" className="px-2" aria-label="DomEase, Today">
          <AnimatedLogo layout="compact" hover title="DomEase" className="h-10 w-auto" />
        </Link>
        <nav className="mt-8 flex-1 space-y-1" aria-label="Main">
          {[...TABS, ...MORE].map((t) => (
            <RailLink key={t.to} {...t} />
          ))}
        </nav>
        {!premium && (
          <Link to="/app/premium" className="mb-4 flex items-center gap-3 rounded-r-card bg-amber-200/50 p-4 hover:bg-amber-200/80">
            <Crown className="size-5 text-amber-800" aria-hidden="true" />
            <span className="text-sm">
              <span className="block font-semibold text-amber-800">Get Premium</span>
              <span className="text-ink-2">House Help, sharing, no ads</span>
            </span>
          </Link>
        )}
        <Link to="/app/you" className="flex items-center gap-3 rounded-r-md px-2 py-2 hover:bg-paper">
          <span className="grid size-9 place-items-center rounded-full bg-sage-100 font-display font-semibold text-sage-800">{user?.name?.[0] ?? "?"}</span>
          <span className="min-w-0 text-sm">
            <span className="block truncate font-medium">{user?.name}</span>
            <span className="block truncate text-ink-2">{household?.name}</span>
          </span>
        </Link>
      </aside>

      <main className="min-w-0 flex-1 pb-28 lg:pb-12">
        <Outlet />
      </main>

      {/* Tab bar, small screens */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label="Main"
      >
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end} className="flex flex-col items-center gap-1 py-2.5 text-xs">
            {({ isActive }) => (
              <>
                <span className={cn("grid h-8 w-14 place-items-center rounded-r-pill transition-colors", isActive ? "bg-clay-100 text-clay-700" : "text-ink-2")}>
                  <t.icon className="size-5" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
                </span>
                <span className={isActive ? "font-semibold text-clay-700" : "text-ink-2"}>{t.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function RailLink({ to, label, icon: Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn("flex items-center gap-3 rounded-r-md px-3 py-2.5 text-[15px] transition-colors", isActive ? "bg-clay-100 font-semibold text-clay-800" : "text-ink-2 hover:bg-paper hover:text-ink")
      }
    >
      <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
      {label}
    </NavLink>
  );
}
