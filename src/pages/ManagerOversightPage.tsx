// ---------------------------------------------------------------------------
// ManagerOversightPage — route: /oversight
//
// Manager-only dashboard: SLA breach panel, key count metrics, and a
// "Process Reminders" trigger to scan and mark overdue SLA clocks.
// ---------------------------------------------------------------------------

import { useState, useCallback } from "react";
import {
  AlertTriangle,
  Clock,
  CheckSquare,
  FileWarning,
  RefreshCw,
  Play,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "../lib/cn";
import { Button } from "../components/primitives/Button";
import { Badge } from "../components/primitives/Badge";
import { Skeleton } from "../components/primitives/Skeleton";
import { ErrorBanner } from "../components/composites/ErrorBanner";
import { fetchManagerOversightBootstrap, fetchSLABreaches, processReminders } from "../api/manager-oversight";
import type { ManagerOversightBootstrapResponse, SLABreachSummary, ProcessRemindersResponse } from "../types/api";

/* ------------------------------------------------------------------ */
/*  Metric card                                                         */
/* ------------------------------------------------------------------ */

interface MetricCardProps {
  label: string;
  value: number | undefined;
  icon: React.ReactNode;
  variant: "danger" | "warning" | "info" | "neutral";
  loading?: boolean;
}

const VARIANT_STYLES: Record<MetricCardProps["variant"], { card: string; icon: string; value: string }> = {
  danger:  { card: "border-status-danger/20 bg-status-danger-subtle",  icon: "text-status-danger",  value: "text-status-danger" },
  warning: { card: "border-status-warning/20 bg-status-warning-subtle", icon: "text-status-warning", value: "text-status-warning" },
  info:    { card: "border-status-info/20 bg-status-info-subtle",       icon: "text-status-info",    value: "text-status-info" },
  neutral: { card: "border-border-default bg-bg-surface",               icon: "text-fg-muted",       value: "text-fg-default" },
};

function MetricCard({ label, value, icon, variant, loading }: MetricCardProps) {
  const styles = VARIANT_STYLES[variant];
  return (
    <div className={cn(
      "flex items-center gap-3 rounded-[var(--radius-lg)] border p-4",
      styles.card,
    )}>
      <div className={cn("shrink-0", styles.icon)} aria-hidden="true">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)] text-fg-muted truncate">
          {label}
        </p>
        {loading ? (
          <Skeleton className="mt-1 h-5 w-8" />
        ) : (
          <p className={cn(
            "text-[length:var(--text-h3-size)] font-[number:var(--text-h3-weight)] leading-none mt-0.5",
            styles.value,
          )}>
            {value ?? 0}
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SLA breach row                                                      */
/* ------------------------------------------------------------------ */

function formatBreachHours(hours: number | null): string {
  if (hours === null) return "—";
  if (hours < 1) return `${Math.round(hours * 60)}m overdue`;
  if (hours < 24) return `${hours.toFixed(1)}h overdue`;
  return `${(hours / 24).toFixed(1)}d overdue`;
}

function SLABreachRow({ breach }: { breach: SLABreachSummary }) {
  const isLongOverdue = (breach.breach_hours ?? 0) > 24;

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-2.5",
      "transition-colors duration-[var(--duration-fast)]",
      isLongOverdue
        ? "border-status-danger/20 bg-status-danger-subtle hover:bg-status-danger/10"
        : "border-status-warning/20 bg-status-warning-subtle hover:bg-status-warning/10",
    )}>
      {/* Clock icon */}
      <div className={cn(
        "shrink-0",
        isLongOverdue ? "text-status-danger" : "text-status-warning",
      )} aria-hidden="true">
        <Clock size={14} />
      </div>

      {/* Case info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="text-[length:var(--text-small-size)] font-medium leading-[var(--text-small-leading)] text-fg-default truncate">
            {breach.case_id ?? "—"}
          </span>
          {breach.case_type && (
            <Badge variant="neutral" size="sm">
              {breach.case_type.replace(/_/g, " ")}
            </Badge>
          )}
          {breach.clock_code && (
            <Badge variant="sla-watch" size="sm">
              {breach.clock_code.replace(/_/g, " ")}
            </Badge>
          )}
        </div>
        <p className="text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)] text-fg-muted mt-0.5 truncate">
          Owner: {breach.current_owner_role ?? "—"}
          {breach.breach_reason ? ` · ${breach.breach_reason}` : ""}
        </p>
      </div>

      {/* Overdue duration */}
      <div className="shrink-0 text-right">
        <span className={cn(
          "text-[length:var(--text-caption-size)] font-medium leading-none",
          isLongOverdue ? "text-status-danger" : "text-status-warning",
        )}>
          {formatBreachHours(breach.breach_hours)}
        </span>
      </div>

      <ChevronRight size={12} className="shrink-0 text-fg-faint" aria-hidden="true" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Process reminders result banner                                     */
/* ------------------------------------------------------------------ */

function RemindersResultBanner({ result }: { result: ProcessRemindersResponse }) {
  return (
    <div className={cn(
      "rounded-[var(--radius-md)] border px-3 py-2.5",
      "border-status-success/20 bg-status-success-subtle",
      "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)] text-status-success",
    )}>
      <p className="font-medium">Reminders processed</p>
      <p className="text-fg-muted mt-0.5">
        {result.sla_clocks_breached} clock{result.sla_clocks_breached !== 1 ? "s" : ""} marked breached
        · {result.reminder_events_created} reminder event{result.reminder_events_created !== 1 ? "s" : ""} created
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ManagerOversightPage() {
  const queryClient = useQueryClient();
  const [remindersResult, setRemindersResult] = useState<ProcessRemindersResponse | null>(null);

  const {
    data: oversight,
    isLoading: oversightLoading,
    isError: oversightError,
    refetch: refetchOversight,
  } = useQuery<ManagerOversightBootstrapResponse>({
    queryKey: ["manager-oversight-bootstrap"],
    queryFn: () => fetchManagerOversightBootstrap(),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const {
    data: breaches,
    isLoading: breachesLoading,
    isError: breachesError,
    refetch: refetchBreaches,
  } = useQuery<SLABreachSummary[]>({
    queryKey: ["sla-breaches"],
    queryFn: () => fetchSLABreaches(),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const { mutate: runProcessReminders, isPending: processingReminders } = useMutation({
    mutationFn: () => processReminders(),
    onSuccess: (result) => {
      setRemindersResult(result);
      void queryClient.invalidateQueries({ queryKey: ["sla-breaches"] });
      void queryClient.invalidateQueries({ queryKey: ["manager-oversight-bootstrap"] });
    },
  });

  const handleRefresh = useCallback(() => {
    void refetchOversight();
    void refetchBreaches();
    setRemindersResult(null);
  }, [refetchOversight, refetchBreaches]);

  const metrics = [
    {
      label: "SLA Breaches",
      value: oversight?.sla_breach_count,
      icon: <ShieldAlert size={18} />,
      variant: "danger" as const,
    },
    {
      label: "Escalations",
      value: oversight?.escalation_case_count,
      icon: <AlertTriangle size={18} />,
      variant: "warning" as const,
    },
    {
      label: "Pending Approvals",
      value: oversight?.pending_approval_count,
      icon: <CheckSquare size={18} />,
      variant: "info" as const,
    },
    {
      label: "Blocked Cases",
      value: oversight?.blocked_case_count,
      icon: <FileWarning size={18} />,
      variant: "warning" as const,
    },
    {
      label: "Overdue Instalments",
      value: oversight?.overdue_instalments_count,
      icon: <Clock size={18} />,
      variant: "warning" as const,
    },
    {
      label: "Inspections Due",
      value: oversight?.inspection_due_count,
      icon: <Clock size={18} />,
      variant: "neutral" as const,
    },
    {
      label: "Renewal Deadlines",
      value: oversight?.renewal_deadline_count,
      icon: <Clock size={18} />,
      variant: "neutral" as const,
    },
    {
      label: "Ejari Pending",
      value: oversight?.ejari_pending_count,
      icon: <FileWarning size={18} />,
      variant: "neutral" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[length:var(--text-h2-size)] font-[number:var(--text-h2-weight)] leading-[var(--text-h2-leading)] text-fg-default">
            Manager Oversight
          </h1>
          <p className="text-[length:var(--text-small-size)] leading-[var(--text-small-leading)] text-fg-muted mt-0.5">
            SLA clocks, escalations, and workflow health across all lifecycles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={handleRefresh}
            aria-label="Refresh oversight data"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Play}
            loading={processingReminders}
            onClick={() => runProcessReminders()}
            aria-label="Process SLA reminders"
          >
            Process Reminders
          </Button>
        </div>
      </div>

      {/* Process reminders result */}
      {remindersResult && (
        <RemindersResultBanner result={remindersResult} />
      )}

      {/* Error states */}
      {oversightError && (
        <ErrorBanner
          title="Failed to load oversight data."
          message="You may not have the required manager role."
        />
      )}

      {/* Metrics grid */}
      <section aria-label="Key metrics">
        <h2 className="sr-only">Key Metrics</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metrics.map((m) => (
            <MetricCard
              key={m.label}
              label={m.label}
              value={m.value}
              icon={m.icon}
              variant={m.variant}
              loading={oversightLoading}
            />
          ))}
        </div>
      </section>

      {/* SLA breach panel */}
      <section aria-label="SLA Breach List">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[length:var(--text-small-size)] font-semibold leading-[var(--text-small-leading)] text-fg-default uppercase tracking-wider">
            Active SLA Breaches
          </h2>
          {!breachesLoading && breaches && (
            <Badge
              variant={breaches.length > 0 ? "danger" : "success"}
              size="sm"
            >
              {breaches.length} {breaches.length === 1 ? "breach" : "breaches"}
            </Badge>
          )}
        </div>

        {breachesError && (
          <ErrorBanner title="Failed to load SLA breach data." />
        )}

        {breachesLoading && (
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-[var(--radius-md)]" />
            ))}
          </div>
        )}

        {!breachesLoading && !breachesError && breaches && breaches.length === 0 && (
          <div className={cn(
            "flex flex-col items-center justify-center gap-2 py-10",
            "rounded-[var(--radius-lg)] border border-border-default bg-bg-surface",
            "text-center",
          )}>
            <CheckSquare size={24} className="text-status-success" aria-hidden="true" />
            <p className="text-[length:var(--text-small-size)] font-medium text-fg-default">
              No active SLA breaches
            </p>
            <p className="text-[length:var(--text-caption-size)] text-fg-muted">
              All SLA clocks are within their target windows
            </p>
          </div>
        )}

        {!breachesLoading && !breachesError && breaches && breaches.length > 0 && (
          <div className="flex flex-col gap-2" role="list" aria-label="SLA breaches">
            {breaches.map((breach) => (
              <div key={breach.entity_id ?? breach.case_id} role="listitem">
                <SLABreachRow breach={breach} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
