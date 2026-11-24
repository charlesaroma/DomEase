/* Household Choices */
// Every question about the home, in the order onboarding asks it. The same
// choices as the app's ui/core/ui/household_choices.dart.

export const WHO = [
  { id: "bachelor", emoji: "🧍", label: "Just me" },
  { id: "couple", emoji: "💑", label: "A couple" },
  { id: "family", emoji: "👨‍👩‍👧", label: "A family" },
  { id: "single_parent", emoji: "🤱", label: "A single parent and children" },
];

export const MOODS = [
  { id: "on_top", emoji: "🔥", label: "I'm on top of it, I want fresh ideas" },
  { id: "samey", emoji: "🙂", label: "It's fine, but a bit samey" },
  { id: "rut", emoji: "😐", label: "I'm stuck in a rut" },
  { id: "chore", emoji: "😩", label: "Honestly, it feels like a chore" },
  { id: "behind", emoji: "🙃", label: "I'm barely keeping up" },
];

export const GOALS = [
  { id: "plan_ahead", emoji: "📋", label: "Meals planned ahead" },
  { id: "share_cleaning", emoji: "🧹", label: "Cleaning shared fairly" },
  { id: "one_list", emoji: "🛒", label: "One shopping list for everyone" },
  { id: "spend_less", emoji: "💸", label: "Spending less at the market" },
  { id: "less_waste", emoji: "♻️", label: "Less food wasted" },
  { id: "healthier", emoji: "💚", label: "Healthier food" },
];

export const MEALS = [
  { id: "breakfast", emoji: "🥣", label: "Breakfasts before the school run" },
  { id: "lunch", emoji: "🍛", label: "Lunches" },
  { id: "dinner", emoji: "🍲", label: "Weeknight dinners" },
  { id: "snack", emoji: "🥭", label: "School snacks and packed lunches" },
  { id: "pastry", emoji: "🥐", label: "Baking and pastries" },
];

export const CURRENCIES = [
  { id: "UGX", emoji: "🇺🇬", label: "Uganda · Shillings" },
  { id: "KES", emoji: "🇰🇪", label: "Kenya · Shillings" },
  { id: "TZS", emoji: "🇹🇿", label: "Tanzania · Shillings" },
  { id: "GHS", emoji: "🇬🇭", label: "Ghana · Cedi" },
  { id: "NGN", emoji: "🇳🇬", label: "Nigeria · Naira" },
  { id: "ZAR", emoji: "🇿🇦", label: "South Africa · Rand" },
  { id: "USD", emoji: "🇺🇸", label: "United States · Dollar" },
  { id: "GBP", emoji: "🇬🇧", label: "United Kingdom · Pound" },
  { id: "EUR", emoji: "🇪🇺", label: "Europe · Euro" },
  { id: "INR", emoji: "🇮🇳", label: "India · Rupee" },
  { id: "CAD", emoji: "🇨🇦", label: "Canada · Dollar" },
  { id: "AUD", emoji: "🇦🇺", label: "Australia · Dollar" },
];

export const DIETS = [
  { id: "none", emoji: "🍽️", label: "No, we eat everything" },
  { id: "veg", emoji: "🥬", label: "More vegetables, less meat" },
  { id: "diabetic", emoji: "🩺", label: "Diabetic friendly ideas", premium: true },
  { id: "pcos", emoji: "🌸", label: "PCOS friendly ideas", premium: true },
];

export const HOUSEHOLD_LABEL = { bachelor: "Just me", couple: "Couple", family: "Family", single_parent: "Single parent" };
export const MEAL_LABEL = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack", pastry: "Pastry" };
export const FREQ_LABEL = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" };

/** "UGX 46,500" in the household's currency, no decimals for shillings. */
export function money(amount, currency = "UGX") {
  if (amount == null) return "Not priced";
  const digits = ["UGX", "KES", "TZS", "NGN", "INR"].includes(currency) ? 0 : 2;
  return `${currency} ${Number(amount).toLocaleString("en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}
