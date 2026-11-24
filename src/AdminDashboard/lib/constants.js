/* Admin Constants */
import {
  Banknote,
  BookOpen,
  HandHeart,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Settings,
  House,
  ShieldCheck,
} from "lucide-react";

/**
 * The sidebar, in groups. Page folders follow this order, after 1.auth.
 * `perm` is the module the role must hold (store/context/AdminAuthContext.jsx);
 * `badge` names a figure from the Overview shown beside the link.
 */
export const ADMIN_NAV = [
  {
    id: "main",
    items: [{ to: "/admin", label: "Overview", icon: LayoutDashboard, perm: "overview", end: true }],
  },
  {
    id: "content",
    label: "Recipes",
    items: [
      { to: "/admin/suggestions", label: "Suggestions", icon: Inbox, perm: "suggestions", badge: "pendingSuggestions" },
      { to: "/admin/recipes", label: "Recipe library", icon: BookOpen, perm: "recipes" },
    ],
  },
  {
    id: "people",
    label: "Households",
    items: [
      { to: "/admin/households", label: "Households", icon: House, perm: "households" },
      { to: "/admin/subscriptions", label: "Subscriptions", icon: Banknote, perm: "subscriptions", badge: "pastDue" },
    ],
  },
  {
    id: "app",
    label: "The app",
    items: [
      { to: "/admin/house-help", label: "House Help", icon: HandHeart, perm: "house-help" },
      { to: "/admin/content", label: "Nudges, zones and rates", icon: Megaphone, perm: "content" },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    items: [
      { to: "/admin/team", label: "Team", icon: ShieldCheck, perm: "team" },
      { to: "/admin/settings", label: "Settings", icon: Settings, perm: "settings" },
    ],
  },
];

export const MEAL_TYPES = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snack", label: "Snack" },
  { id: "pastry", label: "Pastry" },
];
export const AGE_GROUPS = [
  { id: "kids", label: "Kids" },
  { id: "adults", label: "Adults" },
  { id: "elderly", label: "Elders" },
];
export const DIETARY = [
  { id: "diabetic", label: "Diabetic friendly" },
  { id: "pcos", label: "PCOS friendly" },
];
export const OCCASIONS = [
  { id: "birthday", label: "Birthday" },
  { id: "christmas", label: "Christmas" },
  { id: "easter", label: "Easter" },
  { id: "eid", label: "Eid" },
];
export const HOUSEHOLD_TYPES = { family: "Family", couple: "Couple", bachelor: "Bachelor", single_parent: "Single parent" };
export const ROLES = { owner: "Owner", admin: "Admin", moderator: "Moderator" };

