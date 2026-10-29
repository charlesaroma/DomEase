/* Site Pages: the lazy barrel */
// Each page is its own chunk. Folders are numbered in nav order (docs/02-folder-structure.md).
import { lazy } from "react";

export const Home = lazy(() => import("@/pages/1.home/home"));
export const NotFound = lazy(() => import("@/pages/not-found"));
