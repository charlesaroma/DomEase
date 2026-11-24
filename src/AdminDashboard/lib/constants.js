/* Admin Constants */
import {
  Banknote,
  BookOpen,
  FileText,
  HandHeart,
  History,
  House,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  MonitorPlay,
  ReceiptText,
  Settings,
  ShieldCheck,
  Tags,
  UsersRound,
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
    id: "recipes",
    label: "Recipes",
    items: [
      { to: "/admin/suggestions", label: "Suggestions", icon: Inbox, perm: "suggestions", badge: "pendingSuggestions" },
      { to: "/admin/recipes", label: "Recipe library", icon: BookOpen, perm: "recipes" },
    ],
  },
  {
    id: "people",
    label: "People",
    items: [
      { to: "/admin/users", label: "Users", icon: UsersRound, perm: "users" },
      { to: "/admin/households", label: "Households", icon: House, perm: "households" },
    ],
  },
  {
    id: "money",
    label: "Money",
    items: [
      { to: "/admin/subscriptions", label: "Subscriptions", icon: Banknote, perm: "subscriptions", badge: "pastDue" },
      { to: "/admin/transactions", label: "Transactions", icon: ReceiptText, perm: "transactions", badge: "failedPayments" },
      { to: "/admin/ads", label: "Ads", icon: MonitorPlay, perm: "ads" },
    ],
  },
  {
    id: "app",
    label: "The app",
    items: [
      { to: "/admin/prices", label: "Market prices", icon: Tags, perm: "prices" },
      { to: "/admin/house-help", label: "House Help", icon: HandHeart, perm: "house-help" },
      { to: "/admin/content", label: "App content", icon: Megaphone, perm: "content" },
      { to: "/admin/legal", label: "Legal pages", icon: FileText, perm: "legal" },
    ],
  },
  {
    id: "support",
    label: "Support",
    items: [{ to: "/admin/inbox", label: "Inbox", icon: LifeBuoy, perm: "inbox", badge: "openReports" }],
  },
  {
    id: "admin",
    label: "Admin",
    items: [
      { to: "/admin/team", label: "Team", icon: ShieldCheck, perm: "team" },
      { to: "/admin/activity", label: "Activity log", icon: History, perm: "activity" },
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
export const RECIPE_STATUS = {
  published: { label: "Live", tone: "good" },
  draft: { label: "Draft", tone: "quiet" },
  archived: { label: "Archived", tone: "warn" },
};
export const PROVIDERS = { mtn: "MTN Mobile Money", airtel: "Airtel Money" };
export const SIGN_IN = { google: "Google", apple: "Apple", email: "Email", phone: "Phone" };

