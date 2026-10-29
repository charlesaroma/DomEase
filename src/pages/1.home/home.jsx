/* Home */
import pages from "@/data/pages.json";
import useSeo from "@/seo/useSeo";

import AtAGlance from "./sections/AtAGlance";
import BuiltHere from "./sections/BuiltHere";
import ClosingCta from "./sections/ClosingCta";
import Habits from "./sections/Habits";
import Hero from "./sections/Hero";
import HouseHelp from "./sections/HouseHelp";
import Pricing from "./sections/Pricing";
import Sharing from "./sections/Sharing";

// The landing page, in the order a visitor needs it: what it is, the facts,
// the three habits, sharing, the local fit, House Help, the price, the invitation.
export default function Home() {
  useSeo(pages.home.seo);
  return (
    <>
      <Hero />
      <AtAGlance />
      <Habits />
      <Sharing />
      <BuiltHere />
      <HouseHelp />
      <Pricing />
      <ClosingCta />
    </>
  );
}
