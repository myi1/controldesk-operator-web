// ---------------------------------------------------------------------------
// InspectionDetailPage — route: /inspections/:id
//
// Full inspection detail with tabs: Overview, Dilapidation Items, Timeline,
// Actions. Stage-aware action buttons use the inspection runner configs.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import { cn } from "../lib/cn";
import { useInspectionDetail } from "../hooks/use-properties";
import { RUNNER_REGISTRY } from "../config/runners";
import type { RunnerConfig } from "../types/runner";
import type { InspectionDetailResponse, DilapidationItemRow } from "../types/api";
import { TransitionRunner } from "../components/runners";
import { Skeleton } from "../components/primitives/Skeleton";

/* ------------------------------------------------------------------ */
/*  Status / type config — mirrors InspectionsPage                     */
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

const TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  move_in: {
    label: "Move In",
    className: "bg-status-info-subtle text-status-info border-status-info/20",
  },
  move_out: {
    label: "Move Out",
    className: "bg-orange-50 text-orange-700 border-orange-200",
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
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  unacceptable: {
    label: "Unacceptable",
    className: "bg-status-danger-subtle text-status-danger border-status-danger/20",
  },
};

/* ------------------------------------------------------------------ */
/*  Badge components                                                    */
/* ------------------------------------------------------------------ */

function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5",
        "text-[length:var(--text-caption-size)] font-medium leading-none",
        className,
      )}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-bg-muted text-fg-muted border-border-default",
  };
  return <Badge className={config.className}>{config.label}</Badge>;
}

function TypeBadge({ type }: { type: string }) {
  const config = TYPE_CONFIG[type] ?? {
    label: type,
    className: "bg-bg-muted text-fg-muted border-border-default",
  };
  return <Badge className={config.className}>{config.label}</Badge>;
}

function ConditionBadge({ condition }: { condition: string }) {
  const config = CONDITION_CONFIG[condition] ?? {
    label: condition,
    className: "bg-bg-muted text-fg-muted border-border-default",
  };
  return <Badge className={config.className}>{config.label}</Badge>;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function fmtDate(val: string | null | undefined): string {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return val;
  }
}

function fmtCurrency(val: number | null | undefined): string {
  if (val == null) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

const FREQ_LABELS: Record<string, string> = {
  one_off: "One-off",
  quarterly: "Quarterly",
  biannual: "Biannual",
  annual: "Annual",
};

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                    */
/* ------------------------------------------------------------------ */

function PageSkeleton() {
  return (
    <div className="animate-in fade-in-0 duration-300">
      <div className="px-6 py-4 border-b border-border-default">
        <Skeleton variant="text" width="80px" />
        <div className="mt-3 space-y-2">
          <Skeleton variant="text" width="200px" height="28px" />
          <div className="flex gap-2 mt-2">
            <Skeleton variant="text" width="80px" height="22px" />
            <Skeleton variant="text" width="80px" height="22px" />
          </div>
        </div>
      </div>
      <div className="px-6 py-2.5 border-b border-border-default flex gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} variant="text" width="70px" />
        ))}
      </div>
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        <Skeleton variant="card" height="180px" />
        <Skeleton variant="card" height="120px" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Overview                                                       */
/* ------------------------------------------------------------------ */

function OverviewField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border-default bg-bg-default p-3">
      <dt className="text-[length:var(--text-caption-size)] text-fg-muted mb-1">{label}</dt>
      <dd className="text-[length:var(--text-small-size)] text-fg-default">{children}</dd>
    </div>
  );
}

