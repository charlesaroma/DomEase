/* Admin Pages */
import { lazy } from "react";

// Each module is its own chunk, so visitors to the site never download the
// admin. Folders follow the sidebar order (lib/constants.js) after 1.auth.
export const AdminLogin = lazy(() => import("./pages/1.auth/login"));
export const AdminLayout = lazy(() => import("./AdminLayout"));

export const Overview = lazy(() => import("./pages/2.overview/overview"));

// Recipes
export const Suggestions = lazy(() => import("./pages/3.suggestions/suggestions"));
export const Recipes = lazy(() => import("./pages/4.recipes/recipes"));

// People
export const Users = lazy(() => import("./pages/5.users/users"));
export const Households = lazy(() => import("./pages/6.households/households"));

// Money
export const Subscriptions = lazy(() => import("./pages/7.subscriptions/subscriptions"));
export const Transactions = lazy(() => import("./pages/8.transactions/transactions"));
export const Ads = lazy(() => import("./pages/9.ads/ads"));

// The app
export const Prices = lazy(() => import("./pages/10.prices/prices"));
export const HouseHelp = lazy(() => import("./pages/11.house-help/house-help"));
export const Content = lazy(() => import("./pages/12.content/content"));
export const Legal = lazy(() => import("./pages/13.legal/legal"));

// Support and admin
export const Inbox = lazy(() => import("./pages/14.inbox/inbox"));
export const Team = lazy(() => import("./pages/15.team/team"));
export const Activity = lazy(() => import("./pages/16.activity/activity"));
export const Settings = lazy(() => import("./pages/17.settings/settings"));
