// ---------------------------------------------------------------------------
// TenantsPage — route: /tenants
//
// Tenancy directory: occupancy state, attention state, contract dates,
// and a slide-in detail panel showing tenant context.
// ---------------------------------------------------------------------------

import { useState, useMemo, useCallback } from "react";
import {
  Users, AlertTriangle, Clock, CheckCircle2, Search,
  ChevronRight, X, RefreshCw, Building2, Plus, Pencil,
} from "lucide-react";
import { cn } from "../lib/cn";
import { useTenantsBootstrap } from "../hooks/use-properties";
import { formatAbsolute } from "../lib/date";
import type { TenantRow } from "../types/api";
import { TransitionRunner } from "../components/runners";
import { RUNNER_REGISTRY } from "../config/runners";
import type { RunnerConfig } from "../types/runner";

/* ------------------------------------------------------------------ */
/*  Runner registry lookups                                             */
/* ------------------------------------------------------------------ */

const CREATE_TENANT_RUNNER = RUNNER_REGISTRY.get("tenant.create") as RunnerConfig | undefined;
const BASE_UPDATE_TENANT_RUNNER = RUNNER_REGISTRY.get("tenant.update") as RunnerConfig | undefined;

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
  active: "bg-status-success",
  notice_given: "bg-status-warning",
  closed: "bg-fg-faint",
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
  const label = state.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full shrink-0", dotClass)} aria-hidden="true" />
      <span className="text-[length:var(--text-small-size)] text-fg-default">{label}</span>
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
    <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Tenant views">
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
/*  Filter chips                                                        */
/* ------------------------------------------------------------------ */

const OCCUPANCY_CHIPS = [
  { label: "Active", value: "active" },
  { label: "Notice Given", value: "notice_given" },
  { label: "Closed", value: "closed" },
];

