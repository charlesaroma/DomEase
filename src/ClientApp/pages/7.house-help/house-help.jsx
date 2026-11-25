/* House Help */
import { useHousehold } from "@/store/queries/app";

import PremiumLock from "../../components/PremiumLock";
import Screen from "../../components/Screen";
import { useTabs } from "../../components/Tabs";

import Guides from "./sections/Guides";
import Payroll from "./sections/Payroll";
import Vetting from "./sections/Vetting";

const TABS = [
  { id: "vet", label: "Vet" },
  { id: "pay", label: "Pay" },
  { id: "guides", label: "Guides" },
];

const LOCK = {
  vet: ["House Help comes with Premium", "Vet a candidate with eleven careful questions, and read the four guides."],
  pay: ["House help pay comes with Premium", "Salary, advances and days off in one record, with a payslip to send on WhatsApp."],
  guides: ["The guides come with Premium", "Hiring, paying and working well together, in plain words."],
};

/**
 * Help at home, with care (PRD 12): vet a candidate, keep a fair record of
 * pay and days off, and read the guides. Premium.
 */
export default function HouseHelp() {
  const { data: household } = useHousehold();
  const premium = household?.tier === "premium";
  const [tab, bar] = useTabs(TABS);
  const [title, body] = LOCK[tab];

  return (
    <Screen eyebrow="Premium" title="House Help">
      {bar}
      <PremiumLock locked={!premium} title={title} body={body}>
        {tab === "vet" && <Vetting />}
        {tab === "pay" && <Payroll household={household} />}
        {tab === "guides" && <Guides />}
      </PremiumLock>
    </Screen>
  );
}
