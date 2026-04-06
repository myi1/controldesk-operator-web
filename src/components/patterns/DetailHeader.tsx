import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Clock, ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/cn";
import type { CaseDetail, ProtectedAction } from "../../types/api";
import type { EscalationState } from "../../types/enums";
import { StatusBadge } from "../composites/StatusBadge";
import { DueIndicator } from "../composites/DueIndicator";
import { OwnerChip } from "../composites/OwnerChip";
import { EscalationIndicator } from "../composites/EscalationIndicator";
import { Button } from "../primitives/Button";
import { Tooltip } from "../primitives/Tooltip";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DetailHeaderProps {
  detail: CaseDetail;
  queueKey: string;
  actions: ProtectedAction[];
  userRoles: string[];
  onAction: (actionKey: string) => void;
  backLabel: string;
  backPath: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function findPrimaryAction(
  actions: ProtectedAction[],
  userRoles: string[],
): ProtectedAction | null {
  const roleSet = new Set(userRoles);
  return (
    actions.find((a) =>
      a.available_roles.some((r) => roleSet.has(r)),
    ) ?? null
  );
}

function findSecondaryAction(
  actions: ProtectedAction[],
  keyword: string,
): ProtectedAction | null {
  return (
    actions.find((a) =>
      a.action_key.toLowerCase().includes(keyword.toLowerCase()),
    ) ?? null
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DetailHeader({
  detail,
  queueKey,
  actions,
  userRoles,
  onAction,
  backLabel,
  backPath,
}: DetailHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = useCallback(() => {
    void navigator.clipboard.writeText(detail.docname);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [detail.docname]);

  const primaryAction = findPrimaryAction(actions, userRoles);
  const snoozeAction = findSecondaryAction(actions, "snooze");
  const escalateAction = findSecondaryAction(actions, "escalat");

  return (
    <header
      className={cn(
        "sticky top-0 z-10",
        "bg-bg-default/95 backdrop-blur-sm",
        "border-b border-border-default",
        "px-6 py-4",
      )}
    >
      {/* Back link */}
      <Link
        to={backPath}
        className={cn(
          "inline-flex items-center gap-1",
          "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
          "text-fg-muted hover:text-fg-default",
          "transition-colors duration-[var(--duration-fast)]",
        )}
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Back to {backLabel}
      </Link>

      {/* Main row: ID + secondary actions */}
      <div className="mt-2 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Case ID - copyable */}
          <div className="flex items-center gap-2">
            <Tooltip content={copied ? "Copied!" : "Copy case ID"}>
              <button
                type="button"
                onClick={handleCopyId}
                className={cn(
                  "inline-flex items-center gap-1",
                  "font-mono",
                  "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
                  "text-fg-muted hover:text-fg-default",
                  "cursor-pointer",
                  "transition-colors duration-[var(--duration-fast)]",
                )}
              >
                {detail.docname}
                {copied ? (
                  <Check size={12} aria-hidden="true" />
                ) : (
                  <Copy size={12} aria-hidden="true" />
                )}
              </button>
            </Tooltip>
          </div>

          {/* Title */}
          <h1
            className={cn(
              "mt-1",
              "text-[length:var(--text-heading-lg-size)] leading-[var(--text-heading-lg-leading)]",
              "font-semibold text-fg-default",
              "truncate",
            )}
          >
            {detail.title}
          </h1>
        </div>

        {/* Secondary actions */}
        <div className="flex items-center gap-2 shrink-0">
          {snoozeAction && (
            <Button
              variant="ghost"
              size="sm"
              icon={Clock}
              onClick={() => onAction(snoozeAction.action_key)}
            >
              Snooze
            </Button>
          )}
          {escalateAction && (
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowUpRight}
              onClick={() => onAction(escalateAction.action_key)}
            >
              Escalate
            </Button>
          )}
        </div>
      </div>

      {/* Status row */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <StatusBadge status={detail.status} queueKey={queueKey} />
        <DueIndicator
          targetDate={detail.target_date}
          isOverdue={detail.is_overdue}
        />
        <OwnerChip owner={detail.current_owner} />
        <EscalationIndicator
          state={detail.escalation_state as EscalationState}
        />
      </div>

      {/* Primary action */}
      {primaryAction && (
        <div className="mt-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => onAction(primaryAction.action_key)}
          >
            {primaryAction.label}
          </Button>
        </div>
      )}
    </header>
  );
}
