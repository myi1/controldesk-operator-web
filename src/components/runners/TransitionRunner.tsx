// ---------------------------------------------------------------------------
// TransitionRunner — modal wizard shell for lifecycle advance runners
// ---------------------------------------------------------------------------

import { WizardShell } from "../patterns/WizardShell";
import { FieldRenderer } from "./FieldRenderer";
import { useTransitionRunner } from "../../hooks/use-transition-runner";
import { useRoleGate } from "../../hooks/use-role-gate";
import { useToast } from "../patterns/NotificationToast";
import type { RunnerConfig } from "../../types/runner";

interface TransitionRunnerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: RunnerConfig;
  recordId: string;
  onSuccess?: () => void;
}

export function TransitionRunner({
  open,
  onOpenChange,
  config,
  recordId,
  onSuccess,
}: TransitionRunnerProps) {
  const { toast } = useToast();
  const { activeRoles } = useRoleGate();

  const {
    currentStep,
    stepDef,
    canAdvance,
    isLastStep,
    goNext,
    goBack,
    values,
    errors,
    setFieldValue,
    isSubmitting,
    submitError,
    submit,
    isDirty,
    hasRequiredRole,
    resolveFieldOptions,
  } = useTransitionRunner({
    config,
    recordId,
    onSuccess: (message) => {
      toast({ title: "Success", description: message, variant: "success" });
      onSuccess?.();
    },
    onClose: () => onOpenChange(false),
  });

  // If the runner restricts to certain roles and none intersect with the user's
  // active roles, do not render at all (ISSUE-013). Checked after all hooks.
  if (
    config.allowedRoles.length > 0 &&
    !config.allowedRoles.some((r) => activeRoles.includes(r))
  ) {
    return null;
  }

  const wizardSteps = config.steps.map((s) => ({ label: s.label }));

  return (
    <WizardShell
      open={open}
      onOpenChange={onOpenChange}
      title={config.title}
      steps={wizardSteps}
      currentStep={currentStep}
      onNext={goNext}
      onBack={goBack}
      onSubmit={() => void submit()}
      canAdvance={canAdvance}
      isSubmitting={isSubmitting}
      submitError={submitError}
      isDirty={isDirty}
    >
      {/* Step description */}
      {stepDef && (
        <div className="mb-5">
          <p className="text-[length:var(--text-small-size)] text-fg-muted">
            {stepDef.description}
          </p>
        </div>
      )}

      {/* Role gate message */}
      {!hasRequiredRole && (
        <p className="mb-4 text-[length:var(--text-small-size)] text-status-danger">
          You do not have the required role to perform this action. Required:{" "}
          {config.allowedRoles.join(", ")}.
        </p>
      )}

      {/* Fields */}
      {stepDef && (
        <div className="flex flex-col gap-4">
          {stepDef.fields.map((field) => (
            <FieldRenderer
              key={field.key}
              field={field}
              value={values[field.key] ?? (field.type === "checklist" ? [] : "")}
              onChange={(val) => setFieldValue(field.key, val)}
              error={errors[field.key]}
              optionsOverride={
                field.type === "select" || field.type === "checklist"
                  ? resolveFieldOptions(field)
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Last-step confirmation hint */}
      {isLastStep && stepDef && stepDef.fields.length === 0 && (
        <p className="text-[length:var(--text-small-size)] text-fg-muted">
          Review the details above and click Submit to proceed.
        </p>
      )}
    </WizardShell>
  );
}
