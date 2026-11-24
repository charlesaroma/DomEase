/* Logo motion: when each line of the mark is drawn, in seconds */
import { MARK } from "./logoArt";

// The story reads like the drawing: the house goes up, the plant grows from
// the ground, the leaves open, the tulip blooms last. Each line starts a moment
// after the one before, so nothing appears all at once.
const DRAW = {
  house: { start: 0, step: 0.22, duration: 0.7 },
  stem: { start: 0.55, step: 0.12, duration: 0.8 },
  leaf: { start: 0.95, step: 0.12, duration: 0.6 },
  vein: { start: 1.25, step: 0.12, duration: 0.35 },
  flower: { start: 1.7, step: 0.1, duration: 0.55 },
};

// Each line's place among the lines of its part (the third leaf, the second stem).
const ORDER = MARK.map((l, i) => MARK.slice(0, i).filter((m) => m.part === l.part).length);

export function timing(part, index, state) {
  const p = DRAW[part];
  // The side shoot (second stem) waits until the main stem has grown past it.
  const delay = p.start + p.step * ORDER[index] + (part === "stem" && ORDER[index] === 1 ? 0.3 : 0);
  // The loop tells the same story at double speed.
  return state === "loading" ? { delay: delay * 0.5, duration: p.duration * 0.5 } : { delay, duration: p.duration };
}

// When the name and tagline arrive after the mark (seconds), and the full length.
export const WORD_DELAY = 2.05;
export const DRAW_TOTAL = 2.9;

// One loading cycle in milliseconds; matches de-cycle in animatedLogo.css.
export const LOOP_MS = 2600;
