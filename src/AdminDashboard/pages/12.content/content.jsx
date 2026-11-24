/* App Content */
import { useSearchParams } from "react-router-dom";

import PageHeader from "../../components/PageHeader";
import Tabs from "../../components/Tabs";
import Currencies from "./sections/Currencies";
import Faqs from "./sections/Faqs";
import Nudges from "./sections/Nudges";
import Occasions from "./sections/Occasions";
import PremiumFeatures from "./sections/PremiumFeatures";
import ZonePresets from "./sections/ZonePresets";
import ZoneTemplates from "./sections/ZoneTemplates";

const TABS = [
  { id: "nudges", label: "Health nudges" },
  { id: "zones", label: "Starting zones" },
  { id: "presets", label: "Ready made zones" },
  { id: "occasions", label: "Occasions" },
  { id: "premium", label: "Premium list" },
  { id: "faqs", label: "Help questions" },
  { id: "rates", label: "Exchange rates" },
];

// What the app shows that is not a recipe or a price. Each tab replaces
// something that used to be written into the app.
export default function Content() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "nudges";
  return (
    <>
      <PageHeader title="App content" body="Everything else households read in the app. Changes reach them without an app update." />
      <Tabs tabs={TABS} value={tab} onChange={(id) => setParams({ tab: id }, { replace: true })} />
      {tab === "nudges" && <Nudges />}
      {tab === "zones" && <ZoneTemplates />}
      {tab === "presets" && <ZonePresets />}
      {tab === "occasions" && <Occasions />}
      {tab === "premium" && <PremiumFeatures />}
      {tab === "faqs" && <Faqs />}
      {tab === "rates" && <Currencies />}
    </>
  );
}
