/* Formatting */
const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const DATE_TIME = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export const date = (iso) => (iso ? DATE.format(new Date(iso)) : "Never");
export const dateTime = (iso) => (iso ? DATE_TIME.format(new Date(iso)) : "Never");

/** "3 hours ago", "2 days ago". */
export function ago(iso) {
  if (!iso) return "Never";
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** Shillings: "UGX 46,500". */
export const money = (n, currency = "UGX") => (n == null ? "Not set" : `${currency} ${Math.round(n).toLocaleString("en-GB")}`);

export const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;
