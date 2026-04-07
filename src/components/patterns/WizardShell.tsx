// ---------------------------------------------------------------------------
// WizardShell — reusable multi-step wizard modal
//
// Provides: modal overlay, step indicator, scrollable content area,
// sticky footer navigation, and cancel-confirmation when dirty.
// The parent drives all state: currentStep, validation, form data.
// ---------------------------------------------------------------------------

import { useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Check, ChevronLeft, AlertCircle } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../primitives/Button";
import { ConfirmDialog } from "../composites/ConfirmDialog";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface WizardStep {
  label: string;
}

export interface WizardShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  steps: WizardStep[];
  /** 0-indexed current step, controlled by parent */
  currentStep: number;
  /** Called when user clicks Next — parent handles validation first */
  onNext: () => void;
  onBack: () => void;
  /** Called when user clicks Submit on the final step */
  onSubmit: () => void;
  /** Disables the Next/Submit button when false */
  canAdvance?: boolean;
  isSubmitting?: boolean;
  submitError?: string | null;
  /** When true, closing shows a discard-changes confirmation */
  isDirty?: boolean;
  children: ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Step indicator                                                      */
/* ------------------------------------------------------------------ */

function StepIndicator({
  steps,
  currentStep,
}: {
  steps: WizardStep[];
  currentStep: number;
}) {
  return (
    <div className="flex items-center gap-0 px-6 py-4 border-b border-border-default">
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        const isLast = i === steps.length - 1;

        return (
          <div key={i} className="flex flex-1 items-center">
            {/* Circle */}
            <div className="flex shrink-0 flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[length:var(--text-caption-size)] font-semibold transition-colors",
                  isDone && "bg-accent-primary text-fg-on-emphasis",
                  isActive && "bg-accent-primary text-fg-on-emphasis ring-2 ring-accent-primary/30",
                  !isDone && !isActive && "border-2 border-border-default bg-bg-surface text-fg-faint",
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {isDone ? (
                  <Check size={13} strokeWidth={3} aria-hidden="true" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "whitespace-nowrap text-[10px] leading-none",
                  isActive ? "font-medium text-fg-default" : "text-fg-faint",
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {!isLast && (
              <div
                className={cn(
                  "mx-1 mb-4 h-px flex-1 transition-colors",
                  isDone ? "bg-accent-primary" : "bg-border-default",
                )}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function WizardShell({
  open,
  onOpenChange,
  title,
  steps,
  currentStep,
  onNext,
  onBack,
  onSubmit,
  canAdvance = true,
  isSubmitting = false,
  submitError,
  isDirty = false,
  children,
}: WizardShellProps) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const isLastStep = currentStep === steps.length - 1;

  const requestClose = () => {
    if (isDirty) {
      setConfirmCancel(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      requestClose();
    } else {
      onOpenChange(true);
    }
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          {/* Overlay */}
          <Dialog.Overlay
            className={cn(
              "fixed inset-0 z-50 bg-black/50",
              "animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
              "duration-[var(--duration-fast)]",
            )}
          />

          {/* Dialog */}
          <Dialog.Content
            onInteractOutside={(e) => {
              // Prevent accidental close by clicking overlay — require explicit cancel
              e.preventDefault();
            }}
            onEscapeKeyDown={(e) => {
              e.preventDefault();
              requestClose();
            }}
            className={cn(
              "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
              "flex h-[90dvh] max-h-[640px] w-full max-w-lg flex-col",
              "rounded-[var(--radius-lg)] border border-border-default bg-bg-default shadow-xl",
              "animate-in fade-in-0 zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              "duration-[var(--duration-normal)]",
              "focus:outline-none",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-border-default px-6 py-4">
              <Dialog.Title className="text-[length:var(--text-body-size)] font-semibold text-fg-default">
                {title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  onClick={requestClose}
                  className={cn(
                    "rounded-[var(--radius-md)] p-1.5 text-fg-muted",
                    "hover:bg-bg-muted hover:text-fg-default transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
                  )}
                  aria-label="Close wizard"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>

            {/* Step indicator */}
            <StepIndicator steps={steps} currentStep={currentStep} />

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <Dialog.Description className="sr-only">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.label}
              </Dialog.Description>
              {children}
            </div>

            {/* Error banner */}
            {submitError && (
              <div className={cn(
                "mx-6 mb-0 flex items-start gap-2 rounded-[var(--radius-md)]",
                "border border-status-danger/30 bg-status-danger-subtle px-3 py-2",
              )}>
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-status-danger" aria-hidden="true" />
                <p className="text-[length:var(--text-small-size)] text-status-danger">{submitError}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-border-default px-6 py-4">
              <button
                type="button"
                onClick={requestClose}
                className={cn(
                  "text-[length:var(--text-small-size)] text-fg-muted",
                  "hover:text-fg-default transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus rounded",
                )}
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={onBack}
                    disabled={isSubmitting}
                    icon={ChevronLeft}
                  >
                    Back
                  </Button>
                )}

                {isLastStep ? (
                  <Button
                    variant="primary"
                    size="md"
                    loading={isSubmitting}
                    disabled={!canAdvance || isSubmitting}
                    onClick={onSubmit}
                  >
                    Submit
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    disabled={!canAdvance}
                    onClick={onNext}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Cancel confirmation */}
      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Discard changes?"
        description="Your progress will be lost and cannot be recovered."
        confirmLabel="Discard"
        confirmVariant="danger"
        onConfirm={() => {
          setConfirmCancel(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
