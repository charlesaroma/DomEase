/* Insights */
import { useHousehold } from "@/store/queries/app";

import PremiumLock from "../../components/PremiumLock";
import Screen from "../../components/Screen";
import { useTabs } from "../../components/Tabs";

import Budget from "./sections/Budget";
import Trends from "./sections/Trends";

const TABS = [
  { id: "budget", label: "Budget" },
  { id: "trends", label: "Eating trends" },
];

/**
 * Premium's view of the home over time: the food budget against what each
 * market trip really cost, and what the family eats most.
 */
export default function Insights() {
  const { data: household } = useHousehold();
  const premium = household?.tier === "premium";
  const [tab, bar] = useTabs(TABS);

  return (
    <Screen eyebrow="Premium" title="Insights">
      {bar}
      <PremiumLock
        locked={!premium}
        title={tab === "budget" ? "Budget insights come with Premium" : "Eating trends come with Premium"}
        body={tab === "budget" ? "Set a monthly food budget and see what every market trip really cost." : "See what your home eats most and how varied each week is."}
      >
        {tab === "budget" ? <Budget currency={household?.currency ?? "UGX"} /> : <Trends />}
      </PremiumLock>
    </Screen>
  );
}
