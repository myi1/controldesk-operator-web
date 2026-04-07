// ---------------------------------------------------------------------------
// LandlordsPage — route: /landlords
//
// Landlord account directory: service tier, unit count, active tenancies,
// attention state, and a slide-in detail panel.
// ---------------------------------------------------------------------------

import { useState, useMemo, useCallback } from "react";
import {
  Briefcase, AlertTriangle, Clock, CheckCircle2, Search,
  ChevronRight, X, RefreshCw, Building2,
} from "lucide-react";
import { cn } from "../lib/cn";
import { useLandlordsBootstrap } from "../hooks/use-properties";
import type { LandlordRow } from "../types/api";

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

const TIER_CLASS: Record<string, string> = {
  Premium: "bg-status-info-subtle text-status-info border-status-info/20",
  Standard: "bg-bg-muted text-fg-muted border-border-default",
};

function ServiceTierBadge({ tier }: { tier: string | null }) {
  if (!tier) {
    return <span className="text-[length:var(--text-caption-size)] text-fg-faint">—</span>;
  }
  const cls = TIER_CLASS[tier] ?? "bg-bg-muted text-fg-muted border-border-default";
  return (
    <span className={cn(
      "inline-flex items-center rounded-full border px-2 py-0.5",
      "text-[length:var(--text-caption-size)] font-medium leading-none",
      cls,
    )}>
      {tier}
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
    <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Landlord views">
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
/*  Service tier filter chips                                           */
/* ------------------------------------------------------------------ */

const TIER_CHIPS = [
  { label: "Premium", value: "Premium" },
  { label: "Standard", value: "Standard" },
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
      {TIER_CHIPS.map((chip) => (
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
/*  Landlord table row                                                  */
/* ------------------------------------------------------------------ */

function LandlordTableRow({
  row,
  isSelected,
  onClick,
}: {
  row: LandlordRow;
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
      {/* Landlord */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Briefcase size={14} className="shrink-0 text-fg-muted" aria-hidden="true" />
          <span className={cn(
            "text-[length:var(--text-body-size)] font-medium text-fg-default",
            "group-hover:text-fg-strong",
          )}>
            {row.display_name || row.landlord_account_id}
          </span>
        </div>
      </td>

      {/* Service Tier */}
      <td className="px-4 py-3">
        <ServiceTierBadge tier={row.service_tier} />
      </td>

      {/* Units */}
      <td className="px-4 py-3 text-[length:var(--text-small-size)] text-fg-default tabular-nums">
        {row.unit_count}
      </td>

      {/* Active Tenancies */}
      <td className="px-4 py-3 text-[length:var(--text-small-size)] text-fg-default tabular-nums">
        {row.active_tenancy_count}
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

function LandlordDetailPanel({
  row,
  onClose,
}: {
  row: LandlordRow;
  onClose: () => void;
}) {
  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col overflow-hidden",
        "border-l border-border-default bg-bg-surface",
      )}
      aria-label={`Landlord detail: ${row.display_name || row.landlord_account_id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border-default px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Briefcase size={16} className="shrink-0 text-fg-muted" aria-hidden="true" />
            <h2 className="truncate text-[length:var(--text-body-size)] font-semibold text-fg-default">
              {row.display_name || row.landlord_account_id}
            </h2>
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <ServiceTierBadge tier={row.service_tier} />
            <AttentionBadge state={row.attention_state} />
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
        <section>
          <h3 className="mb-2 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
            Account Details
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Account ID</dt>
              <dd className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                {row.landlord_account_id || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Service Tier</dt>
              <dd className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                {row.service_tier || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Status</dt>
              <dd className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                {row.status || "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h3 className="mb-2 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
            Portfolio Summary
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Units</dt>
              <dd className="text-[length:var(--text-heading-lg-size)] font-semibold text-fg-default tabular-nums">
                {row.unit_count}
              </dd>
            </div>
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Active Tenancies</dt>
              <dd className="text-[length:var(--text-heading-lg-size)] font-semibold text-fg-default tabular-nums">
                {row.active_tenancy_count}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */

export default function LandlordsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useLandlordsBootstrap();
  const [activeView, setActiveView] = useState<string>("");
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const resolvedView = activeView || data?.default_view_key || "landlords_directory";

  const filteredRows = useMemo(() => {
    if (!data) return [];
    let rows = data.rows;

    // View filter
    const viewRows = rows.filter((r) => {
      const vkeys = r.view_keys as string[] | undefined;
      return !vkeys || vkeys.length === 0 || vkeys.includes(resolvedView);
    });
    if (viewRows.length > 0) rows = viewRows;

    // Tier chip filter
    if (tierFilter) {
      rows = rows.filter((r) => r.service_tier === tierFilter);
    }

    // Text search
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) => r.display_name.toLowerCase().includes(q));
    }

    return rows;
  }, [data, resolvedView, tierFilter, search]);

  // KPI counts derived from ALL rows
  const kpiCards = useMemo(() => {
    if (!data) return [];
    const rows = data.rows;
    return [
      { key: "total_landlords", label: "Total Landlords", value: rows.length },
      {
        key: "managed_units",
        label: "Managed Units",
        value: rows.reduce((sum, r) => sum + r.unit_count, 0),
      },
      {
        key: "active_tenancies",
        label: "Active Tenancies",
        value: rows.reduce((sum, r) => sum + r.active_tenancy_count, 0),
      },
      {
        key: "needing_attention",
        label: "Needing Attention",
        value: rows.filter((r) => r.attention_state !== "Normal" && r.attention_state !== "normal").length,
      },
    ];
  }, [data]);

  const selectedRow = useMemo(
    () => filteredRows.find((r) => r.landlord_account_id === selectedId) ?? null,
    [filteredRows, selectedId],
  );

  const handleRowClick = useCallback((row: LandlordRow) => {
    setSelectedId((prev) => (prev === row.landlord_account_id ? null : row.landlord_account_id));
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <RefreshCw size={20} className="animate-spin text-fg-muted" aria-label="Loading landlords" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-[length:var(--text-small-size)] text-status-danger">
          {error?.message ?? "Failed to load landlords."}
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
            <Briefcase size={18} className="text-fg-muted" aria-hidden="true" />
            <h1 className="text-[length:var(--text-heading-lg-size)] font-semibold text-fg-default">
              Landlords
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
            {kpiCards.map((card) => (
              <KpiCard
                key={card.key}
                label={card.label}
                value={card.value}
                icon={
                  card.key === "total_landlords" ? <Briefcase size={14} /> :
                  card.key === "managed_units" ? <Building2 size={14} /> :
                  card.key === "active_tenancies" ? <CheckCircle2 size={14} /> :
                  <AlertTriangle size={14} />
                }
              />
            ))}
          </div>

          {/* View tabs + filter chips + search */}
          <div className="flex flex-col gap-3 border-b border-border-default bg-bg-surface px-6 py-3">
            {data.view_summaries.length > 0 && (
              <ViewTabs
                summaries={data.view_summaries}
                activeKey={resolvedView}
                onChange={setActiveView}
              />
            )}
            <FilterChips selected={tierFilter} onChange={setTierFilter} />
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search landlords…"
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
                <Briefcase size={32} className="text-fg-faint" aria-hidden="true" />
                <p className="text-[length:var(--text-small-size)] text-fg-muted">
                  {search || tierFilter ? "No landlords match your filters" : "No landlords in this view"}
                </p>
                {(search || tierFilter) && (
                  <button
                    onClick={() => { setSearch(""); setTierFilter(null); }}
                    className="text-[length:var(--text-small-size)] text-fg-accent underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full border-collapse" aria-label="Landlords list">
                <thead className="sticky top-0 z-10 bg-bg-surface shadow-sm">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Landlord
                    </th>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Service Tier
                    </th>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Units
                    </th>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Active Tenancies
                    </th>
                    <th className="w-8 px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <LandlordTableRow
                      key={row.landlord_account_id}
                      row={row}
                      isSelected={selectedId === row.landlord_account_id}
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
          <LandlordDetailPanel
            row={selectedRow}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
}
