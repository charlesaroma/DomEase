/* Bar Chart */
import { useId, useState } from "react";

/**
 * One measure over time as thin bars: earnings a day, sign ups a day. One
 * series, so no legend (the panel title names it); a hover tooltip on every
 * bar with a hit area taller than the bar; recessive grid lines; and the same
 * figures as a table for screen readers.
 *
 *   data    [{ key, label, value }]   label is the x value as read aloud ("12 Nov")
 *   format  (value) => string
 */
export default function BarChart({ data, format = String, height = 180, title }) {
  const id = useId();
  const [hover, setHover] = useState(null);
  const W = 640;
  const H = height;
  const pad = { top: 12, bottom: 22, left: 4, right: 4 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = (W - pad.left - pad.right) / Math.max(1, data.length);
  const bar = Math.max(2, step - 2); // a 2px surface gap between bars
  const y = (v) => pad.top + (H - pad.top - pad.bottom) * (1 - v / max);
  const ticks = [0.5, 1].map((f) => max * f);
  const shown = hover == null ? null : data[hover];
  // Label the first, middle and last day only: enough to read the range.
  const labelled = new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]);

  return (
    <figure className="relative" aria-labelledby={title ? `${id}-t` : undefined}>
      {title && (
        <figcaption id={`${id}-t`} className="sr-only">
          {title}
        </figcaption>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" role="img" aria-hidden="true" onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <line key={t} x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeDasharray="2 4" strokeWidth="1" />
        ))}
        <line x1={pad.left} x2={W - pad.right} y1={H - pad.bottom} y2={H - pad.bottom} stroke="var(--color-line-2)" strokeWidth="1" />
        {data.map((d, i) => {
          const x = pad.left + i * step + 1;
          const top = y(d.value);
          const h = Math.max(0, H - pad.bottom - top);
          const r = Math.min(4, bar / 2, h);
          return (
            <g key={d.key}>
              {h > 0 && (
                <path
                  d={`M${x},${H - pad.bottom} V${top + r} Q${x},${top} ${x + r},${top} H${x + bar - r} Q${x + bar},${top} ${x + bar},${top + r} V${H - pad.bottom} Z`}
                  fill={hover === i ? "var(--color-clay-800)" : "var(--color-clay-700)"}
                />
              )}
              {labelled.has(i) && (
                <text x={x + bar / 2} y={H - 6} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} className="fill-ink-3 text-[11px]">
                  {d.label}
                </text>
              )}
              {/* Hit area: the whole column, not just the bar */}
              <rect x={pad.left + i * step} y={pad.top} width={step} height={H - pad.top - pad.bottom} fill="transparent" onMouseEnter={() => setHover(i)} />
            </g>
          );
        })}
        {/* Grid values last, haloed, so a tall bar never hides them */}
        {ticks.map((t) => (
          <text key={t} x={pad.left + 4} y={y(t) - 4} stroke="white" strokeWidth="3" paintOrder="stroke" className="pointer-events-none fill-ink-2 text-[11px]">
            {format(t)}
          </text>
        ))}
      </svg>
      {shown && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-r-sm bg-ink px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-sh-2"
          style={{ left: `${((pad.left + hover * step + step / 2) / W) * 100}%` }}
        >
          <span className="text-white/70">{shown.label}</span> <span className="font-semibold">{format(shown.value)}</span>
        </div>
      )}
      {/* A table ignores the 1px box sr-only gives it, so the wrapper hides it instead. */}
      <div className="sr-only">
        <table>
          <caption>{title}</caption>
          <tbody>
            {data.map((d) => (
              <tr key={d.key}>
                <th scope="row">{d.label}</th>
                <td>{format(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
