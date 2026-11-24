/* Brand Kit */
import { useState } from "react";
import { RotateCcw } from "lucide-react";

import AnimatedLogo from "@/components/brand/AnimatedLogo";
import SectionHeading from "@/components/ui/SectionHeading";
import kit from "@/data/brandKit.json";
import useSeo from "@/seo/useSeo";
import { cn } from "@/utils/cn";

// A review page for the client and the team (not linked, not indexed): every
// logo state, every share card and every icon, at their real sizes.
export default function Brand() {
  useSeo({ title: "Brand kit | DomEase", description: "DomEase logo motion, share cards and icons." });
  return (
    <div className="mx-auto max-w-7xl px-5 py-14 sm:py-20 lg:px-8">
      <SectionHeading
        eyebrow="Brand kit"
        title="The logo in motion, share cards and icons"
        body="Everything here is live: the logos below are the same component the site uses. Press Replay to watch a state again, and hover the navigation logo to see the tulip nod."
      />
      <Motion />
      <Cards />
      <Icons />
      <Splash />
    </div>
  );
}

function Stage({ title, note, tone = "light", children, onReplay }) {
  return (
    <figure className={cn("flex flex-col overflow-hidden rounded-r-card border", tone === "dark" ? "border-clay-900 bg-clay-900" : "border-line bg-white")}>
      <div className="grid min-h-64 flex-1 place-items-center p-8">{children}</div>
      <figcaption className={cn("flex items-start justify-between gap-4 border-t px-5 py-4", tone === "dark" ? "border-clay-800 text-white" : "border-line")}>
        <div>
          <p className="font-display font-semibold">{title}</p>
          <p className={cn("mt-1 text-sm leading-relaxed", tone === "dark" ? "text-clay-200" : "text-ink-2")}>{note}</p>
        </div>
        {onReplay && (
          <button
            type="button"
            onClick={onReplay}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-r-pill border px-3 py-1.5 text-sm font-medium",
              tone === "dark" ? "border-clay-400 text-clay-200 hover:bg-clay-800" : "border-line-2 text-ink hover:border-clay-700 hover:text-clay-700",
            )}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" /> Replay
          </button>
        )}
      </figcaption>
    </figure>
  );
}

function Motion() {
  const [run, setRun] = useState({ stacked: 0, compact: 0, dark: 0 });
  const replay = (k) => () => setRun((r) => ({ ...r, [k]: r[k] + 1 }));
  return (
    <section className="mt-14">
      <h2 className="text-2xl font-bold sm:text-3xl">Logo motion</h2>
      <p className="mt-2 max-w-2xl text-ink-2">
        The house goes up, the plant grows from the ground, the leaves open and the tulip blooms; then the name settles in. About three seconds,
        played once. People who turn on reduced motion see the finished logo straight away.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Stage title="Intro, stacked" note="App launch, the brand page and presentations." onReplay={replay("stacked")}>
          <AnimatedLogo key={run.stacked} layout="stacked" state="draw" className="h-56 w-auto max-w-full" />
        </Stage>
        <Stage title="Intro, compact" note="The site header, once per visit." onReplay={replay("compact")}>
          <AnimatedLogo key={run.compact} layout="compact" state="draw" hover className="h-16 w-auto max-w-full" />
        </Stage>
        <Stage title="Intro on clay" note="The reversed colours, for the splash and dark bands." tone="dark" onReplay={replay("dark")}>
          <AnimatedLogo key={run.dark} layout="stacked" tone="dark" state="draw" className="h-56 w-auto max-w-full" />
        </Stage>
        <Stage title="Loading" note="Waits longer than a moment: the mark draws and fades on a loop.">
          <AnimatedLogo layout="mark" state="loading" title="Loading" className="h-24 w-auto" />
        </Stage>
        <Stage title="Hover and focus" note="Point at it, or tab to it: the tulip nods and the plant sways.">
          <a href="#hover" className="rounded-lg p-2 focus-visible:outline-2 focus-visible:outline-clay-700" onClick={(e) => e.preventDefault()}>
            <AnimatedLogo layout="compact" hover className="h-16 w-auto max-w-full" />
          </a>
        </Stage>
        <Stage title="Still" note="Reduced motion, print and anywhere motion would distract.">
          <AnimatedLogo layout="compact" className="h-16 w-auto max-w-full" />
        </Stage>
      </div>
    </section>
  );
}

