import { cn } from "../../lib/cn";
import { Progress, type ProgressVariant } from "../primitives/Progress";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SLAMeterProps {
  /** Elapsed time in minutes. */
  elapsed: number;
  /** Total SLA budget in minutes. */
  budget: number;
  /** Whether the SLA has been breached. */
  breached: boolean;
  label?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatMinutes(minutes: number): string {
  if (minutes < 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SLAMeter({
  elapsed,
  budget,
  breached,
  label,
  className,
}: SLAMeterProps) {
  const pct = budget > 0 ? (elapsed / budget) * 100 : 0;
  const remaining = budget - elapsed;

  let variant: ProgressVariant;
  let statusColor: string;

  if (breached || pct > 100) {
    variant = "danger";
    statusColor = "text-status-danger";
  } else if (pct >= 70) {
    variant = "warning";
    statusColor = "text-status-warning";
  } else {
    variant = "success";
    statusColor = "text-status-success";
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/* Header row */}
      <div className="flex items-center justify-between">
        {label && (
          <span className="text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)] text-fg-muted">
            {label}
          </span>
        )}
        <span
          className={cn(
            "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
            "font-[number:var(--text-caption-medium-weight)]",
            statusColor,
          )}
        >
          {breached ? "BREACHED" : `${formatMinutes(remaining)} remaining`}
        </span>
      </div>

      {/* Progress bar */}
      <Progress
        value={Math.min(pct, 100)}
        max={100}
        variant={variant}
        size="sm"
      />
    </div>
  );
}
