import { AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "../../lib/cn";
import type { EscalationState } from "../../types/enums";

export interface EscalationIndicatorProps {
  state: EscalationState;
  className?: string;
}

const baseClass =
  "inline-flex items-center gap-0.5 text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]";

export function EscalationIndicator({ state, className }: EscalationIndicatorProps) {
  if (state === "normal") return null;

  if (state === "blocked") {
    return (
      <span className={cn(baseClass, "text-status-warning", className)} aria-label="Blocked">
        <AlertTriangle size={12} aria-hidden="true" />
        Blocked
      </span>
    );
  }

  if (state === "escalated") {
    return (
      <span className={cn(baseClass, "text-status-danger", className)} aria-label="Escalated">
        <AlertCircle size={12} aria-hidden="true" />
        Escalated
      </span>
    );
  }

  // Unknown escalation state — muted text fallback
  return (
    <span className={cn(baseClass, "text-fg-muted", className)}>
      <AlertCircle size={12} aria-hidden="true" />
      {state}
    </span>
  );
}
