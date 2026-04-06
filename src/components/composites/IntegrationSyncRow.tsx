import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Cloud,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { formatRelative } from "../../lib/date";
import { Badge, type BadgeVariant } from "../primitives/Badge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface IntegrationSyncRowProps {
  system: string;
  direction: string;
  status: string;
  retryState?: string;
  lastAttempt?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Direction icon                                                     */
/* ------------------------------------------------------------------ */

const directionIconMap: Record<string, LucideIcon> = {
  outbound: ArrowUpRight,
  inbound: ArrowDownLeft,
  bidirectional: RefreshCw,
};

function DirectionIcon({ direction, size, className }: { direction: string; size: number; className?: string }) {
  const Icon = directionIconMap[direction] ?? RefreshCw;
  return <Icon size={size} className={className} aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/*  Status variant                                                     */
/* ------------------------------------------------------------------ */

const statusVariantMap: Record<string, BadgeVariant> = {
  synced: "success",
  pending: "warning",
  failed: "danger",
  retrying: "info",
  queued: "neutral",
};

function getStatusVariant(status: string): BadgeVariant {
  return statusVariantMap[status] ?? "neutral";
}

/* ------------------------------------------------------------------ */
/*  Retry state variant                                                */
/* ------------------------------------------------------------------ */

const retryVariantMap: Record<string, BadgeVariant> = {
  scheduled: "info",
  exhausted: "danger",
  manual: "warning",
};

function getRetryVariant(state: string): BadgeVariant {
  return retryVariantMap[state] ?? "neutral";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function IntegrationSyncRow({
  system,
  direction,
  status,
  retryState,
  lastAttempt,
  className,
}: IntegrationSyncRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        "py-2 px-1",
        className,
      )}
    >
      {/* System icon + label */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Cloud size={14} className="shrink-0 text-fg-muted" aria-hidden="true" />
        <span
          className={cn(
            "truncate",
            "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
            "text-fg-default",
          )}
        >
          {system}
        </span>
      </div>

      {/* Direction arrow */}
      <DirectionIcon direction={direction} size={14} className="shrink-0 text-fg-muted" />

      {/* Status badge */}
      <Badge variant={getStatusVariant(status)} size="sm">
        {status}
      </Badge>

      {/* Retry state */}
      {retryState && (
        <Badge variant={getRetryVariant(retryState)} size="sm">
          {retryState}
        </Badge>
      )}

      {/* Last attempt */}
      {lastAttempt && (
        <span
          className={cn(
            "shrink-0",
            "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
            "text-fg-muted",
          )}
        >
          {formatRelative(lastAttempt)}
        </span>
      )}
    </div>
  );
}