function FilterChips({
  selected,
  onChange,
}: {
  selected: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {OCCUPANCY_CHIPS.map((chip) => (
        <button
          key={chip.value}
          onClick={() => onChange(selected === chip.value ? null : chip.value)}
          className={cn(
            "rounded-full border px-3 py-1 text-[length:var(--text-caption-size)] font-medium transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
            selected === chip.value
              ? "border-fg-accent bg-fg-accent/10 text-fg-accent"
              : "border-border-default bg-bg-muted text-fg-muted hover:bg-bg-surface hover:text-fg-default",
          )}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tenant table row                                                    */
/* ------------------------------------------------------------------ */

function TenantTableRow({
  row,
  isSelected,
  onClick,
}: {
  row: TenantRow;
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
      {/* Tenant */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Users size={14} className="shrink-0 text-fg-muted" aria-hidden="true" />
          <span className={cn(
            "text-[length:var(--text-body-size)] font-medium text-fg-default",
            "group-hover:text-fg-strong",
          )}>
            {row.title || row.tenancy_id}
          </span>
        </div>
        {row.property_label && (
          <p className="mt-0.5 pl-6 text-[length:var(--text-caption-size)] text-fg-faint">
            {row.property_label}
          </p>
        )}
      </td>

      {/* Occupancy State */}
      <td className="px-4 py-3">
        <OccupancyDot state={row.occupancy_state} />
      </td>

      {/* Attention */}
      <td className="px-4 py-3">
        {row.is_overdue ? (
          <span className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
            "text-[length:var(--text-caption-size)] font-medium leading-none",
            "bg-status-danger-subtle text-status-danger border-status-danger/20",
          )}>
            <AlertTriangle size={11} aria-hidden="true" />
            Overdue
          </span>
        ) : (
          <AttentionBadge state={row.attention_state} />
        )}
      </td>

      {/* Unit — hidden on mobile */}
      <td className="hidden px-4 py-3 text-[length:var(--text-small-size)] text-fg-muted md:table-cell">
        {row.unit_id || "—"}
      </td>

      {/* Contract End — hidden on tablet */}
      <td className="hidden px-4 py-3 text-[length:var(--text-small-size)] text-fg-muted lg:table-cell">
        {row.contract_end_date ? formatAbsolute(row.contract_end_date) : "—"}
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

function TenantDetailPanel({
  row,
  onClose,
  onEditTenant,
}: {
  row: TenantRow;
  onClose: () => void;
  onEditTenant: (row: TenantRow) => void;
}) {
  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col overflow-hidden",
        "border-l border-border-default bg-bg-surface",
      )}
      aria-label={`Tenant detail: ${row.title || row.tenancy_id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border-default px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Users size={16} className="shrink-0 text-fg-muted" aria-hidden="true" />
            <h2 className="truncate text-[length:var(--text-body-size)] font-semibold text-fg-default">
              {row.title || row.tenancy_id}
            </h2>
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <OccupancyDot state={row.occupancy_state} />
            {row.is_overdue ? (
              <span className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
                "text-[length:var(--text-caption-size)] font-medium leading-none",
                "bg-status-danger-subtle text-status-danger border-status-danger/20",
              )}>
                <AlertTriangle size={11} aria-hidden="true" />
                Overdue
              </span>
            ) : (
              <AttentionBadge state={row.attention_state} />
            )}
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
        <section>
          <h3 className="mb-2 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
            Tenancy Details
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Unit</dt>
              <dd className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                {row.unit_id || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Property</dt>
              <dd className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                {row.property_label || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Landlord Account</dt>
              <dd className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                {row.landlord_account_id || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Status</dt>
              <dd className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                {row.status || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Contract Start</dt>
              <dd className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                {row.contract_start_date ? formatAbsolute(row.contract_start_date) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Contract End</dt>
              <dd className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                {row.contract_end_date ? formatAbsolute(row.contract_end_date) : "—"}
              </dd>
            </div>
          </dl>
        </section>

        {BASE_UPDATE_TENANT_RUNNER && (
          <section>
            <h3 className="mb-2 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
              Quick Actions
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onEditTenant(row)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-[var(--radius-md)] border border-border-default",
                  "bg-bg-muted/40 px-3 py-2.5 text-left",
                  "hover:bg-bg-muted hover:border-border-strong transition-colors duration-150",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
                  "cursor-pointer",
                )}
              >
                <Pencil size={14} className="shrink-0 text-fg-muted" aria-hidden="true" />
                <div>
                  <p className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                    Update Tenancy
                  </p>
                  <p className="text-[length:var(--text-caption-size)] text-fg-muted">
                    Edit contract dates, status, or references
                  </p>
                </div>
              </button>
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

export default function TenantsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useTenantsBootstrap();
  const [activeView, setActiveView] = useState<string>("");
  const [search, setSearch] = useState("");
  const [occupancyFilter, setOccupancyFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createTenantOpen, setCreateTenantOpen] = useState(false);
  const [editTenantRunner, setEditTenantRunner] = useState<RunnerConfig | null>(null);
  const [editTenantRecordId, setEditTenantRecordId] = useState<string>("");
  const [editTenantOpen, setEditTenantOpen] = useState(false);

  const resolvedView = activeView || data?.default_view_key || "tenants_directory";

  const filteredRows = useMemo(() => {
    if (!data) return [];
    let rows = data.rows;

    // View filter
    const viewRows = rows.filter((r) => {
      const vkeys = r.view_keys as string[] | undefined;
      return !vkeys || vkeys.length === 0 || vkeys.includes(resolvedView);
    });
    if (viewRows.length > 0) rows = viewRows;

    // Occupancy chip filter
    if (occupancyFilter) {
      rows = rows.filter((r) => r.occupancy_state === occupancyFilter);
    }

    // Text search
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.property_label.toLowerCase().includes(q),
      );
    }

    return rows;
  }, [data, resolvedView, occupancyFilter, search]);

  // KPI counts derived from ALL rows (not filtered)
  const kpiCards = useMemo(() => {
    if (!data) return [];
    const rows = data.rows;
    return [
      { key: "total_tenants", label: "Total Tenants", value: rows.length },
      { key: "active", label: "Active", value: rows.filter((r) => r.status === "active").length },
      {
        key: "notice_given",
        label: "Notice Given",
        value: rows.filter(
          (r) => r.status === "notice_given" || r.occupancy_state === "notice_given",
        ).length,
      },
      { key: "overdue", label: "Overdue", value: rows.filter((r) => r.is_overdue).length },
    ];
  }, [data]);

  const selectedRow = useMemo(
    () => filteredRows.find((r) => r.tenancy_id === selectedId) ?? null,
    [filteredRows, selectedId],
  );

  const handleRowClick = useCallback((row: TenantRow) => {
    setSelectedId((prev) => (prev === row.tenancy_id ? null : row.tenancy_id));
  }, []);

  const handleEditTenant = useCallback((row: TenantRow) => {
    if (!BASE_UPDATE_TENANT_RUNNER) return;
    const prefilled: RunnerConfig = {
      ...BASE_UPDATE_TENANT_RUNNER,
      steps: BASE_UPDATE_TENANT_RUNNER.steps.map((step) => ({
        ...step,
        fields: step.fields.map((f) => {
          switch (f.key) {
            case "tenancy_status": return { ...f, defaultValue: row.status ?? "" };
            case "contract_start_date": return { ...f, defaultValue: row.contract_start_date ?? "" };
            case "contract_end_date": return { ...f, defaultValue: row.contract_end_date ?? "" };
            default: return f;
          }
        }),
      })),
    };
    setEditTenantRunner(prefilled);
    setEditTenantRecordId(row.tenancy_id);
    setEditTenantOpen(true);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <RefreshCw size={20} className="animate-spin text-fg-muted" aria-label="Loading tenants" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-[length:var(--text-small-size)] text-status-danger">
          {error?.message ?? "Failed to load tenants."}
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
    <>
    <div className="flex h-full flex-col overflow-hidden">
      {/* Page header */}
      <div className="border-b border-border-default bg-bg-surface px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-fg-muted" aria-hidden="true" />
            <h1 className="text-[length:var(--text-heading-lg-size)] font-semibold text-fg-default">
              Tenants
            </h1>
            {isFetching && !isLoading && (
              <RefreshCw size={13} className="animate-spin text-fg-faint" aria-hidden="true" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {CREATE_TENANT_RUNNER && (
              <button
                onClick={() => setCreateTenantOpen(true)}
                className={cn(
                  "flex items-center gap-1.5 rounded-[var(--radius-md)]",
                  "bg-action-primary-default px-3 py-1.5 text-[length:var(--text-small-size)] text-white",
                  "hover:bg-action-primary-hover transition-colors duration-150",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
                  "cursor-pointer",
                )}
              >
                <Plus size={13} aria-hidden="true" />
                Add Tenant
              </button>
            )}
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
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: list */}
        <div className={cn(
          "flex flex-col overflow-hidden transition-all duration-200",
          selectedRow ? "w-1/2 lg:w-3/5" : "w-full",
        )}>
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3 border-b border-border-default bg-bg-app px-6 py-4 lg:grid-cols-4">
            {kpiCards.map((card) => (
              <KpiCard
                key={card.key}
                label={card.label}
                value={card.value}
                icon={
                  card.key === "total_tenants" ? <Users size={14} /> :
                  card.key === "active" ? <CheckCircle2 size={14} /> :
                  card.key === "notice_given" ? <Clock size={14} /> :
                  <AlertTriangle size={14} />
                }
              />
            ))}
          </div>

          {/* View tabs + search + filter chips */}
          <div className="flex flex-col gap-3 border-b border-border-default bg-bg-surface px-6 py-3">
            {data.view_summaries.length > 0 && (
              <ViewTabs
                summaries={data.view_summaries}
                activeKey={resolvedView}
                onChange={setActiveView}
              />
            )}
            <FilterChips selected={occupancyFilter} onChange={setOccupancyFilter} />
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search tenants, properties…"
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
                <Users size={32} className="text-fg-faint" aria-hidden="true" />
                <p className="text-[length:var(--text-small-size)] text-fg-muted">
                  {search || occupancyFilter ? "No tenants match your filters" : "No tenants in this view"}
                </p>
                {(search || occupancyFilter) && (
                  <button
                    onClick={() => { setSearch(""); setOccupancyFilter(null); }}
                    className="text-[length:var(--text-small-size)] text-fg-accent underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full border-collapse" aria-label="Tenants list">
                <thead className="sticky top-0 z-10 bg-bg-surface shadow-sm">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Tenant
                    </th>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Occupancy
                    </th>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Attention
                    </th>
                    <th className="hidden px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint md:table-cell">
                      Unit
                    </th>
                    <th className="hidden px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint lg:table-cell">
                      Contract End
                    </th>
                    <th className="w-8 px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <TenantTableRow
                      key={row.tenancy_id}
                      row={row}
                      isSelected={selectedId === row.tenancy_id}
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
          <TenantDetailPanel
            row={selectedRow}
            onClose={() => setSelectedId(null)}
            onEditTenant={handleEditTenant}
          />
        )}
      </div>
    </div>

    {CREATE_TENANT_RUNNER && (
      <TransitionRunner
        open={createTenantOpen}
        onOpenChange={setCreateTenantOpen}
        config={CREATE_TENANT_RUNNER}
        recordId=""
      />
    )}
    {editTenantRunner && (
      <TransitionRunner
        open={editTenantOpen}
        onOpenChange={(open) => {
          setEditTenantOpen(open);
          if (!open) setEditTenantRunner(null);
        }}
        config={editTenantRunner}
        recordId={editTenantRecordId}
      />
    )}
    </>
  );
}
