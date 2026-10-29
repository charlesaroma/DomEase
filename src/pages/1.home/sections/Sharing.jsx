/* Sharing */
import Reveal from "@/components/motion/Reveal";
import CleanScreen from "@/components/product/CleanScreen";
import PhoneFrame from "@/components/product/PhoneFrame";
import ShopScreen from "@/components/product/ShopScreen";
import AppIcon from "@/components/ui/AppIcon";
import SectionHeading from "@/components/ui/SectionHeading";
import pages from "@/data/pages.json";

const copy = pages.home.sharing;

// The dark band: the only large area of colour on the page, the brand's own dark step.
export default function Sharing() {
  return (
    <section id="clean-together" className="overflow-hidden bg-clay-900 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 py-24 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionHeading tone="dark" eyebrow={copy.eyebrow} title={copy.title} body={copy.body} />
          <ul className="mt-10 space-y-4">
            {copy.points.map((point) => (
              <li key={point.text} className="flex items-center gap-3.5 text-lg">
                <AppIcon name={point.icon} className="size-5 text-clay-400" />
                {point.text}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-clay-200/80">{copy.note}</p>
        </div>

        <div className="relative flex justify-center gap-6 lg:justify-end">
          <Reveal>
            <PhoneFrame tone="dark">
              <CleanScreen tone="dark" />
            </PhoneFrame>
          </Reveal>
          <Reveal delay={150} className="hidden pt-16 sm:block">
            <PhoneFrame tone="dark">
              <ShopScreen tone="dark" />
            </PhoneFrame>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
