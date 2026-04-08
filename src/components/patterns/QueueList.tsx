import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ChevronsUpDown, Download } from "lucide-react";
import { ACTION_KEYS } from "../../config/action-keys";
import { cn } from "../../lib/cn";
import { useQueueRows } from "../../hooks/use-queue-rows";
import { useKeyboard } from "../../hooks/use-keyboard";
import { useBulkAction } from "../../hooks/use-bulk-action";
import { useRoleGate } from "../../hooks/use-role-gate";
import { useUIStore } from "../../stores/ui-store";
import { useSelectionStore } from "../../stores/selection-store";
import { Checkbox } from "../primitives/Checkbox";
import { Button } from "../primitives/Button";
import { Skeleton } from "../primitives/Skeleton";
import { EmptyState } from "../composites/EmptyState";
import { ErrorBanner } from "../composites/ErrorBanner";
import { useToast } from "./NotificationToast";
import { QueueRow } from "./QueueRow";
import { BulkActionBar } from "./BulkActionBar";
import type { QueueRow as QueueRowType } from "../../types/api";
import type { QueueFilters } from "../../types/ui";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface QueueListProps {
  queueKey: string;
  scopeName?: string;
  filters: QueueFilters;
  onFiltersChange: (filters: QueueFilters) => void;
  onRowClick: (row: QueueRowType) => void;
  onRowDoubleClick: (row: QueueRowType) => void;
  /** When set, overrides filters.owner for the API call (used by My Work to pin current user's role). */
  ownerOverride?: string;
  onStatusOptionsReady?: (options: string[]) => void;
}

/* ------------------------------------------------------------------ */
/*  Pagination constants                                               */
/* ------------------------------------------------------------------ */

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

/* ------------------------------------------------------------------ */
/*  Sort icon helper                                                   */
/* ------------------------------------------------------------------ */

