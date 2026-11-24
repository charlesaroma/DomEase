/* App Queries */
// The web app's reads and writes. Household data refreshes after every write;
// content (recipes, prices, FAQs…) is cached for a few minutes, as the phone does.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { contentApi, favouritesApi, householdApi, planApi, sendApi, shoppingApi, zonesApi } from "../services/app";

export const appKeys = {
  household: ["app", "household"],
  plan: ["app", "plan"],
  zones: ["app", "zones"],
  shopping: ["app", "shopping"],
  favourites: ["app", "favourites"],
  content: (name) => ["app", "content", name],
};

const CONTENT_STALE = 5 * 60 * 1000;
const content = (name) => () => useQuery({ queryKey: appKeys.content(name), queryFn: contentApi[name], staleTime: CONTENT_STALE });

export const useAppRecipes = content("recipes");
export const useAppPrices = content("prices");
export const useAppCurrencies = content("currencies");
export const useAppNudges = content("nudges");
export const useAppFaqs = content("faqs");
export const useAppPremiumFeatures = content("premiumFeatures");
export const useAppOccasions = content("occasions");
export const useAppZonePresets = content("zonePresets");
export const useAppQuestions = content("questions");
export const useAppGuides = content("guides");
export const useAppSettings = content("settings");

export const useHousehold = () => useQuery({ queryKey: appKeys.household, queryFn: householdApi.get });
export const usePlan = () => useQuery({ queryKey: appKeys.plan, queryFn: planApi.get });
export const useZones = () => useQuery({ queryKey: appKeys.zones, queryFn: zonesApi.get });
export const useShopping = () => useQuery({ queryKey: appKeys.shopping, queryFn: shoppingApi.get });
export const useFavourites = () => useQuery({ queryKey: appKeys.favourites, queryFn: favouritesApi.get });

/**
 * A write that shows straight away: the cache is set to the new value first,
 * then the server's answer replaces it (or the old value comes back on error).
 */
function useOptimistic(key, fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onMutate: async (next) => {
      await qc.cancelQueries({ queryKey: key });
      const before = qc.getQueryData(key);
      qc.setQueryData(key, next);
      return { before };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(key, ctx?.before),
    onSuccess: (saved) => qc.setQueryData(key, saved),
  });
}

export const useSavePlan = () => useOptimistic(appKeys.plan, planApi.save);
export const useSaveZones = () => useOptimistic(appKeys.zones, zonesApi.save);
export const useSaveShopping = () => useOptimistic(appKeys.shopping, shoppingApi.save);
export const useSaveFavourites = () => useOptimistic(appKeys.favourites, favouritesApi.save);

function useHouseholdWrite(fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["app"] }),
  });
}
export const useCreateHousehold = () => useHouseholdWrite(householdApi.create);
export const useUpdateHousehold = () => useHouseholdWrite(householdApi.update);
export const useJoinHousehold = () => useHouseholdWrite(householdApi.join);
export const useLeaveHousehold = () => useHouseholdWrite(householdApi.leave);
export const useCheckout = () => useHouseholdWrite(householdApi.checkout);

export const useSendSuggestion = () => useMutation({ mutationFn: sendApi.suggestion });
export const useSendReport = () => useMutation({ mutationFn: sendApi.report });
export const useScoreCandidate = () => useMutation({ mutationFn: sendApi.score });
