/* Admin Pages */
import { lazy } from "react";

// Each module is its own chunk, so visitors to the site never download the
// admin. Folders follow the sidebar order (lib/constants.js) after 1.auth.
export const AdminLogin = lazy(() => import("./pages/1.auth/login"));
export const AdminLayout = lazy(() => import("./AdminLayout"));

export const Overview = lazy(() => import("./pages/2.overview/overview"));
export const Suggestions = lazy(() => import("./pages/3.suggestions/suggestions"));
export const Recipes = lazy(() => import("./pages/4.recipes/recipes"));
export const Households = lazy(() => import("./pages/5.households/households"));
export const Subscriptions = lazy(() => import("./pages/6.subscriptions/subscriptions"));
export const HouseHelp = lazy(() => import("./pages/7.house-help/house-help"));
export const Content = lazy(() => import("./pages/8.content/content"));
export const Team = lazy(() => import("./pages/9.team/team"));
export const Settings = lazy(() => import("./pages/10.settings/settings"));
