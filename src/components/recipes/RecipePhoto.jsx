/* Recipe Photo */
import { Coffee, CookingPot, Croissant, Salad, Soup } from "lucide-react";

import Media from "@/components/ui/Media";
import { cn } from "@/utils/cn";

// With no photo yet, each meal type gets its own tint and glyph, so a list of
// recipes still reads at a glance and never shows an empty grey box.
const LOOK = {
  breakfast: { icon: Coffee, tint: "bg-amber-200/70 text-amber-800" },
  lunch: { icon: Salad, tint: "bg-sage-100 text-sage-800" },
  dinner: { icon: CookingPot, tint: "bg-clay-100 text-clay-800" },
  snack: { icon: Soup, tint: "bg-sage-200/60 text-sage-800" },
  pastry: { icon: Croissant, tint: "bg-clay-200/60 text-clay-900" },
};

/**
 * A recipe's cover photo, or its meal-type placeholder. `className` sets the
 * size and shape (aspect ratio, rounding); the image fills it.
 */
export default function RecipePhoto({ recipe, className, iconClassName = "size-1/4 max-w-12", eager = false }) {
  const look = LOOK[recipe?.mealType] ?? LOOK.dinner;
  const Icon = look.icon;
  const placeholder = (
    <div className={cn("grid place-items-center", look.tint, className)} role="img" aria-label={`${recipe?.name ?? "Recipe"}, no photo yet`}>
      <Icon className={iconClassName} strokeWidth={1.5} aria-hidden="true" />
    </div>
  );
  return (
    <Media
      src={recipe?.photo?.url}
      alt={recipe?.photo?.alt || recipe?.name || ""}
      loading={eager ? "eager" : "lazy"}
      className={cn("bg-paper-2", className)}
      fallback={placeholder}
    />
  );
}
