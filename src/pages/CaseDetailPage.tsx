import { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Link2,
  ShieldCheck,
  Lock,
  Send,
} from "lucide-react";
import { cn } from "../lib/cn";
import { ACTION_KEYS } from "../config/action-keys";
import { useCaseDetail, useCaseAuditTimeline } from "../hooks/use-case-detail";
import { useAction } from "../hooks/use-action";
import { useRoleGate } from "../hooks/use-role-gate";
import { useToast } from "../components/patterns/NotificationToast";
import type {
  ProtectedAction,
  FieldSnapshot,
  ContextSection,
  AuditTimelineEntry,
} from "../types/api";
import { queuePath } from "../config/routes";

import { DetailHeader } from "../components/patterns/DetailHeader";
import { DetailTabBar } from "../components/patterns/DetailTabBar";
import { ActivityTimeline } from "../components/patterns/ActivityTimeline";

import { ErrorBanner } from "../components/composites/ErrorBanner";
import { EmptyState } from "../components/composites/EmptyState";
import { ActionButton } from "../components/composites/ActionButton";
import { ConfirmDialog } from "../components/composites/ConfirmDialog";
import { DocumentPackCard } from "../components/composites/DocumentPackCard";
import { SignaturePacketCard } from "../components/composites/SignaturePacketCard";
import { ApprovalCard } from "../components/composites/ApprovalCard";
import { HandoffCard } from "../components/composites/HandoffCard";
import { IntegrationSyncRow } from "../components/composites/IntegrationSyncRow";
import { RelatedRecordLink } from "../components/composites/RelatedRecordLink";
import { SLAMeter } from "../components/composites/SLAMeter";
import { BlockerCard } from "../components/composites/BlockerCard";
import { Skeleton } from "../components/primitives/Skeleton";
import { Button } from "../components/primitives/Button";
import { Input } from "../components/primitives/Input";

/* ================================================================== */
/*  Loading skeleton                                                   */
/* ================================================================== */

