/* Data Table - TanStack Table v8 */
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, MoreHorizontal, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/utils/cn";

import { downloadCsv } from "../lib/csv";
import { useUrlFilters } from "../lib/useUrlFilters";

const PAGE_SIZES = [10, 25, 50, 100];
const SIZE_KEY = "domease:admin:rows";
const SEARCH = "__search";
const FACET = "__facet:";
const NONE = [];

function storedSize() {
  try {
    const n = Number(localStorage.getItem(SIZE_KEY));
    return PAGE_SIZES.includes(n) ? n : 25;
  } catch {
    return 25;
  }
}

// Empty values first, numbers by size, text with numbers read as numbers, ignoring case.
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
const blank = (v) => v === null || v === undefined || v === "";
function compare(a, b) {
  const x = typeof a === "boolean" ? Number(a) : a;
  const y = typeof b === "boolean" ? Number(b) : b;
  if (blank(x) || blank(y)) return blank(x) === blank(y) ? 0 : blank(x) ? -1 : 1;
  if (typeof x === "number" && typeof y === "number") return x - y;
  return collator.compare(String(x), String(y));
}

// Every word typed must appear somewhere in the row's search text.
const matches = (text, query) => {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = text.toLowerCase();
  return words.every((w) => hay.includes(w));
};

/** Page numbers to show: first, last, the current and its neighbours, with gaps as null. */
function pageList(index, count) {
  const keep = new Set([0, count - 1, index - 1, index, index + 1]);
  const pages = [...keep].filter((p) => p >= 0 && p < count).sort((a, b) => a - b);
  return pages.flatMap((p, i) => (i && p - pages[i - 1] > 1 ? [null, p] : [p]));
}

/**
 * The admin's one table: sorting, search, filters kept in the address, paging,
 * row selection with bulk actions, a row menu and CSV export. Below the md
 * breakpoint each row becomes a card, so nothing scrolls sideways on a phone.
 *
 * `columns` are TanStack ColumnDefs (pages keep them in sections/xColumns.jsx).
 * A column sorts when it has `accessorKey` or `accessorFn`. `meta`:
 *   className  extra classes on its cells, e.g. "font-mono"
 *   align      "right"
 *   card       false to leave it off the phone card; "title" to lead the card
 *
 * `filters`: [{ id, label, options: [{ value, label }], test(row, value) }]
 * `bulkActions(ids, clear)` renders buttons for the selected rows.
 * `rowActions(row)` returns [{ label, onClick, danger, hidden }].
 */
