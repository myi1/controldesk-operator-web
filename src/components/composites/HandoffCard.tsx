import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { Badge, type BadgeVariant } from "../primitives/Badge";
import { Button } from "../primitives/Button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface HandoffCardProps {
  fromTeam: string;
  toTeam: string;
  status: string;
  onAccept?: () => void;
  onReturn?: () => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Status variant mapping                                             */
/* ------------------------------------------------------------------ */

const statusVariantMap: Record<string, BadgeVariant> = {
  pending: "neutral",
  prepared: "info",
  pending_acceptance: "warning",
  accepted: "success",
  returned_for_input: "danger",
};

function getStatusVariant(status: string): BadgeVariant {
  return statusVariantMap[status] ?? "neutral";
}

function formatStatusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function HandoffCard({
  fromTeam,
  toTeam,
  status,
  onAccept,
  onReturn,
  className,
}: HandoffCardProps) {
  const showActions = onAccept || onReturn;

  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)]",
        "border border-border-default",
        "bg-bg-default",
        "p-4",
        className,
      )}
    >
      {/* Teams row */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "truncate",
            "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
            "font-[number:var(--text-body-medium-weight)]",
            "text-fg-default",
          )}
        >
          {fromTeam}
        </span>
        <ArrowRight size={14} className="shrink-0 text-fg-muted" aria-hidden="true" />
        <span
          className={cn(
            "truncate",
            "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
            "font-[number:var(--text-body-medium-weight)]",
            "text-fg-default",
          )}
        >
          {toTeam}
        </span>
      </div>

      {/* Status badge */}
      <div className="mt-2">
        <Badge variant={getStatusVariant(status)} size="sm">
          {formatStatusLabel(status)}
        </Badge>
      </div>

      {/* Action buttons */}
      {showActions && (
        <div className="mt-3 flex items-center gap-2">
          {onAccept && (
            <Button variant="primary" size="sm" onClick={onAccept}>
              Accept
            </Button>
          )}
          {onReturn && (
            <Button variant="secondary" size="sm" onClick={onReturn}>
              Return
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
