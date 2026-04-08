// ---------------------------------------------------------------------------
// ConfirmDestructiveDialog — reusable confirmation modal for destructive actions
//
// Extends the base ConfirmDialog pattern with:
//   - Blocker list (pre-conditions that must be resolved)
//   - Optional reason textarea (required for archive/delete)
//   - 409-style blocker display from backend response
//   - Cancel is default-focused (keyboard safety)
// ---------------------------------------------------------------------------

import { useState, useRef, useEffect, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, AlertTriangle, AlertCircle, ExternalLink } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../primitives/Button";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface DestructiveBlocker {
  label: string;
  /** Optional link to resolve the blocker (e.g. open queue case) */
  linkTo?: string;
  linkLabel?: string;
}

export interface ConfirmDestructiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** Pre-condition warnings shown before the user can confirm */
  blockers?: DestructiveBlocker[];
  /** If true, blockers fully prevent submission */
  blockersPreventSubmit?: boolean;
  /** If true, shows a required reason textarea */
  reasonRequired?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  confirmLabel?: string;
  /** Called with the reason string (empty string if reasonRequired=false) */
  onConfirm: (reason: string) => void;
  isSubmitting?: boolean;
  error?: string | null;
  children?: ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function ConfirmDestructiveDialog({
  open,
  onOpenChange,
  title,
  description,
  blockers = [],
  blockersPreventSubmit = false,
  reasonRequired = false,
  reasonLabel = "Reason",
  reasonPlaceholder = "Explain why…",
  confirmLabel = "Confirm",
  onConfirm,
  isSubmitting = false,
  error,
  children,
}: ConfirmDestructiveDialogProps) {
  const [reason, setReason] = useState("");
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button when dialog opens; reset reason when it closes.
  // Reason reset is deferred via setTimeout to avoid a synchronous
  // setState-in-effect that would cause cascading renders.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => cancelRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setReason(""), 0);
    return () => clearTimeout(t);
  }, [open]);

  const hasBlockers = blockers.length > 0;
  const canSubmit =
    !isSubmitting &&
    !(blockersPreventSubmit && hasBlockers) &&
    (!reasonRequired || reason.trim().length >= 3);

  const handleConfirm = () => {
    if (canSubmit) onConfirm(reason.trim());
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/50",
            "animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            "duration-[var(--duration-fast)]",
          )}
        />

        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-md",
            "rounded-[var(--radius-lg)] border border-border-default bg-bg-default shadow-xl",
            "p-6",
            "animate-in fade-in-0 zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "duration-[var(--duration-fast)]",
            "focus:outline-none",
          )}
        >
          {/* Close button */}
          <Dialog.Close asChild>
            <button
              type="button"
              className={cn(
                "absolute right-3 top-3 rounded-[var(--radius-md)] p-1.5 text-fg-muted",
                "hover:bg-bg-muted hover:text-fg-default transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
              )}
              aria-label="Close"
              disabled={isSubmitting}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </Dialog.Close>

          {/* Icon + title */}
          <div className="flex items-start gap-3 pr-8">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-status-danger-subtle">
              <AlertTriangle size={16} className="text-status-danger" aria-hidden="true" />
            </div>
            <div>
              <Dialog.Title className="text-[length:var(--text-body-size)] font-semibold text-fg-default">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-[length:var(--text-small-size)] text-fg-muted">
                {description}
              </Dialog.Description>
            </div>
          </div>

          {/* Blockers */}
          {hasBlockers && (
            <div className={cn(
              "mt-4 rounded-[var(--radius-md)] border px-4 py-3",
              blockersPreventSubmit
                ? "border-status-danger/30 bg-status-danger-subtle"
                : "border-status-warning/30 bg-status-warning-subtle",
            )}>
              <p className={cn(
                "mb-2 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider",
                blockersPreventSubmit ? "text-status-danger" : "text-status-warning",
              )}>
                {blockersPreventSubmit ? "Must resolve before continuing" : "Warnings"}
              </p>
              <ul className="space-y-1.5">
                {blockers.map((b, i) => (
                  <li key={i} className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5">
                      <span className={cn(
                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                        blockersPreventSubmit ? "bg-status-danger" : "bg-status-warning",
                      )} aria-hidden="true" />
                      <span className="text-[length:var(--text-small-size)] text-fg-default">
                        {b.label}
                      </span>
                    </div>
                    {b.linkTo && (
                      <a
                        href={b.linkTo}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1 text-[length:var(--text-caption-size)]",
                          "text-fg-accent hover:underline",
                        )}
                      >
                        {b.linkLabel ?? "Resolve"}
                        <ExternalLink size={11} aria-hidden="true" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Optional extra content */}
          {children && <div className="mt-4">{children}</div>}

          {/* Reason textarea */}
          {reasonRequired && (
            <div className="mt-4 flex flex-col gap-1">
              <label className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                {reasonLabel}
                <span className="ml-1 text-status-danger" aria-hidden="true">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={reasonPlaceholder}
                rows={3}
                className={cn(
                  "w-full resize-none rounded-[var(--radius-md)] border border-border-default bg-bg-surface",
                  "px-3 py-2 text-[length:var(--text-small-size)] text-fg-default placeholder:text-fg-faint",
                  "outline-none transition-[border-color] duration-[var(--duration-fast)]",
                  "focus:border-border-focus focus:outline-2 focus:outline-offset-2 focus:outline-border-focus",
                )}
              />
              {reasonRequired && reason.trim().length > 0 && reason.trim().length < 3 && (
                <p className="text-[length:var(--text-caption-size)] text-status-danger">
                  Please provide a more detailed reason.
                </p>
              )}
            </div>
          )}

          {/* API error */}
          {error && (
            <div className={cn(
              "mt-4 flex items-start gap-2 rounded-[var(--radius-md)]",
              "border border-status-danger/30 bg-status-danger-subtle px-3 py-2",
            )}>
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-status-danger" aria-hidden="true" />
              <p className="text-[length:var(--text-small-size)] text-status-danger">{error}</p>
            </div>
          )}

          {/* Actions — Cancel is left/default, Confirm is right/danger */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <Dialog.Close asChild>
              <button
                ref={cancelRef}
                type="button"
                disabled={isSubmitting}
                className={cn(
                  "rounded-[var(--radius-md)] border border-border-default bg-bg-surface px-4 py-2",
                  "text-[length:var(--text-small-size)] font-medium text-fg-default",
                  "hover:bg-bg-muted transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
                  "disabled:opacity-50 disabled:pointer-events-none",
                )}
              >
                Cancel
              </button>
            </Dialog.Close>

            <Button
              variant="danger"
              size="md"
              loading={isSubmitting}
              disabled={!canSubmit}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
