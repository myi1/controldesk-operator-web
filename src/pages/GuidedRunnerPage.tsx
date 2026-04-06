// ---------------------------------------------------------------------------
// GuidedRunnerPage — route: /case/:caseType/:caseId/run
// ---------------------------------------------------------------------------

import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "../lib/cn";
import { useCaseDetail } from "../hooks/use-case-detail";
import { useAction } from "../hooks/use-action";
import { useRoleGate } from "../hooks/use-role-gate";
import { useToast } from "../components/patterns/NotificationToast";
import { GuidedRunner } from "../components/patterns/GuidedRunner";
import type { RunnerStep } from "../components/patterns/GuidedRunner";
import { Button } from "../components/primitives/Button";
import { ConfirmDialog } from "../components/composites/ConfirmDialog";
import { ACTION_KEYS } from "../config/action-keys";
import { Skeleton } from "../components/primitives/Skeleton";

/* ------------------------------------------------------------------ */
/*  Step templates by case type                                        */
/* ------------------------------------------------------------------ */

const STEP_TEMPLATES: Record<string, RunnerStep[]> = {
  onboarding: [
    {
      key: "authority-check",
      title: "Authority Check",
      description: "Verify the management authority agreement and signing parties.",
      type: "gate",
    },
    {
      key: "file-completeness",
      title: "File Completeness",
      description: "Confirm all required onboarding documents have been received.",
      type: "checklist",
    },
    {
      key: "inspection",
      title: "Inspection",
      description: "Upload inspection evidence and record condition notes.",
      type: "evidence",
    },
    {
      key: "finance-setup",
      title: "Finance Setup",
      description: "Decide on trust account configuration and billing setup.",
      type: "decision",
    },
    {
      key: "portal-ready",
      title: "Portal Ready",
      description: "Review all prior steps before activating the owner portal.",
      type: "review",
    },
    {
      key: "market-approval",
      title: "Market Approval",
      description: "Final approval to list the property on the market.",
      type: "completion",
    },
  ],
  maintenance: [
    {
      key: "triage",
      title: "Triage",
      description: "Assess the maintenance request priority and category.",
      type: "decision",
    },
    {
      key: "quote-request",
      title: "Quote Request",
      description: "Upload quotes from vendors and confirm scope of work.",
      type: "evidence",
    },
    {
      key: "approval",
      title: "Approval",
      description: "Confirm owner or authority approval for the quoted work.",
      type: "gate",
    },
    {
      key: "dispatch",
      title: "Dispatch",
      description: "Verify all pre-dispatch checklist items are complete.",
      type: "checklist",
    },
    {
      key: "evidence",
      title: "Evidence",
      description: "Upload completion photos and invoice documentation.",
      type: "evidence",
    },
    {
      key: "review",
      title: "Review",
      description: "Review all maintenance workflow steps before closing.",
      type: "completion",
    },
  ],
  moveout: [
    {
      key: "notice-check",
      title: "Notice Check",
      description: "Verify notice period compliance and lease terms.",
      type: "gate",
    },
    {
      key: "inspection",
      title: "Inspection",
      description: "Upload moveout inspection report and photos.",
      type: "evidence",
    },
    {
      key: "utility-closure",
      title: "Utility Closure",
      description: "Confirm all utilities have been transferred or closed.",
      type: "checklist",
    },
    {
      key: "deposit-reconciliation",
      title: "Deposit Reconciliation",
      description: "Decide on deposit deductions and refund amount.",
      type: "decision",
    },
    {
      key: "close",
      title: "Close",
      description: "Review and finalize the moveout case.",
      type: "completion",
    },
  ],
};

const DEFAULT_STEPS: RunnerStep[] = [
  {
    key: "review",
    title: "Review",
    description: "Review all case information before proceeding.",
    type: "review",
  },
  {
    key: "confirm",
    title: "Confirm",
    description: "Confirm that all requirements are met.",
    type: "gate",
  },
  {
    key: "complete",
    title: "Complete",
    description: "Finalize and close this case.",
    type: "completion",
  },
];

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */

function RunnerSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in-0 duration-300">
      <div className="flex items-center gap-3">
        <Skeleton variant="text" width="80px" />
        <Skeleton variant="text" width="200px" height="24px" />
      </div>
      <Skeleton variant="card" height="64px" />
      <div className="max-w-[720px] mx-auto">
        <Skeleton variant="card" height="320px" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page component                                                */
/* ------------------------------------------------------------------ */

export default function GuidedRunnerPage() {
  const { caseType, caseId } = useParams<{
    caseType: string;
    caseId: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRoles } = useRoleGate();
  const actionMutation = useAction();

  const {
    data: detailResponse,
    isLoading,
  } = useCaseDetail(caseType ?? null, caseId ?? null);

  const detail = detailResponse?.detail;

  // Derive queue type from queue_key for step selection
  const queueType = useMemo(() => {
    const key = detail?.queue_key ?? caseType ?? "";
    if (key.includes("onboarding")) return "onboarding";
    if (key.includes("maintenance")) return "maintenance";
    if (key.includes("moveout")) return "moveout";
    return "default";
  }, [detail?.queue_key, caseType]);

  const steps = STEP_TEMPLATES[queueType] ?? DEFAULT_STEPS;

  // Step state
  const [currentStep, setCurrentStep] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  const handleStepComplete = useCallback(
    () => {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      setDirty(true);
    },
    [steps.length],
  );

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleSaveDraft = useCallback(() => {
    toast({
      title: "Draft saved",
      description: "Your progress has been saved.",
      variant: "success",
    });
    setDirty(false);
  }, [toast]);

  const handleComplete = useCallback(() => {
    if (!caseType || !caseId) return;

    actionMutation.mutate(
      {
        doctype: caseType,
        docname: caseId,
        action_key: ACTION_KEYS.COMPLETE_RUNNER,
        actor_role: userRoles[0] ?? "",
        decision_note: "Completed via guided runner",
      },
      {
        onSuccess: () => {
          toast({
            title: "Workflow completed",
            description: "The guided runner has been completed successfully.",
            variant: "success",
          });
          navigate(-1);
        },
        onError: (err) => {
          toast({
            title: "Completion failed",
            description: err.message || "Something went wrong.",
            variant: "error",
          });
        },
      },
    );
  }, [caseType, caseId, userRoles, actionMutation, toast, navigate]);

  const handleExit = useCallback(() => {
    if (dirty) {
      setExitDialogOpen(true);
      return;
    }
    navigate(-1);
  }, [dirty, navigate]);

  if (isLoading) {
    return <RunnerSkeleton />;
  }

  const title = detail?.title ?? `${caseType}/${caseId}`;
  const caseLabel = detail?.docname ?? caseId ?? "";

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Runner header */}
      <div className="flex items-center gap-3 border-b border-border-default px-6 py-3">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={handleExit}
        >
          Exit Runner
        </Button>

        <div className="h-4 w-px bg-border-default" aria-hidden />

        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "font-mono text-fg-muted",
            )}
          >
            {caseLabel}
          </span>
          <span className="text-fg-faint">&mdash;</span>
          <span
            className={cn(
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "text-fg-default truncate",
            )}
          >
            {title}
          </span>
        </div>
      </div>

      {/* Runner content */}
      <div className="flex-1 overflow-y-auto p-6">
        <GuidedRunner
          steps={steps}
          currentStep={currentStep}
          onStepComplete={handleStepComplete}
          onBack={handleBack}
          onSaveDraft={handleSaveDraft}
          onComplete={handleComplete}
          loading={actionMutation.isPending}
        />
      </div>

      {/* Exit confirmation dialog */}
      <ConfirmDialog
        open={exitDialogOpen}
        onOpenChange={setExitDialogOpen}
        title="Exit runner?"
        description="You have unsaved progress. Exiting now will lose any changes made since your last save."
        confirmLabel="Exit"
        confirmVariant="danger"
        onConfirm={() => navigate(-1)}
      />
    </div>
  );
}
