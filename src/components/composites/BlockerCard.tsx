import { AlertTriangle, X, ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { formatRelative } from "../../lib/date";
import { Button } from "../primitives/Button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface BlockerCardProps {
  reason: string;
  since?: string;
  waitingOn?: string;
  onRemove?: () => void;
  onEscalate?: () => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BlockerCard({
  reason,
  since,
  waitingOn,
  onRemove,
  onEscalate,
  className,
}: BlockerCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)]",
        "border border-status-warning/30",
        "border-l-[3px] border-l-status-warning",
        "bg-status-warning-subtle",
        "p-3",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2">
        <AlertTriangle
          size={16}
          className="mt-0.5 shrink-0 text-status-warning"
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[length:var(--text-small-size)] leading-[var(--text-small-leading)] font-[number:var(--text-body-medium-weight)] text-fg-default">
            {reason}
          </p>

          {/* Meta */}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)] text-fg-muted">
            {since && <span>Since {formatRelative(since)}</span>}
            {waitingOn && <span>Waiting on {waitingOn}</span>}
          </div>
        </div>
      </div>

      {/* Actions */}
      {(onRemove || onEscalate) && (
        <div className="mt-2 flex items-center gap-2 pl-6">
          {onRemove && (
            <Button variant="ghost" size="sm" icon={X} onClick={onRemove}>
              Remove
            </Button>
          )}
          {onEscalate && (
            <Button variant="ghost" size="sm" icon={ArrowUpRight} onClick={onEscalate}>
              Escalate
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
