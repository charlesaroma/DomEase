/* App Icon */
import {
  ArrowLeftRight,
  Bell,
  CookingPot,
  RefreshCw,
  ShoppingBasket,
  Sparkles,
  Sun,
  UserCheck,
  Users,
} from "lucide-react";

/**
 * The product's icons by name, so data files can say "meals" or "clean" and
 * every screen draws the same glyph. Lucide line icons at a 1.75 stroke match
 * the line drawing in the logo.
 */
const ICONS = {
  today: Sun,
  meals: CookingPot,
  clean: Sparkles,
  shop: ShoppingBasket,
  users: Users,
  helper: UserCheck,
  bell: Bell,
  sync: RefreshCw,
  convert: ArrowLeftRight,
};

export default function AppIcon({ name, className, strokeWidth = 1.75 }) {
  const Glyph = ICONS[name] ?? Sun;
  return <Glyph className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
