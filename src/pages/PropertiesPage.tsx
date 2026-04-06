// ---------------------------------------------------------------------------
// PropertiesPage — route: /properties
//
// Browse governed managed properties with occupancy posture, attention state,
// and a slide-in detail panel showing linked units, tenancies, and queue cases.
// ---------------------------------------------------------------------------

import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, AlertTriangle, Clock, CheckCircle2, Search,
  ChevronRight, X, Users, DoorOpen, Briefcase, ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { cn } from "../lib/cn";
import { usePropertiesBootstrap } from "../hooks/use-properties";
import { formatRelative, formatAbsolute } from "../lib/date";
import type { PropertyRow, PropertyModuleAction } from "../types/api";

/* ------------------------------------------------------------------ */
/*  Attention state config                                              */
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

function AttentionBadge({ state }: { state: string }) {
  const config = ATTENTION_CONFIG[state] ?? ATTENTION_CONFIG.Normal;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
        "text-[length:var(--text-caption-size)] font-medium leading-none",
        config.className,
      )}
    >
      {config.icon}
      {config.label}
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
    <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Property views">
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
/*  Property row                                                        */
/* ------------------------------------------------------------------ */

function PropertyTableRow({
  row,
  isSelected,
  onClick,
}: {
  row: PropertyRow;
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
        isSelected
          ? "bg-bg-surface-raised"
          : "hover:bg-bg-muted",
      )}
    >
      {/* Property name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Building2 size={14} className="shrink-0 text-fg-muted" aria-hidden="true" />
          <span className={cn(
            "text-[length:var(--text-body-size)] font-medium text-fg-default",
            "group-hover:text-fg-strong",
          )}>
            {row.property_label}
          </span>
        </div>
        {row.landlord_account_id && (
          <p className="mt-0.5 pl-6 text-[length:var(--text-caption-size)] text-fg-faint">
            {row.landlord_account_id}
          </p>
        )}
      </td>

      {/* Attention state */}
      <td className="px-4 py-3">
        <AttentionBadge state={row.attention_state} />
      </td>

      {/* Stock type */}
      <td className="hidden px-4 py-3 text-[length:var(--text-small-size)] text-fg-muted md:table-cell">
        {row.stock_types.join(", ") || "—"}
      </td>

      {/* Counts */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[length:var(--text-small-size)] text-fg-default tabular-nums">
            {row.unit_count} units
          </span>
          {row.linked_tenancy_count > 0 && (
            <span className="text-[length:var(--text-caption-size)] text-fg-muted">
              {row.linked_tenancy_count} tenancies
            </span>
          )}
        </div>
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
/*  Detail panel                                                        */
/* ------------------------------------------------------------------ */

function ModuleActionButton({
  action,
  onNavigate,
}: {
  action: PropertyModuleAction;
  onNavigate: (path: string) => void;
}) {
  if (!action.available) {
    return (
      <div className={cn(
        "flex items-center gap-2 rounded-[var(--radius-md)] border border-border-default",
        "px-3 py-2 opacity-40",
      )}>
        <span className="flex-1 text-[length:var(--text-small-size)] text-fg-muted">{action.label}</span>
        <span className="text-[length:var(--text-caption-size)] text-fg-faint">Unavailable</span>
      </div>
    );
  }

  const handleClick = () => {
    if (action.action_kind === "queue_detail" && action.doctype && action.docname) {
      onNavigate(`/case/${action.doctype}/${action.docname}`);
    } else if (action.action_kind === "module_route" && action.route) {
      if (action.route === "controldesk-portfolio") onNavigate("/portfolio");
      else if (action.route === "controldesk-units" || action.route === "controldesk-properties") {
        if (action.route === "controldesk-units") onNavigate("/units");
        else onNavigate("/properties");
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-[var(--radius-md)] border border-border-default",
        "bg-bg-surface px-3 py-2 text-left transition-colors",
        "hover:bg-bg-muted hover:border-border-strong",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
      )}
    >
      <span className="flex-1 text-[length:var(--text-small-size)] font-medium text-fg-default">
        {action.label}
      </span>
      <ArrowUpRight size={13} className="shrink-0 text-fg-muted" aria-hidden="true" />
    </button>
  );
}

function PropertyDetailPanel({
  row,
  onClose,
}: {
  row: PropertyRow;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { detail } = row;

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col overflow-hidden",
        "border-l border-border-default bg-bg-surface",
      )}
      aria-label={`Property detail: ${row.property_label}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border-default px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="shrink-0 text-fg-muted" aria-hidden="true" />
            <h2 className="truncate text-[length:var(--text-body-size)] font-semibold text-fg-default">
              {row.property_label}
            </h2>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <AttentionBadge state={row.attention_state} />
            {row.target_date && (
              <span className="text-[length:var(--text-caption-size)] text-fg-muted">
                {formatAbsolute(row.target_date)}
              </span>
            )}
          </div>
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

        {/* Summary */}
        <p className="text-[length:var(--text-small-size)] text-fg-muted">{row.summary}</p>

        {/* Ownership context */}
        {detail.ownership_context.length > 0 && (
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
        {detail.stock_summary.length > 0 && (
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

        {/* Linked units */}
        {detail.linked_units.length > 0 && (
          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
              <DoorOpen size={11} aria-hidden="true" />
              Units ({detail.linked_units.length})
            </h3>
            <ul className="space-y-1.5">
              {detail.linked_units.map((unit) => (
                <li
                  key={unit.unit_id}
                  className="flex items-center justify-between rounded-[var(--radius-md)] border border-border-default bg-bg-muted/40 px-3 py-2"
                >
                  <div>
                    <p className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                      {unit.title || unit.unit_id}
                    </p>
                    <p className="text-[length:var(--text-caption-size)] text-fg-muted">
                      {unit.occupancy_state}
                    </p>
                  </div>
                  <AttentionBadge state={unit.attention_state} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Linked tenancies */}
        {detail.linked_tenancies.length > 0 && (
          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
              <Users size={11} aria-hidden="true" />
              Tenancies ({detail.linked_tenancies.length})
            </h3>
            <ul className="space-y-1.5">
              {detail.linked_tenancies.map((t) => (
                <li
                  key={t.docname || t.record_id}
                  className="flex items-center justify-between rounded-[var(--radius-md)] border border-border-default bg-bg-muted/40 px-3 py-2"
                >
                  <div>
                    <p className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                      {t.title || t.doctype}
                    </p>
                    {t.status && (
                      <p className="text-[length:var(--text-caption-size)] text-fg-muted">{t.status}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Queue cases */}
        {detail.queue_continuity.length > 0 && (
          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
              <Briefcase size={11} aria-hidden="true" />
              Active Queue Cases ({detail.queue_continuity.length})
            </h3>
            <ul className="space-y-1.5">
              {detail.queue_continuity.map((c) => (
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

        {/* Module actions */}
        {detail.module_actions.filter((a) => a.available).length > 0 && (
          <section>
            <h3 className="mb-2 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
              Navigate To
            </h3>
            <div className="space-y-1.5">
              {detail.module_actions.map((action, i) => (
                <ModuleActionButton key={i} action={action} onNavigate={navigate} />
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */

export default function PropertiesPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = usePropertiesBootstrap();
  const [activeView, setActiveView] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Default the active view once data arrives
  const resolvedView = activeView || data?.default_view_key || "properties_directory";

  // Filter rows by view and search
  const filteredRows = useMemo<PropertyRow[]>(() => {
    if (!data) return [];
    let rows = data.rows;

    // View filter
    rows = rows.filter((r) => r.view_keys.includes(resolvedView));

    // Search
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.property_label.toLowerCase().includes(q) ||
          r.landlord_account_id.toLowerCase().includes(q) ||
          r.property_reference_id.toLowerCase().includes(q),
      );
    }

    return rows;
  }, [data, resolvedView, search]);

  const selectedRow = useMemo(
    () => filteredRows.find((r) => r.property_reference_id === selectedId) ?? null,
    [filteredRows, selectedId],
  );

  const handleRowClick = useCallback((row: PropertyRow) => {
    setSelectedId((prev) =>
      prev === row.property_reference_id ? null : row.property_reference_id,
    );
  }, []);

  // ---- Loading ----
  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <RefreshCw size={20} className="animate-spin text-fg-muted" aria-label="Loading properties" />
      </div>
    );
  }

  // ---- Error ----
  if (isError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-[length:var(--text-small-size)] text-status-danger">
          {error?.message ?? "Failed to load properties."}
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
            <Building2 size={18} className="text-fg-muted" aria-hidden="true" />
            <h1 className="text-[length:var(--text-heading-lg-size)] font-semibold text-fg-default">
              Properties
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
        {/* Left: list + filters */}
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
                  card.key === "properties_visible" ? <Building2 size={14} /> :
                  card.key === "units_visible" ? <DoorOpen size={14} /> :
                  card.key === "blocked_or_escalated" ? <AlertTriangle size={14} /> :
                  <Users size={14} />
                }
              />
            ))}
          </div>

          {/* View tabs + search */}
          <div className="flex flex-col gap-3 border-b border-border-default bg-bg-surface px-6 py-3">
            <ViewTabs
              summaries={data.view_summaries}
              activeKey={resolvedView}
              onChange={setActiveView}
            />
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search properties, landlords…"
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
                <Building2 size={32} className="text-fg-faint" aria-hidden="true" />
                <p className="text-[length:var(--text-small-size)] text-fg-muted">
                  {search ? "No properties match your search" : "No properties in this view"}
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
              <table className="w-full border-collapse" aria-label="Properties list">
                <thead className="sticky top-0 z-10 bg-bg-surface shadow-sm">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Property
                    </th>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Status
                    </th>
                    <th className="hidden px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint md:table-cell">
                      Stock Type
                    </th>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Units
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
                    <PropertyTableRow
                      key={row.property_reference_id}
                      row={row}
                      isSelected={selectedId === row.property_reference_id}
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
          <PropertyDetailPanel
            row={selectedRow}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
}
