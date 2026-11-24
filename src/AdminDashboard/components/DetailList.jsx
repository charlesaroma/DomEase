/* Detail List */

/** Label and value pairs down a drawer: [["Plan", <Chip/>], ["Phone", "+256…"]]. */
export default function DetailList({ items }) {
  return (
    <dl className="divide-y divide-line text-[15px]">
      {items
        .filter(Boolean)
        .map(([k, v]) => (
          <div key={k} className="flex justify-between gap-6 py-3">
            <dt className="shrink-0 text-ink-2">{k}</dt>
            <dd className="min-w-0 text-right break-words">{v ?? "—"}</dd>
          </div>
        ))}
    </dl>
  );
}
