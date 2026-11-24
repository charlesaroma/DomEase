/* Nav Match */
import { ADMIN_NAV } from "./constants";

/** The sidebar item for a path, for the header title. */
export function activeNavItem(path) {
  const pathname = path.length > 1 ? path.replace(/\/$/, "") : path;
  const items = ADMIN_NAV.flatMap((g) => g.items);
  return items.filter((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to))).sort((a, b) => b.to.length - a.to.length)[0];
}