function Cards() {
  return (
    <section className="mt-20">
      <h2 className="text-2xl font-bold sm:text-3xl">Link share cards</h2>
      <p className="mt-2 max-w-2xl text-ink-2">
        What WhatsApp, Facebook, LinkedIn and X show when someone shares a DomEase link, at 1200 by 630. Each page has its own. The logo and title
        sit in the middle, because WhatsApp crops small previews to a square from the centre.
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {kit.cards.map((c) => (
          <figure key={c.file}>
            <img src={c.file} alt={`Share card: ${c.label}`} width="1200" height="630" loading="lazy" className="w-full rounded-r-card border border-line" />
            <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-display font-semibold">{c.label}</span>
              <span className="font-mono text-ink-2">domease.app{c.path === "/" ? "" : c.path}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <WhatsApp card={kit.cards[0]} />
        <WhatsApp card={kit.cards[2]} square />
      </div>
    </section>
  );
}

// How the home card looks in a WhatsApp chat: large, or as the small square.
function WhatsApp({ card, square }) {
  return (
    <figure className="rounded-r-card bg-paper-2 p-4">
      <div className="ml-auto max-w-80 rounded-xl bg-sage-100 p-1.5 shadow-sm">
        <div className={cn("overflow-hidden rounded-lg bg-white/70", square && "flex items-center gap-3 p-1.5")}>
          <img
            src={card.file}
            alt=""
            className={square ? "size-16 shrink-0 rounded-md object-cover" : "aspect-[1200/630] w-full object-cover"}
          />
          <div className={square ? "min-w-0 py-1" : "px-2.5 py-2"}>
            <p className="truncate text-[13px] font-semibold text-ink">{card.label === "Home" ? "DomEase | Homelife, eased." : `${card.label} | DomEase`}</p>
            <p className="truncate text-xs text-ink-2">domease.app</p>
          </div>
        </div>
        <p className="px-1.5 pt-1.5 text-[13px] text-clay-900 underline">domease.app{card.path === "/" ? "" : card.path}</p>
      </div>
      <figcaption className="mt-3 text-sm text-ink-2">{square ? "WhatsApp, small preview (centre square)" : "WhatsApp, large preview"}</figcaption>
    </figure>
  );
}

function Icons() {
  return (
    <section className="mt-20">
      <h2 className="text-2xl font-bold sm:text-3xl">Icons</h2>
      <p className="mt-2 max-w-2xl text-ink-2">
        Shown at their real size. Below 48 pixels the mark uses a simplified cut, without the veins and the smallest leaves, so the house and
        tulip still read in a browser tab.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kit.icons.map((i) => (
          <figure key={i.file} className="flex flex-col rounded-r-card border border-line bg-white">
            <div className="grid h-52 place-items-center p-6">
              <div className="relative">
                <img
                  src={i.file}
                  alt={i.label}
                  width={Math.min(i.size, 128)}
                  height={Math.min(i.size, 128)}
                  className={cn(i.mono && "rounded-xl bg-clay-700 p-2", i.maskable && "rounded-full")}
                  style={{ imageRendering: i.size <= 32 ? "pixelated" : "auto" }}
                />
              </div>
            </div>
            <figcaption className="border-t border-line px-4 py-3 text-sm">
              <p className="font-display font-semibold">
                {i.label} <span className="font-mono font-normal text-ink-2">{i.size}px</span>
              </p>
              <p className="mt-0.5 text-ink-2">{i.note}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Splash() {
  return (
    <section className="mt-20">
      <h2 className="text-2xl font-bold sm:text-3xl">Launch screens</h2>
      <p className="mt-2 max-w-2xl text-ink-2">
        When DomEase is added to an iPhone or iPad home screen, these show while it opens, sized for each device. Android builds its own from the
        icon and the paper background in the web manifest.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
        {kit.splash.map((s) => (
          <figure key={s.file}>
            <img src={s.file} alt={`Launch screen: ${s.label}`} loading="lazy" className="w-full rounded-2xl border border-line" />
            <figcaption className="mt-2 text-sm text-ink-2">{s.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
