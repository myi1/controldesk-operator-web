import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, Check, Clock, ArrowUpRight, PlayCircle } from "lucide-react";
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
  /** All protected_actions for the case (used for legacy fallback only) */
  actions: ProtectedAction[];
  userRoles: string[];
  onAction: (actionKey: string) => void;
  backLabel: string;
  backPath: string;
  /**
   * Pre-computed primary action from getAvailableActions().
   * When provided, this takes priority over the internal findPrimaryAction fallback.
   */
  continueAction?: { actionKey: string; label: string } | null;
  /**
   * Pre-computed utility quick actions (snooze, escalate, assign…) from
   * getAvailableActions(). When provided, these replace the internal
   * snooze/escalate keyword detection.
   */
  quickActions?: ProtectedAction[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Fallback: first protected_action the user has a role for */
function findPrimaryAction(
  actions: ProtectedAction[],
  userRoles: string[],
): ProtectedAction | null {
  const roleSet = new Set(userRoles);
  return actions.find((a) => a.available_roles.some((r) => roleSet.has(r))) ?? null;
}

/** Fallback: find a secondary action by action_key keyword */
function findSecondaryAction(
  actions: ProtectedAction[],
  keyword: string,
): ProtectedAction | null {
  return (
    actions.find((a) => a.action_key.toLowerCase().includes(keyword.toLowerCase())) ?? null
  );
}

/* ------------------------------------------------------------------ */
/*  Quick action button icons                                          */
/* ------------------------------------------------------------------ */

const QUICK_ACTION_ICONS: Record<string, typeof Clock> = {
  snooze: Clock,
  escalat: ArrowUpRight,
};

function getQuickActionIcon(actionKey: string): typeof Clock | undefined {
  for (const [kw, Icon] of Object.entries(QUICK_ACTION_ICONS)) {
    if (actionKey.toLowerCase().includes(kw)) return Icon;
  }
  return undefined;
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
  continueAction,
  quickActions,
}: DetailHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = useCallback(() => {
    void navigator.clipboard.writeText(detail.docname);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [detail.docname]);

  // Resolve quick actions: prefer prop, fall back to keyword detection
  const resolvedQuickActions: Array<{ actionKey: string; label: string; icon?: typeof Clock }> =
    quickActions !== undefined
      ? quickActions.slice(0, 3).map((a) => ({
          actionKey: a.action_key,
          label: a.label,
          icon: getQuickActionIcon(a.action_key),
        }))
      : (() => {
          const result: Array<{ actionKey: string; label: string; icon?: typeof Clock }> = [];
          const snooze = findSecondaryAction(actions, "snooze");
          if (snooze) result.push({ actionKey: snooze.action_key, label: "Snooze", icon: Clock });
          const escalate = findSecondaryAction(actions, "escalat");
          if (escalate) result.push({ actionKey: escalate.action_key, label: "Escalate", icon: ArrowUpRight });
          return result;
        })();

  // Resolve primary CTA: prefer continueAction prop, fall back to first protected_action user can run
  const resolvedPrimary =
    continueAction !== undefined
      ? continueAction ?? null
      : (() => {
          const pa = findPrimaryAction(actions, userRoles);
          return pa ? { actionKey: pa.action_key, label: pa.label } : null;
        })();

  const primaryLabel = resolvedPrimary?.label ?? null;
  const primaryActionKey = resolvedPrimary?.actionKey ?? null;

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

      {/* Main row: ID + quick actions */}
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

        {/* Quick action bar — compact ghost buttons */}
        {resolvedQuickActions.length > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            {resolvedQuickActions.map((qa) => (
              <Button
                key={qa.actionKey}
                variant="ghost"
                size="sm"
                icon={qa.icon}
                onClick={() => onAction(qa.actionKey)}
              >
                {qa.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Status row */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <StatusBadge status={detail.status} queueKey={queueKey} />
        <DueIndicator
          targetDate={detail.target_date}
          isOverdue={detail.is_overdue}
        />
        <OwnerChip owner={detail.current_owner} />
        <EscalationIndicator state={detail.escalation_state as EscalationState} />
      </div>

      {/* Primary "Continue" action — prominent, full-width on narrow screens */}
      {primaryActionKey && primaryLabel && (
        <div className="mt-3">
          <Button
            variant="primary"
            size="md"
            icon={PlayCircle}
            onClick={() => onAction(primaryActionKey)}
          >
            {primaryLabel}
          </Button>
        </div>
      )}
    </header>
  );
}
