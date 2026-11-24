/* Ads */
import { useSearchParams } from "react-router-dom";

import PageHeader from "../../components/PageHeader";
import Tabs from "../../components/Tabs";
import Performance from "./sections/Performance";
import Placements from "./sections/Placements";
import Sponsored from "./sections/Sponsored";

const TABS = [
  { id: "placements", label: "Placements" },
  { id: "performance", label: "Performance" },
  { id: "sponsored", label: "Sponsored" },
];

/**
 * Advertising for free households. The apps show Google AdMob ads (the web
 * app, AdSense) in the places set here, or a sponsored product from a brand
 * DomEase deals with directly. Premium households never see ads.
 */
export default function Ads() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get("tab")) ? params.get("tab") : "placements";

  return (
    <>
      <PageHeader title="Ads" body="Where ads appear for free households, what they earn, and products sponsored by brands directly." />
      <Tabs tabs={TABS} value={tab} onChange={(id) => setParams({ tab: id }, { replace: true })} />
      {tab === "placements" && <Placements />}
      {tab === "performance" && <Performance />}
      {tab === "sponsored" && <Sponsored />}
    </>
  );
}
