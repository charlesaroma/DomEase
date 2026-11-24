/* Client Pages */
import { lazy } from "react";

// The web app, one chunk per screen, so the public site never downloads it.
// Folders follow the app's flow: sign in, set up, then the four tabs.
export const ClientShell = lazy(() => import("./ClientShell"));
export const ClientLayout = lazy(() => import("./ClientLayout"));

// Sign in and set up
export const SignIn = lazy(() => import("./pages/1.auth/sign-in"));
export const Setup = lazy(() => import("./pages/2.setup/setup"));
export const NewHome = lazy(() => import("./pages/2.setup/new-home"));
export const JoinHome = lazy(() => import("./pages/2.setup/join-home"));

// The tabs
export const Today = lazy(() => import("./pages/3.today/today"));
export const Convert = lazy(() => import("./pages/3.today/convert"));
export const Meals = lazy(() => import("./pages/4.meals/meals"));
export const Recipe = lazy(() => import("./pages/4.meals/recipe"));
export const Clean = lazy(() => import("./pages/5.clean/clean"));
export const Shop = lazy(() => import("./pages/6.shop/shop"));

// Beyond the tabs
export const HouseHelp = lazy(() => import("./pages/7.house-help/house-help"));
export const Premium = lazy(() => import("./pages/8.premium/premium"));
export const You = lazy(() => import("./pages/9.you/you"));
export const HouseholdPage = lazy(() => import("./pages/9.you/household"));
export const SettingsPage = lazy(() => import("./pages/9.you/settings"));
export const Help = lazy(() => import("./pages/9.you/help"));