function SortIcon({ direction }: { direction: false | "asc" | "desc" }) {
  if (direction === "asc") return <ArrowUp size={14} aria-hidden="true" />;
  if (direction === "desc") return <ArrowDown size={14} aria-hidden="true" />;
  return <ChevronsUpDown size={14} className="opacity-40" aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/*  Column helper                                                      */
/* ------------------------------------------------------------------ */

const columnHelper = createColumnHelper<QueueRowType>();

/* ------------------------------------------------------------------ */
/*  CSV export helper                                                  */
/* ------------------------------------------------------------------ */

function exportToCsv(rows: QueueRowType[], filename: string) {
  const headers = ["ID", "Title", "Status", "Owner", "Due Date"];
  const escape = (v: string | null | undefined) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [r.docname, r.title, r.status, r.current_owner, r.target_date]
        .map(escape)
        .join(","),
    ),
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Action key → human label                                          */
/* ------------------------------------------------------------------ */

const ACTION_LABELS: Record<string, string> = {
  assign: "Assign",
  snooze: "Snooze",
  acknowledge: "Acknowledge",
};

function humaniseActionKey(key: string): string {
  return ACTION_LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ */
/*  Select-all header — reads selection store directly so the          */
/*  columns array never needs to re-create on selection changes.       */
/* ------------------------------------------------------------------ */

function SelectAllHeader({
  rowIdsRef,
}: {
  rowIdsRef: React.RefObject<string[]>;
}) {
  const { selectedIds, selectAll, clear } = useSelectionStore();
  const rowIds = rowIdsRef.current;
  const allSelected = rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id));
  const someSelected = rowIds.some((id) => selectedIds.has(id));
  return (
    <Checkbox
      checked={allSelected}
      indeterminate={!allSelected && someSelected}
      onCheckedChange={() => {
        if (allSelected) {
          clear();
        } else {
          selectAll(rowIds);
        }
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function QueueList({
  queueKey,
  scopeName,
  filters,
  onRowClick,
  onRowDoubleClick,
  ownerOverride,
  onStatusOptionsReady,
}: QueueListProps) {
  const effectiveFilters = ownerOverride
    ? { ...filters, owner: ownerOverride }
    : filters;
  const { data, isLoading, isError, error, refetch } = useQueueRows(
    queueKey,
    effectiveFilters,
    scopeName,
  );

  const rows = useMemo(() => data?.rows ?? [], [data?.rows]);

  // Pagination (client-side)
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);

  // Reset page when data changes
  useEffect(() => {
    setPageIndex(0);
  }, [queueKey, scopeName, filters]);

  const totalCount = rows.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const paginatedRows = useMemo(
    () => rows.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
    [rows, pageIndex, pageSize],
  );

  // Keep a ref of current page docnames for use in SelectAllHeader without
  // making it a column dep (avoids rebuilding the entire column array on
  // every selection change or page turn).
  const paginatedRowIdsRef = useRef<string[]>([]);
  paginatedRowIdsRef.current = useMemo(
    () => paginatedRows.map((r) => r.docname),
    [paginatedRows],
  );

  // Selection store
  const { selectedIds, toggle, clear, count: selectedCount } = useSelectionStore();

  // Clear selections when the user switches queue or scope so docnames from a
  // previous queue cannot bleed into bulk actions on the new queue.
  useEffect(() => {
    clear();
  }, [queueKey, scopeName, clear]);

  useEffect(() => {
    const options = data?.queue_context?.status_options;
    if (options && options.length > 0) {
      onStatusOptionsReady?.(options);
    }
  }, [data?.queue_context?.status_options, onStatusOptionsReady]);

  // Bulk actions
  const bulkAction = useBulkAction();
  const { userRoles } = useRoleGate();
  const { toast } = useToast();

  const handleBulkAction = useCallback(
    (actionKey: string) => {
      const docnames = Array.from(selectedIds);
      if (docnames.length === 0) return;

      bulkAction.mutate(
        {
          action_key: actionKey,
          docnames,
          actor_role: userRoles[0] ?? "",
        },
        {
          onSuccess: (result) => {
            const failures = result.failed ?? [];
            const failedCount = failures.length;
            const successCount = docnames.length - failedCount;

            const label = humaniseActionKey(actionKey);

            if (failedCount === 0) {
              toast({
                title: `${label} applied`,
                description: `${successCount} item${successCount !== 1 ? "s" : ""} updated.`,
                variant: "success",
              });
            } else if (successCount === 0) {
              // All failed — show first reason as a hint
              const hint = failures[0]?.reason;
              toast({
                title: `${label} failed`,
                description: hint
                  ? `All ${failedCount} items failed. First error: ${hint}`
                  : `All ${failedCount} items could not be updated.`,
                variant: "error",
              });
            } else {
              // Partial — succeeded some, failed some
              const hint = failures[0]?.reason;
              toast({
                title: `${label} — partial success`,
                description: hint
                  ? `${successCount} updated, ${failedCount} failed. First error: ${hint}`
                  : `${successCount} updated, ${failedCount} could not be processed.`,
                variant: "warning",
              });
            }

            clear();
          },
          onError: (err) => {
            toast({
              title: `${humaniseActionKey(actionKey)} failed`,
              description: err.message || "Something went wrong.",
              variant: "error",
            });
          },
        },
      );
    },
    [selectedIds, bulkAction, userRoles, toast, clear],
  );

  // UI store
  const selectedRowId = useUIStore((s) => s.selectedRowId);
  const setSelectedRowId = useUIStore((s) => s.setSelectedRowId);

  // Active row index (for keyboard navigation)
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Column definitions — stable (no deps) because SelectAllHeader reads
  // from the store directly and gets row IDs via paginatedRowIdsRef.
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        size: 32,
        header: () => <SelectAllHeader rowIdsRef={paginatedRowIdsRef} />,
      }),
      columnHelper.display({
        id: "queue",
        size: 48,
        header: "Queue",
      }),
      columnHelper.accessor("title", {
        header: "Title",
        minSize: 200,
        enableSorting: true,
      }),
      columnHelper.display({
        id: "context",
        size: 160,
        header: "Property / Unit",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        size: 140,
        enableSorting: true,
      }),
      columnHelper.accessor("current_owner", {
        header: "Owner",
        size: 120,
        enableSorting: true,
      }),
      columnHelper.accessor("target_date", {
        header: "Due",
        size: 100,
        enableSorting: true,
      }),
      columnHelper.display({
        id: "signals",
        size: 80,
        header: "Signals",
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- columns are stable; SelectAllHeader reads store via hook
    [],
  );

  // Table sorting
  const [sorting, setSorting] = useState<SortingState>([]);

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table is safe here
  const table = useReactTable({
    data: paginatedRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.docname,
  });

  // Keyboard navigation
  const moveDown = useCallback(() => {
    setActiveIndex((prev) => {
      const next = Math.min(prev + 1, paginatedRows.length - 1);
      const row = paginatedRows[next];
      if (row) setSelectedRowId(row.docname);
      return next;
    });
  }, [paginatedRows, setSelectedRowId]);

  const moveUp = useCallback(() => {
    setActiveIndex((prev) => {
      const next = Math.max(prev - 1, 0);
      const row = paginatedRows[next];
      if (row) setSelectedRowId(row.docname);
      return next;
    });
  }, [paginatedRows, setSelectedRowId]);

  const openPreview = useCallback(() => {
    if (activeIndex >= 0 && activeIndex < paginatedRows.length) {
      onRowClick(paginatedRows[activeIndex]);
    }
  }, [activeIndex, paginatedRows, onRowClick]);

  const toggleSelection = useCallback(() => {
    if (activeIndex >= 0 && activeIndex < paginatedRows.length) {
      toggle(paginatedRows[activeIndex].docname);
    }
  }, [activeIndex, paginatedRows, toggle]);

  useKeyboard([
    { key: "j", handler: moveDown },
    { key: "k", handler: moveUp },
    { key: "Enter", handler: openPreview },
    { key: " ", handler: toggleSelection },
  ]);

  // Loading state
  if (isLoading) {
    return (
      <div role="status" aria-live="polite" aria-label="Loading queue items" className="flex flex-col gap-0.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="row" />
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <ErrorBanner
        title="Failed to load queue"
        message={error?.message}
        onRetry={() => void refetch()}
      />
    );
  }

  // Empty state
  if (rows.length === 0) {
    return (
      <div role="status" aria-live="polite">
        <EmptyState
          title="No items in queue"
          description="There are no items matching your current filters."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" aria-label="Queue items">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border-default bg-bg-surface-inset"
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const ariaSort = canSort
                    ? sorted === "asc"
                      ? "ascending"
                      : sorted === "desc"
                        ? "descending"
                        : "none"
                    : undefined;
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={ariaSort}
                      className={cn(
                        "px-2 py-2 text-left",
                        "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                        "font-[number:var(--text-caption-medium-weight)]",
                        "text-fg-muted",
                        canSort && "cursor-pointer select-none hover:text-fg-default",
                        // Mirror the responsive visibility of matching <td> cells in QueueRow
                        header.column.id === "context" && "hidden lg:table-cell",
                        header.column.id === "current_owner" && "hidden md:table-cell",
                        header.column.id === "target_date" && "hidden md:table-cell",
                      )}
                      style={{ width: header.getSize() }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <SortIcon direction={sorted} />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((tableRow, idx) => (
              <QueueRow
                key={tableRow.id}
                row={tableRow.original}
                isSelected={selectedIds.has(tableRow.original.docname)}
                isActive={
                  selectedRowId === tableRow.original.docname || activeIndex === idx
                }
                onSelect={() => toggle(tableRow.original.docname)}
                onClick={() => {
                  setActiveIndex(idx);
                  onRowClick(tableRow.original);
                }}
                onDoubleClick={() => onRowDoubleClick(tableRow.original)}
                queueKey={queueKey}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border-default px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[length:var(--text-caption-size)] text-fg-muted">
            {totalCount} total
          </span>
          <Button
            variant="ghost"
            size="sm"
            icon={Download}
            onClick={() =>
              exportToCsv(
                rows,
                `${queueKey}-${new Date().toISOString().slice(0, 10)}.csv`,
              )
            }
            aria-label="Export to CSV"
          >
            Export
          </Button>
          <select
            aria-label="Items per page"
            className={cn(
              "h-7 rounded-[var(--radius-sm)] border border-border-default bg-bg-surface px-2",
              "text-[length:var(--text-caption-size)] text-fg-default",
              "outline-none focus-visible:border-[var(--ring-focus)] focus-visible:shadow-[var(--shadow-focus)]",
            )}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPageIndex(0);
            }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={pageIndex === 0}
            onClick={() => setPageIndex((p) => p - 1)}
          >
            Prev
          </Button>

          {Array.from({ length: Math.min(pageCount, 5) }).map((_, i) => {
            // Show pages around current page
            let pageNum: number;
            if (pageCount <= 5) {
              pageNum = i;
            } else if (pageIndex < 3) {
              pageNum = i;
            } else if (pageIndex > pageCount - 4) {
              pageNum = pageCount - 5 + i;
            } else {
              pageNum = pageIndex - 2 + i;
            }
            return (
              <Button
                key={pageNum}
                variant={pageNum === pageIndex ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPageIndex(pageNum)}
              >
                {pageNum + 1}
              </Button>
            );
          })}

          <Button
            variant="ghost"
            size="sm"
            disabled={pageIndex >= pageCount - 1}
            onClick={() => setPageIndex((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <BulkActionBar
          selectedCount={selectedCount}
          isPending={bulkAction.isPending}
          onAssign={() => handleBulkAction(ACTION_KEYS.BULK_ASSIGN)}
          onSnooze={() => handleBulkAction(ACTION_KEYS.BULK_SNOOZE)}
          onAcknowledge={() => handleBulkAction(ACTION_KEYS.BULK_ACKNOWLEDGE)}
          onClear={clear}
        />
      )}
    </div>
  );
}
