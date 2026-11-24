/* Demo Home */
// The signed-in household on demo data: its account, home, meal plan, zones
// and shopping ticks, saved in this browser apart from the admin's demo data.
// Content (recipes, prices, FAQs…) is read from the admin's demo database, so
// a change made in the admin shows in the web app at once, as it would live.

const KEY = "domease:app:demo:v1";
const blank = () => ({ accounts: [], session: null, homes: {} });

function load() {
  try {
    return { ...blank(), ...JSON.parse(localStorage.getItem(KEY) ?? "null") };
  } catch {
    return blank();
  }
}
let state = load();
const persist = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: lasts until the tab closes */
  }
};

export const home = {
  get: () => state,
  update(fn) {
    state = fn(structuredClone(state));
    persist();
    return state;
  },
  reset() {
    state = blank();
    persist();
  },
};
