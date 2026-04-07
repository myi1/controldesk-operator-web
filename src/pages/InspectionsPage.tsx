// ---------------------------------------------------------------------------
// InspectionsPage — route: /inspections
//
// Standalone recurring inspection case directory: type, frequency, condition,
// status, make-good flag, and dilapidation count.
// ---------------------------------------------------------------------------

import { useState, useMemo } from "react";
import {
  ClipboardList,
  Calendar,
  AlertCircle,
  Search,
  RefreshCw,
} from "lucide-react";
import { cn } from "../lib/cn";
import { useInspectionsBootstrap } from "../hooks/use-properties";
import type { InspectionCaseRow } from "../types/api";

/* ------------------------------------------------------------------ */
/*  Status config                                                       */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  scheduled: {
    label: "Scheduled",
    className: "bg-status-info-subtle text-status-info border-status-info/20",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-status-warning-subtle text-status-warning border-status-warning/20",
  },
  completed: {
    label: "Completed",
    className: "bg-status-success-subtle text-status-success border-status-success/20",
  },
  closed: {
    label: "Closed",
    className: "bg-bg-muted text-fg-muted border-border-default",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-status-danger-subtle text-status-danger border-status-danger/20",
  },
};

/* ------------------------------------------------------------------ */
/*  Type badge config                                                   */
/* ------------------------------------------------------------------ */

const TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  move_in: {
    label: "Move In",
    className: "bg-status-info-subtle text-status-info border-status-info/20",
  },
  move_out: {
    label: "Move Out",
    className: "bg-[#FFF3E0] text-[#E65100] border-[#E65100]/20",
  },
  periodic: {
    label: "Periodic",
    className: "bg-bg-muted text-fg-muted border-border-default",
  },
  complaint_driven: {
    label: "Complaint",
    className: "bg-status-danger-subtle text-status-danger border-status-danger/20",
  },
  handover: {
    label: "Handover",
    className: "bg-status-success-subtle text-status-success border-status-success/20",
  },
};

/* ------------------------------------------------------------------ */
/*  Condition badge config                                              */
/* ------------------------------------------------------------------ */

const CONDITION_CONFIG: Record<string, { label: string; className: string }> = {
  good: {
    label: "Good",
    className: "bg-status-success-subtle text-status-success border-status-success/20",
  },
  fair: {
    label: "Fair",
    className: "bg-status-warning-subtle text-status-warning border-status-warning/20",
  },
  poor: {
    label: "Poor",
    className: "bg-[#FFF3E0] text-[#E65100] border-[#E65100]/20",
  },
  unacceptable: {
    label: "Unacceptable",
    className: "bg-status-danger-subtle text-status-danger border-status-danger/20",
  },
};

/* ------------------------------------------------------------------ */
/*  Status filter chips                                                 */
/* ------------------------------------------------------------------ */

const STATUS_CHIPS = [
  { label: "All", value: "all" },
  { label: "Scheduled", value: "scheduled" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

/* ------------------------------------------------------------------ */
/*  KPI card                                                            */
/* ------------------------------------------------------------------ */

function KpiCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-border-default bg-bg-surface p-4",
        "flex items-start gap-3",
      )}
    >
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
/*  Status filter chips component                                       */
/* ------------------------------------------------------------------ */

