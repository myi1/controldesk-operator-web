// ---------------------------------------------------------------------------
// UnitsPage — route: /units
//
// Unit directory: occupancy state, attention state, stock type, target dates,
// and a slide-in detail panel showing linked workflow cases and leasing rows.
// ---------------------------------------------------------------------------

import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  DoorOpen, AlertTriangle, Clock, CheckCircle2, Search,
  ChevronRight, X, Briefcase, ArrowUpRight, RefreshCw, Building2,
} from "lucide-react";
import { cn } from "../lib/cn";
import { useUnitsBootstrap } from "../hooks/use-properties";
import { formatRelative } from "../lib/date";
import type { UnitRow, PropertyLinkedRow } from "../types/api";

/* ------------------------------------------------------------------ */
/*  Attention state badge config                                        */
/* ------------------------------------------------------------------ */

const ATTENTION_CONFIG: Record<string, {
  label: string;
  className: string;
  icon: React.ReactNode;
}> = {
  Blocked: {
    label: "Blocked",
    className: "bg-status-danger-subtle text-status-danger border-status-danger/20",
    icon: <AlertTriangle size={11} aria-hidden="true" />,
  },
  Overdue: {
    label: "Overdue",
    className: "bg-status-warning-subtle text-status-warning border-status-warning/20",
    icon: <Clock size={11} aria-hidden="true" />,
  },
  "Due Soon": {
    label: "Due Soon",
    className: "bg-status-info-subtle text-status-info border-status-info/20",
    icon: <Clock size={11} aria-hidden="true" />,
  },
  Normal: {
    label: "Normal",
    className: "bg-bg-muted text-fg-muted border-border-default",
    icon: <CheckCircle2 size={11} aria-hidden="true" />,
  },
};

const OCCUPANCY_DOT: Record<string, string> = {
  Occupied: "bg-status-success",
  Vacant: "bg-fg-faint",
  "Notice Given": "bg-status-warning",
  Void: "bg-status-danger",
};

function AttentionBadge({ state }: { state: string }) {
  const config = ATTENTION_CONFIG[state] ?? ATTENTION_CONFIG.Normal;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
      "text-[length:var(--text-caption-size)] font-medium leading-none",
      config.className,
    )}>
      {config.icon}
      {config.label}
    </span>
  );
}

