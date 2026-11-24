/* Ad Slot */
import { useEffect, useRef } from "react";

import Media from "@/components/ui/Media";
import { DEMO } from "@/store/services/mode";
import { sendApi } from "@/store/services/app";
import { useAppSettings, useHousehold } from "@/store/queries/app";

// The AdSense publisher id for the web app (ca-pub-…). Without it, live builds
// show nothing; demo builds show where the ad would sit.
const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT ?? "";

/**
 * One place an ad may appear, set up in the admin (Ads → Placements). Never
 * for Premium households. A running sponsored product for this screen comes
 * first; otherwise the placement's AdSense unit, inside the page, never over
 * it (PRD FR-AD-2).
 */
export default function AdSlot({ screen, items = [] }) {
  const { data: household } = useHousehold();
  const { data: settings } = useAppSettings();
  if (!household || household.tier === "premium" || !settings) return null;
  const place = settings.ads?.find((p) => p.id === screen);
  if (!place?.enabled) return null;

  const names = items.map((i) => i.toLowerCase());
  const deal = settings.sponsored?.find((s) => s.screens.includes(screen) && (!s.matchItems?.length || s.matchItems.some((m) => names.some((n) => n.includes(m)))));
  if (deal) return <Sponsored deal={deal} />;
  if (ADSENSE_CLIENT && place.adsenseSlot) return <AdSense slot={place.adsenseSlot} format={place.format} />;
  if (DEMO)
    return (
      <div className="grid h-20 place-items-center rounded-r-card border border-dashed border-line-2 text-xs tracking-wide text-ink-3 uppercase" aria-hidden="true">
        Ad · {place.label}
      </div>
    );
  return null;
}

function Sponsored({ deal }) {
  const seen = useRef(false);
  useEffect(() => {
    if (seen.current) return;
    seen.current = true;
    sendApi.adEvent(deal.id, "view");
  }, [deal.id]);
  return (
    <a
      href={deal.link}
      target="_blank"
      rel="noopener sponsored"
      onClick={() => sendApi.adEvent(deal.id, "tap")}
      className="block rounded-r-card border border-line bg-white p-3 hover:border-clay-400"
    >
      <p className="text-[11px] font-medium tracking-wide text-ink-3 uppercase">Sponsored · {deal.headline || deal.brand}</p>
      <div className="mt-2 flex items-center gap-3">
        <Media src={deal.image?.url} alt={deal.image?.alt ?? ""} className="size-14 shrink-0 rounded-r-sm" fallback={<div className="size-14 shrink-0 rounded-r-sm bg-paper-2" />} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{deal.product}</p>
          <p className="text-sm text-ink-2">{deal.brand}</p>
        </div>
        <span className="rounded-r-pill border border-clay-700 px-3 py-1 text-sm text-clay-700">View</span>
      </div>
    </a>
  );
}

/** Google AdSense, loaded once, only when a unit is actually shown. */
function AdSense({ slot, format }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!document.querySelector("script[data-adsense]")) {
      const s = document.createElement("script");
      s.async = true;
      s.dataset.adsense = "1";
      s.crossOrigin = "anonymous";
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
      document.head.appendChild(s);
    }
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* blocked by the browser: the slot stays empty */
    }
  }, []);
  return (
    <ins
      ref={ref}
      className="adsbygoogle block min-h-20 overflow-hidden rounded-r-card"
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format === "native" ? "fluid" : "auto"}
      data-full-width-responsive="true"
    />
  );
}
