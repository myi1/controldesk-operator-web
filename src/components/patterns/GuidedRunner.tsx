// ---------------------------------------------------------------------------
// GuidedRunner — step-by-step task runner for procedural work
// ---------------------------------------------------------------------------

import { useState, useCallback, useMemo } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Save,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../primitives/Button";
import { Checkbox } from "../primitives/Checkbox";
import { Select } from "../primitives/Select";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type StepType =
  | "checklist"
  | "gate"
  | "evidence"
  | "decision"
  | "review"
  | "completion";

export interface RunnerStep {
  key: string;
  title: string;
  description: string;
  type: StepType;
}

export interface GuidedRunnerProps {
  steps: RunnerStep[];
  currentStep: number;
  onStepComplete: (stepKey: string, data: Record<string, unknown>) => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onComplete: () => void;
  loading?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Step indicator                                                     */
/* ------------------------------------------------------------------ */

interface StepDotProps {
  index: number;
  label: string;
  state: "completed" | "current" | "future";
}

function StepDot({ index, label, state }: StepDotProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "flex items-center justify-center rounded-full transition-all duration-[var(--duration-fast)]",
          state === "completed" &&
            "h-7 w-7 bg-status-success text-fg-on-emphasis",
          state === "current" &&
            "h-8 w-8 bg-accent-primary text-fg-on-emphasis ring-4 ring-accent-primary-subtle",
          state === "future" &&
            "h-7 w-7 border-2 border-border-emphasis bg-bg-surface",
        )}
        aria-current={state === "current" ? "step" : undefined}
      >
        {state === "completed" ? (
          <Check size={14} strokeWidth={3} aria-hidden />
        ) : (
          <span
            className={cn(
              "text-[length:var(--text-caption-size)] font-[number:var(--text-body-medium-weight)]",
              state === "future" && "text-fg-muted",
            )}
          >
            {index + 1}
          </span>
        )}
      </div>
      <span
        className={cn(
          "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)] max-w-[80px] text-center truncate",
          state === "current"
            ? "text-fg-default font-[number:var(--text-body-medium-weight)]"
            : "text-fg-muted",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function StepIndicator({
  steps,
  currentStep,
}: {
  steps: RunnerStep[];
  currentStep: number;
}) {
  return (
    <div className="flex items-start justify-center gap-0 overflow-x-auto px-4 py-4">
      {steps.map((step, i) => {
        const state: StepDotProps["state"] =
          i < currentStep ? "completed" : i === currentStep ? "current" : "future";

        return (
          <div key={step.key} className="flex items-start">
            <StepDot index={i} label={step.title} state={state} />
            {i < steps.length - 1 && (
              <div className="flex items-center pt-3.5 px-1">
                <div
                  className={cn(
                    "h-0.5 w-8 sm:w-12 md:w-16",
                    i < currentStep ? "bg-status-success" : "bg-border-default",
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step content renderers (module-scope)                              */
/* ------------------------------------------------------------------ */

function ChecklistContent({
  stepData,
  onDataChange,
}: {
  stepData: Record<string, unknown>;
  onDataChange: (data: Record<string, unknown>) => void;
}) {
  const items = useMemo(
    () => [
      "Verify all required fields are filled",
      "Review attached documentation",
      "Confirm contact information is correct",
      "Check all dates and deadlines",
    ],
    [],
  );

  const checkedItems = (stepData.checkedItems as boolean[]) ?? items.map(() => false);

  const handleToggle = useCallback(
    (index: number, checked: boolean | "indeterminate") => {
      const next = [...checkedItems];
      next[index] = checked === true;
      onDataChange({ checkedItems: next });
    },
    [checkedItems, onDataChange],
  );

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <Checkbox
          key={i}
          label={item}
          checked={checkedItems[i] ?? false}
          onCheckedChange={(checked) => handleToggle(i, checked)}
        />
      ))}
    </div>
  );
}

function GateContent({
  stepData,
  onDataChange,
}: {
  stepData: Record<string, unknown>;
  onDataChange: (data: Record<string, unknown>) => void;
}) {
  const confirmed = (stepData.confirmed as boolean) ?? false;

  return (
    <div className="rounded-[var(--radius-lg)] border border-border-default bg-bg-surface-inset p-4">
      <Checkbox
        label="I confirm this precondition is met"
        checked={confirmed}
        onCheckedChange={(checked) =>
          onDataChange({ confirmed: checked === true })
        }
      />
    </div>
  );
}

function EvidenceContent({
  stepData,
  onDataChange,
}: {
  stepData: Record<string, unknown>;
  onDataChange: (data: Record<string, unknown>) => void;
}) {
  const notes = (stepData.notes as string) ?? "";

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)]",
          "border-2 border-dashed border-border-emphasis bg-bg-surface-inset",
          "py-10 px-4 text-center",
        )}
      >
        <Upload size={32} className="text-fg-faint" aria-hidden />
        <p className="text-[length:var(--text-small-size)] text-fg-muted">
          Drag files here or click to upload
        </p>
        <p className="text-[length:var(--text-caption-size)] text-fg-faint">
          PDF, images, or documents up to 10 MB
        </p>
      </div>

      <div>
        <label
          htmlFor="evidence-notes"
          className="text-[length:var(--text-small-size)] font-medium text-fg-default block mb-1"
        >
          Notes
        </label>
        <textarea
          id="evidence-notes"
          value={notes}
          onChange={(e) => onDataChange({ ...stepData, notes: e.target.value })}
          rows={3}
          placeholder="Add any notes about the evidence..."
          className={cn(
            "w-full rounded-[var(--radius-md)] border border-border-default bg-bg-surface px-3 py-2",
            "text-[length:var(--text-small-size)] text-fg-default placeholder:text-fg-faint",
            "outline-none resize-none",
            "focus-visible:border-[var(--ring-focus)] focus-visible:shadow-[var(--shadow-focus)]",
            "transition-[border-color,box-shadow] duration-[var(--duration-fast)]",
          )}
        />
      </div>
    </div>
  );
}

function DecisionContent({
  stepData,
  onDataChange,
}: {
  stepData: Record<string, unknown>;
  onDataChange: (data: Record<string, unknown>) => void;
}) {
  const decision = (stepData.decision as string) ?? "";
  const notes = (stepData.notes as string) ?? "";

  return (
    <div className="space-y-4">
      <Select
        label="Decision"
        placeholder="Select a decision..."
        options={[
          { value: "approve", label: "Approve" },
          { value: "reject", label: "Reject" },
          { value: "defer", label: "Defer" },
          { value: "escalate", label: "Escalate" },
        ]}
        value={decision}
        onValueChange={(value) => onDataChange({ ...stepData, decision: value })}
      />

      <div>
        <label
          htmlFor="decision-notes"
          className="text-[length:var(--text-small-size)] font-medium text-fg-default block mb-1"
        >
          Notes
        </label>
        <textarea
          id="decision-notes"
          value={notes}
          onChange={(e) => onDataChange({ ...stepData, notes: e.target.value })}
          rows={3}
          placeholder="Explain the reasoning for this decision..."
          className={cn(
            "w-full rounded-[var(--radius-md)] border border-border-default bg-bg-surface px-3 py-2",
            "text-[length:var(--text-small-size)] text-fg-default placeholder:text-fg-faint",
            "outline-none resize-none",
            "focus-visible:border-[var(--ring-focus)] focus-visible:shadow-[var(--shadow-focus)]",
            "transition-[border-color,box-shadow] duration-[var(--duration-fast)]",
          )}
        />
      </div>
    </div>
  );
}

function ReviewContent({
  allStepData,
  steps,
}: {
  allStepData: Record<string, Record<string, unknown>>;
  steps: RunnerStep[];
}) {
  return (
    <div className="space-y-3">
      {steps.map((step) => {
        const data = allStepData[step.key];
        if (!data || Object.keys(data).length === 0) return null;

        return (
          <div
            key={step.key}
            className="rounded-[var(--radius-lg)] border border-border-default bg-bg-default p-4"
          >
            <h4
              className={cn(
                "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
                "font-[number:var(--text-body-medium-weight)] text-fg-default mb-2",
              )}
            >
              {step.title}
            </h4>
            <dl className="space-y-1">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4">
                  <dt className="text-[length:var(--text-caption-size)] text-fg-muted capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </dt>
                  <dd className="text-[length:var(--text-caption-size)] text-fg-default text-right">
                    {typeof value === "boolean"
                      ? value
                        ? "Yes"
                        : "No"
                      : Array.isArray(value)
                        ? value.filter(Boolean).length + " completed"
                        : String(value || "\u2014")}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        );
      })}
    </div>
  );
}

function CompletionContent() {
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-status-success-subtle">
        <CheckCircle2 size={32} className="text-status-success" aria-hidden />
      </div>
      <div>
        <h3
          className={cn(
            "text-[length:var(--text-heading-md-size)] leading-[var(--text-heading-md-leading)]",
            "font-semibold text-fg-default",
          )}
        >
          Ready to Complete
        </h3>
        <p className="mt-1 text-[length:var(--text-body-size)] text-fg-muted">
          All steps have been reviewed. Click Complete to finalize this workflow.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function GuidedRunner({
  steps,
  currentStep,
  onStepComplete,
  onBack,
  onSaveDraft,
  onComplete,
  loading = false,
}: GuidedRunnerProps) {
  const [allStepData, setAllStepData] = useState<
    Record<string, Record<string, unknown>>
  >({});

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const stepData = useMemo(
    () => allStepData[step?.key] ?? {},
    [allStepData, step?.key],
  );

  const handleDataChange = useCallback(
    (data: Record<string, unknown>) => {
      if (!step) return;
      setAllStepData((prev) => ({
        ...prev,
        [step.key]: data,
      }));
    },
    [step],
  );

  const isStepValid = useMemo(() => {
    if (!step) return false;

    switch (step.type) {
      case "checklist": {
        const checked = (stepData.checkedItems as boolean[]) ?? [];
        return checked.length > 0 && checked.every(Boolean);
      }
      case "gate":
        return (stepData.confirmed as boolean) === true;
      case "evidence":
        return true; // Evidence is optional
      case "decision":
        return !!(stepData.decision as string);
      case "review":
        return true; // Review is always valid
      case "completion":
        return true;
      default:
        return true;
    }
  }, [step, stepData]);

  const handleNext = useCallback(() => {
    if (!step) return;

    if (isLast) {
      onComplete();
      return;
    }

    onStepComplete(step.key, stepData);
  }, [step, isLast, onComplete, onStepComplete, stepData]);

  if (!step) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="rounded-[var(--radius-lg)] border border-border-default bg-bg-default">
        <StepIndicator steps={steps} currentStep={currentStep} />
      </div>

      {/* Step content */}
      <div className="mx-auto w-full max-w-[720px]">
        <div className="rounded-[var(--radius-lg)] border border-border-default bg-bg-default p-6">
          {/* Step header */}
          <div className="mb-6">
            <p className="text-[length:var(--text-caption-size)] text-fg-muted">
              Step {currentStep + 1} of {steps.length}
            </p>
            <h2
              className={cn(
                "mt-1 text-[length:var(--text-heading-md-size)] leading-[var(--text-heading-md-leading)]",
                "font-semibold text-fg-default",
              )}
            >
              {step.title}
            </h2>
            <p className="mt-1 text-[length:var(--text-body-size)] text-fg-muted">
              {step.description}
            </p>
          </div>

          {/* Dynamic content */}
          {step.type === "checklist" && (
            <ChecklistContent
              stepData={stepData}
              onDataChange={handleDataChange}
            />
          )}
          {step.type === "gate" && (
            <GateContent
              stepData={stepData}
              onDataChange={handleDataChange}
            />
          )}
          {step.type === "evidence" && (
            <EvidenceContent
              stepData={stepData}
              onDataChange={handleDataChange}
            />
          )}
          {step.type === "decision" && (
            <DecisionContent
              stepData={stepData}
              onDataChange={handleDataChange}
            />
          )}
          {step.type === "review" && (
            <ReviewContent allStepData={allStepData} steps={steps} />
          )}
          {step.type === "completion" && <CompletionContent />}
        </div>
      </div>

      {/* Navigation */}
      <div className="mx-auto flex w-full max-w-[720px] items-center justify-between">
        <Button
          variant="ghost"
          icon={ChevronLeft}
          onClick={onBack}
          disabled={isFirst || loading}
        >
          Back
        </Button>

        <Button
          variant="secondary"
          icon={Save}
          onClick={onSaveDraft}
          disabled={loading}
        >
          Save Draft
        </Button>

        <Button
          variant="primary"
          icon={isLast ? CheckCircle2 : ChevronRight}
          onClick={handleNext}
          disabled={!isStepValid || loading}
          loading={loading}
        >
          {isLast ? "Complete" : "Next Step"}
        </Button>
      </div>
    </div>
  );
}

GuidedRunner.displayName = "GuidedRunner";
