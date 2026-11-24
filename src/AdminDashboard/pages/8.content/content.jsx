/* App Content */
import { useState } from "react";

import PageHeader from "../../components/PageHeader";
import Tabs from "../../components/Tabs";
import Currencies from "./sections/Currencies";
import Nudges from "./sections/Nudges";
import ZoneTemplates from "./sections/ZoneTemplates";

// What the app shows that is not a recipe: health nudges, the zones a new
// household starts with, and the exchange rates behind the converter.
export default function Content() {
  const [tab, setTab] = useState("nudges");
  return (
    <>
      <PageHeader title="Nudges, zones and rates" body="Everything the app shows that is not a recipe. Changes reach households without an app update." />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "nudges", label: "Health nudges" },
          { id: "zones", label: "Starting zones" },
          { id: "rates", label: "Exchange rates" },
        ]}
      />
      {tab === "nudges" && <Nudges />}
      {tab === "zones" && <ZoneTemplates />}
      {tab === "rates" && <Currencies />}
    </>
  );
}
