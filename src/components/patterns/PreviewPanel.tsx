import { useState, useCallback } from "react";
import {
  X,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { useCaseDetail, useCaseAuditTimeline } from "../../hooks/use-case-detail";
import { useAction } from "../../hooks/use-action";
import { useRoleGate } from "../../hooks/use-role-gate";
import { Button } from "../primitives/Button";
import { Skeleton } from "../primitives/Skeleton";
import { Separator } from "../primitives/Separator";
import { StatusBadge } from "../composites/StatusBadge";
import { OwnerChip } from "../composites/OwnerChip";
import { DueIndicator } from "../composites/DueIndicator";
import { EscalationIndicator } from "../composites/EscalationIndicator";
import { ActionButton } from "../composites/ActionButton";
import { TimelineEntry } from "../composites/TimelineEntry";
import { RelatedRecordLink } from "../composites/RelatedRecordLink";
import { StageControl } from "./StageControl";
import type { EscalationState } from "../../types/enums";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PreviewPanelProps {
  doctype: string;
  docname: string;
  queueKey: string;
  onClose: () => void;
  onOpenDetail: () => void;
}

/* ------------------------------------------------------------------ */
/*  Copy-to-clipboard helper                                           */
/* ------------------------------------------------------------------ */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1 px-1 py-0.5 rounded-[var(--radius-sm)]",
        "text-fg-muted hover:text-fg-default hover:bg-bg-hover",
        "transition-colors duration-[var(--duration-fast)]",
        "cursor-pointer",
      )}
      title="Copy case ID"
    >
      {copied ? (
        <Check size={12} className="text-status-success" aria-hidden="true" />
      ) : (
        <Copy size={12} aria-hidden="true" />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Collapsible section                                                */
/* ------------------------------------------------------------------ */

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-1.5 py-2",
          "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
          "font-[number:var(--text-body-medium-weight)]",
          "text-fg-default",
          "cursor-pointer hover:text-accent-primary transition-colors",
        )}
      >
        {open ? (
          <ChevronDown size={14} aria-hidden="true" />
        ) : (
          <ChevronRight size={14} aria-hidden="true" />
        )}
        {title}
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PreviewPanel({
  doctype,
  docname,
  queueKey,
  onClose,
  onOpenDetail,
}: PreviewPanelProps) {
  const { data: detailData, isLoading: detailLoading } = useCaseDetail(
    doctype,
    docname,
  );
  const { data: timelineData, isLoading: timelineLoading } =
    useCaseAuditTimeline(doctype, docname);

  const actionMutation = useAction();
  const { userRoles } = useRoleGate();

  const detail = detailData?.detail;
  const effectiveQueueKey = detail?.queue_key ?? queueKey;
  const protectedActions = detailData?.protected_actions ?? [];
  const blockerBanner = detailData?.blocker_banner;
  const limitations = detailData?.limitations ?? [];
  const contextSections = detailData?.context_sections ?? [];
  const timelineEntries = timelineData?.audit_timeline?.slice(0, 5) ?? [];

  // Build sub-statuses from field_snapshot
  const subStatuses: Record<string, string> = {};
  for (const field of detailData?.field_snapshot ?? []) {
    if (
      field.key.startsWith("sub_") &&
      typeof field.value === "string"
    ) {
      subStatuses[field.key.replace("sub_", "")] = field.value;
    }
  }

  const handleAction = useCallback(
    (actionKey: string) => {
      if (!detail) return;
      actionMutation.mutate({
        doctype: detail.doctype,
        docname: detail.docname,
        action_key: actionKey,
        actor_role: userRoles[0] ?? "",
      });
    },
    [detail, actionMutation, userRoles],
  );

  return (
    <aside
      className={cn(
        "fixed top-[var(--topbar-height,56px)] right-0 bottom-0",
        // Full-width on mobile; fixed panel width on sm and up
        "w-full sm:w-[var(--preview-panel-width,420px)]",
        "border-l border-border-default",
        "bg-bg-surface",
        "overflow-y-auto",
        "z-[var(--z-raised)]",
        // Slide-in animation
        "animate-in slide-in-from-right duration-[var(--duration-normal,200ms)]",
      )}
    >
      {/* ── Header (sticky) ── */}
      <div className="sticky top-0 z-10 bg-bg-surface border-b border-border-default p-4">
        {/* Close button */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {detailLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="80%" />
              </div>
            ) : detail ? (
              <>
                {/* Case ID */}
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "font-mono",
                      "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                      "text-fg-muted",
                    )}
                  >
                    {detail.docname}
                  </span>
                  <CopyButton text={detail.docname} />
                </div>

                {/* Title */}
                <h2
                  className={cn(
                    "mt-1",
                    "text-[length:var(--text-body-size)] leading-[var(--text-body-leading)]",
                    "font-[number:var(--text-body-medium-weight)]",
                    "text-fg-default",
                  )}
                >
                  {detail.title}
                </h2>

                {/* Property context */}
                {contextSections.length > 0 && (
                  <p
                    className={cn(
                      "mt-0.5",
                      "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
                      "text-fg-muted truncate",
                    )}
                  >
                    {contextSections[0].label}
                  </p>
                )}

                {/* Status / Owner / Due row */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    status={detail.status}
                    queueKey={effectiveQueueKey}
                    size="md"
                  />
                  <OwnerChip owner={detail.current_owner} />
                  <DueIndicator
                    targetDate={detail.target_date}
                    isOverdue={detail.is_overdue}
                  />
                  <EscalationIndicator
                    state={detail.escalation_state as EscalationState}
                  />
                </div>
              </>
            ) : null}
          </div>

          <Button
            variant="icon"
            size="sm"
            icon={X}
            onClick={onClose}
            aria-label="Close preview"
            className="shrink-0 ml-2"
          />
        </div>
      </div>

      {/* ── Body (scrollable sections) ── */}
      <div className="flex flex-col divide-y divide-border-default">
        {/* Stage Control */}
        {detail && (
          <div className="p-4">
            <CollapsibleSection title="Stage Control">
              <StageControl
                queueKey={effectiveQueueKey}
                currentStatus={detail.status}
                subStatuses={subStatuses}
                blockerBanner={blockerBanner}
                limitations={limitations}
              />
            </CollapsibleSection>
          </div>
        )}

        {detailLoading && (
          <div className="p-4 flex flex-col gap-3">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="row" />
            <Skeleton variant="row" />
          </div>
        )}

        {/* Quick Actions */}
        {protectedActions.length > 0 && (
          <div className="p-4">
            <CollapsibleSection title="Quick Actions">
              <div className="flex flex-wrap gap-2">
                {protectedActions.map((action) => (
                  <ActionButton
                    key={action.action_key}
                    action={action}
                    userRoles={userRoles}
                    onExecute={handleAction}
                    loading={
                      actionMutation.isPending &&
                      actionMutation.variables?.action_key === action.action_key
                    }
                  />
                ))}
              </div>
            </CollapsibleSection>
          </div>
        )}

        {/* Recent Activity */}
        <div className="p-4">
          <CollapsibleSection title="Recent Activity">
            {timelineLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} variant="row" />
                ))}
              </div>
            ) : timelineEntries.length > 0 ? (
              <div className="flex flex-col gap-3">
                {timelineEntries.map((entry, idx) => (
                  <TimelineEntry key={idx} entry={entry} />
                ))}
                <button
                  type="button"
                  onClick={onOpenDetail}
                  className={cn(
                    "inline-flex items-center gap-1 self-start",
                    "text-[length:var(--text-small-size)]",
                    "text-accent-primary hover:underline cursor-pointer",
                  )}
                >
                  See all
                  <ArrowRight size={12} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <p className="text-[length:var(--text-small-size)] text-fg-muted">
                No recent activity
              </p>
            )}
          </CollapsibleSection>
        </div>

        {/* Related Records */}
        {detail && (
          <div className="p-4">
            <CollapsibleSection title="Related Records" defaultOpen={false}>
              <div className="flex flex-col gap-2">
                {/* Context section fields as related links */}
                {contextSections.map((section) => (
                  <div key={section.section_key} className="flex flex-col gap-1">
                    <span
                      className={cn(
                        "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                        "font-[number:var(--text-caption-medium-weight)]",
                        "text-fg-muted uppercase tracking-wide",
                      )}
                    >
                      {section.label}
                    </span>
                    {section.fields.map((field) => (
                      <RelatedRecordLink
                        key={field.key}
                        label={`${field.label}: ${String(field.value ?? "N/A")}`}
                        referenceType={section.section_key}
                        referenceId={field.key}
                      />
                    ))}
                  </div>
                ))}

                {contextSections.length === 0 && (
                  <p className="text-[length:var(--text-small-size)] text-fg-muted">
                    No related records
                  </p>
                )}
              </div>
            </CollapsibleSection>
          </div>
        )}
      </div>

      {/* Open Full Detail */}
      <Separator />
      <div className="p-4">
        <Button
          variant="secondary"
          size="md"
          className="w-full justify-center"
          onClick={onOpenDetail}
        >
          Open Full Detail
          <ArrowRight size={14} aria-hidden="true" className="ml-1" />
        </Button>
      </div>
    </aside>
  );
}
