/* Admin Queries */
// One hook per read and per write. Writes refresh what they change, and the
// Overview, so counts on the sidebar and the dashboard stay true.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adPlacementsApi,
  adStatsApi,
  auditApi,
  currenciesApi,
  faqsApi,
  guidesApi,
  householdsApi,
  legalApi,
  nudgesApi,
  occasionsApi,
  overviewApi,
  paymentsApi,
  premiumFeaturesApi,
  pricesApi,
  questionsApi,
  recipesApi,
  setHouseholdTier,
  setUserStatus,
  settingsApi,
  sponsoredApi,
  subscriptionsApi,
  suggestionsApi,
  supportApi,
  teamApi,
  usersApi,
  zonePresetsApi,
  zoneTemplatesApi,
} from "../services";
import { upload } from "../services/uploads";

export const keys = {
  overview: ["admin", "overview"],
  recipes: ["admin", "recipes"],
  suggestions: ["admin", "suggestions"],
  households: ["admin", "households"],
  users: ["admin", "users"],
  subscriptions: ["admin", "subscriptions"],
  payments: ["admin", "payments"],
  adPlacements: ["admin", "ad-placements"],
  adStats: ["admin", "ad-stats"],
  sponsored: ["admin", "sponsored"],
  prices: ["admin", "prices"],
  guides: ["admin", "guides"],
  questions: ["admin", "questions"],
  nudges: ["admin", "nudges"],
  currencies: ["admin", "currencies"],
  zoneTemplates: ["admin", "zone-templates"],
  zonePresets: ["admin", "zone-presets"],
  faqs: ["admin", "faqs"],
  premiumFeatures: ["admin", "premium-features"],
  occasions: ["admin", "occasions"],
  legal: ["admin", "legal"],
  support: ["admin", "support"],
  audit: ["admin", "audit"],
  team: ["admin", "team"],
  settings: ["admin", "settings"],
};

function useWrite(fn, ...touched) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      for (const key of [...touched, keys.overview, keys.audit]) qc.invalidateQueries({ queryKey: key });
    },
  });
}

/** Read, save (create without an id, update with one) and delete for a plain collection. */
const listOf = (key, api) => () => useQuery({ queryKey: key, queryFn: api.list });
const saverOf = (key, api, defaults = {}) => () =>
  useWrite(({ id, ...data }) => (id ? api.update(id, data) : api.create({ ...defaults, ...data })), key);
const deleterOf = (key, api) => () => useWrite((id) => api.remove(id), key);

export const useOverview = () => useQuery({ queryKey: keys.overview, queryFn: overviewApi.get });

/** Upload a file: { file, folder, width, height } → { url, width, height }. */
export const useUpload = () => useMutation({ mutationFn: ({ file, ...opts }) => upload(file, opts) });

// Recipes
export const useRecipes = listOf(keys.recipes, recipesApi);
export const useSaveRecipe = () =>
  useWrite(
    ({ id, ...data }) => (id ? recipesApi.update(id, data) : recipesApi.create({ status: "published", publishedAt: new Date().toISOString(), ...data })),
    keys.recipes,
  );
export const useDeleteRecipe = deleterOf(keys.recipes, recipesApi);
/** The same change to several recipes: publish, archive, Premium on or off. */
export const useBulkUpdateRecipes = () => useWrite(({ ids, patch }) => Promise.all(ids.map((id) => recipesApi.update(id, patch))), keys.recipes);

export const useSuggestions = listOf(keys.suggestions, suggestionsApi);
export const useApproveSuggestion = () =>
  useWrite(({ id, recipe }) => suggestionsApi.approve(id, recipe), keys.suggestions, keys.recipes);
export const useRejectSuggestion = () => useWrite((id) => suggestionsApi.reject(id), keys.suggestions);

// People
export const useHouseholds = listOf(keys.households, householdsApi);
export const useUpdateHousehold = () => useWrite(({ id, ...data }) => householdsApi.update(id, data), keys.households);
export const useSetHouseholdTier = () =>
  useWrite(({ id, tier, reason }) => setHouseholdTier(id, tier, reason), keys.households, keys.users, keys.subscriptions);

export const useUsers = listOf(keys.users, usersApi);
export const useSetUserStatus = () => useWrite(({ id, status, reason }) => setUserStatus(id, status, reason), keys.users);

