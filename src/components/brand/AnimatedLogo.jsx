/* Animated Logo */
import { useEffect, useState } from "react";

import { MARK, LAYOUTS } from "./logoArt";
import { LOOP_MS, timing } from "./logoMotion";
import "./animatedLogo.css";

// The colourways, as in docs/04-design-system.md. "dark" is the reversed set for
// the clay band, the footer and dark screens.
const TONES = {
  light: { house: "#874628", stem: "#53815F", leaf: "#53815F", vein: "#53815F", flower: "#A85E3D", word: "#2D2520", tag: "#635953" },
  dark: { house: "#EEC6B5", stem: "#8CB496", leaf: "#8CB496", vein: "#8CB496", flower: "#D99679", word: "#FFFFFF", tag: "#EEC6B5" },
};

/**
 * The house in bloom, drawn live from the approved artwork so it can move.
 *
 * state:
 *  "draw"     the house is drawn, the plant grows, the tulip opens, then the name settles in (once)
 *  "loading"  the mark draws and fades on a loop, for waits longer than a moment
 *  "idle"     still; with `hover`, the tulip nods and the leaves sway on hover or focus
 *
 * Pass title="" when the logo is decorative (the words next to it already say
 * DomEase); it is then hidden from screen readers.
 *
 * Everything stops for people who ask their device for reduced motion: the
 * finished logo shows at once. Replay "draw" by changing the component's key.
 */
export default function AnimatedLogo({ layout = "compact", tone = "light", state = "idle", hover = false, title = "DomEase", className }) {
  // Loading restarts the drawing each cycle by giving the drawing a new key.
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    if (state !== "loading") return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const id = setInterval(() => setCycle((c) => c + 1), LOOP_MS);
    return () => clearInterval(id);
  }, [state]);

  const art = LAYOUTS[layout];
  const colours = TONES[tone];
  const word = art.word.map((w, i) => ({ ...w, fill: i === 0 ? colours.word : colours.tag }));

  const line = (l, i) => {
    const { delay, duration } = timing(l.part, i, state);
    return (
      <path
        key={i}
        d={l.d}
        pathLength="1"
        className="de-line"
        fill="none"
        stroke={colours[l.part]}
        strokeWidth={l.w}
        strokeLinecap={l.part === "house" ? "butt" : "round"}
        strokeLinejoin={l.part === "house" ? "miter" : "round"}
        style={{ "--d": `${delay}s`, "--t": `${duration}s` }}
      />
    );
  };

  // Grouped so the hover can move the plant and the tulip on their own.
  const indexed = MARK.map((l, i) => [l, i]);
  const house = indexed.filter(([l]) => l.part === "house");
  const plant = indexed.filter(([l]) => l.part !== "house" && l.part !== "flower");
  const flower = indexed.filter(([l]) => l.part === "flower");

  return (
    <svg
      key={cycle}
      viewBox={art.viewBox}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={["de-logo", hover && "de-logo-hover", className].filter(Boolean).join(" ")}
      data-state={state}
      data-layout={layout}
    >
      <g transform={art.markTransform}>
        <g className="de-house">{house.map(([l, i]) => line(l, i))}</g>
        <g className="de-plant">
          {plant.map(([l, i]) => line(l, i))}
          <g className="de-flower">{flower.map(([l, i]) => line(l, i))}</g>
        </g>
      </g>
      {word.map((w, i) => (
        <path key={`w${i}`} d={w.d} fill={w.fill} className={i === 0 ? "de-word" : "de-tag"} />
      ))}
    </svg>
  );
}
