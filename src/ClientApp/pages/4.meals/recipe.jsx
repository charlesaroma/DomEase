/* Recipe */
import { Heart, TriangleAlert } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import RecipeView from "@/components/recipes/RecipeView";
import { useAppRecipes, useAppSettings, useFavourites, useHousehold, useSaveFavourites } from "@/store/queries/app";
import { cn } from "@/utils/cn";

import Screen from "../../components/Screen";
import { useToast } from "../../components/Toast";
import { containsAllergen } from "../../lib/home";

/**
 * One recipe, scaled to the household. Premium recipes, the healthier
 * version, favourites and allergy warnings need Premium (FR-MP).
 */
export default function Recipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: recipes = [], isLoading } = useAppRecipes();
  const { data: household } = useHousehold();
  const { data: settings } = useAppSettings();
  const { data: favourites = [] } = useFavourites();
  const saveFav = useSaveFavourites();
  const toast = useToast();
  const r = recipes.find((x) => x.id === id);
  const premium = household?.tier === "premium";

  if (isLoading) return <Screen back="/app/meals">{null}</Screen>;
  if (!r)
    return (
      <Screen back="/app/meals" title="Recipe not found">
        <p className="text-ink-2">It may have been taken out of the app.</p>
      </Screen>
    );

  const allergic = premium ? (household?.members ?? []).filter((m) => containsAllergen(r, m.allergies ?? [])) : [];
  const fav = favourites.includes(r.id);
  const toggleFav = () => {
    if (!premium) return navigate("/app/premium");
    saveFav.mutate(fav ? favourites.filter((x) => x !== r.id) : [...favourites, r.id]);
    toast(fav ? "Taken out of favourites." : "Saved to favourites.");
  };

  return (
    <div className="mx-auto max-w-4xl pb-6 md:px-6 md:pt-8">
      <Link to={`/app/meals?type=${r.mealType}`} className="mb-3 ml-4 hidden text-[15px] text-ink-2 hover:text-ink md:inline-block">
        ← Back to the week
      </Link>
      {allergic.length > 0 && (
        <p className="mx-4 mb-4 flex items-start gap-3 rounded-r-card bg-danger-100 p-4 text-danger md:mx-0" role="alert">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          Careful: {allergic.map((m) => m.name).join(" and ")} {allergic.length === 1 ? "is" : "are"} allergic to something in this.
        </p>
      )}
      <RecipeView
        recipe={r}
        people={household?.size}
        premium={premium}
        disclaimer={settings?.dietaryDisclaimer}
        onUpgrade={() => navigate("/app/premium")}
        actions={
          <>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="grid size-11 place-items-center rounded-full bg-white/90 text-lg shadow-sh-1 md:hidden"
              aria-label="Back"
            >
              ←
            </button>
            <button
              type="button"
              onClick={toggleFav}
              aria-pressed={fav}
              aria-label={premium ? (fav ? "Remove from favourites" : "Save to favourites") : "Favourites come with Premium"}
              className="grid size-11 place-items-center rounded-full bg-white/90 shadow-sh-1"
            >
              <Heart className={cn("size-5", fav ? "fill-clay-700 text-clay-700" : "text-ink")} />
            </button>
          </>
        }
      />
    </div>
  );
}
