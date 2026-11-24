/* Data Table */
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/utils/cn";

/**
 * A searchable table. `columns`: { id, label, render(row), className }.
 * `search(row)` returns the text a query is matched against.
 */
export default function DataTable({ rows = [], columns, search, onRowClick, empty = "Nothing here yet.", toolbar, loading }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle && search ? rows.filter((r) => search(r).toLowerCase().includes(needle)) : rows;
  }, [rows, q, search]);

  return (
    <div className="rounded-r-card border border-line bg-white">
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
        {search && (
          <label className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              aria-label="Search"
              className="w-full rounded-r-pill border border-line bg-paper py-2 pr-4 pl-9 text-[15px] outline-none focus:border-clay-700"
            />
          </label>
        )}
        {toolbar}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[15px]">
          <thead>
            <tr className="border-b border-line text-xs tracking-wide text-ink-2 uppercase">
              {columns.map((c) => (
                <th key={c.id} className={cn("px-4 py-3 font-medium whitespace-nowrap", c.className)}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-ink-2">
                  Loading
                </td>
              </tr>
            )}
            {!loading && !shown.length && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-ink-2">
                  {q ? "No matches." : empty}
                </td>
              </tr>
            )}
            {shown.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn("border-b border-line last:border-0", onRowClick && "cursor-pointer hover:bg-paper")}
              >
                {columns.map((c) => (
                  <td key={c.id} className={cn("px-4 py-3 align-middle", c.className)}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-line px-4 py-3 text-sm text-ink-2">
        {shown.length} of {rows.length}
      </p>
    </div>
  );
}
