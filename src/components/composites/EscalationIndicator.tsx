import { AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "../../lib/cn";
import type { EscalationState } from "../../types/enums";
import { Badge } from "../primitives/Badge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface EscalationIndicatorProps {
  state: EscalationState;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EscalationIndicator({ state, className }: EscalationIndicatorProps) {
  if (state === "normal") {
    return null;
  }

  if (state === "blocked") {
    return (
      <Badge variant="warning" size="sm" className={cn("gap-1", className)}>
        <AlertTriangle size={12} aria-hidden="true" />
        Blocked
      </Badge>
    );
  }

  return (
    <Badge variant="danger" size="sm" className={cn("gap-1", className)}>
      <AlertCircle size={12} aria-hidden="true" />
      Escalated
    </Badge>
  );
}
