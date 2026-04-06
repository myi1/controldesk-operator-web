import { ShieldCheck, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { Badge, type BadgeVariant } from "../primitives/Badge";
import { Button } from "../primitives/Button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ApprovalCardProps {
  requestType: string;
  requester: string;
  status: string;
  reviewer?: string;
  onApprove?: () => void;
  onReject?: () => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Status variant mapping                                             */
/* ------------------------------------------------------------------ */

const statusVariantMap: Record<string, BadgeVariant> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  cancelled: "neutral",
};

function getStatusVariant(status: string): BadgeVariant {
  return statusVariantMap[status] ?? "neutral";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ApprovalCard({
  requestType,
  requester,
  status,
  reviewer,
  onApprove,
  onReject,
  className,
}: ApprovalCardProps) {
  const isPending = status === "pending";
  const showActions = isPending && (onApprove || onReject);

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
      {/* Header: type badge + status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck size={14} className="shrink-0 text-fg-muted" aria-hidden="true" />
          <Badge variant="default" size="sm">
            {requestType}
          </Badge>
        </div>
        <Badge variant={getStatusVariant(status)} size="sm">
          {status}
        </Badge>
      </div>

      {/* Requester */}
      <div className="mt-2">
        <span
          className={cn(
            "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
            "text-fg-muted",
          )}
        >
          Requested by
        </span>
        <span
          className={cn(
            "ml-1",
            "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
            "text-fg-default",
          )}
        >
          {requester}
        </span>
      </div>

      {/* Reviewer (when decided) */}
      {reviewer && !isPending && (
        <div className="mt-1">
          <span
            className={cn(
              "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
              "text-fg-muted",
            )}
          >
            Reviewed by
          </span>
          <span
            className={cn(
              "ml-1",
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "text-fg-default",
            )}
          >
            {reviewer}
          </span>
        </div>
      )}

      {/* Action buttons */}
      {showActions && (
        <div className="mt-3 flex items-center gap-2">
          {onApprove && (
            <Button variant="primary" size="sm" icon={ThumbsUp} onClick={onApprove}>
              Approve
            </Button>
          )}
          {onReject && (
            <Button variant="danger" size="sm" icon={ThumbsDown} onClick={onReject}>
              Reject
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
