/* Site Pages: the lazy barrel */
// Each page is its own chunk. Folders are numbered in nav order (docs/02-folder-structure.md).
import { lazy } from "react";

export const Home = lazy(() => import("@/pages/1.home/home"));
export const Legal = lazy(() => import("@/pages/2.legal/legal"));
export const DeleteAccount = lazy(() => import("@/pages/3.delete-account/delete-account"));
export const Brand = lazy(() => import("@/pages/4.brand/brand"));
export const NotFound = lazy(() => import("@/pages/not-found"));