function OverviewTab({ data }: { data: InspectionDetailResponse }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-[length:var(--text-small-size)] font-semibold text-fg-default mb-3">
          Inspection Details
        </h3>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <OverviewField label="Inspection Type">
            <TypeBadge type={data.inspection_type} />
          </OverviewField>
          <OverviewField label="Frequency">
            {FREQ_LABELS[data.frequency] ?? data.frequency}
          </OverviewField>
          <OverviewField label="Status">
            <StatusBadge status={data.status} />
          </OverviewField>
          <OverviewField label="Overall Condition">
            {data.overall_condition ? (
              <ConditionBadge condition={data.overall_condition} />
            ) : (
              "—"
            )}
          </OverviewField>
          <OverviewField label="Scheduled Date">{fmtDate(data.scheduled_date)}</OverviewField>
          <OverviewField label="Actual Date">{fmtDate(data.actual_date)}</OverviewField>
          <OverviewField label="Inspector">{data.inspector_name || "—"}</OverviewField>
          <OverviewField label="Make Good Required">
            {data.make_good_required ? (
              <span className="flex items-center gap-1 text-status-danger">
                <AlertCircle size={13} aria-hidden="true" />
                Yes
              </span>
            ) : (
              "No"
            )}
          </OverviewField>
          <OverviewField label="Evidence Reference">
            {data.evidence_reference || "—"}
          </OverviewField>
          <OverviewField label="Report Reference">
            {data.report_reference || "—"}
          </OverviewField>
          <OverviewField label="Next Inspection Due">
            {fmtDate(data.next_inspection_due)}
          </OverviewField>
          <OverviewField label="Make Good Notes">
            {data.make_good_notes || "—"}
          </OverviewField>
        </dl>
      </section>

      <section>
        <h3 className="text-[length:var(--text-small-size)] font-semibold text-fg-default mb-3">
          Assignment
        </h3>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <OverviewField label="Current Owner Role">{data.current_owner_role || "—"}</OverviewField>
          <OverviewField label="Unit">{data.unit_label ?? data.property_unit_id}</OverviewField>
          <OverviewField label="Tenancy Record">
            {data.tenancy_record_id || "—"}
          </OverviewField>
          <OverviewField label="Landlord Account">
            {data.landlord_account_id || "—"}
          </OverviewField>
        </dl>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Dilapidation Items                                             */
/* ------------------------------------------------------------------ */

function DilapidationTab({ items }: { items: DilapidationItemRow[] }) {
  if (items.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
        <ClipboardList size={32} className="text-fg-faint" aria-hidden="true" />
        <p className="text-[length:var(--text-body-size)] font-medium text-fg-muted">
          No dilapidation items recorded
        </p>
        <p className="text-[length:var(--text-small-size)] text-fg-faint">
          Dilapidation items are added during inspection completion.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" aria-label="Dilapidation items">
        <thead className="sticky top-0 z-10 bg-bg-surface shadow-sm">
          <tr>
            <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
              Room / Area
            </th>
            <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
              Condition
            </th>
            <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
              Description
            </th>
            <th className="px-4 py-2.5 text-center text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
              Make Good?
            </th>
            <th className="px-4 py-2.5 text-right text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
              Cost Estimate
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.item_id}
              className="border-b border-border-default hover:bg-bg-muted transition-colors duration-150"
            >
              <td className="px-4 py-3 text-[length:var(--text-small-size)] font-medium text-fg-default">
                {item.room_area}
              </td>
              <td className="px-4 py-3">
                <ConditionBadge condition={item.condition} />
              </td>
              <td className="px-4 py-3 text-[length:var(--text-small-size)] text-fg-default">
                {item.description || "—"}
              </td>
              <td className="px-4 py-3 text-center">
                {item.make_good_required ? (
                  <AlertCircle
                    size={14}
                    className="text-status-danger mx-auto"
                    aria-label="Make good required"
                  />
                ) : (
                  <span className="text-fg-faint" aria-label="No make good required">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-right text-[length:var(--text-small-size)] text-fg-default tabular-nums">
                {fmtCurrency(item.cost_estimate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Timeline (placeholder)                                         */
/* ------------------------------------------------------------------ */

function TimelineTab() {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-3 text-center">
      <div className="rounded-[var(--radius-lg)] border border-border-default bg-bg-surface p-6 w-full max-w-sm">
        <p className="text-[length:var(--text-body-size)] font-medium text-fg-muted">
          Audit timeline coming soon
        </p>
        <p className="mt-1 text-[length:var(--text-small-size)] text-fg-faint">
          Full audit history will be available in a future release.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Actions                                                        */
/* ------------------------------------------------------------------ */

function ActionsTab({
  status,
  onRunnerOpen,
}: {
  status: string;
  onRunnerOpen: (runnerId: string) => void;
}) {
  const startRunner = RUNNER_REGISTRY.get("inspection.start") as RunnerConfig | undefined;
  const completeRunner = RUNNER_REGISTRY.get("inspection.complete") as RunnerConfig | undefined;
  const closeRunner = RUNNER_REGISTRY.get("inspection.close") as RunnerConfig | undefined;

  const actionButtonClass = cn(
    "flex items-center gap-2 rounded-[var(--radius-md)]",
    "bg-action-primary-default px-4 py-2 text-[length:var(--text-small-size)] text-white",
    "hover:bg-action-primary-hover transition-colors duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
    "disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
  );

  if (status === "scheduled" && startRunner) {
    return (
      <div className="space-y-4">
        <p className="text-[length:var(--text-small-size)] text-fg-muted">
          This inspection is scheduled. Start it to record the inspector and actual date.
        </p>
        <button
          className={actionButtonClass}
          onClick={() => onRunnerOpen("inspection.start")}
          aria-label="Start this inspection"
        >
          Start Inspection
        </button>
      </div>
    );
  }

  if (status === "in_progress" && completeRunner) {
    return (
      <div className="space-y-4">
        <p className="text-[length:var(--text-small-size)] text-fg-muted">
          This inspection is in progress. Complete it to record findings and condition.
        </p>
        <button
          className={actionButtonClass}
          onClick={() => onRunnerOpen("inspection.complete")}
          aria-label="Complete this inspection"
        >
          Complete Inspection
        </button>
      </div>
    );
  }

  if (status === "completed" && closeRunner) {
    return (
      <div className="space-y-4">
        <p className="text-[length:var(--text-small-size)] text-fg-muted">
          This inspection is completed. Close it once all make-good work is resolved.
        </p>
        <button
          className={actionButtonClass}
          onClick={() => onRunnerOpen("inspection.close")}
          aria-label="Close this inspection"
        >
          Close Inspection
        </button>
      </div>
    );
  }

  if (status === "closed") {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border-default bg-bg-surface p-4">
        <p className="text-[length:var(--text-small-size)] text-fg-muted">
          This inspection is closed. No further actions are available.
        </p>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border-default bg-bg-surface p-4">
        <p className="text-[length:var(--text-small-size)] text-fg-muted">
          This inspection has been cancelled.
        </p>
      </div>
    );
  }

  // Fallback — runner not registered or unknown status
  return (
    <div className="rounded-[var(--radius-lg)] border border-border-default bg-bg-surface p-4">
      <p className="text-[length:var(--text-small-size)] text-fg-faint">
        No actions available for the current status.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab bar                                                             */
/* ------------------------------------------------------------------ */

type TabId = "overview" | "dilapidation" | "timeline" | "actions";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "dilapidation", label: "Dilapidation Items" },
  { id: "timeline", label: "Timeline" },
  { id: "actions", label: "Actions" },
];

function TabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
}) {
  return (
    <div
      className="flex gap-1 border-b border-border-default bg-bg-surface px-6 overflow-x-auto"
      role="tablist"
      aria-label="Inspection detail tabs"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-3 py-2.5 text-[length:var(--text-small-size)] font-medium whitespace-nowrap",
            "border-b-2 transition-colors duration-150 -mb-px",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
            "cursor-pointer",
            active === tab.id
              ? "border-fg-accent text-fg-accent"
              : "border-transparent text-fg-muted hover:text-fg-default",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */

export default function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useInspectionDetail(id ?? null);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [activeRunnerId, setActiveRunnerId] = useState<string | null>(null);

  const activeRunnerConfig = activeRunnerId
    ? (RUNNER_REGISTRY.get(activeRunnerId) as RunnerConfig | undefined)
    : undefined;

  function handleRunnerSuccess() {
    void queryClient.invalidateQueries({ queryKey: ["inspection-detail", id] });
    void queryClient.invalidateQueries({ queryKey: ["inspections-bootstrap"] });
  }

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-[length:var(--text-small-size)] text-status-danger">
          {error?.message ?? "Failed to load inspection detail."}
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

  const typeConfig = TYPE_CONFIG[data.inspection_type] ?? {
    label: data.inspection_type,
    className: "bg-bg-muted text-fg-muted border-border-default",
  };

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border-default bg-bg-surface px-6 py-4">
          {/* Back button */}
          <button
            onClick={() => void navigate("/inspections")}
            className={cn(
              "mb-3 flex items-center gap-1.5 text-[length:var(--text-small-size)] text-fg-muted",
              "hover:text-fg-default transition-colors duration-150",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
              "cursor-pointer",
            )}
            aria-label="Back to Inspections"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Inspections
          </button>

          {/* Title row */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={typeConfig.className}>{typeConfig.label}</Badge>
                <StatusBadge status={data.status} />
                {data.make_good_required && (
                  <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                    Make Good Required
                  </Badge>
                )}
              </div>
              <h1 className="text-[length:var(--text-heading-lg-size)] font-semibold text-fg-default">
                {data.unit_label ?? data.property_unit_id}
              </h1>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <TabBar active={activeTab} onChange={setActiveTab} />

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-6">
            {activeTab === "overview" && <OverviewTab data={data} />}
            {activeTab === "dilapidation" && (
              <DilapidationTab items={data.dilapidation_items} />
            )}
            {activeTab === "timeline" && <TimelineTab />}
            {activeTab === "actions" && (
              <ActionsTab
                status={data.status}
                onRunnerOpen={(runnerId) => setActiveRunnerId(runnerId)}
              />
            )}
          </div>
        </div>
      </div>

      {/* TransitionRunner modal */}
      {activeRunnerConfig && (
        <TransitionRunner
          open={!!activeRunnerId}
          onOpenChange={(open) => {
            if (!open) setActiveRunnerId(null);
          }}
          config={activeRunnerConfig}
          recordId={id ?? ""}
          onSuccess={handleRunnerSuccess}
        />
      )}
    </>
  );
}