function OccupancyDot({ state }: { state: string }) {
  const dotClass = OCCUPANCY_DOT[state] ?? "bg-fg-faint";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full shrink-0", dotClass)} aria-hidden="true" />
      <span className="text-[length:var(--text-small-size)] text-fg-default">{state}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  KPI card                                                            */
/* ------------------------------------------------------------------ */

function KpiCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className={cn(
      "rounded-[var(--radius-lg)] border border-border-default bg-bg-surface p-4",
      "flex items-start gap-3",
    )}>
      <div className="mt-0.5 rounded-[var(--radius-md)] bg-bg-muted p-1.5 text-fg-muted">
        {icon}
      </div>
      <div>
        <p className="text-[length:var(--text-small-size)] text-fg-muted">{label}</p>
        <p className="text-[length:var(--text-heading-lg-size)] font-semibold text-fg-default tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  View tabs                                                           */
/* ------------------------------------------------------------------ */

function ViewTabs({
  summaries,
  activeKey,
  onChange,
}: {
  summaries: Array<{ key: string; label: string; count: number }>;
  activeKey: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Unit views">
      {summaries.map((s) => (
        <button
          key={s.key}
          role="tab"
          aria-selected={activeKey === s.key}
          onClick={() => onChange(s.key)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-[var(--radius-md)] px-3 py-1.5",
            "text-[length:var(--text-small-size)] font-medium transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
            activeKey === s.key
              ? "bg-bg-surface-raised text-fg-default shadow-sm"
              : "text-fg-muted hover:bg-bg-muted hover:text-fg-default",
          )}
        >
          {s.label}
          <span className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
            activeKey === s.key ? "bg-bg-muted text-fg-muted" : "bg-bg-muted/60 text-fg-faint",
          )}>
            {s.count}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Unit table row                                                      */
/* ------------------------------------------------------------------ */

function UnitTableRow({
  row,
  isSelected,
  onClick,
}: {
  row: UnitRow;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className={cn(
        "group cursor-pointer border-b border-border-default transition-colors",
        "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-border-focus",
        isSelected ? "bg-bg-surface-raised" : "hover:bg-bg-muted",
      )}
    >
      {/* Unit */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <DoorOpen size={14} className="shrink-0 text-fg-muted" aria-hidden="true" />
          <span className={cn(
            "text-[length:var(--text-body-size)] font-medium text-fg-default",
            "group-hover:text-fg-strong",
          )}>
            {row.title || row.unit_id}
          </span>
        </div>
        {row.property_label && (
          <p className="mt-0.5 pl-6 text-[length:var(--text-caption-size)] text-fg-faint">
            {row.property_label}
          </p>
        )}
      </td>

      {/* Occupancy */}
      <td className="px-4 py-3">
        <OccupancyDot state={row.occupancy_state} />
      </td>

      {/* Attention state */}
      <td className="px-4 py-3">
        <AttentionBadge state={row.attention_state} />
      </td>

      {/* Stock type */}
      <td className="hidden px-4 py-3 text-[length:var(--text-small-size)] text-fg-muted md:table-cell">
        {row.stock_type || "—"}
      </td>

      {/* Target date */}
      <td className="hidden px-4 py-3 text-[length:var(--text-small-size)] text-fg-muted lg:table-cell">
        {row.target_date ? formatRelative(row.target_date) : "—"}
      </td>

      {/* Queue cases */}
      <td className="hidden px-4 py-3 lg:table-cell">
        {row.linked_queue_row_count > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-bg-muted px-2 py-0.5 text-[length:var(--text-caption-size)] text-fg-muted">
            <Briefcase size={10} aria-hidden="true" />
            {row.linked_queue_row_count}
          </span>
        ) : (
          <span className="text-[length:var(--text-caption-size)] text-fg-faint">—</span>
        )}
      </td>

      {/* Chevron */}
      <td className="px-3 py-3">
        <ChevronRight
          size={14}
          className={cn(
            "text-fg-faint transition-transform",
            isSelected && "translate-x-0.5 text-fg-muted",
          )}
          aria-hidden="true"
        />
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Linked row list (leasing / finance)                                 */
/* ------------------------------------------------------------------ */

function LinkedRowList({
  title,
  rows,
  onNavigate,
}: {
  title: string;
  rows: PropertyLinkedRow[];
  onNavigate: (path: string) => void;
}) {
  if (rows.length === 0) return null;
  return (
    <section>
      <h3 className="mb-2 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
        {title} ({rows.length})
      </h3>
      <ul className="space-y-1.5">
        {rows.map((r) => (
          <li
            key={r.docname || r.record_id}
            onClick={() =>
              r.doctype && r.docname && onNavigate(`/case/${r.doctype}/${r.docname}`)
            }
            className={cn(
              "flex items-center justify-between rounded-[var(--radius-md)] border border-border-default bg-bg-muted/40 px-3 py-2",
              r.doctype && r.docname && "cursor-pointer hover:bg-bg-muted hover:border-border-strong",
            )}
          >
            <div>
              <p className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                {r.title || r.doctype}
              </p>
              {r.status && (
                <p className="text-[length:var(--text-caption-size)] text-fg-muted">{r.status}</p>
              )}
            </div>
            {r.doctype && r.docname && (
              <ArrowUpRight size={12} className="shrink-0 text-fg-muted" aria-hidden="true" />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail panel                                                        */
/* ------------------------------------------------------------------ */

function UnitDetailPanel({
  row,
  onClose,
}: {
  row: UnitRow;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const detail = row.detail;

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col overflow-hidden",
        "border-l border-border-default bg-bg-surface",
      )}
      aria-label={`Unit detail: ${row.title || row.unit_id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border-default px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <DoorOpen size={16} className="shrink-0 text-fg-muted" aria-hidden="true" />
            <h2 className="truncate text-[length:var(--text-body-size)] font-semibold text-fg-default">
              {row.title || row.unit_id}
            </h2>
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <OccupancyDot state={row.occupancy_state} />
            <AttentionBadge state={row.attention_state} />
          </div>
          {row.property_label && (
            <p className="mt-1 flex items-center gap-1 text-[length:var(--text-caption-size)] text-fg-muted">
              <Building2 size={11} aria-hidden="true" />
              {row.property_label}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className={cn(
            "shrink-0 rounded-[var(--radius-md)] p-1.5 text-fg-muted",
            "hover:bg-bg-muted hover:text-fg-default",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
          )}
          aria-label="Close detail panel"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Ownership context */}
        {detail?.ownership_context && detail.ownership_context.length > 0 && (
          <section>
            <h3 className="mb-2 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
              Ownership
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              {detail.ownership_context.map((item) => (
                <div key={item.label}>
                  <dt className="text-[length:var(--text-caption-size)] text-fg-faint">{item.label}</dt>
                  <dd className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                    {item.value || "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Stock summary */}
        {detail?.stock_summary && detail.stock_summary.length > 0 && (
          <section>
            <h3 className="mb-2 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
              Stock Summary
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
              {detail.stock_summary.map((item) => (
                <div key={item.label}>
                  <dt className="text-[length:var(--text-caption-size)] text-fg-faint">{item.label}</dt>
                  <dd className="text-[length:var(--text-small-size)] font-semibold text-fg-default tabular-nums">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* Leasing rows */}
        {detail?.leasing_rows && (
          <LinkedRowList
            title="Leasing"
            rows={detail.leasing_rows}
            onNavigate={navigate}
          />
        )}

        {/* Finance rows */}
        {detail?.finance_rows && (
          <LinkedRowList
            title="Finance"
            rows={detail.finance_rows}
            onNavigate={navigate}
          />
        )}

        {/* Linked workflow cases */}
        {detail?.linked_workflow_cases && detail.linked_workflow_cases.length > 0 && (
          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
              <Briefcase size={11} aria-hidden="true" />
              Active Queue Cases ({detail.linked_workflow_cases.length})
            </h3>
            <ul className="space-y-1.5">
              {detail.linked_workflow_cases.map((c) => (
                <li key={`${c.doctype}-${c.docname}`}>
                  <button
                    onClick={() => navigate(`/case/${c.doctype}/${c.docname}`)}
                    className={cn(
                      "w-full rounded-[var(--radius-md)] border border-border-default bg-bg-muted/40 px-3 py-2",
                      "text-left transition-colors hover:bg-bg-muted hover:border-border-strong",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                        {c.label}
                      </p>
                      <ArrowUpRight size={12} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden="true" />
                    </div>
                    {c.next_action && (
                      <p className="mt-0.5 text-[length:var(--text-caption-size)] text-fg-muted">
                        {c.next_action}
                      </p>
                    )}
                    {c.queue_label && (
                      <p className="mt-0.5 text-[length:var(--text-caption-size)] text-fg-faint">
                        {c.queue_label}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* No detail state */}
        {!detail && (
          <p className="text-[length:var(--text-small-size)] text-fg-muted">
            No additional detail available for this unit.
          </p>
        )}
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */

export default function UnitsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useUnitsBootstrap();
  const [activeView, setActiveView] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const resolvedView = activeView || data?.default_view_key || "units_directory";

  const filteredRows = useMemo(() => {
    if (!data) return [];
    let rows = data.rows;

    // View filter — units may not have view_keys so fall back to showing all
    const viewRows = rows.filter((r) => {
      const vkeys = r.view_keys as string[] | undefined;
      return !vkeys || vkeys.length === 0 || vkeys.includes(resolvedView);
    });
    if (viewRows.length > 0) rows = viewRows;

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          (r.title as string).toLowerCase().includes(q) ||
          r.property_label.toLowerCase().includes(q) ||
          r.unit_id.toLowerCase().includes(q) ||
          r.occupancy_state.toLowerCase().includes(q),
      );
    }

    return rows;
  }, [data, resolvedView, search]);

  const selectedRow = useMemo(
    () => filteredRows.find((r) => r.unit_id === selectedId) ?? null,
    [filteredRows, selectedId],
  );

  const handleRowClick = useCallback((row: UnitRow) => {
    setSelectedId((prev) => (prev === row.unit_id ? null : row.unit_id));
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <RefreshCw size={20} className="animate-spin text-fg-muted" aria-label="Loading units" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-[length:var(--text-small-size)] text-status-danger">
          {error?.message ?? "Failed to load units."}
        </p>
        <button
          onClick={() => void refetch()}
          className={cn(
            "rounded-[var(--radius-md)] border border-border-default bg-bg-surface px-4 py-2",
            "text-[length:var(--text-small-size)] text-fg-default hover:bg-bg-muted",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
          )}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Page header */}
      <div className="border-b border-border-default bg-bg-surface px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DoorOpen size={18} className="text-fg-muted" aria-hidden="true" />
            <h1 className="text-[length:var(--text-heading-lg-size)] font-semibold text-fg-default">
              Units
            </h1>
            {isFetching && !isLoading && (
              <RefreshCw size={13} className="animate-spin text-fg-faint" aria-hidden="true" />
            )}
          </div>
          <button
            onClick={() => void refetch()}
            className={cn(
              "flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border-default",
              "px-3 py-1.5 text-[length:var(--text-small-size)] text-fg-muted",
              "hover:bg-bg-muted hover:text-fg-default transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
            )}
          >
            <RefreshCw size={13} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: list */}
        <div className={cn(
          "flex flex-col overflow-hidden transition-all duration-200",
          selectedRow ? "w-1/2 lg:w-3/5" : "w-full",
        )}>
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3 border-b border-border-default bg-bg-app px-6 py-4 lg:grid-cols-4">
            {data.summary_cards.map((card) => (
              <KpiCard
                key={card.key}
                label={card.label}
                value={card.value}
                icon={
                  card.key === "units_visible" ? <DoorOpen size={14} /> :
                  card.key === "occupied_units" ? <CheckCircle2 size={14} /> :
                  card.key === "vacant_units" ? <DoorOpen size={14} /> :
                  card.key === "attention_required" ? <AlertTriangle size={14} /> :
                  <Building2 size={14} />
                }
              />
            ))}
          </div>

          {/* View tabs + search */}
          <div className="flex flex-col gap-3 border-b border-border-default bg-bg-surface px-6 py-3">
            {data.view_summaries.length > 0 && (
              <ViewTabs
                summaries={data.view_summaries}
                activeKey={resolvedView}
                onChange={setActiveView}
              />
            )}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search units, properties…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  "w-full rounded-[var(--radius-md)] border border-border-default bg-bg-muted",
                  "py-2 pl-9 pr-4 text-[length:var(--text-small-size)] text-fg-default",
                  "placeholder:text-fg-faint",
                  "focus:outline-2 focus:outline-offset-2 focus:outline-border-focus",
                )}
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            {filteredRows.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-2">
                <DoorOpen size={32} className="text-fg-faint" aria-hidden="true" />
                <p className="text-[length:var(--text-small-size)] text-fg-muted">
                  {search ? "No units match your search" : "No units in this view"}
                </p>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-[length:var(--text-small-size)] text-fg-accent underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full border-collapse" aria-label="Units list">
                <thead className="sticky top-0 z-10 bg-bg-surface shadow-sm">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Unit
                    </th>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Occupancy
                    </th>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Attention
                    </th>
                    <th className="hidden px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint md:table-cell">
                      Stock Type
                    </th>
                    <th className="hidden px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint lg:table-cell">
                      Target Date
                    </th>
                    <th className="hidden px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint lg:table-cell">
                      Cases
                    </th>
                    <th className="w-8 px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <UnitTableRow
                      key={row.unit_id}
                      row={row}
                      isSelected={selectedId === row.unit_id}
                      onClick={() => handleRowClick(row)}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: detail panel */}
        {selectedRow && (
          <UnitDetailPanel
            row={selectedRow}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
}
