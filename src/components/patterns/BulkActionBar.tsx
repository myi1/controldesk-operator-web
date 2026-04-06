import { CheckCheck, UserPlus, Clock, Eye, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../primitives/Button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface BulkActionBarProps {
  selectedCount: number;
  /** True while a bulk mutation is in flight — disables action buttons. */
  isPending?: boolean;
  onAssign: () => void;
  onSnooze: () => void;
  onAcknowledge: () => void;
  onClear: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BulkActionBar({
  selectedCount,
  isPending = false,
  onAssign,
  onSnooze,
  onAcknowledge,
  onClear,
}: BulkActionBarProps) {
  if (selectedCount <= 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 z-[var(--z-raised)]",
        "-translate-x-1/2",
        "flex items-center gap-3",
        "rounded-[var(--radius-xl)] border border-border-default",
        "bg-bg-surface-raised px-4 py-2.5 shadow-lg",
        // Slide-up animation
        "animate-in fade-in-0 slide-in-from-bottom-4",
      )}
    >
      {/* Selection count */}
      <div className="flex items-center gap-1.5 text-[length:var(--text-small-size)] font-medium text-fg-default">
        <CheckCheck size={16} className="text-accent-primary" />
        <span className="tabular-nums">{selectedCount}</span>
        <span className="text-fg-muted">selected</span>
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-border-default" />

      {/* Action buttons — disabled while a mutation is in flight */}
      <Button
        variant="ghost"
        size="sm"
        icon={UserPlus}
        onClick={onAssign}
        disabled={isPending}
        loading={isPending}
      >
        Assign
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon={Clock}
        onClick={onSnooze}
        disabled={isPending}
      >
        Snooze
      </Button>
      <Button
        variant="ghost"
        size="sm"
        icon={Eye}
        onClick={onAcknowledge}
        disabled={isPending}
      >
        Acknowledge
      </Button>

      {/* Divider */}
      <div className="h-5 w-px bg-border-default" />

      {/* Clear — always enabled so user can deselect even during mutation */}
      <Button variant="ghost" size="sm" icon={X} onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}