function StatusFilterChips({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
      {STATUS_CHIPS.map((chip) => (
        <button
          key={chip.value}
          onClick={() => onChange(chip.value)}
          className={cn(
            "rounded-full border px-3 py-1 text-[length:var(--text-caption-size)] font-medium transition-colors duration-150",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
            "cursor-pointer",
            selected === chip.value
              ? "border-fg-accent bg-fg-accent/10 text-fg-accent"
              : "border-border-default bg-bg-muted text-fg-muted hover:bg-bg-surface hover:text-fg-default",
          )}
          aria-pressed={selected === chip.value}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Type badge                                                          */
/* ------------------------------------------------------------------ */

function TypeBadge({ type }: { type: string }) {
  const config = TYPE_CONFIG[type] ?? {
    label: type,
    className: "bg-bg-muted text-fg-muted border-border-default",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5",
        "text-[length:var(--text-caption-size)] font-medium leading-none",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Status badge                                                        */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-bg-muted text-fg-muted border-border-default",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5",
        "text-[length:var(--text-caption-size)] font-medium leading-none",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Condition badge                                                     */
/* ------------------------------------------------------------------ */

function ConditionBadge({ condition }: { condition: string | null | undefined }) {
  if (!condition) {
    return (
      <span className="text-[length:var(--text-caption-size)] text-fg-faint">—</span>
    );
  }
  const config = CONDITION_CONFIG[condition] ?? {
    label: condition,
    className: "bg-bg-muted text-fg-muted border-border-default",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5",
        "text-[length:var(--text-caption-size)] font-medium leading-none",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Frequency chip                                                      */
/* ------------------------------------------------------------------ */

function FrequencyChip({ frequency }: { frequency: string }) {
  const LABELS: Record<string, string> = {
    one_off: "One-off",
    quarterly: "Quarterly",
    biannual: "Biannual",
    annual: "Annual",
  };
  return (
    <span className="text-[length:var(--text-caption-size)] text-fg-muted">
      {LABELS[frequency] ?? frequency}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Inspection table row                                                */
/* ------------------------------------------------------------------ */

function InspectionTableRow({ row }: { row: InspectionCaseRow }) {
  return (
    <tr
      className={cn(
        "group border-b border-border-default transition-colors duration-150",
        "hover:bg-bg-muted",
      )}
    >
      {/* Unit */}
      <td className="px-4 py-3">
        <span className="text-[length:var(--text-body-size)] font-medium text-fg-default">
          {row.property_unit_id || "—"}
        </span>
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <TypeBadge type={row.inspection_type} />
      </td>

      {/* Frequency */}
      <td className="px-4 py-3">
        <FrequencyChip frequency={row.frequency} />
      </td>

      {/* Scheduled date */}
      <td className="px-4 py-3 text-[length:var(--text-small-size)] text-fg-default">
        {row.scheduled_date ?? <span className="text-fg-faint">—</span>}
      </td>

      {/* Inspector */}
      <td className="px-4 py-3 text-[length:var(--text-small-size)] text-fg-default">
        {row.inspector_name || <span className="text-fg-faint">—</span>}
      </td>

      {/* Condition */}
      <td className="px-4 py-3">
        <ConditionBadge condition={row.overall_condition} />
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={row.status} />
      </td>

      {/* Make Good */}
      <td className="px-4 py-3 text-center">
        {row.make_good_required ? (
          <AlertCircle
            size={14}
            className="text-status-danger mx-auto"
            aria-label="Make good required"
          />
        ) : (
          <span className="text-fg-faint" aria-label="No make good required">—</span>
        )}
      </td>

      {/* Findings */}
      <td className="px-4 py-3 text-center">
        {row.dilapidation_count > 0 ? (
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full px-1.5 py-0.5",
              "text-[10px] tabular-nums font-medium",
              "bg-bg-muted text-fg-muted",
            )}
          >
            {row.dilapidation_count}
          </span>
        ) : (
          <span className="text-[length:var(--text-caption-size)] text-fg-faint">0</span>
        )}
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                         */
/* ------------------------------------------------------------------ */

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-3 px-4 text-center">
      <ClipboardList size={32} className="text-fg-faint" aria-hidden="true" />
      <p className="text-[length:var(--text-body-size)] font-medium text-fg-muted">
        {filtered ? "No inspections match your filters" : "No inspections scheduled"}
      </p>
      {!filtered && (
        <p className="text-[length:var(--text-small-size)] text-fg-faint">
          Use the Schedule Inspection button to create the first one.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                    */
/* ------------------------------------------------------------------ */

function LoadingSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading inspections"
      className="space-y-2 p-6"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-10 animate-pulse rounded-[var(--radius-md)] bg-bg-muted"
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */

export default function InspectionsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useInspectionsBootstrap();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredRows = useMemo(() => {
    if (!data) return [];
    let rows = data.inspection_rows;

    if (statusFilter !== "all") {
      if (statusFilter === "completed") {
        rows = rows.filter(
          (r) => r.status === "completed" || r.status === "closed",
        );
      } else {
        rows = rows.filter((r) => r.status === statusFilter);
      }
    }

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.property_unit_id.toLowerCase().includes(q) ||
          r.inspector_name.toLowerCase().includes(q),
      );
    }

    return rows;
  }, [data, statusFilter, search]);

  const isFiltered = statusFilter !== "all" || search.trim().length > 0;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-[length:var(--text-small-size)] text-status-danger">
          {error?.message ?? "Failed to load inspections."}
        </p>
        <button
          onClick={() => void refetch()}
          className={cn(
            "rounded-[var(--radius-md)] border border-border-default bg-bg-surface px-4 py-2",
            "text-[length:var(--text-small-size)] text-fg-default hover:bg-bg-muted",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
            "cursor-pointer",
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
            <ClipboardList size={18} className="text-fg-muted" aria-hidden="true" />
            <h1 className="text-[length:var(--text-heading-lg-size)] font-semibold text-fg-default">
              Inspections
            </h1>
            {isFetching && !isLoading && (
              <RefreshCw
                size={13}
                className="animate-spin text-fg-faint"
                aria-hidden="true"
              />
            )}
          </div>
          <button
            onClick={() => void refetch()}
            className={cn(
              "flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border-default",
              "px-3 py-1.5 text-[length:var(--text-small-size)] text-fg-muted",
              "hover:bg-bg-muted hover:text-fg-default transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
              "cursor-pointer",
            )}
          >
            <Calendar size={13} aria-hidden="true" />
            Schedule Inspection
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 border-b border-border-default bg-bg-app px-6 py-4 lg:grid-cols-4">
          <KpiCard
            label="Total"
            value={data.total_count}
            icon={<ClipboardList size={14} />}
          />
          <KpiCard
            label="Scheduled"
            value={data.scheduled_count}
            icon={<Calendar size={14} />}
          />
          <KpiCard
            label="In Progress"
            value={data.in_progress_count}
            icon={<RefreshCw size={14} />}
          />
          <KpiCard
            label="Make Good Required"
            value={data.make_good_required_count}
            icon={<AlertCircle size={14} />}
          />
        </div>

        {/* Status filter + search */}
        <div className="flex flex-col gap-3 border-b border-border-default bg-bg-surface px-6 py-3">
          <StatusFilterChips selected={statusFilter} onChange={setStatusFilter} />
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search by unit or inspector…"
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
            <EmptyState filtered={isFiltered} />
          ) : (
            <table className="w-full border-collapse" aria-label="Inspections list">
              <thead className="sticky top-0 z-10 bg-bg-surface shadow-sm">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                    Unit
                  </th>
                  <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                    Type
                  </th>
                  <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                    Frequency
                  </th>
                  <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                    Scheduled
                  </th>
                  <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                    Inspector
                  </th>
                  <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                    Condition
                  </th>
                  <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-center text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                    Make Good
                  </th>
                  <th className="px-4 py-2.5 text-center text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                    Findings
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <InspectionTableRow key={row.entity_id} row={row} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
