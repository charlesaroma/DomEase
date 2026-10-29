/* Screen Tone */
// Class names for the app screens in day and evening. Written out in full so
// Tailwind finds every one (no class names built from pieces).
export default function screenTone(tone) {
  return tone === "dark"
    ? {
        card: "bg-night-card",
        line: "border-night-line",
        muted: "text-night-text/60",
        brand: "text-clay-400",
        brandBg: "bg-clay-400",
        onBrand: "text-night",
        track: "bg-night-line",
        tint: "bg-night-tint text-clay-400",
        sage: "text-sage-400",
        sagePill: "bg-sage-800/40 text-sage-200",
        amber: "border-amber-400 text-amber-400",
        dangerPill: "bg-danger/25 text-clay-200",
        tabBar: "bg-night-card/95 border-night-line",
        logo: "/logo/domease-logo-compact-reversed.svg",
      }
    : {
        card: "bg-white",
        line: "border-line",
        muted: "text-ink-2",
        brand: "text-clay-700",
        brandBg: "bg-clay-700",
        onBrand: "text-white",
        track: "bg-paper-2",
        tint: "bg-clay-100 text-clay-800",
        sage: "text-sage-700",
        sagePill: "bg-sage-100 text-sage-800",
        amber: "border-amber-700 text-amber-700",
        dangerPill: "bg-danger-100 text-danger",
        tabBar: "bg-white/95 border-line",
        logo: "/logo/domease-logo-compact.svg",
      };
}
