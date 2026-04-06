import { type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../primitives/Button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant: "primary" | "danger";
  onConfirm: () => void;
  loading?: boolean;
  children?: ReactNode;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmVariant,
  onConfirm,
  loading = false,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-[rgba(0,0,0,0.48)]",
            "animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            "duration-[var(--duration-fast)]",
          )}
        />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-md",
            "bg-bg-default border border-border-default",
            "rounded-[var(--radius-lg)]",
            "shadow-lg",
            "p-6",
            "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "duration-[var(--duration-fast)]",
            "focus:outline-none",
          )}
        >
          {/* Close button */}
          <Dialog.Close asChild>
            <Button
              variant="icon"
              size="sm"
              className="absolute right-3 top-3"
              aria-label="Close"
            >
              <X size={16} aria-hidden="true" />
            </Button>
          </Dialog.Close>

          {/* Title */}
          <Dialog.Title
            className={cn(
              "text-[length:var(--text-body-size)] leading-[var(--text-body-leading)]",
              "font-[number:var(--text-body-medium-weight)]",
              "text-fg-default",
              "pr-8",
            )}
          >
            {title}
          </Dialog.Title>

          {/* Description */}
          <Dialog.Description
            className={cn(
              "mt-2",
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "text-fg-muted",
            )}
          >
            {description}
          </Dialog.Description>

          {/* Optional body content */}
          {children && <div className="mt-4">{children}</div>}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="secondary" size="md" disabled={loading}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              variant={confirmVariant}
              size="md"
              loading={loading}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