// Money
export const useSubscriptions = listOf(keys.subscriptions, subscriptionsApi);
export const usePayments = listOf(keys.payments, paymentsApi);
export const useRefundPayment = () => useWrite(({ id, reason }) => paymentsApi.refund(id, reason), keys.payments);

// Ads
export const useAdPlacements = listOf(keys.adPlacements, adPlacementsApi);
export const useSaveAdPlacement = saverOf(keys.adPlacements, adPlacementsApi);
export const useAdStats = (range) => useQuery({ queryKey: [...keys.adStats, range], queryFn: () => adStatsApi.get(range) });
export const useSponsored = listOf(keys.sponsored, sponsoredApi);
export const useSaveSponsored = saverOf(keys.sponsored, sponsoredApi, { views: 0, taps: 0 });
export const useDeleteSponsored = deleterOf(keys.sponsored, sponsoredApi);

// The app's content
export const usePrices = listOf(keys.prices, pricesApi);
export const useSavePrice = saverOf(keys.prices, pricesApi);
export const useDeletePrice = deleterOf(keys.prices, pricesApi);
/** Many prices at once, from a CSV: rows with an id are updated, the rest added. */
export const useImportPrices = () =>
  useWrite((rows) => Promise.all(rows.map(({ id, ...p }) => (id ? pricesApi.update(id, p) : pricesApi.create(p)))), keys.prices);

export const useGuides = listOf(keys.guides, guidesApi);
export const useSaveGuide = saverOf(keys.guides, guidesApi);
export const useDeleteGuide = deleterOf(keys.guides, guidesApi);

export const useQuestions = () => useQuery({ queryKey: keys.questions, queryFn: questionsApi.list });
export const useSaveQuestions = () => useWrite((q) => questionsApi.save(q), keys.questions);

export const useNudges = listOf(keys.nudges, nudgesApi);
export const useSaveNudge = saverOf(keys.nudges, nudgesApi);
export const useDeleteNudge = deleterOf(keys.nudges, nudgesApi);

export const useCurrencies = () => useQuery({ queryKey: keys.currencies, queryFn: currenciesApi.get });
export const useSaveCurrencies = () => useWrite((rates) => currenciesApi.save(rates), keys.currencies);

export const useZoneTemplates = listOf(keys.zoneTemplates, zoneTemplatesApi);
export const useSaveZoneTemplate = saverOf(keys.zoneTemplates, zoneTemplatesApi);
export const useDeleteZoneTemplate = deleterOf(keys.zoneTemplates, zoneTemplatesApi);

export const useZonePresets = listOf(keys.zonePresets, zonePresetsApi);
export const useSaveZonePreset = saverOf(keys.zonePresets, zonePresetsApi);
export const useDeleteZonePreset = deleterOf(keys.zonePresets, zonePresetsApi);

export const useFaqs = listOf(keys.faqs, faqsApi);
export const useSaveFaq = saverOf(keys.faqs, faqsApi, { active: true });
export const useDeleteFaq = deleterOf(keys.faqs, faqsApi);

export const usePremiumFeatures = listOf(keys.premiumFeatures, premiumFeaturesApi);
export const useSavePremiumFeature = saverOf(keys.premiumFeatures, premiumFeaturesApi, { shown: true, comingSoon: false });
export const useDeletePremiumFeature = deleterOf(keys.premiumFeatures, premiumFeaturesApi);

export const useOccasions = listOf(keys.occasions, occasionsApi);
export const useSaveOccasion = saverOf(keys.occasions, occasionsApi, { active: true });

export const useLegal = listOf(keys.legal, legalApi);
export const useSaveLegal = saverOf(keys.legal, legalApi);

// Support and admin
export const useSupportReports = listOf(keys.support, supportApi);
export const useUpdateReport = () => useWrite(({ id, ...data }) => supportApi.update(id, data), keys.support);

export const useAuditLog = () => useQuery({ queryKey: keys.audit, queryFn: auditApi.list });

export const useTeam = listOf(keys.team, teamApi);
export const useSaveMember = saverOf(keys.team, teamApi);
export const useRemoveMember = deleterOf(keys.team, teamApi);

export const useSettings = () => useQuery({ queryKey: keys.settings, queryFn: settingsApi.get });
export const useSaveSettings = () => useWrite((s) => settingsApi.save(s), keys.settings);