export default function DataTable({
  rows = NONE,
  columns = NONE,
  rowKey = (r) => r.id,
  search,
  searchLabel = "Search",
  filters = NONE,
  bulkActions,
  rowActions,
  onRowClick,
  exportName,
  exportRow,
  toolbar,
  primaryAction,
  loading = false,
  empty: emptyText = "Nothing here yet.",
  initialSort,
  rowLabel,
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState(() => (initialSort ? [{ id: initialSort.id, desc: !!initialSort.desc }] : []));
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState(() => ({ pageIndex: 0, pageSize: storedSize() }));
  const url = useUrlFilters(filters.map((f) => f.id));
  const topRef = useRef(null);

  const filterIds = filters.map((f) => f.id).join("|");
  const valueKey = JSON.stringify(url.values);
  const activeCount = filters.filter((f) => url.values[f.id]?.length).length;

  const columnFilters = useMemo(
    () => filters.map((f) => ({ id: FACET + f.id, value: url.values[f.id] ?? NONE })).filter((c) => c.value.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterIds, valueKey],
  );
  const columnVisibility = useMemo(
    () => Object.fromEntries([[SEARCH, false], ...filterIds.split("|").filter(Boolean).map((id) => [FACET + id, false])]),
    [filterIds],
  );

  const textOf = useCallback((row) => (search ? search(row) : Object.values(row).filter((v) => typeof v !== "object").join(" ")), [search]);

  const tableColumns = useMemo(() => {
    const cols = [];
    if (bulkActions) {
      cols.push({
        id: "__select",
        enableSorting: false,
        header: ({ table }) => (
          <input
            type="checkbox"
            className="size-4 accent-clay-700"
            aria-label="Select all on this page"
            checked={table.getIsAllPageRowsSelected()}
            ref={(el) => el && (el.indeterminate = table.getIsSomePageRowsSelected())}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="size-4 accent-clay-700"
            aria-label={rowLabel ? `Select ${rowLabel(row.original)}` : `Select row ${row.index + 1}`}
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        meta: { control: true, className: "w-10", card: false },
      });
    }
    cols.push(...columns);
    if (rowActions) {
      cols.push({
        id: "__actions",
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => <RowMenu actions={rowActions(row.original)?.filter((a) => !a.hidden) ?? NONE} />,
        meta: { control: true, align: "right", className: "w-12", card: false },
      });
    }
    cols.push({
      id: SEARCH,
      accessorFn: (row) => row,
      enableSorting: false,
      enableGlobalFilter: true,
      filterFn: (row, _id, value) => matches(textOf(row.original), value),
    });
    filters.forEach((f) =>
      cols.push({
        id: FACET + f.id,
        accessorFn: (row) => row,
        enableSorting: false,
        enableGlobalFilter: false,
        filterFn: (row, _id, values) => values.some((v) => f.test(row.original, v)),
      }),
    );
    return cols;
  }, [bulkActions, columns, rowActions, rowLabel, filters, textOf]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    defaultColumn: { sortingFn: (a, b, id) => compare(a.getValue(id), b.getValue(id)) },
    state: { sorting, globalFilter, rowSelection, pagination, columnFilters, columnVisibility },
    getRowId: (row) => String(rowKey(row)),
    enableRowSelection: Boolean(bulkActions),
    enableMultiSort: false,
    autoResetPageIndex: false,
    getColumnCanGlobalFilter: (column) => column.id === SEARCH,
    globalFilterFn: (row, _id, value) => matches(textOf(row.original), value),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onColumnFiltersChange: () => {},
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const filtered = table.getFilteredRowModel().rows;
  const pageRows = table.getRowModel().rows;
  const { pageIndex, pageSize } = pagination;
  const pageCount = table.getPageCount();

  // A new search, filter or sort starts again from page one.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setPagination((p) => (p.pageIndex ? { ...p, pageIndex: 0 } : p));
  }, [globalFilter, valueKey, sorting]);

  // The last row on a page was deleted: step back a page.
  useEffect(() => {
    if (!loading && pageIndex > 0 && pageIndex >= pageCount) setPagination((p) => ({ ...p, pageIndex: Math.max(0, pageCount - 1) }));
  }, [pageIndex, pageCount, loading]);

  // Rows that left the list, or no longer match, are no longer selected.
  useEffect(() => {
    if (loading) return;
    setRowSelection((prev) => {
      const ids = Object.keys(prev);
      if (!ids.length) return prev;
      const live = table.getFilteredRowModel().rowsById;
      const next = Object.fromEntries(ids.filter((id) => live[id]).map((id) => [id, true]));
      return Object.keys(next).length === ids.length ? prev : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, globalFilter, valueKey, loading]);

  const selectedIds = table.getFilteredSelectedRowModel().rows.map((r) => r.id);
  const clearSelection = useCallback(() => setRowSelection({}), []);

  const changeSize = (n) => {
    try {
      localStorage.setItem(SIZE_KEY, String(n));
    } catch {
      /* not remembered */
    }
    setPagination({ pageIndex: 0, pageSize: n });
  };
  const goTo = (index) => {
    table.setPageIndex(index);
    topRef.current?.scrollIntoView({ block: "nearest" });
  };
  const clearAll = () => {
    setGlobalFilter("");
    url.clear();
  };
  const handleExport = () => {
    const sorted = table.getSortedRowModel().rows;
    if (sorted.length) downloadCsv(exportName ?? "export", sorted.map((r) => exportRow(r.original)).filter(Boolean));
  };

  // A click opens the row, unless it landed on a control or the admin was selecting text.
  const rowClick = (row) => (e) => {
    const hit = e.target.closest("button,a,input,label,select,[role=menu]");
    if (hit && (e.currentTarget.contains(hit) || hit.matches("[role=menu]"))) return;
    if (window.getSelection()?.toString()) return;
    onRowClick(row.original);
  };
  const rowKeyDown = (row) => (e) => {
    if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onRowClick(row.original);
    }
  };
  const rowProps = (row) =>
    onRowClick ? { tabIndex: 0, onClick: rowClick(row), onKeyDown: rowKeyDown(row) } : {};

  const firstRow = pageIndex * pageSize + 1;
  const lastRow = Math.min(filtered.length, (pageIndex + 1) * pageSize);
  const headerText = (col) => (typeof col.columnDef.header === "string" ? col.columnDef.header : "");

  return (
    <div ref={topRef} className="rounded-r-card border border-line bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-4">
        {search && (
          <label className="relative w-full sm:w-72">
            <span className="sr-only">{searchLabel}</span>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
            <input
              type="search"
              autoComplete="off"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={`${searchLabel}…`}
              className="h-10 w-full rounded-r-pill border border-line bg-paper pr-4 pl-9 text-[15px] outline-none focus:border-clay-700"
            />
          </label>
        )}
        {toolbar}
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          {filters.map((f) => (
            <label key={f.id}>
              <span className="sr-only">{f.label}</span>
              <select
                value={url.values[f.id]?.[0] ?? ""}
                onChange={(e) => url.setValues(f.id, e.target.value ? [e.target.value] : [])}
                className={cn(
                  "h-10 rounded-r-pill border bg-white pr-8 pl-3.5 text-sm outline-none focus:border-clay-700",
                  url.values[f.id]?.length ? "border-clay-700 text-clay-800" : "border-line text-ink-2",
                )}
              >
                <option value="">{f.label}: all</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          {exportRow && (
            <button
              type="button"
              onClick={handleExport}
              disabled={!filtered.length}
              className="inline-flex h-10 items-center gap-2 rounded-r-pill border border-line-2 px-4 text-sm font-medium hover:border-clay-700 hover:text-clay-700 disabled:opacity-50"
            >
              <Download className="size-4" aria-hidden="true" /> Export
            </button>
          )}
          {primaryAction}
        </div>
      </div>

      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5" aria-label="Filters in use">
          {filters
            .filter((f) => url.values[f.id]?.length)
            .map((f) => {
              const v = url.values[f.id][0];
              const label = f.options.find((o) => o.value === v)?.label ?? v;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => url.setValues(f.id, [])}
                  aria-label={`Remove ${f.label}: ${label}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-r-pill bg-paper-2 px-3 text-[13px] text-ink-2 hover:bg-clay-100 hover:text-clay-800"
                >
                  <span className="text-ink-3">{f.label}:</span> {label} <X className="size-3.5" aria-hidden="true" />
                </button>
              );
            })}
          <button type="button" onClick={url.clear} className="text-[13px] font-semibold text-clay-700 hover:underline">
            Clear all
          </button>
        </div>
      )}

      {/* Bulk bar */}
      {bulkActions && selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-clay-100/60 px-4 py-2.5 text-sm" role="region" aria-label="Bulk actions">
          <strong className="mr-2">{selectedIds.length} selected</strong>
          {bulkActions(selectedIds, clearSelection)}
          <button type="button" onClick={clearSelection} className="ml-auto text-ink-2 underline hover:text-ink">
            Clear
          </button>
        </div>
      )}

      {/* Table, md and up */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-[15px]" aria-busy={loading}>
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="border-b border-line">
                {group.headers.map((header) => {
                  const meta = header.column.columnDef.meta ?? {};
                  const sortable = header.column.getCanSort();
                  const dir = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={dir ? (dir === "asc" ? "ascending" : "descending") : sortable ? "none" : undefined}
                      className={cn(
                        "px-4 py-3 text-xs font-medium tracking-wide whitespace-nowrap text-ink-2 uppercase",
                        meta.align === "right" && "text-right",
                        meta.headClassName,
                      )}
                    >
                      {sortable ? (
                        <button type="button" onClick={header.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 uppercase hover:text-ink">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {dir === "asc" && <ArrowUp className="size-3" aria-hidden="true" />}
                          {dir === "desc" && <ArrowDown className="size-3" aria-hidden="true" />}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 4 }, (_, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td colSpan={table.getVisibleLeafColumns().length} className="px-4 py-3">
                    <div className="h-5 animate-pulse rounded-r-sm bg-paper-2" />
                  </td>
                </tr>
              ))}
            {!loading &&
              pageRows.map((row) => (
                <tr
                  key={row.id}
                  {...rowProps(row)}
                  className={cn(
                    "border-b border-line last:border-0 focus-visible:bg-paper focus-visible:outline-none",
                    onRowClick && "cursor-pointer hover:bg-paper",
                    row.getIsSelected() && "bg-clay-100/40",
                  )}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta ?? {};
                    return (
                      <td key={cell.id} className={cn("px-4 py-3 align-middle", meta.align === "right" && "text-right whitespace-nowrap", meta.className)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Cards, below md */}
      <ul className="divide-y divide-line md:hidden" aria-busy={loading}>
        {loading && Array.from({ length: 3 }, (_, i) => <li key={i} className="m-4 h-16 animate-pulse rounded-r-md bg-paper-2" />)}
        {!loading &&
          pageRows.map((row) => {
            const cells = row.getVisibleCells();
            const select = cells.find((c) => c.column.id === "__select");
            const actions = cells.find((c) => c.column.id === "__actions");
            const body = cells.filter((c) => (c.column.columnDef.meta ?? {}).card !== false);
            const title = body.find((c) => c.column.columnDef.meta?.card === "title") ?? body[0];
            return (
              <li key={row.id} {...rowProps(row)} className={cn("flex gap-3 p-4", onRowClick && "cursor-pointer active:bg-paper", row.getIsSelected() && "bg-clay-100/40")}>
                {select && <div className="pt-1">{flexRender(select.column.columnDef.cell, select.getContext())}</div>}
                <div className="min-w-0 flex-1 space-y-1.5">
                  {title && <div className="font-medium">{flexRender(title.column.columnDef.cell, title.getContext())}</div>}
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                    {body
                      .filter((c) => c !== title)
                      .map((c) => (
                        <div key={c.id} className="contents">
                          <dt className="text-ink-3">{headerText(c.column)}</dt>
                          <dd className="min-w-0 text-right">{flexRender(c.column.columnDef.cell, c.getContext())}</dd>
                        </div>
                      ))}
                  </dl>
                </div>
                {actions && <div>{flexRender(actions.column.columnDef.cell, actions.getContext())}</div>}
              </li>
            );
          })}
      </ul>

      {!loading && !filtered.length && (
        <div className="px-4 py-12 text-center text-ink-2">
          <p>{rows.length ? "Nothing matches. Try another search or filter." : emptyText}</p>
          {rows.length > 0 && (globalFilter || activeCount > 0) && (
            <button type="button" onClick={clearAll} className="mt-3 text-sm font-semibold text-clay-700 hover:underline">
              Clear search and filters
            </button>
          )}
        </div>
      )}

      {/* Paging */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-ink-2">
          <span aria-live="polite">
            {firstRow} to {lastRow} of {filtered.length}
            {filtered.length !== rows.length && <span className="text-ink-3"> (from {rows.length})</span>}
          </span>
          <div className="flex items-center gap-3">
            {rows.length > PAGE_SIZES[0] && (
              <label>
                <span className="sr-only">Rows per page</span>
                <select value={pageSize} onChange={(e) => changeSize(Number(e.target.value))} className="h-9 rounded-r-pill border border-line bg-white pr-7 pl-3 text-sm">
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n} a page
                    </option>
                  ))}
                </select>
              </label>
            )}
            {pageCount > 1 && (
              <nav className="flex items-center gap-1" aria-label="Pages">
                <PageButton label="Previous page" disabled={!table.getCanPreviousPage()} onClick={() => goTo(pageIndex - 1)}>
                  <ChevronLeft className="size-4" />
                </PageButton>
                {pageList(pageIndex, pageCount).map((p, i) =>
                  p === null ? (
                    <span key={`gap-${i}`} className="px-1 text-ink-3" aria-hidden="true">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      aria-label={`Page ${p + 1}`}
                      aria-current={p === pageIndex ? "page" : undefined}
                      onClick={() => goTo(p)}
                      className={cn(
                        "grid h-9 min-w-9 place-items-center rounded-r-md px-2 font-semibold tabular-nums",
                        p === pageIndex ? "bg-clay-700 text-white" : "hover:bg-paper-2",
                      )}
                    >
                      {p + 1}
                    </button>
                  ),
                )}
                <PageButton label="Next page" disabled={!table.getCanNextPage()} onClick={() => goTo(pageIndex + 1)}>
                  <ChevronRight className="size-4" />
                </PageButton>
              </nav>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PageButton({ label, children, ...props }) {
  return (
    <button type="button" aria-label={label} className="grid size-9 place-items-center rounded-r-md hover:bg-paper-2 disabled:opacity-40" {...props}>
      {children}
    </button>
  );
}

/**
 * The row's "..." menu, drawn in <body> at the button's position so the
 * table's scroll box cannot clip it. Closes on scroll, resize, Escape or a
 * click elsewhere; the arrow keys move between items.
 */
function RowMenu({ actions }) {
  const [at, setAt] = useState(null);
  const button = useRef(null);
  const menu = useRef(null);
  const close = useCallback(() => setAt(null), []);
  const open = at !== null;

  const toggle = () => {
    if (open) return close();
    const r = button.current.getBoundingClientRect();
    const height = actions.length * 42 + 8;
    const up = window.innerHeight - r.bottom < height + 12 && r.top > height + 12;
    setAt({ right: Math.max(8, window.innerWidth - r.right), top: up ? r.top - 4 : r.bottom + 4, up });
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => !menu.current?.contains(e.target) && !button.current?.contains(e.target) && close();
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      close();
      button.current?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open, close]);

  useEffect(() => {
    if (open) menu.current?.querySelector("[role=menuitem]")?.focus({ preventScroll: true });
  }, [open]);

  const onMenuKey = (e) => {
    const items = [...menu.current.querySelectorAll("[role=menuitem]")];
    const i = items.indexOf(document.activeElement);
    const go = (n) => {
      e.preventDefault();
      items[(n + items.length) % items.length]?.focus({ preventScroll: true });
    };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Tab") close();
  };

  if (!actions.length) return null;
  return (
    <div className="inline-block">
      <button
        ref={button}
        type="button"
        onClick={toggle}
        aria-label="Row actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid size-9 place-items-center rounded-r-md text-ink-2 hover:bg-paper-2 hover:text-ink"
      >
        <MoreHorizontal className="size-5" aria-hidden="true" />
      </button>
      {open &&
        createPortal(
          <div
            ref={menu}
            role="menu"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onMenuKey}
            style={{ right: at.right, top: at.top, transform: at.up ? "translateY(-100%)" : undefined }}
            className="fixed z-[200] min-w-44 rounded-r-md border border-line bg-white py-1 text-left shadow-sh-3"
          >
            {actions.map((a) => (
              <button
                key={a.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  close();
                  a.onClick();
                }}
                className={cn(
                  "block w-full px-4 py-2.5 text-left text-sm hover:bg-paper focus-visible:bg-paper focus-visible:outline-none",
                  a.danger && "text-danger hover:bg-danger-100 focus-visible:bg-danger-100",
                )}
              >
                {a.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
