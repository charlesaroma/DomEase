/* House Help */
import { useState } from "react";

import PageHeader from "../../components/PageHeader";
import Tabs from "../../components/Tabs";
import Guides from "./sections/Guides";
import Questionnaire from "./sections/Questionnaire";

// The Premium House Help module: the vetting questionnaire and four guides (PRD 12).
export default function HouseHelp() {
  const [tab, setTab] = useState("questions");
  return (
    <>
      <PageHeader title="House Help" body="The vetting questionnaire households use to compare candidates, and the guides that come with it." />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "questions", label: "Vetting questionnaire" },
          { id: "guides", label: "Guides" },
        ]}
      />
      {tab === "questions" ? <Questionnaire /> : <Guides />}
    </>
  );
}
