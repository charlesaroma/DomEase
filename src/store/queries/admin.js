/* Admin Queries */
// One hook per read and per write. Writes refresh what they change, and the
// Overview, so counts on the sidebar and the dashboard stay true.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  currenciesApi,
  guidesApi,
  householdsApi,
  nudgesApi,
  overviewApi,
  questionsApi,
  recipesApi,
  settingsApi,
  subscriptionsApi,
  suggestionsApi,
  teamApi,
  zoneTemplatesApi,
} from "../services";

export const keys = {
  overview: ["admin", "overview"],
  recipes: ["admin", "recipes"],
  suggestions: ["admin", "suggestions"],
  households: ["admin", "households"],
  subscriptions: ["admin", "subscriptions"],
  guides: ["admin", "guides"],
  questions: ["admin", "questions"],
  nudges: ["admin", "nudges"],
  currencies: ["admin", "currencies"],
  zoneTemplates: ["admin", "zone-templates"],
  team: ["admin", "team"],
  settings: ["admin", "settings"],
};

function useWrite(fn, ...touched) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      for (const key of [...touched, keys.overview]) qc.invalidateQueries({ queryKey: key });
    },
  });
}

export const useOverview = () => useQuery({ queryKey: keys.overview, queryFn: overviewApi.get });

export const useRecipes = () => useQuery({ queryKey: keys.recipes, queryFn: recipesApi.list });
export const useSaveRecipe = () =>
  useWrite(({ id, ...data }) => (id ? recipesApi.update(id, data) : recipesApi.create({ ...data, status: "published" })), keys.recipes);
export const useDeleteRecipe = () => useWrite((id) => recipesApi.remove(id), keys.recipes);

export const useSuggestions = () => useQuery({ queryKey: keys.suggestions, queryFn: suggestionsApi.list });
export const useApproveSuggestion = () =>
  useWrite(({ id, recipe }) => suggestionsApi.approve(id, recipe), keys.suggestions, keys.recipes);
export const useRejectSuggestion = () => useWrite((id) => suggestionsApi.reject(id), keys.suggestions);

export const useHouseholds = () => useQuery({ queryKey: keys.households, queryFn: householdsApi.list });
export const useUpdateHousehold = () => useWrite(({ id, ...data }) => householdsApi.update(id, data), keys.households);

export const useSubscriptions = () => useQuery({ queryKey: keys.subscriptions, queryFn: subscriptionsApi.list });

export const useGuides = () => useQuery({ queryKey: keys.guides, queryFn: guidesApi.list });
export const useSaveGuide = () =>
  useWrite(({ id, ...data }) => (id ? guidesApi.update(id, data) : guidesApi.create(data)), keys.guides);
export const useDeleteGuide = () => useWrite((id) => guidesApi.remove(id), keys.guides);

export const useQuestions = () => useQuery({ queryKey: keys.questions, queryFn: questionsApi.list });
export const useSaveQuestions = () => useWrite((q) => questionsApi.save(q), keys.questions);

export const useNudges = () => useQuery({ queryKey: keys.nudges, queryFn: nudgesApi.list });
export const useSaveNudge = () =>
  useWrite(({ id, ...data }) => (id ? nudgesApi.update(id, data) : nudgesApi.create(data)), keys.nudges);
export const useDeleteNudge = () => useWrite((id) => nudgesApi.remove(id), keys.nudges);

export const useCurrencies = () => useQuery({ queryKey: keys.currencies, queryFn: currenciesApi.get });
export const useSaveCurrencies = () => useWrite((rates) => currenciesApi.save(rates), keys.currencies);

export const useZoneTemplates = () => useQuery({ queryKey: keys.zoneTemplates, queryFn: zoneTemplatesApi.list });
export const useSaveZoneTemplate = () =>
  useWrite(({ id, ...data }) => (id ? zoneTemplatesApi.update(id, data) : zoneTemplatesApi.create(data)), keys.zoneTemplates);

export const useTeam = () => useQuery({ queryKey: keys.team, queryFn: teamApi.list });
export const useSaveMember = () =>
  useWrite(({ id, ...data }) => (id ? teamApi.update(id, data) : teamApi.create(data)), keys.team);
export const useRemoveMember = () => useWrite((id) => teamApi.remove(id), keys.team);

export const useSettings = () => useQuery({ queryKey: keys.settings, queryFn: settingsApi.get });
export const useSaveSettings = () => useWrite((s) => settingsApi.save(s), keys.settings);
