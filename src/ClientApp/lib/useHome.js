/* Home Hooks */
import { useEffect, useMemo } from "react";

import { useAppCurrencies, useAppPrices, useAppRecipes, useHousehold, usePlan, useSavePlan, useShopping, useZones } from "@/store/queries/app";

import { buildShoppingList, estimateTotal, fromUgx, planAll } from "./home";

const allergiesOf = (household) => [...new Set((household?.members ?? []).flatMap((m) => m.allergies ?? []))];

/**
 * The household's week: made the first time it is needed and saved, so it
 * stays the same until they swap it (FR-MP-1). Recipes since taken out of the
 * app are dropped from the days they were on.
 */
export function useWeek() {
  const { data: household } = useHousehold();
  const { data: recipes = [], isLoading: loadingRecipes } = useAppRecipes();
  const { data: saved, isLoading: loadingPlan } = usePlan();
  const save = useSavePlan();
  const premium = household?.tier === "premium";
  const allergies = useMemo(() => allergiesOf(household), [household]);

  const make = (seed) => ({ seed, premium, days: planAll(recipes, { seed, premium, allergies }), createdAt: new Date().toISOString() });

  // First visit, or the plan was made on another plan (free ↔ Premium): plan again.
  const needsPlan = !loadingPlan && !loadingRecipes && recipes.length > 0 && household && (!saved || saved.premium !== premium);
  useEffect(() => {
    if (needsPlan && !save.isPending) save.mutate(make(saved?.seed ?? Math.floor(Math.random() * 1e9)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsPlan]);

  const byId = useMemo(() => Object.fromEntries(recipes.map((r) => [r.id, r])), [recipes]);
  const days = useMemo(() => {
    if (!saved) return null;
    return Object.fromEntries(Object.entries(saved.days).map(([type, ids]) => [type, ids.filter((id) => byId[id])]));
  }, [saved, byId]);

  return {
    days,
    byId,
    recipes,
    loading: loadingPlan || loadingRecipes || !days,
    swap: () => save.mutate(make(Math.floor(Math.random() * 1e9))),
    swapping: save.isPending,
  };
}

/** The shopping list, priced in the household's currency (prices are kept in shillings). */
export function useShoppingList() {
  const { data: household } = useHousehold();
  const { days, recipes, loading } = useWeek();
  const { data: zones = [] } = useZones();
  const { data: prices = [] } = useAppPrices();
  const { data: currencies } = useAppCurrencies();
  const { data: state = { checked: [], manual: [] } } = useShopping();
  const currency = household?.currency ?? "UGX";

  const items = useMemo(() => {
    if (!days) return [];
    const list = buildShoppingList({ plan: days, recipes, zones, prices, state });
    const rates = currencies?.rates ?? [];
    return list.map((i) => ({ ...i, price: i.price == null ? null : fromUgx(i.price, currency, rates) }));
  }, [days, recipes, zones, prices, state, currencies, currency]);

  return { items, state, total: estimateTotal(items), currency, loading };
}
