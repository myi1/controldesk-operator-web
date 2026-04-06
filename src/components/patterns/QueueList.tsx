import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { useQueueRows } from "../../hooks/use-queue-rows";
import { useKeyboard } from "../../hooks/use-keyboard";
import { useUIStore } from "../../stores/ui-store";
import { useSelectionStore } from "../../stores/selection-store";
import { Checkbox } from "../primitives/Checkbox";
import { Button } from "../primitives/Button";
import { Skeleton } from "../primitives/Skeleton";
import { EmptyState } from "../composites/EmptyState";
import { ErrorBanner } from "../composites/ErrorBanner";
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function QueueList({
  queueKey,
  scopeName,
  filters,
  onRowClick,
  onRowDoubleClick,
}: QueueListProps) {
  const { data, isLoading, isError, error, refetch } = useQueueRows(
    queueKey,
    filters,
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

  // Selection store
  const { selectedIds, toggle, selectAll, clear, count: selectedCount } = useSelectionStore();

  // UI store
  const selectedRowId = useUIStore((s) => s.selectedRowId);
  const setSelectedRowId = useUIStore((s) => s.setSelectedRowId);

  // Active row index (for keyboard navigation)
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Column definitions
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        size: 32,
        header: () => {
          const allOnPage = paginatedRows.map((r) => r.docname);
          const allSelected = allOnPage.length > 0 && allOnPage.every((id) => selectedIds.has(id));
          const someSelected = allOnPage.some((id) => selectedIds.has(id));
          return (
            <Checkbox
              checked={allSelected}
              indeterminate={!allSelected && someSelected}
              onCheckedChange={() => {
                if (allSelected) {
                  clear();
                } else {
                  selectAll(allOnPage);
                }
              }}
            />
          );
        },
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
    [paginatedRows, selectedIds, clear, selectAll],
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
      <div className="flex flex-col gap-0.5">
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
      <EmptyState
        title="No items in queue"
        description="There are no items matching your current filters."
      />
    );
  }

  return (
    <div className="flex flex-col">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-border-default bg-bg-surface-inset"
              >
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "px-2 py-2 text-left",
                        "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                        "font-[number:var(--text-caption-medium-weight)]",
                        "text-fg-muted",
                        canSort && "cursor-pointer select-none hover:text-fg-default",
                      )}
                      style={{ width: header.getSize() }}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                        {canSort && (
                          <SortIcon direction={header.column.getIsSorted()} />
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
          <select
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
          onAssign={() => {
            /* TODO: wire bulk assign */
          }}
          onSnooze={() => {
            /* TODO: wire bulk snooze */
          }}
          onAcknowledge={() => {
            /* TODO: wire bulk acknowledge */
          }}
          onClear={clear}
        />
      )}
    </div>
  );
}