function PageSkeleton() {
  return (
    <div className="animate-in fade-in-0 duration-300">
      {/* Header skeleton */}
      <div className="px-6 py-4 border-b border-border-default">
        <Skeleton variant="text" width="120px" />
        <div className="mt-2 space-y-2">
          <Skeleton variant="text" width="180px" />
          <Skeleton variant="text" width="60%" height="28px" />
        </div>
        <div className="mt-3 flex gap-3">
          <Skeleton variant="text" width="80px" height="24px" />
          <Skeleton variant="text" width="80px" height="24px" />
          <Skeleton variant="text" width="100px" height="24px" />
        </div>
      </div>

      {/* Tab bar skeleton */}
      <div className="px-6 py-2.5 border-b border-border-default flex gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} variant="text" width="70px" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-4">
            <Skeleton variant="card" height="200px" />
            <Skeleton variant="card" height="160px" />
          </div>
          <div className="space-y-4">
            <Skeleton variant="card" height="100px" />
            <Skeleton variant="card" height="120px" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab: Overview                                                      */
/* ================================================================== */

function ContextSectionCard({ section }: { section: ContextSection }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border-default bg-bg-default p-4">
      <h3
        className={cn(
          "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
          "font-[number:var(--text-body-medium-weight)]",
          "text-fg-default mb-3",
        )}
      >
        {section.label}
      </h3>
      <dl className="space-y-2">
        {section.fields.map((field) => (
          <div key={field.key} className="flex justify-between gap-4">
            <dt
              className={cn(
                "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                "text-fg-muted shrink-0",
              )}
            >
              {field.label}
            </dt>
            <dd
              className={cn(
                "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                "text-fg-default text-right truncate",
              )}
            >
              {field.value != null ? String(field.value) : "\u2014"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function FieldSnapshotCard({ fields }: { fields: FieldSnapshot[] }) {
  if (fields.length === 0) return null;

  return (
    <div className="rounded-[var(--radius-lg)] border border-border-default bg-bg-default p-4">
      <h3
        className={cn(
          "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
          "font-[number:var(--text-body-medium-weight)]",
          "text-fg-default mb-3",
        )}
      >
        Field Snapshot
      </h3>
      <dl className="space-y-2">
        {fields.map((field) => (
          <div key={field.key} className="flex justify-between gap-4">
            <dt
              className={cn(
                "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                "text-fg-muted shrink-0",
              )}
            >
              {field.label}
            </dt>
            <dd
              className={cn(
                "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                "text-fg-default text-right truncate",
              )}
            >
              {field.value != null ? String(field.value) : "\u2014"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function OverviewTab({
  contextSections,
  fieldSnapshot,
  timelineEntries,
  blockerReason,
  blockerMessage,
  noteText,
  onNoteTextChange,
  onAddNote,
  addingNote,
}: {
  contextSections: ContextSection[];
  fieldSnapshot: FieldSnapshot[];
  timelineEntries: AuditTimelineEntry[];
  blockerReason: string | undefined;
  blockerMessage: string | undefined;
  noteText: string;
  onNoteTextChange: (text: string) => void;
  onAddNote: () => void;
  addingNote: boolean;
}) {
  // Determine which field_snapshot keys are already shown inside context_sections
  const sectionFieldKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const section of contextSections) {
      for (const f of section.fields) {
        keys.add(f.key);
      }
    }
    return keys;
  }, [contextSections]);

  const remainingFields = useMemo(
    () => fieldSnapshot.filter((f) => !sectionFieldKeys.has(f.key)),
    [fieldSnapshot, sectionFieldKeys],
  );

  // Extract SLA-related sections for the right column
  const slaSections = useMemo(
    () =>
      contextSections.filter(
        (s) =>
          s.section_key.includes("sla") ||
          s.label.toLowerCase().includes("sla"),
      ),
    [contextSections],
  );

  const mainSections = useMemo(
    () =>
      contextSections.filter(
        (s) =>
          !s.section_key.includes("sla") &&
          !s.label.toLowerCase().includes("sla"),
      ),
    [contextSections],
  );

  // Last 3 notes
  const recentNotes = useMemo(
    () =>
      timelineEntries
        .filter((e) => e.event === "note_added")
        .slice(0, 3),
    [timelineEntries],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      {/* Left column */}
      <div className="space-y-4 min-w-0">
        {/* Blocker banner */}
        {blockerReason && (
          <BlockerCard reason={blockerReason} waitingOn={blockerMessage} />
        )}

        {/* Operational context cards */}
        {mainSections.map((section) => (
          <ContextSectionCard key={section.section_key} section={section} />
        ))}

        {/* Remaining fields */}
        <FieldSnapshotCard fields={remainingFields} />
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {/* SLA meters */}
        {slaSections.map((section) => (
          <div
            key={section.section_key}
            className="rounded-[var(--radius-lg)] border border-border-default bg-bg-default p-4"
          >
            <h3
              className={cn(
                "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
                "font-[number:var(--text-body-medium-weight)]",
                "text-fg-default mb-3",
              )}
            >
              {section.label}
            </h3>
            {section.fields.map((f) => {
              const elapsed = typeof f.value === "number" ? f.value : 0;
              return (
                <SLAMeter
                  key={f.key}
                  label={f.label}
                  elapsed={elapsed}
                  budget={480}
                  breached={elapsed > 480}
                  className="mb-2 last:mb-0"
                />
              );
            })}
          </div>
        ))}

        {/* Quick notes */}
        <div className="rounded-[var(--radius-lg)] border border-border-default bg-bg-default p-4">
          <h3
            className={cn(
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "font-[number:var(--text-body-medium-weight)]",
              "text-fg-default mb-3",
            )}
          >
            Quick Notes
          </h3>

          {recentNotes.length > 0 ? (
            <div className="space-y-2 mb-3">
              {recentNotes.map((note, idx) => (
                <p
                  key={`${note.occurred_at}-${idx}`}
                  className={cn(
                    "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                    "text-fg-muted",
                  )}
                >
                  {note.summary}
                </p>
              ))}
            </div>
          ) : (
            <p
              className={cn(
                "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                "text-fg-muted mb-3",
              )}
            >
              No notes yet.
            </p>
          )}

          <textarea
            placeholder="Add a note..."
            rows={2}
            value={noteText}
            onChange={(e) => onNoteTextChange(e.target.value)}
            className={cn(
              "w-full rounded-[var(--radius-md)] border border-border-default bg-bg-surface px-3 py-2",
              "text-[length:var(--text-small-size)] text-fg-default placeholder:text-fg-faint",
              "outline-none resize-none",
              "focus-visible:border-[var(--ring-focus)] focus-visible:shadow-[var(--shadow-focus)]",
              "transition-[border-color,box-shadow] duration-[var(--duration-fast)]",
            )}
          />
          <Button
            variant="secondary"
            size="sm"
            icon={Send}
            className="mt-2"
            disabled={!noteText.trim() || addingNote}
            onClick={onAddNote}
          >
            {addingNote ? "Adding..." : "Add Note"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab: Documents                                                     */
/* ================================================================== */

function DocumentsTab({
  contextSections,
  fieldSnapshot,
}: {
  contextSections: ContextSection[];
  fieldSnapshot: FieldSnapshot[];
}) {
  // Extract document pack and signature packet data from context sections
  const docSections = contextSections.filter(
    (s) =>
      s.section_key.includes("document") ||
      s.section_key.includes("doc_pack"),
  );

  const sigSections = contextSections.filter(
    (s) =>
      s.section_key.includes("signature") ||
      s.section_key.includes("sig_packet"),
  );

  // Also look for doc-related fields in field_snapshot
  const docFields = fieldSnapshot.filter(
    (f) =>
      f.key.includes("document") ||
      f.key.includes("attachment") ||
      f.key.includes("file"),
  );

  const hasContent =
    docSections.length > 0 || sigSections.length > 0 || docFields.length > 0;

  if (!hasContent) {
    return (
      <EmptyState
        icon={FileText}
        title="No documents"
        description="Document packs and signature packets will appear here when attached."
      />
    );
  }

  return (
    <div className="space-y-4">
      {docSections.map((section) => {
        const total = section.fields.length;
        const received = section.fields.filter(
          (f) => f.value != null && f.value !== "" && f.value !== false,
        ).length;
        const missing = section.fields
          .filter(
            (f) => f.value == null || f.value === "" || f.value === false,
          )
          .map((f) => f.label);

        return (
          <DocumentPackCard
            key={section.section_key}
            name={section.label}
            totalArtifacts={total}
            receivedArtifacts={received}
            missingArtifacts={missing}
          />
        );
      })}

      {sigSections.map((section) => (
        <SignaturePacketCard
          key={section.section_key}
          name={section.label}
          status={
            String(
              section.fields.find((f) => f.key.includes("status"))?.value ??
                "pending",
            )
          }
        />
      ))}

      {docFields.length > 0 && (
        <div className="rounded-[var(--radius-lg)] border border-border-default bg-bg-default p-4">
          <h3
            className={cn(
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "font-[number:var(--text-body-medium-weight)]",
              "text-fg-default mb-3",
            )}
          >
            Attached Files
          </h3>
          <dl className="space-y-2">
            {docFields.map((f) => (
              <div key={f.key} className="flex justify-between gap-4">
                <dt className="text-[length:var(--text-caption-size)] text-fg-muted">
                  {f.label}
                </dt>
                <dd className="text-[length:var(--text-caption-size)] text-fg-default">
                  {f.value != null ? String(f.value) : "Missing"}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Tab: Related                                                       */
/* ================================================================== */

function RelatedTab({
  contextSections,
}: {
  contextSections: ContextSection[];
}) {
  const approvalSections = contextSections.filter(
    (s) => s.section_key.includes("approval"),
  );
  const handoffSections = contextSections.filter(
    (s) => s.section_key.includes("handoff"),
  );
  const integrationSections = contextSections.filter(
    (s) => s.section_key.includes("integration") || s.section_key.includes("sync"),
  );
  const otherSections = contextSections.filter(
    (s) =>
      !s.section_key.includes("approval") &&
      !s.section_key.includes("handoff") &&
      !s.section_key.includes("integration") &&
      !s.section_key.includes("sync") &&
      !s.section_key.includes("sla") &&
      !s.section_key.includes("document") &&
      !s.section_key.includes("doc_pack") &&
      !s.section_key.includes("signature") &&
      !s.section_key.includes("sig_packet"),
  );

  const hasContent =
    approvalSections.length > 0 ||
    handoffSections.length > 0 ||
    integrationSections.length > 0 ||
    otherSections.length > 0;

  if (!hasContent) {
    return (
      <EmptyState
        icon={Link2}
        title="No related records"
        description="Linked approvals, handoffs, and integrations will appear here."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Approvals */}
      {approvalSections.length > 0 && (
        <section>
          <h3
            className={cn(
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "font-[number:var(--text-body-medium-weight)]",
              "text-fg-default mb-3",
            )}
          >
            Approvals
          </h3>
          <div className="space-y-3">
            {approvalSections.map((s) => (
              <ApprovalCard
                key={s.section_key}
                requestType={s.label}
                requester={
                  String(
                    s.fields.find((f) => f.key.includes("requester"))?.value ?? "Unknown",
                  )
                }
                status={
                  String(
                    s.fields.find((f) => f.key.includes("status"))?.value ?? "pending",
                  )
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Handoffs */}
      {handoffSections.length > 0 && (
        <section>
          <h3
            className={cn(
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "font-[number:var(--text-body-medium-weight)]",
              "text-fg-default mb-3",
            )}
          >
            Handoffs
          </h3>
          <div className="space-y-3">
            {handoffSections.map((s) => (
              <HandoffCard
                key={s.section_key}
                fromTeam={
                  String(
                    s.fields.find((f) => f.key.includes("from"))?.value ?? "Unknown",
                  )
                }
                toTeam={
                  String(
                    s.fields.find((f) => f.key.includes("to"))?.value ?? "Unknown",
                  )
                }
                status={
                  String(
                    s.fields.find((f) => f.key.includes("status"))?.value ?? "pending",
                  )
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Integration syncs */}
      {integrationSections.length > 0 && (
        <section>
          <h3
            className={cn(
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "font-[number:var(--text-body-medium-weight)]",
              "text-fg-default mb-3",
            )}
          >
            Integration Syncs
          </h3>
          <div className="divide-y divide-border-default">
            {integrationSections.map((s) => (
              <IntegrationSyncRow
                key={s.section_key}
                system={s.label}
                direction={
                  String(
                    s.fields.find((f) => f.key.includes("direction"))?.value ?? "outbound",
                  )
                }
                status={
                  String(
                    s.fields.find((f) => f.key.includes("status"))?.value ?? "pending",
                  )
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Other related */}
      {otherSections.length > 0 && (
        <section>
          <h3
            className={cn(
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "font-[number:var(--text-body-medium-weight)]",
              "text-fg-default mb-3",
            )}
          >
            Other References
          </h3>
          <div className="flex flex-wrap gap-2">
            {otherSections.map((s) => (
              <RelatedRecordLink
                key={s.section_key}
                label={s.label}
                referenceType={s.section_key}
                referenceId={s.section_key}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Tab: Actions                                                       */
/* ================================================================== */

function ActionsTab({
  actions,
  userRoles,
  onExecuteAction,
  executingActionKey,
}: {
  actions: ProtectedAction[];
  userRoles: string[];
  onExecuteAction: (actionKey: string) => void;
  executingActionKey: string | null;
}) {
  const roleSet = useMemo(() => new Set(userRoles), [userRoles]);

  const availableActions = useMemo(
    () => actions.filter((a) => a.available_roles.some((r) => roleSet.has(r))),
    [actions, roleSet],
  );

  const otherActions = useMemo(
    () =>
      actions.filter((a) => !a.available_roles.some((r) => roleSet.has(r))),
    [actions, roleSet],
  );

  if (actions.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No actions available"
        description="There are no protected actions for this case in its current state."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Available to you */}
      {availableActions.length > 0 && (
        <section>
          <h3
            className={cn(
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "font-[number:var(--text-body-medium-weight)]",
              "text-fg-default mb-3",
            )}
          >
            Available to you
          </h3>
          <div className="space-y-3">
            {availableActions.map((action) => (
              <div
                key={action.action_key}
                className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-border-default bg-bg-default p-4"
              >
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
                      "font-[number:var(--text-body-medium-weight)]",
                      "text-fg-default",
                    )}
                  >
                    {action.label}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5",
                      "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                      "text-fg-muted",
                    )}
                  >
                    Scope: {action.permission_scope}
                    {action.requires_human_release && " \u00b7 Requires confirmation"}
                  </p>
                </div>
                <ActionButton
                  action={action}
                  userRoles={userRoles}
                  onExecute={onExecuteAction}
                  loading={executingActionKey === action.action_key}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Requires other role */}
      {otherActions.length > 0 && (
        <section>
          <h3
            className={cn(
              "flex items-center gap-1.5",
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "font-[number:var(--text-body-medium-weight)]",
              "text-fg-muted mb-3",
            )}
          >
            <Lock size={14} aria-hidden="true" />
            Requires other role
          </h3>
          <div className="space-y-3">
            {otherActions.map((action) => (
              <div
                key={action.action_key}
                className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-border-default bg-bg-default p-4 opacity-60"
              >
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
                      "text-fg-default",
                    )}
                  >
                    {action.label}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5",
                      "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                      "text-fg-muted",
                    )}
                  >
                    Roles: {action.available_roles.join(", ")}
                  </p>
                </div>
                <ActionButton
                  action={action}
                  userRoles={userRoles}
                  onExecute={onExecuteAction}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Main page component                                                */
/* ================================================================== */

export default function CaseDetailPage() {
  const { caseType, caseId } = useParams<{
    caseType: string;
    caseId: string;
  }>();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { userRoles } = useRoleGate();
  const actionMutation = useAction();

  // Queries
  const {
    data: detailResponse,
    isLoading: detailLoading,
    isError: detailError,
    error: detailErrorObj,
    refetch: refetchDetail,
  } = useCaseDetail(caseType ?? null, caseId ?? null);

  const {
    data: timelineResponse,
    isLoading: timelineLoading,
  } = useCaseAuditTimeline(caseType ?? null, caseId ?? null);

  // Tab state
  const [activeTab, setActiveTab] = useState("overview");

  // Action execution state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<ProtectedAction | null>(
    null,
  );
  const [decisionNote, setDecisionNote] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [executingActionKey, setExecutingActionKey] = useState<string | null>(
    null,
  );

  // Note state
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Derived data
  const detail = detailResponse?.detail;
  const queueKey = detail?.queue_key ?? "";
  const actions = useMemo(
    () => detailResponse?.protected_actions ?? [],
    [detailResponse?.protected_actions],
  );
  const contextSections = detailResponse?.context_sections ?? [];
  const fieldSnapshot = detailResponse?.field_snapshot ?? [];
  const timelineEntries = timelineResponse?.audit_timeline ?? [];

  // Action execution — defined before handleAction so it can be referenced
  const executeAction = useCallback(
    (action: ProtectedAction, note: string, date: string) => {
      if (!caseType || !caseId) return;

      setExecutingActionKey(action.action_key);

      actionMutation.mutate(
        {
          doctype: caseType,
          docname: caseId,
          action_key: action.action_key,
          actor_role: userRoles[0] ?? "",
          decision_note: note || undefined,
          target_date: date || undefined,
        },
        {
          onSuccess: () => {
            setConfirmDialogOpen(false);
            setPendingAction(null);
            setExecutingActionKey(null);

            toast({
              title: "Action completed",
              description: `${action.label} executed successfully.`,
              variant: "success",
            });

            void refetchDetail();
            void queryClient.invalidateQueries({
              queryKey: ["case-audit-timeline", caseType, caseId],
            });
          },
          onError: (err) => {
            setExecutingActionKey(null);
            toast({
              title: "Action failed",
              description: err.message || "Something went wrong.",
              variant: "error",
            });
          },
        },
      );
    },
    [caseType, caseId, userRoles, actionMutation, toast, refetchDetail, queryClient],
  );

  // Action handler — routes to dialog or direct execution
  const handleAction = useCallback(
    (actionKey: string) => {
      const action = actions.find((a) => a.action_key === actionKey);
      if (!action) return;

      // If action requires confirmation, show dialog
      if (action.requires_human_release || action.permission_scope === "critical") {
        setPendingAction(action);
        setDecisionNote("");
        setTargetDate("");
        setConfirmDialogOpen(true);
        return;
      }

      // Execute directly
      executeAction(action, "", "");
    },
    [actions, executeAction],
  );

  const handleConfirm = useCallback(() => {
    if (!pendingAction) return;
    // Trim whitespace so a note of "   " is treated as absent, not submitted.
    executeAction(pendingAction, decisionNote.trim(), targetDate);
  }, [pendingAction, decisionNote, targetDate, executeAction]);

  const handleConfirmDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open && (decisionNote.trim() || targetDate)) {
        // User is trying to close with unsaved content — ask first
        setDiscardDialogOpen(true);
        return;
      }
      setConfirmDialogOpen(open);
      if (!open) {
        setPendingAction(null);
        setDecisionNote("");
        setTargetDate("");
      }
    },
    [decisionNote, targetDate],
  );

  const handleDiscardConfirm = useCallback(() => {
    setDiscardDialogOpen(false);
    setConfirmDialogOpen(false);
    setPendingAction(null);
    setDecisionNote("");
    setTargetDate("");
  }, []);

  // Add note handler
  const handleAddNote = useCallback(() => {
    if (!caseType || !caseId || !noteText.trim()) return;

    setAddingNote(true);
    actionMutation.mutate(
      {
        doctype: caseType,
        docname: caseId,
        action_key: ACTION_KEYS.ADD_NOTE,
        actor_role: userRoles[0] ?? "",
        decision_note: noteText.trim(),
      },
      {
        onSuccess: () => {
          setNoteText("");
          setAddingNote(false);
          toast({
            title: "Note added",
            description: "Your note has been saved.",
            variant: "success",
          });
          void queryClient.invalidateQueries({
            queryKey: ["case-audit-timeline", caseType, caseId],
          });
          void refetchDetail();
        },
        onError: (err) => {
          setAddingNote(false);
          toast({
            title: "Failed to add note",
            description: err.message || "Something went wrong.",
            variant: "error",
          });
        },
      },
    );
  }, [caseType, caseId, noteText, userRoles, actionMutation, toast, queryClient, refetchDetail]);

  // ----- Loading -----
  if (detailLoading) {
    return <PageSkeleton />;
  }

  // ----- Error -----
  if (detailError || !detail) {
    return (
      <div className="p-6">
        <ErrorBanner
          title="Failed to load case detail"
          message={detailErrorObj?.message ?? "Unknown error occurred."}
          onRetry={() => void refetchDetail()}
        />
      </div>
    );
  }

  // ----- Back path -----
  const backLabel = queueKey
    ? queueKey.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Queue";
  const backPath = queueKey ? queuePath(queueKey) : "/work";

  return (
    <div className="flex flex-col min-h-0 h-full">
      {/* Header */}
      <DetailHeader
        detail={detail}
        queueKey={queueKey}
        actions={actions}
        userRoles={userRoles}
        onAction={handleAction}
        backLabel={backLabel}
        backPath={backPath}
      />

      {/* Tab bar */}
      <DetailTabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {activeTab === "overview" && (
            <OverviewTab
              contextSections={contextSections}
              fieldSnapshot={fieldSnapshot}
              timelineEntries={timelineEntries}
              blockerReason={detailResponse?.blocker_banner?.reason}
              blockerMessage={detailResponse?.blocker_banner?.message}
              noteText={noteText}
              onNoteTextChange={setNoteText}
              onAddNote={handleAddNote}
              addingNote={addingNote}
            />
          )}

          {activeTab === "timeline" && (
            <ActivityTimeline
              entries={timelineEntries}
              loading={timelineLoading}
            />
          )}

          {activeTab === "documents" && (
            <DocumentsTab
              contextSections={contextSections}
              fieldSnapshot={fieldSnapshot}
            />
          )}

          {activeTab === "related" && (
            <RelatedTab contextSections={contextSections} />
          )}

          {activeTab === "actions" && (
            <ActionsTab
              actions={actions}
              userRoles={userRoles}
              onExecuteAction={handleAction}
              executingActionKey={executingActionKey}
            />
          )}
        </div>
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={handleConfirmDialogOpenChange}
        title={pendingAction ? `Confirm: ${pendingAction.label}` : "Confirm Action"}
        description={
          pendingAction?.requires_human_release
            ? "This action requires explicit human confirmation before execution."
            : "Are you sure you want to execute this action?"
        }
        confirmLabel="Execute"
        confirmVariant={
          pendingAction?.permission_scope === "critical" ? "danger" : "primary"
        }
        onConfirm={handleConfirm}
        loading={actionMutation.isPending}
      >
        <div className="space-y-3">
          <div>
            <label
              htmlFor="decision-note"
              className="text-[length:var(--text-small-size)] font-medium text-fg-default block mb-1"
            >
              Decision note (optional)
            </label>
            <textarea
              id="decision-note"
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              rows={3}
              placeholder="Reason for this decision..."
              className={cn(
                "w-full rounded-[var(--radius-md)] border border-border-default bg-bg-surface px-3 py-2",
                "text-[length:var(--text-small-size)] text-fg-default placeholder:text-fg-faint",
                "outline-none resize-none",
                "focus-visible:border-[var(--ring-focus)] focus-visible:shadow-[var(--shadow-focus)]",
                "transition-[border-color,box-shadow] duration-[var(--duration-fast)]",
              )}
            />
          </div>

          <Input
            label="Target date (optional)"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />
        </div>
      </ConfirmDialog>

      {/* Discard changes dialog */}
      <ConfirmDialog
        open={discardDialogOpen}
        onOpenChange={setDiscardDialogOpen}
        title="Discard changes?"
        description="Your decision note and target date will be lost. Are you sure you want to close?"
        confirmLabel="Discard"
        confirmVariant="danger"
        onConfirm={handleDiscardConfirm}
      />
    </div>
  );
}
